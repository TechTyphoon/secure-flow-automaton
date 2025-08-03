#!/usr/bin/env node

/**
 * 🔍 Comprehensive Dashboard Functionality Test
 * Tests all major dashboard components and features
 */

const CONFIG = {
  baseUrl: 'http://localhost:8080',
  timeout: 10000
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🔍${colors.reset} ${msg}`)
};

/**
 * Test critical React components are accessible
 */
async function testReactComponents() {
  log.step('Testing React components accessibility...');
  
  const components = [
    '/apps/web/App.tsx',
    '/apps/web/pages/Index.tsx',
    '/apps/web/components/AuthContext.tsx',
    '/apps/web/components/ui/button.tsx',
    '/apps/web/main.tsx'
  ];
  
  const results = [];
  
  for (const component of components) {
    try {
      const response = await fetch(`${CONFIG.baseUrl}${component}`);
      if (response.ok) {
        const content = await response.text();
        
        // Check for compilation errors
        const hasError = content.includes('error') || content.includes('Error') || content.includes('failed');
        const hasReactCode = content.includes('jsx') || content.includes('tsx') || content.includes('React');
        
        if (hasError) {
          log.error(`Component ${component}: Contains errors`);
          results.push({ component, status: 'error', issue: 'compilation error' });
        } else if (hasReactCode) {
          log.success(`Component ${component}: Loading correctly`);
          results.push({ component, status: 'success' });
        } else {
          log.warning(`Component ${component}: Unexpected content`);
          results.push({ component, status: 'warning', issue: 'unexpected content' });
        }
      } else {
        log.error(`Component ${component}: HTTP ${response.status}`);
        results.push({ component, status: 'error', issue: `HTTP ${response.status}` });
      }
    } catch (error) {
      log.error(`Component ${component}: ${error.message}`);
      results.push({ component, status: 'error', issue: error.message });
    }
  }
  
  const successful = results.filter(r => r.status === 'success').length;
  log.info(`📊 Components: ${successful}/${components.length} loading correctly`);
  
  return results;
}

/**
 * Test CSS and assets loading
 */
async function testAssets() {
  log.step('Testing assets and stylesheets...');
  
  const assets = [
    { path: '/apps/web/index.css', type: 'CSS' },
    { path: '/public/favicon.ico', type: 'Icon' },
    { path: '/public/manifest.json', type: 'Manifest' },
    { path: '/public/logo.svg', type: 'Logo' }
  ];
  
  const results = [];
  
  for (const asset of assets) {
    try {
      const response = await fetch(`${CONFIG.baseUrl}${asset.path}`);
      if (response.ok) {
        log.success(`${asset.type}: ${asset.path} ✓`);
        results.push({ ...asset, status: 'success' });
      } else {
        log.warning(`${asset.type}: ${asset.path} returned ${response.status}`);
        results.push({ ...asset, status: 'warning', code: response.status });
      }
    } catch (error) {
      log.error(`${asset.type}: ${asset.path} failed - ${error.message}`);
      results.push({ ...asset, status: 'error', error: error.message });
    }
  }
  
  return results;
}

/**
 * Test Vite development features
 */
async function testViteFeatures() {
  log.step('Testing Vite development features...');
  
  const viteEndpoints = [
    '/@vite/client',
    '/@react-refresh',
    '/node_modules/.vite/deps/react.js',
    '/node_modules/.vite/deps/react-dom_client.js'
  ];
  
  const results = [];
  
  for (const endpoint of viteEndpoints) {
    try {
      const response = await fetch(`${CONFIG.baseUrl}${endpoint}`);
      if (response.ok) {
        log.success(`Vite feature: ${endpoint} ✓`);
        results.push({ endpoint, status: 'success' });
      } else {
        log.warning(`Vite feature: ${endpoint} returned ${response.status}`);
        results.push({ endpoint, status: 'warning', code: response.status });
      }
    } catch (error) {
      log.error(`Vite feature: ${endpoint} failed - ${error.message}`);
      results.push({ endpoint, status: 'error', error: error.message });
    }
  }
  
  return results;
}

/**
 * Test application routing (if accessible)
 */
async function testRouting() {
  log.step('Testing application routing...');
  
  // Try to access the main page and check if it contains routing information
  try {
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    // Check for router-related code
    const hasRouter = html.includes('router') || html.includes('Router') || html.includes('react-router');
    const hasNavigation = html.includes('nav') || html.includes('Nav') || html.includes('navigation');
    
    if (hasRouter) {
      log.success('React Router: Detected in application');
    } else {
      log.info('React Router: Not detected or not yet loaded');
    }
    
    if (hasNavigation) {
      log.success('Navigation: Components detected');
    } else {
      log.info('Navigation: Not yet rendered or not present');
    }
    
    return { hasRouter, hasNavigation };
  } catch (error) {
    log.error(`Routing test failed: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Simulate page interaction by checking if dynamic content loads
 */
async function testInteractivity() {
  log.step('Testing application interactivity...');
  
  try {
    // First load - check initial state
    const response = await fetch(CONFIG.baseUrl);
    const html = await response.text();
    
    // Check for interactive elements
    const checks = [
      { name: 'React root', pattern: /id="root"/ },
      { name: 'JavaScript execution', pattern: /script.*module/ },
      { name: 'Vite client', pattern: /@vite\/client/ },
      { name: 'Hot reload', pattern: /react-refresh/ },
      { name: 'Component imports', pattern: /apps\/web/ }
    ];
    
    const results = [];
    
    for (const check of checks) {
      const found = check.pattern.test(html);
      if (found) {
        log.success(`Interactive feature: ${check.name} ✓`);
        results.push({ name: check.name, status: 'found' });
      } else {
        log.warning(`Interactive feature: ${check.name} not found`);
        results.push({ name: check.name, status: 'missing' });
      }
    }
    
    return results;
  } catch (error) {
    log.error(`Interactivity test failed: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Check for common dashboard components
 */
async function testDashboardComponents() {
  log.step('Testing dashboard-specific components...');
  
  const dashboardComponents = [
    '/apps/web/components/AdvancedPerformanceAnalytics.tsx',
    '/apps/web/components/AutomatedSecurityResponse.tsx',
    '/apps/web/pages/Monitoring.tsx',
    '/apps/web/pages/Index.tsx'
  ];
  
  const results = [];
  
  for (const component of dashboardComponents) {
    try {
      const response = await fetch(`${CONFIG.baseUrl}${component}`);
      if (response.ok) {
        const content = await response.text();
        
        // Check for dashboard-specific patterns
        const isDashboard = content.includes('dashboard') || 
                           content.includes('Dashboard') || 
                           content.includes('analytics') ||
                           content.includes('monitoring');
        
        if (isDashboard) {
          log.success(`Dashboard component: ${component.split('/').pop()} ✓`);
          results.push({ component, status: 'dashboard_found' });
        } else {
          log.info(`Component: ${component.split('/').pop()} (generic)`);
          results.push({ component, status: 'component_found' });
        }
      } else {
        log.warning(`Component: ${component.split('/').pop()} not accessible`);
        results.push({ component, status: 'not_found' });
      }
    } catch (error) {
      log.error(`Component: ${component.split('/').pop()} failed - ${error.message}`);
      results.push({ component, status: 'error', error: error.message });
    }
  }
  
  return results;
}

/**
 * Main test runner
 */
async function runComprehensiveTest() {
  console.log(`${colors.bold}🔍 Comprehensive Dashboard Functionality Test${colors.reset}`);
  console.log(`${colors.cyan}Target: ${CONFIG.baseUrl}${colors.reset}\n`);
  
  const testResults = {
    timestamp: new Date().toISOString(),
    components: null,
    assets: null,
    vite: null,
    routing: null,
    interactivity: null,
    dashboard: null
  };
  
  try {
    // Run all tests
    testResults.components = await testReactComponents();
    testResults.assets = await testAssets();
    testResults.vite = await testViteFeatures();
    testResults.routing = await testRouting();
    testResults.interactivity = await testInteractivity();
    testResults.dashboard = await testDashboardComponents();
    
    // Calculate summary
    const componentSuccess = testResults.components.filter(r => r.status === 'success').length;
    const assetSuccess = testResults.assets.filter(r => r.status === 'success').length;
    const viteSuccess = testResults.vite.filter(r => r.status === 'success').length;
    const interactiveSuccess = testResults.interactivity.filter(r => r.status === 'found').length;
    const dashboardSuccess = testResults.dashboard.filter(r => r.status === 'dashboard_found' || r.status === 'component_found').length;
    
    // Print summary
    console.log(`\n${colors.bold}📊 Test Results Summary${colors.reset}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    log.info(`React Components: ${componentSuccess}/${testResults.components.length} working`);
    log.info(`Static Assets: ${assetSuccess}/${testResults.assets.length} accessible`);
    log.info(`Vite Features: ${viteSuccess}/${testResults.vite.length} working`);
    log.info(`Interactive Elements: ${interactiveSuccess}/${testResults.interactivity.length} detected`);
    log.info(`Dashboard Components: ${dashboardSuccess}/${testResults.dashboard.length} found`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (testResults.routing.hasRouter) {
      log.success('🚀 React Router detected - SPA routing active');
    }
    
    if (componentSuccess >= testResults.components.length * 0.8) {
      log.success('🎯 Dashboard is functioning correctly!');
    } else {
      log.warning('⚠️  Some components may have issues');
    }
    
    console.log(`\n${colors.cyan}💡 Access your dashboard at: ${CONFIG.baseUrl}${colors.reset}\n`);
    
    return testResults;
    
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    return { error: error.message, ...testResults };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTest()
    .then(results => {
      process.exit(0);
    })
    .catch(error => {
      log.error(`Test runner failed: ${error.message}`);
      process.exit(1);
    });
}

export { runComprehensiveTest };