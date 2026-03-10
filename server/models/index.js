const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host:    dbConfig.host,
        port:    dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
    }
);

const User      = require('./User')(sequelize);
const GameState = require('./GameState')(sequelize);
const OtpCode   = require('./OtpCode')(sequelize);

// Relations
User.hasOne(GameState, { foreignKey: 'userId', onDelete: 'CASCADE' });
GameState.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(OtpCode, { foreignKey: 'userId', onDelete: 'CASCADE' });
OtpCode.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, GameState, OtpCode };
