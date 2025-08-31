/**
 * Application Security Gateway Service
 * Implements Zero Trust application security with comprehensive access control
 * Provides runtime application protection and security orchestration
 */

export interface ApplicationDefinition {
  id: string;
  name: string;
  version: string;
  type: 'web_app' | 'api' | 'microservice' | 'mobile_app' | 'desktop_app' | 'database' | 'legacy_system';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  environment: 'development' | 'staging' | 'production' | 'test';
  deployment: {
    platform: 'kubernetes' | 'docker' | 'vm' | 'serverless' | 'bare_metal';
    location: string[];
    replicas: number;
    healthEndpoint?: string;
  };
  network: {
    internalPorts: number[];
    externalPorts: number[];
    protocols: ('HTTP' | 'HTTPS' | 'TCP' | 'UDP' | 'gRPC')[];
    endpoints: ApplicationEndpoint[];
  };
  security: {
    authenticationRequired: boolean;
    authorizationMethod: 'rbac' | 'abac' | 'oauth' | 'jwt' | 'api_key' | 'mutual_tls';
    encryption: {
      inTransit: boolean;
      atRest: boolean;
      algorithms: string[];
    };
    compliance: string[]; // GDPR, SOX, HIPAA, etc.
  };
  dependencies: {
    internal: string[]; // Other application IDs
    external: ExternalDependency[];
    databases: string[];
    apis: string[];
  };
  metadata: {
    owner: string;
    team: string;
    businessUnit: string;
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    createdDate: Date;
    lastModified: Date;
  };
}

export interface ApplicationEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  purpose: string;
  authentication: boolean;
  authorization: string[];
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
  dataAccess: {
    reads: string[];
    writes: string[];
    deletes: string[];
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ExternalDependency {
  name: string;
  type: 'api' | 'service' | 'database' | 'queue' | 'storage' | 'cdn';
  endpoint: string;
  critical: boolean;
  securityRequirements: string[];
  monitoring: boolean;
}

export interface ApplicationSecurityPolicy {
  id: string;
  applicationId: string;
  name: string;
  version: string;
  type: 'access_control' | 'data_protection' | 'runtime_protection' | 'monitoring' | 'compliance';
  scope: 'global' | 'endpoint' | 'user_group' | 'data_type';
  rules: SecurityRule[];
  enforcement: {
    mode: 'permissive' | 'enforcing' | 'blocking';
    exceptions: string[];
    monitoring: boolean;
  };
  compliance: {
    standards: string[];
    controls: string[];
    auditRequired: boolean;
  };
  schedule: {
    effectiveDate: Date;
    expiryDate?: Date;
    businessHours?: {
      enabled: boolean;
      timezone: string;
      allowedHours: { start: string; end: string };
      allowedDays: number[];
    };
  };
  createdBy: string;
  createdDate: Date;
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  condition: {
    type: 'user' | 'device' | 'network' | 'application' | 'data' | 'time' | 'risk';
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    field: string;
    value: string | number | boolean | string[];
  }[];
  action: {
    type: 'allow' | 'deny' | 'challenge' | 'log' | 'alert' | 'redirect' | 'rate_limit';
    parameters: Record<string, any>;
    notification: boolean;
  };
  priority: number;
  enabled: boolean;
}

export interface ApplicationAccessRequest {
  id: string;
  applicationId: string;
  userId: string;
  deviceId: string;
  requestType: 'initial_access' | 'continued_access' | 'elevated_access' | 'api_access';
  requestedResources: string[];
  requestedActions: string[];
  context: {
    sourceIP: string;
    userAgent: string;
    location?: {
      country: string;
      region: string;
      city: string;
    };
    time: Date;
    sessionId?: string;
  };
  riskFactors: {
    userRisk: number;
    deviceRisk: number;
    networkRisk: number;
    behaviorRisk: number;
    locationRisk: number;
  };
  timestamp: Date;
}

export interface ApplicationAccessDecision {
  requestId: string;
  decision: 'allow' | 'deny' | 'challenge' | 'conditional';
  confidence: number; // 0-100
  riskScore: number; // 0-100
  appliedPolicies: string[];
  matchedRules: string[];
  conditions: AccessCondition[];
  restrictions: AccessRestriction[];
  monitoring: {
    level: 'none' | 'basic' | 'enhanced' | 'intensive';
    duration: number; // minutes
    triggers: string[];
  };
  auditTrail: {
    decisionTime: Date;
    decisionEngine: string;
    factors: Record<string, any>;
    overrides: PolicyOverride[];
  };
  sessionLimits: {
    maxDuration: number; // minutes
    maxIdleTime: number; // minutes
    reauthRequired: boolean;
    stepUpAuth: boolean;
  };
}

export interface AccessCondition {
  type: 'time_based' | 'location_based' | 'device_based' | 'network_based' | 'approval_based';
  description: string;
  requirement: string;
  validUntil?: Date;
}

export interface AccessRestriction {
  type: 'rate_limit' | 'data_access' | 'function_access' | 'time_limit' | 'location_limit';
  description: string;
  parameters: Record<string, any>;
  severity: 'info' | 'warning' | 'blocking';
}

export interface PolicyOverride {
  id: string;
  reason: string;
  approver: string;
  timestamp: Date;
  expiryDate: Date;
  conditions: string[];
}

export interface ApplicationSecurityEvent {
  id: string;
  applicationId: string;
  eventType: 'access_granted' | 'access_denied' | 'policy_violation' | 'security_alert' | 'anomaly_detected' | 'auth_failure';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  user: {
    id: string;
    name: string;
    roles: string[];
  };
  device: {
    id: string;
    type: string;
    trustLevel: string;
  };
  context: {
    sourceIP: string;
    userAgent: string;
    endpoint: string;
    method: string;
    resource: string;
  };
  details: {
    requestId: string;
    policyId?: string;
    ruleId?: string;
    riskScore: number;
    decision: string;
    reason: string;
    evidence: string[];
  };
  response: {
    action: string;
    status: 'success' | 'failure' | 'pending';
    message: string;
    responseTime: number; // milliseconds
  };
  impact: {
    dataAccessed: string[];
    functionsUsed: string[];
    businessImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface ApplicationSecurityMetrics {
  applicationId: string;
  timeframe: { start: Date; end: Date };
  access: {
    totalRequests: number;
    allowedRequests: number;
    deniedRequests: number;
    challengedRequests: number;
    averageResponseTime: number;
  };
  security: {
    policyViolations: number;
    securityAlerts: number;
    anomaliesDetected: number;
    criticalEvents: number;
    riskScore: number;
  };
  performance: {
    availability: number; // percentage
    errorRate: number; // percentage
    averageLatency: number; // milliseconds
    throughput: number; // requests per second
  };
  compliance: {
    score: number; // 0-100
    violations: number;
    auditEvents: number;
    exemptions: number;
  };
  trends: {
    accessTrend: { date: Date; count: number }[];
    riskTrend: { date: Date; score: number }[];
    performanceTrend: { date: Date; latency: number }[];
  };
}

export interface ApplicationRuntimeProtection {
  applicationId: string;
  protectionLevel: 'basic' | 'standard' | 'enhanced' | 'maximum';
  capabilities: {
    sqlInjectionProtection: boolean;
    xssProtection: boolean;
    csrfProtection: boolean;
    rceProtection: boolean;
    fileUploadScanning: boolean;
    behaviourAnalysis: boolean;
    threatIntelligence: boolean;
    rateLimiting: boolean;
  };
  configuration: {
    blockingMode: boolean;
    learningMode: boolean;
    alertingEnabled: boolean;
    logLevel: 'minimal' | 'standard' | 'detailed' | 'verbose';
  };
  rules: {
    customRules: ApplicationSecurityRule[];
    managedRules: string[];
    exclusions: RuleExclusion[];
  };
  monitoring: {
    realTimeAlerts: boolean;
    dashboardEnabled: boolean;
    reportingFrequency: 'hourly' | 'daily' | 'weekly';
    integrations: string[];
  };
}

export interface ApplicationSecurityRule {
  id: string;
  name: string;
  description: string;
  category: 'injection' | 'authentication' | 'authorization' | 'data_exposure' | 'logging' | 'cryptography';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  pattern: {
    type: 'regex' | 'signature' | 'behavior' | 'statistical';
    value: string;
    caseSensitive: boolean;
  };
  conditions: {
    httpMethods: string[];
    paths: string[];
    headers: Record<string, string>;
    parameters: string[];
  };
  action: {
    block: boolean;
    log: boolean;
    alert: boolean;
    sanitize: boolean;
  };
  enabled: boolean;
  lastModified: Date;
}

export interface RuleExclusion {
  id: string;
  ruleId: string;
  reason: string;
  scope: {
    paths: string[];
    parameters: string[];
    headers: string[];
  };
  createdBy: string;
  createdDate: Date;
  expiryDate?: Date;
}

export class ApplicationSecurityGatewayService {
  private applications: Map<string, ApplicationDefinition> = new Map();
  private policies: Map<string, ApplicationSecurityPolicy> = new Map();
  private accessRequests: Map<string, ApplicationAccessRequest> = new Map();
  private accessDecisions: Map<string, ApplicationAccessDecision> = new Map();
  private securityEvents: Map<string, ApplicationSecurityEvent> = new Map();
  private runtimeProtection: Map<string, ApplicationRuntimeProtection> = new Map();

  constructor() {
    this.initializeApplicationSecurity();
  }

  /**
   * Initialize application security service with sample data
   */
  private initializeApplicationSecurity(): void {
    // Initialize sample applications
    const sampleApplications: ApplicationDefinition[] = [
      {
        id: 'app-web-portal-001',
        name: 'SecureFlow Web Portal',
        version: '2.1.0',
        type: 'web_app',
        criticality: 'critical',
        environment: 'production',
        deployment: {
          platform: 'kubernetes',
          location: ['us-east-1', 'us-west-2'],
          replicas: 3,
          healthEndpoint: '/health'
        },
        network: {
          internalPorts: [3000],
          externalPorts: [443],
          protocols: ['HTTPS'],
          endpoints: [
            {
              id: 'endpoint-login',
              path: '/api/auth/login',
              method: 'POST',
              purpose: 'User authentication',
              authentication: false,
              authorization: [],
              rateLimit: {
                enabled: true,
                requestsPerMinute: 5,
                burstLimit: 10
              },
              dataAccess: {
                reads: ['user_credentials'],
                writes: ['session_data'],
                deletes: []
              },
              riskLevel: 'high'
            },
            {
              id: 'endpoint-dashboard',
              path: '/api/dashboard',
              method: 'GET',
              purpose: 'Dashboard data retrieval',
              authentication: true,
              authorization: ['user', 'admin'],
              rateLimit: {
                enabled: true,
                requestsPerMinute: 60,
                burstLimit: 100
              },
              dataAccess: {
                reads: ['dashboard_metrics', 'user_preferences'],
                writes: [],
                deletes: []
              },
              riskLevel: 'medium'
            }
          ]
        },
        security: {
          authenticationRequired: true,
          authorizationMethod: 'jwt',
          encryption: {
            inTransit: true,
            atRest: true,
            algorithms: ['AES-256', 'RSA-2048']
          },
          compliance: ['SOC2', 'ISO27001']
        },
        dependencies: {
          internal: ['app-api-gateway-001'],
          external: [
            {
              name: 'Auth0',
              type: 'api',
              endpoint: 'https://secureflow.auth0.com',
              critical: true,
              securityRequirements: ['TLS1.3', 'OAuth2'],
              monitoring: true
            }
          ],
          databases: ['postgres-primary'],
          apis: ['user-service', 'metrics-service']
        },
        metadata: {
          owner: 'frontend-team@secureflow.com',
          team: 'Frontend Development',
          businessUnit: 'Engineering',
          dataClassification: 'confidential',
          createdDate: new Date('2025-01-15'),
          lastModified: new Date('2025-07-20')
        }
      },
      {
        id: 'app-api-gateway-001',
        name: 'SecureFlow API Gateway',
        version: '1.8.5',
        type: 'api',
        criticality: 'critical',
        environment: 'production',
        deployment: {
          platform: 'kubernetes',
          location: ['us-east-1', 'us-west-2', 'eu-west-1'],
          replicas: 5,
          healthEndpoint: '/health'
        },
        network: {
          internalPorts: [8080],
          externalPorts: [443],
          protocols: ['HTTPS', 'gRPC'],
          endpoints: [
            {
              id: 'endpoint-users-api',
              path: '/v1/users/*',
              method: 'GET',
              purpose: 'User management API',
              authentication: true,
              authorization: ['user_read', 'admin'],
              rateLimit: {
                enabled: true,
                requestsPerMinute: 100,
                burstLimit: 200
              },
              dataAccess: {
                reads: ['user_profiles', 'user_permissions'],
                writes: [],
                deletes: []
              },
              riskLevel: 'medium'
            }
          ]
        },
        security: {
          authenticationRequired: true,
          authorizationMethod: 'oauth',
          encryption: {
            inTransit: true,
            atRest: true,
            algorithms: ['AES-256', 'ChaCha20-Poly1305']
          },
          compliance: ['SOC2', 'ISO27001', 'GDPR']
        },
        dependencies: {
          internal: [],
          external: [
            {
              name: 'Redis Cluster',
              type: 'database',
              endpoint: 'redis://cluster.cache.amazonaws.com:6379',
              critical: true,
              securityRequirements: ['TLS', 'AUTH'],
              monitoring: true
            }
          ],
          databases: ['postgres-primary', 'postgres-read-replica'],
          apis: ['user-service', 'auth-service', 'audit-service']
        },
        metadata: {
          owner: 'backend-team@secureflow.com',
          team: 'Backend Development',
          businessUnit: 'Engineering',
          dataClassification: 'restricted',
          createdDate: new Date('2024-12-01'),
          lastModified: new Date('2025-07-25')
        }
      },
      {
        id: 'app-mobile-001',
        name: 'SecureFlow Mobile App',
        version: '3.2.1',
        type: 'mobile_app',
        criticality: 'high',
        environment: 'production',
        deployment: {
          platform: 'serverless',
          location: ['global'],
          replicas: 0, // Serverless auto-scaling
          healthEndpoint: '/health'
        },
        network: {
          internalPorts: [],
          externalPorts: [443],
          protocols: ['HTTPS'],
          endpoints: [
            {
              id: 'endpoint-mobile-sync',
              path: '/mobile/sync',
              method: 'POST',
              purpose: 'Mobile data synchronization',
              authentication: true,
              authorization: ['mobile_user'],
              rateLimit: {
                enabled: true,
                requestsPerMinute: 30,
                burstLimit: 50
              },
              dataAccess: {
                reads: ['user_data', 'app_settings'],
                writes: ['sync_state', 'user_preferences'],
                deletes: []
              },
              riskLevel: 'medium'
            }
          ]
        },
        security: {
          authenticationRequired: true,
          authorizationMethod: 'jwt',
          encryption: {
            inTransit: true,
            atRest: true,
            algorithms: ['AES-256', 'ECDH']
          },
          compliance: ['SOC2', 'COPPA']
        },
        dependencies: {
          internal: ['app-api-gateway-001'],
          external: [
            {
              name: 'Firebase',
              type: 'service',
              endpoint: 'https://secureflow-mobile.firebaseio.com',
              critical: false,
              securityRequirements: ['API_KEY', 'TLS'],
              monitoring: true
            }
          ],
          databases: [],
          apis: ['sync-service', 'notification-service']
        },
        metadata: {
          owner: 'mobile-team@secureflow.com',
          team: 'Mobile Development',
          businessUnit: 'Engineering',
          dataClassification: 'internal',
          createdDate: new Date('2025-03-01'),
          lastModified: new Date('2025-07-28')
        }
      }
    ];

    sampleApplications.forEach(app => {
      this.applications.set(app.id, app);
    });

    this.initializeSamplePolicies();
    this.initializeSampleEvents();
    this.initializeRuntimeProtection();
  }

  /**
   * Initialize sample security policies
   */
  private initializeSamplePolicies(): void {
    const samplePolicies: ApplicationSecurityPolicy[] = [
      {
        id: 'policy-zero-trust-001',
        applicationId: 'app-web-portal-001',
        name: 'Zero Trust Web Access Policy',
        version: '2.0',
        type: 'access_control',
        scope: 'global',
        rules: [
          {
            id: 'rule-auth-required',
            name: 'Authentication Required',
            description: 'All requests must be authenticated except public endpoints',
            condition: [
              {
                type: 'application',
                operator: 'not_in',
                field: 'endpoint.path',
                value: ['/health', '/public/*', '/api/auth/login']
              }
            ],
            action: {
              type: 'challenge',
              parameters: { authMethod: 'jwt' },
              notification: false
            },
            priority: 100,
            enabled: true
          },
          {
            id: 'rule-device-trust',
            name: 'Device Trust Verification',
            description: 'Devices must meet minimum trust level for access',
            condition: [
              {
                type: 'device',
                operator: 'less_than',
                field: 'trustScore',
                value: 70
              }
            ],
            action: {
              type: 'challenge',
              parameters: { challengeType: 'mfa' },
              notification: true
            },
            priority: 90,
            enabled: true
          },
          {
            id: 'rule-rate-limit',
            name: 'API Rate Limiting',
            description: 'Enforce rate limits on all API endpoints',
            condition: [
              {
                type: 'application',
                operator: 'contains',
                field: 'endpoint.path',
                value: '/api/'
              }
            ],
            action: {
              type: 'rate_limit',
              parameters: { 
                requestsPerMinute: 60,
                burstLimit: 100
              },
              notification: false
            },
            priority: 80,
            enabled: true
          }
        ],
        enforcement: {
          mode: 'enforcing',
          exceptions: ['health-check-endpoints'],
          monitoring: true
        },
        compliance: {
          standards: ['NIST Zero Trust', 'SOC2'],
          controls: ['AC-3', 'AC-6', 'SI-4'],
          auditRequired: true
        },
        schedule: {
          effectiveDate: new Date('2025-07-01'),
          businessHours: {
            enabled: false,
            timezone: 'UTC',
            allowedHours: { start: '09:00', end: '17:00' },
            allowedDays: [1, 2, 3, 4, 5]
          }
        },
        createdBy: 'security.admin@secureflow.com',
        createdDate: new Date('2025-06-15'),
        status: 'active'
      },
      {
        id: 'policy-data-protection-001',
        applicationId: 'app-api-gateway-001',
        name: 'API Data Protection Policy',
        version: '1.5',
        type: 'data_protection',
        scope: 'endpoint',
        rules: [
          {
            id: 'rule-pii-protection',
            name: 'PII Data Protection',
            description: 'Protect personally identifiable information in API responses',
            condition: [
              {
                type: 'data',
                operator: 'contains',
                field: 'response.data',
                value: ['email', 'ssn', 'phone', 'address']
              }
            ],
            action: {
              type: 'log',
              parameters: { logLevel: 'high', maskData: true },
              notification: true
            },
            priority: 95,
            enabled: true
          },
          {
            id: 'rule-admin-access',
            name: 'Administrative Access Control',
            description: 'Restrict admin endpoints to authorized users',
            condition: [
              {
                type: 'application',
                operator: 'contains',
                field: 'endpoint.path',
                value: '/admin/'
              },
              {
                type: 'user',
                operator: 'not_contains',
                field: 'roles',
                value: 'admin'
              }
            ],
            action: {
              type: 'deny',
              parameters: { reason: 'insufficient_privileges' },
              notification: true
            },
            priority: 100,
            enabled: true
          }
        ],
        enforcement: {
          mode: 'enforcing',
          exceptions: [],
          monitoring: true
        },
        compliance: {
          standards: ['GDPR', 'HIPAA', 'SOC2'],
          controls: ['SC-8', 'AC-4', 'AU-2'],
          auditRequired: true
        },
        schedule: {
          effectiveDate: new Date('2025-05-01')
        },
        createdBy: 'data.protection@secureflow.com',
        createdDate: new Date('2025-04-20'),
        status: 'active'
      }
    ];

    samplePolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });
  }

  /**
   * Initialize sample security events
   */
  private initializeSampleEvents(): void {
    const sampleEvents: ApplicationSecurityEvent[] = [
      {
        id: 'event-001',
        applicationId: 'app-web-portal-001',
        eventType: 'access_denied',
        severity: 'medium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        user: {
          id: 'user-001',
          name: 'john.doe@secureflow.com',
          roles: ['user']
        },
        device: {
          id: 'dev-laptop-001',
          type: 'laptop',
          trustLevel: 'medium'
        },
        context: {
          sourceIP: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          endpoint: '/api/admin/users',
          method: 'GET',
          resource: 'user_management'
        },
        details: {
          requestId: 'req-001',
          policyId: 'policy-data-protection-001',
          ruleId: 'rule-admin-access',
          riskScore: 65,
          decision: 'deny',
          reason: 'insufficient_privileges',
          evidence: ['user_role_check', 'endpoint_authorization']
        },
        response: {
          action: 'access_denied',
          status: 'success',
          message: 'Access denied due to insufficient privileges',
          responseTime: 45
        },
        impact: {
          dataAccessed: [],
          functionsUsed: [],
          businessImpact: 'none'
        }
      },
      {
        id: 'event-002',
        applicationId: 'app-api-gateway-001',
        eventType: 'security_alert',
        severity: 'high',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        user: {
          id: 'user-002',
          name: 'suspicious.user@external.com',
          roles: ['guest']
        },
        device: {
          id: 'dev-unknown-001',
          type: 'unknown',
          trustLevel: 'low'
        },
        context: {
          sourceIP: '203.0.113.42',
          userAgent: 'curl/7.68.0',
          endpoint: '/v1/users/bulk-export',
          method: 'GET',
          resource: 'user_data'
        },
        details: {
          requestId: 'req-002',
          policyId: 'policy-data-protection-001',
          ruleId: 'rule-pii-protection',
          riskScore: 85,
          decision: 'alert',
          reason: 'bulk_data_access_attempt',
          evidence: ['unusual_user_agent', 'external_ip', 'bulk_request']
        },
        response: {
          action: 'monitored_access',
          status: 'success',
          message: 'Access granted with enhanced monitoring',
          responseTime: 120
        },
        impact: {
          dataAccessed: ['user_emails', 'user_profiles'],
          functionsUsed: ['bulk_export'],
          businessImpact: 'medium'
        }
      }
    ];

    sampleEvents.forEach(event => {
      this.securityEvents.set(event.id, event);
    });
  }

  /**
   * Initialize runtime protection
   */
  private initializeRuntimeProtection(): void {
    const applications = Array.from(this.applications.values());
    
    applications.forEach(app => {
      const protection: ApplicationRuntimeProtection = {
        applicationId: app.id,
        protectionLevel: app.criticality === 'critical' ? 'maximum' : 
                        app.criticality === 'high' ? 'enhanced' : 'standard',
        capabilities: {
          sqlInjectionProtection: true,
          xssProtection: true,
          csrfProtection: app.type === 'web_app',
          rceProtection: true,
          fileUploadScanning: app.type === 'web_app',
          behaviourAnalysis: app.criticality === 'critical',
          threatIntelligence: true,
          rateLimiting: true
        },
        configuration: {
          blockingMode: app.environment === 'production',
          learningMode: app.environment === 'development',
          alertingEnabled: true,
          logLevel: app.criticality === 'critical' ? 'verbose' : 'standard'
        },
        rules: {
          customRules: [],
          managedRules: ['OWASP-Core-Rule-Set', 'SecureFlow-Custom-Rules'],
          exclusions: []
        },
        monitoring: {
          realTimeAlerts: app.criticality === 'critical',
          dashboardEnabled: true,
          reportingFrequency: 'daily',
          integrations: ['SIEM', 'SOAR', 'Slack']
        }
      };

      this.runtimeProtection.set(app.id, protection);
    });
  }

  /**
   * Process application access request
   */
  async processAccessRequest(request: ApplicationAccessRequest): Promise<ApplicationAccessDecision> {
    const application = this.applications.get(request.applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const requestId = request.id;
    this.accessRequests.set(requestId, request);

    // Get applicable policies
    const applicablePolicies = Array.from(this.policies.values())
      .filter(policy => 
        policy.applicationId === request.applicationId && 
        policy.status === 'active' &&
        new Date() >= policy.schedule.effectiveDate &&
        (!policy.schedule.expiryDate || new Date() <= policy.schedule.expiryDate)
      );

    let decision: ApplicationAccessDecision['decision'] = 'allow';
    let riskScore = 0;
    let confidence = 100;
    const appliedPolicies: string[] = [];
    const matchedRules: string[] = [];
    const conditions: AccessCondition[] = [];
    const restrictions: AccessRestriction[] = [];

    // Calculate base risk score
    riskScore = this.calculateRiskScore(request);

    // Evaluate policies
    for (const policy of applicablePolicies) {
      appliedPolicies.push(policy.id);
      
      for (const rule of policy.rules) {
        if (!rule.enabled) continue;

        const ruleMatches = this.evaluateRule(rule, request, application);
        if (ruleMatches) {
          matchedRules.push(rule.id);
          
          switch (rule.action.type) {
            case 'deny':
              decision = 'deny';
              confidence = Math.min(confidence, 95);
              break;
            case 'challenge':
              if (decision !== 'deny') {
                decision = 'challenge';
                conditions.push({
                  type: 'approval_based',
                  description: `Challenge required: ${rule.action.parameters.challengeType || 'authentication'}`,
                  requirement: rule.name
                });
              }
              break;
            case 'rate_limit':
              restrictions.push({
                type: 'rate_limit',
                description: `Rate limit: ${rule.action.parameters.requestsPerMinute} requests per minute`,
                parameters: rule.action.parameters,
                severity: 'warning'
              });
              break;
            case 'log':
            case 'alert':
              // Log/alert actions don't change the decision
              break;
          }

          if (rule.action.notification) {
            // Would trigger notification in real implementation
          }
        }
      }
    }

    // Apply risk-based decisions
    if (riskScore > 80 && decision === 'allow') {
      decision = 'challenge';
      conditions.push({
        type: 'approval_based',
        description: 'High risk score requires additional verification',
        requirement: 'Multi-factor authentication'
      });
    } else if (riskScore > 60 && decision === 'allow') {
      decision = 'conditional';
      conditions.push({
        type: 'device_based',
        description: 'Device trust verification required',
        requirement: 'Device compliance check'
      });
    }

    // Determine monitoring level
    const monitoringLevel = riskScore > 70 ? 'intensive' : 
                           riskScore > 50 ? 'enhanced' : 
                           riskScore > 30 ? 'basic' : 'none';

    const accessDecision: ApplicationAccessDecision = {
      requestId,
      decision,
      confidence,
      riskScore,
      appliedPolicies,
      matchedRules,
      conditions,
      restrictions,
      monitoring: {
        level: monitoringLevel,
        duration: monitoringLevel === 'intensive' ? 60 : 
                 monitoringLevel === 'enhanced' ? 30 : 15,
        triggers: this.getMonitoringTriggers(riskScore)
      },
      auditTrail: {
        decisionTime: new Date(),
        decisionEngine: 'ApplicationSecurityGateway',
        factors: {
          userRisk: request.riskFactors.userRisk,
          deviceRisk: request.riskFactors.deviceRisk,
          networkRisk: request.riskFactors.networkRisk,
          behaviorRisk: request.riskFactors.behaviorRisk,
          locationRisk: request.riskFactors.locationRisk,
          overallRisk: riskScore
        },
        overrides: []
      },
      sessionLimits: {
        maxDuration: decision === 'allow' ? 480 : 120, // 8 hours vs 2 hours
        maxIdleTime: 30,
        reauthRequired: riskScore > 60,
        stepUpAuth: riskScore > 80
      }
    };

    this.accessDecisions.set(requestId, accessDecision);

    // Create security event
    await this.createSecurityEvent(request, accessDecision, application);

    return accessDecision;
  }

  /**
   * Create security event for access decision
   */
  private async createSecurityEvent(
    request: ApplicationAccessRequest,
    decision: ApplicationAccessDecision,
    application: ApplicationDefinition
  ): Promise<void> {
    const eventType: ApplicationSecurityEvent['eventType'] = 
      decision.decision === 'allow' ? 'access_granted' :
      decision.decision === 'deny' ? 'access_denied' :
      decision.decision === 'challenge' ? 'security_alert' : 'access_granted';

    const severity: ApplicationSecurityEvent['severity'] = 
      decision.riskScore > 80 ? 'critical' :
      decision.riskScore > 60 ? 'high' :
      decision.riskScore > 40 ? 'medium' : 'low';

    const event: ApplicationSecurityEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      applicationId: request.applicationId,
      eventType,
      severity,
      timestamp: new Date(),
      user: {
        id: request.userId,
        name: request.userId, // Would be resolved from user service
        roles: [] // Would be resolved from user service
      },
      device: {
        id: request.deviceId,
        type: 'unknown', // Would be resolved from device service
        trustLevel: 'unknown' // Would be resolved from device service
      },
      context: {
        sourceIP: request.context.sourceIP,
        userAgent: request.context.userAgent,
        endpoint: request.requestedResources[0] || 'unknown',
        method: 'unknown', // Would be extracted from request
        resource: request.requestedResources.join(', ')
      },
      details: {
        requestId: request.id,
        policyId: decision.appliedPolicies[0],
        ruleId: decision.matchedRules[0],
        riskScore: decision.riskScore,
        decision: decision.decision,
        reason: decision.conditions[0]?.description || 'Standard access evaluation',
        evidence: [
          `Risk score: ${decision.riskScore}`,
          `Applied policies: ${decision.appliedPolicies.length}`,
          `Matched rules: ${decision.matchedRules.length}`
        ]
      },
      response: {
        action: decision.decision,
        status: 'success',
        message: `Access ${decision.decision}`,
        responseTime: 50 + Math.random() * 100 // Simulated response time
      },
      impact: {
        dataAccessed: decision.decision === 'allow' ? request.requestedResources : [],
        functionsUsed: decision.decision === 'allow' ? request.requestedActions : [],
        businessImpact: severity === 'critical' ? 'high' : 
                       severity === 'high' ? 'medium' : 'low'
      }
    };

    this.securityEvents.set(event.id, event);
  }

  /**
   * Calculate risk score for access request
   */
  private calculateRiskScore(request: ApplicationAccessRequest): number {
    const weights = {
      userRisk: 0.25,
      deviceRisk: 0.25,
      networkRisk: 0.20,
      behaviorRisk: 0.20,
      locationRisk: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [factor, weight] of Object.entries(weights)) {
      const riskValue = request.riskFactors[factor as keyof typeof request.riskFactors];
      totalScore += riskValue * weight;
      totalWeight += weight;
    }

    // Context-based risk adjustments
    let contextualRisk = totalScore / totalWeight;

    // Time-based risk (after hours increases risk)
    const hour = request.context.time.getHours();
    if (hour < 6 || hour > 22) {
      contextualRisk += 10;
    }

    // Unknown location increases risk
    if (!request.context.location) {
      contextualRisk += 15;
    }

    // High-privilege requests increase risk
    if (request.requestedActions.some(action => 
      ['admin', 'delete', 'export', 'configure'].includes(action.toLowerCase())
    )) {
      contextualRisk += 20;
    }

    return Math.max(0, Math.min(100, Math.round(contextualRisk)));
  }

  /**
   * Evaluate security rule against request
   */
  private evaluateRule(
    rule: SecurityRule,
    request: ApplicationAccessRequest,
    application: ApplicationDefinition
  ): boolean {
    for (const condition of rule.condition) {
      const matches = this.evaluateCondition(condition, request, application);
      if (!matches) {
        return false; // All conditions must match
      }
    }
    return true;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: AccessCondition,
    request: ApplicationAccessRequest,
    application: ApplicationDefinition
  ): boolean {
    let actualValue: string | number | boolean | string[] | number[] | null;

    // Extract the actual value based on condition type and field
    switch (condition.type) {
      case 'user':
        actualValue = this.getUserFieldValue(condition.field, request);
        break;
      case 'device':
        actualValue = this.getDeviceFieldValue(condition.field, request);
        break;
      case 'network':
        actualValue = this.getNetworkFieldValue(condition.field, request);
        break;
      case 'application':
        actualValue = this.getApplicationFieldValue(condition.field, application);
        break;
      case 'time':
        actualValue = this.getTimeFieldValue(condition.field, request);
        break;
      case 'risk':
        actualValue = this.getRiskFieldValue(condition.field, request);
        break;
      default:
        return false;
    }

    // Evaluate condition based on operator
    return this.evaluateOperator(condition.operator, actualValue, condition.value);
  }

  private getUserFieldValue(field: string, request: ApplicationAccessRequest): string | number | boolean | string[] | number[] | null {
    // Simplified - would integrate with user service
    switch (field) {
      case 'id': return request.userId;
      case 'roles': return []; // Would be fetched from user service
      default: return null;
    }
  }

  private getDeviceFieldValue(field: string, request: ApplicationAccessRequest): string | number | boolean | string[] | number[] | null {
    switch (field) {
      case 'id': return request.deviceId;
      case 'trustScore': return 100 - request.riskFactors.deviceRisk; // Inverse of risk
      default: return null;
    }
  }

  private getNetworkFieldValue(field: string, request: ApplicationAccessRequest): string | number | boolean | string[] | number[] | null {
    switch (field) {
      case 'sourceIP': return request.context.sourceIP;
      case 'location.country': return request.context.location?.country || null;
      default: return null;
    }
  }

  private getApplicationFieldValue(field: string, application: ApplicationDefinition): string | number | boolean | string[] | number[] | null {
    switch (field) {
      case 'endpoint.path': return application.network.endpoints.map(e => e.path);
      case 'criticality': return application.criticality;
      default: return null;
    }
  }

  private getTimeFieldValue(field: string, request: ApplicationAccessRequest): string | number | boolean | string[] | number[] | null {
    switch (field) {
      case 'hour': return request.context.time.getHours();
      case 'dayOfWeek': return request.context.time.getDay();
      default: return null;
    }
  }

  private getRiskFieldValue(field: string, request: ApplicationAccessRequest): string | number | boolean | string[] | number[] | null {
    switch (field) {
      case 'overall': return this.calculateRiskScore(request);
      case 'user': return request.riskFactors.userRisk;
      case 'device': return request.riskFactors.deviceRisk;
      case 'network': return request.riskFactors.networkRisk;
      case 'behavior': return request.riskFactors.behaviorRisk;
      case 'location': return request.riskFactors.locationRisk;
      default: return null;
    }
  }

  private evaluateOperator(
    operator: string, 
    actualValue: string | number | boolean | string[] | number[] | null, 
    expectedValue: string | number | boolean | string[] | number[]
  ): boolean {
    switch (operator) {
      case 'equals':
        return actualValue === expectedValue;
      case 'not_equals':
        return actualValue !== expectedValue;
      case 'contains':
        if (Array.isArray(actualValue)) {
          return Array.isArray(expectedValue) ? 
            expectedValue.some(val => actualValue.includes(val)) :
            actualValue.includes(expectedValue);
        }
        return String(actualValue).includes(String(expectedValue));
      case 'not_contains':
        return !this.evaluateOperator('contains', actualValue, expectedValue);
      case 'greater_than':
        return Number(actualValue) > Number(expectedValue);
      case 'less_than':
        return Number(actualValue) < Number(expectedValue);
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
      case 'not_in':
        return !this.evaluateOperator('in', actualValue, expectedValue);
      default:
        return false;
    }
  }

  private getMonitoringTriggers(riskScore: number): string[] {
    const triggers = ['access_granted'];
    
    if (riskScore > 50) triggers.push('elevated_risk');
    if (riskScore > 70) triggers.push('high_risk_behavior');
    if (riskScore > 80) triggers.push('critical_risk_alert');
    
    return triggers;
  }

  /**
   * Generate application security metrics
   */
  generateSecurityMetrics(
    applicationId: string,
    timeframe: { start: Date; end: Date }
  ): ApplicationSecurityMetrics {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const events = Array.from(this.securityEvents.values())
      .filter(event => 
        event.applicationId === applicationId &&
        event.timestamp >= timeframe.start &&
        event.timestamp <= timeframe.end
      );

    const decisions = Array.from(this.accessDecisions.values())
      .filter(decision => {
        const request = this.accessRequests.get(decision.requestId);
        return request && 
               request.applicationId === applicationId &&
               request.timestamp >= timeframe.start &&
               request.timestamp <= timeframe.end;
      });

    // Access metrics
    const totalRequests = decisions.length;
    const allowedRequests = decisions.filter(d => d.decision === 'allow').length;
    const deniedRequests = decisions.filter(d => d.decision === 'deny').length;
    const challengedRequests = decisions.filter(d => d.decision === 'challenge').length;
    const averageResponseTime = decisions.length > 0 ?
      decisions.reduce((sum, d) => sum + (d.auditTrail.decisionTime.getTime() - 
        this.accessRequests.get(d.requestId)!.timestamp.getTime()), 0) / decisions.length : 0;

    // Security metrics
    const policyViolations = events.filter(e => e.eventType === 'policy_violation').length;
    const securityAlerts = events.filter(e => e.eventType === 'security_alert').length;
    const anomaliesDetected = events.filter(e => e.eventType === 'anomaly_detected').length;
    const criticalEvents = events.filter(e => e.severity === 'critical').length;
    const averageRiskScore = decisions.length > 0 ?
      decisions.reduce((sum, d) => sum + d.riskScore, 0) / decisions.length : 0;

    // Generate trend data (simplified)
    const days = Math.ceil((timeframe.end.getTime() - timeframe.start.getTime()) / (1000 * 60 * 60 * 24));
    const accessTrend: { date: Date; count: number }[] = [];
    const riskTrend: { date: Date; score: number }[] = [];
    const performanceTrend: { date: Date; latency: number }[] = [];

    for (let i = 0; i < Math.min(days, 7); i++) {
      const date = new Date(timeframe.start.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEvents = events.filter(e => 
        e.timestamp.toDateString() === date.toDateString()
      );
      const dayDecisions = decisions.filter(d => {
        const request = this.accessRequests.get(d.requestId);
        return request && request.timestamp.toDateString() === date.toDateString();
      });

      accessTrend.push({ date, count: dayEvents.length });
      riskTrend.push({ 
        date, 
        score: dayDecisions.length > 0 ? 
          dayDecisions.reduce((sum, d) => sum + d.riskScore, 0) / dayDecisions.length : 0 
      });
      performanceTrend.push({ 
        date, 
        latency: 50 + Math.random() * 100 // Simulated
      });
    }

    return {
      applicationId,
      timeframe,
      access: {
        totalRequests,
        allowedRequests,
        deniedRequests,
        challengedRequests,
        averageResponseTime: Math.round(averageResponseTime)
      },
      security: {
        policyViolations,
        securityAlerts,
        anomaliesDetected,
        criticalEvents,
        riskScore: Math.round(averageRiskScore)
      },
      performance: {
        availability: 99.9, // Simulated
        errorRate: 0.1, // Simulated
        averageLatency: 75, // Simulated
        throughput: totalRequests / (days || 1) // Rough approximation
      },
      compliance: {
        score: Math.max(0, 100 - (policyViolations * 5) - (criticalEvents * 10)),
        violations: policyViolations,
        auditEvents: events.filter(e => e.severity === 'high' || e.severity === 'critical').length,
        exemptions: 0 // Would be calculated from exemption data
      },
      trends: {
        accessTrend,
        riskTrend,
        performanceTrend
      }
    };
  }

  /**
   * Generate comprehensive security report
   */
  generateSecurityReport(): {
    summary: {
      totalApplications: number;
      securedApplications: number;
      activePolicies: number;
      totalEvents: number;
      criticalAlerts: number;
      averageRiskScore: number;
    };
    applicationBreakdown: Record<string, {
      events: number;
      riskScore: number;
      compliance: number;
    }>;
    topRisks: Array<{
      type: string;
      description: string;
      severity: string;
      affectedApplications: number;
      recommendation: string;
    }>;
    policyEffectiveness: Array<{
      policyId: string;
      policyName: string;
      applicationsProtected: number;
      violationsBlocked: number;
      effectiveness: number;
    }>;
    recommendations: string[];
  } {
    const applications = Array.from(this.applications.values());
    const policies = Array.from(this.policies.values());
    const events = Array.from(this.securityEvents.values());
    const decisions = Array.from(this.accessDecisions.values());

    const totalApplications = applications.length;
    const securedApplications = applications.filter(app => 
      policies.some(policy => policy.applicationId === app.id && policy.status === 'active')
    ).length;
    const activePolicies = policies.filter(p => p.status === 'active').length;
    const totalEvents = events.length;
    const criticalAlerts = events.filter(e => e.severity === 'critical').length;
    const averageRiskScore = decisions.length > 0 ?
      decisions.reduce((sum, d) => sum + d.riskScore, 0) / decisions.length : 0;

    const applicationBreakdown: Record<string, any> = {};
    applications.forEach(app => {
      const appEvents = events.filter(e => e.applicationId === app.id);
      const appDecisions = decisions.filter(d => {
        const request = this.accessRequests.get(d.requestId);
        return request && request.applicationId === app.id;
      });
      
      applicationBreakdown[app.name] = {
        events: appEvents.length,
        riskScore: appDecisions.length > 0 ?
          Math.round(appDecisions.reduce((sum, d) => sum + d.riskScore, 0) / appDecisions.length) : 0,
        compliance: Math.max(0, 100 - (appEvents.filter(e => e.eventType === 'policy_violation').length * 10))
      };
    });

    const topRisks = [
      {
        type: 'Unauthorized Access Attempts',
        description: 'Multiple failed authentication attempts detected',
        severity: 'high',
        affectedApplications: 2,
        recommendation: 'Implement stronger authentication policies and monitoring'
      },
      {
        type: 'High-Risk User Behavior',
        description: 'Users accessing sensitive data outside business hours',
        severity: 'medium',
        affectedApplications: 3,
        recommendation: 'Review time-based access controls and user behavior analytics'
      },
      {
        type: 'Unmanaged Device Access',
        description: 'Devices with low trust scores accessing critical applications',
        severity: 'high',
        affectedApplications: 1,
        recommendation: 'Enforce device compliance requirements and trust verification'
      }
    ];

    const policyEffectiveness = policies
      .filter(p => p.status === 'active')
      .map(policy => {
        const policyDecisions = decisions.filter(d => d.appliedPolicies.includes(policy.id));
        const violationsBlocked = policyDecisions.filter(d => d.decision === 'deny').length;
        const effectiveness = policyDecisions.length > 0 ?
          (violationsBlocked / policyDecisions.length) * 100 : 0;

        return {
          policyId: policy.id,
          policyName: policy.name,
          applicationsProtected: 1, // Simplified - each policy protects one app in this example
          violationsBlocked,
          effectiveness: Math.round(effectiveness)
        };
      });

    const recommendations: string[] = [];
    
    if (securedApplications < totalApplications) {
      recommendations.push(`${totalApplications - securedApplications} applications need security policies`);
    }
    
    if (criticalAlerts > 0) {
      recommendations.push(`${criticalAlerts} critical security alerts require immediate attention`);
    }
    
    if (averageRiskScore > 50) {
      recommendations.push('Average risk score is elevated - review access policies and controls');
    }

    const unprotectedApps = applications.filter(app => 
      !policies.some(policy => policy.applicationId === app.id && policy.status === 'active')
    );
    
    if (unprotectedApps.length > 0) {
      recommendations.push(`Implement security policies for unprotected applications: ${unprotectedApps.map(a => a.name).join(', ')}`);
    }

    return {
      summary: {
        totalApplications,
        securedApplications,
        activePolicies,
        totalEvents,
        criticalAlerts,
        averageRiskScore: Math.round(averageRiskScore)
      },
      applicationBreakdown,
      topRisks,
      policyEffectiveness,
      recommendations
    };
  }

  /**
   * Public accessor methods
   */
  getApplications(): ApplicationDefinition[] {
    return Array.from(this.applications.values());
  }

  getApplication(applicationId: string): ApplicationDefinition | undefined {
    return this.applications.get(applicationId);
  }

  getPolicies(): ApplicationSecurityPolicy[] {
    return Array.from(this.policies.values());
  }

  getPolicy(policyId: string): ApplicationSecurityPolicy | undefined {
    return this.policies.get(policyId);
  }

  getSecurityEvents(): ApplicationSecurityEvent[] {
    return Array.from(this.securityEvents.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getAccessDecisions(): ApplicationAccessDecision[] {
    return Array.from(this.accessDecisions.values());
  }

  getRuntimeProtection(applicationId: string): ApplicationRuntimeProtection | undefined {
    return this.runtimeProtection.get(applicationId);
  }

  getAllRuntimeProtection(): ApplicationRuntimeProtection[] {
    return Array.from(this.runtimeProtection.values());
  }
}

export default ApplicationSecurityGatewayService;
