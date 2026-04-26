const { sequelize } = require('./models');

const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Banco de dados sincronizado com sucesso (Colunas isPaid e isAdmin adicionadas).');
    } catch (error) {
        console.error('Erro ao sincronizar banco de dados:', error);
    } finally {
        process.exit();
    }
};

syncDB();
