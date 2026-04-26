const { sequelize } = require('./models');

async function fixBudgetsTable() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('Budgets');

        if (!tableInfo.type) {
            console.log('Adding column type to Budgets...');
            await queryInterface.addColumn('Budgets', 'type', {
                type: 'STRING',
                allowNull: true
            });
        }

        if (!tableInfo.subType) {
            console.log('Adding column subType to Budgets...');
            await queryInterface.addColumn('Budgets', 'subType', {
                type: 'STRING',
                allowNull: true
            });
        }

        console.log('Tabela Budgets atualizada com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar tabela Budgets:', error);
    } finally {
        process.exit();
    }
}

fixBudgetsTable();
