/**
 * Application Security Integration Service
 * Orchestrates all application security components for Zero Trust architecture
 * Provides unified interface for application security management
 */

import ApplicationSecurityGatewayService from './applicationSecurityGateway';
import APISecurityScannerService from './apiSecurityScanner';
import ApplicationRuntimeProtectionService from './applicationRuntimeProtection';

export interface ApplicationSecurityStatus {
  applicationId: string;
  name: string;
  overallSecurityScore: number; // 0-100
  lastAssessment: Date;
  status: 'secure' | 'warning' | 'critical' | 'unknown';
  components: {
    gateway: {
      status: 'active' | 'inactive' | 'error';
      score: number;
      lastCheck: Date;
      issues: string[];
    };
    apiSecurity: {
      status: 'compliant' | 'non_compliant' | 'scanning' | 'error';
      score: number;
      lastScan: Date;
      vulnerabilities: number;
      criticalVulns: number;
    };
    runtimeProtection: {
      status: 'protected' | 'monitoring' | 'disabled' | 'error';
      score: number;
      activeThreats: number;
      blockedAttacks: number;
      lastEvent: Date;
    };
  };
  recommendations: {
    priority: 'immediate' | 'high' | 'medium' | 'low';
    category: 'security' | 'compliance' | 'performance' | 'configuration';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }[];
  compliance: {
    frameworks: {
      name: string;
      score: number;
      status: 'compliant' | 'partial' | 'non_compliant';
      requirements: {
        id: string;
        name: string;
        status: 'met' | 'partial' | 'not_met';
        evidence: string[];
      }[];
    }[];
    overallScore: number;
  };
}

export interface SecurityEventCorrelation {
  id: string;
  timestamp: Date;
  correlationType: 'attack_pattern' | 'threat_campaign' | 'vulnerability_exploit' | 'policy_violation';
  confidence: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  relatedEvents: {
    sourceService: 'gateway' | 'api_scanner' | 'runtime_protection';
    eventId: string;
    eventType: string;
    timestamp: Date;
    relevance: number; // 0-100
  }[];
  indicators: {
    type: 'ip' | 'user' | 'pattern' | 'signature' | 'behavior';
    value: string;
    confidence: number;
  }[];
  impact: {
    applications: string[];
    endpoints: string[];
    users: string[];
    dataTypes: string[];
  };
  recommendations: string[];
  status: 'new' | 'investigating' | 'confirmed' | 'mitigated' | 'resolved';
}

export interface SecurityPolicyRecommendation {
  id: string;
  type: 'access_control' | 'api_security' | 'runtime_protection' | 'compliance';
  priority: 'immediate' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  configuration: {
    service: 'gateway' | 'api_scanner' | 'runtime_protection';
    action: 'create' | 'modify' | 'enable' | 'disable';
    parameters: Record<string, any>;
  };
  impact: {
    security: number; // -100 to 100
    performance: number; // -100 to 100
    usability: number; // -100 to 100
    compliance: number; // -100 to 100
  };
  evidence: {
    type: 'vulnerability' | 'threat' | 'compliance_gap' | 'best_practice';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
  }[];
  estimatedEffort: {
    hours: number;
    complexity: 'low' | 'medium' | 'high';
    requiredSkills: string[];
  };
}

export interface ApplicationSecurityMetrics {
  timeframe: { start: Date; end: Date };
  overview: {
    totalApplications: number;
    secureApplications: number;
    vulnerableApplications: number;
    criticalIssues: number;
    averageSecurityScore: number;
  };
  security: {
    blockedAttacks: number;
    detectedThreats: number;
    vulnerabilities: {
      total: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
      fixed: number;
    };
    compliance: {
      averageScore: number;
      frameworkScores: Record<string, number>;
    };
  };
  performance: {
    securityProcessingTime: number; // ms
    gatewayThroughput: number; // requests/sec
    scanCoverage: number; // percentage
    falsePositiveRate: number; // percentage
  };
  trends: {
    securityScore: { date: Date; score: number }[];
    threatLevel: { date: Date; level: number }[];
    vulnerabilityCount: { date: Date; count: number }[];
    complianceScore: { date: Date; score: number }[];
  };
  topRisks: {
    application: string;
    riskType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    description: string;
    lastDetected: Date;
  }[];
}

export class ApplicationSecurityIntegrationService {
  private gatewayService: ApplicationSecurityGatewayService;
  private apiScannerService: APISecurityScannerService;
  private runtimeProtectionService: ApplicationRuntimeProtectionService;
  
  private correlatedEvents: Map<string, SecurityEventCorrelation> = new Map();
  private policyRecommendations: Map<string, SecurityPolicyRecommendation> = new Map();
  private applicationStatuses: Map<string, ApplicationSecurityStatus> = new Map();

  constructor() {
    this.gatewayService = new ApplicationSecurityGatewayService();
    this.apiScannerService = new APISecurityScannerService();
    this.runtimeProtectionService = new ApplicationRuntimeProtectionService();
    
    this.initializeIntegrationService();
  }

  /**
   * Initialize the integration service
   */
  private initializeIntegrationService(): void {
    this.initializeSampleApplicationStatuses();
    this.initializeSampleCorrelations();
    this.initializeSampleRecommendations();
    this.startEventCorrelation();
  }

  /**
   * Initialize sample application security statuses
   */
  private initializeSampleApplicationStatuses(): void {
    const sampleStatuses: ApplicationSecurityStatus[] = [
      {
        applicationId: 'app-api-gateway-001',
        name: 'SecureFlow API Gateway',
        overallSecurityScore: 78,
        lastAssessment: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'warning',
        components: {
          gateway: {
            status: 'active',
            score: 85,
            lastCheck: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            issues: ['Rate limiting threshold may be too high for public endpoints']
          },
          apiSecurity: {
            status: 'non_compliant',
            score: 65,
            lastScan: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            vulnerabilities: 5,
            criticalVulns: 1
          },
          runtimeProtection: {
            status: 'protected',
            score: 85,
            activeThreats: 2,
            blockedAttacks: 247,
            lastEvent: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
          }
        },
        recommendations: [
          {
            priority: 'immediate',
            category: 'security',
            title: 'Fix Critical SQL Injection Vulnerability',
            description: 'Address the critical SQL injection vulnerability found in the admin users endpoint',
            impact: 'High risk of data breach and system compromise',
            effort: 'medium'
          },
          {
            priority: 'high',
            category: 'security',
            title: 'Implement Data Minimization',
            description: 'Reduce excessive data exposure in API responses to limit attack surface',
            impact: 'Reduced risk of sensitive data exposure',
            effort: 'low'
          },
          {
            priority: 'medium',
            category: 'compliance',
            title: 'Enhance Logging and Monitoring',
            description: 'Improve security event logging to meet compliance requirements',
            impact: 'Better threat detection and compliance posture',
            effort: 'medium'
          }
        ],
        compliance: {
          frameworks: [
            {
              name: 'OWASP API Security Top 10',
              score: 65,
              status: 'partial',
              requirements: [
                {
                  id: 'API1',
                  name: 'Broken Object Level Authorization',
                  status: 'not_met',
                  evidence: ['Critical vulnerability found in admin endpoint']
                },
                {
                  id: 'API3',
                  name: 'Excessive Data Exposure',
                  status: 'partial',
                  evidence: ['Some endpoints return unnecessary sensitive data']
                },
                {
                  id: 'API4',
                  name: 'Lack of Resources & Rate Limiting',
                  status: 'met',
                  evidence: ['Rate limiting implemented for all endpoints']
                }
              ]
            },
            {
              name: 'NIST Cybersecurity Framework',
              score: 72,
              status: 'partial',
              requirements: [
                {
                  id: 'PR.AC-1',
                  name: 'Identity Management',
                  status: 'met',
                  evidence: ['Comprehensive identity management implemented']
                },
                {
                  id: 'DE.CM-1',
                  name: 'Continuous Monitoring',
                  status: 'met',
                  evidence: ['Runtime protection and monitoring active']
                },
                {
                  id: 'RS.RP-1',
                  name: 'Response Planning',
                  status: 'partial',
                  evidence: ['Automated response policies configured']
                }
              ]
            }
          ],
          overallScore: 69
        }
      },
      {
        applicationId: 'app-web-frontend-001',
        name: 'SecureFlow Web Frontend',
        overallSecurityScore: 92,
        lastAssessment: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        status: 'secure',
        components: {
          gateway: {
            status: 'active',
            score: 95,
            lastCheck: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            issues: []
          },
          apiSecurity: {
            status: 'compliant',
            score: 88,
            lastScan: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            vulnerabilities: 2,
            criticalVulns: 0
          },
          runtimeProtection: {
            status: 'protected',
            score: 94,
            activeThreats: 0,
            blockedAttacks: 23,
            lastEvent: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
          }
        },
        recommendations: [
          {
            priority: 'low',
            category: 'performance',
            title: 'Optimize Security Processing',
            description: 'Fine-tune security checks for better performance',
            impact: 'Improved user experience with maintained security',
            effort: 'low'
          }
        ],
        compliance: {
          frameworks: [
            {
              name: 'OWASP API Security Top 10',
              score: 88,
              status: 'compliant',
              requirements: [
                {
                  id: 'API1',
                  name: 'Broken Object Level Authorization',
                  status: 'met',
                  evidence: ['Proper authorization implemented']
                },
                {
                  id: 'API3',
                  name: 'Excessive Data Exposure',
                  status: 'met',
                  evidence: ['Data minimization implemented']
                }
              ]
            }
          ],
          overallScore: 88
        }
      }
    ];

    sampleStatuses.forEach(status => {
      this.applicationStatuses.set(status.applicationId, status);
    });
  }

  /**
   * Initialize sample event correlations
   */
  private initializeSampleCorrelations(): void {
    const sampleCorrelations: SecurityEventCorrelation[] = [
      {
        id: 'correlation-001',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        correlationType: 'attack_pattern',
        confidence: 92,
        severity: 'critical',
        description: 'Coordinated SQL injection attack detected across multiple endpoints',
        relatedEvents: [
          {
            sourceService: 'runtime_protection',
            eventId: 'event-001',
            eventType: 'http_request',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            relevance: 95
          },
          {
            sourceService: 'api_scanner',
            eventId: 'vuln-001',
            eventType: 'vulnerability_detection',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            relevance: 88
          }
        ],
        indicators: [
          {
            type: 'signature',
            value: 'SQL injection pattern',
            confidence: 98
          },
          {
            type: 'ip',
            value: '192.168.1.100',
            confidence: 95
          },
          {
            type: 'pattern',
            value: 'sqlmap user agent',
            confidence: 99
          }
        ],
        impact: {
          applications: ['app-api-gateway-001'],
          endpoints: ['/v1/users/{id}', '/v1/admin/users'],
          users: [],
          dataTypes: ['user_profiles', 'administrative_data']
        },
        recommendations: [
          'Immediately patch SQL injection vulnerability',
          'Block attacking IP addresses',
          'Review all database access patterns',
          'Implement prepared statements'
        ],
        status: 'confirmed'
      },
      {
        id: 'correlation-002',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        correlationType: 'threat_campaign',
        confidence: 78,
        severity: 'high',
        description: 'Credential stuffing campaign detected with multiple authentication failures',
        relatedEvents: [
          {
            sourceService: 'runtime_protection',
            eventId: 'event-002',
            eventType: 'authentication',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            relevance: 85
          },
          {
            sourceService: 'gateway',
            eventId: 'gateway-event-auth-fail-001',
            eventType: 'authentication_failure',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            relevance: 82
          }
        ],
        indicators: [
          {
            type: 'behavior',
            value: 'high_failure_rate',
            confidence: 90
          },
          {
            type: 'pattern',
            value: 'distributed_sources',
            confidence: 76
          }
        ],
        impact: {
          applications: ['app-api-gateway-001'],
          endpoints: ['/v1/auth/login'],
          users: ['user-12345', 'user-67890'],
          dataTypes: ['credentials']
        },
        recommendations: [
          'Implement account lockout policies',
          'Enable MFA for affected accounts',
          'Monitor for compromised credentials',
          'Review authentication logs'
        ],
        status: 'investigating'
      }
    ];

    sampleCorrelations.forEach(correlation => {
      this.correlatedEvents.set(correlation.id, correlation);
    });
  }

  /**
   * Initialize sample policy recommendations
   */
  private initializeSampleRecommendations(): void {
    const sampleRecommendations: SecurityPolicyRecommendation[] = [
      {
        id: 'rec-001',
        type: 'api_security',
        priority: 'immediate',
        title: 'Enable SQL Injection Protection',
        description: 'Configure comprehensive SQL injection protection for all database-connected endpoints',
        rationale: 'Critical SQL injection vulnerability detected that could lead to data breach',
        configuration: {
          service: 'api_scanner',
          action: 'create',
          parameters: {
            testEnabled: true,
            sensitivity: 'high',
            patterns: ['sql_injection', 'command_injection'],
            autoBlock: true
          }
        },
        impact: {
          security: 40,
          performance: -5,
          usability: 0,
          compliance: 25
        },
        evidence: [
          {
            type: 'vulnerability',
            description: 'SQL injection vulnerability in admin users endpoint',
            severity: 'critical',
            source: 'API Security Scanner'
          }
        ],
        estimatedEffort: {
          hours: 4,
          complexity: 'medium',
          requiredSkills: ['security', 'api_development']
        }
      },
      {
        id: 'rec-002',
        type: 'runtime_protection',
        priority: 'high',
        title: 'Implement Behavioral Anomaly Detection',
        description: 'Enable ML-based behavioral anomaly detection for user authentication patterns',
        rationale: 'Multiple credential stuffing attempts detected requiring proactive detection',
        configuration: {
          service: 'runtime_protection',
          action: 'enable',
          parameters: {
            detectorType: 'behavioral',
            sensitivity: 'medium',
            learningPeriod: 7,
            features: ['authentication_patterns', 'access_patterns']
          }
        },
        impact: {
          security: 30,
          performance: -10,
          usability: -5,
          compliance: 15
        },
        evidence: [
          {
            type: 'threat',
            description: 'Credential stuffing campaign detected',
            severity: 'high',
            source: 'Runtime Protection'
          },
          {
            type: 'best_practice',
            description: 'Behavioral analysis improves threat detection accuracy',
            severity: 'medium',
            source: 'Security Best Practices'
          }
        ],
        estimatedEffort: {
          hours: 8,
          complexity: 'high',
          requiredSkills: ['security', 'machine_learning', 'behavioral_analysis']
        }
      },
      {
        id: 'rec-003',
        type: 'access_control',
        priority: 'medium',
        title: 'Implement Fine-Grained Authorization',
        description: 'Enhance access control with attribute-based authorization for sensitive endpoints',
        rationale: 'Current role-based access control may be too permissive for highly sensitive data',
        configuration: {
          service: 'gateway',
          action: 'modify',
          parameters: {
            authorizationType: 'attribute_based',
            attributes: ['user_role', 'data_classification', 'access_context'],
            enforcementMode: 'strict'
          }
        },
        impact: {
          security: 25,
          performance: -8,
          usability: -12,
          compliance: 30
        },
        evidence: [
          {
            type: 'compliance_gap',
            description: 'Fine-grained access control required for data protection compliance',
            severity: 'medium',
            source: 'Compliance Assessment'
          }
        ],
        estimatedEffort: {
          hours: 16,
          complexity: 'high',
          requiredSkills: ['security', 'access_control', 'policy_management']
        }
      }
    ];

    sampleRecommendations.forEach(recommendation => {
      this.policyRecommendations.set(recommendation.id, recommendation);
    });
  }

  /**
   * Start event correlation process
   */
  private startEventCorrelation(): void {
    // In a real implementation, this would run continuously
    setInterval(() => {
      this.performEventCorrelation();
    }, 60000); // Run every minute
  }

  /**
   * Perform event correlation across all security services
   */
  private performEventCorrelation(): void {
    const recentThreshold = new Date(Date.now() - 60 * 60 * 1000); // Last hour
    
    // Get recent events from all services
    const runtimeEvents = this.runtimeProtectionService.getEvents()
      .filter(event => event.timestamp >= recentThreshold);
    
    const scanResults = this.apiScannerService.getScans()
      .filter(scan => scan.startTime >= recentThreshold);
    
    // Simple correlation example - look for patterns
    this.correlateSecurityEvents(runtimeEvents, scanResults);
  }

  /**
   * Correlate security events to identify attack patterns
   */
  private correlateSecurityEvents(runtimeEvents: RuntimeEvent[], scanResults: ScanResult[]): void {
    // Example correlation logic - in practice, this would be much more sophisticated
    const ipGroups = new Map<string, EventGroup[]>();
    
    // Group events by IP address
    runtimeEvents.forEach(event => {
      const ip = event.source.ipAddress;
      if (!ipGroups.has(ip)) {
        ipGroups.set(ip, []);
      }
      ipGroups.get(ip)?.push({
        source: 'runtime_protection',
        event
      });
    });

    // Look for IPs with multiple suspicious events
    for (const [ip, events] of ipGroups.entries()) {
      if (events.length >= 3) {
        const highRiskEvents = events.filter(e => 
          e.event.details.risk.score >= 70
        );

        if (highRiskEvents.length >= 2) {
          // Create correlation
          const correlationId = `correlation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const correlation: SecurityEventCorrelation = {
            id: correlationId,
            timestamp: new Date(),
            correlationType: 'attack_pattern',
            confidence: Math.min(95, highRiskEvents.length * 20 + 50),
            severity: 'high',
            description: `Multiple suspicious activities detected from IP ${ip}`,
            relatedEvents: highRiskEvents.map(e => ({
              sourceService: 'runtime_protection' as const,
              eventId: e.event.id,
              eventType: e.event.type,
              timestamp: e.event.timestamp,
              relevance: e.event.details.risk.score
            })),
            indicators: [
              {
                type: 'ip',
                value: ip,
                confidence: 90
              }
            ],
            impact: {
              applications: [...new Set(events.map(e => e.event.applicationId))],
              endpoints: [...new Set(events.map(e => e.event.details.endpoint).filter(Boolean))],
              users: [...new Set(events.map(e => e.event.source.userId).filter(Boolean))],
              dataTypes: []
            },
            recommendations: [
              'Block or rate-limit IP address',
              'Investigate user accounts accessed from this IP',
              'Review security policies for affected endpoints'
            ],
            status: 'new'
          };

          this.correlatedEvents.set(correlationId, correlation);
        }
      }
    }
  }

  /**
   * Get comprehensive application security status
   */
  async getApplicationSecurityStatus(applicationId: string): Promise<ApplicationSecurityStatus | null> {
    const status = this.applicationStatuses.get(applicationId);
    if (!status) {
      return null;
    }

    // Update with real-time data
    const updatedStatus = await this.refreshApplicationStatus(status);
    this.applicationStatuses.set(applicationId, updatedStatus);
    
    return updatedStatus;
  }

  /**
   * Refresh application status with latest data
   */
  private async refreshApplicationStatus(status: ApplicationSecurityStatus): Promise<ApplicationSecurityStatus> {
    // Get latest data from each service
    const application = this.gatewayService.getApplication(status.applicationId);
    const apiEndpoints = this.apiScannerService.getEndpoints()
      .filter(endpoint => endpoint.applicationId === status.applicationId);
    const recentEvents = this.runtimeProtectionService.getEvents()
      .filter(event => event.applicationId === status.applicationId)
      .slice(0, 100); // Last 100 events

    // Calculate updated scores
    const gatewayScore = application ? this.calculateGatewayScore(application) : status.components.gateway.score;
    const apiScore = apiEndpoints.length > 0 ? this.calculateAPISecurityScore(apiEndpoints) : status.components.apiSecurity.score;
    const runtimeScore = this.calculateRuntimeProtectionScore(recentEvents);

    // Calculate overall security score
    const overallScore = Math.round((gatewayScore * 0.3 + apiScore * 0.4 + runtimeScore * 0.3));

    // Determine status
    let overallStatus: ApplicationSecurityStatus['status'] = 'secure';
    if (overallScore < 60) overallStatus = 'critical';
    else if (overallScore < 80) overallStatus = 'warning';

    // Generate updated recommendations
    const updatedRecommendations = this.generateSecurityRecommendations(status.applicationId, {
      gatewayScore,
      apiScore,
      runtimeScore,
      overallScore
    });

    return {
      ...status,
      overallSecurityScore: overallScore,
      lastAssessment: new Date(),
      status: overallStatus,
      components: {
        gateway: {
          ...status.components.gateway,
          score: gatewayScore,
          lastCheck: new Date()
        },
        apiSecurity: {
          ...status.components.apiSecurity,
          score: apiScore,
          lastScan: new Date()
        },
        runtimeProtection: {
          ...status.components.runtimeProtection,
          score: runtimeScore,
          activeThreats: this.runtimeProtectionService.getThreats()
            .filter(threat => threat.status === 'active').length,
          lastEvent: recentEvents.length > 0 ? recentEvents[0].timestamp : status.components.runtimeProtection.lastEvent
        }
      },
      recommendations: updatedRecommendations
    };
  }

  /**
   * Calculate gateway security score
   */
  private calculateGatewayScore(application: ApplicationConfig): number {
    let score = 100;
    
    // Deduct points for missing security features
    if (!application.security.authentication.enabled) score -= 30;
    if (!application.security.authorization.enabled) score -= 25;
    if (!application.security.encryption.inTransit) score -= 20;
    if (!application.security.inputValidation.enabled) score -= 15;
    if (!application.monitoring.securityEvents.enabled) score -= 10;

    return Math.max(0, score);
  }

  /**
   * Calculate API security score
   */
  private calculateAPISecurityScore(endpoints: APIEndpoint[]): number {
    if (endpoints.length === 0) return 0;

    let totalScore = 0;
    let endpointCount = 0;

    endpoints.forEach(endpoint => {
      let endpointScore = 100;
      
      // Check security configurations
      if (!endpoint.security.inputValidation) endpointScore -= 20;
      if (!endpoint.security.outputEncoding) endpointScore -= 15;
      if (!endpoint.security.sqlInjectionProtection) endpointScore -= 25;
      if (!endpoint.security.xssProtection) endpointScore -= 15;
      if (!endpoint.rateLimit.enabled) endpointScore -= 15;
      if (endpoint.authentication.required === false && endpoint.metadata.criticality === 'critical') {
        endpointScore -= 30;
      }

      totalScore += Math.max(0, endpointScore);
      endpointCount++;
    });

    return Math.round(totalScore / endpointCount);
  }

  /**
   * Calculate runtime protection score
   */
  private calculateRuntimeProtectionScore(events: RuntimeEvent[]): number {
    if (events.length === 0) return 95; // High score if no events (no threats)

    const recentEvents = events.filter(event => 
      event.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    );

    const blockedEvents = recentEvents.filter(event => event.status === 'blocked');
    const criticalEvents = recentEvents.filter(event => event.severity === 'critical');
    
    let score = 100;
    
    // Deduct points for unblocked critical events
    const unblockedCritical = criticalEvents.filter(event => event.status !== 'blocked');
    score -= unblockedCritical.length * 20;
    
    // Deduct points for high event volume (potential attack)
    if (recentEvents.length > 100) score -= 10;
    if (recentEvents.length > 500) score -= 20;
    
    // Add points for effective blocking
    const blockingEffectiveness = recentEvents.length > 0 ? 
      (blockedEvents.length / recentEvents.length) * 100 : 100;
    
    if (blockingEffectiveness > 90) score += 5;
    else if (blockingEffectiveness < 70) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(
    applicationId: string,
    scores: { gatewayScore: number; apiScore: number; runtimeScore: number; overallScore: number }
  ): ApplicationSecurityStatus['recommendations'] {
    const recommendations: ApplicationSecurityStatus['recommendations'] = [];

    // Gateway recommendations
    if (scores.gatewayScore < 80) {
      recommendations.push({
        priority: 'high',
        category: 'security',
        title: 'Strengthen Application Gateway Security',
        description: 'Review and enhance gateway security configurations including authentication and authorization',
        impact: 'Improved protection against unauthorized access',
        effort: 'medium'
      });
    }

    // API security recommendations
    if (scores.apiScore < 70) {
      recommendations.push({
        priority: 'immediate',
        category: 'security',
        title: 'Address API Security Vulnerabilities',
        description: 'Fix identified API security issues and implement missing security controls',
        impact: 'Reduced risk of data breaches and injection attacks',
        effort: 'high'
      });
    }

    // Runtime protection recommendations
    if (scores.runtimeScore < 85) {
      recommendations.push({
        priority: 'high',
        category: 'security',
        title: 'Enhance Runtime Threat Detection',
        description: 'Improve runtime protection policies and threat detection capabilities',
        impact: 'Better real-time threat prevention and response',
        effort: 'medium'
      });
    }

    // Overall security recommendations
    if (scores.overallScore < 80) {
      recommendations.push({
        priority: 'high',
        category: 'security',
        title: 'Comprehensive Security Review',
        description: 'Conduct thorough security assessment and implement Zero Trust architecture principles',
        impact: 'Holistic security improvement across all components',
        effort: 'high'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { immediate: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate comprehensive security metrics
   */
  generateSecurityMetrics(timeframe: { start: Date; end: Date }): ApplicationSecurityMetrics {
    const applications = Array.from(this.applicationStatuses.values());
    const securityEvents = this.runtimeProtectionService.getEvents()
      .filter(event => event.timestamp >= timeframe.start && event.timestamp <= timeframe.end);
    const vulnerabilities = this.apiScannerService.getVulnerabilities()
      .filter(vuln => vuln.discoveredAt >= timeframe.start && vuln.discoveredAt <= timeframe.end);

    const totalApplications = applications.length;
    const secureApplications = applications.filter(app => app.status === 'secure').length;
    const vulnerableApplications = applications.filter(app => app.status === 'critical' || app.status === 'warning').length;
    const criticalIssues = vulnerabilities.filter(vuln => vuln.severity === 'critical').length;
    const averageSecurityScore = applications.length > 0 ?
      Math.round(applications.reduce((sum, app) => sum + app.overallSecurityScore, 0) / applications.length) : 0;

    // Generate trends
    const days = Math.ceil((timeframe.end.getTime() - timeframe.start.getTime()) / (1000 * 60 * 60 * 24));
    const trends = {
      securityScore: [] as { date: Date; score: number }[],
      threatLevel: [] as { date: Date; level: number }[],
      vulnerabilityCount: [] as { date: Date; count: number }[],
      complianceScore: [] as { date: Date; score: number }[]
    };

    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(timeframe.start.getTime() + i * 24 * 60 * 60 * 1000);
      
      trends.securityScore.push({ date, score: averageSecurityScore + Math.random() * 10 - 5 });
      trends.threatLevel.push({ date, level: Math.floor(Math.random() * 10) + 1 });
      trends.vulnerabilityCount.push({ date, count: Math.floor(Math.random() * 20) });
      trends.complianceScore.push({ date, score: 85 + Math.random() * 10 - 5 });
    }

    const topRisks = applications
      .map(app => ({
        application: app.name,
        riskType: app.status === 'critical' ? 'Critical Security Issues' : 
                 app.status === 'warning' ? 'Security Warnings' : 'Low Risk',
        severity: app.status === 'critical' ? 'critical' as const :
                 app.status === 'warning' ? 'high' as const : 'low' as const,
        score: 100 - app.overallSecurityScore,
        description: app.recommendations.length > 0 ? app.recommendations[0].title : 'No issues detected',
        lastDetected: app.lastAssessment
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return {
      timeframe,
      overview: {
        totalApplications,
        secureApplications,
        vulnerableApplications,
        criticalIssues,
        averageSecurityScore
      },
      security: {
        blockedAttacks: securityEvents.filter(event => event.status === 'blocked').length,
        detectedThreats: this.runtimeProtectionService.getThreats().length,
        vulnerabilities: {
          total: vulnerabilities.length,
          critical: vulnerabilities.filter(v => v.severity === 'critical').length,
          high: vulnerabilities.filter(v => v.severity === 'high').length,
          medium: vulnerabilities.filter(v => v.severity === 'medium').length,
          low: vulnerabilities.filter(v => v.severity === 'low').length,
          fixed: vulnerabilities.filter(v => v.status === 'fixed').length
        },
        compliance: {
          averageScore: applications.length > 0 ?
            Math.round(applications.reduce((sum, app) => sum + app.compliance.overallScore, 0) / applications.length) : 0,
          frameworkScores: {
            'OWASP API Security': 72,
            'NIST CSF': 78,
            'ISO 27001': 75
          }
        }
      },
      performance: {
        securityProcessingTime: 12.5,
        gatewayThroughput: 2500,
        scanCoverage: 95,
        falsePositiveRate: 2.3
      },
      trends,
      topRisks
    };
  }

  /**
   * Public accessor methods
   */
  getApplicationStatuses(): ApplicationSecurityStatus[] {
    return Array.from(this.applicationStatuses.values());
  }

  getCorrelatedEvents(): SecurityEventCorrelation[] {
    return Array.from(this.correlatedEvents.values()).sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getPolicyRecommendations(): SecurityPolicyRecommendation[] {
    return Array.from(this.policyRecommendations.values()).sort((a, b) => {
      const priorityOrder = { immediate: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Service accessors for direct access to underlying services
  getGatewayService(): ApplicationSecurityGatewayService {
    return this.gatewayService;
  }

  getAPISecurityService(): APISecurityScannerService {
    return this.apiScannerService;
  }

  getRuntimeProtectionService(): ApplicationRuntimeProtectionService {
    return this.runtimeProtectionService;
  }
}

// Type definitions for application security integration
interface RuntimeEvent {
  id: string;
  timestamp: Date;
  type: string;
  status: string;
  severity: string;
  source: {
    ipAddress: string;
    userId?: string;
  };
  applicationId: string;
  details: {
    endpoint?: string;
    risk: {
      score: number;
    };
  };
}

interface ScanResult {
  id: string;
  timestamp: Date;
  type: string;
  severity: string;
  [key: string]: unknown;
}

interface EventGroup {
  source: string;
  event: RuntimeEvent;
}

interface ApplicationConfig {
  security: {
    authentication: { enabled: boolean };
    authorization: { enabled: boolean };
    encryption: { inTransit: boolean };
    inputValidation: { enabled: boolean };
  };
  monitoring: {
    securityEvents: { enabled: boolean };
  };
}

interface APIEndpoint {
  security: {
    inputValidation: boolean;
    outputEncoding: boolean;
    sqlInjectionProtection: boolean;
    xssProtection: boolean;
  };
  rateLimit: {
    enabled: boolean;
  };
  authentication: {
    required: boolean;
  };
  metadata: {
    criticality: string;
  };
}

export default ApplicationSecurityIntegrationService;
