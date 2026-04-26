'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Transactions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            releaseDate: {
                type: Sequelize.STRING
            },
            transactionType: {
                type: Sequelize.STRING
            },
            referenceId: {
                type: Sequelize.STRING
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2)
            },
            classificationType: {
                type: Sequelize.STRING
            },
            category: {
                type: Sequelize.STRING
            },
            subCategory: {
                type: Sequelize.STRING
            },
            isDeductible: {
                type: Sequelize.BOOLEAN
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Transactions');
    }
};
