'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        static associate(models) {
            // userId can be null for system default categories
            // Removing constraint check for simplicity in SQLite if needed, or ensuring User exists
            Category.belongsTo(models.User, { foreignKey: 'userId', constraints: false });
        }
    }
    Category.init({
        name: DataTypes.STRING,
        type: DataTypes.STRING, // 'Receita', 'Despesa', 'Investimento'
        isDeductible: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true // Null means it is a system default category visible to everyone
        }
    }, {
        sequelize,
        modelName: 'Category',
    });
    return Category;
};
