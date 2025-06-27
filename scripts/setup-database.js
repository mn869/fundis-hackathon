const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function setupDatabase() {
  try {
    logger.info('Setting up database...');
    
    // Test connection
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Sync models
    await sequelize.sync({ force: false, alter: true });
    logger.info('Database models synchronized');
    
    logger.info('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();