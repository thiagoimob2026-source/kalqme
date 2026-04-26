const { User } = require('./models');
const bcrypt = require('bcrypt');

const email = 'thiagoimob2026@gmail.com';
const newPassword = 'admin123';

const reset = async () => {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('Usuário não encontrado.');
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.isAdmin = true;
        user.isPaid = true;
        await user.save();

        console.log(`Sucesso! Senha de ${email} resetada para: ${newPassword}`);
        console.log(`Status: Administrador e Acesso Liberado.`);
    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        process.exit();
    }
};

reset();
