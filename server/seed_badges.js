const { Badge } = require('./models');

const badges = [
    // Badges de Primeiras Ações
    {
        name: 'first_transaction',
        description: 'Primeira Transação',
        icon: '🎯',
        category: 'transaction',
        requirement: JSON.stringify({ totalTransactions: 1 }),
        points: 50,
        rarity: 'common'
    },
    {
        name: 'first_report',
        description: 'Primeiro Relatório',
        icon: '📊',
        category: 'achievement',
        requirement: JSON.stringify({ reportsGenerated: 1 }),
        points: 50,
        rarity: 'common'
    },

    // Badges de Transações
    {
        name: 'transaction_10',
        description: '10 Transações Registradas',
        icon: '📝',
        category: 'transaction',
        requirement: JSON.stringify({ totalTransactions: 10 }),
        points: 100,
        rarity: 'common'
    },
    {
        name: 'transaction_50',
        description: '50 Transações Registradas',
        icon: '📋',
        category: 'transaction',
        requirement: JSON.stringify({ totalTransactions: 50 }),
        points: 200,
        rarity: 'rare'
    },
    {
        name: 'transaction_100',
        description: '100 Transações Registradas',
        icon: '📚',
        category: 'transaction',
        requirement: JSON.stringify({ totalTransactions: 100 }),
        points: 500,
        rarity: 'epic'
    },
    {
        name: 'transaction_500',
        description: '500 Transações - Mestre dos Registros',
        icon: '👑',
        category: 'transaction',
        requirement: JSON.stringify({ totalTransactions: 500 }),
        points: 1000,
        rarity: 'legendary'
    },

    // Badges de Streak
    {
        name: 'streak_3',
        description: '3 Dias Consecutivos',
        icon: '🔥',
        category: 'streak',
        requirement: JSON.stringify({ currentStreak: 3 }),
        points: 50,
        rarity: 'common'
    },
    {
        name: 'streak_7',
        description: '1 Semana de Dedicação',
        icon: '⭐',
        category: 'streak',
        requirement: JSON.stringify({ currentStreak: 7 }),
        points: 150,
        rarity: 'rare'
    },
    {
        name: 'streak_15',
        description: '15 Dias Imparável',
        icon: '💎',
        category: 'streak',
        requirement: JSON.stringify({ currentStreak: 15 }),
        points: 300,
        rarity: 'epic'
    },
    {
        name: 'streak_30',
        description: '1 Mês de Consistência',
        icon: '🏆',
        category: 'streak',
        requirement: JSON.stringify({ currentStreak: 30 }),
        points: 750,
        rarity: 'epic'
    },
    {
        name: 'streak_100',
        description: '100 Dias - Lenda Viva',
        icon: '👑',
        category: 'streak',
        requirement: JSON.stringify({ currentStreak: 100 }),
        points: 2000,
        rarity: 'legendary'
    },

    // Badges de Relatórios
    {
        name: 'report_5',
        description: '5 Relatórios Gerados',
        icon: '📈',
        category: 'achievement',
        requirement: JSON.stringify({ reportsGenerated: 5 }),
        points: 200,
        rarity: 'rare'
    },
    {
        name: 'report_10',
        description: '10 Relatórios - Analista Expert',
        icon: '📊',
        category: 'achievement',
        requirement: JSON.stringify({ reportsGenerated: 10 }),
        points: 500,
        rarity: 'epic'
    },

    // Badges Financeiros
    {
        name: 'positive_week',
        description: 'Saldo Positivo por 7 Dias',
        icon: '💰',
        category: 'financial',
        requirement: JSON.stringify({ positiveDaysCount: 7 }),
        points: 200,
        rarity: 'rare'
    },
    {
        name: 'positive_month',
        description: 'Saldo Positivo por 30 Dias',
        icon: '💎',
        category: 'financial',
        requirement: JSON.stringify({ positiveDaysCount: 30 }),
        points: 500,
        rarity: 'epic'
    },
    {
        name: 'organized',
        description: 'Todas as Categorias Usadas',
        icon: '🎨',
        category: 'achievement',
        requirement: JSON.stringify({ allCategoriesUsed: true }),
        points: 300,
        rarity: 'rare'
    }
];

async function seedBadges() {
    try {
        console.log('🎮 Iniciando seed de badges...');

        for (const badgeData of badges) {
            const [badge, created] = await Badge.findOrCreate({
                where: { name: badgeData.name },
                defaults: badgeData
            });

            if (created) {
                console.log(`✅ Badge criado: ${badgeData.description} ${badgeData.icon}`);
            } else {
                console.log(`ℹ️  Badge já existe: ${badgeData.description}`);
            }
        }

        console.log('🎉 Seed de badges concluído!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar badges:', error);
        process.exit(1);
    }
}

seedBadges();
