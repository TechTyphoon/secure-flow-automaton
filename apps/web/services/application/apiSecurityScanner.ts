/**
 * API Security Scanner Service
 * Implements comprehensive API security scanning and vulnerability assessment
 * Provides OWASP API Top 10 compliance and runtime security monitoring
 */

import {
  BaseError,
  ValidationError,
  SecurityError,
  ErrorHandler,
  withErrorHandling,
  createErrorContext,
  ErrorContext
} from '../common/errors';
import { getLogger } from '../common/logger';
import {
  validateEmail,
  validatePassword,
  sanitizeUserInput,
  getValidator,
  ApiValidators,
  SecurityValidators,
  CommonValidators
} from '../common/validation';

export interface APIEndpoint {
  id: string;
  applicationId: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  version: string;
  description: string;
  authentication: {
    required: boolean;
    methods: ('basic' | 'bearer' | 'api_key' | 'oauth' | 'jwt' | 'certificate')[];
    schemes: {
      type: string;
      location?: 'header' | 'query' | 'cookie';
      name?: string;
    }[];
  };
  authorization: {
    required: boolean;
    scopes: string[];
    roles: string[];
  };
  parameters: APIParameter[];
  responses: APIResponse[];
  rateLimit: {
    enabled: boolean;
    requests: number;
    period: 'second' | 'minute' | 'hour' | 'day';
    burst?: number;
  };
  security: {
    inputValidation: boolean;
    outputEncoding: boolean;
    sqlInjectionProtection: boolean;
    xssProtection: boolean;
    csrfProtection: boolean;
  };
  monitoring: {
    enabled: boolean;
    logLevel: 'none' | 'basic' | 'detailed' | 'verbose';
    alerting: boolean;
  };
  metadata: {
    owner: string;
    tags: string[];
    criticality: 'low' | 'medium' | 'high' | 'critical';
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    lastModified: Date;
  };
}

export interface APIParameter {
  name: string;
  location: 'path' | 'query' | 'header' | 'body';
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  validation: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    enum?: string[];
  };
  security: {
    sensitiveData: boolean;
    piiData: boolean;
    encrypted: boolean;
    masked: boolean;
  };
}

export interface APIResponse {
  statusCode: number;
  description: string;
  contentType: string;
  schema?: ResponseSchema;
  headers?: Record<string, string>;
  security: {
    dataExposure: 'none' | 'minimal' | 'standard' | 'extensive';
    sensitiveFields: string[];
    encryptionRequired: boolean;
  };
}

export interface APISecurityScan {
  id: string;
  endpointId: string;
  scanType: 'quick' | 'comprehensive' | 'targeted' | 'compliance';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  configuration: {
    testsEnabled: string[];
    maxRequests: number;
    timeoutSeconds: number;
    followRedirects: boolean;
    checkSSL: boolean;
  };
  results: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    riskScore: number; // 0-100
    severityBreakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
    };
  };
  vulnerabilities: APIVulnerability[];
  compliance: {
    owaspTop10: OWASPComplianceResult[];
    overallScore: number; // 0-100
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    availabilityScore: number;
  };
  recommendations: string[];
}

export interface APIVulnerability {
  id: string;
  scanId: string;
  category: 'broken_auth' | 'excessive_data' | 'lack_resources' | 'mass_assignment' | 'broken_function' | 'unrestricted_access' | 'ssrf' | 'injection' | 'improper_assets' | 'logging_monitoring';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  impact: string;
  evidence: {
    request: {
      method: string;
      url: string;
      headers: Record<string, string>;
      body?: string;
    };
    response: {
      statusCode: number;
      headers: Record<string, string>;
      body?: string;
      responseTime: number;
    };
    proof: string[];
  };
  remediation: {
    recommendation: string;
    priority: 'immediate' | 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    codeChanges: boolean;
    configChanges: boolean;
  };
  references: {
    cwe: string[];
    owasp: string[];
    nist: string[];
    external: string[];
  };
  discoveredAt: Date;
  lastConfirmed: Date;
  status: 'open' | 'confirmed' | 'false_positive' | 'accepted_risk' | 'fixed' | 'mitigated';
}

export interface OWASPComplianceResult {
  category: 'API1_broken_auth' | 'API2_broken_user_auth' | 'API3_excessive_data' | 'API4_lack_resources' | 'API5_broken_function' | 'API6_mass_assignment' | 'API7_security_misconfig' | 'API8_injection' | 'API9_improper_assets' | 'API10_logging_monitoring';
  name: string;
  description: string;
  compliant: boolean;
  score: number; // 0-100
  findings: number;
  criticalFindings: number;
  recommendations: string[];
  testResults: {
    testName: string;
    passed: boolean;
    details: string;
  }[];
}

export interface APISecurityTest {
  id: string;
  name: string;
  category: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  enabled: boolean;
  configuration: Record<string, TestConfig>;
  testFunction: (endpoint: APIEndpoint, config: TestConfig) => Promise<APITestResult>;
}

export interface APITestResult {
  testId: string;
  passed: boolean;
  score: number; // 0-100
  findings: {
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    message: string;
    evidence: TestEvidence;
  }[];
  recommendations: string[];
  executionTime: number; // milliseconds
}

export interface APISecurityMetrics {
  timeframe: { start: Date; end: Date };
  endpoints: {
    total: number;
    scanned: number;
    secure: number;
    vulnerable: number;
    highRisk: number;
  };
  vulnerabilities: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byCategory: Record<string, number>;
  };
  compliance: {
    owaspScore: number;
    complianceRate: number;
    failingCategories: string[];
  };
  trends: {
    scanActivity: { date: Date; scans: number }[];
    vulnerabilityTrend: { date: Date; count: number }[];
    riskScoreTrend: { date: Date; score: number }[];
  };
  topRisks: {
    endpoint: string;
    riskScore: number;
    vulnerabilities: number;
    lastScanned: Date;
  }[];
}

export class APISecurityScannerService {
  private endpoints: Map<string, APIEndpoint> = new Map();
  private scans: Map<string, APISecurityScan> = new Map();
  private vulnerabilities: Map<string, APIVulnerability> = new Map();
  private securityTests: Map<string, APISecurityTest> = new Map();
  private logger = getLogger();

  constructor() {
    // Initialize error handling system
    ErrorHandler.initializeWithLogger();

    this.logger.info('Initializing API Security Scanner Service', createErrorContext('APISecurityScannerService', 'constructor'));
    this.initializeAPISecurityService();
  }

  /**
   * Initialize API security service with sample data
   */
  private initializeAPISecurityService(): void {
    // Initialize sample API endpoints
    const sampleEndpoints: APIEndpoint[] = [
      {
        id: 'api-endpoint-001',
        applicationId: 'app-api-gateway-001',
        name: 'User Authentication API',
        url: '/v1/auth/login',
        method: 'POST',
        version: '1.0',
        description: 'Authenticates users and returns JWT tokens',
        authentication: {
          required: false, // Public endpoint for login
          methods: [],
          schemes: []
        },
        authorization: {
          required: false,
          scopes: [],
          roles: []
        },
        parameters: [
          {
            name: 'email',
            location: 'body',
            type: 'string',
            required: true,
            description: 'User email address',
            validation: {
              pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
              maxLength: 255
            },
            security: {
              sensitiveData: true,
              piiData: true,
              encrypted: false,
              masked: true
            }
          },
          {
            name: 'password',
            location: 'body',
            type: 'string',
            required: true,
            description: 'User password',
            validation: {
              minLength: 8,
              maxLength: 128
            },
            security: {
              sensitiveData: true,
              piiData: false,
              encrypted: true,
              masked: true
            }
          }
        ],
        responses: [
          {
            statusCode: 200,
            description: 'Successful authentication',
            contentType: 'application/json',
            security: {
              dataExposure: 'minimal',
              sensitiveFields: ['token'],
              encryptionRequired: true
            }
          },
          {
            statusCode: 401,
            description: 'Authentication failed',
            contentType: 'application/json',
            security: {
              dataExposure: 'none',
              sensitiveFields: [],
              encryptionRequired: false
            }
          }
        ],
        rateLimit: {
          enabled: true,
          requests: 5,
          period: 'minute',
          burst: 10
        },
        security: {
          inputValidation: true,
          outputEncoding: true,
          sqlInjectionProtection: true,
          xssProtection: true,
          csrfProtection: true
        },
        monitoring: {
          enabled: true,
          logLevel: 'detailed',
          alerting: true
        },
        metadata: {
          owner: 'auth-team@secureflow.com',
          tags: ['authentication', 'security', 'public'],
          criticality: 'critical',
          dataClassification: 'confidential',
          lastModified: new Date('2025-07-20')
        }
      },
      {
        id: 'api-endpoint-002',
        applicationId: 'app-api-gateway-001',
        name: 'User Profile API',
        url: '/v1/users/{userId}',
        method: 'GET',
        version: '1.0',
        description: 'Retrieves user profile information',
        authentication: {
          required: true,
          methods: ['bearer', 'jwt'],
          schemes: [
            {
              type: 'http',
              location: 'header',
              name: 'Authorization'
            }
          ]
        },
        authorization: {
          required: true,
          scopes: ['user:read'],
          roles: ['user', 'admin']
        },
        parameters: [
          {
            name: 'userId',
            location: 'path',
            type: 'string',
            required: true,
            description: 'Unique user identifier',
            validation: {
              pattern: '^[a-zA-Z0-9-]+$',
              minLength: 1,
              maxLength: 50
            },
            security: {
              sensitiveData: false,
              piiData: false,
              encrypted: false,
              masked: false
            }
          },
          {
            name: 'include',
            location: 'query',
            type: 'string',
            required: false,
            description: 'Additional data to include',
            validation: {
              enum: ['profile', 'preferences', 'permissions']
            },
            security: {
              sensitiveData: false,
              piiData: false,
              encrypted: false,
              masked: false
            }
          }
        ],
        responses: [
          {
            statusCode: 200,
            description: 'User profile retrieved successfully',
            contentType: 'application/json',
            security: {
              dataExposure: 'standard',
              sensitiveFields: ['email', 'phone', 'address'],
              encryptionRequired: true
            }
          },
          {
            statusCode: 404,
            description: 'User not found',
            contentType: 'application/json',
            security: {
              dataExposure: 'none',
              sensitiveFields: [],
              encryptionRequired: false
            }
          }
        ],
        rateLimit: {
          enabled: true,
          requests: 100,
          period: 'minute'
        },
        security: {
          inputValidation: true,
          outputEncoding: true,
          sqlInjectionProtection: true,
          xssProtection: true,
          csrfProtection: false
        },
        monitoring: {
          enabled: true,
          logLevel: 'basic',
          alerting: false
        },
        metadata: {
          owner: 'user-team@secureflow.com',
          tags: ['users', 'profile', 'authenticated'],
          criticality: 'high',
          dataClassification: 'confidential',
          lastModified: new Date('2025-07-25')
        }
      },
      {
        id: 'api-endpoint-003',
        applicationId: 'app-api-gateway-001',
        name: 'Admin Users API',
        url: '/v1/admin/users',
        method: 'GET',
        version: '1.0',
        description: 'Administrative endpoint for managing users',
        authentication: {
          required: true,
          methods: ['bearer', 'jwt'],
          schemes: [
            {
              type: 'http',
              location: 'header',
              name: 'Authorization'
            }
          ]
        },
        authorization: {
          required: true,
          scopes: ['admin:users:read'],
          roles: ['admin', 'super_admin']
        },
        parameters: [
          {
            name: 'limit',
            location: 'query',
            type: 'number',
            required: false,
            description: 'Maximum number of users to return',
            validation: {
              minimum: 1,
              maximum: 1000
            },
            security: {
              sensitiveData: false,
              piiData: false,
              encrypted: false,
              masked: false
            }
          },
          {
            name: 'export',
            location: 'query',
            type: 'boolean',
            required: false,
            description: 'Export user data',
            validation: {},
            security: {
              sensitiveData: true,
              piiData: false,
              encrypted: false,
              masked: false
            }
          }
        ],
        responses: [
          {
            statusCode: 200,
            description: 'Users retrieved successfully',
            contentType: 'application/json',
            security: {
              dataExposure: 'extensive',
              sensitiveFields: ['email', 'phone', 'address', 'ssn', 'payment_info'],
              encryptionRequired: true
            }
          }
        ],
        rateLimit: {
          enabled: true,
          requests: 10,
          period: 'minute'
        },
        security: {
          inputValidation: true,
          outputEncoding: true,
          sqlInjectionProtection: true,
          xssProtection: true,
          csrfProtection: true
        },
        monitoring: {
          enabled: true,
          logLevel: 'verbose',
          alerting: true
        },
        metadata: {
          owner: 'admin-team@secureflow.com',
          tags: ['admin', 'users', 'sensitive'],
          criticality: 'critical',
          dataClassification: 'restricted',
          lastModified: new Date('2025-07-15')
        }
      }
    ];

    sampleEndpoints.forEach(endpoint => {
      this.endpoints.set(endpoint.id, endpoint);
    });

    this.initializeSecurityTests();
    this.initializeSampleScans();
  }

  /**
   * Initialize security tests
   */
  private initializeSecurityTests(): void {
    const securityTests: APISecurityTest[] = [
      {
        id: 'test-broken-auth-001',
        name: 'Authentication Bypass Test',
        category: 'broken_auth',
        description: 'Tests for authentication bypass vulnerabilities',
        severity: 'critical',
        enabled: true,
        configuration: {
          attemptBypasses: ['empty_token', 'invalid_token', 'expired_token'],
          maxAttempts: 5
        },
        testFunction: this.testAuthenticationBypass.bind(this)
      },
      {
        id: 'test-excessive-data-001',
        name: 'Excessive Data Exposure Test',
        category: 'excessive_data',
        description: 'Detects APIs returning more data than necessary',
        severity: 'medium',
        enabled: true,
        configuration: {
          sensitiveFields: ['password', 'ssn', 'token', 'key'],
          maxFields: 50
        },
        testFunction: this.testExcessiveDataExposure.bind(this)
      },
      {
        id: 'test-injection-001',
        name: 'SQL Injection Test',
        category: 'injection',
        description: 'Tests for SQL injection vulnerabilities',
        severity: 'critical',
        enabled: true,
        configuration: {
          payloads: ["' OR '1'='1", "'; DROP TABLE users; --", "' UNION SELECT * FROM users --"],
          parameters: ['body', 'query', 'path']
        },
        testFunction: this.testSQLInjection.bind(this)
      },
      {
        id: 'test-mass-assignment-001',
        name: 'Mass Assignment Test',
        category: 'mass_assignment',
        description: 'Tests for mass assignment vulnerabilities',
        severity: 'high',
        enabled: true,
        configuration: {
          sensitiveFields: ['role', 'admin', 'permissions', 'is_admin'],
          testMethods: ['POST', 'PUT', 'PATCH']
        },
        testFunction: this.testMassAssignment.bind(this)
      },
      {
        id: 'test-rate-limiting-001',
        name: 'Rate Limiting Test',
        category: 'lack_resources',
        description: 'Tests for proper rate limiting implementation',
        severity: 'medium',
        enabled: true,
        configuration: {
          requestCount: 100,
          timeWindow: 60, // seconds
          expectedStatusCode: 429
        },
        testFunction: this.testRateLimiting.bind(this)
      }
    ];

    securityTests.forEach(test => {
      this.securityTests.set(test.id, test);
    });
  }

  /**
   * Initialize sample scans and vulnerabilities
   */
  private initializeSampleScans(): void {
    const sampleScan: APISecurityScan = {
      id: 'scan-001',
      endpointId: 'api-endpoint-003',
      scanType: 'comprehensive',
      status: 'completed',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      duration: 1800, // 30 minutes
      configuration: {
        testsEnabled: ['test-broken-auth-001', 'test-excessive-data-001', 'test-injection-001'],
        maxRequests: 1000,
        timeoutSeconds: 30,
        followRedirects: true,
        checkSSL: true
      },
      results: {
        totalTests: 15,
        passedTests: 10,
        failedTests: 5,
        skippedTests: 0,
        riskScore: 75,
        severityBreakdown: {
          critical: 1,
          high: 2,
          medium: 2,
          low: 0,
          info: 0
        }
      },
      vulnerabilities: [],
      compliance: {
        owaspTop10: [
          {
            category: 'API1_broken_auth',
            name: 'Broken Object Level Authorization',
            description: 'APIs tend to expose endpoints that handle object identifiers',
            compliant: false,
            score: 60,
            findings: 2,
            criticalFindings: 1,
            recommendations: ['Implement proper authorization checks', 'Validate user permissions for each object access'],
            testResults: [
              {
                testName: 'Object Access Control',
                passed: false,
                details: 'User can access objects belonging to other users'
              }
            ]
          },
          {
            category: 'API3_excessive_data',
            name: 'Excessive Data Exposure',
            description: 'APIs may expose more data than necessary',
            compliant: false,
            score: 70,
            findings: 1,
            criticalFindings: 0,
            recommendations: ['Filter response data based on user permissions', 'Implement data minimization'],
            testResults: [
              {
                testName: 'Response Data Analysis',
                passed: false,
                details: 'API returns sensitive fields unnecessarily'
              }
            ]
          }
        ],
        overallScore: 65
      },
      performance: {
        averageResponseTime: 250,
        errorRate: 2.5,
        availabilityScore: 99.5
      },
      recommendations: [
        'Implement proper object-level authorization',
        'Reduce data exposure in API responses',
        'Add input validation for all parameters',
        'Implement comprehensive logging and monitoring'
      ]
    };

    this.scans.set(sampleScan.id, sampleScan);

    // Create sample vulnerabilities
    const sampleVulnerabilities: APIVulnerability[] = [
      {
        id: 'vuln-001',
        scanId: 'scan-001',
        category: 'broken_auth',
        severity: 'critical',
        title: 'Broken Object Level Authorization',
        description: 'The API allows users to access objects belonging to other users without proper authorization checks',
        impact: 'Unauthorized access to sensitive user data, potential data breach',
        evidence: {
          request: {
            method: 'GET',
            url: '/v1/users/12345',
            headers: {
              'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
              'Content-Type': 'application/json'
            }
          },
          response: {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json'
            },
            body: '{"id": "12345", "email": "other.user@example.com", "ssn": "123-45-6789"}',
            responseTime: 150
          },
          proof: [
            'User with ID 67890 was able to access user 12345 data',
            'No authorization check performed for object ownership',
            'Sensitive data (SSN) exposed to unauthorized user'
          ]
        },
        remediation: {
          recommendation: 'Implement proper authorization checks to ensure users can only access their own data or data they have explicit permission to access',
          priority: 'immediate',
          effort: 'medium',
          codeChanges: true,
          configChanges: false
        },
        references: {
          cwe: ['CWE-285', 'CWE-639'],
          owasp: ['OWASP API Security Top 10 - API1:2019'],
          nist: ['NIST 800-53 AC-3'],
          external: ['https://owasp.org/www-project-api-security/']
        },
        discoveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastConfirmed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'open'
      },
      {
        id: 'vuln-002',
        scanId: 'scan-001',
        category: 'excessive_data',
        severity: 'high',
        title: 'Excessive Data Exposure in Admin API',
        description: 'The admin users API returns sensitive user information that may not be necessary for the frontend application',
        impact: 'Potential exposure of sensitive user data, increased attack surface',
        evidence: {
          request: {
            method: 'GET',
            url: '/v1/admin/users?limit=10',
            headers: {
              'Authorization': 'Bearer admin_token_here',
              'Content-Type': 'application/json'
            }
          },
          response: {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json'
            },
            body: '{"users": [{"id": "1", "email": "user@example.com", "ssn": "123-45-6789", "payment_info": {...}}]}',
            responseTime: 300
          },
          proof: [
            'API returns SSN and payment information for all users',
            'Frontend application only needs basic user information',
            'Sensitive data unnecessarily exposed in network traffic'
          ]
        },
        remediation: {
          recommendation: 'Implement field filtering and data minimization. Only return data that is actually needed by the consuming application',
          priority: 'high',
          effort: 'low',
          codeChanges: true,
          configChanges: false
        },
        references: {
          cwe: ['CWE-200'],
          owasp: ['OWASP API Security Top 10 - API3:2019'],
          nist: ['NIST 800-53 SC-8'],
          external: ['https://owasp.org/www-project-api-security/']
        },
        discoveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastConfirmed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'open'
      }
    ];

    sampleVulnerabilities.forEach(vuln => {
      this.vulnerabilities.set(vuln.id, vuln);
    });

    // Update scan with vulnerabilities
    sampleScan.vulnerabilities = sampleVulnerabilities;
  }

  /**
   * Perform comprehensive API security scan
   */
  async performSecurityScan(
    endpointId: string,
    scanType: APISecurityScan['scanType'] = 'comprehensive'
  ): Promise<APISecurityScan> {
    const endpoint = this.endpoints.get(endpointId);
    if (!endpoint) {
      throw new Error('API endpoint not found');
    }

    const scanId = `scan-${endpointId}-${Date.now()}`;
    const startTime = new Date();

    const scan: APISecurityScan = {
      id: scanId,
      endpointId,
      scanType,
      status: 'running',
      startTime,
      configuration: {
        testsEnabled: Array.from(this.securityTests.keys()),
        maxRequests: scanType === 'quick' ? 100 : 1000,
        timeoutSeconds: 30,
        followRedirects: true,
        checkSSL: true
      },
      results: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        riskScore: 0,
        severityBreakdown: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0
        }
      },
      vulnerabilities: [],
      compliance: {
        owaspTop10: [],
        overallScore: 0
      },
      performance: {
        averageResponseTime: 0,
        errorRate: 0,
        availabilityScore: 0
      },
      recommendations: []
    };

    this.scans.set(scanId, scan);

    // Execute scan asynchronously
    setTimeout(async () => {
      await this.executeScan(scan, endpoint);
    }, 1000);

    return scan;
  }

  /**
   * Execute the actual security scan
   */
  private async executeScan(scan: APISecurityScan, endpoint: APIEndpoint): Promise<void> {
    const vulnerabilities: APIVulnerability[] = [];
    const testResults: APITestResult[] = [];

    // Run enabled security tests
    const enabledTests = Array.from(this.securityTests.values())
      .filter(test => scan.configuration.testsEnabled.includes(test.id));

    for (const test of enabledTests) {
      try {
        const result = await test.testFunction(endpoint, test.configuration);
        testResults.push(result);

        if (!result.passed) {
          // Create vulnerabilities from failed tests
          result.findings.forEach(finding => {
            const vulnerability: APIVulnerability = {
              id: `vuln-${scan.id}-${test.id}-${Date.now()}`,
              scanId: scan.id,
              category: test.category as any,
              severity: finding.severity,
              title: `${test.name} - ${finding.message}`,
              description: test.description,
              impact: this.getImpactDescription(finding.severity),
              evidence: {
                request: {
                  method: endpoint.method,
                  url: endpoint.url,
                  headers: {},
                  body: JSON.stringify(finding.evidence)
                },
                response: {
                  statusCode: 200,
                  headers: {},
                  responseTime: result.executionTime
                },
                proof: [finding.message]
              },
              remediation: {
                recommendation: result.recommendations[0] || 'Review and fix the identified issue',
                priority: finding.severity === 'critical' ? 'immediate' :
                         finding.severity === 'high' ? 'high' : 'medium',
                effort: 'medium',
                codeChanges: true,
                configChanges: false
              },
              references: {
                cwe: [],
                owasp: [`OWASP API Security Top 10 - ${test.category}`],
                nist: [],
                external: []
              },
              discoveredAt: new Date(),
              lastConfirmed: new Date(),
              status: 'open'
            };

            vulnerabilities.push(vulnerability);
            this.vulnerabilities.set(vulnerability.id, vulnerability);
          });
        }
      } catch (error) {
        console.error(`Test ${test.name} failed:`, error);
      }
    }

    // Calculate results
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    const severityBreakdown = {
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length,
      info: vulnerabilities.filter(v => v.severity === 'info').length
    };

    // Calculate risk score
    const riskScore = this.calculateRiskScore(severityBreakdown);

    // Generate OWASP compliance results
    const owaspCompliance = this.generateOWASPCompliance(vulnerabilities, testResults);

    // Update scan results
    scan.status = 'completed';
    scan.endTime = new Date();
    scan.duration = Math.floor((scan.endTime.getTime() - scan.startTime.getTime()) / 1000);
    scan.results = {
      totalTests,
      passedTests,
      failedTests,
      skippedTests: 0,
      riskScore,
      severityBreakdown
    };
    scan.vulnerabilities = vulnerabilities;
    scan.compliance = {
      owaspTop10: owaspCompliance,
      overallScore: this.calculateComplianceScore(owaspCompliance)
    };
    scan.performance = {
      averageResponseTime: testResults.length > 0 ?
        testResults.reduce((sum, r) => sum + r.executionTime, 0) / testResults.length : 0,
      errorRate: (failedTests / totalTests) * 100,
      availabilityScore: 99.0 // Simulated
    };
    scan.recommendations = this.generateRecommendations(vulnerabilities);
  }

  /**
   * Security test implementations
   */
  private async testAuthenticationBypass(endpoint: APIEndpoint, config: TestConfig): Promise<APITestResult> {
    const startTime = Date.now();
    const findings: APITestResult['findings'] = [];
    let passed = true;

    // Test if endpoint requires authentication when it should
    if (endpoint.authentication.required) {
      if (!endpoint.authentication.methods.length) {
        findings.push({
          severity: 'critical',
          message: 'Endpoint requires authentication but no methods are configured',
          evidence: { authMethods: endpoint.authentication.methods }
        });
        passed = false;
      }

      // Test for weak authentication schemes
      const weakSchemes = endpoint.authentication.methods.filter(method => 
        ['basic'].includes(method)
      );
      if (weakSchemes.length > 0) {
        findings.push({
          severity: 'medium',
          message: `Weak authentication methods detected: ${weakSchemes.join(', ')}`,
          evidence: { weakSchemes }
        });
      }
    } else if (endpoint.metadata.criticality === 'critical' || endpoint.metadata.dataClassification === 'restricted') {
      findings.push({
        severity: 'high',
        message: 'Critical/restricted endpoint does not require authentication',
        evidence: { 
          criticality: endpoint.metadata.criticality,
          classification: endpoint.metadata.dataClassification
        }
      });
      passed = false;
    }

    return {
      testId: 'test-broken-auth-001',
      passed,
      score: passed ? 100 : Math.max(0, 100 - (findings.length * 25)),
      findings,
      recommendations: passed ? [] : [
        'Implement strong authentication for all sensitive endpoints',
        'Use secure authentication methods like JWT or OAuth',
        'Ensure all critical endpoints require authentication'
      ],
      executionTime: Date.now() - startTime
    };
  }

  private async testExcessiveDataExposure(endpoint: APIEndpoint, config: TestConfig): Promise<APITestResult> {
    const startTime = Date.now();
    const findings: APITestResult['findings'] = [];
    let passed = true;

    // Check responses for sensitive data exposure
    for (const response of endpoint.responses) {
      if (response.security.dataExposure === 'extensive') {
        findings.push({
          severity: 'medium',
          message: `Response ${response.statusCode} exposes extensive data`,
          evidence: { 
            statusCode: response.statusCode,
            sensitiveFields: response.security.sensitiveFields
          }
        });
        passed = false;
      }

      if (response.security.sensitiveFields.length > 5) {
        findings.push({
          severity: 'high',
          message: `Response contains too many sensitive fields (${response.security.sensitiveFields.length})`,
          evidence: { 
            statusCode: response.statusCode,
            sensitiveFields: response.security.sensitiveFields
          }
        });
        passed = false;
      }
    }

    // Check for PII in parameters
    const piiParameters = endpoint.parameters.filter(param => param.security.piiData);
    if (piiParameters.length > 0 && !endpoint.security.outputEncoding) {
      findings.push({
        severity: 'medium',
        message: 'Endpoint handles PII but output encoding is not enabled',
        evidence: { piiParameters: piiParameters.map(p => p.name) }
      });
      passed = false;
    }

    return {
      testId: 'test-excessive-data-001',
      passed,
      score: passed ? 100 : Math.max(0, 100 - (findings.length * 20)),
      findings,
      recommendations: passed ? [] : [
        'Implement data minimization in API responses',
        'Filter out unnecessary sensitive fields',
        'Enable output encoding for PII data',
        'Use field-based permissions for data access'
      ],
      executionTime: Date.now() - startTime
    };
  }

  private async testSQLInjection(endpoint: APIEndpoint, config: TestConfig): Promise<APITestResult> {
    const startTime = Date.now();
    const findings: APITestResult['findings'] = [];
    let passed = true;

    // Check if SQL injection protection is enabled
    if (!endpoint.security.sqlInjectionProtection) {
      findings.push({
        severity: 'critical',
        message: 'SQL injection protection is not enabled',
        evidence: { sqlProtection: endpoint.security.sqlInjectionProtection }
      });
      passed = false;
    }

    // Check parameters for injection vulnerabilities
    const vulnerableParams = endpoint.parameters.filter(param => 
      param.type === 'string' && !param.validation.pattern
    );

    if (vulnerableParams.length > 0) {
      findings.push({
        severity: 'high',
        message: `Parameters without validation patterns may be vulnerable: ${vulnerableParams.map(p => p.name).join(', ')}`,
        evidence: { vulnerableParams: vulnerableParams.map(p => p.name) }
      });
      passed = false;
    }

    return {
      testId: 'test-injection-001',
      passed,
      score: passed ? 100 : Math.max(0, 100 - (findings.length * 30)),
      findings,
      recommendations: passed ? [] : [
        'Enable SQL injection protection',
        'Implement input validation for all parameters',
        'Use parameterized queries or prepared statements',
        'Implement input sanitization'
      ],
      executionTime: Date.now() - startTime
    };
  }

  private async testMassAssignment(endpoint: APIEndpoint, config: TestConfig): Promise<APITestResult> {
    const startTime = Date.now();
    const findings: APITestResult['findings'] = [];
    let passed = true;

    // Check for mass assignment vulnerabilities in write operations
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      const bodyParams = endpoint.parameters.filter(param => param.location === 'body');
      
      if (bodyParams.length > 0) {
        const sensitiveParams = bodyParams.filter(param => 
          config.sensitiveFields.some((field: string) => 
            param.name.toLowerCase().includes(field.toLowerCase())
          )
        );

        if (sensitiveParams.length > 0) {
          findings.push({
            severity: 'high',
            message: `Potentially sensitive parameters in body: ${sensitiveParams.map(p => p.name).join(', ')}`,
            evidence: { sensitiveParams: sensitiveParams.map(p => p.name) }
          });
          passed = false;
        }

        // Check if all body parameters are validated
        const unvalidatedParams = bodyParams.filter(param => 
          !param.validation.pattern && !param.validation.enum && 
          param.type === 'string' && param.required
        );

        if (unvalidatedParams.length > 0) {
          findings.push({
            severity: 'medium',
            message: `Unvalidated required parameters: ${unvalidatedParams.map(p => p.name).join(', ')}`,
            evidence: { unvalidatedParams: unvalidatedParams.map(p => p.name) }
          });
        }
      }
    }

    return {
      testId: 'test-mass-assignment-001',
      passed,
      score: passed ? 100 : Math.max(0, 100 - (findings.length * 25)),
      findings,
      recommendations: passed ? [] : [
        'Implement strict parameter filtering',
        'Use allowlists for acceptable parameters',
        'Validate all input parameters',
        'Implement role-based parameter access'
      ],
      executionTime: Date.now() - startTime
    };
  }

  private async testRateLimiting(endpoint: APIEndpoint, config: TestConfig): Promise<APITestResult> {
    const startTime = Date.now();
    const findings: APITestResult['findings'] = [];
    let passed = true;

    // Check if rate limiting is enabled
    if (!endpoint.rateLimit.enabled) {
      const severity = endpoint.metadata.criticality === 'critical' ? 'high' : 'medium';
      findings.push({
        severity,
        message: 'Rate limiting is not enabled for this endpoint',
        evidence: { rateLimitEnabled: endpoint.rateLimit.enabled }
      });
      passed = false;
    } else {
      // Check if rate limits are appropriate for endpoint criticality
      const requestsPerMinute = endpoint.rateLimit.period === 'minute' ? endpoint.rateLimit.requests :
                               endpoint.rateLimit.period === 'hour' ? endpoint.rateLimit.requests / 60 :
                               endpoint.rateLimit.period === 'day' ? endpoint.rateLimit.requests / (24 * 60) :
                               endpoint.rateLimit.requests * 60; // per second

      if (endpoint.metadata.criticality === 'critical' && requestsPerMinute > 10) {
        findings.push({
          severity: 'medium',
          message: `Rate limit may be too high for critical endpoint (${requestsPerMinute}/min)`,
          evidence: { 
            requestsPerMinute,
            criticality: endpoint.metadata.criticality
          }
        });
      }

      if (endpoint.authentication.required === false && requestsPerMinute > 20) {
        findings.push({
          severity: 'medium',
          message: `Rate limit may be too high for public endpoint (${requestsPerMinute}/min)`,
          evidence: { 
            requestsPerMinute,
            authRequired: endpoint.authentication.required
          }
        });
      }
    }

    return {
      testId: 'test-rate-limiting-001',
      passed,
      score: passed ? 100 : Math.max(0, 100 - (findings.length * 20)),
      findings,
      recommendations: passed ? [] : [
        'Enable rate limiting for all endpoints',
        'Set appropriate limits based on endpoint criticality',
        'Implement stricter limits for public endpoints',
        'Consider implementing adaptive rate limiting'
      ],
      executionTime: Date.now() - startTime
    };
  }

  /**
   * Helper methods for scan processing
   */
  private calculateRiskScore(severityBreakdown: APISecurityScan['results']['severityBreakdown']): number {
    const weights = {
      critical: 40,
      high: 25,
      medium: 15,
      low: 5,
      info: 1
    };

    const totalScore = Object.entries(severityBreakdown).reduce((sum, [severity, count]) => {
      return sum + (count * weights[severity as keyof typeof weights]);
    }, 0);

    // Normalize to 0-100 scale (higher score = higher risk)
    return Math.min(100, totalScore);
  }

  private generateOWASPCompliance(
    vulnerabilities: APIVulnerability[],
    testResults: APITestResult[]
  ): OWASPComplianceResult[] {
    const categories = [
      'API1_broken_auth',
      'API2_broken_user_auth',
      'API3_excessive_data',
      'API4_lack_resources',
      'API5_broken_function',
      'API6_mass_assignment',
      'API7_security_misconfig',
      'API8_injection',
      'API9_improper_assets',
      'API10_logging_monitoring'
    ] as const;

    return categories.map(category => {
      const categoryVulns = vulnerabilities.filter(v => v.category === category.toLowerCase().replace('api[0-9]+_', ''));
      const categoryTests = testResults.filter(t => t.testId.includes(category.toLowerCase().replace('api[0-9]+_', '')));
      
      const findings = categoryVulns.length;
      const criticalFindings = categoryVulns.filter(v => v.severity === 'critical').length;
      const passedTests = categoryTests.filter(t => t.passed).length;
      const totalTests = categoryTests.length;
      
      const score = totalTests > 0 ? (passedTests / totalTests) * 100 : 100;
      const compliant = score >= 80 && criticalFindings === 0;

      return {
        category,
        name: this.getOWASPCategoryName(category),
        description: this.getOWASPCategoryDescription(category),
        compliant,
        score: Math.round(score),
        findings,
        criticalFindings,
        recommendations: this.getOWASPRecommendations(category),
        testResults: categoryTests.map(test => ({
          testName: test.testId,
          passed: test.passed,
          details: test.findings.map(f => f.message).join('; ')
        }))
      };
    });
  }

  private getOWASPCategoryName(category: string): string {
    const names: Record<string, string> = {
      'API1_broken_auth': 'Broken Object Level Authorization',
      'API2_broken_user_auth': 'Broken User Authentication',
      'API3_excessive_data': 'Excessive Data Exposure',
      'API4_lack_resources': 'Lack of Resources & Rate Limiting',
      'API5_broken_function': 'Broken Function Level Authorization',
      'API6_mass_assignment': 'Mass Assignment',
      'API7_security_misconfig': 'Security Misconfiguration',
      'API8_injection': 'Injection',
      'API9_improper_assets': 'Improper Assets Management',
      'API10_logging_monitoring': 'Insufficient Logging & Monitoring'
    };
    return names[category] || category;
  }

  private getOWASPCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'API1_broken_auth': 'APIs tend to expose endpoints that handle object identifiers, creating a wide attack surface',
      'API2_broken_user_auth': 'Authentication mechanisms are often implemented incorrectly',
      'API3_excessive_data': 'APIs may expose more data than necessary, relying on clients to filter',
      'API4_lack_resources': 'APIs often lack proper rate limiting and resource management',
      'API5_broken_function': 'Complex access control policies with different hierarchies and roles',
      'API6_mass_assignment': 'Binding client provided data to data models without proper filtering',
      'API7_security_misconfig': 'Security misconfigurations in API implementations',
      'API8_injection': 'Injection flaws occur when untrusted data is sent as part of a command or query',
      'API9_improper_assets': 'APIs tend to expose more endpoints than traditional web applications',
      'API10_logging_monitoring': 'Insufficient logging and monitoring, coupled with missing incident response'
    };
    return descriptions[category] || '';
  }

  private getOWASPRecommendations(category: string): string[] {
    const recommendations: Record<string, string[]> = {
      'API1_broken_auth': [
        'Implement proper authorization checks for all endpoints',
        'Use user policies and hierarchy to perform authorization checks',
        'Prefer random UUIDs over incremental IDs'
      ],
      'API3_excessive_data': [
        'Never rely on client-side filtering of sensitive data',
        'Review API responses to ensure they contain only legitimate data',
        'Implement schema-based response validation'
      ],
      'API4_lack_resources': [
        'Implement rate limiting',
        'Limit payload sizes',
        'Implement proper timeout handling'
      ],
      'API8_injection': [
        'Use parameterized queries for database access',
        'Validate, filter, and sanitize all user input',
        'Use secure coding practices'
      ]
    };
    return recommendations[category] || ['Review and implement security best practices'];
  }

  private calculateComplianceScore(owaspResults: OWASPComplianceResult[]): number {
    if (owaspResults.length === 0) return 0;
    return Math.round(owaspResults.reduce((sum, result) => sum + result.score, 0) / owaspResults.length);
  }

  private generateRecommendations(vulnerabilities: APIVulnerability[]): string[] {
    const recommendations = new Set<string>();

    vulnerabilities.forEach(vuln => {
      recommendations.add(vuln.remediation.recommendation);
    });

    // Add general recommendations
    if (vulnerabilities.some(v => v.category === 'broken_auth')) {
      recommendations.add('Review and strengthen authentication mechanisms');
    }
    
    if (vulnerabilities.some(v => v.severity === 'critical')) {
      recommendations.add('Address critical vulnerabilities immediately');
    }

    if (vulnerabilities.some(v => v.category === 'injection')) {
      recommendations.add('Implement comprehensive input validation');
    }

    return Array.from(recommendations);
  }

  private getImpactDescription(severity: string): string {
    switch (severity) {
      case 'critical': return 'Could lead to complete system compromise or significant data breach';
      case 'high': return 'Could lead to unauthorized access to sensitive data or system functions';
      case 'medium': return 'Could lead to limited unauthorized access or information disclosure';
      case 'low': return 'Could lead to minor information disclosure or system behavior changes';
      default: return 'Informational finding with no direct security impact';
    }
  }

  /**
   * Generate API security metrics
   */
  generateSecurityMetrics(timeframe: { start: Date; end: Date }): APISecurityMetrics {
    const context = createErrorContext('APISecurityScannerService', 'generateSecurityMetrics');

    // Validate timeframe parameter
    if (!timeframe || !timeframe.start || !timeframe.end) {
      throw new ValidationError('Timeframe with start and end dates is required', context, 'timeframe');
    }

    if (!(timeframe.start instanceof Date) || !(timeframe.end instanceof Date)) {
      throw new ValidationError('Start and end must be valid Date objects', context, 'timeframe');
    }

    if (isNaN(timeframe.start.getTime()) || isNaN(timeframe.end.getTime())) {
      throw new ValidationError('Start and end dates must be valid', context, 'timeframe');
    }

    if (timeframe.start >= timeframe.end) {
      throw new ValidationError('Start date must be before end date', context, 'timeframe');
    }

    // Check for reasonable date range (not too far in the past/future)
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    if (timeframe.start < oneYearAgo || timeframe.end > oneYearFromNow) {
      this.logger.warn('Timeframe range is unusually large', {
        ...context,
        metadata: {
          start: timeframe.start.toISOString(),
          end: timeframe.end.toISOString(),
          days: Math.round((timeframe.end.getTime() - timeframe.start.getTime()) / (24 * 60 * 60 * 1000))
        }
      });
    }

    this.logger.info('Generating security metrics', {
      ...context,
      metadata: {
        startDate: timeframe.start.toISOString(),
        endDate: timeframe.end.toISOString()
      }
    });

    const endpoints = Array.from(this.endpoints.values());
    const scans = Array.from(this.scans.values()).filter(scan =>
      scan.startTime >= timeframe.start && scan.startTime <= timeframe.end
    );
    const vulnerabilities = Array.from(this.vulnerabilities.values()).filter(vuln =>
      vuln.discoveredAt >= timeframe.start && vuln.discoveredAt <= timeframe.end
    );

    const scannedEndpoints = new Set(scans.map(scan => scan.endpointId));
    const secureEndpoints = scans.filter(scan => scan.results.riskScore < 30);
    const vulnerableEndpoints = scans.filter(scan => scan.results.riskScore >= 30);
    const highRiskEndpoints = scans.filter(scan => scan.results.riskScore >= 70);

    const vulnerabilityByCategory = vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.category] = (acc[vuln.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate compliance metrics
    const completedScans = scans.filter(scan => scan.status === 'completed');
    const averageOwaspScore = completedScans.length > 0 ?
      completedScans.reduce((sum, scan) => sum + scan.compliance.overallScore, 0) / completedScans.length : 0;
    
    const failingCategories = completedScans
      .flatMap(scan => scan.compliance.owaspTop10.filter(cat => !cat.compliant).map(cat => cat.name))
      .filter((cat, index, arr) => arr.indexOf(cat) === index);

    // Generate trends (simplified)
    const days = Math.ceil((timeframe.end.getTime() - timeframe.start.getTime()) / (1000 * 60 * 60 * 24));
    const trends = {
      scanActivity: [] as { date: Date; scans: number }[],
      vulnerabilityTrend: [] as { date: Date; count: number }[],
      riskScoreTrend: [] as { date: Date; score: number }[]
    };

    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(timeframe.start.getTime() + i * 24 * 60 * 60 * 1000);
      const dayScans = scans.filter(scan => scan.startTime.toDateString() === date.toDateString());
      const dayVulns = vulnerabilities.filter(vuln => vuln.discoveredAt.toDateString() === date.toDateString());
      const avgRiskScore = dayScans.length > 0 ?
        dayScans.reduce((sum, scan) => sum + scan.results.riskScore, 0) / dayScans.length : 0;

      trends.scanActivity.push({ date, scans: dayScans.length });
      trends.vulnerabilityTrend.push({ date, count: dayVulns.length });
      trends.riskScoreTrend.push({ date, score: Math.round(avgRiskScore) });
    }

    const topRisks = scans
      .filter(scan => scan.status === 'completed')
      .map(scan => ({
        endpoint: this.endpoints.get(scan.endpointId)?.name || scan.endpointId,
        riskScore: scan.results.riskScore,
        vulnerabilities: scan.vulnerabilities.length,
        lastScanned: scan.endTime || scan.startTime
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    return {
      timeframe,
      endpoints: {
        total: endpoints.length,
        scanned: scannedEndpoints.size,
        secure: secureEndpoints.length,
        vulnerable: vulnerableEndpoints.length,
        highRisk: highRiskEndpoints.length
      },
      vulnerabilities: {
        total: vulnerabilities.length,
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length,
        byCategory: vulnerabilityByCategory
      },
      compliance: {
        owaspScore: Math.round(averageOwaspScore),
        complianceRate: completedScans.length > 0 ?
          (completedScans.filter(scan => scan.compliance.overallScore >= 80).length / completedScans.length) * 100 : 0,
        failingCategories
      },
      trends,
      topRisks
    };
  }

  /**
   * Public accessor methods
   */
  getEndpoints(): APIEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  getEndpoint(endpointId: string): APIEndpoint | undefined {
    const context = createErrorContext('APISecurityScannerService', 'getEndpoint');

    // Validate endpointId parameter
    if (!endpointId || typeof endpointId !== 'string') {
      throw new ValidationError('Endpoint ID is required and must be a string', context, 'endpointId');
    }

    const sanitizedId = sanitizeUserInput(endpointId);
    if (sanitizedId !== endpointId) {
      this.logger.warn('Endpoint ID was sanitized', { ...context, metadata: { originalId: endpointId, sanitizedId } });
    }

    const endpoint = this.endpoints.get(sanitizedId);
    if (!endpoint) {
      this.logger.debug('Endpoint not found', { ...context, metadata: { endpointId: sanitizedId } });
    }

    return endpoint;
  }

  getScans(): APISecurityScan[] {
    return Array.from(this.scans.values()).sort((a, b) =>
      b.startTime.getTime() - a.startTime.getTime()
    );
  }

  getScan(scanId: string): APISecurityScan | undefined {
    const context = createErrorContext('APISecurityScannerService', 'getScan');

    // Validate scanId parameter
    if (!scanId || typeof scanId !== 'string') {
      throw new ValidationError('Scan ID is required and must be a string', context, 'scanId');
    }

    const sanitizedId = sanitizeUserInput(scanId);
    if (sanitizedId !== scanId) {
      this.logger.warn('Scan ID was sanitized', { ...context, metadata: { originalId: scanId, sanitizedId } });
    }

    const scan = this.scans.get(sanitizedId);
    if (!scan) {
      this.logger.debug('Scan not found', { ...context, metadata: { scanId: sanitizedId } });
    }

    return scan;
  }

  getVulnerabilities(): APIVulnerability[] {
    return Array.from(this.vulnerabilities.values()).sort((a, b) =>
      b.discoveredAt.getTime() - a.discoveredAt.getTime()
    );
  }

  getVulnerability(vulnerabilityId: string): APIVulnerability | undefined {
    return this.vulnerabilities.get(vulnerabilityId);
  }

  getSecurityTests(): APISecurityTest[] {
    return Array.from(this.securityTests.values());
  }
}

// Type definitions for API security scanner
interface ResponseSchema {
  type: string;
  properties: Record<string, unknown>;
  [key: string]: unknown;
}

interface TestConfig {
  sensitiveFields: string[];
  [key: string]: unknown;
}

interface TestEvidence {
  [key: string]: unknown;
}

export default APISecurityScannerService;
