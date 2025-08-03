#!/usr/bin/env node

// Real Data Validation Script
// This script validates that ALL services use real data only (no mock/demo data)

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

console.log('🔍 VALIDATING 100% REAL DATA CONFIGURATION...\n');

// Required API Keys for Real Data
const REQUIRED_TOKENS = {
  SONAR_TOKEN: process.env.SONAR_TOKEN,
  SNYK_TOKEN: process.env.SNYK_TOKEN,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  DOCKER_HUB_TOKEN: process.env.DOCKER_HUB_TOKEN,
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
};

// Test real SonarQube integration
async function validateSonarQube() {
  console.log('📊 Validating SonarQube Real Data...');
  
  if (!REQUIRED_TOKENS.SONAR_TOKEN) {
    throw new Error('❌ SONAR_TOKEN missing - required for real data');
  }

  const response = await fetch(`https://sonarcloud.io/api/projects/search?organization=techtyphoon&projects=TechTyphoon_secure-flow-automaton`, {
    headers: {
      'Authorization': `Bearer ${REQUIRED_TOKENS.SONAR_TOKEN}`,
    }
  });

  if (!response.ok) {
    throw new Error(`❌ SonarQube API failed: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ SonarQube: Real project data validated');
  return data;
}

// Test real Snyk integration
async function validateSnyk() {
  console.log('🔒 Validating Snyk Real Data...');
  
  if (!REQUIRED_TOKENS.SNYK_TOKEN) {
    throw new Error('❌ SNYK_TOKEN missing - required for real data');
  }

  const response = await fetch(`https://api.snyk.io/rest/orgs/${process.env.SNYK_ORG_ID}/projects?limit=10`, {
    headers: {
      'Authorization': `Bearer ${REQUIRED_TOKENS.SNYK_TOKEN}`,
      'Content-Type': 'application/vnd.api+json'
    }
  });

  if (!response.ok) {
    throw new Error(`❌ Snyk API failed: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ Snyk: Real vulnerability data validated');
  return data;
}

// Test real GitHub integration
async function validateGitHub() {
  console.log('🐙 Validating GitHub Real Data...');
  
  if (!REQUIRED_TOKENS.GITHUB_TOKEN) {
    throw new Error('❌ GITHUB_TOKEN missing - required for real data');
  }

  const response = await fetch('https://api.github.com/repos/TechTyphoon/secure-flow-automaton', {
    headers: {
      'Authorization': `Bearer ${REQUIRED_TOKENS.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    throw new Error(`❌ GitHub API failed: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ GitHub: Real repository data validated');
  return data;
}

// Validate Supabase real database
async function validateSupabase() {
  console.log('🗄️ Validating Supabase Real Database...');
  
  if (!REQUIRED_TOKENS.SUPABASE_URL || !REQUIRED_TOKENS.SUPABASE_SERVICE_KEY) {
    throw new Error('❌ Supabase credentials missing - required for real data');
  }

  const response = await fetch(`${REQUIRED_TOKENS.SUPABASE_URL}/rest/v1/security_scans?select=count`, {
    headers: {
      'apikey': REQUIRED_TOKENS.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${REQUIRED_TOKENS.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'count=exact'
    }
  });

  if (!response.ok) {
    throw new Error(`❌ Supabase database failed: ${response.status} - ${response.statusText}`);
  }

  console.log('✅ Supabase: Real database connection validated');
  return true;
}

// Validate notification systems
async function validateNotifications() {
  console.log('📢 Validating Real Notification Systems...');
  
  if (!REQUIRED_TOKENS.SLACK_WEBHOOK_URL) {
    throw new Error('❌ SLACK_WEBHOOK_URL missing - required for real notifications');
  }

  if (!REQUIRED_TOKENS.SENTRY_DSN) {
    throw new Error('❌ SENTRY_DSN missing - required for real error tracking');
  }

  console.log('✅ Notifications: Real notification systems configured');
  return true;
}

// Check for any remaining mock data references
async function scanForMockData() {
  console.log('🔍 Scanning for Mock Data References...');
  
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync('grep -r "mock\\|demo\\|fake" src/ --include="*.ts" --include="*.tsx" | grep -v "test\\|spec" | wc -l');
    const mockReferences = parseInt(stdout.trim());
    
    if (mockReferences > 0) {
      const { stdout: details } = await execAsync('grep -r "mock\\|demo\\|fake" src/ --include="*.ts" --include="*.tsx" | grep -v "test\\|spec" | head -5');
      console.log('⚠️ Found mock data references:');
      console.log(details);
      throw new Error(`❌ Found ${mockReferences} mock data references - must be removed for production`);
    }
    
    console.log('✅ No mock data references found');
    return true;
  } catch (error) {
    console.log('❌ Mock data scan failed:', error.message);
    throw error;
  }
}

// Main validation function
async function validateRealDataOnly() {
  console.log('🎯 PRODUCTION REAL DATA VALIDATION\n');
  console.log('====================================\n');

  const validations = [
    { name: 'SonarQube Real Data', fn: validateSonarQube },
    { name: 'Snyk Real Data', fn: validateSnyk },
    { name: 'GitHub Real Data', fn: validateGitHub },
    { name: 'Supabase Real Database', fn: validateSupabase },
    { name: 'Real Notification Systems', fn: validateNotifications },
    { name: 'Mock Data Removal', fn: scanForMockData },
  ];

  const results = [];
  
  for (const validation of validations) {
    try {
      console.log(`\n🔍 Testing: ${validation.name}...`);
      await validation.fn();
      results.push({ name: validation.name, status: 'PASS' });
    } catch (error) {
      console.log(`❌ ${validation.name}: ${error.message}`);
      results.push({ name: validation.name, status: 'FAIL', error: error.message });
    }
  }

  console.log('\n📊 VALIDATION SUMMARY');
  console.log('====================');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n📈 Score: ${passed}/${total} validations passed`);
  
  if (passed === total) {
    console.log('\n🎉 SUCCESS: 100% REAL DATA CONFIGURATION VALIDATED!');
    console.log('🚀 Project is ready for production with real data only!');
    return true;
  } else {
    console.log('\n❌ FAILED: Some validations failed');
    console.log('🔧 Fix the errors above and run validation again');
    return false;
  }
}

// Missing tokens guidance
function showMissingTokensGuide() {
  console.log('\n🔑 MISSING API TOKENS GUIDE');
  console.log('============================');
  
  const missing = Object.entries(REQUIRED_TOKENS)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.log('\n❌ Missing required tokens:');
    missing.forEach(token => {
      console.log(`   • ${token}`);
    });
    
    console.log('\n📋 How to get these tokens:');
    console.log('1. SonarQube: https://sonarcloud.io/account/security');
    console.log('2. Snyk: https://app.snyk.io/account/tokens');
    console.log('3. GitHub: https://github.com/settings/tokens');
    console.log('4. Docker Hub: https://hub.docker.com/settings/security');
    console.log('5. Slack: Create webhook in your Slack workspace');
    console.log('6. Sentry: https://sentry.io/settings/projects/');
    
    return false;
  }
  
  return true;
}

// Run validation
if (showMissingTokensGuide()) {
  validateRealDataOnly()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('💥 Validation failed:', error.message);
      process.exit(1);
    });
} else {
  console.log('\n🔧 Please configure missing tokens and run validation again');
  process.exit(1);
}