'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Customer extends Model {
        static associate(models) {
            Customer.belongsTo(models.User, { foreignKey: 'userId' });
            Customer.hasMany(models.Transaction, { foreignKey: 'customerId' });
        }
    }
    Customer.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cpf: DataTypes.STRING,
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        birthDate: DataTypes.DATEONLY,
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Customer',
    });
    return Customer;
};
