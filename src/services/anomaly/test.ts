/**
 * Phase 5.3 Advanced Anomaly Detection - Comprehensive Integration Test
 * Full system validation and performance benchmarking
 */

import { 
  DetectionOrchestrator,
  AnomalyDetectionFactory,
  AnomalyDetectionUtils,
  quickDetect,
  DEFAULT_CONFIGS
} from './index';

// Test data generators
class TestDataGenerator {
  static generateUnivariateNormal(length: number = 100, mean: number = 0, std: number = 1): number[] {
    const data = [];
    for (let i = 0; i < length; i++) {
      data.push(this.normalRandom(mean, std));
    }
    return data;
  }

  static generateUnivariateWithAnomalies(length: number = 100, anomalyRate: number = 0.05): number[] {
    const data = this.generateUnivariateNormal(length);
    const anomalyCount = Math.floor(length * anomalyRate);
    
    for (let i = 0; i < anomalyCount; i++) {
      const index = Math.floor(Math.random() * length);
      data[index] = Math.random() > 0.5 ? 10 + Math.random() * 5 : -10 - Math.random() * 5;
    }
    
    return data;
  }

  static generateTimeSeriesData(length: number = 100): any[] {
    const baseTime = Date.now();
    const data = [];
    
    for (let i = 0; i < length; i++) {
      const timestamp = baseTime + i * 3600000; // Hourly data
      const trend = i * 0.1;
      const seasonal = Math.sin(2 * Math.PI * i / 24) * 2; // Daily seasonality
      const noise = this.normalRandom(0, 0.5);
      
      data.push({
        timestamp,
        value: trend + seasonal + noise + 10
      });
    }
    
    return data;
  }

  static generateMultivariateData(length: number = 100): any[] {
    const data = [];
    
    for (let i = 0; i < length; i++) {
      data.push({
        features: {
          cpu_usage: Math.random() * 100,
          memory_usage: Math.random() * 100,
          network_io: Math.random() * 1000,
          disk_io: Math.random() * 500,
          response_time: Math.random() * 200 + 50
        },
        timestamp: Date.now() + i * 1000
      });
    }
    
    return data;
  }

  static generateGraphData(nodeCount: number = 20, edgeCount: number = 30): any[] {
    const data = [];
    
    // Generate nodes
    for (let i = 0; i < nodeCount; i++) {
      data.push({
        id: `node_${i}`,
        type: Math.random() > 0.8 ? 'suspicious' : 'normal',
        attributes: {
          degree: Math.floor(Math.random() * 10),
          weight: Math.random()
        }
      });
    }
    
    // Generate edges
    for (let i = 0; i < edgeCount; i++) {
      const source = Math.floor(Math.random() * nodeCount);
      const target = Math.floor(Math.random() * nodeCount);
      
      if (source !== target) {
        data.push({
          source: `node_${source}`,
          target: `node_${target}`,
          weight: Math.random(),
          type: Math.random() > 0.9 ? 'anomalous' : 'normal'
        });
      }
    }
    
    return data;
  }

  private static normalRandom(mean: number = 0, std: number = 1): number {
    // Box-Muller transform
    if (this.spare !== undefined) {
      const value = this.spare;
      this.spare = undefined;
      return mean + std * value;
    }
    
    const u1 = Math.random();
    const u2 = Math.random();
    const mag = std * Math.sqrt(-2 * Math.log(u1));
    const z0 = mag * Math.cos(2 * Math.PI * u2);
    const z1 = mag * Math.sin(2 * Math.PI * u2);
    
    this.spare = z1;
    return mean + z0;
  }

  private static spare: number | undefined;
}

// Test suite
class AnomalyDetectionTestSuite {
  private results: any[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Phase 5.3 Advanced Anomaly Detection Test Suite');
    console.log('=' .repeat(80));

    try {
      await this.testQuickDetection();
      await this.testOrchestratorComprehensive();
      await this.testDifferentDataTypes();
      await this.testPerformanceBenchmarks();
      await this.testAdaptiveBehavior();
      
      this.printSummary();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  private async testQuickDetection(): Promise<void> {
    console.log('\n📋 Testing Quick Detection API');
    console.log('-'.repeat(40));

    const testCases = [
      {
        name: 'Univariate Normal Data',
        data: TestDataGenerator.generateUnivariateNormal(50),
        config: 'LIGHTWEIGHT' as const
      },
      {
        name: 'Univariate with Anomalies',
        data: TestDataGenerator.generateUnivariateWithAnomalies(50, 0.1),
        config: 'STANDARD' as const
      },
      {
        name: 'Time Series Data',
        data: TestDataGenerator.generateTimeSeriesData(30),
        config: 'STANDARD' as const
      }
    ];

    for (const testCase of testCases) {
      try {
        const startTime = Date.now();
        const result = await quickDetect(testCase.data, testCase.config);
        const duration = Date.now() - startTime;

        console.log(`✅ ${testCase.name}:`);
        console.log(`   Anomaly: ${result.isAnomaly} (${(result.confidence * 100).toFixed(1)}% confidence)`);
        console.log(`   Severity: ${result.severity}, Score: ${result.score.toFixed(3)}`);
        console.log(`   Processing Time: ${duration}ms`);

        this.results.push({
          test: `quick_${testCase.name.toLowerCase().replace(/\s+/g, '_')}`,
          success: true,
          duration,
          result
        });
      } catch (error) {
        console.log(`❌ ${testCase.name}: ${error}`);
        this.results.push({
          test: `quick_${testCase.name.toLowerCase().replace(/\s+/g, '_')}`,
          success: false,
          error: error.message
        });
      }
    }
  }

  private async testOrchestratorComprehensive(): Promise<void> {
    console.log('\n🎛️ Testing Detection Orchestrator');
    console.log('-'.repeat(40));

    const orchestrator = AnomalyDetectionFactory.createOrchestrator(DEFAULT_CONFIGS.COMPREHENSIVE);

    // Wait for initialization
    await new Promise(resolve => {
      if (orchestrator.getOrchestrationStatistics().isInitialized) {
        resolve(undefined);
      } else {
        orchestrator.once('initialized', resolve);
      }
    });

    const testData = TestDataGenerator.generateMultivariateData(40);
    const request = AnomalyDetectionUtils.formatDetectionRequest(testData, {
      priority: 'high',
      methods: ['deep_learning', 'ensemble', 'multivariate']
    });

    try {
      const startTime = Date.now();
      const result = await orchestrator.detectAnomalies(request);
      const duration = Date.now() - startTime;

      console.log('✅ Orchestrator Test:');
      console.log(`   Request ID: ${result.requestId}`);
      console.log(`   Methods Used: ${result.fusedResult.contributingMethods.join(', ')}`);
      console.log(`   Fused Result: ${result.fusedResult.isAnomaly} (${result.fusedResult.confidenceScore.toFixed(3)})`);
      console.log(`   Consensus Score: ${result.fusedResult.consensusScore.toFixed(3)}`);
      console.log(`   Processing Time: ${duration}ms`);
      console.log(`   Individual Results: ${result.results.length}`);

      // Print statistics
      const stats = orchestrator.getOrchestrationStatistics();
      console.log(`   Services Active: ${Object.values(stats.servicesStatus).filter(Boolean).length}/5`);

      this.results.push({
        test: 'orchestrator_comprehensive',
        success: true,
        duration,
        result,
        stats
      });
    } catch (error) {
      console.log(`❌ Orchestrator Test: ${error}`);
      this.results.push({
        test: 'orchestrator_comprehensive',
        success: false,
        error: error.message
      });
    }
  }

  private async testDifferentDataTypes(): Promise<void> {
    console.log('\n📊 Testing Different Data Types');
    console.log('-'.repeat(40));

    const testCases = [
      {
        name: 'Univariate Array',
        data: TestDataGenerator.generateUnivariateWithAnomalies(30, 0.15),
        expectedType: 'univariate'
      },
      {
        name: 'Time Series Data',
        data: TestDataGenerator.generateTimeSeriesData(25),
        expectedType: 'timeseries'
      },
      {
        name: 'Multivariate Data',
        data: TestDataGenerator.generateMultivariateData(20),
        expectedType: 'multivariate'
      },
      {
        name: 'Graph Data',
        data: TestDataGenerator.generateGraphData(15, 20),
        expectedType: 'graph'
      }
    ];

    for (const testCase of testCases) {
      try {
        const inferredType = AnomalyDetectionUtils.inferDataType(testCase.data);
        const validation = AnomalyDetectionUtils.validateDataFormat(testCase.data);

        console.log(`✅ ${testCase.name}:`);
        console.log(`   Expected Type: ${testCase.expectedType}, Inferred: ${inferredType}`);
        console.log(`   Validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
        if (!validation.isValid) {
          console.log(`   Errors: ${validation.errors.join(', ')}`);
        }

        // Test with orchestrator
        const orchestrator = AnomalyDetectionFactory.createOrchestrator(DEFAULT_CONFIGS.STANDARD);
        const request = AnomalyDetectionUtils.formatDetectionRequest(testCase.data);
        
        const startTime = Date.now();
        const result = await orchestrator.detectAnomalies(request);
        const duration = Date.now() - startTime;

        console.log(`   Detection: ${result.fusedResult.isAnomaly} (${duration}ms)`);

        this.results.push({
          test: `datatype_${testCase.name.toLowerCase().replace(/\s+/g, '_')}`,
          success: true,
          typeMatch: inferredType === testCase.expectedType,
          validation: validation.isValid,
          duration,
          result
        });
      } catch (error) {
        console.log(`❌ ${testCase.name}: ${error}`);
        this.results.push({
          test: `datatype_${testCase.name.toLowerCase().replace(/\s+/g, '_')}`,
          success: false,
          error: error.message
        });
      }
    }
  }

  private async testPerformanceBenchmarks(): Promise<void> {
    console.log('\n⚡ Performance Benchmarks');
    console.log('-'.repeat(40));

    const benchmarks = [
      { name: 'Small Dataset (50 points)', size: 50, config: 'LIGHTWEIGHT' as const },
      { name: 'Medium Dataset (200 points)', size: 200, config: 'STANDARD' as const },
      { name: 'Large Dataset (500 points)', size: 500, config: 'COMPREHENSIVE' as const }
    ];

    for (const benchmark of benchmarks) {
      try {
        const data = TestDataGenerator.generateUnivariateWithAnomalies(benchmark.size, 0.08);
        const iterations = benchmark.size > 300 ? 3 : 5;
        const times: number[] = [];

        for (let i = 0; i < iterations; i++) {
          const startTime = Date.now();
          await quickDetect(data, benchmark.config);
          times.push(Date.now() - startTime);
        }

        const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        console.log(`✅ ${benchmark.name}:`);
        console.log(`   Average Time: ${avgTime.toFixed(1)}ms`);
        console.log(`   Range: ${minTime}ms - ${maxTime}ms`);
        console.log(`   Throughput: ${(benchmark.size / avgTime * 1000).toFixed(0)} points/sec`);

        this.results.push({
          test: `performance_${benchmark.name.toLowerCase().replace(/\s+/g, '_')}`,
          success: true,
          size: benchmark.size,
          averageTime: avgTime,
          minTime,
          maxTime,
          throughput: benchmark.size / avgTime * 1000
        });
      } catch (error) {
        console.log(`❌ ${benchmark.name}: ${error}`);
        this.results.push({
          test: `performance_${benchmark.name.toLowerCase().replace(/\s+/g, '_')}`,
          success: false,
          error: error.message
        });
      }
    }
  }

  private async testAdaptiveBehavior(): Promise<void> {
    console.log('\n🧠 Testing Adaptive Behavior');
    console.log('-'.repeat(40));

    const orchestrator = AnomalyDetectionFactory.createOrchestrator({
      ...DEFAULT_CONFIGS.STANDARD,
      adaptiveLearning: true
    });

    // Wait for initialization
    await new Promise(resolve => {
      if (orchestrator.getOrchestrationStatistics().isInitialized) {
        resolve(undefined);
      } else {
        orchestrator.once('initialized', resolve);
      }
    });

    try {
      // Run multiple detections to observe adaptation
      const datasets = [
        TestDataGenerator.generateUnivariateWithAnomalies(40, 0.05),
        TestDataGenerator.generateUnivariateWithAnomalies(40, 0.15),
        TestDataGenerator.generateUnivariateWithAnomalies(40, 0.25)
      ];

      const adaptationResults = [];

      for (let i = 0; i < datasets.length; i++) {
        const request = AnomalyDetectionUtils.formatDetectionRequest(datasets[i], {
          id: `adaptive_test_${i}`
        });

        const startTime = Date.now();
        const result = await orchestrator.detectAnomalies(request);
        const duration = Date.now() - startTime;

        adaptationResults.push({
          iteration: i + 1,
          anomalyRate: [0.05, 0.15, 0.25][i],
          detected: result.fusedResult.isAnomaly,
          confidence: result.fusedResult.confidenceScore,
          processingTime: duration,
          methodsUsed: result.fusedResult.contributingMethods.length
        });

        console.log(`✅ Iteration ${i + 1}:`);
        console.log(`   Anomaly Rate: ${([0.05, 0.15, 0.25][i] * 100).toFixed(1)}%`);
        console.log(`   Detected: ${result.fusedResult.isAnomaly} (${result.fusedResult.confidenceScore.toFixed(3)})`);
        console.log(`   Processing Time: ${duration}ms`);
      }

      // Check if processing times improved (basic adaptation indicator)
      const timeImprovement = adaptationResults[0].processingTime - adaptationResults[adaptationResults.length - 1].processingTime;
      console.log(`⚡ Time Improvement: ${timeImprovement}ms`);

      this.results.push({
        test: 'adaptive_behavior',
        success: true,
        adaptationResults,
        timeImprovement
      });
    } catch (error) {
      console.log(`❌ Adaptive Behavior Test: ${error}`);
      this.results.push({
        test: 'adaptive_behavior',
        success: false,
        error: error.message
      });
    }
  }

  private printSummary(): void {
    console.log('\n📊 Test Suite Summary');
    console.log('=' .repeat(80));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${(passedTests / totalTests * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failedTests} (${(failedTests / totalTests * 100).toFixed(1)}%)`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.test}: ${result.error}`);
      });
    }

    // Performance summary
    const performanceTests = this.results.filter(r => r.test.startsWith('performance_'));
    if (performanceTests.length > 0) {
      console.log('\n⚡ Performance Summary:');
      performanceTests.forEach(test => {
        if (test.success) {
          console.log(`  ${test.test}: ${test.averageTime.toFixed(1)}ms avg, ${test.throughput.toFixed(0)} points/sec`);
        }
      });
    }

    console.log('\n✅ Phase 5.3 Advanced Anomaly Detection System - Validation Complete!');
  }
}

// Export test utilities
export { TestDataGenerator, AnomalyDetectionTestSuite };

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  const testSuite = new AnomalyDetectionTestSuite();
  testSuite.runAllTests().catch(console.error);
}
