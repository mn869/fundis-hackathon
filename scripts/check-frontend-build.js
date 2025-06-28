const fs = require('fs');
const path = require('path');
const logger = require('../src/utils/logger');

async function checkFrontendBuild() {
  try {
    logger.info('🔍 Checking frontend build status...');
    
    const frontendDir = path.join(__dirname, '../frontend');
    const distDir = path.join(frontendDir, 'dist');
    const packageJsonPath = path.join(frontendDir, 'package.json');
    
    // Check if frontend directory exists
    if (!fs.existsSync(frontendDir)) {
      logger.error('❌ Frontend directory not found');
      return false;
    }
    
    // Check package.json
    if (!fs.existsSync(packageJsonPath)) {
      logger.error('❌ Frontend package.json not found');
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    logger.info(`✅ Frontend package.json found - ${packageJson.name} v${packageJson.version}`);
    
    // Check node_modules
    const nodeModulesPath = path.join(frontendDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      logger.warn('⚠️  Frontend node_modules not found - run: cd frontend && npm install');
    } else {
      logger.info('✅ Frontend node_modules found');
    }
    
    // Check if build exists
    if (!fs.existsSync(distDir)) {
      logger.warn('⚠️  Frontend build (dist) directory not found');
      logger.info('💡 Run: cd frontend && npm run build');
      return false;
    }
    
    // Check build contents
    const distContents = fs.readdirSync(distDir);
    logger.info(`✅ Frontend build found with ${distContents.length} files/folders`);
    
    // Check for essential files
    const essentialFiles = ['index.html', 'assets'];
    const missingFiles = essentialFiles.filter(file => !distContents.includes(file));
    
    if (missingFiles.length > 0) {
      logger.warn(`⚠️  Missing essential build files: ${missingFiles.join(', ')}`);
      return false;
    }
    
    // Check index.html content
    const indexHtmlPath = path.join(distDir, 'index.html');
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    
    if (indexHtml.includes('<div id="root">')) {
      logger.info('✅ React root element found in index.html');
    } else {
      logger.error('❌ React root element not found in index.html');
    }
    
    if (indexHtml.includes('type="module"')) {
      logger.info('✅ ES modules detected in build');
    }
    
    // Check assets directory
    const assetsDir = path.join(distDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const assets = fs.readdirSync(assetsDir);
      const jsFiles = assets.filter(file => file.endsWith('.js'));
      const cssFiles = assets.filter(file => file.endsWith('.css'));
      
      logger.info(`✅ Assets found: ${jsFiles.length} JS files, ${cssFiles.length} CSS files`);
      
      if (jsFiles.length === 0) {
        logger.error('❌ No JavaScript files found in assets');
        return false;
      }
    }
    
    // Check for common issues in source files
    logger.info('🔍 Checking source files for common issues...');
    
    const srcDir = path.join(frontendDir, 'src');
    const mainJsx = path.join(srcDir, 'main.jsx');
    
    if (fs.existsSync(mainJsx)) {
      const mainContent = fs.readFileSync(mainJsx, 'utf8');
      
      // Check imports
      if (mainContent.includes("from './store/index.ts'")) {
        logger.info('✅ Store import looks correct');
      } else if (mainContent.includes("from './store/index.js'")) {
        logger.warn('⚠️  Store import uses .js extension, should be .ts');
      }
      
      // Check React imports
      if (mainContent.includes("import React from 'react'")) {
        logger.info('✅ React import found');
      }
      
      // Check ReactDOM
      if (mainContent.includes("import ReactDOM from 'react-dom/client'")) {
        logger.info('✅ ReactDOM client import found');
      }
    }
    
    // Check store file
    const storeTs = path.join(srcDir, 'store', 'index.ts');
    const storeJs = path.join(srcDir, 'store', 'index.js');
    
    if (fs.existsSync(storeTs)) {
      logger.info('✅ TypeScript store file found');
    } else if (fs.existsSync(storeJs)) {
      logger.info('✅ JavaScript store file found');
    } else {
      logger.error('❌ Store file not found');
    }
    
    logger.info('🎉 Frontend build check completed');
    return true;
    
  } catch (error) {
    logger.error(`Frontend build check failed: ${error.message}`);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  checkFrontendBuild()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

module.exports = checkFrontendBuild;