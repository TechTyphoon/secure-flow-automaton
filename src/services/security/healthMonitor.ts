import { BaseSecurityService } from './apiClient';
import { SecurityConfigManager } from './config';
import { SecurityNotificationService } from './notifications';

export interface ServiceHealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: string;
  message: string;
  configuration: {
    enabled: boolean;
    hasCredentials: boolean;
    endpoint: string;
  };
}

export class SecurityHealthMonitor {
  private config = SecurityConfigManager.getInstance();
  private notifications = new SecurityNotificationService();
  private healthHistory = new Map<string, ServiceHealthStatus[]>();

  async checkAllServices(): Promise<ServiceHealthStatus[]> {
    const services = ['sonarqube', 'snyk', 'github'] as const;
    const healthChecks = await Promise.allSettled(
      services.map(service => this.checkServiceHealth(service))
    );

    const results: ServiceHealthStatus[] = [];
    
    healthChecks.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          service: services[index],
          status: 'unhealthy',
          responseTime: -1,
          lastCheck: new Date().toISOString(),
          message: `Health check failed: ${result.reason?.message || 'Unknown error'}`,
          configuration: {
            enabled: false,
            hasCredentials: false,
            endpoint: 'unknown'
          }
        });
      }
    });

    // Store health history
    results.forEach(status => {
      const history = this.healthHistory.get(status.service) || [];
      history.push(status);
      // Keep only last 24 hours of checks
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const filtered = history.filter(h => 
        new Date(h.lastCheck).getTime() > oneDayAgo
      );
      this.healthHistory.set(status.service, filtered);
    });

    // Send alerts for unhealthy services
    await this.processHealthAlerts(results);

    return results;
  }

  private async checkServiceHealth(service: 'sonarqube' | 'snyk' | 'github'): Promise<ServiceHealthStatus> {
    const serviceConfig = this.config.getServiceConfig(service);
    const startTime = Date.now();
    
    const baseStatus: ServiceHealthStatus = {
      service,
      status: 'unhealthy',
      responseTime: -1,
      lastCheck: new Date().toISOString(),
      message: '',
      configuration: {
        enabled: this.config.isServiceEnabled(service),
        hasCredentials: !!serviceConfig.token,
        endpoint: this.getServiceEndpoint(service, serviceConfig)
      }
    };

    if (!serviceConfig.enabled) {
      return {
        ...baseStatus,
        status: 'degraded',
        message: 'Service not enabled - using mock data'
      };
    }

    if (!serviceConfig.token) {
      return {
        ...baseStatus,
        status: 'unhealthy',
        message: 'No API token configured'
      };
    }

    try {
      const success = await this.performHealthCheck(service, serviceConfig);
      const responseTime = Date.now() - startTime;

      return {
        ...baseStatus,
        status: success ? 'healthy' : 'degraded',
        responseTime,
        message: success ? 'Service operational' : 'Service responding but may have issues'
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        ...baseStatus,
        status: 'unhealthy',
        responseTime,
        message: `Health check failed: ${error.message}`
      };
    }
  }

  private async performHealthCheck(service: string, config: any): Promise<boolean> {
    switch (service) {
      case 'sonarqube':
        return this.checkSonarQubeHealth(config);
      case 'snyk':
        return this.checkSnykHealth(config);
      case 'github':
        return this.checkGitHubHealth(config);
      default:
        return false;
    }
  }

  private async checkSonarQubeHealth(config: any): Promise<boolean> {
    try {
      const response = await fetch(`${config.url}/api/system/ping`, {
        headers: { 'Authorization': `Bearer ${config.token}` },
        signal: AbortSignal.timeout(10000)
      });
      return response.ok && (await response.text()).includes('pong');
    } catch {
      return false;
    }
  }

  private async checkSnykHealth(config: any): Promise<boolean> {
    try {
      const response = await fetch('https://snyk.io/api/v1/user/me', {
        headers: { 'Authorization': `token ${config.token}` },
        signal: AbortSignal.timeout(10000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async checkGitHubHealth(config: any): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${config.token}` },
        signal: AbortSignal.timeout(10000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private getServiceEndpoint(service: string, config: any): string {
    switch (service) {
      case 'sonarqube': return config.url || 'https://sonarcloud.io';
      case 'snyk': return 'https://snyk.io';
      case 'github': return 'https://api.github.com';
      default: return 'unknown';
    }
  }

  private async processHealthAlerts(statuses: ServiceHealthStatus[]): Promise<void> {
    const unhealthyServices = statuses.filter(s => s.status === 'unhealthy');
    
    if (unhealthyServices.length > 0) {
      const alert = {
        id: `health-${Date.now()}`,
        type: 'container_issue' as const,
        severity: 'high' as const,
        title: `${unhealthyServices.length} Security Service(s) Unhealthy`,
        description: `The following services are not responding properly:\n${
          unhealthyServices.map(s => `• ${s.service.toUpperCase()}: ${s.message}`).join('\n')
        }`,
        source: 'system' as const,
        createdAt: new Date().toISOString(),
        metadata: { unhealthyServices }
      };

      await this.notifications.sendAlert(alert);
    }
  }

  getServiceHistory(service: string): ServiceHealthStatus[] {
    return this.healthHistory.get(service) || [];
  }

  getOverallSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    healthyServices: number;
    totalServices: number;
    message: string;
  } {
    const allServices = ['sonarqube', 'snyk', 'github'];
    const enabledServices = allServices.filter(s => 
      this.config.isServiceEnabled(s as any)
    );

    if (enabledServices.length === 0) {
      return {
        status: 'degraded',
        healthyServices: 0,
        totalServices: 0,
        message: 'No security services configured - running in mock mode'
      };
    }

    const latestStatuses = enabledServices.map(service => {
      const history = this.healthHistory.get(service);
      return history ? history[history.length - 1] : null;
    }).filter(Boolean);

    const healthyCount = latestStatuses.filter(s => s?.status === 'healthy').length;
    const unhealthyCount = latestStatuses.filter(s => s?.status === 'unhealthy').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    let message: string;

    if (unhealthyCount === 0) {
      overallStatus = 'healthy';
      message = 'All security services operational';
    } else if (healthyCount > 0) {
      overallStatus = 'degraded';
      message = `${unhealthyCount} of ${enabledServices.length} services have issues`;
    } else {
      overallStatus = 'unhealthy';
      message = 'All security services are experiencing issues';
    }

    return {
      status: overallStatus,
      healthyServices: healthyCount,
      totalServices: enabledServices.length,
      message
    };
  }
}
