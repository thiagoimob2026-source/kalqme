const { sequelize, UserGamification, Badge, UserBadge } = require('./models');

async function setupGamification() {
    try {
        console.log('🎮 Configurando sistema de gamificação...');

        // Sync only gamification models
        await UserGamification.sync({ force: false });
        console.log('✅ Tabela UserGamifications criada/verificada');

        await Badge.sync({ force: false });
        console.log('✅ Tabela Badges criada/verificada');

        await UserBadge.sync({ force: false });
        console.log('✅ Tabela UserBadges criada/verificada');

        console.log('🎉 Sistema de gamificação configurado com sucesso!');
        console.log('📝 Execute "node seed_badges.js" para popular os badges.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao configurar gamificação:', error);
        process.exit(1);
    }
}

setupGamification();
