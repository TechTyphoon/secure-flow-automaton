/**
 * API Performance Testing
 * Tests API performance, response times, and scalability
 */

import axios from 'axios';

class APIPerformanceTester {
  constructor(baseURL = 'http://localhost:8080/api/v1') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000 // 30 seconds for performance tests
    });
  }

  /**
   * Measure response time for a single request
   */
  async measureResponseTime(endpoint, method = 'GET', data = null) {
    const startTime = Date.now();

    try {
      const config = {
        method: method,
        url: endpoint
      };

      if (data && method !== 'GET') {
        config.data = data;
      }

      const response = await this.client.request(config);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        success: true,
        responseTime,
        status: response.status,
        size: JSON.stringify(response.data).length
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        success: false,
        responseTime,
        error: error.message,
        status: error.response?.status || 0
      };
    }
  }

  /**
   * Run load test with multiple concurrent requests
   */
  async runLoadTest(endpoint, numRequests = 10, concurrency = 5) {
    console.log(`⚡ Running load test: ${numRequests} requests, ${concurrency} concurrent`);

    const results = [];
    const batches = [];

    // Split requests into batches for concurrency control
    for (let i = 0; i < numRequests; i += concurrency) {
      batches.push(numRequests - i >= concurrency ? concurrency : numRequests - i);
    }

    for (const batchSize of batches) {
      const promises = [];
      for (let i = 0; i < batchSize; i++) {
        promises.push(this.measureResponseTime(endpoint));
      }

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);

      // Small delay between batches to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return this.analyzeLoadTestResults(results);
  }

  /**
   * Analyze load test results
   */
  analyzeLoadTestResults(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    const responseTimes = successful.map(r => r.responseTime);
    const sortedTimes = responseTimes.sort((a, b) => a - b);

    const analysis = {
      totalRequests: results.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      successRate: (successful.length / results.length) * 100,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      medianResponseTime: sortedTimes[Math.floor(sortedTimes.length / 2)],
      p95ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
      p99ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
      requestsPerSecond: results.length / (results.reduce((sum, r) => sum + r.responseTime, 0) / 1000)
    };

    return analysis;
  }

  /**
   * Test API performance under various loads
   */
  async testAPIEndpoints() {
    console.log('📊 Testing API endpoint performance...');

    const endpoints = [
      { path: '/health', method: 'GET', description: 'Health Check' },
      { path: '/auth/login', method: 'POST', description: 'Authentication', data: {
        email: 'perf-test@example.com',
        password: 'test-password',
        deviceId: 'perf-test-device',
        ipAddress: '127.0.0.1'
      }}
    ];

    const results = {};

    for (const endpoint of endpoints) {
      console.log(`\n🔍 Testing ${endpoint.description} (${endpoint.method} ${endpoint.path})`);

      // Single request test
      const singleResult = await this.measureResponseTime(endpoint.path, endpoint.method, endpoint.data);
      console.log(`  📏 Single request: ${singleResult.responseTime}ms`);

      // Load test with 20 requests, 5 concurrent
      const loadAnalysis = await this.runLoadTest(endpoint.path, 20, 5);

      results[endpoint.description.toLowerCase().replace(/\s+/g, '-')] = {
        single: singleResult,
        load: loadAnalysis
      };

      console.log(`  📊 Load test results:`);
      console.log(`    ✅ Success rate: ${loadAnalysis.successRate.toFixed(1)}%`);
      console.log(`    🕐 Average: ${loadAnalysis.averageResponseTime.toFixed(0)}ms`);
      console.log(`    📈 95th percentile: ${loadAnalysis.p95ResponseTime.toFixed(0)}ms`);
      console.log(`    🚀 Requests/sec: ${loadAnalysis.requestsPerSecond.toFixed(1)}`);
    }

    return results;
  }

  /**
   * Test memory usage and resource consumption
   */
  async testResourceUsage(duration = 30000) { // 30 seconds
    console.log(`🧠 Testing resource usage over ${duration/1000}s...`);

    const startTime = Date.now();
    const memorySnapshots = [];
    const requestCount = 50;

    // Take initial memory snapshot
    if (typeof process !== 'undefined' && process.memoryUsage) {
      memorySnapshots.push({
        timestamp: Date.now(),
        memory: process.memoryUsage()
      });
    }

    // Make requests while monitoring memory
    const promises = [];
    for (let i = 0; i < requestCount; i++) {
      promises.push(this.client.get('/health'));

      // Take memory snapshot every 10 requests
      if (i % 10 === 0 && typeof process !== 'undefined' && process.memoryUsage) {
        memorySnapshots.push({
          timestamp: Date.now(),
          memory: process.memoryUsage()
        });
      }
    }

    await Promise.all(promises);

    // Take final memory snapshot
    if (typeof process !== 'undefined' && process.memoryUsage) {
      memorySnapshots.push({
        timestamp: Date.now(),
        memory: process.memoryUsage()
      });
    }

    const endTime = Date.now();

    // Analyze memory usage
    const memoryAnalysis = {
      duration: endTime - startTime,
      requestCount,
      requestsPerSecond: requestCount / ((endTime - startTime) / 1000),
      memorySnapshots: memorySnapshots.length,
      initialMemory: memorySnapshots[0]?.memory.heapUsed || 0,
      finalMemory: memorySnapshots[memorySnapshots.length - 1]?.memory.heapUsed || 0,
      memoryGrowth: (memorySnapshots[memorySnapshots.length - 1]?.memory.heapUsed || 0) -
                   (memorySnapshots[0]?.memory.heapUsed || 0),
      peakMemory: Math.max(...memorySnapshots.map(s => s.memory.heapUsed))
    };

    console.log(`  📊 Memory analysis:`);
    console.log(`    📏 Initial: ${(memoryAnalysis.initialMemory / 1024 / 1024).toFixed(1)} MB`);
    console.log(`    🏔️ Peak: ${(memoryAnalysis.peakMemory / 1024 / 1024).toFixed(1)} MB`);
    console.log(`    📈 Growth: ${(memoryAnalysis.memoryGrowth / 1024 / 1024).toFixed(1)} MB`);
    console.log(`    🚀 Throughput: ${memoryAnalysis.requestsPerSecond.toFixed(1)} req/sec`);

    return memoryAnalysis;
  }

  /**
   * Test API stability under sustained load
   */
  async testStability(duration = 60000) { // 1 minute
    console.log(`🏃 Testing API stability over ${duration/1000}s...`);

    const startTime = Date.now();
    const results = [];
    let requestCount = 0;

    while (Date.now() - startTime < duration) {
      const result = await this.measureResponseTime('/health');
      results.push(result);
      requestCount++;

      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const endTime = Date.now();
    const actualDuration = endTime - startTime;

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    const stability = {
      duration: actualDuration,
      totalRequests: requestCount,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      successRate: (successful.length / requestCount) * 100,
      averageResponseTime: successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length,
      requestsPerSecond: requestCount / (actualDuration / 1000),
      errorRate: (failed.length / requestCount) * 100
    };

    console.log(`  📊 Stability test results:`);
    console.log(`    ✅ Success rate: ${stability.successRate.toFixed(1)}%`);
    console.log(`    🕐 Average response: ${stability.averageResponseTime.toFixed(0)}ms`);
    console.log(`    🚀 Throughput: ${stability.requestsPerSecond.toFixed(1)} req/sec`);
    console.log(`    ❗ Error rate: ${stability.errorRate.toFixed(1)}%`);

    return stability;
  }

  /**
   * Run comprehensive performance tests
   */
  async runPerformanceTests() {
    console.log('⚡ Starting API Performance Tests\n');

    const results = {
      endpoints: await this.testAPIEndpoints(),
      resources: await this.testResourceUsage(30000),
      stability: await this.testStability(30000)
    };

    console.log('\n📊 Performance Test Summary:');
    console.log('=' .repeat(60));

    // Overall performance assessment
    const endpointResults = Object.values(results.endpoints);
    const avgResponseTime = endpointResults.reduce((sum, endpoint) => {
      return sum + endpoint.single.responseTime;
    }, 0) / endpointResults.length;

    const avgSuccessRate = endpointResults.reduce((sum, endpoint) => {
      return sum + endpoint.load.successRate;
    }, 0) / endpointResults.length;

    console.log(`🕐 Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`✅ Average Success Rate: ${avgSuccessRate.toFixed(1)}%`);
    console.log(`🚀 Overall Throughput: ${results.resources.requestsPerSecond.toFixed(1)} req/sec`);
    console.log(`🏃 Stability Success Rate: ${results.stability.successRate.toFixed(1)}%`);

    // Performance rating
    let performanceRating = 'Unknown';
    if (avgResponseTime < 100 && avgSuccessRate > 99) {
      performanceRating = 'Excellent';
    } else if (avgResponseTime < 500 && avgSuccessRate > 95) {
      performanceRating = 'Good';
    } else if (avgResponseTime < 1000 && avgSuccessRate > 90) {
      performanceRating = 'Fair';
    } else {
      performanceRating = 'Needs Improvement';
    }

    console.log(`🏆 Performance Rating: ${performanceRating}`);

    console.log('=' .repeat(60));

    return {
      rating: performanceRating,
      metrics: {
        averageResponseTime: avgResponseTime,
        averageSuccessRate: avgSuccessRate,
        throughput: results.resources.requestsPerSecond,
        stability: results.stability.successRate
      },
      details: results
    };
  }
}

// CLI runner
async function main() {
  const tester = new APIPerformanceTester();

  // Allow custom base URL via command line
  const baseURL = process.argv[2] || 'http://localhost:8080/api/v1';

  if (baseURL !== tester.baseURL) {
    tester.baseURL = baseURL;
  }

  console.log(`🔗 Testing API performance at: ${baseURL}`);

  const summary = await tester.runPerformanceTests();

  console.log(`\n🎯 Performance Test Complete: ${summary.rating}`);

  // Exit with appropriate code
  process.exit(summary.rating === 'Excellent' || summary.rating === 'Good' ? 0 : 1);
}

// Export for use as module
export default APIPerformanceTester;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Performance test failed:', error);
    process.exit(1);
  });
}
