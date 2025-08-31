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
      docker: {
        enabled: !!(import.meta.env.VITE_DOCKER_TOKEN || import.meta.env.DOCKER_TOKEN),
        username: import.meta.env.VITE_DOCKER_USERNAME || import.meta.env.DOCKER_USERNAME || '',
        token: import.meta.env.VITE_DOCKER_TOKEN || import.meta.env.DOCKER_TOKEN || '',
        registry: import.meta.env.VITE_DOCKER_REGISTRY || import.meta.env.DOCKER_REGISTRY || 'docker.io',
      },
      aws: {
        enabled: !!(import.meta.env.VITE_AWS_ACCESS_KEY_ID || import.meta.env.AWS_ACCESS_KEY_ID),
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || import.meta.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || import.meta.env.AWS_SECRET_ACCESS_KEY || '',
        region: import.meta.env.VITE_AWS_REGION || import.meta.env.AWS_REGION || 'us-east-1',
        s3Bucket: import.meta.env.VITE_AWS_S3_BUCKET || import.meta.env.AWS_S3_BUCKET || 'secureflow-automaton-prod',
      },
      database: {
        enabled: !!(import.meta.env.DATABASE_URL || import.meta.env.VITE_SUPABASE_URL),
        url: import.meta.env.DATABASE_URL || '',
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '',
        supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '',
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
        },
        email: {
          enabled: !!(import.meta.env.VITE_SMTP_SERVER || import.meta.env.SMTP_SERVER),
          smtpServer: import.meta.env.VITE_SMTP_SERVER || import.meta.env.SMTP_SERVER || '',
          smtpPort: parseInt(import.meta.env.VITE_SMTP_PORT || import.meta.env.SMTP_PORT || '587'),
          username: import.meta.env.VITE_SMTP_USERNAME || import.meta.env.SMTP_USERNAME || '',
          password: import.meta.env.VITE_SMTP_PASSWORD || import.meta.env.SMTP_PASSWORD || '',
          from: import.meta.env.VITE_SMTP_FROM || import.meta.env.SMTP_FROM || '',
        }
      },
      monitoring: {
        sentry: {
          enabled: !!(import.meta.env.VITE_SENTRY_DSN || import.meta.env.SENTRY_DSN),
          dsn: import.meta.env.VITE_SENTRY_DSN || import.meta.env.SENTRY_DSN || '',
        },
        datadog: {
          enabled: !!(import.meta.env.VITE_DATADOG_API_KEY || import.meta.env.DATADOG_API_KEY),
          apiKey: import.meta.env.VITE_DATADOG_API_KEY || import.meta.env.DATADOG_API_KEY || '',
          appKey: import.meta.env.VITE_DATADOG_APP_KEY || import.meta.env.DATADOG_APP_KEY || '',
        },
        newrelic: {
          enabled: !!(import.meta.env.VITE_NEWRELIC_LICENSE_KEY || import.meta.env.NEWRELIC_LICENSE_KEY),
          licenseKey: import.meta.env.VITE_NEWRELIC_LICENSE_KEY || import.meta.env.NEWRELIC_LICENSE_KEY || '',
          accountId: import.meta.env.VITE_NEWRELIC_ACCOUNT_ID || import.meta.env.NEWRELIC_ACCOUNT_ID || '',
        },
        logrocket: {
          enabled: !!(import.meta.env.VITE_LOGROCKET_PUBLIC_KEY || import.meta.env.LOGROCKET_PUBLIC_KEY),
          publicKey: import.meta.env.VITE_LOGROCKET_PUBLIC_KEY || import.meta.env.LOGROCKET_PUBLIC_KEY || '',
        },
      },
      quantum: {
        enabled: !!(import.meta.env.VITE_QUANTUM_EDGE_ENDPOINT || import.meta.env.QUANTUM_EDGE_ENDPOINT),
        edgeEndpoint: import.meta.env.VITE_QUANTUM_EDGE_ENDPOINT || import.meta.env.QUANTUM_EDGE_ENDPOINT || '',
        apiKey: import.meta.env.VITE_QUANTUM_API_KEY || import.meta.env.QUANTUM_API_KEY || '',
        financialEnabled: import.meta.env.VITE_QUANTUM_FINANCIAL_ENABLED === 'true',
        healthcareEnabled: import.meta.env.VITE_QUANTUM_HEALTHCARE_ENABLED === 'true',
        supplyChainEnabled: import.meta.env.VITE_QUANTUM_SUPPLY_CHAIN_ENABLED === 'true',
        energyEnabled: import.meta.env.VITE_QUANTUM_ENERGY_ENABLED === 'true',
        aerospaceEnabled: import.meta.env.VITE_QUANTUM_AEROSPACE_ENABLED === 'true',
        entertainmentEnabled: import.meta.env.VITE_QUANTUM_ENTERTAINMENT_ENABLED === 'true',
      },
      fallbacks: {
        useMockData: false, // Disable mock data for real data testing
        cacheTimeout: 300000, // 5 minutes
        retryAttempts: 3,
      }
    };
  }

  getServiceConfig(service: 'sonarqube' | 'snyk' | 'github' | 'docker' | 'aws' | 'database'): SecurityConfig['sonarqube'] | SecurityConfig['snyk'] | SecurityConfig['github'] | SecurityConfig['docker'] | SecurityConfig['aws'] | SecurityConfig['database'] {
    return this.config[service];
  }

  isServiceEnabled(service: 'sonarqube' | 'snyk' | 'github' | 'docker' | 'aws' | 'database'): boolean {
    return this.config[service].enabled;
  }

  getNotificationConfig(): SecurityConfig['notifications'] {
    return this.config.notifications;
  }

  getMonitoringConfig(): SecurityConfig['monitoring'] {
    return this.config.monitoring;
  }

  getQuantumConfig(): SecurityConfig['quantum'] {
    return this.config.quantum;
  }

  shouldUseMockData(service: string): boolean {
    // Always return false - never use mock data in production
    return false;
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
  docker: {
    enabled: boolean;
    username: string;
    token: string;
    registry: string;
  };
  aws: {
    enabled: boolean;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
  };
  database: {
    enabled: boolean;
    url: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
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
    email: {
      enabled: boolean;
      smtpServer: string;
      smtpPort: number;
      username: string;
      password: string;
      from: string;
    };
  };
  monitoring: {
    sentry: {
      enabled: boolean;
      dsn: string;
    };
    datadog: {
      enabled: boolean;
      apiKey: string;
      appKey: string;
    };
    newrelic: {
      enabled: boolean;
      licenseKey: string;
      accountId: string;
    };
    logrocket: {
      enabled: boolean;
      publicKey: string;
    };
  };
  quantum: {
    enabled: boolean;
    edgeEndpoint: string;
    apiKey: string;
    financialEnabled: boolean;
    healthcareEnabled: boolean;
    supplyChainEnabled: boolean;
    energyEnabled: boolean;
    aerospaceEnabled: boolean;
    entertainmentEnabled: boolean;
  };
  fallbacks: {
    useMockData: boolean;
    cacheTimeout: number;
    retryAttempts: number;
  };
}
