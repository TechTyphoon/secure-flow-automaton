/**
 * Dynamic Policy Enforcement Engine
 * Implements real-time policy evaluation and enforcement
 * Provides adaptive security policies based on risk and context
 */

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  type: 'access_control' | 'traffic_filtering' | 'data_protection' | 'compliance' | 'custom';
  enabled: boolean;
  priority: number;
  conditions: {
    users?: string[];
    groups?: string[];
    devices?: string[];
    applications?: string[];
    networks?: string[];
    timeWindows?: string[];
    riskLevels?: ('low' | 'medium' | 'high')[];
    contexts?: PolicyContext[];
  };
  actions: {
    allow?: boolean;
    deny?: boolean;
    redirect?: string;
    inspect?: boolean;
    log?: boolean;
    alert?: boolean;
    requireMfa?: boolean;
    quarantine?: boolean;
    rateLimiting?: {
      requests: number;
      window: number; // seconds
    };
  };
  enforcement: 'strict' | 'permissive' | 'monitor';
  adaptiveSettings?: {
    riskBasedAdjustment: boolean;
    learningEnabled: boolean;
    autoTuning: boolean;
  };
  createdAt: Date;
  lastModified: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface PolicyContext {
  type: 'location' | 'device_posture' | 'behavior_pattern' | 'threat_level' | 'compliance_status';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'matches_pattern';
  value: any;
  weight: number; // 0-1 for policy evaluation weight
}

export interface PolicyEvaluation {
  requestId: string;
  policyId: string;
  timestamp: Date;
  subject: {
    userId?: string;
    deviceId?: string;
    ipAddress: string;
    userAgent?: string;
  };
  resource: {
    type: 'application' | 'data' | 'network' | 'api';
    identifier: string;
    classification?: 'public' | 'internal' | 'confidential' | 'restricted';
  };
  context: {
    location?: {
      country: string;
      region: string;
      city: string;
      trusted: boolean;
    };
    device?: {
      trusted: boolean;
      compliant: boolean;
      riskScore: number;
    };
    behavior?: {
      anomalyScore: number;
      patternMatches: string[];
    };
    threat?: {
      level: 'low' | 'medium' | 'high' | 'critical';
      indicators: string[];
    };
  };
  evaluation: {
    result: 'allow' | 'deny' | 'conditional';
    confidence: number;
    appliedPolicies: string[];
    matchedConditions: string[];
    enforcedActions: string[];
    riskScore: number;
  };
  duration: number; // evaluation time in ms
}

export interface PolicyViolation {
  id: string;
  policyId: string;
  violationType: 'access_denied' | 'unauthorized_access' | 'policy_breach' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  deviceId?: string;
  ipAddress: string;
  resource: string;
  description: string;
  timestamp: Date;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  remediation: {
    automatic: string[];
    manual: string[];
    completed: string[];
  };
}

export interface AdaptivePolicyRecommendation {
  id: string;
  type: 'new_policy' | 'policy_update' | 'policy_removal' | 'threshold_adjustment';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  rationale: string;
  impact: {
    security: number; // -100 to 100
    usability: number; // -100 to 100
    performance: number; // -100 to 100
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
    requirements: string[];
  };
  suggestedPolicy?: Partial<PolicyRule>;
  createdAt: Date;
}

export interface PolicyMetrics {
  totalPolicies: number;
  activePolicies: number;
  evaluationsPerSecond: number;
  averageEvaluationTime: number;
  policyViolations: number;
  blockedRequests: number;
  allowedRequests: number;
  adaptiveAdjustments: number;
  falsePositives: number;
  userExperienceScore: number;
}

export class DynamicPolicyEngine {
  private policies: Map<string, PolicyRule> = new Map();
  private evaluations: Map<string, PolicyEvaluation> = new Map();
  private violations: Map<string, PolicyViolation> = new Map();
  private recommendations: Map<string, AdaptivePolicyRecommendation> = new Map();
  private contextCache: Map<string, any> = new Map();

  constructor() {
    this.initializePolicyEngine();
  }

  /**
   * Initialize policy engine with default policies
   */
  private initializePolicyEngine(): void {
    const defaultPolicies: PolicyRule[] = [
      {
        id: 'policy-admin-access-control',
        name: 'Administrative Access Control',
        description: 'Strict access control for administrative functions',
        type: 'access_control',
        enabled: true,
        priority: 100,
        conditions: {
          groups: ['administrators', 'security-team'],
          applications: ['admin-panel', 'infrastructure-management'],
          timeWindows: ['business-hours'],
          riskLevels: ['low', 'medium'],
          contexts: [
            {
              type: 'device_posture',
              operator: 'equals',
              value: 'compliant',
              weight: 0.8
            },
            {
              type: 'location',
              operator: 'equals',
              value: 'trusted',
              weight: 0.6
            }
          ]
        },
        actions: {
          allow: true,
          requireMfa: true,
          log: true,
          alert: true,
          inspect: true
        },
        enforcement: 'strict',
        adaptiveSettings: {
          riskBasedAdjustment: true,
          learningEnabled: false,
          autoTuning: false
        },
        createdAt: new Date('2025-07-15'),
        lastModified: new Date('2025-07-28'),
        triggerCount: 0
      },
      {
        id: 'policy-data-access-protection',
        name: 'Sensitive Data Access Protection',
        description: 'Protection for sensitive data resources',
        type: 'data_protection',
        enabled: true,
        priority: 150,
        conditions: {
          applications: ['database', 'file-server', 'data-warehouse'],
          riskLevels: ['low'],
          contexts: [
            {
              type: 'compliance_status',
              operator: 'equals',
              value: 'compliant',
              weight: 1.0
            },
            {
              type: 'threat_level',
              operator: 'less_than',
              value: 'medium',
              weight: 0.7
            }
          ]
        },
        actions: {
          allow: true,
          inspect: true,
          log: true,
          rateLimiting: {
            requests: 100,
            window: 3600
          }
        },
        enforcement: 'strict',
        adaptiveSettings: {
          riskBasedAdjustment: true,
          learningEnabled: true,
          autoTuning: true
        },
        createdAt: new Date('2025-07-15'),
        lastModified: new Date('2025-07-28'),
        triggerCount: 0
      },
      {
        id: 'policy-iot-device-restriction',
        name: 'IoT Device Network Restriction',
        description: 'Restrict IoT device network access',
        type: 'traffic_filtering',
        enabled: true,
        priority: 200,
        conditions: {
          devices: ['iot-sensors', 'smart-cameras', 'environmental-monitors'],
          networks: ['iot-segment'],
          applications: ['iot-platform', 'data-collection']
        },
        actions: {
          allow: true,
          inspect: true,
          log: true,
          rateLimiting: {
            requests: 10,
            window: 60
          }
        },
        enforcement: 'strict',
        adaptiveSettings: {
          riskBasedAdjustment: false,
          learningEnabled: true,
          autoTuning: false
        },
        createdAt: new Date('2025-07-20'),
        lastModified: new Date('2025-07-28'),
        triggerCount: 0
      },
      {
        id: 'policy-compliance-gdpr',
        name: 'GDPR Compliance Enforcement',
        description: 'Enforce GDPR data protection requirements',
        type: 'compliance',
        enabled: true,
        priority: 50,
        conditions: {
          applications: ['user-management', 'customer-data', 'analytics'],
          contexts: [
            {
              type: 'location',
              operator: 'equals',
              value: 'eu',
              weight: 1.0
            }
          ]
        },
        actions: {
          allow: true,
          inspect: true,
          log: true,
          alert: true
        },
        enforcement: 'strict',
        adaptiveSettings: {
          riskBasedAdjustment: false,
          learningEnabled: false,
          autoTuning: false
        },
        createdAt: new Date('2025-07-15'),
        lastModified: new Date('2025-07-28'),
        triggerCount: 0
      },
      {
        id: 'policy-adaptive-threat-response',
        name: 'Adaptive Threat Response',
        description: 'Dynamic response based on threat intelligence',
        type: 'custom',
        enabled: true,
        priority: 75,
        conditions: {
          riskLevels: ['high'],
          contexts: [
            {
              type: 'threat_level',
              operator: 'greater_than',
              value: 'medium',
              weight: 0.9
            },
            {
              type: 'behavior_pattern',
              operator: 'contains',
              value: 'anomalous',
              weight: 0.7
            }
          ]
        },
        actions: {
          requireMfa: true,
          inspect: true,
          log: true,
          alert: true,
          quarantine: true
        },
        enforcement: 'strict',
        adaptiveSettings: {
          riskBasedAdjustment: true,
          learningEnabled: true,
          autoTuning: true
        },
        createdAt: new Date('2025-07-25'),
        lastModified: new Date('2025-07-28'),
        triggerCount: 0
      }
    ];

    defaultPolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });
  }

  /**
   * Evaluate access request against policies
   */
  async evaluateAccess(
    subject: PolicyEvaluation['subject'],
    resource: PolicyEvaluation['resource'],
    context?: Partial<PolicyEvaluation['context']>
  ): Promise<PolicyEvaluation> {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    // Get applicable policies
    const applicablePolicies = this.getApplicablePolicies(subject, resource, context);

    // Evaluate policies
    const evaluation = await this.performPolicyEvaluation(applicablePolicies, subject, resource, context);

    const policyEvaluation: PolicyEvaluation = {
      requestId,
      policyId: evaluation.appliedPolicies[0] || 'default',
      timestamp: new Date(),
      subject,
      resource,
      context: context || {},
      evaluation,
      duration: Date.now() - startTime
    };

    this.evaluations.set(requestId, policyEvaluation);

    // Update policy trigger counts
    evaluation.appliedPolicies.forEach(policyId => {
      const policy = this.policies.get(policyId);
      if (policy) {
        policy.triggerCount++;
        policy.lastTriggered = new Date();
      }
    });

    // Check for violations
    if (evaluation.result === 'deny') {
      await this.recordPolicyViolation(policyEvaluation);
    }

    return policyEvaluation;
  }

  /**
   * Get applicable policies for a request
   */
  private getApplicablePolicies(
    subject: PolicyEvaluation['subject'],
    resource: PolicyEvaluation['resource'],
    context?: Partial<PolicyEvaluation['context']>
  ): PolicyRule[] {
    return Array.from(this.policies.values())
      .filter(policy => {
        if (!policy.enabled) return false;

        // Check basic conditions
        if (policy.conditions.applications && 
            !policy.conditions.applications.includes(resource.identifier)) {
          return false;
        }

        // Check user/group conditions
        if (policy.conditions.users && subject.userId &&
            !policy.conditions.users.includes(subject.userId)) {
          return false;
        }

        // Check device conditions
        if (policy.conditions.devices && subject.deviceId &&
            !policy.conditions.devices.includes(subject.deviceId)) {
          return false;
        }

        // Check network conditions
        if (policy.conditions.networks && subject.ipAddress) {
          // Simplified network matching for demo
          return true;
        }

        return true;
      })
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Perform policy evaluation
   */
  private async performPolicyEvaluation(
    policies: PolicyRule[],
    subject: PolicyEvaluation['subject'],
    resource: PolicyEvaluation['resource'],
    context?: Partial<PolicyEvaluation['context']>
  ): Promise<PolicyEvaluation['evaluation']> {
    if (policies.length === 0) {
      return {
        result: 'deny',
        confidence: 100,
        appliedPolicies: [],
        matchedConditions: ['default-deny'],
        enforcedActions: ['deny', 'log'],
        riskScore: 95
      };
    }

    const primaryPolicy = policies[0];
    const riskScore = await this.calculateContextualRiskScore(subject, resource, context);

    // Evaluate context conditions
    const contextScore = this.evaluateContextConditions(primaryPolicy, context);
    
    // Determine result based on policy and risk
    let result: 'allow' | 'deny' | 'conditional' = 'allow';
    const enforcedActions: string[] = [];

    if (primaryPolicy.actions.deny) {
      result = 'deny';
      enforcedActions.push('deny');
    } else if (primaryPolicy.actions.allow) {
      if (riskScore > 70 && primaryPolicy.adaptiveSettings?.riskBasedAdjustment) {
        result = 'conditional';
        enforcedActions.push('conditional-allow');
      } else {
        result = 'allow';
        enforcedActions.push('allow');
      }
    }

    // Add enforcement actions
    if (primaryPolicy.actions.requireMfa) enforcedActions.push('require-mfa');
    if (primaryPolicy.actions.inspect) enforcedActions.push('inspect');
    if (primaryPolicy.actions.log) enforcedActions.push('log');
    if (primaryPolicy.actions.alert) enforcedActions.push('alert');
    if (primaryPolicy.actions.quarantine && riskScore > 80) enforcedActions.push('quarantine');

    return {
      result,
      confidence: Math.max(60, 100 - riskScore),
      appliedPolicies: [primaryPolicy.id],
      matchedConditions: this.getMatchedConditions(primaryPolicy, subject, resource, context),
      enforcedActions,
      riskScore
    };
  }

  /**
   * Calculate contextual risk score
   */
  private async calculateContextualRiskScore(
    subject: PolicyEvaluation['subject'],
    resource: PolicyEvaluation['resource'],
    context?: Partial<PolicyEvaluation['context']>
  ): Promise<number> {
    let riskScore = 0;

    // Device risk
    if (context?.device) {
      if (!context.device.trusted) riskScore += 25;
      if (!context.device.compliant) riskScore += 20;
      riskScore += context.device.riskScore * 0.3;
    }

    // Location risk
    if (context?.location && !context.location.trusted) {
      riskScore += 15;
    }

    // Behavioral risk
    if (context?.behavior) {
      riskScore += context.behavior.anomalyScore * 0.4;
    }

    // Threat risk
    if (context?.threat) {
      switch (context.threat.level) {
        case 'critical': riskScore += 40; break;
        case 'high': riskScore += 30; break;
        case 'medium': riskScore += 15; break;
        case 'low': riskScore += 5; break;
      }
    }

    // Resource sensitivity
    if (resource.classification) {
      switch (resource.classification) {
        case 'restricted': riskScore += 20; break;
        case 'confidential': riskScore += 15; break;
        case 'internal': riskScore += 10; break;
        case 'public': riskScore += 0; break;
      }
    }

    return Math.min(riskScore, 100);
  }

  /**
   * Evaluate context conditions
   */
  private evaluateContextConditions(policy: PolicyRule, context?: Partial<PolicyEvaluation['context']>): number {
    if (!policy.conditions.contexts || !context) return 1.0;

    let totalWeight = 0;
    let matchedWeight = 0;

    policy.conditions.contexts.forEach(condition => {
      totalWeight += condition.weight;

      const contextValue = this.getContextValue(condition.type, context);
      if (this.evaluateCondition(contextValue, condition.operator, condition.value)) {
        matchedWeight += condition.weight;
      }
    });

    return totalWeight > 0 ? matchedWeight / totalWeight : 1.0;
  }

  /**
   * Get context value by type
   */
  private getContextValue(type: PolicyContext['type'], context: Partial<PolicyEvaluation['context']>): any {
    switch (type) {
      case 'location':
        return context.location?.trusted ? 'trusted' : 'untrusted';
      case 'device_posture':
        return context.device?.compliant ? 'compliant' : 'non-compliant';
      case 'behavior_pattern':
        return context.behavior?.anomalyScore || 0;
      case 'threat_level':
        return context.threat?.level || 'low';
      case 'compliance_status':
        return context.device?.compliant ? 'compliant' : 'non-compliant';
      default:
        return null;
    }
  }

  /**
   * Evaluate condition operator
   */
  private evaluateCondition(value: any, operator: PolicyContext['operator'], expected: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expected;
      case 'not_equals':
        return value !== expected;
      case 'greater_than':
        return value > expected;
      case 'less_than':
        return value < expected;
      case 'contains':
        return String(value).includes(String(expected));
      case 'matches_pattern':
        return new RegExp(expected).test(String(value));
      default:
        return false;
    }
  }

  /**
   * Get matched conditions for evaluation
   */
  private getMatchedConditions(
    policy: PolicyRule,
    subject: PolicyEvaluation['subject'],
    resource: PolicyEvaluation['resource'],
    context?: Partial<PolicyEvaluation['context']>
  ): string[] {
    const matched: string[] = [];

    if (policy.conditions.applications?.includes(resource.identifier)) {
      matched.push(`application:${resource.identifier}`);
    }

    if (policy.conditions.users?.includes(subject.userId || '')) {
      matched.push(`user:${subject.userId}`);
    }

    if (context?.device?.compliant && policy.conditions.contexts?.some(c => c.type === 'device_posture')) {
      matched.push('device-compliant');
    }

    return matched;
  }

  /**
   * Record policy violation
   */
  private async recordPolicyViolation(evaluation: PolicyEvaluation): Promise<void> {
    const violationId = `violation-${Date.now()}`;
    
    const violation: PolicyViolation = {
      id: violationId,
      policyId: evaluation.policyId,
      violationType: 'access_denied',
      severity: evaluation.evaluation.riskScore > 80 ? 'high' : 
                evaluation.evaluation.riskScore > 50 ? 'medium' : 'low',
      userId: evaluation.subject.userId,
      deviceId: evaluation.subject.deviceId,
      ipAddress: evaluation.subject.ipAddress,
      resource: evaluation.resource.identifier,
      description: `Access denied to ${evaluation.resource.identifier} - Policy: ${evaluation.policyId}`,
      timestamp: evaluation.timestamp,
      status: 'open',
      remediation: {
        automatic: ['log-incident', 'notify-security-team'],
        manual: ['investigate-access-attempt', 'verify-user-intent'],
        completed: []
      }
    };

    this.violations.set(violationId, violation);
  }

  /**
   * Generate adaptive policy recommendations
   */
  async generateAdaptiveRecommendations(): Promise<AdaptivePolicyRecommendation[]> {
    const recommendations: AdaptivePolicyRecommendation[] = [];

    // Analyze policy performance
    const evaluations = Array.from(this.evaluations.values());
    const violations = Array.from(this.violations.values());

    // Recommendation: High false positive rate
    const deniedRequests = evaluations.filter(e => e.evaluation.result === 'deny').length;
    const totalRequests = evaluations.length;
    const denyRate = totalRequests > 0 ? deniedRequests / totalRequests : 0;

    if (denyRate > 0.2) {
      recommendations.push({
        id: 'rec-reduce-false-positives',
        type: 'threshold_adjustment',
        priority: 'medium',
        title: 'Reduce False Positive Rate',
        description: 'High denial rate detected - consider adjusting policy thresholds',
        rationale: `Current denial rate: ${(denyRate * 100).toFixed(1)}% - may impact user experience`,
        impact: {
          security: -10,
          usability: 30,
          performance: 0
        },
        implementation: {
          difficulty: 'easy',
          estimatedTime: '30 minutes',
          requirements: ['Policy review', 'Threshold adjustment']
        },
        createdAt: new Date()
      });
    }

    // Recommendation: New threat pattern
    const highRiskEvaluations = evaluations.filter(e => e.evaluation.riskScore > 80);
    if (highRiskEvaluations.length > 5) {
      recommendations.push({
        id: 'rec-new-threat-policy',
        type: 'new_policy',
        priority: 'high',
        title: 'Create High-Risk Pattern Policy',
        description: 'Detected pattern of high-risk access attempts',
        rationale: 'Multiple high-risk evaluations suggest need for specialized policy',
        impact: {
          security: 40,
          usability: -5,
          performance: -10
        },
        implementation: {
          difficulty: 'medium',
          estimatedTime: '2 hours',
          requirements: ['Risk pattern analysis', 'New policy creation', 'Testing']
        },
        suggestedPolicy: {
          name: 'High-Risk Access Pattern Detection',
          type: 'custom',
          conditions: {
            riskLevels: ['high'],
            contexts: [
              {
                type: 'threat_level',
                operator: 'greater_than',
                value: 'medium',
                weight: 0.8
              }
            ]
          },
          actions: {
            requireMfa: true,
            inspect: true,
            alert: true
          }
        },
        createdAt: new Date()
      });
    }

    // Recommendation: Unused policy cleanup
    const unusedPolicies = Array.from(this.policies.values()).filter(p => p.triggerCount === 0);
    if (unusedPolicies.length > 0) {
      recommendations.push({
        id: 'rec-cleanup-unused-policies',
        type: 'policy_removal',
        priority: 'low',
        title: 'Remove Unused Policies',
        description: `${unusedPolicies.length} policies have never been triggered`,
        rationale: 'Unused policies add complexity without providing security benefit',
        impact: {
          security: 0,
          usability: 5,
          performance: 10
        },
        implementation: {
          difficulty: 'easy',
          estimatedTime: '15 minutes',
          requirements: ['Policy review', 'Removal confirmation']
        },
        createdAt: new Date()
      });
    }

    recommendations.forEach(rec => {
      this.recommendations.set(rec.id, rec);
    });

    return recommendations;
  }

  /**
   * Get policy metrics
   */
  getPolicyMetrics(): PolicyMetrics {
    const evaluations = Array.from(this.evaluations.values());
    const policies = Array.from(this.policies.values());
    
    const blockedRequests = evaluations.filter(e => e.evaluation.result === 'deny').length;
    const allowedRequests = evaluations.filter(e => e.evaluation.result === 'allow').length;
    const totalEvaluations = evaluations.length;
    
    const averageEvaluationTime = totalEvaluations > 0 
      ? evaluations.reduce((sum, e) => sum + e.duration, 0) / totalEvaluations 
      : 0;

    return {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.enabled).length,
      evaluationsPerSecond: totalEvaluations / 3600, // Simplified calculation
      averageEvaluationTime,
      policyViolations: this.violations.size,
      blockedRequests,
      allowedRequests,
      adaptiveAdjustments: this.recommendations.size,
      falsePositives: Math.floor(blockedRequests * 0.1), // Estimated
      userExperienceScore: Math.max(0, 100 - (blockedRequests / Math.max(totalEvaluations, 1)) * 100)
    };
  }

  /**
   * Get all policies
   */
  getPolicies(): PolicyRule[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get policy evaluations
   */
  getEvaluations(): PolicyEvaluation[] {
    return Array.from(this.evaluations.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get policy violations
   */
  getViolations(): PolicyViolation[] {
    return Array.from(this.violations.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get adaptive recommendations
   */
  getRecommendations(): AdaptivePolicyRecommendation[] {
    return Array.from(this.recommendations.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Update policy
   */
  async updatePolicy(policyId: string, updates: Partial<PolicyRule>): Promise<PolicyRule> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error('Policy not found');
    }

    const updatedPolicy = {
      ...policy,
      ...updates,
      lastModified: new Date()
    };

    this.policies.set(policyId, updatedPolicy);
    return updatedPolicy;
  }

  /**
   * Create new policy
   */
  async createPolicy(policy: Omit<PolicyRule, 'id' | 'createdAt' | 'lastModified' | 'triggerCount'>): Promise<PolicyRule> {
    const policyId = `policy-${Date.now()}`;
    
    const newPolicy: PolicyRule = {
      id: policyId,
      ...policy,
      createdAt: new Date(),
      lastModified: new Date(),
      triggerCount: 0
    };

    this.policies.set(policyId, newPolicy);
    return newPolicy;
  }
}

export default DynamicPolicyEngine;
