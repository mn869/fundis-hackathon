const axios = require('axios');
const logger = require('../src/utils/logger');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testAPIEndpoints() {
  try {
    logger.info('🔍 Testing API endpoints...');
    logger.info(`Base URL: ${API_BASE_URL}`);

    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // Test cases
    const tests = [
      {
        name: 'Health Check',
        method: 'GET',
        url: '/health',
        expectedStatus: 200
      },
      {
        name: 'Database Health',
        method: 'GET',
        url: '/health/database',
        expectedStatus: 200
      },
      {
        name: 'Redis Health',
        method: 'GET',
        url: '/health/redis',
        expectedStatus: 200
      },
      {
        name: 'WhatsApp Health',
        method: 'GET',
        url: '/health/whatsapp',
        expectedStatus: 200
      },
      {
        name: 'API Documentation',
        method: 'GET',
        url: '/api/docs',
        expectedStatus: 200
      },
      {
        name: 'Admin Dashboard Stats (No Auth)',
        method: 'GET',
        url: '/api/admin/dashboard',
        expectedStatus: 401 // Should require authentication
      },
      {
        name: 'Get Providers',
        method: 'GET',
        url: '/api/providers',
        expectedStatus: 200
      },
      {
        name: 'Login Endpoint',
        method: 'POST',
        url: '/api/auth/login',
        data: { phoneNumber: '0700000000' },
        expectedStatus: 200
      }
    ];

    // Run tests
    for (const test of tests) {
      try {
        const config = {
          method: test.method,
          url: `${API_BASE_URL}${test.url}`,
          timeout: 10000,
          validateStatus: () => true // Don't throw on any status code
        };

        if (test.data) {
          config.data = test.data;
        }

        const response = await axios(config);
        
        const passed = response.status === test.expectedStatus;
        
        results.tests.push({
          name: test.name,
          status: response.status,
          expected: test.expectedStatus,
          passed,
          data: response.data
        });

        if (passed) {
          results.passed++;
          logger.info(`✅ ${test.name}: ${response.status} (Expected: ${test.expectedStatus})`);
        } else {
          results.failed++;
          logger.warn(`❌ ${test.name}: ${response.status} (Expected: ${test.expectedStatus})`);
        }

      } catch (error) {
        results.failed++;
        results.tests.push({
          name: test.name,
          status: 'ERROR',
          expected: test.expectedStatus,
          passed: false,
          error: error.message
        });
        logger.error(`❌ ${test.name}: ${error.message}`);
      }
    }

    // Test authenticated endpoint
    try {
      logger.info('\n🔐 Testing authenticated endpoints...');
      
      // First login to get token
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        phoneNumber: '0700000000'
      });

      if (loginResponse.status === 200 && loginResponse.data.data.token) {
        const token = loginResponse.data.data.token;
        logger.info('✅ Login successful, testing authenticated endpoints...');

        // Test admin dashboard with token
        const dashboardResponse = await axios.get(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (dashboardResponse.status === 200) {
          logger.info('✅ Admin dashboard accessible with authentication');
          results.passed++;
        } else {
          logger.warn(`❌ Admin dashboard failed: ${dashboardResponse.status}`);
          results.failed++;
        }

        // Test user profile
        const profileResponse = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (profileResponse.status === 200) {
          logger.info('✅ User profile accessible with authentication');
          logger.info(`   User: ${profileResponse.data.data.user.name} (${profileResponse.data.data.user.role})`);
          results.passed++;
        } else {
          logger.warn(`❌ User profile failed: ${profileResponse.status}`);
          results.failed++;
        }

      } else {
        logger.error('❌ Login failed, cannot test authenticated endpoints');
        results.failed += 2;
      }

    } catch (error) {
      logger.error(`❌ Authentication test failed: ${error.message}`);
      results.failed += 2;
    }

    // Summary
    logger.info('\n📊 API Test Results:');
    logger.info(`✅ Passed: ${results.passed}`);
    logger.info(`❌ Failed: ${results.failed}`);
    logger.info(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    if (results.failed === 0) {
      logger.info('\n🎉 All API tests passed! Backend is fully operational.');
    } else {
      logger.warn('\n⚠️  Some API tests failed. Check the logs above for details.');
    }

    // Test specific functionality
    logger.info('\n🧪 Testing specific functionality...');
    
    // Test provider listing
    try {
      const providersResponse = await axios.get(`${API_BASE_URL}/api/providers`);
      if (providersResponse.status === 200) {
        const providers = providersResponse.data.data.providers;
        logger.info(`✅ Found ${providers.length} service providers`);
        if (providers.length > 0) {
          logger.info(`   Sample: ${providers[0].businessName || providers[0].user?.name}`);
        }
      }
    } catch (error) {
      logger.error(`❌ Provider listing failed: ${error.message}`);
    }

    return results;

  } catch (error) {
    logger.error('API testing failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  testAPIEndpoints()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = testAPIEndpoints;