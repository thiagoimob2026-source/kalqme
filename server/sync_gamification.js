const { sequelize } = require('./models');

async function syncDatabase() {
    try {
        console.log('🔄 Sincronizando banco de dados...');

        // Sync all models with alter: true to update schema without dropping data
        await sequelize.sync({ alter: true });

        console.log('✅ Banco de dados sincronizado com sucesso!');
        console.log('📝 Execute "node seed_badges.js" para popular os badges.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao sincronizar banco de dados:', error);
        process.exit(1);
    }
}

syncDatabase();
