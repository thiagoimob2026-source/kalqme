'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class NfCertificate extends Model {
        static associate(models) {
            NfCertificate.belongsTo(models.NfCompany, { foreignKey: 'companyId' });
        }
    }
    NfCertificate.init({
        companyId: DataTypes.INTEGER,
        password: DataTypes.STRING, // Senha do certificado
        pfxBuffer: DataTypes.BLOB, // Armazena o certificado em buffer diretamente no banco para facilitar na cloud
        expirationDate: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'NfCertificate',
    });
    return NfCertificate;
};
