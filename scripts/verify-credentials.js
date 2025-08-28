#!/usr/bin/env node

/**
 * Verify that all required credentials are configured
 */

import { config } from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

console.log('🔍 Verifying credentials configuration...\n');

let totalChecks = 0;
let passedChecks = 0;

// Check function
function checkCredential(name, value, isRequired = true) {
  totalChecks++;
  if (value && value !== '' && !value.includes('your_token_here') && !value.includes('your-')) {
    console.log(`✅ ${name}: Configured`);
    passedChecks++;
    return true;
  } else if (!isRequired) {
    console.log(`➖ ${name}: Optional (not configured)`);
    return false;
  } else {
    console.log(`❌ ${name}: Missing or invalid`);
    return false;
  }
}

// Check async service
async function checkService(name, testFunc) {
  totalChecks++;
  try {
    await testFunc();
    console.log(`✅ ${name}: Connected successfully`);
    passedChecks++;
    return true;
  } catch (error) {
    console.log(`❌ ${name}: Connection failed - ${error.message}`);
    return false;
  }
}

console.log('📋 Checking Required Credentials:\n');

// Database
checkCredential('VITE_SUPABASE_URL', process.env.VITE_SUPABASE_URL);
checkCredential('VITE_SUPABASE_ANON_KEY', process.env.VITE_SUPABASE_ANON_KEY);

// Security
checkCredential('JWT_SECRET', process.env.JWT_SECRET);
checkCredential('ENCRYPTION_KEY', process.env.ENCRYPTION_KEY);
checkCredential('SESSION_SECRET', process.env.SESSION_SECRET);

// SonarCloud
checkCredential('VITE_SONAR_TOKEN', process.env.VITE_SONAR_TOKEN);
checkCredential('VITE_SONAR_PROJECT_KEY', process.env.VITE_SONAR_PROJECT_KEY);

// Snyk
checkCredential('VITE_SNYK_TOKEN', process.env.VITE_SNYK_TOKEN);
checkCredential('VITE_SNYK_ORG_ID', process.env.VITE_SNYK_ORG_ID);

// GitHub
const hasGitHub = checkCredential('GITHUB_TOKEN', process.env.GITHUB_TOKEN);

// Slack
checkCredential('VITE_SLACK_WEBHOOK_URL', process.env.VITE_SLACK_WEBHOOK_URL, false);

console.log('\n📋 Checking Optional Services:\n');

// Optional services
checkCredential('VITE_TRADING_API_KEY', process.env.VITE_TRADING_API_KEY, false);
checkCredential('VITE_AWS_ACCESS_KEY_ID', process.env.VITE_AWS_ACCESS_KEY_ID, false);
checkCredential('VITE_DOCKER_TOKEN', process.env.VITE_DOCKER_TOKEN, false);
checkCredential('SENTRY_DSN', process.env.SENTRY_DSN, false);

console.log('\n🔌 Testing Service Connections:\n');

// Test Supabase connection
await checkService('Supabase Database', async () => {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  const { data, error } = await supabase.from('security_scans').select('count').limit(1);
  if (error) throw error;
});

// Test SonarCloud connection
if (process.env.VITE_SONAR_TOKEN && !process.env.VITE_SONAR_TOKEN.includes('your')) {
  await checkService('SonarCloud', async () => {
    const response = await axios.get(
      `${process.env.VITE_SONAR_URL}/api/project_analyses/search?project=${process.env.VITE_SONAR_PROJECT_KEY}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_SONAR_TOKEN}`
        }
      }
    );
  });
}

// Test Snyk connection
if (process.env.VITE_SNYK_TOKEN && !process.env.VITE_SNYK_TOKEN.includes('your')) {
  await checkService('Snyk', async () => {
    const response = await axios.get(
      'https://api.snyk.io/v1/user/me',
      {
        headers: {
          'Authorization': `token ${process.env.VITE_SNYK_TOKEN}`
        }
      }
    );
  });
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Configuration Summary:`);
console.log(`   Checks Passed: ${passedChecks}/${totalChecks}`);
console.log(`   Success Rate: ${Math.round((passedChecks/totalChecks) * 100)}%`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 All credentials are properly configured!');
  console.log('✅ Your application is ready for production deployment!');
} else if (passedChecks >= totalChecks * 0.8) {
  console.log('\n⚠️  Most credentials are configured.');
  console.log('   Missing items:');
  if (!hasGitHub) console.log('   - GitHub Token (needed for repository scanning)');
  console.log('\n   The application can run but some features may be limited.');
} else {
  console.log('\n❌ Several required credentials are missing.');
  console.log('   Please configure the missing items before deployment.');
}

console.log('\n' + '='.repeat(50));
process.exit(passedChecks === totalChecks ? 0 : 1);