'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class NfCompany extends Model {
        static associate(models) {
            NfCompany.belongsTo(models.User, { foreignKey: 'userId' });
            NfCompany.hasOne(models.NfCertificate, { foreignKey: 'companyId' });
            NfCompany.hasMany(models.Invoice, { foreignKey: 'companyId' });
        }
    }
    NfCompany.init({
        userId: DataTypes.INTEGER,
        razaoSocial: DataTypes.STRING,
        cnpj: DataTypes.STRING,
        ie: DataTypes.STRING,
        crt: DataTypes.INTEGER, // 1 - Simples Nacional, 2 - Simples Nacional (excesso), 3 - Regime Normal
        endereco: DataTypes.TEXT // Pode armazenar um JSON stringificado
    }, {
        sequelize,
        modelName: 'NfCompany',
    });
    return NfCompany;
};
