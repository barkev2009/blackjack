const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('OtpCode', {
    id: {
        type:          DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
    },
    userId: {
        type:      DataTypes.INTEGER,
        allowNull: false,
    },
    code: {
        type:      DataTypes.STRING(6),
        allowNull: false,
    },
    purpose: {
        // 'verify_email' | 'login_2fa'
        type:         DataTypes.STRING(20),
        defaultValue: 'login_2fa',
    },
    expiresAt: {
        type:      DataTypes.DATE,
        allowNull: false,
    },
    used: {
        type:         DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName:  'otp_codes',
    timestamps: true,
});
