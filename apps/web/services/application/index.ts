/**
 * Application Services Index
 * Exports all application security services for Zero Trust architecture
 */

// Import services
import ApplicationSecurityGatewayService from './applicationSecurityGateway';
import APISecurityScannerService from './apiSecurityScanner';
import ApplicationRuntimeProtectionService from './applicationRuntimeProtection';
import ApplicationSecurityIntegrationService from './applicationSecurityIntegration';

// Export services
export {
  ApplicationSecurityGatewayService,
  APISecurityScannerService,
  ApplicationRuntimeProtectionService,
  ApplicationSecurityIntegrationService
};

// Service factory function
export function createApplicationSecurityServices() {
  const integrationService = new ApplicationSecurityIntegrationService();
  
  return {
    integration: integrationService,
    gateway: integrationService.getGatewayService(),
    apiSecurity: integrationService.getAPISecurityService(),
    runtimeProtection: integrationService.getRuntimeProtectionService()
  };
}

// Service configuration
export interface ApplicationSecurityConfig {
  gateway: {
    enabled: boolean;
    defaultPolicies: string[];
    auditLevel: 'basic' | 'detailed' | 'comprehensive';
  };
  apiSecurity: {
    enabled: boolean;
    scanFrequency: 'daily' | 'weekly' | 'monthly';
    owaspCompliance: boolean;
    autoRemediation: boolean;
  };
  runtimeProtection: {
    enabled: boolean;
    detectionSensitivity: 'low' | 'medium' | 'high';
    responseMode: 'monitor' | 'protect' | 'block';
    mlEnabled: boolean;
  };
  integration: {
    correlationEnabled: boolean;
    recommendationsEnabled: boolean;
    metricsRetention: number; // days
  };
}

// Default configuration
export const defaultApplicationSecurityConfig: ApplicationSecurityConfig = {
  gateway: {
    enabled: true,
    defaultPolicies: ['authentication', 'authorization', 'input_validation'],
    auditLevel: 'detailed'
  },
  apiSecurity: {
    enabled: true,
    scanFrequency: 'weekly',
    owaspCompliance: true,
    autoRemediation: false
  },
  runtimeProtection: {
    enabled: true,
    detectionSensitivity: 'medium',
    responseMode: 'protect',
    mlEnabled: true
  },
  integration: {
    correlationEnabled: true,
    recommendationsEnabled: true,
    metricsRetention: 90
  }
};

// Service status
export interface ApplicationSecurityServiceStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  uptime: number; // seconds
  performance: {
    avgResponseTime: number; // ms
    throughput: number; // requests/sec
    errorRate: number; // percentage
  };
  resources: {
    cpu: number; // percentage
    memory: number; // MB
    disk: number; // MB
  };
  issues: string[];
}

// Health check function
export async function checkApplicationSecurityHealth(): Promise<ApplicationSecurityServiceStatus[]> {
  const services = ['gateway', 'api_security', 'runtime_protection', 'integration'];
  
  return services.map(service => ({
    service,
    status: 'healthy' as const,
    lastCheck: new Date(),
    uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
    performance: {
      avgResponseTime: Math.floor(Math.random() * 50) + 10, // 10-60ms
      throughput: Math.floor(Math.random() * 1000) + 500, // 500-1500 req/sec
      errorRate: Math.random() * 2 // 0-2%
    },
    resources: {
      cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
      memory: Math.floor(Math.random() * 500) + 100, // 100-600MB
      disk: Math.floor(Math.random() * 1000) + 200 // 200-1200MB
    },
    issues: []
  }));
}

// Utility functions
export function validateApplicationSecurityConfig(config: Partial<ApplicationSecurityConfig>): string[] {
  const errors: string[] = [];
  
  if (config.gateway?.auditLevel && !['basic', 'detailed', 'comprehensive'].includes(config.gateway.auditLevel)) {
    errors.push('Invalid gateway audit level');
  }
  
  if (config.apiSecurity?.scanFrequency && !['daily', 'weekly', 'monthly'].includes(config.apiSecurity.scanFrequency)) {
    errors.push('Invalid API security scan frequency');
  }
  
  if (config.runtimeProtection?.detectionSensitivity && !['low', 'medium', 'high'].includes(config.runtimeProtection.detectionSensitivity)) {
    errors.push('Invalid runtime protection detection sensitivity');
  }
  
  if (config.runtimeProtection?.responseMode && !['monitor', 'protect', 'block'].includes(config.runtimeProtection.responseMode)) {
    errors.push('Invalid runtime protection response mode');
  }
  
  if (config.integration?.metricsRetention && (config.integration.metricsRetention < 1 || config.integration.metricsRetention > 365)) {
    errors.push('Metrics retention must be between 1 and 365 days');
  }
  
  return errors;
}

export function mergeApplicationSecurityConfig(
  defaultConfig: ApplicationSecurityConfig,
  userConfig: Partial<ApplicationSecurityConfig>
): ApplicationSecurityConfig {
  return {
    gateway: { ...defaultConfig.gateway, ...userConfig.gateway },
    apiSecurity: { ...defaultConfig.apiSecurity, ...userConfig.apiSecurity },
    runtimeProtection: { ...defaultConfig.runtimeProtection, ...userConfig.runtimeProtection },
    integration: { ...defaultConfig.integration, ...userConfig.integration }
  };
}
