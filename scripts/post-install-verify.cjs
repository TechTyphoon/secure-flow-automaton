#!/usr/bin/env node

/**
 * Cross-Platform Post-Install Verification Script
 * Ensures the project is properly set up on any system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// ANSI color codes for cross-platform terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Check if we're in a CI environment
const isCI = process.env.CI === 'true' || process.env.CI === '1';

// Disable colors in CI or if not TTY
const useColors = !isCI && process.stdout.isTTY;

function colorize(color, text) {
  return useColors ? `${colors[color]}${text}${colors.reset}` : text;
}

function log(message, color = 'reset') {
  console.log(colorize(color, message));
}

function logStep(message) {
  log(`▶ ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Platform detection
function getPlatform() {
  const platform = os.platform();
  switch (platform) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'linux';
    default:
      return 'unknown';
  }
}

// Check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Check if a directory exists
function dirExists(dirPath) {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

// Execute command safely
function execCommand(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    }).trim();
  } catch (error) {
    return null;
  }
}

// Check Node.js and npm versions
function checkNodeEnvironment() {
  logStep('Checking Node.js environment...');
  
  try {
    const nodeVersion = process.version;
    const npmVersion = execCommand('npm --version');
    
    logSuccess(`Node.js: ${nodeVersion}`);
    logSuccess(`npm: ${npmVersion || 'Unable to determine'}`);
    
    // Check if Node.js version meets requirements
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (majorVersion < 18) {
      logWarning(`Node.js ${nodeVersion} detected. This project requires Node.js 18+`);
      return false;
    }
    
    return true;
  } catch (error) {
    logError('Failed to check Node.js environment');
    return false;
  }
}

// Check project structure
function checkProjectStructure() {
  logStep('Verifying project structure...');
  
  const requiredFiles = [
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'index.html'
  ];
  
  const requiredDirs = [
    'src',
    'public'
  ];
  
  let allValid = true;
  
  // Check files
  for (const file of requiredFiles) {
    if (fileExists(file)) {
      logSuccess(`Found: ${file}`);
    } else {
      logError(`Missing: ${file}`);
      allValid = false;
    }
  }
  
  // Check directories
  for (const dir of requiredDirs) {
    if (dirExists(dir)) {
      logSuccess(`Found: ${dir}/`);
    } else {
      logError(`Missing: ${dir}/`);
      allValid = false;
    }
  }
  
  return allValid;
}

// Check dependencies
function checkDependencies() {
  logStep('Checking dependencies...');
  
  if (!dirExists('node_modules')) {
    logError('node_modules directory not found');
    return false;
  }
  
  const criticalDeps = [
    'react',
    'react-dom',
    'typescript',
    'vite',
    '@vitejs/plugin-react-swc'
  ];
  
  let allValid = true;
  
  for (const dep of criticalDeps) {
    const depPath = path.join('node_modules', dep);
    if (dirExists(depPath)) {
      logSuccess(`Dependency: ${dep}`);
    } else {
      logError(`Missing dependency: ${dep}`);
      allValid = false;
    }
  }
  
  return allValid;
}

// Setup environment file
function setupEnvironment() {
  logStep('Setting up environment configuration...');
  
  if (!fileExists('.env') && fileExists('.env.example')) {
    try {
      fs.copyFileSync('.env.example', '.env');
      logSuccess('Created .env file from .env.example');
      logWarning('Please update .env with your actual configuration values');
    } catch (error) {
      logError('Failed to create .env file');
      return false;
    }
  } else if (fileExists('.env')) {
    logInfo('.env file already exists');
  } else {
    logWarning('No .env.example found, creating basic .env file');
    const basicEnv = `# Basic configuration for SecureFlow Automaton
VITE_APP_NAME="SecureFlow Automaton"
VITE_APP_VERSION="1.0.0"
NODE_ENV=development
PORT=8080
HOST=0.0.0.0
`;
    try {
      fs.writeFileSync('.env', basicEnv);
      logSuccess('Created basic .env file');
    } catch (error) {
      logError('Failed to create .env file');
      return false;
    }
  }
  
  return true;
}

// Create necessary directories
function createDirectories() {
  logStep('Creating necessary directories...');
  
  const dirs = ['logs', 'temp', 'coverage'];
  
  for (const dir of dirs) {
    try {
      if (!dirExists(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logSuccess(`Created: ${dir}/`);
      } else {
        logInfo(`Already exists: ${dir}/`);
      }
    } catch (error) {
      logWarning(`Failed to create: ${dir}/`);
    }
  }
  
  return true;
}

// Test TypeScript compilation
function testTypeScript() {
  logStep('Testing TypeScript compilation...');
  
  const result = execCommand('npx tsc --noEmit --skipLibCheck');
  if (result !== null) {
    logSuccess('TypeScript compilation check passed');
    return true;
  } else {
    logWarning('TypeScript compilation check failed (may need configuration)');
    return false;
  }
}

// Test build process
function testBuild() {
  logStep('Testing build process...');
  
  logInfo('Running quick build test (this may take a moment)...');
  
  // Set a timeout for the build process
  try {
    const result = execCommand('npm run build', { 
      timeout: 120000, // 2 minutes timeout
      stdio: 'pipe'
    });
    
    if (dirExists('dist')) {
      logSuccess('Build test passed - dist directory created');
      return true;
    } else {
      logWarning('Build completed but dist directory not found');
      return false;
    }
  } catch (error) {
    logWarning('Build test failed or timed out');
    return false;
  }
}

// Generate system report
function generateSystemReport() {
  logStep('Generating system report...');
  
  const platform = getPlatform();
  const nodeVersion = process.version;
  const npmVersion = execCommand('npm --version') || 'Unknown';
  const architecture = os.arch();
  const totalMemory = Math.round(os.totalmem() / 1024 / 1024 / 1024);
  const freeMemory = Math.round(os.freemem() / 1024 / 1024 / 1024);
  
  const report = `
System Information:
- Platform: ${platform} (${architecture})
- Node.js: ${nodeVersion}
- npm: ${npmVersion}
- Memory: ${freeMemory}GB free / ${totalMemory}GB total
- Working Directory: ${process.cwd()}
- Timestamp: ${new Date().toISOString()}
`;
  
  try {
    fs.writeFileSync('system-report.txt', report);
    logSuccess('System report saved to system-report.txt');
  } catch (error) {
    logWarning('Failed to save system report');
  }
  
  logInfo(`Platform: ${platform}`);
  logInfo(`Memory: ${freeMemory}GB free / ${totalMemory}GB total`);
}

// Show next steps
function showNextSteps() {
  console.log();
  log('╔══════════════════════════════════════════════════════════════╗', 'green');
  log('║                    🎉 Setup Complete! 🎉                     ║', 'green');
  log('╚══════════════════════════════════════════════════════════════╝', 'green');
  console.log();
  
  log('Next steps:', 'cyan');
  console.log();
  log('1. Update configuration:', 'blue');
  log('   nano .env (or use your preferred editor)', 'yellow');
  console.log();
  log('2. Start development server:', 'blue');
  log('   npm run dev', 'yellow');
  console.log();
  log('3. Open in browser:', 'blue');
  log('   http://localhost:8080', 'yellow');
  console.log();
  log('4. Available commands:', 'blue');
  log('   npm run build         # Build for production', 'yellow');
  log('   npm run test          # Run tests', 'yellow');
  log('   npm run lint          # Check code quality', 'yellow');
  log('   npm run format        # Format code', 'yellow');
  console.log();
  log('🚀 Happy coding!', 'green');
  console.log();
}

// Main execution
function main() {
  console.log();
  log('╔══════════════════════════════════════════════════════════════╗', 'magenta');
  log('║  🛡️  SecureFlow Automaton - Post-Install Verification  🛡️   ║', 'magenta');
  log('╚══════════════════════════════════════════════════════════════╝', 'magenta');
  console.log();
  
  let success = true;
  
  // Run all checks
  success &= checkNodeEnvironment();
  success &= checkProjectStructure();
  success &= checkDependencies();
  success &= setupEnvironment();
  success &= createDirectories();
  
  // Optional checks (don't fail on these)
  testTypeScript();
  
  // Generate system report
  generateSystemReport();
  
  if (success) {
    logSuccess('All critical checks passed! 🎉');
    showNextSteps();
    process.exit(0);
  } else {
    logError('Some critical checks failed. Please review the output above.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkNodeEnvironment,
  checkProjectStructure,
  checkDependencies,
  setupEnvironment,
  createDirectories,
  testTypeScript,
  generateSystemReport
};
