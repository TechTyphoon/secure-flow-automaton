// Enhanced Security Service Configuration Manager
// This will help manage API keys and provide better fallbacks

export class SecurityConfigManager {
  private static instance: SecurityConfigManager;
  private config: SecurityConfig;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  static getInstance(): SecurityConfigManager {
    if (!this.instance) {
      this.instance = new SecurityConfigManager();
    }
    return this.instance;
  }

  private loadConfiguration(): SecurityConfig {
    return {
      sonarqube: {
        enabled: !!(import.meta.env.VITE_SONAR_TOKEN || import.meta.env.SONAR_TOKEN),
        url: import.meta.env.VITE_SONAR_URL || import.meta.env.SONAR_URL || 'https://sonarcloud.io',
        token: import.meta.env.VITE_SONAR_TOKEN || import.meta.env.SONAR_TOKEN || '',
        projectKey: import.meta.env.VITE_SONAR_PROJECT_KEY || import.meta.env.SONAR_PROJECT_KEY || 'TechTyphoon_secure-flow-automaton',
        timeout: 30000,
      },
      snyk: {
        enabled: !!(import.meta.env.VITE_SNYK_TOKEN || import.meta.env.SNYK_TOKEN),
        token: import.meta.env.VITE_SNYK_TOKEN || import.meta.env.SNYK_TOKEN || '',
        orgId: import.meta.env.VITE_SNYK_ORG_ID || import.meta.env.SNYK_ORG_ID || 'TechTyphoon',
        timeout: 30000,
      },
      github: {
        enabled: !!(import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.GITHUB_TOKEN),
        token: import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.GITHUB_TOKEN || '',
        owner: 'TechTyphoon',
        repo: 'secure-flow-automaton',
      },
      notifications: {
        slack: {
          enabled: !!(import.meta.env.VITE_SLACK_WEBHOOK_URL || import.meta.env.SLACK_WEBHOOK_URL),
          webhookUrl: import.meta.env.VITE_SLACK_WEBHOOK_URL || import.meta.env.SLACK_WEBHOOK_URL || '',
          channel: import.meta.env.VITE_SLACK_CHANNEL || import.meta.env.SLACK_CHANNEL || '#security-alerts',
        },
        teams: {
          enabled: !!(import.meta.env.VITE_TEAMS_WEBHOOK_URL || import.meta.env.TEAMS_WEBHOOK_URL),
          webhookUrl: import.meta.env.VITE_TEAMS_WEBHOOK_URL || import.meta.env.TEAMS_WEBHOOK_URL || '',
        }
      },
      fallbacks: {
        useMockData: import.meta.env.MODE === 'development',
        cacheTimeout: 300000, // 5 minutes
        retryAttempts: 3,
      }
    };
  }

  getServiceConfig(service: 'sonarqube' | 'snyk' | 'github'): any {
    return this.config[service];
  }

  isServiceEnabled(service: 'sonarqube' | 'snyk' | 'github'): boolean {
    return this.config[service].enabled;
  }

  getNotificationConfig(): any {
    return this.config.notifications;
  }

  shouldUseMockData(service: string): boolean {
    const serviceConfig = this.config[service as keyof SecurityConfig];
    return !serviceConfig || !(serviceConfig as any).enabled || this.config.fallbacks.useMockData;
  }
}

interface SecurityConfig {
  sonarqube: {
    enabled: boolean;
    url: string;
    token: string;
    projectKey: string;
    timeout: number;
  };
  snyk: {
    enabled: boolean;
    token: string;
    orgId: string;
    timeout: number;
  };
  github: {
    enabled: boolean;
    token: string;
    owner: string;
    repo: string;
  };
  notifications: {
    slack: {
      enabled: boolean;
      webhookUrl: string;
      channel: string;
    };
    teams: {
      enabled: boolean;
      webhookUrl: string;
    };
  };
  fallbacks: {
    useMockData: boolean;
    cacheTimeout: number;
    retryAttempts: number;
  };
}
