# Monitoring Service API Documentation

## Overview

The Monitoring Service provides comprehensive system monitoring, health checks, performance tracking, and alerting capabilities for the Secure Flow Automaton platform.

## Architecture

```
MonitoringService
├── HealthMonitor (Service Health)
├── PerformanceMonitor (Performance Metrics)
├── AlertManager (Alert Management)
├── MetricCollector (Metric Collection)
├── NotificationService (Alert Notifications)
├── DashboardService (Monitoring Dashboard)
└── AuditLogger (Audit Logging)
```

## Core Interface

```typescript
interface MonitoringService {
  // Health monitoring
  registerHealthCheck(serviceId: string, check: HealthCheck): Promise<void>
  checkServiceHealth(serviceId: string): Promise<HealthStatus>
  getOverallHealth(): Promise<SystemHealth>
  getServiceMetrics(serviceId: string): Promise<ServiceMetrics>

  // Performance monitoring
  recordPerformanceMetrics(service: string, metrics: PerformanceContext, context?: LogContext): Promise<void>
  getPerformanceMetrics(service: string, timeRange?: TimeRange): Promise<PerformanceMetrics[]>

  // Security monitoring
  recordSecurityEvent(event: SecurityEvent, context?: LogContext): Promise<void>
  getSecurityEvents(timeRange?: TimeRange, filters?: SecurityEventFilters): Promise<SecurityEvent[]>

  // Alert management
  createAlert(alert: Alert): Promise<string>
  acknowledgeAlert(alertId: string): Promise<void>
  resolveAlert(alertId: string): Promise<void>
  getActiveAlerts(): Promise<Alert[]>
  getAlertsHistory(timeRange?: TimeRange): Promise<Alert[]>

  // Dashboard
  getDashboardMetrics(): Promise<DashboardMetrics>
  generateReport(config: ReportConfig): Promise<MonitoringReport>
}
```

## API Methods

### Health Monitoring

#### registerHealthCheck

Registers a health check for a service.

**Parameters:**
- `serviceId` (string): Unique service identifier
- `check` (HealthCheck): Health check configuration

**Returns:** `Promise<void>`

**Example:**
```typescript
await monitoring.registerHealthCheck('security-assistant', {
  name: 'Security Assistant Health',
  type: 'http',
  endpoint: 'http://localhost:3001/health',
  interval: 30000, // 30 seconds
  timeout: 5000,   // 5 seconds
  retries: 3,
  failureThreshold: 2
});
```

#### checkServiceHealth

Checks the health of a specific service.

**Parameters:**
- `serviceId` (string): Service identifier

**Returns:** `Promise<HealthStatus>`

**Example:**
```typescript
const health = await monitoring.checkServiceHealth('security-assistant');

console.log(`Status: ${health.status}`);
console.log(`Response Time: ${health.responseTime}ms`);
console.log(`Last Check: ${health.lastCheck}`);

if (health.status !== 'healthy') {
  console.log(`Issues: ${health.issues.join(', ')}`);
}
```

#### getOverallHealth

Retrieves the overall system health status.

**Returns:** `Promise<SystemHealth>`

**Example:**
```typescript
const systemHealth = await monitoring.getOverallHealth();

console.log(`Overall Status: ${systemHealth.overallStatus}`);
console.log(`Total Services: ${systemHealth.totalServices}`);
console.log(`Healthy Services: ${systemHealth.healthyServices}`);
console.log(`Active Alerts: ${systemHealth.activeAlerts}`);
console.log(`System Uptime: ${systemHealth.uptime}ms`);
```

### Performance Monitoring

#### recordPerformanceMetrics

Records performance metrics for a service.

**Parameters:**
- `service` (string): Service name
- `metrics` (PerformanceContext): Performance metrics
- `context` (LogContext): Optional context information

**Returns:** `Promise<void>`

**Example:**
```typescript
await monitoring.recordPerformanceMetrics('security-assistant', {
  responseTime: 150,
  memoryUsage: 45.2,
  cpuUsage: 12.5,
  operation: 'processQuery',
  timestamp: new Date()
}, {
  service: 'SecurityAssistant',
  operation: 'recordPerformanceMetrics',
  userId: 'user123',
  correlationId: 'corr-456'
});
```

#### getPerformanceMetrics

Retrieves performance metrics for a service within a time range.

**Parameters:**
- `service` (string): Service name
- `timeRange` (TimeRange): Optional time range filter

**Returns:** `Promise<PerformanceMetrics[]>`

**Example:**
```typescript
const metrics = await monitoring.getPerformanceMetrics('security-assistant', {
  start: new Date(Date.now() - 3600000), // 1 hour ago
  end: new Date()
});

metrics.forEach(metric => {
  console.log(`Time: ${metric.timestamp}`);
  console.log(`Response Time: ${metric.responseTime}ms`);
  console.log(`Memory Usage: ${metric.memoryUsage}%`);
  console.log(`CPU Usage: ${metric.cpuUsage}%`);
});
```

### Security Monitoring

#### recordSecurityEvent

Records a security event.

**Parameters:**
- `event` (SecurityEvent): Security event data
- `context` (LogContext): Optional context information

**Returns:** `Promise<void>`

**Example:**
```typescript
await monitoring.recordSecurityEvent({
  type: 'authentication_failure',
  severity: 'medium',
  description: 'Failed login attempt',
  source: 'identity-provider',
  userId: 'user123',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0',
  timestamp: new Date(),
  metadata: {
    failureReason: 'invalid_password',
    attemptCount: 3
  }
});
```

#### getSecurityEvents

Retrieves security events with optional filtering.

**Parameters:**
- `timeRange` (TimeRange): Optional time range filter
- `filters` (SecurityEventFilters): Optional event filters

**Returns:** `Promise<SecurityEvent[]>`

**Example:**
```typescript
const events = await monitoring.getSecurityEvents({
  start: new Date(Date.now() - 86400000), // 24 hours ago
  end: new Date()
}, {
  severity: ['high', 'critical'],
  type: ['authentication_failure', 'unauthorized_access'],
  source: 'identity-provider'
});

console.log(`Found ${events.length} security events`);
```

### Alert Management

#### createAlert

Creates a new alert.

**Parameters:**
- `alert` (Alert): Alert configuration

**Returns:** `Promise<string>` - Alert ID

**Example:**
```typescript
const alertId = await monitoring.createAlert({
  title: 'High Memory Usage',
  description: 'Memory usage exceeded 90% threshold',
  severity: 'high',
  source: 'performance-monitor',
  service: 'security-assistant',
  condition: 'memory_usage > 90',
  threshold: 90,
  currentValue: 95,
  timestamp: new Date(),
  tags: ['memory', 'performance', 'critical']
});

console.log(`Alert created: ${alertId}`);
```

#### acknowledgeAlert

Acknowledges an active alert.

**Parameters:**
- `alertId` (string): Alert identifier

**Returns:** `Promise<void>`

**Example:**
```typescript
await monitoring.acknowledgeAlert('alert-123');
console.log('Alert acknowledged');
```

#### resolveAlert

Resolves an active alert.

**Parameters:**
- `alertId` (string): Alert identifier

**Returns:** `Promise<void>`

**Example:**
```typescript
await monitoring.resolveAlert('alert-123');
console.log('Alert resolved');
```

#### getActiveAlerts

Retrieves all active alerts.

**Returns:** `Promise<Alert[]>`

**Example:**
```typescript
const activeAlerts = await monitoring.getActiveAlerts();

console.log(`Active alerts: ${activeAlerts.length}`);

activeAlerts.forEach(alert => {
  console.log(`- ${alert.title} (${alert.severity})`);
  console.log(`  ${alert.description}`);
  console.log(`  Service: ${alert.service}`);
});
```

### Dashboard and Reporting

#### getDashboardMetrics

Retrieves dashboard metrics for real-time monitoring.

**Returns:** `Promise<DashboardMetrics>`

**Example:**
```typescript
const dashboard = await monitoring.getDashboardMetrics();

console.log('System Overview:');
console.log(`- Overall Health: ${dashboard.systemHealth.overall}`);
console.log(`- Services: ${dashboard.systemHealth.healthy}/${dashboard.systemHealth.total}`);
console.log(`- Active Alerts: ${dashboard.alerts.total}`);

console.log('Performance:');
console.log(`- Response Time: ${dashboard.performance.responseTime}ms`);
console.log(`- Memory Usage: ${dashboard.performance.memoryEfficiency}%`);
console.log(`- CPU Usage: ${dashboard.performance.cpuEfficiency}%`);
```

#### generateReport

Generates a comprehensive monitoring report.

**Parameters:**
- `config` (ReportConfig): Report configuration

**Returns:** `Promise<MonitoringReport>`

**Example:**
```typescript
const report = await monitoring.generateReport({
  type: 'comprehensive',
  timeRange: {
    start: new Date(Date.now() - 604800000), // 7 days ago
    end: new Date()
  },
  includeCharts: true,
  format: 'pdf',
  sections: ['health', 'performance', 'security', 'alerts']
});

console.log(`Report generated: ${report.id}`);
console.log(`Sections: ${report.sections.length}`);
console.log(`Total Issues: ${report.summary.totalIssues}`);
```

## Data Types

### HealthStatus

```typescript
interface HealthStatus {
  service: string;              // Service identifier
  status: HealthState;          // Current health state
  timestamp: Date;              // Last check timestamp
  responseTime: number;         // Response time in milliseconds
  uptime: number;               // Service uptime in milliseconds
  version?: string;             // Service version
  dependencies?: DependencyHealth[]; // Dependent services health
  metrics: {
    requestsTotal: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
    queueDepth: number;
  };
  issues: string[];             // Current issues or warnings
  lastCheck: Date;              // Last health check time
}
```

### PerformanceContext

```typescript
interface PerformanceContext {
  responseTime?: number;        // Response time in milliseconds
  memoryUsage?: number;         // Memory usage percentage
  cpuUsage?: number;            // CPU usage percentage
  operation?: string;           // Operation name
  timestamp?: Date;             // Measurement timestamp
  metadata?: Record<string, any>; // Additional performance data
}
```

### SecurityEvent

```typescript
interface SecurityEvent {
  id: string;                   // Unique event identifier
  type: SecurityEventType;      // Event type
  severity: SecuritySeverity;   // Event severity
  description: string;          // Event description
  source: string;               // Event source service
  userId?: string;              // Associated user ID
  sessionId?: string;           // Associated session ID
  ipAddress?: string;           // Client IP address
  userAgent?: string;           // Client user agent
  timestamp: Date;              // Event timestamp
  metadata?: Record<string, any>; // Additional event data
  correlationId?: string;       // Correlation identifier
}
```

### Alert

```typescript
interface Alert {
  id: string;                   // Unique alert identifier
  title: string;                // Alert title
  description: string;          // Alert description
  severity: AlertSeverity;      // Alert severity
  status: AlertStatus;          // Alert status
  source: string;               // Alert source
  service: string;              // Affected service
  condition: string;            // Alert condition
  threshold: number;            // Threshold value
  currentValue: number;         // Current value
  timestamp: Date;              // Alert creation time
  acknowledgedAt?: Date;        // Acknowledgment time
  resolvedAt?: Date;            // Resolution time
  acknowledgedBy?: string;      // User who acknowledged
  resolvedBy?: string;          // User who resolved
  tags: string[];               // Alert tags
  metadata?: Record<string, any>; // Additional alert data
}
```

## Configuration

### Monitoring Configuration

```typescript
interface MonitoringConfig {
  // Health check settings
  healthCheckInterval: number;    // Health check interval (ms)
  healthCheckTimeout: number;     // Health check timeout (ms)
  failureThreshold: number;       // Failure threshold for unhealthy status
  successThreshold: number;       // Success threshold for healthy status

  // Alert settings
  alertRetentionPeriod: number;   // Alert retention period (ms)
  alertEscalationEnabled: boolean; // Enable alert escalation
  alertEscalationLevels: EscalationLevel[]; // Escalation levels

  // Performance settings
  performanceRetentionPeriod: number; // Performance data retention (ms)
  performanceSamplingRate: number; // Performance sampling rate
  performanceAggregationInterval: number; // Data aggregation interval (ms)

  // Security settings
  securityEventRetentionPeriod: number; // Security event retention (ms)
  securityAlertThreshold: number; // Security alert threshold
  sensitiveDataMasking: boolean; // Mask sensitive data in logs

  // Notification settings
  notificationChannels: NotificationChannel[]; // Enabled notification channels
  notificationRetryAttempts: number; // Notification retry attempts
  notificationTimeout: number; // Notification timeout (ms)

  // Dashboard settings
  dashboardRefreshInterval: number; // Dashboard refresh interval (ms)
  dashboardDataRetention: number; // Dashboard data retention (ms)
  dashboardRealTimeEnabled: boolean; // Enable real-time updates
}
```

### Default Configuration

```typescript
const defaultConfig: MonitoringConfig = {
  healthCheckInterval: 30000,     // 30 seconds
  healthCheckTimeout: 5000,       // 5 seconds
  failureThreshold: 3,
  successThreshold: 2,

  alertRetentionPeriod: 2592000000, // 30 days
  alertEscalationEnabled: true,
  alertEscalationLevels: [
    { delay: 300000, channels: ['email'] },     // 5 minutes
    { delay: 1800000, channels: ['sms', 'slack'] }, // 30 minutes
    { delay: 3600000, channels: ['call', 'pager'] }  // 1 hour
  ],

  performanceRetentionPeriod: 604800000, // 7 days
  performanceSamplingRate: 0.1,     // 10% sampling
  performanceAggregationInterval: 60000, // 1 minute

  securityEventRetentionPeriod: 2592000000, // 30 days
  securityAlertThreshold: 10,
  sensitiveDataMasking: true,

  notificationChannels: ['email', 'slack', 'webhook'],
  notificationRetryAttempts: 3,
  notificationTimeout: 10000,

  dashboardRefreshInterval: 30000, // 30 seconds
  dashboardDataRetention: 86400000, // 24 hours
  dashboardRealTimeEnabled: true
};
```

## Usage Examples

### Complete Health Monitoring Setup

```typescript
import { MonitoringService } from './services/common/monitoring';

async function setupHealthMonitoring() {
  const monitoring = new MonitoringService();

  // Register health checks for all services
  await monitoring.registerHealthCheck('security-assistant', {
    name: 'Security Assistant',
    type: 'http',
    endpoint: 'http://localhost:3001/health',
    interval: 30000,
    timeout: 5000
  });

  await monitoring.registerHealthCheck('identity-provider', {
    name: 'Identity Provider',
    type: 'http',
    endpoint: 'http://localhost:3002/health',
    interval: 30000,
    timeout: 5000
  });

  await monitoring.registerHealthCheck('database', {
    name: 'Database',
    type: 'custom',
    check: async () => {
      try {
        await database.query('SELECT 1');
        return { status: 'healthy', responseTime: 10 };
      } catch (error) {
        return { status: 'unhealthy', error: error.message };
      }
    },
    interval: 60000,
    timeout: 10000
  });

  console.log('Health monitoring setup complete');
}
```

### Performance Monitoring Integration

```typescript
class PerformanceTrackedService {
  private monitoring: MonitoringService;

  constructor(monitoring: MonitoringService) {
    this.monitoring = monitoring;
  }

  async processRequest(request: any) {
    const startTime = Date.now();

    try {
      // Process the request
      const result = await this.doProcessing(request);

      // Record performance metrics
      const responseTime = Date.now() - startTime;

      await this.monitoring.recordPerformanceMetrics('my-service', {
        responseTime,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: this.getCpuUsage(),
        operation: 'processRequest',
        timestamp: new Date()
      });

      return result;

    } catch (error) {
      // Record error metrics
      await this.monitoring.recordPerformanceMetrics('my-service', {
        responseTime: Date.now() - startTime,
        operation: 'processRequest',
        error: true,
        timestamp: new Date()
      });

      throw error;
    }
  }

  private getCpuUsage(): number {
    // Implementation for CPU usage calculation
    return Math.random() * 100; // Placeholder
  }
}
```

### Security Event Monitoring

```typescript
class SecurityEventMonitor {
  private monitoring: MonitoringService;

  constructor(monitoring: MonitoringService) {
    this.monitoring = monitoring;
  }

  async logAuthenticationEvent(userId: string, success: boolean, context: any) {
    await this.monitoring.recordSecurityEvent({
      type: success ? 'authentication_success' : 'authentication_failure',
      severity: success ? 'low' : 'medium',
      description: success ? 'User authenticated successfully' : 'Authentication failed',
      source: 'identity-provider',
      userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: new Date(),
      metadata: {
        success,
        method: context.method,
        failureReason: success ? undefined : context.failureReason
      }
    });
  }

  async logAccessEvent(userId: string, resource: string, action: string, allowed: boolean) {
    await this.monitoring.recordSecurityEvent({
      type: allowed ? 'authorized_access' : 'unauthorized_access',
      severity: allowed ? 'low' : 'high',
      description: `${allowed ? 'Authorized' : 'Unauthorized'} access to ${resource}`,
      source: 'authorization-service',
      userId,
      timestamp: new Date(),
      metadata: {
        resource,
        action,
        allowed,
        policyId: 'default-policy'
      }
    });
  }
}
```

### Alert Management Workflow

```typescript
class AlertManager {
  private monitoring: MonitoringService;

  constructor(monitoring: MonitoringService) {
    this.monitoring = monitoring;
  }

  async createPerformanceAlert(service: string, metric: string, value: number, threshold: number) {
    const alertId = await this.monitoring.createAlert({
      title: `High ${metric} in ${service}`,
      description: `${metric} exceeded threshold: ${value} > ${threshold}`,
      severity: value > threshold * 1.5 ? 'critical' : 'high',
      source: 'performance-monitor',
      service,
      condition: `${metric} > ${threshold}`,
      threshold,
      currentValue: value,
      timestamp: new Date(),
      tags: ['performance', service, metric]
    });

    console.log(`Performance alert created: ${alertId}`);
    return alertId;
  }

  async handleAlertLifecycle(alertId: string) {
    // Acknowledge alert
    await this.monitoring.acknowledgeAlert(alertId);
    console.log('Alert acknowledged');

    // Simulate resolution after some time
    setTimeout(async () => {
      await this.monitoring.resolveAlert(alertId);
      console.log('Alert resolved');
    }, 300000); // 5 minutes
  }

  async getAlertSummary() {
    const activeAlerts = await this.monitoring.getActiveAlerts();
    const alertsBySeverity = activeAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: activeAlerts.length,
      bySeverity: alertsBySeverity,
      critical: alertsBySeverity.critical || 0,
      high: alertsBySeverity.high || 0,
      medium: alertsBySeverity.medium || 0,
      low: alertsBySeverity.low || 0
    };
  }
}
```

### Dashboard Integration

```typescript
class MonitoringDashboard {
  private monitoring: MonitoringService;
  private updateInterval: NodeJS.Timeout;

  constructor(monitoring: MonitoringService) {
    this.monitoring = monitoring;
    this.startRealTimeUpdates();
  }

  async getDashboardData() {
    const [systemHealth, activeAlerts, performance] = await Promise.all([
      this.monitoring.getOverallHealth(),
      this.monitoring.getActiveAlerts(),
      this.monitoring.getPerformanceMetrics('all', {
        start: new Date(Date.now() - 3600000), // Last hour
        end: new Date()
      })
    ]);

    return {
      timestamp: new Date(),
      systemHealth: {
        overall: systemHealth.overallStatus,
        services: systemHealth.totalServices,
        healthy: systemHealth.healthyServices,
        degraded: systemHealth.degradedServices,
        unhealthy: systemHealth.unhealthyServices,
        uptime: systemHealth.uptime
      },
      alerts: {
        total: activeAlerts.length,
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        high: activeAlerts.filter(a => a.severity === 'high').length,
        medium: activeAlerts.filter(a => a.severity === 'medium').length,
        low: activeAlerts.filter(a => a.severity === 'low').length
      },
      performance: {
        averageResponseTime: this.calculateAverage(performance, 'responseTime'),
        averageMemoryUsage: this.calculateAverage(performance, 'memoryUsage'),
        averageCpuUsage: this.calculateAverage(performance, 'cpuUsage'),
        totalRequests: performance.length
      }
    };
  }

  private startRealTimeUpdates() {
    this.updateInterval = setInterval(async () => {
      try {
        const data = await this.getDashboardData();
        this.broadcastUpdate(data);
      } catch (error) {
        console.error('Dashboard update failed:', error.message);
      }
    }, 30000); // Update every 30 seconds
  }

  private calculateAverage(metrics: any[], field: string): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + (metric[field] || 0), 0);
    return Math.round(sum / metrics.length * 100) / 100;
  }

  private broadcastUpdate(data: any) {
    // Broadcast to connected WebSocket clients or update UI
    console.log('Dashboard updated:', data.timestamp);
  }

  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
```

## Error Handling

### Monitoring-Specific Errors

```typescript
try {
  await monitoring.checkServiceHealth('unknown-service');
} catch (error) {
  switch (error.constructor.name) {
    case 'ServiceNotFoundError':
      console.log('Service not found in monitoring registry');
      break;

    case 'HealthCheckTimeoutError':
      console.log('Health check timed out');
      break;

    case 'MonitoringConfigError':
      console.log('Invalid monitoring configuration');
      break;

    default:
      console.error('Monitoring error:', error.message);
  }
}
```

### Performance Monitoring Errors

```typescript
try {
  await monitoring.recordPerformanceMetrics('service', metrics);
} catch (error) {
  if (error.message.includes('Invalid metrics')) {
    console.log('Invalid performance metrics provided');
  } else if (error.message.includes('Storage failure')) {
    console.log('Failed to store performance metrics');
    // Implement retry logic or fallback storage
  } else {
    console.error('Performance monitoring error:', error.message);
  }
}
```

## Best Practices

### Health Check Design

1. **Fast Checks**: Health checks should complete quickly (< 5 seconds)
2. **Non-Intrusive**: Avoid impacting service performance
3. **Comprehensive**: Check all critical dependencies
4. **Idempotent**: Multiple calls should not affect service state
5. **Informative**: Provide detailed status information

### Alert Management

1. **Clear Thresholds**: Define clear alert thresholds
2. **Avoid Noise**: Prevent alert fatigue with appropriate thresholds
3. **Escalation**: Implement alert escalation for critical issues
4. **Auto-Resolution**: Automatically resolve alerts when issues are fixed
5. **Context**: Include relevant context in alert descriptions

### Performance Monitoring

1. **Sampling**: Use appropriate sampling rates for high-volume metrics
2. **Aggregation**: Aggregate metrics to reduce storage requirements
3. **Retention**: Implement appropriate data retention policies
4. **Correlation**: Correlate metrics with business events
5. **Anomaly Detection**: Implement automatic anomaly detection

### Security Monitoring

1. **Data Protection**: Mask sensitive data in security events
2. **Access Control**: Control access to security monitoring data
3. **Retention**: Implement appropriate security event retention
4. **Correlation**: Correlate security events across services
5. **Compliance**: Ensure compliance with security standards

## Troubleshooting

### Health Check Issues

```typescript
// Debug health check problems
const debugHealthCheck = async (serviceId: string) => {
  try {
    console.log(`Checking health for: ${serviceId}`);
    const health = await monitoring.checkServiceHealth(serviceId);

    console.log(`Status: ${health.status}`);
    console.log(`Response Time: ${health.responseTime}ms`);
    console.log(`Last Check: ${health.lastCheck}`);

    if (health.issues.length > 0) {
      console.log('Issues:');
      health.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    // Check service configuration
    const config = await monitoring.getServiceConfig(serviceId);
    console.log('Health check config:', config);

  } catch (error) {
    console.error('Health check debug failed:', error.message);
  }
};
```

### Alert Configuration Issues

```typescript
// Debug alert configuration
const debugAlertConfig = async () => {
  try {
    const config = await monitoring.getAlertConfig();

    console.log('Alert Configuration:');
    console.log(`- Retention Period: ${config.retentionPeriod}ms`);
    console.log(`- Escalation Enabled: ${config.escalationEnabled}`);
    console.log(`- Notification Channels: ${config.notificationChannels.join(', ')}`);

    // Test alert creation
    const testAlertId = await monitoring.createAlert({
      title: 'Test Alert',
      description: 'Testing alert system',
      severity: 'low',
      source: 'debug',
      service: 'monitoring-service',
      condition: 'test = true',
      threshold: 1,
      currentValue: 1,
      timestamp: new Date(),
      tags: ['test', 'debug']
    });

    console.log(`Test alert created: ${testAlertId}`);

    // Clean up test alert
    await monitoring.resolveAlert(testAlertId);
    console.log('Test alert cleaned up');

  } catch (error) {
    console.error('Alert config debug failed:', error.message);
  }
};
```

### Performance Monitoring Issues

```typescript
// Debug performance monitoring
const debugPerformance = async (service: string) => {
  try {
    console.log(`Performance metrics for: ${service}`);

    const metrics = await monitoring.getPerformanceMetrics(service, {
      start: new Date(Date.now() - 3600000), // Last hour
      end: new Date()
    });

    if (metrics.length === 0) {
      console.log('No performance metrics found');
      return;
    }

    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
    const avgCpuUsage = metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length;

    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Average Memory Usage: ${avgMemoryUsage.toFixed(2)}%`);
    console.log(`Average CPU Usage: ${avgCpuUsage.toFixed(2)}%`);
    console.log(`Total Measurements: ${metrics.length}`);

    // Check for anomalies
    const anomalies = metrics.filter(m => m.responseTime > avgResponseTime * 2);
    if (anomalies.length > 0) {
      console.log(`Found ${anomalies.length} response time anomalies`);
    }

  } catch (error) {
    console.error('Performance debug failed:', error.message);
  }
};
```

## Version History

- **v1.0.0**: Basic health monitoring and alerting
- **v1.1.0**: Performance metrics collection
- **v1.2.0**: Security event monitoring
- **v1.3.0**: Alert escalation and notification
- **v2.0.0**: Real-time monitoring dashboard
- **v2.1.0**: Advanced performance profiling
- **v2.2.0**: Automated anomaly detection
- **v2.3.0**: Custom health check plugins
- **v3.0.0**: Comprehensive monitoring dashboard
- **v3.1.0**: Advanced alerting and escalation
- **v3.2.0**: Performance optimization recommendations
- **v4.0.0**: AI-powered monitoring and insights
- **v4.1.0**: Enhanced error handling and monitoring capabilities
