/**
 * Monitoring Dashboard Service
 * Provides comprehensive monitoring dashboards and reporting
 */

import { MonitoringService, HealthStatus, Alert, SecurityMetrics } from './monitoring';
import { Logger, LogContext } from './logger';

export interface DashboardConfig {
  refreshInterval: number;
  maxAlerts: number;
  maxSecurityEvents: number;
  enableRealTimeUpdates: boolean;
  dashboardUrl?: string;
}

export interface DashboardData {
  timestamp: Date;
  systemOverview: {
    overallHealth: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    servicesCount: number;
    alertsCount: number;
    securityEventsCount: number;
    averageResponseTime: number;
    totalRequests: number;
  };
  healthStatuses: HealthStatus[];
  activeAlerts: Alert[];
  securityMetrics: SecurityMetrics;
  performanceMetrics: {
    responseTimeChart: Array<{ timestamp: Date; value: number }>;
    memoryUsageChart: Array<{ timestamp: Date; value: number }>;
    cpuUsageChart: Array<{ timestamp: Date; value: number }>;
    errorRateChart: Array<{ timestamp: Date; value: number }>;
  };
  topIssues: {
    mostFrequentAlerts: Array<{ type: string; count: number }>;
    highestRiskServices: Array<{ service: string; riskScore: number }>;
    recentSecurityEvents: Array<{ type: string; severity: string; count: number }>;
  };
}

export class MonitoringDashboard {
  private monitoring: MonitoringService;
  private logger: Logger;
  private config: DashboardConfig;
  private dashboardData: DashboardData | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private historicalData: {
    responseTimes: Array<{ timestamp: Date; value: number }>;
    memoryUsage: Array<{ timestamp: Date; value: number }>;
    cpuUsage: Array<{ timestamp: Date; value: number }>;
    errorRates: Array<{ timestamp: Date; value: number }>;
  } = {
    responseTimes: [],
    memoryUsage: [],
    cpuUsage: [],
    errorRates: []
  };

  constructor(monitoring: MonitoringService, logger: Logger, config: DashboardConfig) {
    this.monitoring = monitoring;
    this.logger = logger;
    this.config = config;

    if (config.enableRealTimeUpdates) {
      this.startRealTimeUpdates();
    }
  }

  /**
   * Get current dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    if (!this.dashboardData || this.isDataStale()) {
      await this.refreshDashboardData();
    }

    return this.dashboardData!;
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboardData(): Promise<void> {
    try {
      const systemOverview = this.monitoring.getSystemOverview();
      const healthStatuses = this.monitoring.getHealthStatus();
      const activeAlerts = this.monitoring.getActiveAlerts();
      const securityMetrics = this.monitoring.getSecurityMetrics();

      // Update historical data
      this.updateHistoricalData();

      // Calculate top issues
      const topIssues = this.calculateTopIssues(activeAlerts, securityMetrics, healthStatuses);

      this.dashboardData = {
        timestamp: new Date(),
        systemOverview,
        healthStatuses: Array.isArray(healthStatuses) ? healthStatuses : [healthStatuses],
        activeAlerts: activeAlerts.slice(0, this.config.maxAlerts),
        securityMetrics,
        performanceMetrics: {
          responseTimeChart: this.historicalData.responseTimes.slice(-50), // Last 50 data points
          memoryUsageChart: this.historicalData.memoryUsage.slice(-50),
          cpuUsageChart: this.historicalData.cpuUsage.slice(-50),
          errorRateChart: this.historicalData.errorRates.slice(-50)
        },
        topIssues
      };

      this.logger.info('Dashboard data refreshed', {
        service: 'MonitoringDashboard',
        operation: 'refreshDashboardData',
        metadata: {
          alertsCount: activeAlerts.length,
          servicesCount: healthStatuses.length,
          securityEventsCount: securityMetrics.totalEvents
        }
      });

    } catch (error) {
      this.logger.error('Failed to refresh dashboard data', {
        service: 'MonitoringDashboard',
        operation: 'refreshDashboardData'
      }, error as Error);
      throw error;
    }
  }

  /**
   * Get health status summary
   */
  getHealthSummary(): {
    totalServices: number;
    healthyServices: number;
    degradedServices: number;
    unhealthyServices: number;
    criticalServices: number;
    uptimePercentage: number;
  } {
    const healthStatuses = this.monitoring.getHealthStatus();
    const services = Array.isArray(healthStatuses) ? healthStatuses : [healthStatuses];

    const summary = {
      totalServices: services.length,
      healthyServices: services.filter(s => s.status === 'healthy').length,
      degradedServices: services.filter(s => s.status === 'degraded').length,
      unhealthyServices: services.filter(s => s.status === 'unhealthy').length,
      criticalServices: services.filter(s => s.status === 'critical').length,
      uptimePercentage: 0
    };

    // Calculate uptime percentage
    if (summary.totalServices > 0) {
      const totalUptime = services.reduce((sum, s) => sum + (s.uptime || 0), 0);
      const averageUptime = totalUptime / summary.totalServices;
      summary.uptimePercentage = Math.round((averageUptime / (24 * 60 * 60)) * 100); // Assuming 24h period
    }

    return summary;
  }

  /**
   * Get security overview
   */
  getSecurityOverview(): {
    totalEvents: number;
    criticalEvents: number;
    highEvents: number;
    mediumEvents: number;
    lowEvents: number;
    blockedAttempts: number;
    averageRiskScore: number;
    topThreatTypes: Array<{ type: string; count: number }>;
  } {
    const securityMetrics = this.monitoring.getSecurityMetrics();

    const totalEvents = securityMetrics.totalEvents;
    const criticalEvents = securityMetrics.eventsBySeverity.critical || 0;
    const highEvents = securityMetrics.eventsBySeverity.high || 0;
    const mediumEvents = securityMetrics.eventsBySeverity.medium || 0;
    const lowEvents = securityMetrics.eventsBySeverity.low || 0;

    const averageRiskScore = securityMetrics.recentThreats.length > 0
      ? securityMetrics.recentThreats.reduce((sum, threat) => sum + threat.riskScore, 0) / securityMetrics.recentThreats.length
      : 0;

    const topThreatTypes = Object.entries(securityMetrics.eventsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    return {
      totalEvents,
      criticalEvents,
      highEvents,
      mediumEvents,
      lowEvents,
      blockedAttempts: securityMetrics.blockedAttempts,
      averageRiskScore: Math.round(averageRiskScore),
      topThreatTypes
    };
  }

  /**
   * Get performance overview
   */
  getPerformanceOverview(): {
    averageResponseTime: number;
    peakResponseTime: number;
    averageMemoryUsage: number;
    peakMemoryUsage: number;
    averageCpuUsage: number;
    peakCpuUsage: number;
    totalRequests: number;
    errorRate: number;
    throughput: number;
  } {
    const systemOverview = this.monitoring.getSystemOverview();

    // Calculate metrics from historical data
    const responseTimes = this.historicalData.responseTimes.slice(-100); // Last 100 data points
    const memoryUsage = this.historicalData.memoryUsage.slice(-100);
    const cpuUsage = this.historicalData.cpuUsage.slice(-100);
    const errorRates = this.historicalData.errorRates.slice(-100);

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, point) => sum + point.value, 0) / responseTimes.length
      : 0;

    const peakResponseTime = responseTimes.length > 0
      ? Math.max(...responseTimes.map(point => point.value))
      : 0;

    const averageMemoryUsage = memoryUsage.length > 0
      ? memoryUsage.reduce((sum, point) => sum + point.value, 0) / memoryUsage.length
      : 0;

    const peakMemoryUsage = memoryUsage.length > 0
      ? Math.max(...memoryUsage.map(point => point.value))
      : 0;

    const averageCpuUsage = cpuUsage.length > 0
      ? cpuUsage.reduce((sum, point) => sum + point.value, 0) / cpuUsage.length
      : 0;

    const peakCpuUsage = cpuUsage.length > 0
      ? Math.max(...cpuUsage.map(point => point.value))
      : 0;

    const averageErrorRate = errorRates.length > 0
      ? errorRates.reduce((sum, point) => sum + point.value, 0) / errorRates.length
      : 0;

    return {
      averageResponseTime: Math.round(averageResponseTime),
      peakResponseTime,
      averageMemoryUsage: Math.round(averageMemoryUsage),
      peakMemoryUsage,
      averageCpuUsage: Math.round(averageCpuUsage),
      peakCpuUsage,
      totalRequests: systemOverview.totalRequests,
      errorRate: Math.round(averageErrorRate * 100) / 100,
      throughput: Math.round(systemOverview.totalRequests / (this.historicalData.responseTimes.length || 1))
    };
  }

  /**
   * Get alert summary
   */
  getAlertSummary(): {
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    mediumAlerts: number;
    lowAlerts: number;
    alertsByType: Record<string, number>;
    recentAlerts: Alert[];
  } {
    const activeAlerts = this.monitoring.getActiveAlerts();

    const alertsBySeverity = activeAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const alertsByType = activeAlerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentAlerts = activeAlerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      totalAlerts: activeAlerts.length,
      criticalAlerts: alertsBySeverity.critical || 0,
      highAlerts: alertsBySeverity.high || 0,
      mediumAlerts: alertsBySeverity.medium || 0,
      lowAlerts: alertsBySeverity.low || 0,
      alertsByType,
      recentAlerts
    };
  }

  /**
   * Generate monitoring report
   */
  async generateReport(timeRange: { start: Date; end: Date }): Promise<{
    summary: string;
    recommendations: string[];
    metrics: Record<string, any>;
    alerts: Alert[];
    securityEvents: any[];
  }> {
    const dashboardData = await this.getDashboardData();

    const summary = this.generateSummaryText(dashboardData);
    const recommendations = this.generateRecommendations(dashboardData);

    return {
      summary,
      recommendations,
      metrics: {
        systemOverview: dashboardData.systemOverview,
        performanceOverview: this.getPerformanceOverview(),
        securityOverview: this.getSecurityOverview(),
        alertSummary: this.getAlertSummary()
      },
      alerts: dashboardData.activeAlerts,
      securityEvents: dashboardData.securityMetrics.recentThreats
    };
  }

  /**
   * Start real-time updates
   */
  startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.refreshDashboardData().catch(error => {
        this.logger.error('Failed to update dashboard in real-time', {
          service: 'MonitoringDashboard',
          operation: 'realTimeUpdate'
        }, error);
      });
    }, this.config.refreshInterval);
  }

  /**
   * Stop real-time updates
   */
  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Shutdown dashboard
   */
  shutdown(): void {
    this.stopRealTimeUpdates();
    this.logger.info('Monitoring Dashboard shutdown', {
      service: 'MonitoringDashboard',
      operation: 'shutdown'
    });
  }

  // Private methods
  private isDataStale(): boolean {
    if (!this.dashboardData) return true;
    const age = Date.now() - this.dashboardData.timestamp.getTime();
    return age > this.config.refreshInterval;
  }

  private updateHistoricalData(): void {
    const systemOverview = this.monitoring.getSystemOverview();
    const now = new Date();

    // Add current metrics to historical data
    this.historicalData.responseTimes.push({
      timestamp: now,
      value: systemOverview.averageResponseTime
    });

    // Keep only recent data (last 1000 points)
    this.historicalData.responseTimes = this.historicalData.responseTimes.slice(-1000);

    // Add memory and CPU data (simplified for demo)
    this.historicalData.memoryUsage.push({
      timestamp: now,
      value: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
    });
    this.historicalData.memoryUsage = this.historicalData.memoryUsage.slice(-1000);

    this.historicalData.cpuUsage.push({
      timestamp: now,
      value: Math.random() * 100 // Placeholder
    });
    this.historicalData.cpuUsage = this.historicalData.cpuUsage.slice(-1000);

    this.historicalData.errorRates.push({
      timestamp: now,
      value: Math.random() * 5 // Placeholder
    });
    this.historicalData.errorRates = this.historicalData.errorRates.slice(-1000);
  }

  private calculateTopIssues(
    alerts: Alert[],
    securityMetrics: SecurityMetrics,
    healthStatuses: HealthStatus[]
  ): DashboardData['topIssues'] {
    // Most frequent alerts
    const alertTypeCounts = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentAlerts = Object.entries(alertTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    // Highest risk services (based on alerts and health status)
    const serviceRiskScores: Record<string, number> = {};

    alerts.forEach(alert => {
      const severityScore = { low: 1, medium: 2, high: 3, critical: 4 }[alert.severity] || 1;
      serviceRiskScores[alert.service] = (serviceRiskScores[alert.service] || 0) + severityScore;
    });

    healthStatuses.forEach(health => {
      const healthScore = { healthy: 0, degraded: 1, unhealthy: 2, critical: 3 }[health.status] || 0;
      serviceRiskScores[health.service] = (serviceRiskScores[health.service] || 0) + healthScore;
    });

    const highestRiskServices = Object.entries(serviceRiskScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([service, riskScore]) => ({ service, riskScore }));

    // Recent security events by type and severity
    const recentSecurityEvents = Object.entries(securityMetrics.eventsByType)
      .map(([type, count]) => {
        const severity = this.getSeverityForEventType(type, securityMetrics);
        return { type, severity, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      mostFrequentAlerts,
      highestRiskServices,
      recentSecurityEvents
    };
  }

  private getSeverityForEventType(type: string, metrics: SecurityMetrics): string {
    // Simplified severity mapping - in production this would be more sophisticated
    const highSeverityTypes = ['security_violation', 'anomaly_detected', 'authentication_failure'];
    const mediumSeverityTypes = ['authorization_failure', 'data_modification'];

    if (highSeverityTypes.includes(type)) return 'high';
    if (mediumSeverityTypes.includes(type)) return 'medium';
    return 'low';
  }

  private generateSummaryText(data: DashboardData): string {
    const { systemOverview, activeAlerts, securityMetrics } = data;
    const healthSummary = this.getHealthSummary();
    const securityOverview = this.getSecurityOverview();

    let summary = `System Status: ${systemOverview.overallHealth.toUpperCase()}\n\n`;

    summary += `Health Overview:\n`;
    summary += `- Total Services: ${healthSummary.totalServices}\n`;
    summary += `- Healthy: ${healthSummary.healthyServices}, Degraded: ${healthSummary.degradedServices}\n`;
    summary += `- Unhealthy: ${healthSummary.unhealthyServices}, Critical: ${healthSummary.criticalServices}\n`;
    summary += `- Average Uptime: ${healthSummary.uptimePercentage}%\n\n`;

    summary += `Performance Metrics:\n`;
    summary += `- Average Response Time: ${systemOverview.averageResponseTime}ms\n`;
    summary += `- Total Requests: ${systemOverview.totalRequests}\n\n`;

    summary += `Security Status:\n`;
    summary += `- Total Security Events: ${securityOverview.totalEvents}\n`;
    summary += `- Blocked Attempts: ${securityOverview.blockedAttempts}\n`;
    summary += `- Active Alerts: ${activeAlerts.length}\n`;

    return summary;
  }

  private generateRecommendations(data: DashboardData): string[] {
    const recommendations: string[] = [];
    const { systemOverview, activeAlerts, securityMetrics } = data;
    const healthSummary = this.getHealthSummary();
    const securityOverview = this.getSecurityOverview();

    // Health recommendations
    if (healthSummary.criticalServices > 0) {
      recommendations.push('CRITICAL: Address critical service failures immediately');
    }

    if (healthSummary.unhealthyServices > 0) {
      recommendations.push('HIGH: Investigate unhealthy services and restore functionality');
    }

    if (healthSummary.uptimePercentage < 99) {
      recommendations.push('MEDIUM: Review service uptime and implement redundancy measures');
    }

    // Performance recommendations
    if (systemOverview.averageResponseTime > 1000) {
      recommendations.push('HIGH: Optimize response times - consider caching and load balancing');
    }

    // Security recommendations
    if (securityOverview.criticalEvents > 0) {
      recommendations.push('CRITICAL: Investigate critical security events immediately');
    }

    if (securityOverview.blockedAttempts > 0) {
      recommendations.push('HIGH: Review blocked security attempts and strengthen defenses');
    }

    if (activeAlerts.length > 10) {
      recommendations.push('MEDIUM: Address high alert volume - review monitoring thresholds');
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('System operating normally - continue monitoring');
    }

    return recommendations;
  }
}

// Factory function
export function createMonitoringDashboard(
  monitoring: MonitoringService,
  logger: Logger,
  config?: Partial<DashboardConfig>
): MonitoringDashboard {
  const defaultConfig: DashboardConfig = {
    refreshInterval: 30000, // 30 seconds
    maxAlerts: 50,
    maxSecurityEvents: 100,
    enableRealTimeUpdates: true
  };

  return new MonitoringDashboard(monitoring, logger, { ...defaultConfig, ...config });
}
