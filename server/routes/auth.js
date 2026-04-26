const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Register
router.post('/register', async (req, res) => {
    console.log('Register endpoint hit', req.body);
    try {
        const { name, email, password, companyName, taxType } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            companyName,
            taxType
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        if (await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign(
                { id: user.id, email: user.email, isPaid: user.isPaid, isAdmin: user.isAdmin },
                process.env.JWT_SECRET || 'YOUR_SECRET_KEY'
            );
            res.json({
                accessToken,
                user: {
                    id: user.id,
                    name: user.name,
                    companyName: user.companyName,
                    taxType: user.taxType,
                    isPaid: user.isPaid,
                    isAdmin: user.isAdmin,
                    paidUntil: user.paidUntil
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
