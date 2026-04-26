const express = require('express');
const router = express.Router();
const { Customer, Transaction } = require('../models');
const authenticateToken = require('../middleware/auth');
const { Op } = require('sequelize');

// List Customers
router.get('/', authenticateToken, async (req, res) => {
    try {
        const customers = await Customer.findAll({
            where: { userId: req.user.id },
            include: [{
                model: Transaction,
                attributes: ['releaseDate', 'amount'],
                separate: true,
                order: [['createdAt', 'DESC']]
            }]
        });

        // Calculate statistics for each customer
        const customersWithStats = customers.map(customer => {
            const txs = customer.Transactions || [];
            const lastTx = txs[0];

            // Recurrence logic: patient is "lost" if last transaction was > 4 months ago
            let isLost = false;
            let daysSinceLast = null;

            if (lastTx) {
                // Parse DD/MM/YYYY
                const [d, m, y] = lastTx.releaseDate.split('/');
                const lastDate = new Date(y, m - 1, d);
                const diffTime = Math.abs(new Date() - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                daysSinceLast = diffDays;
                if (diffDays > 120) isLost = true; // approx 4 months
            }

            return {
                ...customer.toJSON(),
                lastVisit: lastTx ? lastTx.releaseDate : null,
                isLost,
                daysSinceLast,
                totalTxs: txs.length
            };
        });

        res.json(customersWithStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Customer
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, cpf, email, phone, birthDate } = req.body;
        const customer = await Customer.create({
            name,
            cpf: cpf || null,
            email: email || null,
            phone: phone || null,
            birthDate: birthDate || null,
            userId: req.user.id
        });
        res.status(201).json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update Customer
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, cpf, email, phone, birthDate } = req.body;
        const customer = await Customer.findOne({ where: { id, userId: req.user.id } });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        await customer.update({ name, cpf, email, phone, birthDate });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Annual Report Data (Informe de Rendimentos)
router.get('/:id/annual-report', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { year } = req.query;
        const customer = await Customer.findOne({ where: { id, userId: req.user.id } });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const txs = await Transaction.findAll({
            where: {
                customerId: id,
                userId: req.user.id,
                releaseDate: { [Op.like]: `%/%/${year}` }
            },
            order: [['releaseDate', 'ASC']]
        });

        const total = txs.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

        res.json({
            customer,
            year,
            transactions: txs,
            total: total.toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
