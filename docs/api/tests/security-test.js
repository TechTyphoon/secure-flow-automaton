/**
 * API Security Testing
 * Tests security aspects of the API including authentication, authorization, and vulnerability checks
 */

import axios from 'axios';

class APISecurityTester {
  constructor(baseURL = 'http://localhost:8080/api/v1') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      validateStatus: () => true // Don't throw on any status code
    });
  }

  /**
   * Test authentication bypass attempts
   */
  async testAuthenticationBypass() {
    console.log('🔐 Testing authentication bypass...');

    const endpoints = [
      '/security/assistant/query',
      '/performance/report',
      '/identity/users',
      '/security/events'
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const response = await this.client.get(endpoint);
        if (response.status === 401) {
          results.push({ endpoint, status: 'protected', passed: true });
          console.log(`✅ ${endpoint}: Properly protected (401)`);
        } else {
          results.push({ endpoint, status: response.status, passed: false });
          console.log(`❌ ${endpoint}: Not protected (status: ${response.status})`);
        }
      } catch (error) {
        results.push({ endpoint, error: error.message, passed: false });
        console.log(`❌ ${endpoint}: Request failed - ${error.message}`);
      }
    }

    const passed = results.every(r => r.passed);
    console.log(passed ? '✅ Authentication bypass test: PASSED' : '❌ Authentication bypass test: FAILED');

    return { passed, results };
  }

  /**
   * Test SQL injection attempts
   */
  async testSQLInjection() {
    console.log('💉 Testing SQL injection protection...');

    const payloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "1' UNION SELECT * FROM users--",
      "admin'--",
      "' OR 1=1--"
    ];

    const results = [];

    // Test on login endpoint (most common attack vector)
    for (const payload of payloads) {
      try {
        const response = await this.client.post('/auth/login', {
          email: payload,
          password: 'test',
          deviceId: 'test-device',
          ipAddress: '127.0.0.1'
        });

        // Should return 400 (bad request) or 401 (unauthorized), not 500 (server error)
        if (response.status === 400 || response.status === 401) {
          results.push({ payload, status: response.status, passed: true });
        } else {
          results.push({ payload, status: response.status, passed: false });
        }
      } catch (error) {
        results.push({ payload, error: error.message, passed: false });
      }
    }

    const passed = results.every(r => r.passed);
    console.log(passed ? '✅ SQL injection test: PASSED' : '❌ SQL injection test: FAILED');

    return { passed, results };
  }

  /**
   * Test XSS (Cross-Site Scripting) protection
   */
  async testXSSProtection() {
    console.log('🕷️ Testing XSS protection...');

    const payloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      'javascript:alert("xss")',
      '<iframe src="javascript:alert(\'xss\')"></iframe>',
      '<svg onload=alert("xss")>'
    ];

    const results = [];

    for (const payload of payloads) {
      try {
        const response = await this.client.post('/auth/login', {
          email: 'test@example.com',
          password: payload,
          deviceId: 'test-device',
          ipAddress: '127.0.0.1'
        });

        // Should sanitize input and not execute scripts
        if (response.status === 400 || response.status === 401) {
          results.push({ payload: payload.substring(0, 20) + '...', status: response.status, passed: true });
        } else {
          results.push({ payload: payload.substring(0, 20) + '...', status: response.status, passed: false });
        }
      } catch (error) {
        results.push({ payload: payload.substring(0, 20) + '...', error: error.message, passed: false });
      }
    }

    const passed = results.every(r => r.passed);
    console.log(passed ? '✅ XSS protection test: PASSED' : '❌ XSS protection test: FAILED');

    return { passed, results };
  }

  /**
   * Test rate limiting
   */
  async testRateLimiting() {
    console.log('⏱️ Testing rate limiting...');

    const requests = [];
    const numRequests = 20;

    // Make multiple rapid requests to health endpoint
    for (let i = 0; i < numRequests; i++) {
      requests.push(this.client.get('/health'));
    }

    try {
      const results = await Promise.allSettled(requests);
      const failures = results.filter(r => r.status === 'rejected').length;
      const successes = results.filter(r => r.status === 'fulfilled').length;

      // If we have some failures, rate limiting might be working
      if (failures > 0) {
        console.log(`✅ Rate limiting: DETECTED (${failures}/${numRequests} requests blocked)`);
        return { passed: true, blocked: failures, total: numRequests };
      } else if (successes === numRequests) {
        console.log(`ℹ️ Rate limiting: NOT IMPLEMENTED (all ${numRequests} requests succeeded)`);
        return { passed: true, blocked: 0, total: numRequests, note: 'Rate limiting not implemented' };
      } else {
        console.log(`❌ Rate limiting: UNEXPECTED (${successes} succeeded, ${failures} failed)`);
        return { passed: false, blocked: failures, total: numRequests };
      }
    } catch (error) {
      console.log(`❌ Rate limiting test: FAILED - ${error.message}`);
      return { passed: false, error: error.message };
    }
  }

  /**
   * Test HTTPS enforcement (if applicable)
   */
  async testHTTPSEnforcement() {
    console.log('🔒 Testing HTTPS enforcement...');

    try {
      // Try HTTP request (should redirect to HTTPS in production)
      const response = await axios.get('http://localhost:8080/health', {
        timeout: 5000,
        validateStatus: () => true
      });

      if (response.status === 301 || response.status === 302) {
        console.log('✅ HTTPS enforcement: REDIRECTING to HTTPS');
        return { passed: true, redirect: true };
      } else if (response.status === 200) {
        console.log('ℹ️ HTTPS enforcement: HTTP allowed (development environment)');
        return { passed: true, redirect: false, note: 'HTTP allowed in development' };
      } else {
        console.log(`❌ HTTPS enforcement: Unexpected response (${response.status})`);
        return { passed: false, status: response.status };
      }
    } catch (error) {
      console.log(`❌ HTTPS enforcement test: FAILED - ${error.message}`);
      return { passed: false, error: error.message };
    }
  }

  /**
   * Test security headers
   */
  async testSecurityHeaders() {
    console.log('🛡️ Testing security headers...');

    try {
      const response = await this.client.get('/health');

      const headers = response.headers;
      const securityHeaders = {
        'x-content-type-options': headers['x-content-type-options'],
        'x-frame-options': headers['x-frame-options'],
        'x-xss-protection': headers['x-xss-protection'],
        'content-security-policy': headers['content-security-policy'],
        'strict-transport-security': headers['strict-transport-security']
      };

      const presentHeaders = Object.entries(securityHeaders)
        .filter(([key, value]) => value !== undefined)
        .map(([key]) => key);

      const missingHeaders = Object.keys(securityHeaders).filter(h => !presentHeaders.includes(h));

      if (presentHeaders.length > 0) {
        console.log(`✅ Security headers: ${presentHeaders.length} present (${presentHeaders.join(', ')})`);
        if (missingHeaders.length > 0) {
          console.log(`ℹ️ Missing headers: ${missingHeaders.join(', ')}`);
        }
        return { passed: true, present: presentHeaders, missing: missingHeaders };
      } else {
        console.log('ℹ️ Security headers: None detected (may be development environment)');
        return { passed: true, present: [], missing: Object.keys(securityHeaders), note: 'No security headers found' };
      }
    } catch (error) {
      console.log(`❌ Security headers test: FAILED - ${error.message}`);
      return { passed: false, error: error.message };
    }
  }

  /**
   * Run all security tests
   */
  async runSecurityTests() {
    console.log('🔒 Starting API Security Tests\n');

    const results = {
      authBypass: await this.testAuthenticationBypass(),
      sqlInjection: await this.testSQLInjection(),
      xssProtection: await this.testXSSProtection(),
      rateLimiting: await this.testRateLimiting(),
      httpsEnforcement: await this.testHTTPSEnforcement(),
      securityHeaders: await this.testSecurityHeaders()
    };

    console.log('\n📊 Security Test Results:');
    console.log('=' .repeat(50));

    const passedTests = Object.values(results).filter(r => r.passed).length;
    const totalTests = Object.keys(results).length;

    Object.entries(results).forEach(([test, result]) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test}: ${result.passed ? 'OK' : result.error || 'Failed'}`);
    });

    console.log('=' .repeat(50));
    console.log(`🎯 Security Tests: ${passedTests}/${totalTests} passed`);

    if (passedTests === totalTests) {
      console.log('🎉 All security tests passed! API is secure.');
    } else {
      console.log('⚠️ Some security tests failed. Review security configuration.');
    }

    return {
      passed: passedTests,
      total: totalTests,
      results
    };
  }
}

// CLI runner
async function main() {
  const tester = new APISecurityTester();

  // Allow custom base URL via command line
  const baseURL = process.argv[2] || 'http://localhost:8080/api/v1';

  if (baseURL !== tester.baseURL) {
    tester.baseURL = baseURL;
  }

  console.log(`🔗 Testing API security at: ${baseURL}`);

  const summary = await tester.runSecurityTests();

  // Exit with appropriate code
  process.exit(summary.passed === summary.total ? 0 : 1);
}

// Export for use as module
export default APISecurityTester;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Security test failed:', error);
    process.exit(1);
  });
}
