const axios = require('axios');
const { connectDatabase } = require('../src/config/database');
const { connectRedis } = require('../src/config/redis');
const logger = require('../src/utils/logger');

async function checkServerStatus() {
  try {
    logger.info('🔍 Checking server status...');

    // Check if server is running
    const serverUrl = process.env.API_URL || 'http://localhost:3000';
    
    try {
      const response = await axios.get(`${serverUrl}/health`, { timeout: 5000 });
      logger.info(`✅ Server is running at ${serverUrl}`);
      logger.info(`   Status: ${response.data.status}`);
      logger.info(`   Uptime: ${response.data.uptime} seconds`);
      logger.info(`   Environment: ${response.data.environment}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logger.error('❌ Server is not running or not accessible');
        logger.info('💡 Try running: npm start');
        return false;
      } else {
        logger.error(`❌ Server health check failed: ${error.message}`);
        return false;
      }
    }

    // Check database connection
    try {
      await connectDatabase();
      logger.info('✅ Database connection successful');
    } catch (error) {
      logger.error(`❌ Database connection failed: ${error.message}`);
      return false;
    }

    // Check Redis connection
    try {
      await connectRedis();
      logger.info('✅ Redis connection successful');
    } catch (error) {
      logger.error(`❌ Redis connection failed: ${error.message}`);
      return false;
    }

    // Check environment variables
    const requiredEnvVars = [
      'JWT_SECRET',
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_PHONE_NUMBER_ID'
    ];

    let envVarsOk = true;
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        logger.warn(`⚠️  Missing environment variable: ${envVar}`);
        envVarsOk = false;
      }
    }

    if (envVarsOk) {
      logger.info('✅ All required environment variables are set');
    } else {
      logger.warn('⚠️  Some environment variables are missing');
    }

    logger.info('\n🎉 Server status check completed successfully!');
    return true;

  } catch (error) {
    logger.error('Server status check failed:', error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  checkServerStatus()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

module.exports = checkServerStatus;