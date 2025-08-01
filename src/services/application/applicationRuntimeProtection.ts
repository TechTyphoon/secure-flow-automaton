/**
 * Application Runtime Protection Service
 * Implements comprehensive runtime security monitoring and protection
 * Provides real-time threat detection, prevention, and response capabilities
 */

export interface RuntimeProtectionPolicy {
  id: string;
  name: string;
  description: string;
  applicationId: string;
  enabled: boolean;
  priority: number; // 1-100, higher = more important
  conditions: {
    triggers: RuntimeTrigger[];
    threshold: {
      type: 'count' | 'rate' | 'pattern' | 'anomaly';
      value: number;
      timeWindow: number; // seconds
      operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
    };
    context: {
      userAgent?: string[];
      ipRanges?: string[];
      countries?: string[];
      userRoles?: string[];
      timeRanges?: { start: string; end: string }[];
    };
  };
  actions: {
    primary: RuntimeAction;
    fallback?: RuntimeAction;
    notification: {
      enabled: boolean;
      channels: ('email' | 'slack' | 'webhook' | 'sms')[];
      recipients: string[];
      severity: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  metadata: {
    createdBy: string;
    createdAt: Date;
    lastModified: Date;
    tags: string[];
    category: 'security' | 'performance' | 'availability' | 'compliance';
  };
}

export interface RuntimeTrigger {
  id: string;
  type: 'http_request' | 'authentication' | 'authorization' | 'data_access' | 'file_operation' | 'network_activity' | 'resource_usage' | 'error_rate' | 'custom_event';
  name: string;
  description: string;
  parameters: {
    method?: string[];
    statusCodes?: number[];
    headers?: Record<string, string>;
    bodyPatterns?: string[];
    urlPatterns?: string[];
    userActions?: string[];
    dataTypes?: string[];
    fileTypes?: string[];
    networkProtocols?: string[];
    resourceThresholds?: {
      cpu?: number;
      memory?: number;
      disk?: number;
      network?: number;
    };
    errorPatterns?: string[];
    customConditions?: Record<string, any>;
  };
  enabled: boolean;
}

export interface RuntimeAction {
  type: 'allow' | 'block' | 'challenge' | 'redirect' | 'rate_limit' | 'quarantine' | 'log' | 'alert' | 'custom';
  name: string;
  description: string;
  configuration: {
    blockDuration?: number; // seconds
    redirectUrl?: string;
    challengeType?: 'captcha' | 'mfa' | 'identity_verification';
    rateLimitRules?: {
      requests: number;
      period: number; // seconds
      scope: 'ip' | 'user' | 'session' | 'global';
    };
    quarantineRules?: {
      isolate: boolean;
      monitoring: boolean;
      duration: number; // seconds
    };
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'critical';
    customPayload?: Record<string, any>;
  };
  enabled: boolean;
}

export interface RuntimeEvent {
  id: string;
  timestamp: Date;
  applicationId: string;
  type: RuntimeTrigger['type'];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'processing' | 'blocked' | 'allowed' | 'resolved';
  source: {
    ipAddress: string;
    userAgent: string;
    userId?: string;
    sessionId?: string;
    country?: string;
    asn?: string;
  };
  details: {
    endpoint?: string;
    method?: string;
    parameters?: Record<string, any>;
    headers?: Record<string, string>;
    body?: string;
    response?: {
      statusCode: number;
      headers: Record<string, string>;
      body?: string;
      size: number;
      responseTime: number;
    };
    risk: {
      score: number; // 0-100
      factors: string[];
      indicators: string[];
    };
  };
  triggeredPolicies: string[];
  appliedActions: {
    policyId: string;
    actionType: RuntimeAction['type'];
    result: 'success' | 'failure' | 'partial';
    message: string;
    timestamp: Date;
  }[];
  metadata: {
    correlationId?: string;
    traceId?: string;
    tags: string[];
    context: Record<string, any>;
  };
}

export interface RuntimeThreat {
  id: string;
  name: string;
  description: string;
  category: 'injection' | 'broken_auth' | 'sensitive_data' | 'xxe' | 'broken_access' | 'misconfig' | 'xss' | 'deserialization' | 'vulnerable_components' | 'logging_monitoring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  firstSeen: Date;
  lastSeen: Date;
  eventCount: number;
  affected: {
    applications: string[];
    endpoints: string[];
    users: string[];
    ipAddresses: string[];
  };
  indicators: {
    type: 'ip' | 'user_agent' | 'pattern' | 'behavior' | 'signature';
    value: string;
    confidence: number;
  }[];
  mitigations: {
    automated: boolean;
    actions: string[];
    policies: string[];
    effectiveness: number; // 0-100
  };
  status: 'active' | 'monitoring' | 'mitigated' | 'resolved' | 'false_positive';
}

export interface RuntimeAnalytics {
  timeframe: { start: Date; end: Date };
  summary: {
    totalEvents: number;
    blockedEvents: number;
    allowedEvents: number;
    averageRiskScore: number;
    topSeverity: 'low' | 'medium' | 'high' | 'critical';
  };
  breakdown: {
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byApplication: Record<string, number>;
    byAction: Record<string, number>;
    byStatus: Record<string, number>;
  };
  trends: {
    eventVolume: { timestamp: Date; count: number }[];
    riskScore: { timestamp: Date; score: number }[];
    blockRate: { timestamp: Date; rate: number }[];
    threatLevel: { timestamp: Date; level: number }[];
  };
  topThreats: {
    name: string;
    category: string;
    events: number;
    riskScore: number;
    blocked: number;
  }[];
  performance: {
    averageProcessingTime: number;
    throughput: number; // events per second
    accuracy: {
      truePositives: number;
      falsePositives: number;
      trueNegatives: number;
      falseNegatives: number;
      precision: number;
      recall: number;
      f1Score: number;
    };
  };
}

export interface RuntimeBaseline {
  applicationId: string;
  type: 'traffic' | 'behavior' | 'performance' | 'security';
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  metrics: {
    name: string;
    baseline: number;
    threshold: {
      warning: number;
      critical: number;
    };
    variance: number;
    trend: 'stable' | 'increasing' | 'decreasing' | 'volatile';
  }[];
  lastUpdated: Date;
  confidence: number; // 0-100
}

export interface RuntimeDetector {
  id: string;
  name: string;
  description: string;
  type: 'signature' | 'anomaly' | 'behavioral' | 'ml_based' | 'rule_based';
  enabled: boolean;
  configuration: {
    sensitivity: 'low' | 'medium' | 'high';
    threshold: number;
    learningPeriod?: number; // days
    updateFrequency?: number; // hours
    features?: string[];
    rules?: Record<string, any>;
    model?: {
      type: string;
      version: string;
      accuracy: number;
      lastTrained: Date;
    };
  };
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    falsePositiveRate: number;
    processingTime: number; // milliseconds
  };
  metadata: {
    version: string;
    createdAt: Date;
    lastUpdated: Date;
    tags: string[];
  };
}

export class ApplicationRuntimeProtectionService {
  private policies: Map<string, RuntimeProtectionPolicy> = new Map();
  private events: Map<string, RuntimeEvent> = new Map();
  private threats: Map<string, RuntimeThreat> = new Map();
  private baselines: Map<string, RuntimeBaseline> = new Map();
  private detectors: Map<string, RuntimeDetector> = new Map();

  constructor() {
    this.initializeRuntimeProtection();
  }

  /**
   * Initialize runtime protection service with sample data
   */
  private initializeRuntimeProtection(): void {
    this.initializeSamplePolicies();
    this.initializeSampleDetectors();
    this.initializeSampleEvents();
    this.initializeSampleThreats();
    this.initializeSampleBaselines();
  }

  /**
   * Initialize sample protection policies
   */
  private initializeSamplePolicies(): void {
    const samplePolicies: RuntimeProtectionPolicy[] = [
      {
        id: 'policy-sql-injection-001',
        name: 'SQL Injection Protection',
        description: 'Detects and blocks SQL injection attempts',
        applicationId: 'app-api-gateway-001',
        enabled: true,
        priority: 95,
        conditions: {
          triggers: [
            {
              id: 'trigger-sql-patterns',
              type: 'http_request',
              name: 'SQL Injection Patterns',
              description: 'Detects common SQL injection patterns in requests',
              parameters: {
                bodyPatterns: [
                  "'; DROP TABLE",
                  "' OR '1'='1",
                  "' UNION SELECT",
                  "'; INSERT INTO",
                  "'; UPDATE ",
                  "'; DELETE FROM"
                ],
                urlPatterns: [
                  "%27%20OR%20%271%27%3D%271",
                  "%3B%20DROP%20TABLE",
                  "%20UNION%20SELECT%20"
                ],
                headers: {
                  'User-Agent': 'sqlmap'
                }
              },
              enabled: true
            }
          ],
          threshold: {
            type: 'count',
            value: 1,
            timeWindow: 300,
            operator: 'gte'
          },
          context: {}
        },
        actions: {
          primary: {
            type: 'block',
            name: 'Block SQL Injection',
            description: 'Immediately block requests containing SQL injection patterns',
            configuration: {
              blockDuration: 3600,
              logLevel: 'critical'
            },
            enabled: true
          },
          notification: {
            enabled: true,
            channels: ['email', 'slack'],
            recipients: ['security-team@secureflow.com'],
            severity: 'critical'
          }
        },
        metadata: {
          createdBy: 'security-admin',
          createdAt: new Date('2025-07-01'),
          lastModified: new Date('2025-07-25'),
          tags: ['sql-injection', 'critical', 'owasp-top10'],
          category: 'security'
        }
      },
      {
        id: 'policy-rate-limit-001',
        name: 'API Rate Limiting',
        description: 'Prevents API abuse through rate limiting',
        applicationId: 'app-api-gateway-001',
        enabled: true,
        priority: 70,
        conditions: {
          triggers: [
            {
              id: 'trigger-high-request-rate',
              type: 'http_request',
              name: 'High Request Rate',
              description: 'Detects unusually high request rates from single sources',
              parameters: {
                method: ['GET', 'POST', 'PUT', 'DELETE'],
                statusCodes: [200, 201, 400, 401, 403, 404, 500]
              },
              enabled: true
            }
          ],
          threshold: {
            type: 'rate',
            value: 100,
            timeWindow: 60,
            operator: 'gt'
          },
          context: {}
        },
        actions: {
          primary: {
            type: 'rate_limit',
            name: 'Apply Rate Limit',
            description: 'Apply rate limiting to excessive requests',
            configuration: {
              rateLimitRules: {
                requests: 10,
                period: 60,
                scope: 'ip'
              },
              logLevel: 'warn'
            },
            enabled: true
          },
          fallback: {
            type: 'block',
            name: 'Block on Extreme Abuse',
            description: 'Block IP if rate limit is severely exceeded',
            configuration: {
              blockDuration: 1800,
              logLevel: 'error'
            },
            enabled: true
          },
          notification: {
            enabled: true,
            channels: ['email'],
            recipients: ['ops-team@secureflow.com'],
            severity: 'medium'
          }
        },
        metadata: {
          createdBy: 'ops-admin',
          createdAt: new Date('2025-07-10'),
          lastModified: new Date('2025-07-20'),
          tags: ['rate-limiting', 'abuse', 'performance'],
          category: 'performance'
        }
      },
      {
        id: 'policy-auth-anomaly-001',
        name: 'Authentication Anomaly Detection',
        description: 'Detects suspicious authentication patterns',
        applicationId: 'app-api-gateway-001',
        enabled: true,
        priority: 85,
        conditions: {
          triggers: [
            {
              id: 'trigger-failed-auth',
              type: 'authentication',
              name: 'Failed Authentication Attempts',
              description: 'Detects multiple failed authentication attempts',
              parameters: {
                statusCodes: [401, 403],
                userActions: ['login', 'authenticate']
              },
              enabled: true
            }
          ],
          threshold: {
            type: 'count',
            value: 5,
            timeWindow: 300,
            operator: 'gte'
          },
          context: {}
        },
        actions: {
          primary: {
            type: 'challenge',
            name: 'MFA Challenge',
            description: 'Require additional authentication factor',
            configuration: {
              challengeType: 'mfa',
              logLevel: 'warn'
            },
            enabled: true
          },
          fallback: {
            type: 'block',
            name: 'Temporary Block',
            description: 'Temporarily block IP after multiple failed challenges',
            configuration: {
              blockDuration: 900,
              logLevel: 'error'
            },
            enabled: true
          },
          notification: {
            enabled: true,
            channels: ['slack', 'email'],
            recipients: ['security-team@secureflow.com'],
            severity: 'high'
          }
        },
        metadata: {
          createdBy: 'security-admin',
          createdAt: new Date('2025-07-05'),
          lastModified: new Date('2025-07-22'),
          tags: ['authentication', 'brute-force', 'anomaly'],
          category: 'security'
        }
      },
      {
        id: 'policy-data-exfiltration-001',
        name: 'Data Exfiltration Prevention',
        description: 'Prevents unauthorized data extraction',
        applicationId: 'app-api-gateway-001',
        enabled: true,
        priority: 90,
        conditions: {
          triggers: [
            {
              id: 'trigger-large-response',
              type: 'data_access',
              name: 'Large Data Response',
              description: 'Detects unusually large data responses',
              parameters: {
                dataTypes: ['user_profile', 'financial', 'personal'],
                statusCodes: [200]
              },
              enabled: true
            }
          ],
          threshold: {
            type: 'count',
            value: 50,
            timeWindow: 3600,
            operator: 'gt'
          },
          context: {}
        },
        actions: {
          primary: {
            type: 'quarantine',
            name: 'Quarantine Session',
            description: 'Quarantine suspicious sessions for review',
            configuration: {
              quarantineRules: {
                isolate: true,
                monitoring: true,
                duration: 3600
              },
              logLevel: 'critical'
            },
            enabled: true
          },
          notification: {
            enabled: true,
            channels: ['email', 'sms'],
            recipients: ['security-team@secureflow.com', 'ciso@secureflow.com'],
            severity: 'critical'
          }
        },
        metadata: {
          createdBy: 'security-admin',
          createdAt: new Date('2025-07-15'),
          lastModified: new Date('2025-07-25'),
          tags: ['data-exfiltration', 'critical', 'data-protection'],
          category: 'security'
        }
      }
    ];

    samplePolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });
  }

  /**
   * Initialize sample detectors
   */
  private initializeSampleDetectors(): void {
    const sampleDetectors: RuntimeDetector[] = [
      {
        id: 'detector-ml-anomaly-001',
        name: 'ML-Based Anomaly Detector',
        description: 'Machine learning model for detecting behavioral anomalies',
        type: 'ml_based',
        enabled: true,
        configuration: {
          sensitivity: 'medium',
          threshold: 0.75,
          learningPeriod: 14,
          updateFrequency: 24,
          features: [
            'request_rate',
            'response_time',
            'error_rate',
            'data_volume',
            'user_behavior',
            'geographic_location'
          ],
          model: {
            type: 'isolation_forest',
            version: '2.1.0',
            accuracy: 87.5,
            lastTrained: new Date('2025-07-20')
          }
        },
        performance: {
          accuracy: 87.5,
          precision: 85.2,
          recall: 82.1,
          falsePositiveRate: 2.3,
          processingTime: 15
        },
        metadata: {
          version: '2.1.0',
          createdAt: new Date('2025-06-01'),
          lastUpdated: new Date('2025-07-20'),
          tags: ['ml', 'anomaly', 'behavioral']
        }
      },
      {
        id: 'detector-signature-001',
        name: 'OWASP Signature Detector',
        description: 'Signature-based detection for known attack patterns',
        type: 'signature',
        enabled: true,
        configuration: {
          sensitivity: 'high',
          threshold: 0.9,
          rules: {
            sqlInjection: {
              patterns: ["'; DROP", "' OR '1'='1", "UNION SELECT"],
              weight: 10
            },
            xss: {
              patterns: ["<script>", "javascript:", "onload="],
              weight: 8
            },
            pathTraversal: {
              patterns: ["../", "..\\", "%2e%2e"],
              weight: 7
            }
          }
        },
        performance: {
          accuracy: 94.2,
          precision: 96.1,
          recall: 91.8,
          falsePositiveRate: 1.2,
          processingTime: 3
        },
        metadata: {
          version: '1.5.2',
          createdAt: new Date('2025-05-15'),
          lastUpdated: new Date('2025-07-18'),
          tags: ['signature', 'owasp', 'patterns']
        }
      },
      {
        id: 'detector-behavioral-001',
        name: 'User Behavior Analytics',
        description: 'Analyzes user behavior patterns for anomalies',
        type: 'behavioral',
        enabled: true,
        configuration: {
          sensitivity: 'medium',
          threshold: 0.8,
          learningPeriod: 7,
          features: [
            'login_patterns',
            'access_patterns',
            'navigation_patterns',
            'timing_patterns',
            'location_patterns'
          ]
        },
        performance: {
          accuracy: 89.3,
          precision: 88.7,
          recall: 86.4,
          falsePositiveRate: 3.1,
          processingTime: 12
        },
        metadata: {
          version: '1.3.1',
          createdAt: new Date('2025-06-10'),
          lastUpdated: new Date('2025-07-22'),
          tags: ['behavioral', 'user', 'analytics']
        }
      }
    ];

    sampleDetectors.forEach(detector => {
      this.detectors.set(detector.id, detector);
    });
  }

  /**
   * Initialize sample events
   */
  private initializeSampleEvents(): void {
    const sampleEvents: RuntimeEvent[] = [
      {
        id: 'event-001',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        applicationId: 'app-api-gateway-001',
        type: 'http_request',
        severity: 'critical',
        status: 'blocked',
        source: {
          ipAddress: '192.168.1.100',
          userAgent: 'sqlmap/1.5.7#stable (http://sqlmap.org)',
          country: 'US',
          asn: 'AS7922'
        },
        details: {
          endpoint: '/v1/users/12345',
          method: 'GET',
          parameters: {
            id: "'; DROP TABLE users; --"
          },
          headers: {
            'User-Agent': 'sqlmap/1.5.7#stable (http://sqlmap.org)',
            'Content-Type': 'application/json'
          },
          risk: {
            score: 95,
            factors: ['SQL injection pattern', 'Known attack tool', 'Malicious payload'],
            indicators: ['DROP TABLE command', 'Comment injection', 'sqlmap signature']
          }
        },
        triggeredPolicies: ['policy-sql-injection-001'],
        appliedActions: [
          {
            policyId: 'policy-sql-injection-001',
            actionType: 'block',
            result: 'success',
            message: 'Request blocked due to SQL injection attempt',
            timestamp: new Date(Date.now() - 30 * 60 * 1000)
          }
        ],
        metadata: {
          correlationId: 'corr-001',
          traceId: 'trace-001',
          tags: ['sql-injection', 'critical', 'blocked'],
          context: {
            detectionMethod: 'signature',
            confidence: 98
          }
        }
      },
      {
        id: 'event-002',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        applicationId: 'app-api-gateway-001',
        type: 'authentication',
        severity: 'high',
        status: 'processing',
        source: {
          ipAddress: '10.0.0.45',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          userId: 'user-12345',
          sessionId: 'sess-67890',
          country: 'CA'
        },
        details: {
          endpoint: '/v1/auth/login',
          method: 'POST',
          parameters: {
            email: 'user@example.com',
            password: '[REDACTED]'
          },
          response: {
            statusCode: 401,
            headers: {
              'Content-Type': 'application/json'
            },
            body: '{"error": "Invalid credentials"}',
            size: 32,
            responseTime: 150
          },
          risk: {
            score: 72,
            factors: ['Multiple failed attempts', 'Different user agents', 'Geographic anomaly'],
            indicators: ['Brute force pattern', 'Credential stuffing']
          }
        },
        triggeredPolicies: ['policy-auth-anomaly-001'],
        appliedActions: [
          {
            policyId: 'policy-auth-anomaly-001',
            actionType: 'challenge',
            result: 'success',
            message: 'MFA challenge sent to user',
            timestamp: new Date(Date.now() - 15 * 60 * 1000)
          }
        ],
        metadata: {
          correlationId: 'corr-002',
          traceId: 'trace-002',
          tags: ['authentication', 'brute-force', 'challenge'],
          context: {
            detectionMethod: 'behavioral',
            confidence: 85,
            previousAttempts: 4
          }
        }
      },
      {
        id: 'event-003',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        applicationId: 'app-api-gateway-001',
        type: 'data_access',
        severity: 'medium',
        status: 'allowed',
        source: {
          ipAddress: '172.16.0.23',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          userId: 'admin-001',
          sessionId: 'sess-admin-789',
          country: 'US'
        },
        details: {
          endpoint: '/v1/admin/users',
          method: 'GET',
          parameters: {
            limit: 1000,
            export: true
          },
          response: {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json'
            },
            size: 2048000, // 2MB
            responseTime: 450
          },
          risk: {
            score: 45,
            factors: ['Large data export', 'Admin privileges'],
            indicators: ['Bulk data access', 'Sensitive data exposure']
          }
        },
        triggeredPolicies: [],
        appliedActions: [],
        metadata: {
          correlationId: 'corr-003',
          traceId: 'trace-003',
          tags: ['data-access', 'admin', 'export'],
          context: {
            detectionMethod: 'rule_based',
            confidence: 65,
            dataClassification: 'confidential'
          }
        }
      }
    ];

    sampleEvents.forEach(event => {
      this.events.set(event.id, event);
    });
  }

  /**
   * Initialize sample threats
   */
  private initializeSampleThreats(): void {
    const sampleThreats: RuntimeThreat[] = [
      {
        id: 'threat-001',
        name: 'Automated SQL Injection Campaign',
        description: 'Coordinated SQL injection attacks from multiple IP addresses',
        category: 'injection',
        severity: 'critical',
        confidence: 95,
        firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        eventCount: 247,
        affected: {
          applications: ['app-api-gateway-001'],
          endpoints: ['/v1/users/{id}', '/v1/admin/users', '/v1/search'],
          users: [],
          ipAddresses: ['192.168.1.100', '10.0.0.25', '172.16.0.45']
        },
        indicators: [
          {
            type: 'user_agent',
            value: 'sqlmap',
            confidence: 98
          },
          {
            type: 'pattern',
            value: "'; DROP TABLE",
            confidence: 95
          },
          {
            type: 'ip',
            value: '192.168.1.100',
            confidence: 90
          }
        ],
        mitigations: {
          automated: true,
          actions: ['block', 'quarantine', 'alert'],
          policies: ['policy-sql-injection-001'],
          effectiveness: 92
        },
        status: 'mitigated'
      },
      {
        id: 'threat-002',
        name: 'Credential Stuffing Attack',
        description: 'Large-scale automated credential validation attempts',
        category: 'broken_auth',
        severity: 'high',
        confidence: 88,
        firstSeen: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        lastSeen: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        eventCount: 1523,
        affected: {
          applications: ['app-api-gateway-001'],
          endpoints: ['/v1/auth/login'],
          users: ['user-12345', 'user-67890', 'user-11111'],
          ipAddresses: ['10.0.0.45', '203.0.113.0', '198.51.100.0']
        },
        indicators: [
          {
            type: 'behavior',
            value: 'high_failure_rate',
            confidence: 92
          },
          {
            type: 'pattern',
            value: 'distributed_sources',
            confidence: 85
          },
          {
            type: 'signature',
            value: 'credential_stuffing',
            confidence: 88
          }
        ],
        mitigations: {
          automated: true,
          actions: ['challenge', 'rate_limit', 'block'],
          policies: ['policy-auth-anomaly-001', 'policy-rate-limit-001'],
          effectiveness: 76
        },
        status: 'active'
      },
      {
        id: 'threat-003',
        name: 'Data Scraping Bot',
        description: 'Automated data harvesting from public APIs',
        category: 'sensitive_data',
        severity: 'medium',
        confidence: 73,
        firstSeen: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        eventCount: 5674,
        affected: {
          applications: ['app-api-gateway-001'],
          endpoints: ['/v1/public/users', '/v1/public/profiles'],
          users: [],
          ipAddresses: ['172.16.0.23', '192.0.2.0']
        },
        indicators: [
          {
            type: 'behavior',
            value: 'systematic_access',
            confidence: 81
          },
          {
            type: 'user_agent',
            value: 'python-requests/2.28.0',
            confidence: 75
          }
        ],
        mitigations: {
          automated: false,
          actions: ['rate_limit', 'monitor'],
          policies: ['policy-rate-limit-001'],
          effectiveness: 45
        },
        status: 'monitoring'
      }
    ];

    sampleThreats.forEach(threat => {
      this.threats.set(threat.id, threat);
    });
  }

  /**
   * Initialize sample baselines
   */
  private initializeSampleBaselines(): void {
    const sampleBaselines: RuntimeBaseline[] = [
      {
        applicationId: 'app-api-gateway-001',
        type: 'traffic',
        period: 'hourly',
        metrics: [
          {
            name: 'requests_per_minute',
            baseline: 1250,
            threshold: {
              warning: 1875, // 150% of baseline
              critical: 2500 // 200% of baseline
            },
            variance: 15.2,
            trend: 'stable'
          },
          {
            name: 'error_rate',
            baseline: 2.1,
            threshold: {
              warning: 5.0,
              critical: 10.0
            },
            variance: 0.8,
            trend: 'decreasing'
          },
          {
            name: 'response_time_95p',
            baseline: 185,
            threshold: {
              warning: 370, // 200% of baseline
              critical: 555 // 300% of baseline
            },
            variance: 22.5,
            trend: 'stable'
          }
        ],
        lastUpdated: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        confidence: 92
      },
      {
        applicationId: 'app-api-gateway-001',
        type: 'security',
        period: 'daily',
        metrics: [
          {
            name: 'blocked_requests',
            baseline: 45,
            threshold: {
              warning: 90,
              critical: 180
            },
            variance: 12.3,
            trend: 'stable'
          },
          {
            name: 'authentication_failures',
            baseline: 23,
            threshold: {
              warning: 69,
              critical: 115
            },
            variance: 8.7,
            trend: 'decreasing'
          },
          {
            name: 'threat_score_average',
            baseline: 15.4,
            threshold: {
              warning: 30.8,
              critical: 46.2
            },
            variance: 4.2,
            trend: 'stable'
          }
        ],
        lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        confidence: 87
      }
    ];

    sampleBaselines.forEach(baseline => {
      this.baselines.set(`${baseline.applicationId}-${baseline.type}-${baseline.period}`, baseline);
    });
  }

  /**
   * Process runtime event and apply protection policies
   */
  async processRuntimeEvent(eventData: Partial<RuntimeEvent>): Promise<RuntimeEvent> {
    const event: RuntimeEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      applicationId: eventData.applicationId || 'unknown',
      type: eventData.type || 'http_request',
      severity: 'low',
      status: 'detected',
      source: eventData.source || {
        ipAddress: '0.0.0.0',
        userAgent: 'unknown'
      },
      details: eventData.details || {
        risk: { score: 0, factors: [], indicators: [] }
      },
      triggeredPolicies: [],
      appliedActions: [],
      metadata: eventData.metadata || {
        tags: [],
        context: {}
      }
    };

    // Calculate risk score
    event.details.risk = this.calculateRiskScore(event);
    event.severity = this.determineSeverity(event.details.risk.score);

    // Find matching policies
    const matchingPolicies = this.findMatchingPolicies(event);
    event.triggeredPolicies = matchingPolicies.map(p => p.id);

    // Apply protection actions
    for (const policy of matchingPolicies) {
      const actionResult = await this.applyProtectionAction(event, policy);
      event.appliedActions.push(actionResult);
      
      // Update event status based on action results
      if (actionResult.actionType === 'block' && actionResult.result === 'success') {
        event.status = 'blocked';
      } else if (actionResult.actionType === 'allow') {
        event.status = 'allowed';
      }
    }

    // Store event
    this.events.set(event.id, event);

    // Update threat intelligence
    await this.updateThreatIntelligence(event);

    return event;
  }

  /**
   * Calculate risk score for an event
   */
  private calculateRiskScore(event: RuntimeEvent): RuntimeEvent['details']['risk'] {
    let score = 0;
    const factors: string[] = [];
    const indicators: string[] = [];

    // Base score factors
    const riskFactors = [
      {
        condition: () => event.source.userAgent?.includes('sqlmap'),
        score: 40,
        factor: 'Known attack tool detected',
        indicator: 'Attack tool signature'
      },
      {
        condition: () => event.details.parameters && JSON.stringify(event.details.parameters).includes('DROP TABLE'),
        score: 35,
        factor: 'SQL injection pattern',
        indicator: 'Destructive SQL command'
      },
      {
        condition: () => event.details.headers && event.details.headers['X-Forwarded-For'],
        score: 10,
        factor: 'Proxy/VPN usage',
        indicator: 'Traffic routing'
      },
      {
        condition: () => event.source.country && !['US', 'CA', 'GB'].includes(event.source.country),
        score: 15,
        factor: 'Geographic anomaly',
        indicator: 'Unusual location'
      },
      {
        condition: () => event.type === 'authentication' && event.details.response?.statusCode === 401,
        score: 20,
        factor: 'Authentication failure',
        indicator: 'Failed login attempt'
      },
      {
        condition: () => event.details.response?.size && event.details.response.size > 1000000,
        score: 25,
        factor: 'Large data response',
        indicator: 'Potential data exfiltration'
      },
      {
        condition: () => event.details.method === 'POST' && event.details.endpoint?.includes('admin'),
        score: 20,
        factor: 'Administrative action',
        indicator: 'Privileged operation'
      }
    ];

    riskFactors.forEach(factor => {
      if (factor.condition()) {
        score += factor.score;
        factors.push(factor.factor);
        indicators.push(factor.indicator);
      }
    });

    return {
      score: Math.min(100, score),
      factors,
      indicators
    };
  }

  /**
   * Determine event severity based on risk score
   */
  private determineSeverity(riskScore: number): RuntimeEvent['severity'] {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  }

  /**
   * Find policies that match the event
   */
  private findMatchingPolicies(event: RuntimeEvent): RuntimeProtectionPolicy[] {
    const matchingPolicies: RuntimeProtectionPolicy[] = [];

    for (const policy of this.policies.values()) {
      if (!policy.enabled || policy.applicationId !== event.applicationId) {
        continue;
      }

      // Check if any trigger matches
      const triggerMatches = policy.conditions.triggers.some(trigger => {
        if (!trigger.enabled || trigger.type !== event.type) {
          return false;
        }

        return this.evaluateTrigger(trigger, event);
      });

      if (triggerMatches) {
        // Check threshold conditions
        if (this.evaluateThreshold(policy.conditions.threshold, event)) {
          matchingPolicies.push(policy);
        }
      }
    }

    // Sort by priority (higher first)
    return matchingPolicies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Evaluate if a trigger matches an event
   */
  private evaluateTrigger(trigger: RuntimeTrigger, event: RuntimeEvent): boolean {
    const params = trigger.parameters;

    // Check method
    if (params.method && event.details.method && !params.method.includes(event.details.method)) {
      return false;
    }

    // Check status codes
    if (params.statusCodes && event.details.response?.statusCode && 
        !params.statusCodes.includes(event.details.response.statusCode)) {
      return false;
    }

    // Check body patterns
    if (params.bodyPatterns && event.details.body) {
      const hasPattern = params.bodyPatterns.some(pattern => 
        event.details.body?.includes(pattern)
      );
      if (!hasPattern) return false;
    }

    // Check URL patterns
    if (params.urlPatterns && event.details.endpoint) {
      const hasPattern = params.urlPatterns.some(pattern => 
        event.details.endpoint?.includes(pattern)
      );
      if (!hasPattern) return false;
    }

    // Check headers
    if (params.headers && event.details.headers) {
      const headerMatches = Object.entries(params.headers).every(([key, value]) =>
        event.details.headers?.[key]?.includes(value)
      );
      if (!headerMatches) return false;
    }

    return true;
  }

  /**
   * Evaluate threshold conditions
   */
  private evaluateThreshold(threshold: RuntimeProtectionPolicy['conditions']['threshold'], event: RuntimeEvent): boolean {
    // For now, simplified threshold evaluation
    // In a real implementation, this would check historical data
    const currentValue = event.details.risk.score;
    
    switch (threshold.operator) {
      case 'gt': return currentValue > threshold.value;
      case 'gte': return currentValue >= threshold.value;
      case 'lt': return currentValue < threshold.value;
      case 'lte': return currentValue <= threshold.value;
      case 'eq': return currentValue === threshold.value;
      case 'neq': return currentValue !== threshold.value;
      default: return false;
    }
  }

  /**
   * Apply protection action
   */
  private async applyProtectionAction(
    event: RuntimeEvent,
    policy: RuntimeProtectionPolicy
  ): Promise<RuntimeEvent['appliedActions'][0]> {
    const action = policy.actions.primary;
    const timestamp = new Date();

    try {
      // Simulate action execution
      const result: 'success' | 'failure' | 'partial' = 'success';
      let message = '';

      switch (action.type) {
        case 'block':
          message = `Request blocked for ${action.configuration.blockDuration || 3600} seconds`;
          break;
        case 'rate_limit':
          message = `Rate limit applied: ${action.configuration.rateLimitRules?.requests} requests per ${action.configuration.rateLimitRules?.period} seconds`;
          break;
        case 'challenge':
          message = `${action.configuration.challengeType?.toUpperCase()} challenge sent`;
          break;
        case 'quarantine':
          message = `Session quarantined for ${action.configuration.quarantineRules?.duration} seconds`;
          break;
        case 'allow':
          message = 'Request allowed';
          break;
        default:
          message = `${action.type} action applied`;
      }

      // Send notifications if enabled
      if (policy.actions.notification.enabled) {
        await this.sendNotification(policy.actions.notification, event, policy);
      }

      return {
        policyId: policy.id,
        actionType: action.type,
        result,
        message,
        timestamp
      };
    } catch (error) {
      return {
        policyId: policy.id,
        actionType: action.type,
        result: 'failure',
        message: `Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp
      };
    }
  }

  /**
   * Send notification
   */
  private async sendNotification(
    notification: RuntimeProtectionPolicy['actions']['notification'],
    event: RuntimeEvent,
    policy: RuntimeProtectionPolicy
  ): Promise<void> {
    // Simulate notification sending
    console.log(`[NOTIFICATION] ${notification.severity.toUpperCase()}: ${policy.name}`);
    console.log(`Event: ${event.id} - ${event.type} from ${event.source.ipAddress}`);
    console.log(`Channels: ${notification.channels.join(', ')}`);
    console.log(`Recipients: ${notification.recipients.join(', ')}`);
  }

  /**
   * Update threat intelligence
   */
  private async updateThreatIntelligence(event: RuntimeEvent): Promise<void> {
    // Check if event matches existing threats
    const matchingThreat = Array.from(this.threats.values()).find(threat =>
      threat.affected.ipAddresses.includes(event.source.ipAddress) ||
      (event.source.userId && threat.affected.users.includes(event.source.userId))
    );

    if (matchingThreat) {
      // Update existing threat
      matchingThreat.lastSeen = event.timestamp;
      matchingThreat.eventCount++;
      
      // Add new affected resources
      if (!matchingThreat.affected.applications.includes(event.applicationId)) {
        matchingThreat.affected.applications.push(event.applicationId);
      }
      
      if (event.details.endpoint && !matchingThreat.affected.endpoints.includes(event.details.endpoint)) {
        matchingThreat.affected.endpoints.push(event.details.endpoint);
      }
    } else if (event.severity === 'critical' || event.details.risk.score > 70) {
      // Create new threat
      const newThreat: RuntimeThreat = {
        id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${event.type} threat from ${event.source.ipAddress}`,
        description: `Detected ${event.type} activity with risk score ${event.details.risk.score}`,
        category: this.mapEventTypeToThreatCategory(event.type),
        severity: event.severity,
        confidence: Math.min(95, event.details.risk.score + 10),
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
        eventCount: 1,
        affected: {
          applications: [event.applicationId],
          endpoints: event.details.endpoint ? [event.details.endpoint] : [],
          users: event.source.userId ? [event.source.userId] : [],
          ipAddresses: [event.source.ipAddress]
        },
        indicators: event.details.risk.indicators.map(indicator => ({
          type: 'signature',
          value: indicator,
          confidence: event.details.risk.score
        })),
        mitigations: {
          automated: event.appliedActions.length > 0,
          actions: event.appliedActions.map(action => action.actionType),
          policies: event.triggeredPolicies,
          effectiveness: 0 // Will be calculated over time
        },
        status: 'active'
      };

      this.threats.set(newThreat.id, newThreat);
    }
  }

  /**
   * Map event type to threat category
   */
  private mapEventTypeToThreatCategory(eventType: RuntimeEvent['type']): RuntimeThreat['category'] {
    const mapping: Record<RuntimeEvent['type'], RuntimeThreat['category']> = {
      'http_request': 'injection',
      'authentication': 'broken_auth',
      'authorization': 'broken_access',
      'data_access': 'sensitive_data',
      'file_operation': 'vulnerable_components',
      'network_activity': 'misconfig',
      'resource_usage': 'logging_monitoring',
      'error_rate': 'logging_monitoring',
      'custom_event': 'misconfig'
    };

    return mapping[eventType] || 'misconfig';
  }

  /**
   * Generate runtime analytics
   */
  generateRuntimeAnalytics(timeframe: { start: Date; end: Date }): RuntimeAnalytics {
    const events = Array.from(this.events.values()).filter(event =>
      event.timestamp >= timeframe.start && event.timestamp <= timeframe.end
    );

    const totalEvents = events.length;
    const blockedEvents = events.filter(e => e.status === 'blocked').length;
    const allowedEvents = events.filter(e => e.status === 'allowed').length;
    const averageRiskScore = events.length > 0 ?
      events.reduce((sum, e) => sum + e.details.risk.score, 0) / events.length : 0;

    const severityCounts = events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSeverity = (['critical', 'high', 'medium', 'low'] as const)
      .find(severity => severityCounts[severity] > 0) || 'low';

    // Generate trends
    const hours = Math.ceil((timeframe.end.getTime() - timeframe.start.getTime()) / (1000 * 60 * 60));
    const trends = {
      eventVolume: [] as { timestamp: Date; count: number }[],
      riskScore: [] as { timestamp: Date; score: number }[],
      blockRate: [] as { timestamp: Date; rate: number }[],
      threatLevel: [] as { timestamp: Date; level: number }[]
    };

    for (let i = 0; i < Math.min(hours, 24); i++) {
      const hourStart = new Date(timeframe.start.getTime() + i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const hourEvents = events.filter(e => 
        e.timestamp >= hourStart && e.timestamp < hourEnd
      );

      const hourBlocked = hourEvents.filter(e => e.status === 'blocked').length;
      const blockRate = hourEvents.length > 0 ? (hourBlocked / hourEvents.length) * 100 : 0;
      const avgRisk = hourEvents.length > 0 ?
        hourEvents.reduce((sum, e) => sum + e.details.risk.score, 0) / hourEvents.length : 0;

      trends.eventVolume.push({ timestamp: hourStart, count: hourEvents.length });
      trends.riskScore.push({ timestamp: hourStart, score: Math.round(avgRisk) });
      trends.blockRate.push({ timestamp: hourStart, rate: Math.round(blockRate) });
      trends.threatLevel.push({ timestamp: hourStart, level: Math.round(avgRisk / 10) });
    }

    const topThreats = Array.from(this.threats.values())
      .filter(threat => 
        threat.firstSeen >= timeframe.start && threat.firstSeen <= timeframe.end
      )
      .map(threat => ({
        name: threat.name,
        category: threat.category,
        events: threat.eventCount,
        riskScore: threat.confidence,
        blocked: Math.floor(threat.eventCount * (threat.mitigations.effectiveness / 100))
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    return {
      timeframe,
      summary: {
        totalEvents,
        blockedEvents,
        allowedEvents,
        averageRiskScore: Math.round(averageRiskScore),
        topSeverity
      },
      breakdown: {
        byType: events.reduce((acc, e) => {
          acc[e.type] = (acc[e.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        bySeverity: severityCounts,
        byApplication: events.reduce((acc, e) => {
          acc[e.applicationId] = (acc[e.applicationId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byAction: events.reduce((acc, e) => {
          e.appliedActions.forEach(action => {
            acc[action.actionType] = (acc[action.actionType] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>),
        byStatus: events.reduce((acc, e) => {
          acc[e.status] = (acc[e.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      trends,
      topThreats,
      performance: {
        averageProcessingTime: 12.5, // Simulated
        throughput: totalEvents / Math.max(1, hours),
        accuracy: {
          truePositives: blockedEvents,
          falsePositives: Math.floor(blockedEvents * 0.05),
          trueNegatives: allowedEvents,
          falseNegatives: Math.floor(allowedEvents * 0.02),
          precision: 95.0,
          recall: 98.0,
          f1Score: 96.5
        }
      }
    };
  }

  /**
   * Public accessor methods
   */
  getPolicies(): RuntimeProtectionPolicy[] {
    return Array.from(this.policies.values()).sort((a, b) => b.priority - a.priority);
  }

  getPolicy(policyId: string): RuntimeProtectionPolicy | undefined {
    return this.policies.get(policyId);
  }

  getEvents(): RuntimeEvent[] {
    return Array.from(this.events.values()).sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getEvent(eventId: string): RuntimeEvent | undefined {
    return this.events.get(eventId);
  }

  getThreats(): RuntimeThreat[] {
    return Array.from(this.threats.values()).sort((a, b) =>
      b.lastSeen.getTime() - a.lastSeen.getTime()
    );
  }

  getThreat(threatId: string): RuntimeThreat | undefined {
    return this.threats.get(threatId);
  }

  getDetectors(): RuntimeDetector[] {
    return Array.from(this.detectors.values());
  }

  getDetector(detectorId: string): RuntimeDetector | undefined {
    return this.detectors.get(detectorId);
  }

  getBaselines(): RuntimeBaseline[] {
    return Array.from(this.baselines.values());
  }

  getBaseline(key: string): RuntimeBaseline | undefined {
    return this.baselines.get(key);
  }
}

export default ApplicationRuntimeProtectionService;
