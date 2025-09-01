#!/usr/bin/env node

console.log('🔍 Running post-install verification...');

// Skip verification in Docker build context to avoid dependency issues
if (process.env.DOCKER_BUILD === 'true') {
  console.log('🐳 Docker build detected - skipping post-install verification');
  process.exit(0);
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'apps/web/main.tsx',
  'apps/web/App.tsx',
  'apps/web/index.html'
];

let hasErrors = false;

// Check required files
console.log('\n📄 Checking required files...');
for (const file of requiredFiles) {
  const filePath = path.join(projectRoot, file);
  try {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ Missing: ${file}`);
      hasErrors = true;
    }
  } catch (error) {
    console.log(`❌ Error checking ${file}: ${error.message}`);
    hasErrors = true;
  }
}

// Generate system report
console.log('\n📊 Generating system report...');
try {
  const reportContent = `SecureFlow Automaton - System Report
Generated: ${new Date().toISOString()}

Environment:
- Node.js: ${process.version}
- Platform: ${process.platform}
- Architecture: ${process.arch}
- Working Directory: ${process.cwd()}

Verification Status: ${hasErrors ? 'FAILED' : 'PASSED'}
${hasErrors ? 'Some issues were found that need attention.' : 'All checks passed successfully!'}
`;

  fs.writeFileSync(path.join(projectRoot, 'system-report.txt'), reportContent);
  console.log('✅ System report generated');
} catch (error) {
  console.log(`❌ Error generating system report: ${error.message}`);
  hasErrors = true;
}

console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Post-install verification FAILED');
  process.exit(1);
} else {
  console.log('✅ Post-install verification PASSED');
}
console.log('='.repeat(50));
