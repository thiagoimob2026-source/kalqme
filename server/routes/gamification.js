const express = require('express');
const router = express.Router();
const { GamificationService } = require('../services/gamificationService');
const { LeaderboardService } = require('../services/leaderboardService');
const { Badge } = require('../models');

// Middleware de autenticação (assumindo que já existe)
const authenticateToken = require('../middleware/auth');

// Obter estatísticas de gamificação do usuário
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await GamificationService.getUserStats(req.user.id);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching gamification stats:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

// Atualizar streak (chamado no login/acesso diário)
router.post('/streak', authenticateToken, async (req, res) => {
    try {
        const result = await GamificationService.updateStreak(req.user.id);
        res.json(result);
    } catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).json({ error: 'Erro ao atualizar streak' });
    }
});

// Registrar ação manual (para testes ou ações específicas)
router.post('/action', authenticateToken, async (req, res) => {
    try {
        const { action, metadata } = req.body;
        let result;

        switch (action) {
            case 'transaction':
                result = await GamificationService.recordTransaction(
                    req.user.id,
                    metadata?.categorized || false
                );
                break;
            case 'report':
                result = await GamificationService.recordReport(req.user.id);
                break;
            default:
                return res.status(400).json({ error: 'Ação inválida' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error recording action:', error);
        res.status(500).json({ error: 'Erro ao registrar ação' });
    }
});

// Marcar badges como visualizados
router.post('/badges/seen', authenticateToken, async (req, res) => {
    try {
        await GamificationService.markBadgesAsSeen(req.user.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking badges as seen:', error);
        res.status(500).json({ error: 'Erro ao marcar badges' });
    }
});

// Listar todos os badges disponíveis
router.get('/badges', authenticateToken, async (req, res) => {
    try {
        const badges = await Badge.findAll({
            order: [['category', 'ASC'], ['points', 'ASC']]
        });
        res.json(badges);
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ error: 'Erro ao buscar badges' });
    }
});

// === LEADERBOARD ROUTES ===

// Obter top usuários por pontos
router.get('/leaderboard/points', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const topUsers = await LeaderboardService.getTopByPoints(limit);
        res.json(topUsers);
    } catch (error) {
        console.error('Error fetching leaderboard by points:', error);
        res.status(500).json({ error: 'Erro ao buscar ranking' });
    }
});

// Obter top usuários por streak
router.get('/leaderboard/streak', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const topUsers = await LeaderboardService.getTopByStreak(limit);
        res.json(topUsers);
    } catch (error) {
        console.error('Error fetching leaderboard by streak:', error);
        res.status(500).json({ error: 'Erro ao buscar ranking' });
    }
});

// Obter posição do usuário no ranking
router.get('/leaderboard/my-rank', authenticateToken, async (req, res) => {
    try {
        const rank = await LeaderboardService.getUserRank(req.user.id);
        res.json(rank);
    } catch (error) {
        console.error('Error fetching user rank:', error);
        res.status(500).json({ error: 'Erro ao buscar posição' });
    }
});

// Obter estatísticas gerais do leaderboard
router.get('/leaderboard/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await LeaderboardService.getLeaderboardStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching leaderboard stats:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

module.exports = router;
