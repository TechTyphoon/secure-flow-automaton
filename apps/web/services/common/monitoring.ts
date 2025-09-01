/**
 * Comprehensive Monitoring Service for Secure Flow Automaton
 *
 * Features:
 * - Real-time metrics collection and analysis
 * - Health check monitoring
 * - Performance alerting
 * - Security event monitoring
 * - SLA tracking
 * - Resource usage monitoring
 * - Incident detection and alerting
 */

import { Logger, LogLevel, LogContext, SecurityContext, PerformanceContext, AuditContext } from './logger';
import { BaseError, createErrorContext, ErrorHandler } from './errors';

export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number; // in milliseconds
  healthCheckInterval: number; // in milliseconds
  alertThresholds: AlertThresholds;
  retentionPeriod: number; // in days
  enableExternalMonitoring: boolean;
  externalEndpoint?: string;
}

export interface AlertThresholds {
  responseTimeMs: number;
  errorRatePercent: number;
  memoryUsagePercent: number;
  cpuUsagePercent: number;
  securityEventsPerHour: number;
}

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  lastCheck: Date;
  uptime: number;
  metrics: ServiceMetrics;
  dependencies: DependencyStatus[];
}

export interface ServiceMetrics {
  requestsTotal: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  queueDepth: number;
}

export interface DependencyStatus {
  name: string;
  type: 'database' | 'cache' | 'external_api' | 'message_queue' | 'storage';
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: Date;
  error?: string;
}

export interface Alert {
  id: string;
  type: 'performance' | 'security' | 'health' | 'resource' | 'dependency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  service: string;
  context: LogContext;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  resolution?: string;
  metadata: Record<string, any>;
}

export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  blockedAttempts: number;
  riskScoreDistribution: Record<string, number>;
  geoDistribution: Record<string, number>;
  recentThreats: SecurityEvent[];
}

export interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  source: string;
  timestamp: Date;
  details: Record<string, any>;
  riskScore: number;
}

export class MonitoringService {
  private logger: Logger;
  private config: MonitoringConfig;
  private metrics: Map<string, ServiceMetrics> = new Map();
  private healthStatuses: Map<string, HealthStatus> = new Map();
  private alerts: Alert[] = [];
  private securityEvents: SecurityEvent[] = [];
  private intervals: NodeJS.Timeout[] = [];

  constructor(logger: Logger, config: MonitoringConfig) {
    this.logger = logger;
    this.config = config;

    if (config.enabled) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring(): void {
    this.logger.info('Initializing Monitoring Service', createErrorContext('MonitoringService', 'initialize'));

    // Start metrics collection
    this.intervals.push(setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsInterval));

    // Start health checks
    this.intervals.push(setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval));

    // Clean up old data
    this.intervals.push(setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000)); // Daily cleanup
  }

  /**
   * Record a security event
   */
  recordSecurityEvent(
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context: Partial<LogContext>,
    details: Record<string, any> = {},
    riskScore: number = 0
  ): void {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      severity,
      source: context.service || 'unknown',
      timestamp: new Date(),
      details,
      riskScore
    };

    this.securityEvents.push(event);

    // Keep only recent events (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.securityEvents = this.securityEvents.filter(e => e.timestamp > oneDayAgo);

    // Log security event
    this.logger.security(`Security event: ${type}`, {
      ...context,
      security: {
        threatLevel: severity,
        eventType: type as any,
        riskScore
      } as SecurityContext,
      metadata: {
        ...context.metadata,
        eventId: event.id,
        securityMetrics: this.getSecurityMetrics()
      }
    });

    // Check for security alerts
    this.checkSecurityAlerts(event);
  }

  /**
   * Record performance metrics
   */
  recordPerformanceMetrics(
    service: string,
    metrics: Partial<PerformanceContext>,
    context?: Partial<LogContext>
  ): void {
    const currentMetrics = this.metrics.get(service) || this.createDefaultMetrics();

    // Update metrics
    if (metrics.responseTime) {
      currentMetrics.requestsTotal++;
      currentMetrics.averageResponseTime =
        (currentMetrics.averageResponseTime * (currentMetrics.requestsTotal - 1) + metrics.responseTime) /
        currentMetrics.requestsTotal;
    }

    if (metrics.memoryUsage) {
      currentMetrics.memoryUsage = metrics.memoryUsage;
    }

    if (metrics.cpuUsage) {
      currentMetrics.cpuUsage = metrics.cpuUsage;
    }

    this.metrics.set(service, currentMetrics);

    // Check performance thresholds
    this.checkPerformanceThresholds(service, currentMetrics, context);
  }

  /**
   * Register a health check
   */
  registerHealthCheck(
    serviceName: string,
    healthCheckFn: () => Promise<HealthStatus>
  ): void {
    // Store health check function for periodic execution
    this.healthCheckFunctions.set(serviceName, healthCheckFn);
  }

  /**
   * Get current health status
   */
  getHealthStatus(serviceName?: string): HealthStatus | HealthStatus[] {
    if (serviceName) {
      return this.healthStatuses.get(serviceName) || this.createDefaultHealthStatus(serviceName);
    }

    return Array.from(this.healthStatuses.values());
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): SecurityMetrics {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const riskScoreDistribution: Record<string, number> = {};
    const geoDistribution: Record<string, number> = {};

    this.securityEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;

      // Risk score distribution
      const riskBucket = Math.floor(event.riskScore / 20) * 20;
      riskScoreDistribution[`${riskBucket}-${riskBucket + 19}`] =
        (riskScoreDistribution[`${riskBucket}-${riskBucket + 19}`] || 0) + 1;

      // Geo distribution
      if (event.details.geoLocation?.country) {
        geoDistribution[event.details.geoLocation.country] =
          (geoDistribution[event.details.geoLocation.country] || 0) + 1;
      }
    });

    return {
      totalEvents: this.securityEvents.length,
      eventsByType,
      eventsBySeverity,
      blockedAttempts: this.securityEvents.filter(e => e.details.blocked).length,
      riskScoreDistribution,
      geoDistribution,
      recentThreats: this.securityEvents.slice(-10) // Last 10 events
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.metadata.acknowledgedBy = userId;
      alert.metadata.acknowledgedAt = new Date();

      this.logger.info(`Alert acknowledged: ${alert.message}`, {
        service: 'MonitoringService',
        operation: 'acknowledgeAlert',
        userId,
        metadata: { alertId, alertType: alert.type }
      });

      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolution: string, userId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolution = resolution;
      alert.metadata.resolvedBy = userId;
      alert.metadata.resolvedAt = new Date();

      this.logger.info(`Alert resolved: ${alert.message}`, {
        service: 'MonitoringService',
        operation: 'resolveAlert',
        userId,
        metadata: { alertId, resolution }
      });

      return true;
    }
    return false;
  }

  /**
   * Get system overview
   */
  getSystemOverview(): {
    overallHealth: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    servicesCount: number;
    alertsCount: number;
    securityEventsCount: number;
    averageResponseTime: number;
    totalRequests: number;
  } {
    const healthStatuses = Array.from(this.healthStatuses.values());
    const servicesCount = healthStatuses.length;
    const alertsCount = this.getActiveAlerts().length;
    const securityEventsCount = this.securityEvents.length;

    // Calculate overall health
    let overallHealth: 'healthy' | 'degraded' | 'unhealthy' | 'critical' = 'healthy';
    if (healthStatuses.some(h => h.status === 'critical')) {
      overallHealth = 'critical';
    } else if (healthStatuses.some(h => h.status === 'unhealthy')) {
      overallHealth = 'unhealthy';
    } else if (healthStatuses.some(h => h.status === 'degraded') || alertsCount > 0) {
      overallHealth = 'degraded';
    }

    // Calculate metrics
    const allMetrics = Array.from(this.metrics.values());
    const averageResponseTime = allMetrics.length > 0
      ? allMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / allMetrics.length
      : 0;
    const totalRequests = allMetrics.reduce((sum, m) => sum + m.requestsTotal, 0);

    return {
      overallHealth,
      servicesCount,
      alertsCount,
      securityEventsCount,
      averageResponseTime,
      totalRequests
    };
  }

  /**
   * Shutdown monitoring service
   */
  shutdown(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.logger.info('Monitoring Service shutdown', createErrorContext('MonitoringService', 'shutdown'));
  }

  // Private methods
  private healthCheckFunctions: Map<string, () => Promise<HealthStatus>> = new Map();

  private async collectMetrics(): void {
    try {
      // Collect system metrics
      const systemMetrics = await this.collectSystemMetrics();

      // Update service metrics
      this.metrics.forEach((metrics, service) => {
        metrics.memoryUsage = systemMetrics.memoryUsage;
        metrics.cpuUsage = systemMetrics.cpuUsage;
        metrics.requestsPerSecond = metrics.requestsTotal / (this.config.metricsInterval / 1000);
      });

    } catch (error) {
      this.logger.error('Failed to collect metrics', createErrorContext('MonitoringService', 'collectMetrics'), error as Error);
    }
  }

  private async performHealthChecks(): void {
    for (const [serviceName, healthCheckFn] of this.healthCheckFunctions) {
      try {
        const healthStatus = await healthCheckFn();
        this.healthStatuses.set(serviceName, healthStatus);

        // Log health status changes
        if (healthStatus.status !== 'healthy') {
          this.createAlert(
            'health',
            healthStatus.status === 'critical' ? 'critical' : 'medium',
            `Service ${serviceName} is ${healthStatus.status}`,
            serviceName,
            createErrorContext(serviceName, 'healthCheck'),
            { healthStatus }
          );
        }
      } catch (error) {
        this.logger.error(`Health check failed for ${serviceName}`, createErrorContext('MonitoringService', 'performHealthChecks'), error as Error);
      }
    }
  }

  private checkPerformanceThresholds(
    service: string,
    metrics: ServiceMetrics,
    context?: Partial<LogContext>
  ): void {
    const thresholds = this.config.alertThresholds;

    if (metrics.averageResponseTime > thresholds.responseTimeMs) {
      this.createAlert(
        'performance',
        'medium',
        `High response time in ${service}: ${metrics.averageResponseTime}ms`,
        service,
        context || createErrorContext(service, 'performanceCheck'),
        { metrics, threshold: thresholds.responseTimeMs }
      );
    }

    if (metrics.memoryUsage > thresholds.memoryUsagePercent) {
      this.createAlert(
        'resource',
        'high',
        `High memory usage in ${service}: ${metrics.memoryUsage}%`,
        service,
        context || createErrorContext(service, 'performanceCheck'),
        { metrics, threshold: thresholds.memoryUsagePercent }
      );
    }

    if (metrics.cpuUsage > thresholds.cpuUsagePercent) {
      this.createAlert(
        'resource',
        'high',
        `High CPU usage in ${service}: ${metrics.cpuUsage}%`,
        service,
        context || createErrorContext(service, 'performanceCheck'),
        { metrics, threshold: thresholds.cpuUsagePercent }
      );
    }
  }

  private checkSecurityAlerts(event: SecurityEvent): void {
    const recentEvents = this.securityEvents.filter(e =>
      e.timestamp > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );

    if (recentEvents.length > this.config.alertThresholds.securityEventsPerHour) {
      this.createAlert(
        'security',
        'high',
        `High security event rate: ${recentEvents.length} events/hour`,
        event.source,
        createErrorContext(event.source, 'securityCheck'),
        { recentEventsCount: recentEvents.length, threshold: this.config.alertThresholds.securityEventsPerHour }
      );
    }
  }

  private createAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    message: string,
    service: string,
    context: LogContext,
    metadata: Record<string, any> = {}
  ): void {
    const alert: Alert = {
      id: this.generateEventId(),
      type,
      severity,
      message,
      service,
      context,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      metadata
    };

    this.alerts.push(alert);

    // Keep only recent alerts (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(a => a.timestamp > sevenDaysAgo);

    this.logger.warn(`Alert created: ${message}`, {
      ...context,
      metadata: {
        ...context.metadata,
        alertId: alert.id,
        alertType: type,
        alertSeverity: severity
      }
    });
  }

  private cleanupOldData(): void {
    const retentionDate = new Date(Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);

    // Clean old alerts
    this.alerts = this.alerts.filter(alert => alert.timestamp > retentionDate);

    // Clean old security events
    this.securityEvents = this.securityEvents.filter(event => event.timestamp > retentionDate);

    // Clean old metrics
    // Note: This is a simplified cleanup - in production you'd want more sophisticated retention
    this.metrics.clear();
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createDefaultMetrics(): ServiceMetrics {
    return {
      requestsTotal: 0,
      requestsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      activeConnections: 0,
      queueDepth: 0
    };
  }

  private createDefaultHealthStatus(serviceName: string): HealthStatus {
    return {
      service: serviceName,
      status: 'unknown',
      lastCheck: new Date(),
      uptime: 0,
      metrics: this.createDefaultMetrics(),
      dependencies: []
    };
  }

  private async collectSystemMetrics(): Promise<{ memoryUsage: number; cpuUsage: number }> {
    // In a real implementation, you'd use system monitoring libraries
    // For now, we'll use Node.js built-in metrics
    const memUsage = process.memoryUsage();
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    // CPU usage is more complex to measure accurately
    // This is a simplified implementation
    const cpuUsagePercent = Math.random() * 100; // Placeholder

    return {
      memoryUsage: Math.round(memoryUsagePercent),
      cpuUsage: Math.round(cpuUsagePercent)
    };
  }
}

// Factory function to create monitoring service
export function createMonitoringService(logger: Logger, config?: Partial<MonitoringConfig>): MonitoringService {
  const defaultConfig: MonitoringConfig = {
    enabled: true,
    metricsInterval: 30000, // 30 seconds
    healthCheckInterval: 60000, // 1 minute
    alertThresholds: {
      responseTimeMs: 1000,
      errorRatePercent: 5,
      memoryUsagePercent: 85,
      cpuUsagePercent: 80,
      securityEventsPerHour: 100
    },
    retentionPeriod: 30, // 30 days
    enableExternalMonitoring: false
  };

  return new MonitoringService(logger, { ...defaultConfig, ...config });
}

// Health check utilities
export class HealthChecks {
  static async databaseHealth(connectionString: string): Promise<DependencyStatus> {
    // Implement database health check
    try {
      // This would be actual database connection test
      const responseTime = Math.random() * 100; // Simulated
      return {
        name: 'database',
        type: 'database',
        status: responseTime < 50 ? 'up' : 'degraded',
        responseTime,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        name: 'database',
        type: 'database',
        status: 'down',
        lastCheck: new Date(),
        error: (error as Error).message
      };
    }
  }

  static async externalApiHealth(url: string, timeout: number = 5000): Promise<DependencyStatus> {
    try {
      const startTime = Date.now();
      const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
      const responseTime = Date.now() - startTime;

      return {
        name: url,
        type: 'external_api',
        status: response.ok ? 'up' : 'degraded',
        responseTime,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        name: url,
        type: 'external_api',
        status: 'down',
        lastCheck: new Date(),
        error: (error as Error).message
      };
    }
  }

  static memoryHealth(): { status: 'up' | 'degraded' | 'down'; usagePercent: number } {
    const memUsage = process.memoryUsage();
    const usagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    let status: 'up' | 'degraded' | 'down' = 'up';
    if (usagePercent > 90) {
      status = 'down';
    } else if (usagePercent > 80) {
      status = 'degraded';
    }

    return { status, usagePercent };
  }

  static cpuHealth(): { status: 'up' | 'degraded' | 'down'; usagePercent: number } {
    // Simplified CPU check - in production use a proper monitoring library
    const usagePercent = Math.random() * 100;

    let status: 'up' | 'degraded' | 'down' = 'up';
    if (usagePercent > 95) {
      status = 'down';
    } else if (usagePercent > 85) {
      status = 'degraded';
    }

    return { status, usagePercent };
  }
}
