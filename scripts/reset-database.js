const { sequelize } = require('../src/config/database');
const seedDatabase = require('./seed');
const logger = require('../src/utils/logger');

async function resetDatabase() {
  try {
    logger.info('🔄 Resetting database...');
    
    // Drop all tables and recreate
    await sequelize.sync({ force: true });
    logger.info('✅ Database tables recreated');
    
    // Seed with fresh data
    await seedDatabase();
    logger.info('✅ Database reset and seeded successfully');
    
    process.exit(0);
  } catch (error) {
    logger.error('Database reset failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase;