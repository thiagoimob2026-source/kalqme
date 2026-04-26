'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserGamification extends Model {
        static associate(models) {
            UserGamification.belongsTo(models.User, { foreignKey: 'userId' });
        }
    }

    UserGamification.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        points: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        currentStreak: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        longestStreak: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        lastActivityDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        totalTransactions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        totalCategorized: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        positiveDaysCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        reportsGenerated: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'UserGamification',
    });

    return UserGamification;
};
