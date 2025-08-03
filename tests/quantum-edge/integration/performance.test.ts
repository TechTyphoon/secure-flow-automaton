import { PerformanceMetrics } from '../../../apps/quantum-edge/src/services/analytics/performance-metrics';
import { QuantumEdgeApplication } from '../../../apps/quantum-edge/src/app';

describe('Performance Metrics Integration Tests', () => {
  let app: QuantumEdgeApplication;
  let performanceMetrics: PerformanceMetrics;

  beforeAll(() => {
    app = new QuantumEdgeApplication();
    performanceMetrics = new PerformanceMetrics();
  });

  test('should measure quantum processing latency', async () => {
    const latency = await performanceMetrics.measureQuantumProcessingLatency();
    expect(latency).toBeLessThan(10); // Expect latency to be less than 10ms
  });

  test('should measure QKD key generation rate', async () => {
    const keyGenerationRate = await performanceMetrics.measureQKDKeyGeneration();
    expect(keyGenerationRate).toBeGreaterThan(1000000); // Expect rate to be greater than 1 Mbps
  });

  test('should measure edge-to-cloud sync time', async () => {
    const syncTime = await performanceMetrics.measureEdgeToCloudSync();
    expect(syncTime).toBeLessThan(100); // Expect sync time to be less than 100ms
  });

  test('should measure mobile response time for quantum operations', async () => {
    const mobileResponseTime = await performanceMetrics.measureMobileResponseTime();
    expect(mobileResponseTime).toBeLessThan(50); // Expect response time to be less than 50ms
  });

  test('should validate system availability', async () => {
    const availability = await performanceMetrics.checkSystemAvailability();
    expect(availability).toBeGreaterThan(99.9); // Expect availability to be greater than 99.9%
  });
});