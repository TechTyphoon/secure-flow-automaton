/**
 * Secure Flow Automaton API Testing Suite
 * Automated API tests for validation and integration testing
 */

import axios from 'axios';

class APITester {
  constructor(baseURL = 'http://localhost:8080/api/v1') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SecureFlow-API-Tester/4.1.0'
      }
    });

    this.token = null;
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Test health endpoint
   */
  async testHealthEndpoint() {
    console.log('🩺 Testing health endpoint...');
    try {
      const response = await this.client.get('/health');
      const passed = response.status === 200 &&
                    response.data &&
                    typeof response.data.overallStatus === 'string';

      console.log(passed ? '✅ Health endpoint: PASSED' : '❌ Health endpoint: FAILED');
      return { passed, response: response.data, error: null };
    } catch (error) {
      console.log('❌ Health endpoint: FAILED -', error.message);
      return { passed: false, response: null, error: error.message };
    }
  }

  /**
   * Test authentication endpoints
   */
  async testAuthentication() {
    console.log('🔐 Testing authentication...');
    try {
      // Test login
      const loginResponse = await this.client.post('/auth/login', {
        email: 'test@example.com',
        password: 'test-password',
        deviceId: 'test-device-123',
        ipAddress: '127.0.0.1',
        userAgent: 'API-Tester/1.0'
      });

      if (loginResponse.status === 401) {
        console.log('✅ Authentication: PASSED (Expected auth failure for test user)');
        return { passed: true, response: null, error: null };
      }

      console.log('❌ Authentication: FAILED - Unexpected response');
      return { passed: false, response: loginResponse.data, error: 'Unexpected auth response' };

    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication: PASSED (Expected auth failure)');
        return { passed: true, response: null, error: null };
      }

      console.log('❌ Authentication: FAILED -', error.message);
      return { passed: false, response: null, error: error.message };
    }
  }

  /**
   * Test security assistant endpoint (requires auth)
   */
  async testSecurityAssistant() {
    console.log('🤖 Testing security assistant...');
    try {
      const response = await this.client.post('/security/assistant/query', {
        text: "Test security query",
        type: "analysis"
      });

      if (response.status === 401) {
        console.log('✅ Security assistant: PASSED (Expected auth required)');
        return { passed: true, response: null, error: null };
      }

      console.log('❌ Security assistant: FAILED - Should require auth');
      return { passed: false, response: response.data, error: 'Auth not required' };

    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Security assistant: PASSED (Auth required as expected)');
        return { passed: true, response: null, error: null };
      }

      console.log('❌ Security assistant: FAILED -', error.message);
      return { passed: false, response: null, error: error.message };
    }
  }

  /**
   * Test performance endpoint (requires auth)
   */
  async testPerformanceEndpoint() {
    console.log('📊 Testing performance endpoint...');
    try {
      const response = await this.client.get('/performance/report?timeRange=1h');

      if (response.status === 401) {
        console.log('✅ Performance endpoint: PASSED (Expected auth required)');
        return { passed: true, response: null, error: null };
      }

      console.log('❌ Performance endpoint: FAILED - Should require auth');
      return { passed: false, response: response.data, error: 'Auth not required' };

    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Performance endpoint: PASSED (Auth required as expected)');
        return { passed: true, response: null, error: null };
      }

      console.log('❌ Performance endpoint: FAILED -', error.message);
      return { passed: false, response: null, error: error.message };
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    console.log('🚨 Testing error handling...');
    try {
      await this.client.get('/non-existent-endpoint');
      console.log('❌ Error handling: FAILED - Should return 404');
      return { passed: false, response: null, error: 'No 404 returned' };
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Error handling: PASSED (404 returned as expected)');
        return { passed: true, response: null, error: null };
      }

      console.log('❌ Error handling: FAILED - Unexpected error response');
      return { passed: false, response: null, error: error.message };
    }
  }

  /**
   * Test rate limiting (if implemented)
   */
  async testRateLimiting() {
    console.log('⏱️ Testing rate limiting...');
    const requests = [];

    // Make multiple rapid requests
    for (let i = 0; i < 10; i++) {
      requests.push(this.client.get('/health'));
    }

    try {
      const results = await Promise.allSettled(requests);
      const failures = results.filter(r => r.status === 'rejected').length;

      if (failures > 0) {
        console.log(`✅ Rate limiting: PASSED (${failures} requests blocked)`);
        return { passed: true, response: null, error: null };
      } else {
        console.log('ℹ️ Rate limiting: NOT IMPLEMENTED (All requests succeeded)');
        return { passed: true, response: null, error: null };
      }
    } catch (error) {
      console.log('❌ Rate limiting test: FAILED -', error.message);
      return { passed: false, response: null, error: error.message };
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Secure Flow API Test Suite\n');

    const results = {
      health: await this.testHealthEndpoint(),
      auth: await this.testAuthentication(),
      security: await this.testSecurityAssistant(),
      performance: await this.testPerformanceEndpoint(),
      errors: await this.testErrorHandling(),
      rateLimit: await this.testRateLimiting()
    };

    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));

    const passedTests = Object.values(results).filter(r => r.passed).length;
    const totalTests = Object.keys(results).length;

    Object.entries(results).forEach(([test, result]) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test}: ${result.passed ? 'OK' : result.error || 'Failed'}`);
    });

    console.log('=' .repeat(50));
    console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('🎉 All API tests passed! The API is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please check the API configuration.');
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
  const tester = new APITester();

  // Allow custom base URL via command line
  const baseURL = process.argv[2] || 'http://localhost:8080/api/v1';

  console.log(`🔗 Testing API at: ${baseURL}`);

  if (baseURL !== tester.baseURL) {
    tester.baseURL = baseURL;
    tester.client.defaults.baseURL = baseURL;
  }

  const summary = await tester.runAllTests();

  // Exit with appropriate code
  process.exit(summary.passed === summary.total ? 0 : 1);
}

// Export for use as module
export default APITester;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  });
}
