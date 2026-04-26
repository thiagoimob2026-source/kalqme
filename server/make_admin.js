const { User } = require('./models');

const email = process.argv[2];

if (!email) {
    console.log('Uso: node make_admin.js seu-email@exemplo.com');
    process.exit(1);
}

const makeAdmin = async () => {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('Usuário não encontrado.');
            return;
        }

        user.isAdmin = true;
        user.isPaid = true; // Admins also don't pay
        await user.save();

        console.log(`Sucesso! O usuário ${email} agora é um ADMINISTRADOR.`);
    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        process.exit();
    }
};

makeAdmin();
