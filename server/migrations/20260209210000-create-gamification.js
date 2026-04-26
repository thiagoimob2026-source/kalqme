'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create UserGamifications table
        await queryInterface.createTable('UserGamifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            points: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            level: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            currentStreak: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            longestStreak: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            lastActivityDate: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            totalTransactions: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            totalCategorized: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            positiveDaysCount: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            reportsGenerated: {
                type: Sequelize.INTEGER,
                defaultValue: 0
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

        // Create Badges table
        await queryInterface.createTable('Badges', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false
            },
            icon: {
                type: Sequelize.STRING,
                allowNull: false
            },
            category: {
                type: Sequelize.STRING,
                allowNull: false
            },
            requirement: {
                type: Sequelize.STRING,
                allowNull: false
            },
            points: {
                type: Sequelize.INTEGER,
                defaultValue: 10
            },
            rarity: {
                type: Sequelize.STRING,
                defaultValue: 'common'
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

        // Create UserBadges table
        await queryInterface.createTable('UserBadges', {
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
            badgeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Badges',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            earnedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            isNew: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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

        // Add unique constraint for userId + badgeId
        await queryInterface.addIndex('UserBadges', ['userId', 'badgeId'], {
            unique: true,
            name: 'user_badge_unique'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('UserBadges');
        await queryInterface.dropTable('Badges');
        await queryInterface.dropTable('UserGamifications');
    }
};
