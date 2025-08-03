#!/usr/bin/env node

/**
 * Security Integration Test Script
 * Tests the real API integrations we just implemented
 */

import { sonarQubeService } from './src/services/security/sonarqube.js';
import { snykService } from './src/services/security/snyk.js';
import { SecurityHealthMonitor } from './src/services/security/healthMonitor.js';
import { SecurityNotificationService } from './src/services/security/notifications.js';

console.log('🚀 SecureFlow Automaton - Security Integration Test');
console.log('=' .repeat(60));

async function testSecurityIntegrations() {
  const healthMonitor = new SecurityHealthMonitor();
  const notifications = new SecurityNotificationService();
  
  console.log('\n📊 1. Testing Service Health Monitoring...');
  try {
    const healthStatuses = await healthMonitor.checkAllServices();
    console.log('✅ Health monitoring working');
    
    healthStatuses.forEach(status => {
      const icon = status.status === 'healthy' ? '✅' : 
                   status.status === 'degraded' ? '⚠️' : '❌';
      console.log(`   ${icon} ${status.service}: ${status.status} (${status.message})`);
    });
    
    const systemHealth = healthMonitor.getOverallSystemHealth();
    console.log(`\n🏥 System Health: ${systemHealth.status.toUpperCase()}`);
    console.log(`   ${systemHealth.message}`);
    
  } catch (error) {
    console.error('❌ Health monitoring failed:', error.message);
  }

  console.log('\n🔍 2. Testing SonarQube Integration...');
  try {
    console.log('   📈 Getting project metrics...');
    const metrics = await sonarQubeService.getProjectMetrics();
    
    if (metrics && metrics.metrics) {
      console.log('   ✅ SonarQube integration working');
      console.log(`   📊 Project: ${metrics.component}`);
      console.log(`   🐛 Bugs: ${metrics.metrics.bugs || 'N/A'}`);
      console.log(`   🔐 Vulnerabilities: ${metrics.metrics.vulnerabilities || 'N/A'}`);
      console.log(`   📝 Code Smells: ${metrics.metrics.code_smells || 'N/A'}`);
      console.log(`   📊 Coverage: ${metrics.metrics.coverage || 'N/A'}%`);
    } else {
      console.log('   ⚠️  SonarQube using fallback data (API key may be invalid)');
    }
    
    const health = await sonarQubeService.getHealthStatus();
    console.log(`   🏥 Service Health: ${health.status} (${health.responseTime}ms)`);
    
  } catch (error) {
    console.error('   ❌ SonarQube test failed:', error.message);
  }

  console.log('\n🛡️  3. Testing Snyk Integration...');
  try {
    console.log('   📦 Getting projects...');
    const projects = await snykService.getProjects();
    
    if (projects && projects.length > 0) {
      console.log('   ✅ Snyk integration working');
      console.log(`   📁 Projects found: ${projects.length}`);
      
      console.log('   🔍 Running dependency scan...');
      const testResult = await snykService.testDependencies();
      
      if (testResult && testResult.summary) {
        console.log('   📊 Vulnerability Summary:');
        console.log(`      🔴 Critical: ${testResult.summary.critical}`);
        console.log(`      🟠 High: ${testResult.summary.high}`);
        console.log(`      🟡 Medium: ${testResult.summary.medium}`);  
        console.log(`      🟢 Low: ${testResult.summary.low}`);
        console.log(`      📦 Dependencies: ${testResult.dependencyCount}`);
      }
    } else {
      console.log('   ⚠️  Snyk using fallback data (API key may be invalid)');
    }
    
    const health = await snykService.getHealthStatus();
    console.log(`   🏥 Service Health: ${health.status} (${health.responseTime}ms)`);
    
  } catch (error) {
    console.error('   ❌ Snyk test failed:', error.message);
  }

  console.log('\n📢 4. Testing Slack Notifications...');
  try {
    const testAlert = {
      id: `test-${Date.now()}`,
      type: 'security_hotspot',
      severity: 'high',
      title: 'Integration Test Alert',
      description: 'This is a test alert to verify the Slack integration is working correctly. If you see this in your Slack channel, the integration is successful! 🎉',
      source: 'system',
      component: 'integration-test',
      createdAt: new Date().toISOString(),
    };
    
    console.log('   📤 Sending test alert to Slack...');
    const success = await notifications.sendAlert(testAlert);
    
    if (success) {
      console.log('   ✅ Slack notification sent successfully!');
      console.log('   👀 Check your #security-alerts channel for the test message');
    } else {
      console.log('   ⚠️  Slack notification failed (webhook may be invalid)');
    }
    
  } catch (error) {
    console.error('   ❌ Slack test failed:', error.message);
  }

  console.log('\n🎯 5. Integration Summary');
  console.log('=' .repeat(60));
  
  const envCheck = {
    sonar: !!process.env.SONAR_TOKEN,
    snyk: !!process.env.SNYK_TOKEN, 
    slack: !!process.env.SLACK_WEBHOOK_URL,
  };
  
  console.log('🔑 Environment Configuration:');
  console.log(`   SonarQube Token: ${envCheck.sonar ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Snyk Token: ${envCheck.snyk ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Slack Webhook: ${envCheck.slack ? '✅ Configured' : '❌ Missing'}`);
  
  const configuredServices = Object.values(envCheck).filter(Boolean).length;
  console.log(`\n📊 Overall Status: ${configuredServices}/3 services configured`);
  
  if (configuredServices === 3) {
    console.log('🎉 All security integrations are configured and ready!');
    console.log('🚀 Your SecureFlow Automaton is now running with real security data!');
  } else {
    console.log('⚠️  Some services are using fallback data.');
    console.log('💡 Update your .env.local file with missing API keys for full functionality.');
  }
  
  console.log('\n🌐 Dashboard URL: http://localhost:8080/');
  console.log('📊 Click the "Services" tab to see the service dashboard');
  console.log('🧪 Use the "Integration Tests" tab to test individual services');
}

// Run the tests
testSecurityIntegrations().catch(console.error);
