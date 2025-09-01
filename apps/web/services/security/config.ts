// Enhanced Security Service Configuration Manager
// This will help manage API keys and provide better fallbacks

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
        enabled: !!(process.env.VITE_SONAR_TOKEN || process.env.SONAR_TOKEN),
        url: process.env.VITE_SONAR_URL || process.env.SONAR_URL || 'https://sonarcloud.io',
        token: process.env.VITE_SONAR_TOKEN || process.env.SONAR_TOKEN || '',
        projectKey: process.env.VITE_SONAR_PROJECT_KEY || process.env.SONAR_PROJECT_KEY || 'TechTyphoon_secure-flow-automaton',
        timeout: 30000,
      },
      snyk: {
        enabled: !!(process.env.VITE_SNYK_TOKEN || process.env.SNYK_TOKEN),
        token: process.env.VITE_SNYK_TOKEN || process.env.SNYK_TOKEN || '',
        orgId: process.env.VITE_SNYK_ORG_ID || process.env.SNYK_ORG_ID || 'TechTyphoon',
        timeout: 30000,
      },
      github: {
        enabled: !!(process.env.VITE_GITHUB_TOKEN || process.env.GITHUB_TOKEN),
        token: process.env.VITE_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '',
        owner: 'TechTyphoon',
        repo: 'secure-flow-automaton',
      },
      docker: {
        enabled: !!(process.env.VITE_DOCKER_TOKEN || process.env.DOCKER_TOKEN),
        username: process.env.VITE_DOCKER_USERNAME || process.env.DOCKER_USERNAME || '',
        token: process.env.VITE_DOCKER_TOKEN || process.env.DOCKER_TOKEN || '',
        registry: process.env.VITE_DOCKER_REGISTRY || process.env.DOCKER_REGISTRY || 'docker.io',
      },
      aws: {
        enabled: !!(process.env.VITE_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID),
        accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.VITE_AWS_REGION || process.env.AWS_REGION || 'us-east-1',
        s3Bucket: process.env.VITE_AWS_S3_BUCKET || process.env.AWS_S3_BUCKET || 'secureflow-automaton-prod',
      },
      database: {
        enabled: !!(process.env.DATABASE_URL || process.env.VITE_SUPABASE_URL),
        url: process.env.DATABASE_URL || '',
        supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
        supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
      },
      notifications: {
        slack: {
          enabled: !!(process.env.VITE_SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL),
          webhookUrl: process.env.VITE_SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL || '',
          channel: process.env.VITE_SLACK_CHANNEL || process.env.SLACK_CHANNEL || '#security-alerts',
        },
        teams: {
          enabled: !!(process.env.VITE_TEAMS_WEBHOOK_URL || process.env.TEAMS_WEBHOOK_URL),
          webhookUrl: process.env.VITE_TEAMS_WEBHOOK_URL || process.env.TEAMS_WEBHOOK_URL || '',
        },
        email: {
          enabled: !!(process.env.VITE_SMTP_SERVER || process.env.SMTP_SERVER),
          smtpServer: process.env.VITE_SMTP_SERVER || process.env.SMTP_SERVER || '',
          smtpPort: parseInt(process.env.VITE_SMTP_PORT || process.env.SMTP_PORT || '587'),
          username: process.env.VITE_SMTP_USERNAME || process.env.SMTP_USERNAME || '',
          password: process.env.VITE_SMTP_PASSWORD || process.env.SMTP_PASSWORD || '',
          from: process.env.VITE_SMTP_FROM || process.env.SMTP_FROM || '',
        }
      },
      monitoring: {
        sentry: {
          enabled: !!(process.env.VITE_SENTRY_DSN || process.env.SENTRY_DSN),
          dsn: process.env.VITE_SENTRY_DSN || process.env.SENTRY_DSN || '',
        },
        datadog: {
          enabled: !!(process.env.VITE_DATADOG_API_KEY || process.env.DATADOG_API_KEY),
          apiKey: process.env.VITE_DATADOG_API_KEY || process.env.DATADOG_API_KEY || '',
          appKey: process.env.VITE_DATADOG_APP_KEY || process.env.DATADOG_APP_KEY || '',
        },
        newrelic: {
          enabled: !!(process.env.VITE_NEWRELIC_LICENSE_KEY || process.env.NEWRELIC_LICENSE_KEY),
          licenseKey: process.env.VITE_NEWRELIC_LICENSE_KEY || process.env.NEWRELIC_LICENSE_KEY || '',
          accountId: process.env.VITE_NEWRELIC_ACCOUNT_ID || process.env.NEWRELIC_ACCOUNT_ID || '',
        },
        logrocket: {
          enabled: !!(process.env.VITE_LOGROCKET_PUBLIC_KEY || process.env.LOGROCKET_PUBLIC_KEY),
          publicKey: process.env.VITE_LOGROCKET_PUBLIC_KEY || process.env.LOGROCKET_PUBLIC_KEY || '',
        },
      },
      quantum: {
        enabled: !!(process.env.VITE_QUANTUM_EDGE_ENDPOINT || process.env.QUANTUM_EDGE_ENDPOINT),
        edgeEndpoint: process.env.VITE_QUANTUM_EDGE_ENDPOINT || process.env.QUANTUM_EDGE_ENDPOINT || '',
        apiKey: process.env.VITE_QUANTUM_API_KEY || process.env.QUANTUM_API_KEY || '',
        financialEnabled: process.env.VITE_QUANTUM_FINANCIAL_ENABLED === 'true',
        healthcareEnabled: process.env.VITE_QUANTUM_HEALTHCARE_ENABLED === 'true',
        supplyChainEnabled: process.env.VITE_QUANTUM_SUPPLY_CHAIN_ENABLED === 'true',
        energyEnabled: process.env.VITE_QUANTUM_ENERGY_ENABLED === 'true',
        aerospaceEnabled: process.env.VITE_QUANTUM_AEROSPACE_ENABLED === 'true',
        entertainmentEnabled: process.env.VITE_QUANTUM_ENTERTAINMENT_ENABLED === 'true',
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
