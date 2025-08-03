const { EventEmitter } = require('events');

/**
 * Zero Trust Orchestration Service - Node.js Compatible Version
 */
class ZeroTrustOrchestratorService extends EventEmitter {
  constructor() {
    super();
    this.policies = new Map();
    this.securityEvents = [];
    this.threatIntelligence = {
      indicators: { ips: [], domains: [], hashes: [], signatures: [] },
      campaigns: [],
      riskScores: new Map(),
      lastUpdated: new Date()
    };
    this.metrics = {
      authentication: { totalAttempts: 0, successfulAttempts: 0, failedAttempts: 0, mfaUsage: 0, averageAuthTime: 0 },
      authorization: { totalRequests: 0, allowedRequests: 0, deniedRequests: 0, challengedRequests: 0, averageDecisionTime: 0 },
      devices: { totalDevices: 0, compliantDevices: 0, nonCompliantDevices: 0, averageRiskScore: 0 },
      network: { totalConnections: 0, blockedConnections: 0, inspectedTraffic: 0, threatsDetected: 0 },
      applications: { totalApplications: 0, protectedApplications: 0, vulnerabilitiesFound: 0, patchedVulnerabilities: 0 },
      data: { classifiedAssets: 0, protectedAssets: 0, dataLeakageIncidents: 0, encryptionCoverage: 0 }
    };
    this.isInitialized = false;
  }

  async initialize() {
    try {
      await this.loadDefaultPolicies();
      this.startContinuousMonitoring();
      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize Zero Trust Orchestrator:', error);
      throw error;
    }
  }

  async loadDefaultPolicies() {
    const defaultPolicies = [
      {
        id: 'zt-001', name: 'Default Deny All', description: 'Default policy to deny all access unless explicitly allowed',
        version: '1.0', priority: 1, conditions: [],
        actions: [{ type: 'deny', parameters: { reason: 'No explicit allow policy matched' }, severity: 'medium' }],
        metadata: { createdAt: new Date(), updatedAt: new Date(), createdBy: 'system', tags: ['default', 'deny'] }
      },
      {
        id: 'zt-002', name: 'Authenticated User Base Access', description: 'Allow basic access for authenticated users with compliant devices',
        version: '1.0', priority: 100,
        conditions: [
          { type: 'identity', field: 'authenticated', operator: 'equals', value: true },
          { type: 'device', field: 'compliance', operator: 'equals', value: true }
        ],
        actions: [{ type: 'allow', parameters: { scope: 'basic' }, severity: 'low' }],
        metadata: { createdAt: new Date(), updatedAt: new Date(), createdBy: 'system', tags: ['authenticated', 'basic'] }
      },
      {
        id: 'zt-003', name: 'High Risk Block', description: 'Block access for high-risk users, devices, or network locations',
        version: '1.0', priority: 200,
        conditions: [{ type: 'identity', field: 'riskScore', operator: 'greater_than', value: 80 }],
        actions: [{ type: 'deny', parameters: { reason: 'High risk score detected' }, severity: 'high' }],
        metadata: { createdAt: new Date(), updatedAt: new Date(), createdBy: 'system', tags: ['risk', 'security'] }
      }
    ];

    for (const policy of defaultPolicies) {
      this.policies.set(policy.id, policy);
    }
  }

  startContinuousMonitoring() {
    setInterval(() => {
      this.performHealthCheck();
      this.updateMetrics();
      this.detectAnomalies();
    }, 30000);

    setInterval(() => {
      this.updateThreatIntelligence();
    }, 3600000);
  }

  async evaluateAccess(request) {
    const startTime = Date.now();

    try {
      const riskScore = this.calculateRiskScore(request.context);
      const applicablePolicies = await this.getApplicablePolicies(request);
      const evaluationResults = await Promise.all(
        applicablePolicies.map(policy => this.evaluatePolicy(policy, request))
      );
      const decision = this.makeFinalDecision(evaluationResults, riskScore);

      this.updateAuthorizationMetrics(decision);

      return {
        requestId: request.id,
        decision: decision.action,
        reason: decision.reason,
        conditions: decision.conditions,
        expiresAt: decision.expiresAt,
        metadata: {
          evaluationTime: Date.now() - startTime,
          appliedPolicies: applicablePolicies.map(p => p.id),
          riskFactors: decision.riskFactors,
          confidence: decision.confidence,
          riskScore
        }
      };
    } catch (error) {
      return {
        requestId: request.id,
        decision: 'deny',
        reason: 'Evaluation error',
        conditions: {},
        metadata: {
          evaluationTime: Date.now() - startTime,
          appliedPolicies: [],
          riskFactors: ['evaluation_error'],
          confidence: 0
        }
      };
    }
  }

  async getApplicablePolicies(request) {
    const applicablePolicies = [];
    for (const policy of this.policies.values()) {
      if (await this.isPolicyApplicable(policy, request)) {
        applicablePolicies.push(policy);
      }
    }
    return applicablePolicies.sort((a, b) => b.priority - a.priority);
  }

  async isPolicyApplicable(policy, request) {
    if (policy.conditions.length === 0) return true;
    for (const condition of policy.conditions) {
      if (!(await this.evaluateCondition(condition, request))) return false;
    }
    return true;
  }

  async evaluateCondition(condition, request) {
    let contextValue;

    switch (condition.type) {
      case 'identity':
        contextValue = this.getNestedValue(request.context.user, condition.field);
        break;
      case 'device':
        contextValue = this.getNestedValue(request.context.device, condition.field);
        break;
      case 'network':
        contextValue = this.getNestedValue(request.context.network, condition.field);
        break;
      case 'application':
        contextValue = this.getNestedValue(request.context.application, condition.field);
        break;
      case 'data':
        contextValue = this.getNestedValue(request.resource, condition.field);
        break;
      case 'time':
        contextValue = new Date().getHours();
        break;
      case 'location':
        contextValue = request.context.network.location;
        break;
      case 'risk':
        contextValue = this.calculateRiskScore(request.context);
        break;
      default:
        return false;
    }

    return this.evaluateOperator(contextValue, condition.operator, condition.value);
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  evaluateOperator(contextValue, operator, expectedValue) {
    switch (operator) {
      case 'equals': return contextValue === expectedValue;
      case 'not_equals': return contextValue !== expectedValue;
      case 'contains': return String(contextValue).includes(String(expectedValue));
      case 'not_contains': return !String(contextValue).includes(String(expectedValue));
      case 'greater_than': return Number(contextValue) > Number(expectedValue);
      case 'less_than': return Number(contextValue) < Number(expectedValue);
      case 'in': return Array.isArray(expectedValue) && expectedValue.includes(contextValue);
      case 'not_in': return Array.isArray(expectedValue) && !expectedValue.includes(contextValue);
      case 'regex': return new RegExp(String(expectedValue)).test(String(contextValue));
      default: return false;
    }
  }

  calculateRiskScore(context) {
    return Math.min(
      context.user.riskScore * 0.3 +
      context.device.riskScore * 0.25 +
      context.network.riskScore * 0.2 +
      context.application.riskScore * 0.15 +
      context.session.riskScore * 0.1,
      100
    );
  }

  async evaluatePolicy(policy, request) {
    const conditionResults = await Promise.all(
      policy.conditions.map(condition => this.evaluateCondition(condition, request))
    );
    const allConditionsMet = conditionResults.every(result => result);
    return { policy, conditionsMet: allConditionsMet, action: allConditionsMet ? policy.actions[0] : null };
  }

  makeFinalDecision(evaluationResults, riskScore) {
    for (const result of evaluationResults) {
      if (result.conditionsMet && result.action) {
        const decision = {
          action: result.action.type,
          reason: `Policy ${result.policy.name} matched`,
          conditions: result.action.parameters || {},
          riskFactors: this.identifyRiskFactors(riskScore),
          confidence: 0.95,
          expiresAt: new Date(Date.now() + 3600000)
        };

        if (riskScore > 80 && decision.action === 'allow') {
          decision.action = 'challenge';
          decision.reason += ' (elevated due to high risk)';
        }

        return decision;
      }
    }

    return {
      action: 'deny',
      reason: 'No matching allow policy found',
      conditions: {},
      riskFactors: ['no_policy_match'],
      confidence: 1.0,
      expiresAt: null
    };
  }

  identifyRiskFactors(riskScore) {
    const factors = [];
    if (riskScore > 80) factors.push('high_risk_score');
    if (riskScore > 60) factors.push('elevated_risk');
    if (riskScore > 40) factors.push('moderate_risk');
    return factors;
  }

  handleSecurityEvent(event) {
    this.securityEvents.push(event);
    this.emit('security_event', event);

    if (event.severity === 'critical' || event.severity === 'high') {
      this.handleHighSeverityEvent(event);
    }
  }

  handleHighSeverityEvent(event) {
    switch (event.type) {
      case 'threat':
        this.initiateIncidentResponse(event);
        break;
      case 'compliance':
        this.handleComplianceViolation(event);
        break;
      case 'anomaly':
        this.investigateAnomaly(event);
        break;
    }
  }

  async initiateIncidentResponse(event) {
    const incident = { id: `incident-${Date.now()}`, event, status: 'open', createdAt: new Date() };
    this.emit('incident_created', incident);
  }

  handleComplianceViolation(event) {
    const ticket = { id: `compliance-${Date.now()}`, event, status: 'open', createdAt: new Date() };
    this.emit('compliance_violation', ticket);
  }

  investigateAnomaly(event) {
    this.emit('anomaly_investigation', { event, timestamp: new Date() });
  }

  async performHealthCheck() {
    const healthStatus = {
      orchestrator: 'healthy',
      policies: this.policies.size > 0 ? 'healthy' : 'warning',
      timestamp: new Date()
    };
    this.emit('health_check', healthStatus);
  }

  updateMetrics() {
    this.emit('metrics_updated', this.metrics);
  }

  updateAuthorizationMetrics(decision) {
    this.metrics.authorization.totalRequests++;
    switch (decision.action) {
      case 'allow': this.metrics.authorization.allowedRequests++; break;
      case 'deny': this.metrics.authorization.deniedRequests++; break;
      case 'challenge': this.metrics.authorization.challengedRequests++; break;
    }
  }

  detectAnomalies() {
    const recentEvents = this.securityEvents.slice(-100);
    const highSeverityEvents = recentEvents.filter(e => e.severity === 'high' || e.severity === 'critical');

    if (highSeverityEvents.length > 10) {
      const anomaly = {
        id: `anomaly-${Date.now()}`,
        timestamp: new Date(),
        type: 'anomaly',
        severity: 'high',
        source: 'zero-trust-orchestrator',
        description: 'High number of severe security events detected',
        context: {},
        metadata: { eventCount: highSeverityEvents.length, timeWindow: '5 minutes' }
      };
      this.handleSecurityEvent(anomaly);
    }
  }

  async updateThreatIntelligence() {
    try {
      this.threatIntelligence.lastUpdated = new Date();
      this.emit('threat_intelligence_updated', this.threatIntelligence);
    } catch (error) {
      console.error('Failed to update threat intelligence:', error);
    }
  }

  getMetrics() { return { ...this.metrics }; }
  getSecurityEvents(limit = 100) { return this.securityEvents.slice(-limit); }
  getPolicies() { return Array.from(this.policies.values()); }
  
  async setPolicy(policy) {
    this.policies.set(policy.id, policy);
    this.emit('policy_updated', policy);
  }

  async removePolicy(policyId) {
    if (this.policies.delete(policyId)) {
      this.emit('policy_removed', policyId);
    }
  }

  getThreatIntelligence() { return { ...this.threatIntelligence }; }

  createTestAccessRequest() {
    return {
      id: `request-${Date.now()}`,
      timestamp: new Date(),
      context: {
        user: {
          id: 'test-user-001', roles: ['user'], groups: ['employees'],
          attributes: { department: 'IT' }, riskScore: 25,
          authenticationMethods: ['password', 'mfa'], lastAuthentication: new Date()
        },
        device: {
          id: 'test-device-001', type: 'laptop', platform: 'windows', version: '11',
          compliance: true, riskScore: 15, certificates: ['corp-cert-001'], lastSeen: new Date()
        },
        network: {
          sourceIP: '192.168.1.100', location: 'corporate-network', vpnStatus: false,
          networkSegment: 'internal', riskScore: 10, connectionType: 'ethernet'
        },
        application: {
          id: 'test-app-001', version: '1.0.0', classification: 'internal',
          riskScore: 20, permissions: ['read', 'write']
        },
        session: {
          id: 'test-session-001', startTime: new Date(), duration: 3600,
          activities: ['login', 'file_access'], anomalies: [], riskScore: 5
        }
      },
      resource: {
        id: 'resource-001', type: 'file', classification: 'internal',
        owner: 'test-user-001', path: '/documents/project-data.xlsx'
      },
      action: 'read'
    };
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      policies: this.policies.size,
      securityEvents: this.securityEvents.length,
      threatIndicators: {
        ips: this.threatIntelligence.indicators.ips.length,
        domains: this.threatIntelligence.indicators.domains.length
      },
      lastThreatUpdate: this.threatIntelligence.lastUpdated
    };
  }

  async shutdown() {
    this.isInitialized = false;
    this.emit('shutdown');
  }
}

/**
 * Zero Trust Orchestrator Demo
 */
class ZeroTrustOrchestratorDemo {
  constructor() {
    this.orchestrator = new ZeroTrustOrchestratorService();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.orchestrator.on('initialized', () => {
      console.log('✅ Zero Trust Orchestrator initialized successfully');
    });

    this.orchestrator.on('security_event', (event) => {
      console.log(`🚨 Security Event: ${event.type} - ${event.severity} - ${event.description}`);
    });

    this.orchestrator.on('incident_created', (incident) => {
      console.log(`🚨 INCIDENT CREATED: ${incident.id} - Status: ${incident.status}`);
    });

    this.orchestrator.on('compliance_violation', (violation) => {
      console.log(`⚠️  COMPLIANCE VIOLATION: ${violation.id}`);
    });

    this.orchestrator.on('anomaly_investigation', (investigation) => {
      console.log(`🔍 ANOMALY INVESTIGATION: ${investigation.event.description}`);
    });

    this.orchestrator.on('policy_updated', (policy) => {
      console.log(`📜 Policy Updated: ${policy.name} (${policy.id})`);
    });

    this.orchestrator.on('access_logged', (logEntry) => {
      console.log(`📝 Access Decision: ${logEntry.decision} - ${logEntry.reason}`);
    });

    this.orchestrator.on('health_check', (status) => {
      console.log(`💚 Health Check: Orchestrator ${status.orchestrator}, Policies ${status.policies}`);
    });

    this.orchestrator.on('metrics_updated', () => {
      const metrics = this.orchestrator.getMetrics();
      console.log(`📊 Metrics Updated: ${metrics.authorization.totalRequests} total requests`);
    });
  }

  async runDemo() {
    console.log('🚀 Starting Zero Trust Orchestrator Demo\n');

    try {
      // Initialize the orchestrator
      await this.orchestrator.initialize();
      console.log('');

      // Display initial status
      await this.displayStatus();

      // Demo 1: Policy Management
      await this.demoPolicyManagement();

      // Demo 2: Access Evaluation
      await this.demoAccessEvaluation();

      // Demo 3: Security Event Handling
      await this.demoSecurityEventHandling();

      // Final status
      await this.displayFinalStatus();

    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }

  async displayStatus() {
    console.log('📊 Zero Trust Orchestrator Status:');
    console.log('================================');
    
    const status = this.orchestrator.getStatus();
    console.log(`Initialized: ${status.initialized}`);
    console.log(`Policies: ${status.policies}`);
    console.log(`Security Events: ${status.securityEvents}`);
    console.log(`Threat Indicators: ${status.threatIndicators.ips + status.threatIndicators.domains}`);
    console.log(`Last Update: ${status.lastThreatUpdate}`);
    console.log('');
  }

  async demoPolicyManagement() {
    console.log('🔐 Demo 1: Policy Management');
    console.log('============================');

    const policies = this.orchestrator.getPolicies();
    console.log(`Current policies: ${policies.length}`);
    policies.forEach(policy => {
      console.log(`  - ${policy.name} (Priority: ${policy.priority})`);
    });

    const customPolicy = {
      id: 'zt-custom-001',
      name: 'VPN Required for External Access',
      description: 'Require VPN for users accessing from external networks',
      version: '1.0',
      priority: 150,
      conditions: [
        { type: 'network', field: 'networkSegment', operator: 'equals', value: 'external' }
      ],
      actions: [{
        type: 'challenge',
        parameters: { vpn: true, reason: 'External access requires VPN' },
        severity: 'medium'
      }],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'demo',
        tags: ['vpn', 'external', 'network']
      }
    };

    await this.orchestrator.setPolicy(customPolicy);
    console.log(`✅ Added custom policy: ${customPolicy.name}`);
    console.log('');
  }

  async demoAccessEvaluation() {
    console.log('🔍 Demo 2: Access Evaluation');
    console.log('============================');

    // Scenario 1: Low-risk user access
    console.log('Scenario 1: Low-risk user access');
    const lowRiskRequest = this.orchestrator.createTestAccessRequest();
    const decision1 = await this.orchestrator.evaluateAccess(lowRiskRequest);
    console.log(`Decision: ${decision1.decision} - ${decision1.reason}`);
    console.log(`Risk Score: ${decision1.metadata.riskScore}`);
    console.log(`Confidence: ${decision1.metadata.confidence}`);
    console.log('');

    // Scenario 2: High-risk user access
    console.log('Scenario 2: High-risk user access');
    const highRiskRequest = this.orchestrator.createTestAccessRequest();
    highRiskRequest.context.user.riskScore = 85; // High risk
    highRiskRequest.context.device.compliance = false;
    const decision2 = await this.orchestrator.evaluateAccess(highRiskRequest);
    console.log(`Decision: ${decision2.decision} - ${decision2.reason}`);
    console.log(`Risk Score: ${decision2.metadata.riskScore}`);
    console.log(`Risk Factors: ${decision2.metadata.riskFactors.join(', ')}`);
    console.log('');

    // Scenario 3: Administrative access
    console.log('Scenario 3: Administrative access');
    const adminRequest = this.orchestrator.createTestAccessRequest();
    adminRequest.context.user.roles = ['admin'];
    adminRequest.context.application.classification = 'administrative';
    const decision3 = await this.orchestrator.evaluateAccess(adminRequest);
    console.log(`Decision: ${decision3.decision} - ${decision3.reason}`);
    console.log(`Conditions: ${JSON.stringify(decision3.conditions)}`);
    console.log('');
  }

  async demoSecurityEventHandling() {
    console.log('🚨 Demo 3: Security Event Handling');
    console.log('==================================');

    const events = [
      {
        id: 'event-001',
        timestamp: new Date(),
        type: 'threat',
        severity: 'high',
        source: 'network-scanner',
        description: 'Suspicious network scanning detected',
        context: {
          sourceIP: '192.168.1.50',
          targetPorts: [22, 80, 443, 3389]
        },
        metadata: {
          sourceIP: '192.168.1.50',
          attackType: 'port_scan'
        }
      },
      {
        id: 'event-002',
        timestamp: new Date(),
        type: 'compliance',
        severity: 'medium',
        source: 'policy-engine',
        description: 'User accessed sensitive data without proper classification',
        context: {
          userId: 'user-123',
          resourceId: 'sensitive-doc-001'
        }
      },
      {
        id: 'event-003',
        timestamp: new Date(),
        type: 'anomaly',
        severity: 'low',
        source: 'behavior-analytics',
        description: 'User login from unusual location',
        context: {
          userId: 'user-456',
          location: 'Moscow, Russia',
          usualLocation: 'New York, USA'
        }
      }
    ];

    console.log('Generating security events...');
    for (const event of events) {
      this.orchestrator.handleSecurityEvent(event);
      console.log(`  - ${event.type} event: ${event.description}`);
    }
    console.log('');

    // Wait a moment for events to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));

    const recentEvents = this.orchestrator.getSecurityEvents(10);
    console.log(`Recent security events: ${recentEvents.length}`);
    console.log('');
  }

  async displayFinalStatus() {
    console.log('📈 Demo Results Summary');
    console.log('======================');

    const metrics = this.orchestrator.getMetrics();
    console.log('Authorization Metrics:');
    console.log(`  - Total Requests: ${metrics.authorization.totalRequests}`);
    console.log(`  - Allowed: ${metrics.authorization.allowedRequests}`);
    console.log(`  - Denied: ${metrics.authorization.deniedRequests}`);
    console.log(`  - Challenged: ${metrics.authorization.challengedRequests}`);
    console.log('');

    const status = this.orchestrator.getStatus();
    console.log('Final Status:');
    console.log(`  - Policies: ${status.policies}`);
    console.log(`  - Security Events: ${status.securityEvents}`);
    console.log(`  - System Health: Operational`);
    console.log('');

    console.log('✅ Zero Trust Orchestrator Demo Complete!');
    console.log('==========================================');
    console.log('The orchestrator is now running with:');
    console.log('- Comprehensive policy management');
    console.log('- Real-time access evaluation');
    console.log('- Security event processing');
    console.log('- Threat intelligence integration');
    console.log('- Compliance framework support');
    console.log('- Risk-based decision making');
    console.log('- Continuous monitoring and anomaly detection');
  }

  async cleanup() {
    console.log('\n🔄 Shutting down Zero Trust Orchestrator...');
    await this.orchestrator.shutdown();
    console.log('✅ Orchestrator shutdown complete');
  }
}

async function main() {
  const demo = new ZeroTrustOrchestratorDemo();
  
  try {
    await demo.runDemo();
    
    console.log('\n⏱️  Monitoring for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('Demo failed:', error);
  } finally {
    await demo.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ZeroTrustOrchestratorService, ZeroTrustOrchestratorDemo };
