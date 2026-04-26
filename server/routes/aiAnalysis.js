const express = require('express');
const router = express.Router();
const { Transaction, Customer, User } = require('../models');
const authenticateToken = require('../middleware/auth');
const { AIFinancialAnalysisService } = require('../services/aiFinancialAnalysisService');

/**
 * GET /api/ai-analysis
 * Gera análise financeira completa com IA
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Buscar todas as transações do usuário
        const transactions = await Transaction.findAll({
            where: { userId },
            include: [{ model: Customer, attributes: ['id', 'name', 'cpf'] }],
            order: [['releaseDate', 'ASC']]
        });

        // Buscar todos os clientes do usuário
        const customers = await Customer.findAll({
            where: { userId }
        });

        // Buscar perfil do usuário
        const user = await User.findByPk(userId);
        const userProfile = {
            profession: user.profession || 'Profissional Liberal',
            taxRegime: user.taxRegime || 'Pessoa Física'
        };

        // Verificar se há dados suficientes
        if (transactions.length === 0) {
            return res.json({
                success: true,
                data: {
                    analise_executiva: 'Ainda não há dados suficientes para análise. Importe suas transações para começar.',
                    score_saude_financeira: 0,
                    insights_estrategicos: [{
                        tipo: 'ALERTA_FISCAL',
                        titulo: 'Dados Insuficientes',
                        descricao: 'Você precisa importar suas transações bancárias para que possamos gerar uma análise completa.',
                        acao_recomendada: 'Vá para a página de Transações e importe seu extrato bancário em formato CSV.'
                    }],
                    veredito_cfo: 'Aguardando dados para análise.',
                    kpis: {},
                    status_mei: null,
                    anomalies: []
                }
            });
        }

        // Gerar análise completa
        const analysis = await AIFinancialAnalysisService.generateAnalysis(
            userId,
            transactions,
            customers,
            userProfile
        );

        res.json(analysis);

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao gerar análise financeira',
            message: error.message
        });
    }
});

/**
 * GET /api/ai-analysis/system-instruction
 * Retorna a System Instruction para uso em integrações externas
 */
router.get('/system-instruction', authenticateToken, (req, res) => {
    res.json({
        success: true,
        systemInstruction: AIFinancialAnalysisService.getSystemInstruction()
    });
});

module.exports = router;
