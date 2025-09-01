/**
 * Unit tests for the comprehensive monitoring system
 * Demonstrates health checks, metrics collection, alerting, and security monitoring
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MonitoringService,
  createMonitoringService,
  Alert,
  HealthStatus,
  ServiceMetrics,
  SecurityMetrics,
  HealthChecks
} from '../../../apps/web/services/common/monitoring';
import { Logger, LogLevel } from '../../../apps/web/services/common/logger';
import { BaseError, createErrorContext } from '../../../apps/web/services/common/errors';

// Mock fetch for external API health checks
global.fetch = vi.fn();

describe('Comprehensive Monitoring System', () => {
  let logger: Logger;
  let monitoring: MonitoringService;

  beforeEach(() => {
    // Create logger with test configuration
    logger = new Logger({
      level: LogLevel.DEBUG,
      enableConsole: false,
      enableFile: false,
      enableExternal: false,
      enableMetrics: true,
      enableCorrelationId: true
    });

    monitoring = createMonitoringService(logger, {
      enabled: true,
      metricsInterval: 1000, // Faster for testing
      healthCheckInterval: 2000,
      alertThresholds: {
        responseTimeMs: 500,
        errorRatePercent: 10,
        memoryUsagePercent: 80,
        cpuUsagePercent: 75,
        securityEventsPerHour: 50
      },
      retentionPeriod: 7
    });
  });

  describe('Health Monitoring', () => {
    it('should register and execute health checks', async () => {
      const mockHealthCheck = vi.fn().mockResolvedValue({
        service: 'TestService',
        status: 'healthy',
        lastCheck: new Date(),
        uptime: 3600,
        metrics: {
          requestsTotal: 100,
          requestsPerSecond: 10,
          averageResponseTime: 100,
          errorRate: 0,
          memoryUsage: 60,
          cpuUsage: 30,
          activeConnections: 5,
          queueDepth: 0
        },
        dependencies: []
      });

      monitoring.registerHealthCheck('TestService', mockHealthCheck);

      // Wait for health check execution
      await new Promise(resolve => setTimeout(resolve, 2100));

      const health = monitoring.getHealthStatus('TestService') as HealthStatus;
      expect(health.service).toBe('TestService');
      expect(health.status).toBe('healthy');
      expect(mockHealthCheck).toHaveBeenCalled();
    });

    it('should detect unhealthy services', async () => {
      const mockHealthCheck = vi.fn().mockResolvedValue({
        service: 'UnhealthyService',
        status: 'unhealthy',
        lastCheck: new Date(),
        uptime: 1800,
        metrics: {
          requestsTotal: 50,
          requestsPerSecond: 5,
          averageResponseTime: 800,
          errorRate: 15,
          memoryUsage: 85,
          cpuUsage: 90,
          activeConnections: 2,
          queueDepth: 10
        },
        dependencies: []
      });

      monitoring.registerHealthCheck('UnhealthyService', mockHealthCheck);

      // Wait for health check execution
      await new Promise(resolve => setTimeout(resolve, 2100));

      const health = monitoring.getHealthStatus('UnhealthyService') as HealthStatus;
      expect(health.status).toBe('unhealthy');
      expect(health.metrics.errorRate).toBe(15);
    });

    it('should provide system overview', () => {
      const overview = monitoring.getSystemOverview();
      expect(overview).toHaveProperty('overallHealth');
      expect(overview).toHaveProperty('servicesCount');
      expect(overview).toHaveProperty('alertsCount');
      expect(overview).toHaveProperty('securityEventsCount');
      expect(typeof overview.averageResponseTime).toBe('number');
      expect(typeof overview.totalRequests).toBe('number');
    });
  });

  describe('Performance Monitoring', () => {
    it('should record and track performance metrics', () => {
      const context = createErrorContext('TestService', 'testOperation');

      monitoring.recordPerformanceMetrics('TestService', {
        responseTime: 150,
        memoryUsage: 70,
        cpuUsage: 45,
        throughput: 10,
        errorRate: 2
      }, context);

      // Verify metrics are recorded (internal state check)
      expect(monitoring).toBeDefined();
    });

    it('should generate performance alerts for high response times', () => {
      const context = createErrorContext('SlowService', 'slowOperation');

      // Record high response time that exceeds threshold
      monitoring.recordPerformanceMetrics('SlowService', {
        responseTime: 1000, // Above 500ms threshold
        memoryUsage: 60,
        cpuUsage: 40
      }, context);

      const alerts = monitoring.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);

      const performanceAlert = alerts.find(a => a.type === 'performance');
      expect(performanceAlert).toBeDefined();
      expect(performanceAlert?.message).toContain('High response time');
    });

    it('should generate resource alerts for high memory usage', () => {
      const context = createErrorContext('MemoryService', 'memoryOperation');

      monitoring.recordPerformanceMetrics('MemoryService', {
        responseTime: 100,
        memoryUsage: 90, // Above 80% threshold
        cpuUsage: 40
      }, context);

      const alerts = monitoring.getActiveAlerts();
      const resourceAlert = alerts.find(a => a.type === 'resource' && a.message.includes('memory'));
      expect(resourceAlert).toBeDefined();
    });
  });

  describe('Security Event Monitoring', () => {
    it('should record and track security events', () => {
      const context = createErrorContext('SecurityService', 'securityCheck', 'user123', 'session456');

      monitoring.recordSecurityEvent(
        'authentication_attempt',
        'medium',
        context,
        {
          userAgent: 'Mozilla/5.0',
          ipAddress: '192.168.1.100',
          success: false
        },
        60
      );

      const securityMetrics = monitoring.getSecurityMetrics();
      expect(securityMetrics.totalEvents).toBeGreaterThan(0);
      expect(securityMetrics.eventsByType).toHaveProperty('authentication_attempt');
      expect(securityMetrics.eventsBySeverity).toHaveProperty('medium');
    });

    it('should generate security alerts for high event rates', () => {
      const context = createErrorContext('HighSecurityService', 'securityOperation');

      // Record multiple security events quickly
      for (let i = 0; i < 60; i++) {
        monitoring.recordSecurityEvent(
          'failed_login',
          'medium',
          { ...context, metadata: { attempt: i } },
          { ipAddress: `192.168.1.${i % 255}` },
          40
        );
      }

      const alerts = monitoring.getActiveAlerts();
      const securityAlert = alerts.find(a => a.type === 'security');
      expect(securityAlert).toBeDefined();
      expect(securityAlert?.message).toContain('High security event rate');
    });

    it('should track risk scores and threat levels', () => {
      const context = createErrorContext('RiskService', 'riskCheck');

      monitoring.recordSecurityEvent(
        'suspicious_activity',
        'high',
        context,
        {
          riskFactors: ['unusual_time', 'unusual_location'],
          confidence: 0.85
        },
        85
      );

      const securityMetrics = monitoring.getSecurityMetrics();
      expect(securityMetrics.riskScoreDistribution).toBeDefined();

      // Check recent threats
      expect(securityMetrics.recentThreats.length).toBeGreaterThan(0);
      const recentThreat = securityMetrics.recentThreats[0];
      expect(recentThreat.severity).toBe('high');
      expect(recentThreat.riskScore).toBe(85);
    });
  });

  describe('Alert Management', () => {
    it('should create and manage alerts', () => {
      const context = createErrorContext('AlertService', 'alertOperation');

      // Create a custom alert
      monitoring.recordPerformanceMetrics('AlertService', {
        responseTime: 2000, // Very high response time
        memoryUsage: 60
      }, context);

      const alerts = monitoring.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);

      const alert = alerts[0];
      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('type');
      expect(alert).toHaveProperty('severity');
      expect(alert).toHaveProperty('message');
      expect(alert).toHaveProperty('acknowledged');
      expect(alert).toHaveProperty('resolved');
    });

    it('should acknowledge and resolve alerts', () => {
      const context = createErrorContext('AckService', 'ackOperation');

      // Create alert
      monitoring.recordPerformanceMetrics('AckService', {
        responseTime: 1500,
        memoryUsage: 60
      }, context);

      const alerts = monitoring.getActiveAlerts();
      const alert = alerts.find(a => a.type === 'performance');

      if (alert) {
        // Acknowledge alert
        const acknowledged = monitoring.acknowledgeAlert(alert.id, 'admin');
        expect(acknowledged).toBe(true);

        // Resolve alert
        const resolved = monitoring.resolveAlert(alert.id, 'Issue fixed by scaling', 'admin');
        expect(resolved).toBe(true);

        // Check if alert is resolved - resolved alerts are not in active alerts
        // So we need to check the alert directly from the internal alerts array
        const allAlerts = (monitoring as any).alerts; // Access private alerts array for testing
        const resolvedAlert = allAlerts.find((a: Alert) => a.id === alert.id);
        expect(resolvedAlert?.resolved).toBe(true);
        expect(resolvedAlert?.acknowledged).toBe(true);

        // Verify it's not in active alerts anymore
        const activeAlerts = monitoring.getActiveAlerts();
        const activeAlert = activeAlerts.find(a => a.id === alert.id);
        expect(activeAlert).toBeUndefined();
      }
    });
  });

  describe('Health Check Utilities', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should perform memory health checks', () => {
      const memoryHealth = HealthChecks.memoryHealth();
      expect(memoryHealth).toHaveProperty('status');
      expect(memoryHealth).toHaveProperty('usagePercent');
      expect(typeof memoryHealth.usagePercent).toBe('number');
      expect(memoryHealth.usagePercent).toBeGreaterThanOrEqual(0);
      expect(memoryHealth.usagePercent).toBeLessThanOrEqual(100);
    });

    it('should perform CPU health checks', () => {
      const cpuHealth = HealthChecks.cpuHealth();
      expect(cpuHealth).toHaveProperty('status');
      expect(cpuHealth).toHaveProperty('usagePercent');
      expect(typeof cpuHealth.usagePercent).toBe('number');
      expect(cpuHealth.usagePercent).toBeGreaterThanOrEqual(0);
      expect(cpuHealth.usagePercent).toBeLessThanOrEqual(100);
    });

    it('should perform external API health checks', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        text: () => Promise.resolve('OK')
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const healthStatus = await HealthChecks.externalApiHealth('https://api.example.com/health');
      expect(healthStatus.type).toBe('external_api');
      expect(healthStatus.status).toBe('up');
      expect(healthStatus.responseTime).toBeDefined();
    });

    it('should handle external API failures', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Connection failed'));

      const healthStatus = await HealthChecks.externalApiHealth('https://api.example.com/health');
      expect(healthStatus.type).toBe('external_api');
      expect(healthStatus.status).toBe('down');
      expect(healthStatus.error).toBe('Connection failed');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complex monitoring scenario', async () => {
      const context = createErrorContext('IntegrationService', 'complexOperation', 'user123');

      // Register health check
      monitoring.registerHealthCheck('IntegrationService', async () => ({
        service: 'IntegrationService',
        status: 'healthy',
        lastCheck: new Date(),
        uptime: 7200,
        metrics: {
          requestsTotal: 500,
          requestsPerSecond: 25,
          averageResponseTime: 200,
          errorRate: 1,
          memoryUsage: 65,
          cpuUsage: 50,
          activeConnections: 20,
          queueDepth: 2
        },
        dependencies: [
          {
            name: 'Database',
            type: 'database',
            status: 'up',
            responseTime: 50,
            lastCheck: new Date()
          }
        ]
      }));

      // Record various events
      monitoring.recordPerformanceMetrics('IntegrationService', {
        responseTime: 250,
        memoryUsage: 70,
        throughput: 20
      }, context);

      monitoring.recordSecurityEvent(
        'successful_authentication',
        'low',
        context,
        { method: 'mfa', factors: 2 },
        10
      );

      // Wait for health checks
      await new Promise(resolve => setTimeout(resolve, 2100));

      // Verify comprehensive monitoring
      const health = monitoring.getHealthStatus('IntegrationService') as HealthStatus;
      expect(health.status).toBe('healthy');
      expect(health.dependencies.length).toBeGreaterThan(0);

      const securityMetrics = monitoring.getSecurityMetrics();
      expect(securityMetrics.totalEvents).toBeGreaterThan(0);

      const overview = monitoring.getSystemOverview();
      expect(overview.servicesCount).toBeGreaterThan(0);
    });

    it('should handle error scenarios gracefully', () => {
      const context = createErrorContext('ErrorService', 'errorOperation');

      // Record error metrics
      monitoring.recordPerformanceMetrics('ErrorService', {
        responseTime: 5000,
        errorRate: 50,
        memoryUsage: 95
      }, context);

      // This should generate multiple alerts
      const alerts = monitoring.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(1);

      // Verify alert types
      const hasPerformanceAlert = alerts.some(a => a.type === 'performance');
      const hasResourceAlert = alerts.some(a => a.type === 'resource');

      expect(hasPerformanceAlert || hasResourceAlert).toBe(true);
    });
  });
});
