import { ZeroTrustOrchestratorService } from '../services/orchestration/zeroTrustOrchestrator';

/**
 * Zero Trust Orchestrator Demo
 * 
 * This demo showcases the comprehensive Zero Trust Orchestration Service capabilities
 */
class ZeroTrustOrchestratorDemo {
  private orchestrator: ZeroTrustOrchestratorService;

  constructor() {
    this.orchestrator = new ZeroTrustOrchestratorService();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for the orchestrator
   */
  private setupEventListeners(): void {
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

  /**
   * Run the comprehensive demo
   */
  async runDemo(): Promise<void> {
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

      // Demo 4: Threat Intelligence
      await this.demoThreatIntelligence();

      // Demo 5: Compliance Assessment
      await this.demoComplianceAssessment();

      // Demo 6: Risk Scoring
      await this.demoRiskScoring();

      // Final status
      await this.displayFinalStatus();

    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }

  /**
   * Display orchestrator status
   */
  private async displayStatus(): Promise<void> {
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

  /**
   * Demo policy management capabilities
   */
  private async demoPolicyManagement(): Promise<void> {
    console.log('🔐 Demo 1: Policy Management');
    console.log('============================');

    // Display existing policies
    const policies = this.orchestrator.getPolicies();
    console.log(`Current policies: ${policies.length}`);
    policies.forEach(policy => {
      console.log(`  - ${policy.name} (Priority: ${policy.priority})`);
    });

    // Add a new custom policy
    const customPolicy = {
      id: 'zt-custom-001',
      name: 'VPN Required for External Access',
      description: 'Require VPN for users accessing from external networks',
      version: '1.0',
      priority: 150,
      conditions: [
        { type: 'network' as const, field: 'networkSegment', operator: 'equals' as const, value: 'external' }
      ],
      actions: [{
        type: 'challenge' as const,
        parameters: { vpn: true, reason: 'External access requires VPN' },
        severity: 'medium' as const
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

  /**
   * Demo access evaluation scenarios
   */
  private async demoAccessEvaluation(): Promise<void> {
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

  /**
   * Demo security event handling
   */
  private async demoSecurityEventHandling(): Promise<void> {
    console.log('🚨 Demo 3: Security Event Handling');
    console.log('==================================');

    // Generate various security events
    const events = [
      {
        id: 'event-001',
        timestamp: new Date(),
        type: 'threat' as const,
        severity: 'high' as const,
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
        type: 'compliance' as const,
        severity: 'medium' as const,
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
        type: 'anomaly' as const,
        severity: 'low' as const,
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

    // Display security events
    const recentEvents = this.orchestrator.getSecurityEvents(10);
    console.log(`Recent security events: ${recentEvents.length}`);
    console.log('');
  }

  /**
   * Demo threat intelligence capabilities
   */
  private async demoThreatIntelligence(): Promise<void> {
    console.log('🕵️ Demo 4: Threat Intelligence');
    console.log('==============================');

    const threatIntel = this.orchestrator.getThreatIntelligence();
    console.log('Threat Intelligence Status:');
    console.log(`  - IP Indicators: ${threatIntel.indicators.ips.length}`);
    console.log(`  - Domain Indicators: ${threatIntel.indicators.domains.length}`);
    console.log(`  - Hash Indicators: ${threatIntel.indicators.hashes.length}`);
    console.log(`  - Signature Indicators: ${threatIntel.indicators.signatures.length}`);
    console.log(`  - Last Updated: ${threatIntel.lastUpdated}`);
    console.log('');

    // Simulate threat intelligence update
    console.log('Simulating threat intelligence update...');
    // The update happens automatically via the monitoring interval
    console.log('');
  }

  /**
   * Demo compliance assessment
   */
  private async demoComplianceAssessment(): Promise<void> {
    console.log('📋 Demo 5: Compliance Assessment');
    console.log('================================');

    const frameworks = this.orchestrator.getComplianceFrameworks();
    console.log(`Available compliance frameworks: ${frameworks.length}`);
    frameworks.forEach(framework => {
      console.log(`  - ${framework.name} v${framework.version}`);
    });

    // Note: Compliance assessment would be implemented based on specific requirements
    console.log('Compliance assessment capabilities ready for implementation.');
    console.log('');
  }

  /**
   * Demo risk scoring
   */
  private async demoRiskScoring(): Promise<void> {
    console.log('⚖️ Demo 6: Risk Scoring Scenarios');
    console.log('=================================');

    // Create different risk scenarios
    const scenarios = [
      {
        name: 'Corporate Employee - Low Risk',
        context: {
          user: { riskScore: 10 },
          device: { riskScore: 5 },
          network: { riskScore: 5 },
          application: { riskScore: 10 },
          session: { riskScore: 5 }
        }
      },
      {
        name: 'Remote Worker - Medium Risk',
        context: {
          user: { riskScore: 25 },
          device: { riskScore: 30 },
          network: { riskScore: 40 },
          application: { riskScore: 20 },
          session: { riskScore: 15 }
        }
      },
      {
        name: 'Suspicious Activity - High Risk',
        context: {
          user: { riskScore: 80 },
          device: { riskScore: 70 },
          network: { riskScore: 90 },
          application: { riskScore: 60 },
          session: { riskScore: 85 }
        }
      }
    ];

    scenarios.forEach(scenario => {
      // Create a simple risk calculation for demo
      const riskScore = 
        scenario.context.user.riskScore * 0.3 +
        scenario.context.device.riskScore * 0.25 +
        scenario.context.network.riskScore * 0.2 +
        scenario.context.application.riskScore * 0.15 +
        scenario.context.session.riskScore * 0.1;

      console.log(`${scenario.name}: Risk Score ${riskScore.toFixed(1)}/100`);
    });
    console.log('');
  }

  /**
   * Display final status and metrics
   */
  private async displayFinalStatus(): Promise<void> {
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

  /**
   * Cleanup and shutdown
   */
  async cleanup(): Promise<void> {
    console.log('\n🔄 Shutting down Zero Trust Orchestrator...');
    await this.orchestrator.shutdown();
    console.log('✅ Orchestrator shutdown complete');
  }
}

/**
 * Main function to run the demo
 */
async function main(): Promise<void> {
  const demo = new ZeroTrustOrchestratorDemo();
  
  try {
    await demo.runDemo();
    
    // Keep the demo running for a short time to show monitoring
    console.log('\n⏱️  Monitoring for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('Demo failed:', error);
  } finally {
    await demo.cleanup();
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default ZeroTrustOrchestratorDemo;
