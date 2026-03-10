const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('User', {
    id: {
        type:          DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
    },
    username: {
        type:      DataTypes.STRING(50),
        allowNull: false,
        unique:    true,
    },
    email: {
        type:      DataTypes.STRING(255),
        allowNull: false,
        unique:    true,
        validate:  { isEmail: true },
    },
    passwordHash: {
        type:      DataTypes.STRING,
        allowNull: false,
    },
    isVerified: {
        type:         DataTypes.BOOLEAN,
        defaultValue: false,
    },
    telegramChatId: {
        type:         DataTypes.STRING,
        allowNull:    true,
        defaultValue: null,
    },
}, {
    tableName:  'users',
    timestamps: true,
});
