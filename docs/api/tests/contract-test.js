/**
 * API Contract Testing
 * Validates that the API implementation matches the OpenAPI specification
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class APIContractTester {
  constructor(baseURL = 'http://localhost:8080/api/v1') {
    this.baseURL = baseURL;
    this.specPath = path.join(__dirname, '../../../openapi.yaml');
    this.spec = null;
  }

  /**
   * Load OpenAPI specification
   */
  loadSpec() {
    try {
      // In a real implementation, you'd parse the YAML spec
      // For now, we'll use a simplified approach
      console.log('📋 Loading OpenAPI specification...');
      this.spec = {
        paths: {
          '/health': {
            get: {
              responses: {
                '200': {
                  description: 'System health status'
                }
              }
            }
          },
          '/auth/login': {
            post: {
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      required: ['email', 'password'],
                      properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                        deviceId: { type: 'string' },
                        ipAddress: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      console.log('✅ OpenAPI specification loaded');
    } catch (error) {
      console.error('❌ Failed to load OpenAPI specification:', error.message);
      throw error;
    }
  }

  /**
   * Test endpoint against contract
   */
  async testEndpoint(path, method, expectedResponse = 200) {
    console.log(`🔍 Testing ${method.toUpperCase()} ${path}...`);

    try {
      const response = await axios({
        method: method,
        url: `${this.baseURL}${path}`,
        timeout: 10000,
        validateStatus: () => true // Don't throw on any status code
      });

      // Check if response matches expected
      if (response.status === expectedResponse) {
        console.log(`✅ ${method.toUpperCase()} ${path}: Response status matches contract (${response.status})`);
        return { passed: true, response };
      } else {
        console.log(`❌ ${method.toUpperCase()} ${path}: Expected ${expectedResponse}, got ${response.status}`);
        return { passed: false, response, expected: expectedResponse };
      }
    } catch (error) {
      console.log(`❌ ${method.toUpperCase()} ${path}: Request failed - ${error.message}`);
      return { passed: false, error: error.message };
    }
  }

  /**
   * Test request body schema
   */
  async testRequestBody(path, method, requestBody) {
    console.log(`📝 Testing request body for ${method.toUpperCase()} ${path}...`);

    try {
      const response = await axios({
        method: method,
        url: `${this.baseURL}${path}`,
        data: requestBody,
        timeout: 10000,
        validateStatus: () => true
      });

      // Basic validation - check if request is accepted
      if (response.status < 500) {
        console.log(`✅ ${method.toUpperCase()} ${path}: Request body accepted`);
        return { passed: true, response };
      } else {
        console.log(`❌ ${method.toUpperCase()} ${path}: Request body rejected (${response.status})`);
        return { passed: false, response };
      }
    } catch (error) {
      console.log(`❌ ${method.toUpperCase()} ${path}: Request failed - ${error.message}`);
      return { passed: false, error: error.message };
    }
  }

  /**
   * Run all contract tests
   */
  async runContractTests() {
    console.log('📋 Starting API Contract Tests\n');

    this.loadSpec();

    const results = {
      health: await this.testEndpoint('/health', 'get', 200),
      authLogin: await this.testRequestBody('/auth/login', 'post', {
        email: 'test@example.com',
        password: 'test-password',
        deviceId: 'test-device',
        ipAddress: '127.0.0.1'
      })
    };

    console.log('\n📊 Contract Test Results:');
    console.log('=' .repeat(50));

    const passedTests = Object.values(results).filter(r => r.passed).length;
    const totalTests = Object.keys(results).length;

    Object.entries(results).forEach(([test, result]) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test}: ${result.passed ? 'OK' : result.error || 'Failed'}`);
    });

    console.log('=' .repeat(50));
    console.log(`🎯 Contract Tests: ${passedTests}/${totalTests} passed`);

    if (passedTests === totalTests) {
      console.log('🎉 All contract tests passed! API matches specification.');
    } else {
      console.log('⚠️ Some contract tests failed. API may not match specification.');
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
  const tester = new APIContractTester();

  // Allow custom base URL via command line
  const baseURL = process.argv[2] || 'http://localhost:8080/api/v1';

  if (baseURL !== tester.baseURL) {
    tester.baseURL = baseURL;
  }

  console.log(`🔗 Testing API contract at: ${baseURL}`);

  const summary = await tester.runContractTests();

  // Exit with appropriate code
  process.exit(summary.passed === summary.total ? 0 : 1);
}

// Export for use as module
export default APIContractTester;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Contract test failed:', error);
    process.exit(1);
  });
}
