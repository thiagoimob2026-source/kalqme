const express = require('express');
const router = express.Router();
const { Transaction, Budget, Category, sequelize } = require('../models');
const authenticateToken = require('../middleware/auth');
const { Op } = require('sequelize');

// Get Budget Overview
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { month, year, averageMonths } = req.query;
        const userId = req.user.id;

        const selectedMonth = parseInt(month);
        const selectedYear = parseInt(year);
        const avgRange = parseInt(averageMonths) || 3;

        // 1. Get All system and user categories for type reference
        const allCategories = await Category.findAll({
            where: {
                [Op.or]: [{ userId: null }, { userId }]
            }
        });
        const categoryMeta = {};
        allCategories.forEach(c => {
            categoryMeta[c.name] = { type: c.type, isDeductible: c.isDeductible };
        });

        // 2. Get Actuals for "Mês Vigente"
        const currentTransactions = await Transaction.findAll({
            where: {
                userId,
                releaseDate: { [Op.like]: `%/${selectedMonth.toString().padStart(2, '0')}/${selectedYear}` }
            }
        });

        const actualsMap = {};
        currentTransactions.forEach(t => {
            const cat = t.category;
            if (cat) {
                const amount = parseFloat(t.amount);
                if (!actualsMap[cat]) {
                    actualsMap[cat] = {
                        amount: 0,
                        type: t.classificationType || (categoryMeta[cat]?.type) || 'Despesa'
                    };
                }
                actualsMap[cat].amount += Math.abs(amount);
            }
        });

        // 3. Calculate Averages
        const allUserTransactions = await Transaction.findAll({ where: { userId } });

        const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
        const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;

        const avgMap = {};
        const isWithinRange = (dateStr, refMonth, refYear, range) => {
            if (!dateStr) return false;
            const parts = dateStr.split('/');
            if (parts.length !== 3) return false;
            const [d, m, y] = parts.map(Number);
            const refDate = new Date(refYear, refMonth - 1, 1);
            const tDate = new Date(y, m - 1, 1);

            const diffMonths = (refDate.getFullYear() - tDate.getFullYear()) * 12 + (refDate.getMonth() - tDate.getMonth());
            return diffMonths >= 0 && diffMonths < range;
        };

        allUserTransactions.forEach(t => {
            if (isWithinRange(t.releaseDate, selectedMonth, selectedYear, avgRange)) {
                const cat = t.category;
                if (cat) {
                    if (!avgMap[cat]) avgMap[cat] = 0;
                    avgMap[cat] += Math.abs(parseFloat(t.amount));
                }
            }
        });

        Object.keys(avgMap).forEach(cat => {
            avgMap[cat] = avgMap[cat] / avgRange;
        });

        // 4. Get Manual Budgets
        const manualBudgets = await Budget.findAll({
            where: { userId, month: nextMonth, year: nextYear }
        });
        const manualMap = {};
        manualBudgets.forEach(b => {
            manualMap[b.categoryName] = {
                amount: parseFloat(b.amount),
                type: b.type,
                subType: b.subType
            };
        });

        // 5. Build Final Report
        const uniqueClassified = [...new Set([
            ...Object.keys(actualsMap),
            ...Object.keys(avgMap),
            ...Object.keys(manualMap)
        ])];

        const systemCatNames = allCategories.map(c => c.name);
        const finalCategoryList = [...new Set([...systemCatNames, ...uniqueClassified])];

        const report = finalCategoryList.map(cat => {
            const actual = actualsMap[cat]?.amount || 0;
            const forecast = avgMap[cat] || 0;
            const manual = manualMap[cat]?.amount || 0;

            // Determine Type: 1. Manual Entry preference, 2. Transaction instance, 3. Category Meta, 4. Default
            const type = manualMap[cat]?.type || actualsMap[cat]?.type || categoryMeta[cat]?.type || 'Despesa';
            const subType = manualMap[cat]?.subType || null;

            return {
                category: cat,
                type,
                subType,
                actualCurrent: actual,
                forecastAverage: forecast,
                manualBudget: manual,
                diff: manual - actual
            };
        });

        // Sort: items with values first, then alphabetical
        report.sort((a, b) => {
            const aHasValue = a.actualCurrent || a.forecastAverage || a.manualBudget;
            const bHasValue = b.actualCurrent || b.forecastAverage || b.manualBudget;
            if (aHasValue && !bHasValue) return -1;
            if (!aHasValue && bHasValue) return 1;
            return a.category.localeCompare(b.category);
        });

        res.json({
            month: selectedMonth,
            year: selectedYear,
            nextMonth,
            nextYear,
            data: report
        });

    } catch (error) {
        console.error('Budget error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update Manual Budget
router.post('/update', authenticateToken, async (req, res) => {
    try {
        const { categoryName, month, year, amount, type, subType } = req.body;
        const userId = req.user.id;

        const [budget, created] = await Budget.findOrCreate({
            where: { userId, categoryName, month, year },
            defaults: { amount, type, subType }
        });

        if (!created) {
            budget.amount = amount;
            if (type) budget.type = type;
            if (subType) budget.subType = subType;
            await budget.save();
        }

        res.json({ message: 'Orçamento atualizado', budget });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
