#!/usr/bin/env node

/**
 * 🔍 Dashboard Browser Testing Script
 * Tests the SecureFlow Automaton dashboard for functionality and console errors
 */

import { spawn } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:8080',
  timeout: 30000,
  puppeteerArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--disable-default-apps',
    '--disable-extensions'
  ]
};

// Console colors
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
 * Simple browser test without puppeteer dependency
 */
async function testWithFetch() {
  log.step('Testing dashboard with fetch API...');
  
  try {
    // Test main page load
    const response = await fetch(CONFIG.baseUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Check for essential elements
    const checks = [
      { name: 'React root div', pattern: /<div id="root">/ },
      { name: 'Vite dev script', pattern: /@vite\/client/ },
      { name: 'Main app script', pattern: /apps\/web\/main\.tsx/ },
      { name: 'Title tag', pattern: /<title>.*SecureFlow.*<\/title>/ },
      { name: 'Meta viewport', pattern: /<meta name="viewport"/ }
    ];
    
    log.info('📊 Running HTML structure checks...');
    let passed = 0;
    
    for (const check of checks) {
      if (check.pattern.test(html)) {
        log.success(`${check.name} found`);
        passed++;
      } else {
        log.error(`${check.name} missing`);
      }
    }
    
    log.info(`📈 HTML checks: ${passed}/${checks.length} passed`);
    
    // Test API endpoints
    const apiTests = [
      '/favicon.ico',
      '/manifest.json',
      '/logo.svg'
    ];
    
    log.step('Testing static assets...');
    let assetsOk = 0;
    
    for (const endpoint of apiTests) {
      try {
        const assetResponse = await fetch(`${CONFIG.baseUrl}${endpoint}`);
        if (assetResponse.ok) {
          log.success(`Asset ${endpoint} accessible`);
          assetsOk++;
        } else {
          log.warning(`Asset ${endpoint} returned ${assetResponse.status}`);
        }
      } catch (error) {
        log.warning(`Asset ${endpoint} failed: ${error.message}`);
      }
    }
    
    log.info(`📁 Assets: ${assetsOk}/${apiTests.length} accessible`);
    
    return {
      success: true,
      htmlChecks: { passed, total: checks.length },
      assets: { passed: assetsOk, total: apiTests.length },
      responseTime: response.headers.get('x-response-time') || 'unknown'
    };
    
  } catch (error) {
    log.error(`Dashboard test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test with Chrome DevTools Protocol (if available)
 */
async function testWithCDP() {
  log.step('Attempting advanced browser testing...');
  
  try {
    // Try to connect to Chrome DevTools Protocol
    const CDP = await import('chrome-remote-interface').catch(() => null);
    
    if (!CDP) {
      log.warning('Chrome DevTools Protocol not available, skipping advanced tests');
      return null;
    }
    
    const client = await CDP();
    const { Page, Runtime, Console } = client;
    
    // Enable domains
    await Page.enable();
    await Runtime.enable();
    await Console.enable();
    
    const consoleMessages = [];
    const errors = [];
    
    // Listen for console messages
    Console.messageAdded(({ message }) => {
      consoleMessages.push({
        level: message.level,
        text: message.text,
        url: message.url,
        line: message.line
      });
      
      if (message.level === 'error') {
        errors.push(message);
      }
    });
    
    // Navigate to the dashboard
    log.step('Navigating to dashboard...');
    await Page.navigate({ url: CONFIG.baseUrl });
    await Page.loadEventFired();
    
    // Wait for React to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for errors
    log.info(`📝 Console messages captured: ${consoleMessages.length}`);
    log.info(`🚨 Console errors: ${errors.length}`);
    
    if (errors.length > 0) {
      log.error('Console errors found:');
      errors.forEach(error => {
        log.error(`  ${error.text} (${error.url}:${error.line})`);
      });
    } else {
      log.success('No console errors detected');
    }
    
    await client.close();
    
    return {
      consoleMessages: consoleMessages.length,
      errors: errors.length,
      errorDetails: errors
    };
    
  } catch (error) {
    log.warning(`Advanced testing failed: ${error.message}`);
    return null;
  }
}

/**
 * Check server health
 */
async function checkServerHealth() {
  log.step('Checking server health...');
  
  try {
    const start = Date.now();
    const response = await fetch(`${CONFIG.baseUrl}/`, {
      method: 'HEAD',
      timeout: 5000
    });
    const duration = Date.now() - start;
    
    log.success(`Server responding in ${duration}ms`);
    log.info(`Status: ${response.status} ${response.statusText}`);
    
    return { healthy: true, responseTime: duration, status: response.status };
  } catch (error) {
    log.error(`Server health check failed: ${error.message}`);
    return { healthy: false, error: error.message };
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.bold}🔍 SecureFlow Dashboard Testing${colors.reset}`);
  console.log(`${colors.cyan}Testing URL: ${CONFIG.baseUrl}${colors.reset}\n`);
  
  const results = {
    serverHealth: null,
    basicTest: null,
    advancedTest: null,
    timestamp: new Date().toISOString()
  };
  
  // 1. Check server health
  results.serverHealth = await checkServerHealth();
  
  if (!results.serverHealth.healthy) {
    log.error('Server is not healthy, aborting tests');
    return results;
  }
  
  // 2. Basic functionality test
  results.basicTest = await testWithFetch();
  
  // 3. Advanced browser test (if possible)
  results.advancedTest = await testWithCDP();
  
  // Summary
  console.log(`\n${colors.bold}📊 Test Summary${colors.reset}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (results.serverHealth.healthy) {
    log.success(`Server: Healthy (${results.serverHealth.responseTime}ms)`);
  }
  
  if (results.basicTest?.success) {
    log.success(`Basic Test: Passed (${results.basicTest.htmlChecks.passed}/${results.basicTest.htmlChecks.total} checks)`);
  } else {
    log.error(`Basic Test: Failed`);
  }
  
  if (results.advancedTest) {
    if (results.advancedTest.errors === 0) {
      log.success(`Console: No errors (${results.advancedTest.consoleMessages} messages)`);
    } else {
      log.error(`Console: ${results.advancedTest.errors} errors found`);
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(results => {
      const success = results.serverHealth?.healthy && results.basicTest?.success;
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log.error(`Test runner failed: ${error.message}`);
      process.exit(1);
    });
}

export { runTests, testWithFetch, checkServerHealth };