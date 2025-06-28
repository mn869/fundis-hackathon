# Browser Console Debugging Guide 🔍

## Quick Console Check Steps

### 1. Open Browser Developer Tools
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
- **Safari**: Press `Cmd+Option+I` (Mac) - Enable Developer menu first

### 2. Navigate to Console Tab
Look for the "Console" tab in the developer tools panel.

### 3. Check for Errors
Look for messages with red background or error icons (❌).

## Common JavaScript Errors to Look For

### ❌ Module Import/Export Errors
```
Uncaught SyntaxError: Cannot use import statement outside a module
Uncaught ReferenceError: exports is not defined
```
**Solution**: Check Vite configuration and ensure proper ES module setup.

### ❌ React/JSX Errors
```
Uncaught ReferenceError: React is not defined
Uncaught SyntaxError: Unexpected token '<'
```
**Solution**: Ensure React is imported and JSX transform is configured.

### ❌ API Connection Errors
```
Failed to fetch
CORS error
Network request failed
```
**Solution**: Check API server is running and CORS is configured.

### ❌ TypeScript Compilation Errors
```
TS2307: Cannot find module
TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```
**Solution**: Check TypeScript configuration and type definitions.

### ❌ Redux/State Management Errors
```
Cannot read property 'getState' of undefined
Actions must be plain objects
```
**Solution**: Check Redux store configuration and middleware setup.

## Network Tab Check

### 1. Go to Network Tab
Check for failed requests (red status codes).

### 2. Common Issues
- **404 errors**: Missing files or incorrect paths
- **500 errors**: Server-side issues
- **CORS errors**: Cross-origin request blocked

## Manual Testing Steps

### 1. Load the Application
Navigate to: `http://localhost:5173`

### 2. Check Page Load
- Does the page load completely?
- Are there any blank screens?
- Do you see the login form?

### 3. Test Interactions
- Try typing in the phone number field
- Click the login button
- Check if API calls are made

### 4. Check Console During Actions
- Monitor console while interacting
- Look for new errors when clicking buttons
- Check network requests

## Common Solutions

### 🔧 Clear Browser Cache
- Hard refresh: `Ctrl+F5` (Windows) / `Cmd+Shift+R` (Mac)
- Clear cache and hard reload in DevTools

### 🔧 Check Environment Variables
Ensure all required environment variables are set:
```bash
VITE_API_URL=http://localhost:3000
```

### 🔧 Restart Development Server
```bash
cd frontend
npm run dev
```

### 🔧 Rebuild Application
```bash
cd frontend
npm run build
npm run dev
```

### 🔧 Check Dependencies
```bash
cd frontend
npm install
```

## Debugging Commands

### Check Frontend Build
```bash
node scripts/check-frontend-build.js
```

### Test API Connection
```bash
curl http://localhost:3000/health
```

### Check Server Status
```bash
node scripts/check-server.js
```

## Expected Console Output (No Errors)

When everything is working correctly, you should see:
- No red error messages
- Successful API requests (200 status codes)
- React DevTools extension working
- Redux DevTools showing state changes

## Report Issues

If you find errors, please note:
1. **Error message** (exact text)
2. **When it occurs** (page load, button click, etc.)
3. **Browser and version**
4. **Steps to reproduce**

## Quick Fix Checklist

- [ ] Frontend server running (`npm run dev`)
- [ ] Backend server running (`npm start`)
- [ ] No build errors in terminal
- [ ] Browser cache cleared
- [ ] All dependencies installed
- [ ] Environment variables set
- [ ] No CORS errors in console
- [ ] API endpoints responding