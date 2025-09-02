/**
 * API Metrics Collector Service
 * Real-time collection and aggregation of API performance metrics
 */

import EventEmitter from 'events';
import axios from 'axios';

class APIMetricsCollector extends EventEmitter {
  constructor(options = {}) {
    super();
    this.baseURL = options.baseURL || 'http://localhost:8080/api/v1';
    this.collectionInterval = options.collectionInterval || 30000; // 30 seconds
    this.retentionPeriod = options.retentionPeriod || 3600000; // 1 hour
    this.maxMetricsPerEndpoint = options.maxMetricsPerEndpoint || 1000;

    this.metrics = new Map();
    this.isCollecting = false;
    this.collectionTimer = null;

    // Track repeated system metrics failures to avoid log spam
    this.systemMetricsFailureCount = 0;
    this.lastSystemMetricsWarnAt = 0;
    this.systemMetricsWarnCooldown = options.systemMetricsWarnCooldown || 60 * 1000; // 1 minute
    this.systemMetricsCircuitOpen = false;
    this.systemMetricsMaxFailures = options.systemMetricsMaxFailures || 3;

    // Initialize metrics storage
    this.initializeMetricsStorage();
  }

  /**
   * Initialize metrics storage structure
   */
  initializeMetricsStorage() {
    this.metrics.set('system', {
      health: [],
      uptime: [],
      memory: [],
      cpu: [],
      timestamp: Date.now()
    });

    this.metrics.set('endpoints', new Map());
    this.metrics.set('errors', []);
    this.metrics.set('performance', {
      responseTimes: [],
      throughput: [],
      errorRate: [],
      timestamp: Date.now()
    });

    this.metrics.set('security', {
      authAttempts: [],
      failedLogins: [],
      suspiciousActivities: [],
      timestamp: Date.now()
    });
  }

  /**
   * Start metrics collection
   */
  startCollection() {
    if (this.isCollecting) {
      console.log('📊 Metrics collection already running');
      return;
    }

    console.log('📊 Starting API metrics collection...');
    this.isCollecting = true;

    // Initial collection
    this.collectMetrics();

    // Set up periodic collection
    this.collectionTimer = setInterval(() => {
      this.collectMetrics();
    }, this.collectionInterval);

    this.emit('collection-started');
  }

  /**
   * Stop metrics collection
   */
  stopCollection() {
    if (!this.isCollecting) {
      return;
    }

    console.log('📊 Stopping API metrics collection...');
    this.isCollecting = false;

    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }

    this.emit('collection-stopped');
  }

  /**
   * Collect all metrics
   */
  async collectMetrics() {
    const timestamp = Date.now();

    try {
      // Collect system health metrics
      await this.collectSystemMetrics(timestamp);

      // Collect endpoint performance metrics
      await this.collectEndpointMetrics(timestamp);

      // Collect security metrics
      await this.collectSecurityMetrics(timestamp);

      // Clean up old metrics
      this.cleanupOldMetrics();

      // Emit metrics update event
      this.emit('metrics-updated', this.getCurrentMetrics());

    } catch (error) {
      console.error('❌ Error collecting metrics:', error);
      this.emit('collection-error', error);
    }
  }

  /**
   * Collect system health metrics
   */
  async collectSystemMetrics(timestamp) {
    // Circuit breaker: skip if too many consecutive failures
    if (this.systemMetricsCircuitOpen) {
      return;
    }

    try {
      const healthResponse = await axios.get(`${this.baseURL.replace('/api/v1', '')}/health`, {
        timeout: 5000
      });

      const systemMetrics = this.metrics.get('system');
      const healthData = {
        timestamp,
        status: healthResponse.data.status,
        uptime: healthResponse.data.uptime,
        services: healthResponse.data.services?.length || 0,
        healthyServices: healthResponse.data.services?.filter(s => s.status === 'healthy').length || 0,
        responseTime: healthResponse.data.responseTime || 0
      };

      systemMetrics.health.push(healthData);

      // Reset failure count on success
      this.systemMetricsFailureCount = 0;
      this.systemMetricsCircuitOpen = false;

      // Keep only recent metrics
      if (systemMetrics.health.length > 100) {
        systemMetrics.health = systemMetrics.health.slice(-100);
      }

      // Collect memory and CPU if available
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memUsage = process.memoryUsage();
        systemMetrics.memory.push({
          timestamp,
          rss: memUsage.rss,
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external
        });

        if (systemMetrics.memory.length > 100) {
          systemMetrics.memory = systemMetrics.memory.slice(-100);
        }
      }

      systemMetrics.timestamp = timestamp;

    } catch (error) {
      // Increment failure count
      this.systemMetricsFailureCount = (this.systemMetricsFailureCount || 0) + 1;

      // Open circuit breaker after max failures
      if (this.systemMetricsFailureCount >= this.systemMetricsMaxFailures) {
        this.systemMetricsCircuitOpen = true;
        console.warn(`⚠️ System metrics circuit breaker opened after ${this.systemMetricsFailureCount} failures. Stopping health checks.`);
        return;
      }

      const now = Date.now();
      // Only warn if cooldown elapsed to prevent log spamming
      if (!this.lastSystemMetricsWarnAt || (now - this.lastSystemMetricsWarnAt) > this.systemMetricsWarnCooldown) {
        console.warn('⚠️ Failed to collect system metrics:', error.message, `(failures: ${this.systemMetricsFailureCount}/${this.systemMetricsMaxFailures})`);
        this.lastSystemMetricsWarnAt = now;
      }

      // Optionally emit an event for monitoring systems (only first few occurrences)
      if (this.systemMetricsFailureCount <= 3) {
        this.emit('system-metrics-failure', { message: error.message, count: this.systemMetricsFailureCount });
      }

      // Do not rethrow; collection continues on next interval
    }
  }

  /**
   * Collect endpoint performance metrics
   */
  async collectEndpointMetrics(timestamp) {
    const endpoints = [
      { path: '/health', method: 'GET', name: 'health' },
      { path: '/auth/login', method: 'POST', name: 'auth-login', skip: true }, // Skip auth endpoints for automated testing
      { path: '/security/events', method: 'GET', name: 'security-events', auth: true },
      { path: '/performance/report', method: 'GET', name: 'performance-report', auth: true }
    ];

    const endpointMetrics = this.metrics.get('endpoints');

    for (const endpoint of endpoints) {
      if (endpoint.skip) continue;

      try {
        const startTime = Date.now();
        const config = {
          method: endpoint.method,
          url: `${this.baseURL}${endpoint.path}`,
          timeout: 10000
        };

        // Add auth header if required (will fail but we measure the attempt)
        if (endpoint.auth) {
          config.headers = {
            'Authorization': 'Bearer test-token'
          };
        }

        const response = await axios.request(config);
        const responseTime = Date.now() - startTime;

        const metric = {
          timestamp,
          endpoint: endpoint.name,
          method: endpoint.method,
          status: response.status,
          responseTime,
          success: true
        };

        if (!endpointMetrics.has(endpoint.name)) {
          endpointMetrics.set(endpoint.name, []);
        }

        const endpointHistory = endpointMetrics.get(endpoint.name);
        endpointHistory.push(metric);

        // Keep only recent metrics
        if (endpointHistory.length > this.maxMetricsPerEndpoint) {
          endpointHistory.splice(0, endpointHistory.length - this.maxMetricsPerEndpoint);
        }

      } catch (error) {
        const responseTime = Date.now() - timestamp;

        const metric = {
          timestamp,
          endpoint: endpoint.name,
          method: endpoint.method,
          status: error.response?.status || 0,
          responseTime,
          success: false,
          error: error.message
        };

        if (!endpointMetrics.has(endpoint.name)) {
          endpointMetrics.set(endpoint.name, []);
        }

        const endpointHistory = endpointMetrics.get(endpoint.name);
        endpointHistory.push(metric);

        if (endpointHistory.length > this.maxMetricsPerEndpoint) {
          endpointHistory.splice(0, endpointHistory.length - this.maxMetricsPerEndpoint);
        }
      }
    }
  }

  /**
   * Collect security-related metrics
   */
  async collectSecurityMetrics(timestamp) {
    // This would typically integrate with your security monitoring system
    // For now, we'll simulate some security metrics

    const securityMetrics = this.metrics.get('security');

    // Simulate security events (in real implementation, this would come from your security service)
    const mockSecurityEvent = {
      timestamp,
      type: Math.random() > 0.8 ? 'suspicious_login' : 'normal_activity',
      severity: Math.random() > 0.9 ? 'high' : 'low',
      source: 'api_monitor'
    };

    securityMetrics.suspiciousActivities.push(mockSecurityEvent);

    // Keep only recent events
    if (securityMetrics.suspiciousActivities.length > 500) {
      securityMetrics.suspiciousActivities = securityMetrics.suspiciousActivities.slice(-500);
    }

    securityMetrics.timestamp = timestamp;
  }

  /**
   * Clean up old metrics based on retention period
   */
  cleanupOldMetrics() {
    const cutoffTime = Date.now() - this.retentionPeriod;

    // Clean system metrics
    const systemMetrics = this.metrics.get('system');
    systemMetrics.health = systemMetrics.health.filter(m => m.timestamp > cutoffTime);
    systemMetrics.memory = systemMetrics.memory.filter(m => m.timestamp > cutoffTime);

    // Clean endpoint metrics
    const endpointMetrics = this.metrics.get('endpoints');
    for (const [endpoint, metrics] of endpointMetrics) {
      const filtered = metrics.filter(m => m.timestamp > cutoffTime);
      if (filtered.length === 0) {
        endpointMetrics.delete(endpoint);
      } else {
        endpointMetrics.set(endpoint, filtered);
      }
    }

    // Clean error metrics
    const errorMetrics = this.metrics.get('errors');
    this.metrics.set('errors', errorMetrics.filter(e => e.timestamp > cutoffTime));

    // Clean security metrics
    const securityMetrics = this.metrics.get('security');
    securityMetrics.suspiciousActivities = securityMetrics.suspiciousActivities.filter(
      e => e.timestamp > cutoffTime
    );
  }

  /**
   * Get current metrics snapshot
   */
  getCurrentMetrics() {
    const snapshot = {
      timestamp: Date.now(),
      system: this.metrics.get('system'),
      endpoints: Object.fromEntries(this.metrics.get('endpoints')),
      errors: this.metrics.get('errors'),
      performance: this.metrics.get('performance'),
      security: this.metrics.get('security'),
      collection: {
        isRunning: this.isCollecting,
        interval: this.collectionInterval,
        retentionPeriod: this.retentionPeriod
      }
    };

    return snapshot;
  }

  /**
   * Get metrics for specific time range
   */
  getMetricsInRange(startTime, endTime = Date.now()) {
    const filteredMetrics = {
      timestamp: Date.now(),
      system: {
        health: this.metrics.get('system').health.filter(m => m.timestamp >= startTime && m.timestamp <= endTime),
        memory: this.metrics.get('system').memory.filter(m => m.timestamp >= startTime && m.timestamp <= endTime)
      },
      endpoints: new Map(),
      errors: this.metrics.get('errors').filter(e => e.timestamp >= startTime && e.timestamp <= endTime),
      security: {
        suspiciousActivities: this.metrics.get('security').suspiciousActivities.filter(
          e => e.timestamp >= startTime && e.timestamp <= endTime
        )
      }
    };

    // Filter endpoint metrics
    const endpointMetrics = this.metrics.get('endpoints');
    for (const [endpoint, metrics] of endpointMetrics) {
      const filtered = metrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime);
      if (filtered.length > 0) {
        filteredMetrics.endpoints.set(endpoint, filtered);
      }
    }

    return filteredMetrics;
  }

  /**
   * Calculate performance statistics
   */
  calculatePerformanceStats(timeRange = 300000) { // 5 minutes
    const endTime = Date.now();
    const startTime = endTime - timeRange;
    const metrics = this.getMetricsInRange(startTime, endTime);

    const stats = {
      timeRange,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      throughput: 0, // requests per second
      endpoints: {}
    };

    let totalResponseTime = 0;
    const endpointStats = {};

    // Calculate endpoint-specific stats
    for (const [endpoint, endpointMetrics] of Object.entries(metrics.endpoints)) {
      const endpointStat = {
        requests: endpointMetrics.length,
        successful: endpointMetrics.filter(m => m.success).length,
        failed: endpointMetrics.filter(m => !m.success).length,
        averageResponseTime: 0,
        errorRate: 0
      };

      const successfulMetrics = endpointMetrics.filter(m => m.success);
      if (successfulMetrics.length > 0) {
        endpointStat.averageResponseTime = successfulMetrics.reduce((sum, m) => sum + m.responseTime, 0) / successfulMetrics.length;
      }

      if (endpointMetrics.length > 0) {
        endpointStat.errorRate = (endpointStat.failed / endpointMetrics.length) * 100;
      }

      endpointStats[endpoint] = endpointStat;
      stats.totalRequests += endpointMetrics.length;
      stats.successfulRequests += endpointStat.successful;
      stats.failedRequests += endpointStat.failed;
      totalResponseTime += successfulMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    }

    // Calculate overall stats
    if (stats.successfulRequests > 0) {
      stats.averageResponseTime = totalResponseTime / stats.successfulRequests;
    }

    if (stats.totalRequests > 0) {
      stats.errorRate = (stats.failedRequests / stats.totalRequests) * 100;
      stats.throughput = stats.totalRequests / (timeRange / 1000);
    }

    stats.endpoints = endpointStats;

    return stats;
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics() {
    return JSON.stringify(this.getCurrentMetrics(), null, 2);
  }

  /**
   * Import metrics from JSON
   */
  importMetrics(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      // Restore metrics (simplified implementation)
      console.log('📊 Metrics imported successfully');
      this.emit('metrics-imported', data);
    } catch (error) {
      console.error('❌ Failed to import metrics:', error);
      throw error;
    }
  }
}

export default APIMetricsCollector;
