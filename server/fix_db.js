const { sequelize } = require('./models');

async function fixDatabase() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('Transactions');

        if (!tableInfo.accountName) {
            console.log('Adding column accountName...');
            await queryInterface.addColumn('Transactions', 'accountName', {
                type: 'STRING',
                allowNull: true
            });
        }

        if (!tableInfo.uploadBatchId) {
            console.log('Adding column uploadBatchId...');
            await queryInterface.addColumn('Transactions', 'uploadBatchId', {
                type: 'STRING',
                allowNull: true
            });
        }

        console.log('Banco de dados atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar banco:', error);
    } finally {
        process.exit();
    }
}

fixDatabase();
