'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Transaction, { foreignKey: 'userId' });
        }
    }
    User.init({
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        companyName: DataTypes.STRING,
        taxType: DataTypes.STRING, // 'MEI' or 'AUTONOMO'
        isPaid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        paidUntil: {
            type: DataTypes.DATE,
            allowNull: true
        },
        subscriptionPlan: {
            type: DataTypes.STRING,
            defaultValue: 'FREE' // 'FREE', 'AUTO', 'PRO'
        }
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};
