require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize'); // Import Sequelize for Op
const { sequelize, Category, Customer } = require('./models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const budgetRoutes = require('./routes/budget');
const customerRoutes = require('./routes/customers');
const gamificationRoutes = require('./routes/gamification');
const aiAnalysisRoutes = require('./routes/aiAnalysis');

const app = express();
const PORT = process.env.PORT || 3005;

// 1. Middleware FIRST
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.ALLOWED_ORIGIN || ''].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, Postman)
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== 'production') return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// 2. Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// --- SEEDING DEFAULT CATEGORIES ---
const seedCategories = async () => {
    try {
        const count = await Category.count();
        if (count === 0) {
            console.log('Seeding default categories...');
            const defaults = [
                // RECEITAS
                { name: 'Receita de Vendas', type: 'Receita' },
                { name: 'Receita de Serviços', type: 'Receita' },
                { name: 'Rendimentos de Aplicações', type: 'Receita' },
                { name: 'Outras Receitas', type: 'Receita' },

                // DESPESAS - Deductible defaults (Autonomo) vs Non-Deductible
                { name: 'Aluguel', type: 'Despesa', isDeductible: true },
                { name: 'Condomínio', type: 'Despesa', isDeductible: true },
                { name: 'IPTU', type: 'Despesa', isDeductible: true },
                { name: 'Energia Elétrica', type: 'Despesa', isDeductible: true },
                { name: 'Água e Esgoto', type: 'Despesa', isDeductible: true },
                { name: 'Telefone e Internet', type: 'Despesa', isDeductible: true },
                { name: 'Salários e Encargos', type: 'Despesa', isDeductible: true },
                { name: 'Pró-Labore', type: 'Despesa', isDeductible: false },
                { name: 'Material de Escritório', type: 'Despesa', isDeductible: true },
                { name: 'Marketing e Publicidade', type: 'Despesa', isDeductible: true },
                { name: 'Contabilidade', type: 'Despesa', isDeductible: true },
                { name: 'Impostos e Taxas', type: 'Despesa', isDeductible: true }, // Often deductible as expenses for book cash flow
                { name: 'Manutenção', type: 'Despesa', isDeductible: true },
                { name: 'Despesas Bancárias', type: 'Despesa', isDeductible: true },
                { name: 'Alimentação', type: 'Despesa', isDeductible: false },
                { name: 'Transporte', type: 'Despesa', isDeductible: false },

                // INVESTIMENTOS
                { name: 'Aplicação Financeira', type: 'Investimento' },
                { name: 'Compra de Ativo Imobilizado', type: 'Investimento' },
            ];

            await Category.bulkCreate(defaults);
            console.log('Default categories seeded!');
        }
    } catch (error) {
        console.error("Error seeding categories:", error);
    }
};

// 3. Routes
app.get('/api/ping', (req, res) => res.json({ msg: 'pong' }));
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/ai-analysis', aiAnalysisRoutes);

// Root route for testing
app.get('/', (req, res) => {
    res.send('API is running');
});

// Catch-all
app.use((req, res, next) => {
    console.log(`[404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
    console.log(`🚀 KALQ SERVER RUNNING ON http://localhost:${PORT}`);
    try {
        await sequelize.authenticate();
        // Sync models with DB (alter: true updates schema without dropping data)
        // await sequelize.sync({ alter: true });
        console.log('Database connected!');
        await seedCategories(); // Run seeder
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});
