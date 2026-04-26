const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { Transaction, Customer, sequelize } = require('../models');
const authenticateToken = require('../middleware/auth');
const { GamificationService } = require('../services/gamificationService');

const upload = multer({ dest: 'uploads/' });

const { Op } = require('sequelize');

// ...

// Fetch Transactions
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { month, year } = req.query;
        let whereClause = { userId: req.user.id };
        let dateFilterActive = false;
        let selectedDateStart = null;

        if (month && year) {
            const formattedMonth = month.toString().padStart(2, '0');
            whereClause.releaseDate = {
                [Op.like]: `${year}-${formattedMonth}-%`
            };
            dateFilterActive = true;
            selectedDateStart = new Date(year, month - 1, 1);
        }

        console.log('Fetching transactions with where:', whereClause);
        console.log('QueryParams:', req.query);

        // 1. Get transactions for the CURRENT view (filtered or not)
        const currentTransactions = await Transaction.findAll({
            where: whereClause,
            include: [{ model: Customer, attributes: ['id', 'name', 'cpf'] }],
            order: [['releaseDate', 'ASC']] // Order by date
        });

        // 2. Calculate Initial Balance
        let initialBalance = 0;

        if (dateFilterActive) {
            // Fetch ALL transactions for this user to calculate running balance up to the start of the month
            const allTransactions = await Transaction.findAll({
                where: { userId: req.user.id }
            });

            const parseDate = (dateStr) => {
                const [y, m, d] = dateStr.split('-');
                return new Date(y, m - 1, d);
            };

            // Sum all valid amounts BEFORE the selected month
            allTransactions.forEach(t => {
                const tDate = parseDate(t.releaseDate);
                if (tDate < selectedDateStart) {
                    initialBalance += parseFloat(t.amount);
                }
            });
        }
        // If not filtering by date, initialBalance starts at 0 (or could be global initial from a settings table)

        let credits = 0;
        let debits = 0;

        currentTransactions.forEach(t => {
            const val = parseFloat(t.amount);
            if (val > 0) credits += val;
            else debits += val;
        });

        const finalBalance = initialBalance + credits + debits;

        const summary = {
            INITIAL_BALANCE: initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            CREDITS: credits.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            DEBITS: debits.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            FINAL_BALANCE: finalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        };

        const formattedTransactions = currentTransactions.map(t => ({
            id: t.id,
            RELEASE_DATE: t.releaseDate,
            TRANSACTION_TYPE: t.transactionType,
            REFERENCE_ID: t.referenceId,
            TRANSACTION_NET_AMOUNT: parseFloat(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
            accountName: t.accountName || 'Conta Padrão', // New Field
            uploadBatchId: t.uploadBatchId, // New Field
            Customer: t.Customer, // Add this
            classification: t.classificationType ? {
                type: t.classificationType,
                category: t.category,
                subCategory: t.subCategory,
                isDeductible: t.isDeductible,
                customerId: t.customerId // also add this for clarity
            } : null
        }));

        res.json({ summary, transactions: formattedTransactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload CSV
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { accountName } = req.body; // Get account name from request body
        if (!accountName) {
            return res.status(400).json({ error: 'Account Name is required' });
        }

        const filePath = req.file.path;
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n').map(line => line.trim()).filter(line => line);

        console.log(`Processing file: ${req.file.originalname}, ${lines.length} lines for account: ${accountName}`);

        let transactionStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].toUpperCase().includes('RELEASE_DATE')) {
                transactionStartIndex = i;
                break;
            }
        }

        if (transactionStartIndex !== -1) {
            // Detect delimiter
            const headerLine = lines[transactionStartIndex];
            const delimiter = headerLine.includes(';') ? ';' : ',';
            const headers = headerLine.split(delimiter).map(h => h.trim());

            const transactionsToCreate = [];
            const uploadBatchId = `BATCH_${Date.now()}`;
            let duplicatesCount = 0;

            for (let i = transactionStartIndex + 1; i < lines.length; i++) {
                const values = lines[i].split(delimiter);
                if (values.length >= headers.length) {
                    const txData = {};
                    headers.forEach((header, index) => {
                        txData[header] = values[index] ? values[index].trim() : '';
                    });

                    const amountStr = txData['TRANSACTION_NET_AMOUNT'];
                    if (amountStr && typeof amountStr === 'string' && amountStr.trim() !== '') {
                        const amount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
                        // Normalize Date (DD-MM-YYYY -> YYYY-MM-DD)
                        const rawDate = txData['RELEASE_DATE'];
                        let normalizedDate = rawDate;
                        if (rawDate && rawDate.includes('-')) {
                            const parts = rawDate.split('-');
                            if (parts.length === 3) {
                                // If DD-MM-YYYY, convert to YYYY-MM-DD
                                if (parts[0].length === 2 && parts[2].length === 4) {
                                    normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                                }
                            }
                        }
                        
                        const referenceId = txData['REFERENCE_ID'];

                        // DUPLICATE CHECK: Check if exists in DB
                        const existing = await Transaction.findOne({
                            where: {
                                userId: req.user.id,
                                referenceId: referenceId,
                                amount: amount,
                                releaseDate: normalizedDate,
                                accountName: accountName
                            }
                        });

                        if (existing) {
                            duplicatesCount++;
                            continue; // SKIP Duplicate
                        }

                        transactionsToCreate.push({
                            userId: req.user.id,
                            releaseDate: normalizedDate,
                            transactionType: txData['TRANSACTION_TYPE'],
                            referenceId: referenceId,
                            amount: amount,
                            accountName: accountName,
                            uploadBatchId: uploadBatchId
                        });
                    }
                }
            }

            if (transactionsToCreate.length > 0) {
                await Transaction.bulkCreate(transactionsToCreate);
                console.log(`Inserted ${transactionsToCreate.length} transactions. Ignored ${duplicatesCount} duplicates.`);

                // 🎮 GAMIFICATION: Award points for each transaction
                for (let i = 0; i < transactionsToCreate.length; i++) {
                    await GamificationService.recordTransaction(req.user.id, false);
                }

                res.status(201).json({
                    message: `File processed successfully. Inserted: ${transactionsToCreate.length}, Duplicates skipped: ${duplicatesCount}`,
                    batchId: uploadBatchId
                });
            } else {
                console.log('No new valid transactions found to insert');
                res.status(200).json({ message: 'No new transactions found (all duplicates or empty).' });
            }
        } else {
            console.log('RELEASE_DATE header not found');
            res.status(400).json({ error: 'Invalid CSV format: RELEASE_DATE header not found' });
        }

        fs.unlinkSync(filePath);

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: `Erro no processamento: ${error.message}` });
    }
});

// Delete Transaction
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete transaction ${id} for user ${req.user.id}`);
        const deleted = await Transaction.destroy({
            where: { id: id, userId: req.user.id }
        });

        if (deleted) {
            console.log(`Transaction ${id} deleted`);
            res.status(204).send();
        } else {
            console.log(`Transaction ${id} not found or not owned by user`);
            res.status(404).json({ error: 'Transaction not found' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update Classification
router.post('/:id/classify', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { classification } = req.body;

        console.log(`Classifying transaction ${id} for user ${req.user.id}`, classification);

        const transaction = await Transaction.findOne({ where: { id: id, userId: req.user.id } });
        if (!transaction) {
            console.log('Transaction not found');
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Explicitly set fields
        transaction.classificationType = classification.type;
        transaction.category = classification.category || '';
        transaction.subCategory = classification.subCategory || '';
        transaction.isDeductible = classification.isDeductible === true; // Ensure boolean
        transaction.customerId = classification.customerId || null;

        await transaction.save();
        console.log('Transaction saved successfully');

        // 🎮 GAMIFICATION: Award points for categorizing
        await GamificationService.recordTransaction(req.user.id, true);

        res.json({ message: 'Classification updated', transaction });
    } catch (error) {
        console.error('Classification error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
