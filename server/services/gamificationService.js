const { UserGamification, Badge, UserBadge, User } = require('../models');
const { Op } = require('sequelize');

// Definição de níveis e pontos necessários
const LEVELS = [
    { level: 1, minPoints: 0, title: 'Iniciante Financeiro' },
    { level: 2, minPoints: 100, title: 'Aprendiz do Fluxo' },
    { level: 3, minPoints: 250, title: 'Gestor Consciente' },
    { level: 4, minPoints: 500, title: 'Especialista em Finanças' },
    { level: 5, minPoints: 1000, title: 'Mestre do Fluxo de Caixa' },
    { level: 6, minPoints: 2000, title: 'CFO Virtual' },
    { level: 7, minPoints: 5000, title: 'Guru Financeiro' },
];

// Pontos por ação
const POINTS = {
    TRANSACTION_CREATED: 10,
    TRANSACTION_CATEGORIZED: 5,
    DAILY_LOGIN: 5,
    STREAK_BONUS: 10, // Por cada 7 dias de streak
    REPORT_GENERATED: 20,
    POSITIVE_BALANCE: 15,
    BUDGET_CREATED: 25,
    PROFILE_COMPLETED: 50,
};

class GamificationService {
    // Inicializar gamificação para novo usuário
    static async initializeUser(userId) {
        const existing = await UserGamification.findOne({ where: { userId } });
        if (existing) return existing;

        return await UserGamification.create({
            userId,
            points: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date().toISOString().split('T')[0]
        });
    }

    // Adicionar pontos e verificar level up
    static async addPoints(userId, points, reason = '') {
        let gamification = await UserGamification.findOne({ where: { userId } });
        if (!gamification) {
            gamification = await this.initializeUser(userId);
        }

        const oldPoints = gamification.points;
        const oldLevel = gamification.level;

        gamification.points += points;

        // Calcular novo nível
        const newLevel = this.calculateLevel(gamification.points);
        const leveledUp = newLevel > oldLevel;

        if (leveledUp) {
            gamification.level = newLevel;
        }

        await gamification.save();

        return {
            pointsAdded: points,
            totalPoints: gamification.points,
            oldLevel,
            newLevel: gamification.level,
            leveledUp,
            reason
        };
    }

    // Calcular nível baseado em pontos
    static calculateLevel(points) {
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (points >= LEVELS[i].minPoints) {
                return LEVELS[i].level;
            }
        }
        return 1;
    }

    // Obter informações do nível
    static getLevelInfo(level) {
        return LEVELS.find(l => l.level === level) || LEVELS[0];
    }

    // Obter próximo nível
    static getNextLevelInfo(currentLevel) {
        return LEVELS.find(l => l.level === currentLevel + 1);
    }

    // Atualizar streak diário
    static async updateStreak(userId) {
        let gamification = await UserGamification.findOne({ where: { userId } });
        if (!gamification) {
            gamification = await this.initializeUser(userId);
        }

        const today = new Date().toISOString().split('T')[0];
        const lastActivity = gamification.lastActivityDate;

        if (lastActivity === today) {
            return { streakUpdated: false, currentStreak: gamification.currentStreak };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let pointsAwarded = POINTS.DAILY_LOGIN;
        let newBadges = [];

        if (lastActivity === yesterdayStr) {
            // Continua o streak
            gamification.currentStreak += 1;

            // Bônus a cada 7 dias
            if (gamification.currentStreak % 7 === 0) {
                pointsAwarded += POINTS.STREAK_BONUS;
            }
        } else {
            // Quebrou o streak
            gamification.currentStreak = 1;
        }

        if (gamification.currentStreak > gamification.longestStreak) {
            gamification.longestStreak = gamification.currentStreak;
        }

        gamification.lastActivityDate = today;
        await gamification.save();

        // Adicionar pontos
        const pointsResult = await this.addPoints(userId, pointsAwarded, 'Login diário');

        // Verificar badges de streak
        newBadges = await this.checkStreakBadges(userId, gamification.currentStreak);

        return {
            streakUpdated: true,
            currentStreak: gamification.currentStreak,
            longestStreak: gamification.longestStreak,
            pointsAwarded: pointsResult,
            newBadges
        };
    }

    // Registrar ação de transação
    static async recordTransaction(userId, categorized = false) {
        let gamification = await UserGamification.findOne({ where: { userId } });
        if (!gamification) {
            gamification = await this.initializeUser(userId);
        }

        gamification.totalTransactions += 1;
        if (categorized) {
            gamification.totalCategorized += 1;
        }
        await gamification.save();

        let points = POINTS.TRANSACTION_CREATED;
        if (categorized) {
            points += POINTS.TRANSACTION_CATEGORIZED;
        }

        const pointsResult = await this.addPoints(userId, points, 'Transação registrada');
        const newBadges = await this.checkTransactionBadges(userId, gamification);

        return { pointsResult, newBadges };
    }

    // Registrar relatório gerado
    static async recordReport(userId) {
        let gamification = await UserGamification.findOne({ where: { userId } });
        if (!gamification) {
            gamification = await this.initializeUser(userId);
        }

        gamification.reportsGenerated += 1;
        await gamification.save();

        const pointsResult = await this.addPoints(userId, POINTS.REPORT_GENERATED, 'Relatório gerado');
        const newBadges = await this.checkReportBadges(userId, gamification);

        return { pointsResult, newBadges };
    }

    // Verificar e conceder badges de streak
    static async checkStreakBadges(userId, streak) {
        const badges = [];
        const streakMilestones = [
            { days: 3, badgeName: 'streak_3' },
            { days: 7, badgeName: 'streak_7' },
            { days: 15, badgeName: 'streak_15' },
            { days: 30, badgeName: 'streak_30' },
            { days: 100, badgeName: 'streak_100' }
        ];

        for (const milestone of streakMilestones) {
            if (streak >= milestone.days) {
                const badge = await this.awardBadge(userId, milestone.badgeName);
                if (badge) badges.push(badge);
            }
        }

        return badges;
    }

    // Verificar badges de transações
    static async checkTransactionBadges(userId, gamification) {
        const badges = [];
        const milestones = [
            { count: 1, badgeName: 'first_transaction' },
            { count: 10, badgeName: 'transaction_10' },
            { count: 50, badgeName: 'transaction_50' },
            { count: 100, badgeName: 'transaction_100' },
            { count: 500, badgeName: 'transaction_500' }
        ];

        for (const milestone of milestones) {
            if (gamification.totalTransactions >= milestone.count) {
                const badge = await this.awardBadge(userId, milestone.badgeName);
                if (badge) badges.push(badge);
            }
        }

        return badges;
    }

    // Verificar badges de relatórios
    static async checkReportBadges(userId, gamification) {
        const badges = [];
        const milestones = [
            { count: 1, badgeName: 'first_report' },
            { count: 5, badgeName: 'report_5' },
            { count: 10, badgeName: 'report_10' }
        ];

        for (const milestone of milestones) {
            if (gamification.reportsGenerated >= milestone.count) {
                const badge = await this.awardBadge(userId, milestone.badgeName);
                if (badge) badges.push(badge);
            }
        }

        return badges;
    }

    // Conceder badge ao usuário
    static async awardBadge(userId, badgeName) {
        const badge = await Badge.findOne({ where: { name: badgeName } });
        if (!badge) return null;

        const [userBadge, created] = await UserBadge.findOrCreate({
            where: { userId, badgeId: badge.id },
            defaults: { earnedAt: new Date(), isNew: true }
        });

        if (created) {
            // Adicionar pontos do badge
            await this.addPoints(userId, badge.points, `Badge desbloqueado: ${badge.description}`);
            return badge;
        }

        return null;
    }

    // Obter estatísticas completas do usuário
    static async getUserStats(userId) {
        let gamification = await UserGamification.findOne({ where: { userId } });
        if (!gamification) {
            gamification = await this.initializeUser(userId);
        }

        const currentLevelInfo = this.getLevelInfo(gamification.level);
        const nextLevelInfo = this.getNextLevelInfo(gamification.level);

        const userBadges = await UserBadge.findAll({
            where: { userId },
            include: [{ model: Badge }],
            order: [['earnedAt', 'DESC']]
        });

        const allBadges = await Badge.findAll();
        const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
        const lockedBadges = allBadges.filter(b => !earnedBadgeIds.includes(b.id));

        return {
            points: gamification.points,
            level: gamification.level,
            currentLevelInfo,
            nextLevelInfo,
            progressToNextLevel: nextLevelInfo ?
                ((gamification.points - currentLevelInfo.minPoints) / (nextLevelInfo.minPoints - currentLevelInfo.minPoints)) * 100 : 100,
            currentStreak: gamification.currentStreak,
            longestStreak: gamification.longestStreak,
            totalTransactions: gamification.totalTransactions,
            totalCategorized: gamification.totalCategorized,
            reportsGenerated: gamification.reportsGenerated,
            earnedBadges: userBadges,
            lockedBadges,
            badgeCount: userBadges.length,
            totalBadges: allBadges.length
        };
    }

    // Marcar badges como visualizados
    static async markBadgesAsSeen(userId) {
        await UserBadge.update(
            { isNew: false },
            { where: { userId, isNew: true } }
        );
    }
}

module.exports = { GamificationService, POINTS, LEVELS };
