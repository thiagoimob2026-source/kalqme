const express = require('express');
const router = express.Router();
const { Category, Sequelize } = require('../models');
const authenticateToken = require('../middleware/auth');

// GET Categories
router.get('/', authenticateToken, async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { userId: null }, // System defaults
                    { userId: req.user.id } // User specific (req.user.id from token)
                ]
            },
            order: [['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// CREATE Custom Category
router.post('/', authenticateToken, async (req, res) => {
    try {
        console.log("Received values for NEW CATEGORY:", req.body);
        console.log("User ID:", req.user.id);

        const { name, type, isDeductible } = req.body;

        // Validation
        if (!name || !type) {
            return res.status(400).json({ error: 'Name and Type are required' });
        }

        const category = await Category.create({
            name,
            type,
            isDeductible,
            userId: req.user.id
        });
        console.log("Category created successfully:", category.id);
        res.status(201).json(category);
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ error: 'Failed to create category', details: error.message });
    }
});

console.log('Category routes module loaded');
module.exports = router;
