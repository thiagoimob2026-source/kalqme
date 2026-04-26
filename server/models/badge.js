'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Badge extends Model {
        static associate(models) {
            Badge.belongsToMany(models.User, {
                through: 'UserBadges',
                foreignKey: 'badgeId',
                otherKey: 'userId'
            });
        }
    }

    Badge.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false // 'transaction', 'streak', 'financial', 'achievement'
        },
        requirement: {
            type: DataTypes.STRING,
            allowNull: false // JSON string with requirement logic
        },
        points: {
            type: DataTypes.INTEGER,
            defaultValue: 10
        },
        rarity: {
            type: DataTypes.STRING,
            defaultValue: 'common' // 'common', 'rare', 'epic', 'legendary'
        }
    }, {
        sequelize,
        modelName: 'Badge',
    });

    return Badge;
};
