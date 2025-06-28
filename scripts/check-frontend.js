const puppeteer = require('puppeteer');
const logger = require('../src/utils/logger');

async function checkBrowserConsole() {
  let browser;
  try {
    logger.info('🔍 Checking browser console for JavaScript errors...');
    
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Collect console messages
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      
      consoleMessages.push({ type, text });
      
      if (type === 'error') {
        errors.push(text);
        logger.error(`❌ Console Error: ${text}`);
      } else if (type === 'warning') {
        logger.warn(`⚠️  Console Warning: ${text}`);
      } else {
        logger.info(`📝 Console ${type}: ${text}`);
      }
    });
    
    // Catch page errors
    page.on('pageerror', (error) => {
      errors.push(error.message);
      logger.error(`❌ Page Error: ${error.message}`);
    });
    
    // Navigate to the application
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    logger.info(`Navigating to: ${frontendUrl}`);
    
    try {
      await page.goto(frontendUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      logger.info('✅ Page loaded successfully');
      
      // Wait for React to load
      await page.waitForTimeout(3000);
      
      // Check if React app is mounted
      const reactRoot = await page.$('#root');
      if (reactRoot) {
        logger.info('✅ React root element found');
        
        // Check if content is rendered
        const content = await page.$eval('#root', el => el.innerHTML);
        if (content.trim().length > 0) {
          logger.info('✅ React app content rendered');
        } else {
          logger.warn('⚠️  React root is empty');
        }
      } else {
        logger.error('❌ React root element not found');
      }
      
      // Check for specific elements
      const loginForm = await page.$('form');
      if (loginForm) {
        logger.info('✅ Login form found');
      } else {
        logger.warn('⚠️  Login form not found');
      }
      
      // Test navigation
      logger.info('🧪 Testing navigation...');
      
      // Try to interact with the page
      const phoneInput = await page.$('input[name="phoneNumber"]');
      if (phoneInput) {
        logger.info('✅ Phone number input found');
        await phoneInput.type('0700000000');
        logger.info('✅ Successfully typed in phone input');
      }
      
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        logger.info('✅ Submit button found');
      }
      
    } catch (navigationError) {
      logger.error(`❌ Navigation failed: ${navigationError.message}`);
      errors.push(`Navigation error: ${navigationError.message}`);
    }
    
    // Summary
    logger.info('\n📊 Browser Console Check Results:');
    logger.info(`Total console messages: ${consoleMessages.length}`);
    logger.info(`Errors found: ${errors.length}`);
    logger.info(`Warnings: ${consoleMessages.filter(m => m.type === 'warning').length}`);
    
    if (errors.length === 0) {
      logger.info('🎉 No JavaScript errors found in browser console!');
    } else {
      logger.error('❌ JavaScript errors detected:');
      errors.forEach((error, index) => {
        logger.error(`  ${index + 1}. ${error}`);
      });
    }
    
    return {
      success: errors.length === 0,
      errors,
      consoleMessages
    };
    
  } catch (error) {
    logger.error(`Browser check failed: ${error.message}`);
    return {
      success: false,
      errors: [error.message],
      consoleMessages: []
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Fallback manual check function
async function manualBrowserCheck() {
  logger.info('🔍 Manual browser console check...');
  logger.info('Since Puppeteer is not available, please manually check:');
  logger.info('');
  logger.info('1. Open your browser and navigate to: http://localhost:5173');
  logger.info('2. Open Developer Tools (F12)');
  logger.info('3. Go to the Console tab');
  logger.info('4. Look for any red error messages');
  logger.info('5. Check the Network tab for failed requests');
  logger.info('');
  logger.info('Common issues to look for:');
  logger.info('- Module import/export errors');
  logger.info('- API connection failures');
  logger.info('- Missing dependencies');
  logger.info('- CORS errors');
  logger.info('- TypeScript compilation errors');
}

// Run if called directly
if (require.main === module) {
  checkBrowserConsole()
    .catch(() => {
      logger.warn('Puppeteer not available, falling back to manual check');
      return manualBrowserCheck();
    })
    .then(() => process.exit(0));
}

module.exports = { checkBrowserConsole, manualBrowserCheck };