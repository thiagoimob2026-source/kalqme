'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        static associate(models) {
            Transaction.belongsTo(models.User, { foreignKey: 'userId' });
            Transaction.belongsTo(models.Customer, { foreignKey: 'customerId' });
        }
    }
    Transaction.init({
        releaseDate: DataTypes.STRING,
        transactionType: DataTypes.STRING,
        referenceId: DataTypes.STRING,
        amount: DataTypes.DECIMAL(10, 2),
        classificationType: DataTypes.STRING,
        category: DataTypes.STRING,
        subCategory: DataTypes.STRING, // Used for Investment operation too
        isDeductible: DataTypes.BOOLEAN,
        userId: DataTypes.INTEGER,
        customerId: DataTypes.INTEGER,
        accountName: DataTypes.STRING, // 'Banco do Brasil', 'Mercado Pago', etc.
        uploadBatchId: DataTypes.STRING // UUID or timestamp for grouping uploads
    }, {
        sequelize,
        modelName: 'Transaction',
    });
    return Transaction;
};
