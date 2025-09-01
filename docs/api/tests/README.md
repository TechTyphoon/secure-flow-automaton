# API Testing Suite

Comprehensive automated testing suite for the Secure Flow Automaton API, including functional, contract, security, and performance testing.

## 📋 Overview

This testing suite provides multiple layers of API validation:

- **Functional Testing** - Validates API behavior and responses
- **Contract Testing** - Ensures API matches OpenAPI specification
- **Security Testing** - Tests authentication, authorization, and vulnerabilities
- **Performance Testing** - Measures response times, throughput, and scalability
- **CI/CD Integration** - Automated testing in GitHub Actions

## 🚀 Quick Start

### Running All Tests Locally

```bash
# Install dependencies
npm install

# Start the API server in one terminal
npm run start

# Run all API tests in another terminal
npm run test:integration

# Or run individual test suites
npm run test:api          # Functional tests
npm run test:contract     # Contract tests
npm run test:security     # Security tests
npm run test:performance  # Performance tests
```

### CI/CD Pipeline

Tests automatically run on:
- **Push to main/develop** branches
- **Pull requests** to main/develop
- **Manual workflow dispatch**

```bash
# View test results in GitHub Actions
# Go to Actions tab → API Testing workflow
```

## 🧪 Test Suites

### 1. Functional Tests (`api-test.js`)

Tests core API functionality and behavior:

```javascript
const tester = new APITester('http://localhost:8080/api/v1');
await tester.runAllTests();
```

**Tests Include:**
- ✅ Health endpoint validation
- ✅ Authentication flow testing
- ✅ Protected endpoint access control
- ✅ Error handling validation
- ✅ Rate limiting verification

### 2. Contract Tests (`contract-test.js`)

Validates API implementation against OpenAPI specification:

```javascript
const tester = new APIContractTester('http://localhost:8080/api/v1');
await tester.runContractTests();
```

**Tests Include:**
- ✅ Endpoint existence validation
- ✅ Request/response schema validation
- ✅ HTTP status code compliance
- ✅ Required parameter validation
- ✅ Response format verification

### 3. Security Tests (`security-test.js`)

Comprehensive security validation:

```javascript
const tester = new APISecurityTester('http://localhost:8080/api/v1');
await tester.runSecurityTests();
```

**Tests Include:**
- 🔐 **Authentication Bypass** - Ensures protected endpoints require auth
- 💉 **SQL Injection Protection** - Tests input sanitization
- 🕷️ **XSS Protection** - Validates script injection prevention
- ⏱️ **Rate Limiting** - Tests request throttling
- 🔒 **HTTPS Enforcement** - Validates secure connections
- 🛡️ **Security Headers** - Checks security header presence

### 4. Performance Tests (`performance-test.js`)

API performance and scalability testing:

```javascript
const tester = new APIPerformanceTester('http://localhost:8080/api/v1');
await tester.runPerformanceTests();
```

**Tests Include:**
- 📊 **Response Time Measurement** - Individual endpoint timing
- ⚡ **Load Testing** - Concurrent request handling
- 🧠 **Resource Usage** - Memory and CPU monitoring
- 🏃 **Stability Testing** - Sustained load validation
- 📈 **Throughput Analysis** - Requests per second metrics

## 📊 Test Results & Reporting

### Local Test Output

```
🚀 Starting API Functional Tests

🩺 Testing health endpoint...
✅ Health endpoint: PASSED

🔐 Testing authentication...
✅ Authentication: PASSED (Expected auth failure for test user)

🤖 Testing security assistant...
✅ Security assistant: PASSED (Expected auth required)

📊 Test Results Summary:
==================================================
✅ PASS auth: OK
✅ PASS security: OK
✅ PASS errors: OK
✅ PASS rateLimit: OK
==================================================
🎯 Overall: 4/4 tests passed
🎉 All API tests passed! The API is working correctly.
```

### CI/CD Test Reports

Test results are automatically uploaded as artifacts:

- **Functional Test Results** - `api-functional-test-results/`
- **Performance Test Results** - `api-performance-test-results/`
- **Test Summary** - `api-testing-summary/`

### Performance Metrics

```
📊 Performance Test Summary:
===========================================================
🕐 Average Response Time: 45ms
✅ Average Success Rate: 99.8%
🚀 Overall Throughput: 22.3 req/sec
🏃 Stability Success Rate: 100.0%
🏆 Performance Rating: Excellent
===========================================================
```

## 🔧 Configuration

### Environment Variables

```bash
# API Testing Configuration
API_BASE_URL=http://localhost:8080/api/v1
DOCS_BASE_URL=http://localhost:3001
TEST_TIMEOUT=300000
NODE_ENV=test

# Security Testing
JWT_SECRET=test-jwt-secret-key-for-ci-testing-only
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password
```

### Custom Test Configuration

```javascript
// Custom test configuration
const config = {
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 30000,
  retries: 3,
  concurrentRequests: 10,
  testDuration: 60000 // 1 minute
};

const tester = new APITester(config);
```

## 📈 CI/CD Integration

### Workflow Triggers

```yaml
on:
  push:
    branches: [ main, develop ]
    paths:
      - 'apps/web/**/*.ts'
      - 'apps/web/**/*.js'
      - 'docs/api/**'
      - 'openapi.yaml'
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:
    inputs:
      test_type:
        description: 'Type of tests to run'
        default: 'full'
        type: choice
        options: [full, smoke, regression, performance]
```

### Job Dependencies

```
validate-api-docs → start-api-server → [functional, documentation, contract, security] → cleanup
```

### Test Matrix

- **Ubuntu Latest** (Primary)
- **Node.js 18, 20, 21, 22**
- **Database Services** (Redis, PostgreSQL)
- **External Services** (Mocked for testing)

## 🐛 Debugging & Troubleshooting

### Common Issues

#### API Server Not Starting
```bash
# Check if port is available
lsof -i :8080

# Kill process using port
kill -9 $(lsof -t -i :8080)

# Restart with verbose logging
DEBUG=* npm run start
```

#### Test Timeouts
```bash
# Increase timeout
TEST_TIMEOUT=600000 npm run test:api

# Run specific test
npm run test:api -- --grep "health"
```

#### Database Connection Issues
```bash
# Check database status
docker ps | grep postgres

# Restart database
docker-compose restart postgres

# Run with database logging
LOG_LEVEL=debug npm run test:api
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=api-test:* npm run test:api

# Run with verbose output
VERBOSE=1 npm run test:performance

# Single test debugging
node docs/api/tests/api-test.js --debug
```

## 📋 Test Development

### Adding New Tests

1. **Create test file** in `docs/api/tests/`
2. **Extend base test class** or create new one
3. **Add npm script** in `package.json`
4. **Update CI/CD workflow** if needed
5. **Add to test integration** suite

### Test Structure

```javascript
class MyCustomTester {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async testCustomFeature() {
    // Test implementation
    return { passed: true, result: 'Custom test passed' };
  }

  async runTests() {
    const results = {
      customFeature: await this.testCustomFeature()
    };

    return this.generateReport(results);
  }
}
```

### Best Practices

- ✅ **Descriptive test names** - Clearly indicate what is being tested
- ✅ **Independent tests** - Each test should be self-contained
- ✅ **Proper cleanup** - Clean up resources after tests
- ✅ **Error handling** - Handle network and server errors gracefully
- ✅ **Performance considerations** - Avoid overwhelming the API
- ✅ **Documentation** - Document test purpose and expected behavior

## 📊 Metrics & Monitoring

### Test Metrics Tracked

- **Test Execution Time** - How long tests take to run
- **Success/Failure Rates** - Pass/fail percentages
- **Performance Benchmarks** - Response times and throughput
- **Resource Usage** - Memory and CPU consumption
- **Error Patterns** - Common failure modes

### Dashboard Integration

Test results can be integrated with monitoring dashboards:

```javascript
// Example: Send metrics to monitoring service
const metrics = {
  testSuite: 'api-functional',
  duration: testDuration,
  successRate: successRate,
  timestamp: new Date().toISOString()
};

await monitoringService.sendMetrics(metrics);
```

## 🔗 Related Documentation

- **[API Documentation](../README.md)** - Complete API reference
- **[OpenAPI Specification](../../openapi.yaml)** - Machine-readable API spec
- **[CI/CD Workflows](../../.github/workflows/)** - GitHub Actions configuration
- **[Performance Monitoring](../performance/README.md)** - Performance testing guide

## 🤝 Contributing

### Adding Tests

1. Follow the existing test structure
2. Add comprehensive documentation
3. Include error handling and edge cases
4. Update this README with new test information
5. Ensure tests work in CI/CD environment

### Reporting Issues

- Use GitHub Issues for bug reports
- Include test output and environment details
- Provide steps to reproduce issues
- Suggest improvements and new test cases

---

## 🎯 Summary

The API testing suite provides comprehensive validation of the Secure Flow Automaton API with:

- **4 Test Suites** - Functional, Contract, Security, Performance
- **CI/CD Integration** - Automated testing on every change
- **Detailed Reporting** - Comprehensive test results and metrics
- **Extensible Framework** - Easy to add new tests and features
- **Production Ready** - Robust error handling and monitoring

**Ready for production deployment with confidence!** 🚀
