const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/fundis_bot', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Database synchronized');
    }
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
};

module.exports = { sequelize, connectDatabase };