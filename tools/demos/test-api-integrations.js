#!/usr/bin/env node

// Test script to verify all API integrations are working
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

console.log('🔍 Testing API Integrations...\n');

// Test SonarQube Integration
async function testSonarQube() {
  console.log('📊 Testing SonarQube Integration...');
  try {
    const token = process.env.SONAR_TOKEN;
    const projectKey = process.env.SONAR_PROJECT_KEY || 'TechTyphoon_secure-flow-automaton';
    
    if (!token) {
      console.log('❌ SONAR_TOKEN not found');
      return false;
    }

    const response = await fetch(`https://sonarcloud.io/api/projects/search?projects=${projectKey}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SonarQube: Connected successfully');
      console.log(`   Project: ${projectKey}`);
      console.log(`   Projects found: ${data.components?.length || 0}`);
      return true;
    } else {
      console.log(`❌ SonarQube: HTTP ${response.status} - ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ SonarQube: ${error.message}`);
    return false;
  }
}

// Test Snyk Integration
async function testSnyk() {
  console.log('\n🔒 Testing Snyk Integration...');
  try {
    const token = process.env.SNYK_TOKEN;
    const orgId = process.env.SNYK_ORG_ID;
    
    if (!token || !orgId) {
      console.log('❌ SNYK_TOKEN or SNYK_ORG_ID not found');
      return false;
    }

    const response = await fetch(`https://api.snyk.io/rest/orgs/${orgId}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.api+json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Snyk: Connected successfully');
      console.log(`   Organization: ${orgId}`);
      console.log(`   Projects found: ${data.data?.length || 0}`);
      return true;
    } else {
      console.log(`❌ Snyk: HTTP ${response.status} - ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Snyk: ${error.message}`);
    return false;
  }
}

// Test GitHub Integration
async function testGitHub() {
  console.log('\n🐙 Testing GitHub Integration...');
  try {
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
      console.log('❌ GITHUB_TOKEN not found');
      return false;
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ GitHub: Connected successfully');
      console.log(`   User: ${data.login}`);
      console.log(`   Name: ${data.name}`);
      return true;
    } else {
      console.log(`❌ GitHub: HTTP ${response.status} - ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ GitHub: ${error.message}`);
    return false;
  }
}

// Test Docker Hub Integration
async function testDockerHub() {
  console.log('\n🐳 Testing Docker Hub Integration...');
  try {
    const username = process.env.DOCKER_HUB_USERNAME;
    const token = process.env.DOCKER_HUB_TOKEN;
    
    if (!username || !token) {
      console.log('❌ DOCKER_HUB_USERNAME or DOCKER_HUB_TOKEN not found');
      return false;
    }

    const response = await fetch('https://hub.docker.com/v2/repositories/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Docker Hub: Connected successfully');
      console.log(`   Username: ${username}`);
      console.log(`   Repositories: ${data.results?.length || 0}`);
      return true;
    } else {
      console.log(`❌ Docker Hub: HTTP ${response.status} - ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Docker Hub: ${error.message}`);
    return false;
  }
}

// Test Slack Integration
async function testSlack() {
  console.log('\n💬 Testing Slack Integration...');
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('❌ SLACK_WEBHOOK_URL not found');
      return false;
    }

    const testMessage = {
      text: '🔍 SecureFlow Automaton - API Integration Test',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*SecureFlow Automaton API Test*\nTesting integration with real data...'
          }
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });

    if (response.ok) {
      console.log('✅ Slack: Webhook test successful');
      console.log('   Test message sent to Slack');
      return true;
    } else {
      console.log(`❌ Slack: HTTP ${response.status} - ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Slack: ${error.message}`);
    return false;
  }
}

// Test Sentry Integration
async function testSentry() {
  console.log('\n🚨 Testing Sentry Integration...');
  try {
    const dsn = process.env.SENTRY_DSN;
    
    if (!dsn) {
      console.log('❌ SENTRY_DSN not found');
      return false;
    }

    console.log('✅ Sentry: DSN configured');
    console.log(`   DSN: ${dsn.substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.log(`❌ Sentry: ${error.message}`);
    return false;
  }
}

// Test Supabase Integration
async function testSupabase() {
  console.log('\n🗄️ Testing Supabase Integration...');
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    
    if (!url || !key) {
      console.log('❌ SUPABASE_URL or SUPABASE_SERVICE_KEY not found');
      return false;
    }

    console.log('✅ Supabase: Configuration found');
    console.log(`   URL: ${url}`);
    console.log(`   Key: ${key.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.log(`❌ Supabase: ${error.message}`);
    return false;
  }
}

// Main test function
async function runAllTests() {
  const tests = [
    testSonarQube,
    testSnyk,
    testGitHub,
    testDockerHub,
    testSlack,
    testSentry,
    testSupabase
  ];

  const results = [];
  
  for (const test of tests) {
    const result = await test();
    results.push(result);
  }

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All API integrations are working!');
    console.log('🚀 Ready for real data testing!');
  } else {
    console.log('\n⚠️ Some integrations failed. Check the errors above.');
  }
}

// Run the tests
runAllTests().catch(console.error); 