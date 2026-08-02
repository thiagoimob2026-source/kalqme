'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Invoice extends Model {
        static associate(models) {
            Invoice.belongsTo(models.User, { foreignKey: 'userId' });
            Invoice.belongsTo(models.NfCompany, { foreignKey: 'companyId' });
            Invoice.belongsTo(models.Transaction, { foreignKey: 'transactionId' });
        }
    }
    Invoice.init({
        userId: DataTypes.INTEGER,
        companyId: DataTypes.INTEGER,
        transactionId: DataTypes.INTEGER, // Opcional, caso a nota esteja vinculada a uma transação do fluxo
        amount: DataTypes.DECIMAL(10, 2),
        model: DataTypes.INTEGER, // 55 (NF-e) ou 65 (NFC-e)
        status: DataTypes.STRING, // 'processando', 'autorizada', 'rejeitada', 'cancelada'
        accessKey: DataTypes.STRING,
        receipt: DataTypes.STRING,
        xml: DataTypes.TEXT, // XML autorizado
        pdfUrl: DataTypes.STRING, // Caminho local ou URL para o PDF
        message: DataTypes.TEXT // Mensagem de erro da SEFAZ, se houver
    }, {
        sequelize,
        modelName: 'Invoice',
    });
    return Invoice;
};
