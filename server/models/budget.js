'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Budget extends Model {
        static associate(models) {
            Budget.belongsTo(models.User, { foreignKey: 'userId' });
        }
    }
    Budget.init({
        userId: DataTypes.INTEGER,
        categoryName: DataTypes.STRING,
        type: DataTypes.STRING, // 'Receita', 'Despesa', 'Investimento'
        subType: DataTypes.STRING, // 'Aplicação', 'Resgate' (null for others)
        month: DataTypes.INTEGER,
        year: DataTypes.INTEGER,
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'Budget',
    });
    return Budget;
};
