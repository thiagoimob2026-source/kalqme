const { UserGamification, User } = require('../models');
const { Op } = require('sequelize');

class LeaderboardService {
    // Obter top usuários por pontos
    static async getTopByPoints(limit = 10) {
        try {
            const topUsers = await UserGamification.findAll({
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'companyName']
                }],
                order: [['points', 'DESC']],
                limit: limit
            });

            return topUsers.map((gamification, index) => ({
                rank: index + 1,
                userId: gamification.userId,
                name: gamification.User.name,
                companyName: gamification.User.companyName,
                points: gamification.points,
                level: gamification.level,
                badges: 0 // Will be populated separately if needed
            }));
        } catch (error) {
            console.error('Error getting top by points:', error);
            return [];
        }
    }

    // Obter top usuários por streak
    static async getTopByStreak(limit = 10) {
        try {
            const topUsers = await UserGamification.findAll({
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'companyName']
                }],
                order: [['currentStreak', 'DESC']],
                limit: limit
            });

            return topUsers.map((gamification, index) => ({
                rank: index + 1,
                userId: gamification.userId,
                name: gamification.User.name,
                companyName: gamification.User.companyName,
                currentStreak: gamification.currentStreak,
                longestStreak: gamification.longestStreak
            }));
        } catch (error) {
            console.error('Error getting top by streak:', error);
            return [];
        }
    }

    // Obter posição do usuário no ranking
    static async getUserRank(userId) {
        try {
            const userGamification = await UserGamification.findOne({ where: { userId } });
            if (!userGamification) return null;

            const higherRanked = await UserGamification.count({
                where: {
                    points: {
                        [Op.gt]: userGamification.points
                    }
                }
            });

            return {
                rank: higherRanked + 1,
                points: userGamification.points,
                level: userGamification.level
            };
        } catch (error) {
            console.error('Error getting user rank:', error);
            return null;
        }
    }

    // Obter estatísticas gerais do leaderboard
    static async getLeaderboardStats() {
        try {
            const totalUsers = await UserGamification.count();
            const avgPoints = await UserGamification.findAll({
                attributes: [[UserGamification.sequelize.fn('AVG', UserGamification.sequelize.col('points')), 'avgPoints']]
            });

            const topStreak = await UserGamification.findOne({
                order: [['currentStreak', 'DESC']],
                attributes: ['currentStreak']
            });

            return {
                totalUsers,
                averagePoints: Math.round(avgPoints[0]?.dataValues?.avgPoints || 0),
                topStreak: topStreak?.currentStreak || 0
            };
        } catch (error) {
            console.error('Error getting leaderboard stats:', error);
            return null;
        }
    }
}

module.exports = { LeaderboardService };
