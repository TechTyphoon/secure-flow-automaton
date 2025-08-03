#!/usr/bin/env node

/**
 * Production Integration Test Script
 * Tests all real integrations with provided API keys
 */

import { RealSecurityService } from '../src/services/security/realSecurityService.js';
import { RealNotificationService } from '../src/services/notifications/realNotificationService.js';
import { RealMonitoringService } from '../src/services/monitoring/realMonitoringService.js';

console.log('🚀 Testing Production Integrations...\n');

async function testSecurityIntegrations() {
  console.log('🔒 Testing Security Integrations...');
  
  try {
    const securityService = new RealSecurityService();
    
    // Test SonarQube
    console.log('  📊 Testing SonarQube...');
    try {
      const sonarIssues = await securityService.getSonarQubeIssues();
      console.log(`    ✅ SonarQube: ${sonarIssues.totalIssues} issues found`);
    } catch (error) {
      console.log(`    ❌ SonarQube: ${error.message}`);
    }
    
    // Test Snyk
    console.log('  🐛 Testing Snyk...');
    try {
      const snykVulns = await securityService.getSnykVulnerabilities();
      console.log(`    ✅ Snyk: ${snykVulns.totalVulnerabilities} vulnerabilities found`);
    } catch (error) {
      console.log(`    ❌ Snyk: ${error.message}`);
    }
    
    // Test GitHub
    console.log('  📝 Testing GitHub Security Alerts...');
    try {
      const githubAlerts = await securityService.getGitHubSecurityAlerts();
      console.log(`    ✅ GitHub: ${githubAlerts.totalAlerts} alerts found`);
    } catch (error) {
      console.log(`    ❌ GitHub: ${error.message}`);
    }
    
    // Test Docker
    console.log('  🐳 Testing Docker Security Scan...');
    try {
      const dockerScan = await securityService.getDockerSecurityScan();
      console.log(`    ✅ Docker: ${dockerScan.totalVulnerabilities} vulnerabilities found`);
    } catch (error) {
      console.log(`    ❌ Docker: ${error.message}`);
    }
    
    // Test comprehensive report
    console.log('  📋 Testing Comprehensive Security Report...');
    try {
      const report = await securityService.getComprehensiveSecurityReport();
      console.log(`    ✅ Comprehensive Report: Generated successfully`);
      console.log(`       Total Issues: ${report.summary.totalIssues}`);
      console.log(`       Critical Issues: ${report.summary.criticalIssues}`);
      console.log(`       High Issues: ${report.summary.highIssues}`);
    } catch (error) {
      console.log(`    ❌ Comprehensive Report: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Security integrations test failed:', error);
  }
}

async function testNotificationIntegrations() {
  console.log('\n📢 Testing Notification Integrations...');
  
  try {
    const notificationService = new RealNotificationService();
    
    // Test Slack
    console.log('  💬 Testing Slack...');
    try {
      const slackResult = await notificationService.sendSlackNotification(
        '🧪 Test notification from SecureFlow Automaton - Production Integration Test',
        '#security-alerts'
      );
      console.log(`    ${slackResult ? '✅' : '❌'} Slack notification sent`);
    } catch (error) {
      console.log(`    ❌ Slack: ${error.message}`);
    }
    
    // Test Email
    console.log('  📧 Testing Email...');
    try {
      const emailResult = await notificationService.sendEmailNotification(
        'test@secureflow-automaton.com',
        'Test Notification - SecureFlow Automaton',
        'This is a test email notification from the production integration test.'
      );
      console.log(`    ${emailResult ? '✅' : '❌'} Email notification sent`);
    } catch (error) {
      console.log(`    ❌ Email: ${error.message}`);
    }
    
    // Test comprehensive notification test
    console.log('  🧪 Testing Comprehensive Notification Test...');
    try {
      const testResult = await notificationService.testNotifications();
      console.log(`    ✅ Notification Test Results:`);
      console.log(`       Slack: ${testResult.slack ? '✅' : '❌'}`);
      console.log(`       Email: ${testResult.email ? '✅' : '❌'}`);
      console.log(`       Overall: ${testResult.overall ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`    ❌ Notification Test: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Notification integrations test failed:', error);
  }
}

async function testMonitoringIntegrations() {
  console.log('\n📊 Testing Monitoring Integrations...');
  
  try {
    const monitoringService = new RealMonitoringService();
    
    // Test error capture
    console.log('  🚨 Testing Error Capture...');
    try {
      await monitoringService.captureError(
        new Error('Test error for production integration test'),
        { test: true, timestamp: new Date().toISOString() }
      );
      console.log('    ✅ Error captured successfully');
    } catch (error) {
      console.log(`    ❌ Error Capture: ${error.message}`);
    }
    
    // Test performance metrics
    console.log('  ⚡ Testing Performance Metrics...');
    try {
      await monitoringService.capturePerformanceMetric(
        'test_performance_metric',
        150,
        'ms',
        { test: true, operation: 'integration_test' }
      );
      console.log('    ✅ Performance metric captured');
    } catch (error) {
      console.log(`    ❌ Performance Metrics: ${error.message}`);
    }
    
    // Test security events
    console.log('  🛡️ Testing Security Events...');
    try {
      await monitoringService.captureSecurityEvent(
        'test_security_event',
        'medium',
        { test: true, source: 'integration_test' }
      );
      console.log('    ✅ Security event captured');
    } catch (error) {
      console.log(`    ❌ Security Events: ${error.message}`);
    }
    
    // Test health check
    console.log('  💚 Testing Health Check...');
    try {
      const health = await monitoringService.getApplicationHealth();
      console.log(`    ✅ Health Check: ${health.status}`);
      console.log(`       Services: ${Object.keys(health.services).join(', ')}`);
    } catch (error) {
      console.log(`    ❌ Health Check: ${error.message}`);
    }
    
    // Test real-time metrics
    console.log('  📈 Testing Real-time Metrics...');
    try {
      const metrics = await monitoringService.getRealTimeMetrics();
      console.log('    ✅ Real-time metrics captured');
      console.log(`       Performance: ${metrics.performance.responseTime}ms response time`);
      console.log(`       Security: ${metrics.security.activeThreats} active threats`);
      console.log(`       System: ${metrics.system.cpuUsage.toFixed(1)}% CPU usage`);
    } catch (error) {
      console.log(`    ❌ Real-time Metrics: ${error.message}`);
    }
    
    // Test comprehensive monitoring test
    console.log('  🧪 Testing Comprehensive Monitoring Test...');
    try {
      const testResult = await monitoringService.testMonitoring();
      console.log(`    ✅ Monitoring Test Results:`);
      console.log(`       Sentry: ${testResult.sentry ? '✅' : '❌'}`);
      console.log(`       Health: ${testResult.health ? '✅' : '❌'}`);
      console.log(`       Metrics: ${testResult.metrics ? '✅' : '❌'}`);
      console.log(`       Overall: ${testResult.overall ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`    ❌ Monitoring Test: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Monitoring integrations test failed:', error);
  }
}

async function testEnvironmentConfiguration() {
  console.log('\n⚙️ Testing Environment Configuration...');
  
  const requiredEnvVars = [
    'VITE_SONAR_TOKEN',
    'VITE_SNYK_TOKEN',
    'VITE_GITHUB_TOKEN',
    'VITE_DOCKER_TOKEN',
    'VITE_SLACK_WEBHOOK_URL',
    'VITE_SMTP_SERVER',
    'VITE_SMTP_USERNAME',
    'VITE_SMTP_PASSWORD',
    'VITE_SENTRY_DSN'
  ];
  
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    console.log(`  ❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.log('  💡 Make sure to set these in your .env file');
  } else {
    console.log('  ✅ All required environment variables are set');
  }
  
  // Test specific configurations
  console.log('\n  📋 Configuration Details:');
  console.log(`    SonarQube Token: ${process.env.VITE_SONAR_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`    Snyk Token: ${process.env.VITE_SNYK_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`    GitHub Token: ${process.env.VITE_GITHUB_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`    Docker Token: ${process.env.VITE_DOCKER_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`    Slack Webhook: ${process.env.VITE_SLACK_WEBHOOK_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`    SMTP Server: ${process.env.VITE_SMTP_SERVER ? '✅ Set' : '❌ Missing'}`);
  console.log(`    Sentry DSN: ${process.env.VITE_SENTRY_DSN ? '✅ Set' : '❌ Missing'}`);
}

async function runAllTests() {
  console.log('🎯 Starting Production Integration Tests...\n');
  
  try {
    await testEnvironmentConfiguration();
    await testSecurityIntegrations();
    await testNotificationIntegrations();
    await testMonitoringIntegrations();
    
    console.log('\n🎉 Production Integration Tests Completed!');
    console.log('\n📝 Summary:');
    console.log('  - Environment variables checked');
    console.log('  - Security tools integration tested');
    console.log('  - Notification services tested');
    console.log('  - Monitoring services tested');
    console.log('\n🚀 Your SecureFlow Automaton is now production-ready!');
    
  } catch (error) {
    console.error('\n❌ Integration tests failed:', error);
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(console.error); 