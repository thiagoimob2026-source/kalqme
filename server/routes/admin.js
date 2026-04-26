const express = require('express');
const router = express.Router();
const { User } = require('../models');

const authenticateToken = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
};

router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'companyName', 'isPaid', 'isAdmin', 'paidUntil', 'subscriptionPlan', 'createdAt']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/users/:id/toggle-payment', authenticateToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.isPaid = !user.isPaid;

        if (user.isPaid) {
            // Set 1 year validity from today
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            user.paidUntil = nextYear;
        } else {
            user.paidUntil = null;
        }

        await user.save();

        res.json({ message: 'Status updated', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/users/:id/update-plan', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { plan } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.subscriptionPlan = plan;
        await user.save();

        res.json({ message: 'Plano atualizado', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
