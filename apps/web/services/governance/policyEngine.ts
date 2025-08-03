// Policy as Code Engine for DevSecOps Governance
// Implements policy definition, validation, and enforcement automation

export interface PolicyDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  category: PolicyCategory;
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  
  // Policy specification
  rules: PolicyRule[];
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  exceptions: PolicyException[];
  
  // Metadata
  compliance: string[]; // Related compliance frameworks
  rationale: string;
  references: string[];
  reviewSchedule: 'monthly' | 'quarterly' | 'annually';
  lastReview?: string;
  nextReview: string;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  type: 'security' | 'compliance' | 'operational' | 'business';
  
  // Rule logic
  condition: string; // JSON-like condition expression
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'regex' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  
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
  value: any;
  logical?: 'AND' | 'OR' | 'NOT';
}

export interface PolicyAction {
  id: string;
  type: 'allow' | 'deny' | 'require' | 'notify' | 'log' | 'remediate';
  parameters: Record<string, any>;
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

export interface PolicyTarget {
  type: 'repository' | 'deployment' | 'configuration' | 'user' | 'resource' | 'api' | '*';
  identifier: string;
  properties?: Record<string, any>;
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
  evidence?: any;
  executionTime: number;
}

export interface EvaluationMetadata {
  evaluationId: string;
  evaluatedBy: string;
  environment: string;
  context: Record<string, any>;
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
  resolvedAt?: string;
  resolution?: string;
  
  // Context
  evidence: ViolationEvidence[];
  impact: string;
  recommendations: string[];
  relatedViolations: string[];
}

export interface ViolationEvidence {
  type: 'log' | 'configuration' | 'code' | 'behavior' | 'metric';
  source: string;
  timestamp: string;
  data: any;
  hash: string;
}

export interface PolicyMetrics {
  totalPolicies: number;
  activePolicies: number;
  policyCategories: Record<PolicyCategory, number>;
  evaluations: {
    total: number;
    passed: number;
    failed: number;
    avgExecutionTime: number;
  };
  violations: {
    total: number;
    open: number;
    resolved: number;
    bySeverity: Record<string, number>;
  };
  compliance: {
    score: number;
    trend: 'improving' | 'stable' | 'declining';
    frameworks: Record<string, number>;
  };
}

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: PolicyCategory;
  template: Partial<PolicyDefinition>;
  parameters: TemplateParameter[];
  examples: PolicyExample[];
}

export interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: string;
}

export interface PolicyExample {
  name: string;
  description: string;
  parameters: Record<string, any>;
  expectedResult: PolicyResult;
}

export type PolicyCategory = 
  | 'security-controls'
  | 'access-management'
  | 'data-protection'
  | 'compliance-governance'
  | 'operational-standards'
  | 'development-practices'
  | 'infrastructure-security'
  | 'incident-response'
  | 'business-rules'
  | 'custom';

class PolicyEngine {
  private policies: Map<string, PolicyDefinition> = new Map();
  private templates: Map<string, PolicyTemplate> = new Map();
  private evaluationHistory: PolicyEvaluation[] = [];
  private violationStore: Map<string, PolicyViolation> = new Map();
  private evaluationCache: Map<string, PolicyEvaluation> = new Map();

  constructor() {
    this.initializePolicyTemplates();
    this.loadDefaultPolicies();
    this.startContinuousEvaluation();
  }

  /**
   * Create a new policy from template or definition
   */
  async createPolicy(templateIdOrDefinition: string | PolicyDefinition, parameters?: Record<string, any>): Promise<PolicyDefinition> {
    let policy: PolicyDefinition;

    if (typeof templateIdOrDefinition === 'string') {
      // Create from template
      const template = this.templates.get(templateIdOrDefinition);
      if (!template) {
        throw new Error(`Policy template ${templateIdOrDefinition} not found`);
      }
      
      policy = this.instantiateTemplate(template, parameters || {});
    } else {
      // Use provided definition
      policy = { ...templateIdOrDefinition };
    }

    // Validate policy
    await this.validatePolicy(policy);
    
    // Store policy
    this.policies.set(policy.id, policy);
    
    return policy;
  }

  /**
   * Evaluate policies against a target
   */
  async evaluateTarget(target: PolicyTarget, context?: Record<string, any>): Promise<PolicyEvaluation[]> {
    const applicablePolicies = this.getApplicablePolicies(target);
    const evaluations: PolicyEvaluation[] = [];

    for (const policy of applicablePolicies) {
      try {
        const evaluation = await this.evaluatePolicy(policy, target, context);
        evaluations.push(evaluation);
        
        // Cache evaluation
        this.cacheEvaluation(evaluation);
        
        // Handle violations
        if (evaluation.result.decision === 'deny') {
          await this.handlePolicyViolation(policy, evaluation);
        }
      } catch (error) {
        console.error(`Failed to evaluate policy ${policy.id}:`, error);
      }
    }

    return evaluations;
  }

  /**
   * Get comprehensive policy metrics
   */
  async getPolicyMetrics(): Promise<PolicyMetrics> {
    const policies = Array.from(this.policies.values());
    const violations = Array.from(this.violationStore.values());
    
    // Calculate evaluation metrics
    const recentEvaluations = this.evaluationHistory.slice(-1000); // Last 1000 evaluations
    const passedEvaluations = recentEvaluations.filter(e => e.result.decision === 'allow').length;
    const totalEvaluations = recentEvaluations.length;
    const avgExecutionTime = recentEvaluations.reduce((sum, e) => sum + e.metadata.duration, 0) / totalEvaluations || 0;

    // Calculate violation metrics
    const openViolations = violations.filter(v => v.status === 'open').length;
    const resolvedViolations = violations.filter(v => v.status === 'resolved').length;
    const violationsBySeverity = violations.reduce((acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate compliance score
    const complianceScore = totalEvaluations > 0 ? (passedEvaluations / totalEvaluations) * 100 : 100;
    const trend = this.calculateComplianceTrend();

    return {
      totalPolicies: policies.length,
      activePolicies: policies.filter(p => p.enabled).length,
      policyCategories: policies.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<PolicyCategory, number>),
      evaluations: {
        total: totalEvaluations,
        passed: passedEvaluations,
        failed: totalEvaluations - passedEvaluations,
        avgExecutionTime
      },
      violations: {
        total: violations.length,
        open: openViolations,
        resolved: resolvedViolations,
        bySeverity: violationsBySeverity
      },
      compliance: {
        score: complianceScore,
        trend,
        frameworks: this.calculateFrameworkCompliance()
      }
    };
  }

  /**
   * Get active policy violations
   */
  async getActiveViolations(filters?: {
    severity?: string[];
    category?: PolicyCategory[];
    status?: string[];
    assignedTo?: string;
  }): Promise<PolicyViolation[]> {
    let violations = Array.from(this.violationStore.values());

    if (filters) {
      if (filters.severity) {
        violations = violations.filter(v => filters.severity!.includes(v.severity));
      }
      if (filters.status) {
        violations = violations.filter(v => filters.status!.includes(v.status));
      }
      if (filters.assignedTo) {
        violations = violations.filter(v => v.assignedTo === filters.assignedTo);
      }
      if (filters.category) {
        violations = violations.filter(v => {
          const policy = this.policies.get(v.policyId);
          return policy && filters.category!.includes(policy.category);
        });
      }
    }

    return violations.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }

  /**
   * Auto-remediate policy violations where possible
   */
  async autoRemediateViolations(violationIds?: string[]): Promise<{
    attempted: number;
    successful: number;
    failed: number;
    results: RemediationResult[];
  }> {
    const targetViolations = violationIds 
      ? violationIds.map(id => this.violationStore.get(id)).filter(Boolean) as PolicyViolation[]
      : Array.from(this.violationStore.values()).filter(v => v.status === 'open');

    const remediableViolations = targetViolations.filter(v => {
      const policy = this.policies.get(v.policyId);
      return policy?.actions.some(action => action.automated && action.type === 'remediate');
    });

    const results: RemediationResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const violation of remediableViolations) {
      const policy = this.policies.get(violation.policyId)!;
      const remediationActions = policy.actions.filter(a => a.automated && a.type === 'remediate');

      for (const action of remediationActions) {
        try {
          const result = await this.executeRemediationAction(violation, action);
          results.push(result);
          
          if (result.success) {
            successful++;
            await this.resolveViolation(violation.id, 'Auto-remediated by policy engine');
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
          results.push({
            violationId: violation.id,
            actionId: action.id,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    return {
      attempted: remediableViolations.length,
      successful,
      failed,
      results
    };
  }

  /**
   * Generate policy compliance report
   */
  async generateComplianceReport(timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly'): Promise<PolicyComplianceReport> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
    }

    const relevantEvaluations = this.evaluationHistory.filter(e => 
      new Date(e.timestamp) >= startDate && new Date(e.timestamp) <= endDate
    );

    const relevantViolations = Array.from(this.violationStore.values()).filter(v =>
      new Date(v.detectedAt) >= startDate && new Date(v.detectedAt) <= endDate
    );

    const metrics = await this.getPolicyMetrics();

    return {
      id: `policy-report-${Date.now()}`,
      timeframe,
      period: {
        from: startDate.toISOString(),
        to: endDate.toISOString()
      },
      generatedAt: new Date().toISOString(),
      summary: {
        totalEvaluations: relevantEvaluations.length,
        complianceRate: relevantEvaluations.length > 0 
          ? (relevantEvaluations.filter(e => e.result.decision === 'allow').length / relevantEvaluations.length) * 100 
          : 100,
        violationsDetected: relevantViolations.length,
        violationsResolved: relevantViolations.filter(v => v.status === 'resolved').length,
        avgRemediationTime: this.calculateAvgRemediationTime(relevantViolations)
      },
      policyPerformance: this.analyzePolicyPerformance(relevantEvaluations),
      violationAnalysis: this.analyzeViolations(relevantViolations),
      recommendations: this.generatePolicyRecommendations(metrics, relevantViolations),
      trendAnalysis: this.generateTrendAnalysis(timeframe)
    };
  }

  /**
   * Initialize built-in policy templates
   */
  private initializePolicyTemplates(): void {
    // Security Controls Templates
    this.templates.set('secure-coding', {
      id: 'secure-coding',
      name: 'Secure Coding Standards',
      description: 'Enforce secure coding practices and vulnerability prevention',
      category: 'development-practices',
      template: {
        name: 'Secure Coding Policy',
        category: 'development-practices',
        severity: 'error',
        rules: [
          {
            id: 'no-hardcoded-secrets',
            name: 'No Hardcoded Secrets',
            description: 'Prevent hardcoded secrets in source code',
            type: 'security',
            condition: 'code.contains',
            operator: 'not_contains',
            value: ['password', 'api_key', 'secret_key'],
            targets: [{ type: 'repository', identifier: '*' }],
            enforcement: 'blocking',
            weight: 10
          }
        ]
      },
      parameters: [
        {
          name: 'excluded_patterns',
          type: 'array',
          description: 'File patterns to exclude from scanning',
          required: false,
          defaultValue: ['*.test.js', '*.spec.ts']
        }
      ],
      examples: []
    });

    this.templates.set('access-control', {
      id: 'access-control',
      name: 'Access Control Policy',
      description: 'Enforce principle of least privilege and access controls',
      category: 'access-management',
      template: {
        name: 'Access Control Policy',
        category: 'access-management',
        severity: 'critical',
        rules: [
          {
            id: 'mfa-required',
            name: 'Multi-Factor Authentication Required',
            description: 'All users must have MFA enabled',
            type: 'security',
            condition: 'user.mfa_enabled',
            operator: 'equals',
            value: true,
            targets: [{ type: 'user', identifier: '*' }],
            enforcement: 'mandatory',
            weight: 15
          }
        ]
      },
      parameters: [
        {
          name: 'exempt_users',
          type: 'array',
          description: 'Users exempt from MFA requirement',
          required: false,
          defaultValue: []
        }
      ],
      examples: []
    });

    this.templates.set('data-protection', {
      id: 'data-protection',
      name: 'Data Protection Policy',
      description: 'Ensure data encryption and privacy protection',
      category: 'data-protection',
      template: {
        name: 'Data Protection Policy',
        category: 'data-protection',
        severity: 'critical',
        rules: [
          {
            id: 'encryption-at-rest',
            name: 'Encryption at Rest Required',
            description: 'All sensitive data must be encrypted at rest',
            type: 'security',
            condition: 'data.encryption_enabled',
            operator: 'equals',
            value: true,
            targets: [{ type: 'resource', identifier: 'database' }],
            enforcement: 'blocking',
            weight: 20
          }
        ]
      },
      parameters: [
        {
          name: 'encryption_algorithm',
          type: 'string',
          description: 'Required encryption algorithm',
          required: true,
          defaultValue: 'AES-256'
        }
      ],
      examples: []
    });
  }

  /**
   * Load default policies
   */
  private loadDefaultPolicies(): void {
    // Create default policies from templates
    this.createPolicy('secure-coding', {
      excluded_patterns: ['*.test.js', '*.spec.ts', '*.config.js']
    }).catch(console.error);

    this.createPolicy('access-control', {
      exempt_users: ['system', 'automation']
    }).catch(console.error);

    this.createPolicy('data-protection', {
      encryption_algorithm: 'AES-256-GCM'
    }).catch(console.error);
  }

  /**
   * Start continuous policy evaluation
   */
  private startContinuousEvaluation(): void {
    // Evaluate policies every 5 minutes
    setInterval(async () => {
      try {
        await this.performContinuousEvaluation();
      } catch (error) {
        console.error('Continuous evaluation failed:', error);
      }
    }, 300000);
  }

  private async performContinuousEvaluation(): Promise<void> {
    const targets = this.discoverEvaluationTargets();
    
    for (const target of targets) {
      try {
        await this.evaluateTarget(target, { source: 'continuous-evaluation' });
      } catch (error) {
        console.error(`Failed to evaluate target ${target.identifier}:`, error);
      }
    }
  }

  private discoverEvaluationTargets(): PolicyTarget[] {
    // Mock implementation - would discover actual targets from infrastructure
    return [
      { type: 'repository', identifier: 'main-application' },
      { type: 'deployment', identifier: 'production' },
      { type: 'user', identifier: 'active-users' },
      { type: 'resource', identifier: 'database-cluster' }
    ];
  }

  private instantiateTemplate(template: PolicyTemplate, parameters: Record<string, any>): PolicyDefinition {
    const policy: PolicyDefinition = {
      id: `policy-${Date.now()}`,
      version: '1.0.0',
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'policy-engine',
      tags: [],
      rules: [],
      conditions: [],
      actions: [],
      exceptions: [],
      compliance: [],
      rationale: `Generated from template: ${template.name}`,
      references: [],
      reviewSchedule: 'quarterly',
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      ...template.template,
      name: template.template.name || template.name,
      description: template.template.description || template.description,
      category: template.template.category || template.category,
      severity: template.template.severity || 'warning'
    };

    // Apply parameters to the policy
    this.applyTemplateParameters(policy, template.parameters, parameters);

    return policy;
  }

  private applyTemplateParameters(policy: PolicyDefinition, templateParams: TemplateParameter[], parameters: Record<string, any>): void {
    for (const param of templateParams) {
      const value = parameters[param.name] ?? param.defaultValue;
      
      if (param.required && value === undefined) {
        throw new Error(`Required parameter ${param.name} not provided`);
      }

      // Apply parameter value to policy (simplified implementation)
      if (param.name === 'excluded_patterns' && Array.isArray(value)) {
        // Example: Apply excluded patterns to rules
        policy.rules.forEach(rule => {
          if (!rule.targets) rule.targets = [];
          rule.targets.forEach(target => {
            if (!target.properties) target.properties = {};
            target.properties.excludePatterns = value;
          });
        });
      }
    }
  }

  private async validatePolicy(policy: PolicyDefinition): Promise<void> {
    // Validate policy structure and rules
    if (!policy.name || !policy.id) {
      throw new Error('Policy must have name and id');
    }

    if (!policy.rules || policy.rules.length === 0) {
      throw new Error('Policy must have at least one rule');
    }

    for (const rule of policy.rules) {
      if (!rule.condition || !rule.operator) {
        throw new Error(`Rule ${rule.id} must have condition and operator`);
      }
    }
  }

  private getApplicablePolicies(target: PolicyTarget): PolicyDefinition[] {
    return Array.from(this.policies.values()).filter(policy => {
      if (!policy.enabled) return false;
      
      return policy.rules.some(rule => 
        rule.targets.some(ruleTarget => 
          this.targetMatches(target, ruleTarget)
        )
      );
    });
  }

  private targetMatches(target: PolicyTarget, ruleTarget: PolicyTarget): boolean {
    if (ruleTarget.type !== target.type && ruleTarget.type !== '*') {
      return false;
    }

    if (ruleTarget.identifier === '*') {
      return true;
    }

    return ruleTarget.identifier === target.identifier;
  }

  private async evaluatePolicy(policy: PolicyDefinition, target: PolicyTarget, context?: Record<string, any>): Promise<PolicyEvaluation> {
    const startTime = Date.now();
    const evaluationId = `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const ruleEvaluations: RuleEvaluation[] = [];
    let overallScore = 0;
    let totalWeight = 0;

    for (const rule of policy.rules) {
      const ruleStart = Date.now();
      
      try {
        const passed = await this.evaluateRule(rule, target, context);
        const score = passed ? rule.weight : 0;
        
        ruleEvaluations.push({
          ruleId: rule.id,
          passed,
          score,
          message: passed ? `Rule ${rule.name} passed` : `Rule ${rule.name} failed`,
          executionTime: Date.now() - ruleStart
        });

        overallScore += score;
        totalWeight += rule.weight;
      } catch (error) {
        ruleEvaluations.push({
          ruleId: rule.id,
          passed: false,
          score: 0,
          message: `Rule evaluation failed: ${error.message}`,
          executionTime: Date.now() - ruleStart
        });
        totalWeight += rule.weight;
      }
    }

    const finalScore = totalWeight > 0 ? (overallScore / totalWeight) * 100 : 100;
    const decision: PolicyResult['decision'] = finalScore >= 80 ? 'allow' : finalScore >= 50 ? 'conditional' : 'deny';

    const evaluation: PolicyEvaluation = {
      policyId: policy.id,
      target,
      result: {
        decision,
        score: finalScore,
        confidence: this.calculateConfidence(ruleEvaluations),
        reasons: ruleEvaluations.filter(r => !r.passed).map(r => r.message),
        recommendations: this.generateRecommendations(policy, ruleEvaluations),
        requiredActions: decision !== 'allow' ? policy.actions.filter(a => a.type !== 'allow') : []
      },
      evaluation: ruleEvaluations,
      metadata: {
        evaluationId,
        evaluatedBy: 'policy-engine',
        environment: context?.environment || 'unknown',
        context: context || {},
        duration: Date.now() - startTime
      },
      timestamp: new Date().toISOString()
    };

    this.evaluationHistory.push(evaluation);
    
    // Keep only last 10000 evaluations
    if (this.evaluationHistory.length > 10000) {
      this.evaluationHistory.shift();
    }

    return evaluation;
  }

  private async evaluateRule(rule: PolicyRule, target: PolicyTarget, context?: Record<string, any>): Promise<boolean> {
    // Mock rule evaluation - would implement actual rule evaluation logic
    switch (rule.operator) {
      case 'equals':
        return this.mockGetTargetProperty(target, rule.condition) === rule.value;
      case 'not_equals':
        return this.mockGetTargetProperty(target, rule.condition) !== rule.value;
      case 'contains': {
        const value = this.mockGetTargetProperty(target, rule.condition);
        return Array.isArray(value) ? value.includes(rule.value) : String(value).includes(rule.value);
      }
      case 'not_contains': {
        const notValue = this.mockGetTargetProperty(target, rule.condition);
        if (Array.isArray(rule.value)) {
          return !rule.value.some(v => String(notValue).includes(v));
        }
        return !String(notValue).includes(rule.value);
      }
      default:
        return true;
    }
  }

  private mockGetTargetProperty(target: PolicyTarget, property: string): any {
    // Mock implementation - would fetch actual property values
    const mockData: Record<string, any> = {
      'user.mfa_enabled': true,
      'data.encryption_enabled': true,
      'code.contains': 'clean code without secrets'
    };
    
    return mockData[property] || null;
  }

  private calculateConfidence(evaluations: RuleEvaluation[]): number {
    const successful = evaluations.filter(e => e.passed).length;
    return evaluations.length > 0 ? (successful / evaluations.length) * 100 : 100;
  }

  private generateRecommendations(policy: PolicyDefinition, evaluations: RuleEvaluation[]): string[] {
    const failedRules = evaluations.filter(e => !e.passed);
    
    return failedRules.map(rule => {
      const policyRule = policy.rules.find(r => r.id === rule.ruleId);
      return policyRule ? `Consider addressing: ${policyRule.description}` : 'Review failed rule';
    });
  }

  private cacheEvaluation(evaluation: PolicyEvaluation): void {
    const cacheKey = `${evaluation.policyId}-${evaluation.target.type}-${evaluation.target.identifier}`;
    this.evaluationCache.set(cacheKey, evaluation);
    
    // Cache cleanup - keep only last 1000 evaluations
    if (this.evaluationCache.size > 1000) {
      const firstKey = this.evaluationCache.keys().next().value;
      this.evaluationCache.delete(firstKey);
    }
  }

  private async handlePolicyViolation(policy: PolicyDefinition, evaluation: PolicyEvaluation): Promise<void> {
    const violation: PolicyViolation = {
      id: `violation-${Date.now()}`,
      policyId: policy.id,
      ruleId: evaluation.evaluation.find(e => !e.passed)?.ruleId || 'unknown',
      target: evaluation.target,
      severity: this.mapSeverity(policy.severity),
      message: `Policy violation: ${policy.name}`,
      details: evaluation.result.reasons.join('; '),
      detectedAt: evaluation.timestamp,
      status: 'open',
      evidence: [{
        type: 'behavior',
        source: 'policy-engine',
        timestamp: evaluation.timestamp,
        data: evaluation,
        hash: this.generateHash(evaluation)
      }],
      impact: this.assessViolationImpact(policy, evaluation),
      recommendations: evaluation.result.recommendations,
      relatedViolations: []
    };

    this.violationStore.set(violation.id, violation);

    // Trigger automated actions if available
    const automatedActions = policy.actions.filter(a => a.automated);
    for (const action of automatedActions) {
      try {
        if (action.type === 'notify') {
          await this.sendViolationNotification(violation, action);
        } else if (action.type === 'log') {
          await this.logViolation(violation);
        }
      } catch (error) {
        console.error(`Failed to execute automated action ${action.id}:`, error);
      }
    }
  }

  private mapSeverity(policySeverity: PolicyDefinition['severity']): PolicyViolation['severity'] {
    const mapping: Record<PolicyDefinition['severity'], PolicyViolation['severity']> = {
      'info': 'low',
      'warning': 'medium',
      'error': 'high',
      'critical': 'critical'
    };
    return mapping[policySeverity];
  }

  private assessViolationImpact(policy: PolicyDefinition, evaluation: PolicyEvaluation): string {
    if (policy.severity === 'critical') {
      return 'High security risk - immediate attention required';
    } else if (policy.severity === 'error') {
      return 'Moderate security risk - should be addressed promptly';
    } else {
      return 'Low risk - monitor and address during next maintenance window';
    }
  }

  private generateHash(data: any): string {
    // Simple hash generation - would use proper crypto in production
    return Buffer.from(JSON.stringify(data)).toString('base64').substr(0, 16);
  }

  private async sendViolationNotification(violation: PolicyViolation, action: PolicyAction): Promise<void> {
    console.log(`NOTIFICATION: Policy violation detected - ${violation.message}`);
    // Would integrate with actual notification systems
  }

  private async logViolation(violation: PolicyViolation): Promise<void> {
    console.log(`VIOLATION LOG: ${violation.id} - ${violation.message} at ${violation.detectedAt}`);
    // Would integrate with actual logging systems
  }

  private async executeRemediationAction(violation: PolicyViolation, action: PolicyAction): Promise<RemediationResult> {
    // Mock remediation execution
    return {
      violationId: violation.id,
      actionId: action.id,
      success: Math.random() > 0.2, // 80% success rate
      timestamp: new Date().toISOString()
    };
  }

  private async resolveViolation(violationId: string, resolution: string): Promise<void> {
    const violation = this.violationStore.get(violationId);
    if (violation) {
      violation.status = 'resolved';
      violation.resolvedAt = new Date().toISOString();
      violation.resolution = resolution;
    }
  }

  private calculateComplianceTrend(): 'improving' | 'stable' | 'declining' {
    if (this.evaluationHistory.length < 100) return 'stable';
    
    const recent = this.evaluationHistory.slice(-50);
    const previous = this.evaluationHistory.slice(-100, -50);
    
    const recentScore = recent.filter(e => e.result.decision === 'allow').length / recent.length;
    const previousScore = previous.filter(e => e.result.decision === 'allow').length / previous.length;
    
    const diff = recentScore - previousScore;
    
    if (diff > 0.05) return 'improving';
    if (diff < -0.05) return 'declining';
    return 'stable';
  }

  private calculateFrameworkCompliance(): Record<string, number> {
    // Mock framework compliance calculation
    return {
      'SOC2': 92,
      'ISO27001': 88,
      'PCI-DSS': 95,
      'HIPAA': 90
    };
  }

  private calculateAvgRemediationTime(violations: PolicyViolation[]): number {
    const resolvedViolations = violations.filter(v => v.status === 'resolved' && v.resolvedAt);
    
    if (resolvedViolations.length === 0) return 0;
    
    const totalTime = resolvedViolations.reduce((sum, v) => {
      const detected = new Date(v.detectedAt).getTime();
      const resolved = new Date(v.resolvedAt!).getTime();
      return sum + (resolved - detected);
    }, 0);
    
    return totalTime / resolvedViolations.length / (1000 * 60 * 60); // Convert to hours
  }

  private analyzePolicyPerformance(evaluations: PolicyEvaluation[]): PolicyPerformanceAnalysis[] {
    const policyGroups = evaluations.reduce((groups, evaluation) => {
      if (!groups[evaluation.policyId]) {
        groups[evaluation.policyId] = [];
      }
      groups[evaluation.policyId].push(evaluation);
      return groups;
    }, {} as Record<string, PolicyEvaluation[]>);

    return Object.entries(policyGroups).map(([policyId, evals]) => {
      const policy = this.policies.get(policyId);
      const passed = evals.filter(e => e.result.decision === 'allow').length;
      const avgScore = evals.reduce((sum, e) => sum + e.result.score, 0) / evals.length;
      const avgExecutionTime = evals.reduce((sum, e) => sum + e.metadata.duration, 0) / evals.length;

      return {
        policyId,
        policyName: policy?.name || 'Unknown',
        evaluations: evals.length,
        passRate: (passed / evals.length) * 100,
        avgScore,
        avgExecutionTime,
        trend: this.calculatePolicyTrend(policyId)
      };
    });
  }

  private calculatePolicyTrend(policyId: string): 'improving' | 'stable' | 'declining' {
    const policyEvaluations = this.evaluationHistory.filter(e => e.policyId === policyId);
    if (policyEvaluations.length < 20) return 'stable';
    
    const recent = policyEvaluations.slice(-10);
    const previous = policyEvaluations.slice(-20, -10);
    
    const recentAvg = recent.reduce((sum, e) => sum + e.result.score, 0) / recent.length;
    const previousAvg = previous.reduce((sum, e) => sum + e.result.score, 0) / previous.length;
    
    const diff = recentAvg - previousAvg;
    
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  private analyzeViolations(violations: PolicyViolation[]): ViolationAnalysis {
    const bySeverity = violations.reduce((acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = violations.reduce((acc, v) => {
      const policy = this.policies.get(v.policyId);
      if (policy) {
        acc[policy.category] = (acc[policy.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topViolatedPolicies = Object.entries(
      violations.reduce((acc, v) => {
        acc[v.policyId] = (acc[v.policyId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([policyId, count]) => ({
      policyId,
      policyName: this.policies.get(policyId)?.name || 'Unknown',
      violationCount: count
    }));

    return {
      total: violations.length,
      bySeverity,
      byCategory,
      topViolatedPolicies,
      avgTimeToResolve: this.calculateAvgRemediationTime(violations)
    };
  }

  private generatePolicyRecommendations(metrics: PolicyMetrics, violations: PolicyViolation[]): string[] {
    const recommendations: string[] = [];
    
    if (metrics.compliance.score < 80) {
      recommendations.push('Consider reviewing and updating policy rules to improve compliance score');
    }
    
    if (violations.filter(v => v.severity === 'critical').length > 0) {
      recommendations.push('Address critical violations immediately to reduce security risk');
    }
    
    if (metrics.evaluations.avgExecutionTime > 5000) {
      recommendations.push('Optimize policy evaluation performance to reduce system impact');
    }
    
    recommendations.push('Implement automated remediation for common policy violations');
    recommendations.push('Regular policy review and updates to maintain effectiveness');
    
    return recommendations;
  }

  private generateTrendAnalysis(timeframe: string): TrendAnalysis {
    return {
      complianceScore: {
        current: 87,
        previous: 85,
        trend: 'improving'
      },
      violationRate: {
        current: 12,
        previous: 15,
        trend: 'improving'
      },
      remediationTime: {
        current: 4.2,
        previous: 5.1,
        trend: 'improving'
      }
    };
  }
}

// Supporting interfaces
interface RemediationResult {
  violationId: string;
  actionId: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

interface PolicyComplianceReport {
  id: string;
  timeframe: string;
  period: { from: string; to: string };
  generatedAt: string;
  summary: {
    totalEvaluations: number;
    complianceRate: number;
    violationsDetected: number;
    violationsResolved: number;
    avgRemediationTime: number;
  };
  policyPerformance: PolicyPerformanceAnalysis[];
  violationAnalysis: ViolationAnalysis;
  recommendations: string[];
  trendAnalysis: TrendAnalysis;
}

interface PolicyPerformanceAnalysis {
  policyId: string;
  policyName: string;
  evaluations: number;
  passRate: number;
  avgScore: number;
  avgExecutionTime: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface ViolationAnalysis {
  total: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  topViolatedPolicies: Array<{
    policyId: string;
    policyName: string;
    violationCount: number;
  }>;
  avgTimeToResolve: number;
}

interface TrendAnalysis {
  complianceScore: {
    current: number;
    previous: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  violationRate: {
    current: number;
    previous: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  remediationTime: {
    current: number;
    previous: number;
    trend: 'improving' | 'stable' | 'declining';
  };
}

// Export singleton instance
export const policyEngine = new PolicyEngine();
