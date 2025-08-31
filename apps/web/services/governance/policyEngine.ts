/**
 * Advanced Policy Engine
 * Comprehensive policy management and enforcement system
 */

// Type definitions for better type safety
export interface PolicyValue {
  string?: string;
  number?: number;
  boolean?: boolean;
  array?: unknown[];
  object?: Record<string, unknown>;
}

export interface PolicyEvidence {
  source: string;
  timestamp: string;
  data: Record<string, unknown>;
  confidence: number;
}

export interface PolicyContext {
  user?: {
    id: string;
    roles: string[];
    permissions: string[];
    riskScore: number;
  };
  environment?: {
    type: 'development' | 'staging' | 'production';
    region: string;
    compliance: string[];
  };
  resource?: {
    type: string;
    id: string;
    properties: Record<string, unknown>;
  };
  request?: {
    method: string;
    path: string;
    headers: Record<string, string>;
    body?: unknown;
  };
  [key: string]: unknown;
}

export interface PolicyTarget {
  type: 'repository' | 'deployment' | 'configuration' | 'user' | 'resource' | 'api' | '*';
  identifier: string;
  properties?: Record<string, unknown>;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  type: 'security' | 'compliance' | 'operational' | 'business';
  
  // Rule logic
  condition: string; // JSON-like condition expression
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'regex' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | boolean | string[] | number[];
  
  // Validation
  targets: PolicyTarget[];
  enforcement: 'advisory' | 'mandatory' | 'blocking';
  weight: number; // For scoring
}

export interface PolicyCondition {
  id: string;
  type: 'time' | 'environment' | 'user' | 'resource' | 'context';
  parameter: string;
  operator: string;
  value: string | number | boolean | string[] | number[];
  logical?: 'AND' | 'OR' | 'NOT';
}

export interface PolicyAction {
  id: string;
  type: 'allow' | 'deny' | 'require' | 'notify' | 'log' | 'remediate';
  parameters: Record<string, unknown>;
  automated: boolean;
  priority: number;
}

export interface PolicyException {
  id: string;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  validFrom: string;
  validUntil: string;
  conditions: PolicyCondition[];
  justification: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
}

export interface PolicyEvaluation {
  policyId: string;
  target: PolicyTarget;
  result: PolicyResult;
  evaluation: RuleEvaluation[];
  metadata: EvaluationMetadata;
  timestamp: string;
}

export interface PolicyResult {
  decision: 'allow' | 'deny' | 'conditional';
  score: number;
  confidence: number;
  reasons: string[];
  recommendations: string[];
  requiredActions: PolicyAction[];
}

export interface RuleEvaluation {
  ruleId: string;
  passed: boolean;
  score: number;
  message: string;
  evidence?: PolicyEvidence;
  executionTime: number;
}

export interface EvaluationMetadata {
  evaluationId: string;
  evaluatedBy: string;
  environment: string;
  context: PolicyContext;
  duration: number;
}

export interface PolicyViolation {
  id: string;
  policyId: string;
  ruleId: string;
  target: PolicyTarget;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: string;
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'suppressed';
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string;
}

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  rules: PolicyRule[];
  metadata: {
    version: string;
    author: string;
    lastUpdated: string;
    tags: string[];
  };
}

export interface PolicyEngineConfig {
  evaluationMode: 'strict' | 'lenient' | 'adaptive';
  caching: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    includeEvidence: boolean;
  };
  performance: {
    maxEvaluationTime: number;
    parallelEvaluation: boolean;
  };
}

export class PolicyEngine {
  private policies: Map<string, PolicyRule[]> = new Map();
  private exceptions: Map<string, PolicyException> = new Map();
  private cache: Map<string, PolicyEvaluation> = new Map();
  private config: PolicyEngineConfig;
  private evaluationCount: number = 0;
  private violationCount: number = 0;

  constructor(config: PolicyEngineConfig) {
    this.config = config;
    this.initializeDefaultPolicies();
  }

  /**
   * Evaluate policies against a target
   */
  async evaluatePolicies(
    target: PolicyTarget,
    context: PolicyContext = {}
  ): Promise<PolicyEvaluation[]> {
    const evaluations: PolicyEvaluation[] = [];
    const startTime = Date.now();

    try {
      // Get applicable policies for the target
      const applicablePolicies = this.getApplicablePolicies(target);

      // Evaluate each policy
      for (const policy of applicablePolicies) {
        const evaluation = await this.evaluatePolicy(policy, target, context);
        evaluations.push(evaluation);
      }

      // Update metrics
      this.evaluationCount += evaluations.length;
      this.violationCount += evaluations.filter(e => e.result.decision === 'deny').length;

      console.log(`Policy evaluation completed in ${Date.now() - startTime}ms`);
      return evaluations;

    } catch (error) {
      console.error('Policy evaluation failed:', error);
      throw error;
    }
  }

  /**
   * Evaluate a single policy
   */
  private async evaluatePolicy(
    policy: PolicyRule,
    target: PolicyTarget,
    context: PolicyContext
  ): Promise<PolicyEvaluation> {
    const evaluationId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      // Check for exceptions
      const exception = this.checkExceptions(policy, target, context);
      if (exception) {
        return this.createExceptionEvaluation(policy, target, exception);
      }

      // Evaluate the rule
      const ruleEvaluation = await this.evaluateRule(policy, target, context);
      
      // Calculate result
      const result = this.calculatePolicyResult(policy, ruleEvaluation);

      const evaluation: PolicyEvaluation = {
        policyId: policy.id,
        target,
        result,
        evaluation: [ruleEvaluation],
        metadata: {
          evaluationId,
          evaluatedBy: 'policy-engine',
          environment: context.environment?.type || 'unknown',
          context,
          duration: Date.now() - startTime,
        },
        timestamp: new Date().toISOString(),
      };

      // Cache result if enabled
      if (this.config.caching.enabled) {
        this.cache.set(evaluationId, evaluation);
      }

      return evaluation;

    } catch (error) {
      console.error(`Policy evaluation failed for ${policy.id}:`, error);
      return this.createErrorEvaluation(policy, target, error as Error);
    }
  }

  /**
   * Evaluate a single rule
   */
  private async evaluateRule(
    rule: PolicyRule,
    target: PolicyTarget,
    context: PolicyContext
  ): Promise<RuleEvaluation> {
    const startTime = Date.now();

    try {
      // Get the actual value from target/context
      const actualValue = this.getTargetProperty(target, rule.condition);
      
      // Evaluate the condition
      const passed = this.evaluateCondition(actualValue, rule.operator, rule.value);
      
      // Calculate score
      const score = passed ? rule.weight : 0;
      
      // Generate evidence
      const evidence: PolicyEvidence = {
        source: 'policy-engine',
        timestamp: new Date().toISOString(),
        data: {
          actualValue,
          expectedValue: rule.value,
          operator: rule.operator,
          condition: rule.condition,
        },
        confidence: passed ? 0.9 : 0.7,
      };

      return {
        ruleId: rule.id,
        passed,
        score,
        message: passed ? 'Rule passed' : `Rule failed: ${rule.condition} ${rule.operator} ${rule.value}`,
        evidence,
        executionTime: Date.now() - startTime,
      };

    } catch (error) {
      return {
        ruleId: rule.id,
        passed: false,
        score: 0,
        message: `Evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(
    actualValue: unknown,
    operator: string,
    expectedValue: string | number | boolean | string[] | number[]
  ): boolean {
    switch (operator) {
      case 'equals':
        return actualValue === expectedValue;
      
      case 'not_equals':
        return actualValue !== expectedValue;
      
      case 'contains':
        return typeof actualValue === 'string' && 
               typeof expectedValue === 'string' && 
               actualValue.includes(expectedValue);
      
      case 'not_contains':
        return typeof actualValue === 'string' && 
               typeof expectedValue === 'string' && 
               !actualValue.includes(expectedValue);
      
      case 'regex':
        if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
          try {
            const regex = new RegExp(expectedValue);
            return regex.test(actualValue);
          } catch {
            return false;
          }
        }
        return false;
      
      case 'greater_than':
        return typeof actualValue === 'number' && 
               typeof expectedValue === 'number' && 
               actualValue > expectedValue;
      
      case 'less_than':
        return typeof actualValue === 'number' && 
               typeof expectedValue === 'number' && 
               actualValue < expectedValue;
      
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
      
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
      
      default:
        return false;
    }
  }

  /**
   * Get property value from target
   */
  private getTargetProperty(target: PolicyTarget, property: string): unknown {
    // This is a simplified implementation
    // In a real system, you would have more sophisticated property resolution
    return this.mockGetTargetProperty(target, property);
  }

  /**
   * Mock implementation for getting target properties
   */
  private mockGetTargetProperty(target: PolicyTarget, property: string): unknown {
    // Mock implementation - in real system, this would query the actual target
    const mockData: Record<string, unknown> = {
      'security.level': 'high',
      'compliance.standards': ['SOC2', 'ISO27001'],
      'environment.type': 'production',
      'user.risk_score': 25,
      'resource.sensitivity': 'confidential',
    };

    return mockData[property] || null;
  }

  /**
   * Calculate policy result
   */
  private calculatePolicyResult(
    policy: PolicyRule,
    ruleEvaluation: RuleEvaluation
  ): PolicyResult {
    const decision = ruleEvaluation.passed ? 'allow' : 'deny';
    const score = ruleEvaluation.score;
    const confidence = ruleEvaluation.evidence?.confidence || 0.5;

    const reasons: string[] = [];
    const recommendations: string[] = [];
    const requiredActions: PolicyAction[] = [];

    if (!ruleEvaluation.passed) {
      reasons.push(`Policy ${policy.name} violated`);
      recommendations.push(`Review and comply with ${policy.name} policy`);
      
      if (policy.enforcement === 'mandatory') {
        requiredActions.push({
          id: crypto.randomUUID(),
          type: 'remediate',
          parameters: { policyId: policy.id, ruleId: policy.id },
          automated: true,
          priority: 1,
        });
      }
    }

    return {
      decision,
      score,
      confidence,
      reasons,
      recommendations,
      requiredActions,
    };
  }

  /**
   * Check for policy exceptions
   */
  private checkExceptions(
    policy: PolicyRule,
    target: PolicyTarget,
    context: PolicyContext
  ): PolicyException | null {
    for (const exception of this.exceptions.values()) {
      if (exception.status === 'approved' && 
          this.exceptionApplies(exception, policy, target, context)) {
        return exception;
      }
    }
    return null;
  }

  /**
   * Check if exception applies
   */
  private exceptionApplies(
    exception: PolicyException,
    policy: PolicyRule,
    target: PolicyTarget,
    context: PolicyContext
  ): boolean {
    const now = new Date();
    const validFrom = new Date(exception.validFrom);
    const validUntil = new Date(exception.validUntil);

    // Check time validity
    if (now < validFrom || now > validUntil) {
      return false;
    }

    // Check if exception applies to this policy
    // This is a simplified check - real implementation would be more sophisticated
    return true;
  }

  /**
   * Create evaluation for exception
   */
  private createExceptionEvaluation(
    policy: PolicyRule,
    target: PolicyTarget,
    exception: PolicyException
  ): PolicyEvaluation {
    return {
      policyId: policy.id,
      target,
      result: {
        decision: 'allow',
        score: policy.weight,
        confidence: 0.8,
        reasons: [`Exception approved: ${exception.reason}`],
        recommendations: [],
        requiredActions: [],
      },
      evaluation: [],
      metadata: {
        evaluationId: crypto.randomUUID(),
        evaluatedBy: 'policy-engine',
        environment: 'unknown',
        context: {},
        duration: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create error evaluation
   */
  private createErrorEvaluation(
    policy: PolicyRule,
    target: PolicyTarget,
    error: Error
  ): PolicyEvaluation {
    return {
      policyId: policy.id,
      target,
      result: {
        decision: 'deny',
        score: 0,
        confidence: 0,
        reasons: [`Evaluation error: ${error.message}`],
        recommendations: ['Contact system administrator'],
        requiredActions: [],
      },
      evaluation: [],
      metadata: {
        evaluationId: crypto.randomUUID(),
        evaluatedBy: 'policy-engine',
        environment: 'unknown',
        context: {},
        duration: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get applicable policies for target
   */
  private getApplicablePolicies(target: PolicyTarget): PolicyRule[] {
    const applicable: PolicyRule[] = [];

    for (const [policyId, rules] of this.policies.entries()) {
      for (const rule of rules) {
        if (this.ruleAppliesToTarget(rule, target)) {
          applicable.push(rule);
        }
      }
    }

    return applicable;
  }

  /**
   * Check if rule applies to target
   */
  private ruleAppliesToTarget(rule: PolicyRule, target: PolicyTarget): boolean {
    return rule.targets.some(ruleTarget => 
      ruleTarget.type === '*' || ruleTarget.type === target.type
    );
  }

  /**
   * Add policy
   */
  addPolicy(policyId: string, rules: PolicyRule[]): void {
    this.policies.set(policyId, rules);
  }

  /**
   * Remove policy
   */
  removePolicy(policyId: string): void {
    this.policies.delete(policyId);
  }

  /**
   * Add exception
   */
  addException(exception: PolicyException): void {
    this.exceptions.set(exception.id, exception);
  }

  /**
   * Remove exception
   */
  removeException(exceptionId: string): void {
    this.exceptions.delete(exceptionId);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalPolicies: number;
    totalExceptions: number;
    evaluationCount: number;
    violationCount: number;
    cacheSize: number;
  } {
    return {
      totalPolicies: this.policies.size,
      totalExceptions: this.exceptions.size,
      evaluationCount: this.evaluationCount,
      violationCount: this.violationCount,
      cacheSize: this.cache.size,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Initialize default policies
   */
  private initializeDefaultPolicies(): void {
    const defaultPolicies: PolicyRule[] = [
      {
        id: 'security-001',
        name: 'High Security Level Required',
        description: 'Requires high security level for sensitive resources',
        type: 'security',
        condition: 'security.level',
        operator: 'equals',
        value: 'high',
        targets: [{ type: 'resource', identifier: '*' }],
        enforcement: 'mandatory',
        weight: 10,
      },
      {
        id: 'compliance-001',
        name: 'SOC2 Compliance Required',
        description: 'Requires SOC2 compliance for production environments',
        type: 'compliance',
        condition: 'compliance.standards',
        operator: 'contains',
        value: 'SOC2',
        targets: [{ type: 'environment', identifier: 'production' }],
        enforcement: 'mandatory',
        weight: 8,
      },
    ];

    this.addPolicy('default', defaultPolicies);
  }

  /**
   * Generate hash for data
   */
  private generateHash(data: Record<string, unknown>): string {
    const jsonString = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }
}

export default PolicyEngine;
