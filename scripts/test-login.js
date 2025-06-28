const axios = require('axios');
const { User } = require('../src/models');
const { connectDatabase } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function testLoginFlow() {
  try {
    logger.info('🔍 Testing login flow...');
    
    // Connect to database
    await connectDatabase();
    
    // Check available users
    const users = await User.findAll({
      attributes: ['id', 'phoneNumber', 'name', 'email', 'role', 'isActive', 'isVerified'],
      limit: 10
    });
    
    logger.info(`Found ${users.length} users in database:`);
    users.forEach(user => {
      logger.info(`  - ${user.phoneNumber}: ${user.name} (${user.role}) - Active: ${user.isActive}, Verified: ${user.isVerified}`);
    });
    
    // Test API login
    const API_URL = 'http://localhost:3000';
    
    // Test with admin user
    const testPhones = ['0700000000', '0712345678', '0723456789'];
    
    for (const phone of testPhones) {
      try {
        logger.info(`\n🧪 Testing login with phone: ${phone}`);
        
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          phoneNumber: phone
        }, {
          timeout: 5000,
          validateStatus: () => true // Don't throw on any status
        });
        
        logger.info(`Response status: ${response.status}`);
        logger.info(`Response message: ${response.data.message}`);
        
        if (response.status === 200) {
          logger.info(`✅ Login successful for ${phone}`);
          logger.info(`User: ${response.data.data.user.name} (${response.data.data.user.role})`);
          logger.info(`Token: ${response.data.data.token ? 'Generated' : 'Missing'}`);
        } else {
          logger.error(`❌ Login failed for ${phone}: ${response.data.message}`);
        }
        
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          logger.error(`❌ Cannot connect to server at ${API_URL}`);
          logger.error('Make sure the server is running: npm start');
          break;
        } else {
          logger.error(`❌ Login test failed for ${phone}: ${error.message}`);
        }
      }
    }
    
    // Test frontend API call
    logger.info('\n🌐 Testing frontend API configuration...');
    
    try {
      const frontendApiUrl = 'http://localhost:5173';
      const testResponse = await axios.get(`${frontendApiUrl}`, {
        timeout: 3000,
        validateStatus: () => true
      });
      
      if (testResponse.status === 200) {
        logger.info('✅ Frontend server is accessible');
      } else {
        logger.warn(`⚠️  Frontend server returned: ${testResponse.status}`);
      }
    } catch (error) {
      logger.warn('⚠️  Frontend server not accessible - make sure it\'s running: npm run client:dev');
    }
    
    // Provide debugging instructions
    logger.info('\n🔧 Debugging Instructions:');
    logger.info('1. Make sure backend server is running: npm start');
    logger.info('2. Make sure frontend server is running: npm run client:dev');
    logger.info('3. Try logging in with these test credentials:');
    logger.info('   - Admin: 0700000000');
    logger.info('   - Client: 0712345678');
    logger.info('   - Provider: 0723456789');
    logger.info('4. Check browser console (F12) for any JavaScript errors');
    logger.info('5. Check Network tab in browser dev tools for API call details');
    
    process.exit(0);
  } catch (error) {
    logger.error('Login flow test failed:', error);
    process.exit(1);
  }
}

testLoginFlow();