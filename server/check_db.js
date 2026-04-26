const { Sequelize } = require('sequelize');
const { sequelize, Category } = require('./models');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Force sync for debugging
        await sequelize.sync({ alter: true });
        console.log('Sync complete.');

        const count = await Category.count();
        console.log(`There are ${count} categories.`);

        if (count === 0) {
            console.log('Attempting to seed...');
            // ... (seed logic snippet if I want to test here)
        } else {
            const cats = await Category.findAll();
            console.log('First 3 categories:', JSON.stringify(cats.slice(0, 3), null, 2));
        }

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();
