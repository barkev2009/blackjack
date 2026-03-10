const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('GameState', {
    id: {
        type:          DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
    },
    userId: {
        type:      DataTypes.INTEGER,
        allowNull: false,
        unique:    true,
    },
    bankroll: {
        type:         DataTypes.INTEGER,
        allowNull:    false,
        defaultValue: 2000,
    },
    // Полное состояние игры: shoe, hands, phase, bet, runningCount и т.д.
    state: {
        type:         DataTypes.JSONB,
        allowNull:    false,
        defaultValue: {},
    },
}, {
    tableName:  'game_states',
    timestamps: true,
});
