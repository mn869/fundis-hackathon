const fs = require('fs');
const path = require('path');
const logger = require('../src/utils/logger');

async function diagnoseFrontendIssues() {
  try {
    logger.info('🔍 Diagnosing frontend issues...');
    
    const frontendDir = path.join(__dirname, '../frontend');
    const issues = [];
    const warnings = [];
    
    // Check package.json dependencies
    const packageJsonPath = path.join(frontendDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check React version
      const reactVersion = packageJson.dependencies?.react;
      if (reactVersion) {
        logger.info(`✅ React version: ${reactVersion}`);
      } else {
        issues.push('React not found in dependencies');
      }
      
      // Check Vite
      const viteVersion = packageJson.devDependencies?.vite;
      if (viteVersion) {
        logger.info(`✅ Vite version: ${viteVersion}`);
      } else {
        warnings.push('Vite not found in devDependencies');
      }
      
      // Check TypeScript
      const hasTypeScript = packageJson.devDependencies?.typescript || 
                           packageJson.dependencies?.typescript;
      if (hasTypeScript) {
        logger.info(`✅ TypeScript detected`);
      }
    }
    
    // Check Vite config
    const viteConfigPath = path.join(frontendDir, 'vite.config.js');
    if (fs.existsSync(viteConfigPath)) {
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
      
      if (viteConfig.includes('@vitejs/plugin-react')) {
        logger.info('✅ React plugin configured in Vite');
      } else {
        issues.push('React plugin not found in Vite config');
      }
      
      if (viteConfig.includes('proxy')) {
        logger.info('✅ API proxy configured');
      } else {
        warnings.push('No API proxy found in Vite config');
      }
    } else {
      issues.push('vite.config.js not found');
    }
    
    // Check main entry point
    const mainJsxPath = path.join(frontendDir, 'src', 'main.jsx');
    if (fs.existsSync(mainJsxPath)) {
      const mainContent = fs.readFileSync(mainJsxPath, 'utf8');
      
      if (mainContent.includes('createRoot')) {
        logger.info('✅ React 18 createRoot API used');
      } else if (mainContent.includes('ReactDOM.render')) {
        warnings.push('Using legacy ReactDOM.render (consider upgrading to createRoot)');
      }
      
      if (mainContent.includes('StrictMode')) {
        logger.info('✅ React StrictMode enabled');
      }
      
      // Check store import
      if (mainContent.includes('./store/index.ts')) {
        logger.info('✅ Store import uses TypeScript file');
      } else if (mainContent.includes('./store/index.js')) {
        warnings.push('Store import uses JavaScript file extension');
      }
    } else {
      issues.push('main.jsx not found');
    }
    
    // Check App component
    const appJsxPath = path.join(frontendDir, 'src', 'App.jsx');
    if (fs.existsSync(appJsxPath)) {
      const appContent = fs.readFileSync(appJsxPath, 'utf8');
      
      if (appContent.includes('Routes') && appContent.includes('Route')) {
        logger.info('✅ React Router configured');
      }
      
      if (appContent.includes('useSelector')) {
        logger.info('✅ Redux integration detected');
      }
    } else {
      issues.push('App.jsx not found');
    }
    
    // Check store configuration
    const storeFiles = [
      path.join(frontendDir, 'src', 'store', 'index.ts'),
      path.join(frontendDir, 'src', 'store', 'index.js')
    ];
    
    let storeFound = false;
    for (const storePath of storeFiles) {
      if (fs.existsSync(storePath)) {
        storeFound = true;
        const storeContent = fs.readFileSync(storePath, 'utf8');
        
        if (storeContent.includes('configureStore')) {
          logger.info('✅ Redux Toolkit store configured');
        }
        
        if (storeContent.includes('authSlice')) {
          logger.info('✅ Auth slice found');
        }
        break;
      }
    }
    
    if (!storeFound) {
      issues.push('Redux store file not found');
    }
    
    // Check API utility
    const apiUtilPath = path.join(frontendDir, 'src', 'utils', 'api.js');
    if (fs.existsSync(apiUtilPath)) {
      const apiContent = fs.readFileSync(apiUtilPath, 'utf8');
      
      if (apiContent.includes('axios.create')) {
        logger.info('✅ Axios API client configured');
      }
      
      if (apiContent.includes('import.meta.env.PROD')) {
        logger.info('✅ Environment-based API URL configuration');
      }
    } else {
      warnings.push('API utility file not found');
    }
    
    // Check CSS/Tailwind
    const indexCssPath = path.join(frontendDir, 'src', 'index.css');
    if (fs.existsSync(indexCssPath)) {
      const cssContent = fs.readFileSync(indexCssPath, 'utf8');
      
      if (cssContent.includes('@tailwind')) {
        logger.info('✅ Tailwind CSS configured');
      }
    }
    
    // Check build output
    const distPath = path.join(frontendDir, 'dist');
    if (fs.existsSync(distPath)) {
      const distFiles = fs.readdirSync(distPath);
      
      if (distFiles.includes('index.html')) {
        logger.info('✅ Build output exists');
        
        // Check index.html
        const indexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
        
        if (indexHtml.includes('<div id="root">')) {
          logger.info('✅ React root element in build');
        }
        
        if (indexHtml.includes('type="module"')) {
          logger.info('✅ ES modules in build');
        }
      }
    } else {
      warnings.push('No build output found - run npm run build');
    }
    
    // Summary
    logger.info('\n📊 Frontend Diagnosis Summary:');
    logger.info(`Issues found: ${issues.length}`);
    logger.info(`Warnings: ${warnings.length}`);
    
    if (issues.length > 0) {
      logger.error('❌ Critical Issues:');
      issues.forEach((issue, index) => {
        logger.error(`  ${index + 1}. ${issue}`);
      });
    }
    
    if (warnings.length > 0) {
      logger.warn('⚠️  Warnings:');
      warnings.forEach((warning, index) => {
        logger.warn(`  ${index + 1}. ${warning}`);
      });
    }
    
    if (issues.length === 0) {
      logger.info('🎉 No critical issues found in frontend configuration!');
    }
    
    // Recommendations
    logger.info('\n💡 Recommendations:');
    
    if (issues.length > 0) {
      logger.info('1. Fix critical issues listed above');
      logger.info('2. Rebuild the frontend: cd frontend && npm run build');
    }
    
    if (warnings.length > 0) {
      logger.info('3. Address warnings for better performance');
    }
    
    logger.info('4. Test in browser console: Open http://localhost:5173 and check F12 console');
    logger.info('5. Use debug page: Open frontend/debug-console.html for detailed testing');
    
    return {
      issues,
      warnings,
      success: issues.length === 0
    };
    
  } catch (error) {
    logger.error(`Frontend diagnosis failed: ${error.message}`);
    return {
      issues: [error.message],
      warnings: [],
      success: false
    };
  }
}

// Run if called directly
if (require.main === module) {
  diagnoseFrontendIssues()
    .then((result) => process.exit(result.success ? 0 : 1))
    .catch(() => process.exit(1));
}

module.exports = diagnoseFrontendIssues;