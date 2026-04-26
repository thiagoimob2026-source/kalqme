const { User } = require('./models');

const updateExisting = async () => {
    try {
        const users = await User.findAll({ where: { isPaid: true, paidUntil: null } });
        console.log(`Encontrados ${users.length} usuários pagos sem data de vigência.`);

        for (const user of users) {
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            user.paidUntil = nextYear;
            await user.save();
            console.log(`Vigência atualizada para: ${user.email}`);
        }

        console.log('Processo concluído.');
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        process.exit();
    }
};

updateExisting();
