'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserBadge extends Model {
        static associate(models) {
            UserBadge.belongsTo(models.User, { foreignKey: 'userId' });
            UserBadge.belongsTo(models.Badge, { foreignKey: 'badgeId' });
        }
    }

    UserBadge.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        badgeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        earnedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        isNew: {
            type: DataTypes.BOOLEAN,
            defaultValue: true // For showing "NEW" badge indicator
        }
    }, {
        sequelize,
        modelName: 'UserBadge',
        indexes: [
            {
                unique: true,
                fields: ['userId', 'badgeId']
            }
        ]
    });

    return UserBadge;
};
