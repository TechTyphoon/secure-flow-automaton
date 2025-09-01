**
 * Security Context Understanding Engine
 * Advanced situational awareness, risk assessment, and environmental context analysis
 */

import { EventEmitter } from 'events';

// Core interfaces for context understanding
interface SecurityContext {
  id: string;
  timestamp: number;
  environment: EnvironmentContext;
  threats: ThreatContext;
  assets: AssetContext;
  compliance: ComplianceContext;
  operational: OperationalContext;
  risk: RiskAssessment;
  situationalAwareness: SituationalAwareness;
}

interface EnvironmentContext {
  networkTopology: NetworkTopology;
  systemInventory: SystemInventory;
  dataClassification: DataClassification;
  businessCriticality: BusinessCriticality;
  geographicDistribution: GeographicInfo;
  timeContext: TimeContext;
}

interface ThreatContext {
  currentThreats: ActiveThreat[];
  threatLandscape: ThreatLandscape;
  attackSurface: AttackSurface;
  vulnerabilityExposure: VulnerabilityExposure;
  threatIntelligence: ThreatIntelligence;
  emergingThreats: EmergingThreat[];
}

interface AssetContext {
  criticalAssets: CriticalAsset[];
  assetRelationships: AssetRelationship[];
  businessImpact: BusinessImpact;
  dataFlows: DataFlow[];
  dependencies: AssetDependency[];
  exposure: AssetExposure;
}

interface ComplianceContext {
  frameworks: ComplianceFramework[];
  requirements: ComplianceRequirement[];
  auditStatus: AuditStatus;
  violations: ComplianceViolation[];
  controlEffectiveness: ControlEffectiveness;
}

interface OperationalContext {
  securityPosture: SecurityPosture;
  incidentHistory: IncidentHistory;
  responseCapability: ResponseCapability;
  monitoringCoverage: MonitoringCoverage;
  teamCapacity: TeamCapacity;
}

interface RiskAssessment {
  overallRisk: RiskLevel;
  riskFactors: RiskFactor[];
  businessRisk: BusinessRisk;
  technicalRisk: TechnicalRisk;
  riskTrends: RiskTrend[];
  mitigationEffectiveness: MitigationEffectiveness;
}

interface SituationalAwareness {
  alertLevel: AlertLevel;
  criticalEvents: CriticalEvent[];
  contextualAlerts: ContextualAlert[];
  environmentalFactors: EnvironmentalFactor[];
  situationSummary: string;
  recommendations: ContextualRecommendation[];
}

// Supporting interfaces
interface NetworkTopology {
  segments: NetworkSegment[];
  connectivity: NetworkConnection[];
  securityZones: SecurityZone[];
  perimeter: PerimeterDefense[];
}

interface NetworkSegment {
  id: string;
  name: string;
  type: 'DMZ' | 'INTERNAL' | 'EXTERNAL' | 'MANAGEMENT' | 'GUEST';
  ipRanges: string[];
  securityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  assets: string[];
}

interface SystemInventory {
  totalSystems: number;
  systemTypes: { [type: string]: number };
  operatingSystems: { [os: string]: number };
  securityStatus: { [status: string]: number };
  lastUpdated: number;
}

interface ActiveThreat {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'CONTAINED' | 'RESOLVED';
  affectedAssets: string[];
  firstDetected: number;
  lastActivity: number;
  confidence: number;
}

interface CriticalAsset {
  id: string;
  name: string;
  type: string;
  businessValue: number;
  securityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  dependencies: string[];
  threats: string[];
  riskScore: number;
}

interface RiskFactor {
  factor: string;
  weight: number;
  currentValue: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigation: string[];
}

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type AlertLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

// Data interfaces for context analysis
interface ContextAnalysisData {
  network?: unknown;
  systems?: unknown[];
  data?: unknown;
  business?: unknown;
  geography?: unknown;
  threats?: unknown[];
  landscape?: unknown;
  surface?: unknown;
  vulnerabilities?: unknown[];
  intelligence?: unknown;
  emerging?: unknown[];
  assets?: unknown[];
  relationships?: unknown[];
  impact?: unknown;
  flows?: unknown[];
  dependencies?: unknown[];
  exposure?: unknown;
  compliance?: unknown;
  operational?: unknown;
  risk?: unknown;
  situational?: unknown;
}

interface NetworkData {
  segments?: unknown[];
  connections?: unknown[];
  zones?: unknown[];
  perimeter?: unknown[];
}

interface SystemData {
  total?: number;
  types?: { [key: string]: number };
  operatingSystems?: { [key: string]: number };
  securityStatus?: { [key: string]: number };
  lastUpdated?: number;
}

// Context Engine Capabilities Interface
interface ContextEngineCapabilities {
  contextAnalysis: {
    environmentalAnalysis: boolean;
    threatContextualization: boolean;
    assetRiskAssessment: boolean;
    complianceMapping: boolean;
    operationalAwareness: boolean;
  };
  riskAssessment: {
    multiFactorAnalysis: boolean;
    businessImpactAssessment: boolean;
    technicalRiskEvaluation: boolean;
    trendAnalysis: boolean;
    mitigationEffectiveness: boolean;
  };
  situationalAwareness: {
    alertLevelDetermination: boolean;
    criticalEventIdentification: boolean;
    contextualRecommendations: boolean;
    environmentalFactors: boolean;
    situationSummary: boolean;
  };
  realTimeCapabilities: {
    continuousContextUpdates: boolean;
    adaptiveAnalysis: boolean;
    contextComparison: boolean;
    historicalAnalysis: boolean;
  };
}

// Context Engine Statistics Interface
interface ContextEngineStatistics {
  totalContextsAnalyzed: number;
  alertLevelDistribution: { [key: string]: number };
  riskLevelDistribution: { [key: string]: number };
  isInitialized: boolean;
  capabilities: ContextEngineCapabilities;
  timestamp: number;
}

// Compliance Data Interface
interface ComplianceData {
  frameworks?: ComplianceFramework[];
  requirements?: ComplianceRequirement[];
  auditStatus?: { overall: string };
  violations?: ComplianceViolation[];
  controlEffectiveness?: { overall: number };
}

// Operational Data Interface
interface OperationalData {
  securityPosture?: { level: string };
  incidentHistory?: { total: number; recent: number };
  responseCapability?: { level: string };
  monitoringCoverage?: { percentage: number };
  teamCapacity?: { utilization: number };
}

// Risk Comparison Interface
interface RiskComparison {
  from: string;
  to: string;
  change: 'INCREASED' | 'DECREASED' | 'UNCHANGED';
  magnitude: number;
}

// Threat Comparison Interface
interface ThreatComparison {
  threatCountChange: number;
  criticalThreatChange: number;
  emergingThreatChange: number;
}

// Alert Comparison Interface
interface AlertComparison {
  from: AlertLevel;
  to: AlertLevel;
  change: 'ESCALATED' | 'DE-ESCALATED' | 'UNCHANGED';
  magnitude: number;
}

// Alert Context Interface
interface AlertContext {
  source?: string;
  category?: string;
  affectedAssets?: string[];
  riskLevel?: string;
  mitigationSteps?: string[];
  relatedThreats?: string[];
  threatsCount?: number;
  assetsAffected?: number;
  complianceImpact?: string;
  operationalImpact?: string;
}

// Context Comparison Interface
interface ContextComparison {
  riskChange: RiskComparison;
  threatChange: ThreatComparison;
  alertLevelChange: AlertComparison;
  timeline: {
    from: number;
    to: number;
    duration: number;
  };
}

// Context Analysis Engine
class ContextAnalysisEngine {
  private contextHistory: Map<string, SecurityContext[]> = new Map();
  private baselineMetrics: Map<string, number> = new Map();
  private alertThresholds: Map<string, number> = new Map();

  constructor() {
    this.initializeBaselineMetrics();
    this.initializeAlertThresholds();
  }

  analyzeEnvironmentContext(data: ContextAnalysisData): EnvironmentContext {
    const networkTopology = this.analyzeNetworkTopology(data.network || {});
    const systemInventory = this.analyzeSystemInventory(data.systems || []);
    const dataClassification = this.analyzeDataClassification(data.data || {});
    const businessCriticality = this.assessBusinessCriticality(data.business || {});
    const geographicDistribution = this.analyzeGeographicDistribution(data.geography || {});
    const timeContext = this.analyzeTimeContext();

    return {
      networkTopology,
      systemInventory,
      dataClassification,
      businessCriticality,
      geographicDistribution,
      timeContext
    };
  }

  analyzeThreatContext(data: ContextAnalysisData): ThreatContext {
    const currentThreats = this.identifyCurrentThreats(data.threats || []);
    const threatLandscape = this.assessThreatLandscape(data.landscape || {});
    const attackSurface = this.calculateAttackSurface(data.surface || {});
    const vulnerabilityExposure = this.assessVulnerabilityExposure(data.vulnerabilities || []);
    const threatIntelligence = this.processThreatIntelligence(data.intelligence || {});
    const emergingThreats = this.identifyEmergingThreats(data.emerging || []);

    return {
      currentThreats,
      threatLandscape,
      attackSurface,
      vulnerabilityExposure,
      threatIntelligence,
      emergingThreats
    };
  }

  analyzeAssetContext(data: ContextAnalysisData): AssetContext {
    const criticalAssets = this.identifyCriticalAssets(data.assets || []);
    const assetRelationships = this.mapAssetRelationships(data.relationships || []);
    const businessImpact = this.assessBusinessImpact(data.impact || {});
    const dataFlows = this.analyzeDataFlows(data.flows || []);
    const dependencies = this.mapAssetDependencies(data.dependencies || []);
    const exposure = this.assessAssetExposure(data.exposure || {});

    return {
      criticalAssets,
      assetRelationships,
      businessImpact,
      dataFlows,
      dependencies,
      exposure
    };
  }

  assessRisk(
    environment: EnvironmentContext,
    threats: ThreatContext,
    assets: AssetContext,
    compliance: ComplianceContext,
    operational: OperationalContext
  ): RiskAssessment {
    const riskFactors = this.identifyRiskFactors(environment, threats, assets);
    const overallRisk = this.calculateOverallRisk(riskFactors);
    const businessRisk = this.assessBusinessRisk(assets, threats);
    const technicalRisk = this.assessTechnicalRisk(environment, threats);
    const riskTrends = this.analyzeRiskTrends(riskFactors);
    const mitigationEffectiveness = this.assessMitigationEffectiveness(operational);

    return {
      overallRisk,
      riskFactors,
      businessRisk,
      technicalRisk,
      riskTrends,
      mitigationEffectiveness
    };
  }

  generateSituationalAwareness(
    environment: EnvironmentContext,
    threats: ThreatContext,
    assets: AssetContext,
    risk: RiskAssessment
  ): SituationalAwareness {
    const alertLevel = this.determineAlertLevel(risk, threats);
    const criticalEvents = this.identifyCriticalEvents(threats, assets);
    const contextualAlerts = this.generateContextualAlerts(environment, threats, assets);
    const environmentalFactors = this.analyzeEnvironmentalFactors(environment);
    const situationSummary = this.generateSituationSummary(alertLevel, criticalEvents, risk);
    const recommendations = this.generateContextualRecommendations(risk, threats, assets);

    return {
      alertLevel,
      criticalEvents,
      contextualAlerts,
      environmentalFactors,
      situationSummary,
      recommendations
    };
  }

  private analyzeNetworkTopology(networkData: NetworkData): NetworkTopology {
    const segments: NetworkSegment[] = [];
    const connectivity: NetworkConnection[] = [];
    const securityZones: SecurityZone[] = [];
    const perimeter: PerimeterDefense[] = [];

    // Analyze network segments
    if (networkData.segments) {
      for (const segmentData of networkData.segments) {
        const seg = segmentData as { id?: string; name?: string; type?: string; ipRanges?: string[]; assets?: string[] };
        segments.push({
          id: seg.id || `segment_${segments.length}`,
          name: seg.name || `Segment ${segments.length}`,
          type: (seg.type as 'DMZ' | 'INTERNAL' | 'EXTERNAL' | 'MANAGEMENT' | 'GUEST') || 'INTERNAL',
          ipRanges: seg.ipRanges || [],
          securityLevel: this.assessSegmentSecurity(segmentData),
          assets: seg.assets || []
        });
      }
    }

    // Default segments if none provided
    if (segments.length === 0) {
      segments.push(
        {
          id: 'dmz',
          name: 'DMZ',
          type: 'DMZ',
          ipRanges: ['10.0.1.0/24'],
          securityLevel: 'MEDIUM',
          assets: []
        },
        {
          id: 'internal',
          name: 'Internal Network',
          type: 'INTERNAL',
          ipRanges: ['192.168.1.0/24'],
          securityLevel: 'HIGH',
          assets: []
        }
      );
    }

    return { segments, connectivity, securityZones, perimeter };
  }

  private analyzeSystemInventory(systemsData: unknown[]): SystemInventory {
    const systemTypes: { [type: string]: number } = {};
    const operatingSystems: { [os: string]: number } = {};
    const securityStatus: { [status: string]: number } = {};

    for (const system of systemsData) {
      const sys = system as { type?: string; os?: string };
      // Count system types
      const type = sys.type || 'Unknown';
      systemTypes[type] = (systemTypes[type] || 0) + 1;

      // Count operating systems
      const os = sys.os || 'Unknown';
      operatingSystems[os] = (operatingSystems[os] || 0) + 1;

      // Count security status
      const status = this.assessSystemSecurity(system);
      securityStatus[status] = (securityStatus[status] || 0) + 1;
    }

    return {
      totalSystems: systemsData.length,
      systemTypes,
      operatingSystems,
      securityStatus,
      lastUpdated: Date.now()
    };
  }

  private identifyCurrentThreats(threatsData: unknown[]): ActiveThreat[] {
    const threats: ActiveThreat[] = [];

    for (const threatData of threatsData) {
      const threat = threatData as { id?: string; type?: string; severity?: string; status?: string; affectedAssets?: string[]; firstDetected?: number; lastActivity?: number; confidence?: number };
      threats.push({
        id: threat.id || `threat_${threats.length}`,
        type: threat.type || 'Unknown',
        severity: (threat.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') || 'MEDIUM',
        status: (threat.status as 'ACTIVE' | 'CONTAINED' | 'RESOLVED') || 'ACTIVE',
        affectedAssets: threat.affectedAssets || [],
        firstDetected: threat.firstDetected || Date.now(),
        lastActivity: threat.lastActivity || Date.now(),
        confidence: threat.confidence || 0.7
      });
    }

    return threats.sort((a, b) => {
      const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private identifyCriticalAssets(assetsData: unknown[]): CriticalAsset[] {
    const assets: CriticalAsset[] = [];

    for (const assetData of assetsData) {
      const asset = assetData as { id?: string; name?: string; type?: string; dependencies?: string[]; threats?: string[] };
      const businessValue = this.calculateBusinessValue(assetData);
      const riskScore = this.calculateAssetRiskScore(assetData);

      if (businessValue > 0.7 || riskScore > 0.6) {
        assets.push({
          id: asset.id || `asset_${assets.length}`,
          name: asset.name || `Asset ${assets.length}`,
          type: asset.type || 'Unknown',
          businessValue,
          securityLevel: this.determineAssetSecurityLevel(businessValue, riskScore),
          dependencies: asset.dependencies || [],
          threats: asset.threats || [],
          riskScore
        });
      }
    }

    return assets.sort((a, b) => b.businessValue - a.businessValue);
  }

  private identifyRiskFactors(
    environment: EnvironmentContext,
    threats: ThreatContext,
    assets: AssetContext
  ): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Threat-based risk factors
    if (threats.currentThreats.length > 0) {
      const criticalThreats = threats.currentThreats.filter(t => t.severity === 'CRITICAL').length;
      factors.push({
        factor: 'Active Critical Threats',
        weight: 0.3,
        currentValue: criticalThreats / Math.max(1, threats.currentThreats.length),
        trend: this.calculateThreatTrend(threats.currentThreats),
        impact: criticalThreats > 0 ? 'HIGH' : 'MEDIUM',
        mitigation: ['Incident Response', 'Threat Hunting', 'Enhanced Monitoring']
      });
    }

    // Asset exposure risk factors
    const exposedAssets = assets.criticalAssets.filter(a => a.riskScore > 0.7).length;
    if (exposedAssets > 0) {
      factors.push({
        factor: 'Critical Asset Exposure',
        weight: 0.25,
        currentValue: exposedAssets / Math.max(1, assets.criticalAssets.length),
        trend: 'STABLE',
        impact: 'HIGH',
        mitigation: ['Access Controls', 'Network Segmentation', 'Vulnerability Management']
      });
    }

    // Network security risk factors
    const insecureSegments = environment.networkTopology.segments.filter(s => s.securityLevel === 'LOW').length;
    if (insecureSegments > 0) {
      factors.push({
        factor: 'Network Security Gaps',
        weight: 0.2,
        currentValue: insecureSegments / Math.max(1, environment.networkTopology.segments.length),
        trend: 'STABLE',
        impact: 'MEDIUM',
        mitigation: ['Network Hardening', 'Firewall Rules', 'Micro-segmentation']
      });
    }

    // System vulnerability risk factors
    const vulnerableSystems = Object.entries(environment.systemInventory.securityStatus)
      .filter(([status]) => status === 'Vulnerable')
      .reduce((sum, [, count]) => sum + count, 0);

    if (vulnerableSystems > 0) {
      factors.push({
        factor: 'System Vulnerabilities',
        weight: 0.15,
        currentValue: vulnerableSystems / Math.max(1, environment.systemInventory.totalSystems),
        trend: this.calculateVulnerabilityTrend(),
        impact: 'MEDIUM',
        mitigation: ['Patch Management', 'System Hardening', 'Configuration Management']
      });
    }

    // Compliance risk factors
    factors.push({
      factor: 'Compliance Posture',
      weight: 0.1,
      currentValue: 0.8, // Mock compliance score
      trend: 'STABLE',
      impact: 'LOW',
      mitigation: ['Compliance Monitoring', 'Policy Updates', 'Audit Preparation']
    });

    return factors;
  }

  private calculateOverallRisk(riskFactors: RiskFactor[]): RiskLevel {
    if (riskFactors.length === 0) return 'LOW';

    let weightedRisk = 0;
    let totalWeight = 0;

    for (const factor of riskFactors) {
      weightedRisk += factor.currentValue * factor.weight;
      totalWeight += factor.weight;
    }

    const normalizedRisk = totalWeight > 0 ? weightedRisk / totalWeight : 0;

    if (normalizedRisk >= 0.8) return 'CRITICAL';
    if (normalizedRisk >= 0.6) return 'HIGH';
    if (normalizedRisk >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  private determineAlertLevel(risk: RiskAssessment, threats: ThreatContext): AlertLevel {
    // Start with risk-based alert level
    let alertLevel: AlertLevel = 'GREEN';

    switch (risk.overallRisk) {
      case 'CRITICAL':
        alertLevel = 'RED';
        break;
      case 'HIGH':
        alertLevel = 'ORANGE';
        break;
      case 'MEDIUM':
        alertLevel = 'YELLOW';
        break;
      case 'LOW':
        alertLevel = 'GREEN';
        break;
    }

    // Escalate based on active critical threats
    const criticalThreats = threats.currentThreats.filter(t =>
      t.severity === 'CRITICAL' && t.status === 'ACTIVE'
    );

    if (criticalThreats.length > 0 && alertLevel !== 'RED') {
      alertLevel = 'ORANGE';
    }

    // Consider emerging threats
    if (threats.emergingThreats.length > 2) {
      alertLevel = this.escalateAlertLevel(alertLevel);
    }

    return alertLevel;
  }

  private generateSituationSummary(
    alertLevel: AlertLevel,
    criticalEvents: CriticalEvent[],
    risk: RiskAssessment
  ): string {
    const parts = [];

    // Alert level description
    const alertDescriptions = {
      'RED': 'Critical security situation requiring immediate attention',
      'ORANGE': 'Elevated security posture with active threats',
      'YELLOW': 'Heightened awareness with moderate risks',
      'GREEN': 'Normal security operations'
    };

    parts.push(alertDescriptions[alertLevel]);

    // Risk summary
    parts.push(`Overall risk level: ${risk.overallRisk}`);

    // Critical events summary
    if (criticalEvents.length > 0) {
      parts.push(`${criticalEvents.length} critical security events active`);
    }

    // Key risk factors
    const topRiskFactors = risk.riskFactors
      .filter(f => f.impact === 'HIGH')
      .slice(0, 2)
      .map(f => f.factor);

    if (topRiskFactors.length > 0) {
      parts.push(`Primary concerns: ${topRiskFactors.join(', ')}`);
    }

    return parts.join('. ') + '.';
  }

  private generateContextualRecommendations(
    risk: RiskAssessment,
    threats: ThreatContext,
    assets: AssetContext
  ): ContextualRecommendation[] {
    const recommendations: ContextualRecommendation[] = [];

    // High-priority recommendations based on risk factors
    const highImpactFactors = risk.riskFactors.filter(f => f.impact === 'HIGH');

    for (const factor of highImpactFactors) {
      for (const mitigation of factor.mitigation) {
        recommendations.push({
          id: `rec_${recommendations.length}`,
          type: 'RISK_MITIGATION',
          priority: 'HIGH',
          title: `Address ${factor.factor}`,
          description: `Implement ${mitigation} to reduce ${factor.factor.toLowerCase()}`,
          estimatedEffort: this.estimateEffort(mitigation),
          expectedImpact: 'HIGH',
          timeline: '1-2 weeks',
          resources: [mitigation],
          dependencies: []
        });
      }
    }

    // Threat-specific recommendations
    const activeCriticalThreats = threats.currentThreats.filter(t =>
      t.severity === 'CRITICAL' && t.status === 'ACTIVE'
    );

    if (activeCriticalThreats.length > 0) {
      recommendations.push({
        id: `rec_${recommendations.length}`,
        type: 'INCIDENT_RESPONSE',
        priority: 'CRITICAL',
        title: 'Respond to Critical Threats',
        description: `${activeCriticalThreats.length} critical threats require immediate response`,
        estimatedEffort: 'HIGH',
        expectedImpact: 'HIGH',
        timeline: 'Immediate',
        resources: ['Incident Response Team', 'Threat Intelligence'],
        dependencies: ['Management Approval']
      });
    }

    // Asset protection recommendations
    const highRiskAssets = assets.criticalAssets.filter(a => a.riskScore > 0.8);

    if (highRiskAssets.length > 0) {
      recommendations.push({
        id: `rec_${recommendations.length}`,
        type: 'ASSET_PROTECTION',
        priority: 'HIGH',
        title: 'Protect High-Risk Critical Assets',
        description: `${highRiskAssets.length} critical assets require enhanced protection`,
        estimatedEffort: 'MEDIUM',
        expectedImpact: 'HIGH',
        timeline: '2-3 weeks',
        resources: ['Security Team', 'Asset Owners'],
        dependencies: ['Risk Assessment Approval']
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Helper methods
  private initializeBaselineMetrics(): void {
    this.baselineMetrics.set('avgThreats', 5);
    this.baselineMetrics.set('avgVulnerabilities', 20);
    this.baselineMetrics.set('avgIncidents', 2);
    this.baselineMetrics.set('avgRiskScore', 0.4);
  }

  private initializeAlertThresholds(): void {
    this.alertThresholds.set('criticalThreats', 3);
    this.alertThresholds.set('highVulnerabilities', 10);
    this.alertThresholds.set('activeIncidents', 5);
    this.alertThresholds.set('riskScore', 0.7);
  }

  private assessSegmentSecurity(segmentData: unknown): 'HIGH' | 'MEDIUM' | 'LOW' {
    const seg = segmentData as { type?: string; firewallRules?: unknown[] };
    // Simple security assessment based on segment type and configuration
    if (seg.type === 'EXTERNAL') return 'LOW';
    if (seg.type === 'DMZ') return 'MEDIUM';
    if (seg.firewallRules?.length > 0) return 'HIGH';
    return 'MEDIUM';
  }

  private assessSystemSecurity(system: unknown): string {
    const sys = system as { vulnerabilities?: unknown[]; lastPatched?: number; securityScore?: number };
    if (sys.vulnerabilities?.length > 5) return 'Vulnerable';
    if (sys.lastPatched && Date.now() - sys.lastPatched > 30 * 24 * 60 * 60 * 1000) return 'Outdated';
    if (sys.securityScore > 0.8) return 'Secure';
    return 'Moderate';
  }

  private calculateBusinessValue(assetData: unknown): number {
    const asset = assetData as { criticality?: string; revenueImpact?: string; userImpact?: number; complianceRequired?: boolean };
    let value = 0.5; // Base value

    // Business criticality factors
    if (asset.criticality === 'HIGH') value += 0.3;
    if (asset.criticality === 'MEDIUM') value += 0.1;

    // Revenue impact
    if (asset.revenueImpact === 'HIGH') value += 0.2;

    // User impact
    if (asset.userImpact > 1000) value += 0.2;

    // Compliance requirements
    if (asset.complianceRequired) value += 0.1;

    return Math.min(1.0, value);
  }

  private calculateAssetRiskScore(assetData: unknown): number {
    const asset = assetData as { internetFacing?: boolean; vulnerabilities?: unknown[]; accessControls?: string; encryption?: boolean };
    let risk = 0.3; // Base risk

    // Exposure factors
    if (asset.internetFacing) risk += 0.3;
    if (asset.vulnerabilities?.length > 0) risk += 0.2;
    if (asset.accessControls === 'WEAK') risk += 0.2;
    if (asset.encryption === false) risk += 0.1;

    return Math.min(1.0, risk);
  }

  private determineAssetSecurityLevel(businessValue: number, riskScore: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (businessValue > 0.8 || riskScore > 0.7) return 'HIGH';
    if (businessValue > 0.5 || riskScore > 0.4) return 'MEDIUM';
    return 'LOW';
  }

  private calculateThreatTrend(threats: ActiveThreat[]): 'INCREASING' | 'STABLE' | 'DECREASING' {
    // Simple trend calculation based on recent activity
    const recentThreats = threats.filter(t =>
      Date.now() - t.firstDetected < 7 * 24 * 60 * 60 * 1000
    ).length;

    const baseline = this.baselineMetrics.get('avgThreats') || 5;

    if (recentThreats > baseline * 1.2) return 'INCREASING';
    if (recentThreats < baseline * 0.8) return 'DECREASING';
    return 'STABLE';
  }

  private calculateVulnerabilityTrend(): 'INCREASING' | 'STABLE' | 'DECREASING' {
    // Mock implementation - would analyze vulnerability discovery trends
    return 'STABLE';
  }

  private escalateAlertLevel(currentLevel: AlertLevel): AlertLevel {
    const levels: AlertLevel[] = ['GREEN', 'YELLOW', 'ORANGE', 'RED'];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[Math.min(levels.length - 1, currentIndex + 1)];
  }

  private estimateEffort(mitigation: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const highEffortMitigations = ['Network Segmentation', 'System Replacement', 'Architecture Redesign'];
    const mediumEffortMitigations = ['Patch Management', 'Access Controls', 'Monitoring Enhancement'];

    if (highEffortMitigations.some(m => mitigation.includes(m))) return 'HIGH';
    if (mediumEffortMitigations.some(m => mitigation.includes(m))) return 'MEDIUM';
    return 'LOW';
  }

  // Additional required methods for completeness
  private analyzeDataClassification(data: unknown): DataClassification {
    const d = data as { confidential?: number; restricted?: number; internal?: number; public?: number; totalClassified?: number };
    return {
      confidential: d.confidential || 0,
      restricted: d.restricted || 0,
      internal: d.internal || 0,
      public: d.public || 0,
      totalClassified: d.totalClassified || 0
    };
  }

  private assessBusinessCriticality(business: unknown): BusinessCriticality {
    const b = business as { level?: string; revenueImpact?: number; operationalImpact?: string; complianceImpact?: string };
    return {
      level: (b.level as 'LOW' | 'MEDIUM' | 'HIGH') || 'MEDIUM',
      revenueImpact: b.revenueImpact || 0,
      operationalImpact: (b.operationalImpact as 'LOW' | 'MEDIUM' | 'HIGH') || 'MEDIUM',
      complianceImpact: (b.complianceImpact as 'LOW' | 'MEDIUM' | 'HIGH') || 'LOW'
    };
  }

  private analyzeGeographicDistribution(geography: unknown): GeographicInfo {
    const geo = geography as { regions?: string[]; dataResidency?: { [region: string]: string[] }; crossBorderFlows?: boolean };
    return {
      regions: geo.regions || ['US-EAST'],
      dataResidency: geo.dataResidency || {},
      crossBorderFlows: geo.crossBorderFlows || false
    };
  }

  private analyzeTimeContext(): TimeContext {
    const now = new Date();
    return {
      currentTime: now.getTime(),
      businessHours: this.isBusinessHours(now),
      timeZone: 'UTC',
      season: this.getSeason(now),
      isHoliday: false // Would integrate with holiday calendar
    };
  }

  private isBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const day = date.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
  }

  private getSeason(date: Date): string {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }

  // Additional stub implementations for required methods
  private assessThreatLandscape(landscape: unknown): ThreatLandscape {
    return {
      overallThreatLevel: 'MEDIUM',
      dominantThreats: ['Malware', 'Phishing'],
      threatActors: ['APT Groups', 'Cybercriminals'],
      techniques: ['T1566', 'T1059'],
      trends: 'STABLE'
    };
  }

  private calculateAttackSurface(surface: unknown): AttackSurface {
    const surf = surface as { totalEndpoints?: number; internetFacingAssets?: number; vulnerableServices?: number; riskScore?: number };
    return {
      totalEndpoints: surf.totalEndpoints || 100,
      internetFacingAssets: surf.internetFacingAssets || 10,
      vulnerableServices: surf.vulnerableServices || 5,
      riskScore: surf.riskScore || 0.6
    };
  }

  private assessVulnerabilityExposure(vulnerabilities: unknown[]): VulnerabilityExposure {
    return {
      totalVulnerabilities: vulnerabilities.length,
      criticalVulnerabilities: vulnerabilities.filter(v => (v as { severity?: string }).severity === 'CRITICAL').length,
      exploitableVulnerabilities: vulnerabilities.filter(v => (v as { exploitable?: boolean }).exploitable).length,
      exposureScore: 0.4
    };
  }

  private processThreatIntelligence(intelligence: unknown): ThreatIntelligence {
    const intel = intelligence as { feeds?: string[]; indicators?: string[] };
    return {
      feeds: intel.feeds || [],
      indicators: intel.indicators || [],
      lastUpdated: Date.now(),
      reliability: 0.8
    };
  }

  private identifyEmergingThreats(emerging: unknown[]): EmergingThreat[] {
    return emerging.map((threat, index) => {
      const t = threat as { name?: string; description?: string; confidence?: number; firstSeen?: number; indicators?: string[] };
      return {
        id: `emerging_${index}`,
        name: t.name || `Emerging Threat ${index}`,
        description: t.description || 'New threat detected',
        confidence: t.confidence || 0.7,
        firstSeen: t.firstSeen || Date.now(),
        indicators: t.indicators || []
      };
    });
  }

  private mapAssetRelationships(relationships: unknown[]): AssetRelationship[] {
    return relationships.map((rel, index) => {
      const r = rel as { source?: string; target?: string; type?: string; strength?: number };
      return {
        id: `rel_${index}`,
        sourceAsset: r.source || '',
        targetAsset: r.target || '',
        relationshipType: r.type || 'DEPENDS_ON',
        strength: r.strength || 0.5
      };
    });
  }

  private assessBusinessImpact(impact: unknown): BusinessImpact {
    const imp = impact as { financial?: number; operational?: string; reputational?: string; regulatory?: string };
    return {
      financial: imp.financial || 0,
      operational: (imp.operational as 'LOW' | 'MEDIUM' | 'HIGH') || 'LOW',
      reputational: (imp.reputational as 'LOW' | 'MEDIUM' | 'HIGH') || 'LOW',
      regulatory: (imp.regulatory as 'LOW' | 'MEDIUM' | 'HIGH') || 'LOW'
    };
  }

  private analyzeDataFlows(flows: unknown[]): DataFlow[] {
    return flows.map((flow, index) => {
      const f = flow as { source?: string; destination?: string; dataType?: string; volume?: number; encrypted?: boolean };
      return {
        id: `flow_${index}`,
        source: f.source || '',
        destination: f.destination || '',
        dataType: f.dataType || 'Unknown',
        volume: f.volume || 0,
        encrypted: f.encrypted || false
      };
    });
  }

  private mapAssetDependencies(dependencies: unknown[]): AssetDependency[] {
    return dependencies.map((dep, index) => {
      const d = dep as { asset?: string; dependsOn?: string; criticality?: string; type?: string };
      return {
        id: `dep_${index}`,
        asset: d.asset || '',
        dependsOn: d.dependsOn || '',
        criticality: (d.criticality as 'LOW' | 'MEDIUM' | 'HIGH') || 'MEDIUM',
        type: d.type || 'SERVICE'
      };
    });
  }

  private assessAssetExposure(exposure: unknown): AssetExposure {
    const exp = exposure as { internetFacing?: number; publicServices?: number; vulnerableServices?: number; exposureScore?: number };
    return {
      internetFacing: exp.internetFacing || 0,
      publicServices: exp.publicServices || 0,
      vulnerableServices: exp.vulnerableServices || 0,
      exposureScore: exp.exposureScore || 0.3
    };
  }

  private assessBusinessRisk(assets: AssetContext, threats: ThreatContext): BusinessRisk {
    return {
      financialRisk: 'MEDIUM',
      operationalRisk: 'MEDIUM',
      reputationalRisk: 'LOW',
      complianceRisk: 'LOW',
      overallBusinessRisk: 'MEDIUM'
    };
  }

  private assessTechnicalRisk(environment: EnvironmentContext, threats: ThreatContext): TechnicalRisk {
    return {
      infrastructureRisk: 'MEDIUM',
      applicationRisk: 'MEDIUM',
      dataRisk: 'LOW',
      networkRisk: 'MEDIUM',
      overallTechnicalRisk: 'MEDIUM'
    };
  }

  private analyzeRiskTrends(factors: RiskFactor[]): RiskTrend[] {
    return factors.map(factor => ({
      factor: factor.factor,
      historicalValues: [0.3, 0.4, factor.currentValue],
      trend: factor.trend,
      projection: factor.currentValue + (factor.trend === 'INCREASING' ? 0.1 : -0.05)
    }));
  }

  private assessMitigationEffectiveness(operational: OperationalContext): MitigationEffectiveness {
    return {
      preventiveControls: 0.8,
      detectiveControls: 0.7,
      responsiveControls: 0.9,
      overallEffectiveness: 0.8
    };
  }

  private identifyCriticalEvents(threats: ThreatContext, assets: AssetContext): CriticalEvent[] {
    const events: CriticalEvent[] = [];

    // Convert critical threats to events
    for (const threat of threats.currentThreats.filter(t => t.severity === 'CRITICAL')) {
      events.push({
        id: `event_${threat.id}`,
        type: 'THREAT',
        severity: threat.severity,
        title: `Critical Threat: ${threat.type}`,
        description: `Active ${threat.type} threat affecting ${threat.affectedAssets.length} assets`,
        timestamp: threat.lastActivity,
        affectedAssets: threat.affectedAssets,
        status: threat.status
      });
    }

    return events;
  }

  private generateContextualAlerts(
    environment: EnvironmentContext,
    threats: ThreatContext,
    assets: AssetContext
  ): ContextualAlert[] {
    const alerts: ContextualAlert[] = [];

    // Generate alerts based on context
    const criticalAssetThreats = threats.currentThreats.filter(threat =>
      threat.affectedAssets.some(assetId =>
        assets.criticalAssets.some(asset => asset.id === assetId)
      )
    );

    if (criticalAssetThreats.length > 0) {
      alerts.push({
        id: `alert_critical_assets`,
        type: 'ASSET_THREAT',
        severity: 'HIGH',
        title: 'Critical Assets Under Threat',
        message: `${criticalAssetThreats.length} threats targeting critical business assets`,
        timestamp: Date.now(),
        context: {
          threatsCount: criticalAssetThreats.length,
          assetsAffected: assets.criticalAssets.length
        },
        recommendations: ['Enhance monitoring', 'Review access controls', 'Implement additional protections']
      });
    }

    return alerts;
  }

  private analyzeEnvironmentalFactors(environment: EnvironmentContext): EnvironmentalFactor[] {
    const factors: EnvironmentalFactor[] = [];

    // Time-based factors
    if (!environment.timeContext.businessHours) {
      factors.push({
        factor: 'Off-Hours Operation',
        impact: 'MEDIUM',
        description: 'Reduced monitoring and response capability during off-hours',
        recommendations: ['Automated response', 'On-call procedures']
      });
    }

    // Network topology factors
    const insecureSegments = environment.networkTopology.segments.filter(s => s.securityLevel === 'LOW');
    if (insecureSegments.length > 0) {
      factors.push({
        factor: 'Network Security Gaps',
        impact: 'HIGH',
        description: `${insecureSegments.length} network segments with low security levels`,
        recommendations: ['Network hardening', 'Segmentation review']
      });
    }

    return factors;
  }
}

// Main Context Engine
export class SecurityContextEngine extends EventEmitter {
  private analysisEngine: ContextAnalysisEngine;
  private isInitialized: boolean = false;
  private contextCache: Map<string, SecurityContext> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.analysisEngine = new ContextAnalysisEngine();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.isInitialized = true;

      // Start periodic context updates
      this.startPeriodicUpdates();

      this.emit('initialized', {
        capabilities: this.getCapabilities(),
        timestamp: Date.now()
      });

      console.log('🎯 Security Context Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Context Engine:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  async analyzeSecurityContext(data: ContextAnalysisData, contextId?: string): Promise<SecurityContext> {
    if (!this.isInitialized) {
      throw new Error('Context Engine not initialized');
    }

    const startTime = Date.now();
    const id = contextId || `context_${Date.now()}`;

    try {
      // Analyze different context dimensions
      const environment = this.analysisEngine.analyzeEnvironmentContext(data);
      const threats = this.analysisEngine.analyzeThreatContext(data);
      const assets = this.analysisEngine.analyzeAssetContext(data);
      const compliance = this.analyzeComplianceContext(data.compliance || {});
      const operational = this.analyzeOperationalContext(data.operational || {});

      // Assess risk
      const risk = this.analysisEngine.assessRisk(environment, threats, assets, compliance, operational);

      // Generate situational awareness
      const situationalAwareness = this.analysisEngine.generateSituationalAwareness(
        environment, threats, assets, risk
      );

      const context: SecurityContext = {
        id,
        timestamp: Date.now(),
        environment,
        threats,
        assets,
        compliance,
        operational,
        risk,
        situationalAwareness
      };

      // Cache the context
      this.contextCache.set(id, context);

      // Limit cache size
      if (this.contextCache.size > 50) {
        const firstKey = this.contextCache.keys().next().value;
        this.contextCache.delete(firstKey);
      }

      this.emit('context_analyzed', {
        contextId: id,
        alertLevel: situationalAwareness.alertLevel,
        riskLevel: risk.overallRisk,
        processingTime: Date.now() - startTime,
        timestamp: Date.now()
      });

      return context;
    } catch (error) {
      console.error('❌ Context analysis failed:', error);
      this.emit('error', { type: 'context_analysis', error, contextId: id });
      throw error;
    }
  }

  getContextHistory(contextId: string): SecurityContext[] {
    // Return historical contexts for trend analysis
    return Array.from(this.contextCache.values())
      .filter(ctx => ctx.id.startsWith(contextId.split('_')[0]))
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  compareContexts(contextId1: string, contextId2: string): ContextComparison {
    const context1 = this.contextCache.get(contextId1);
    const context2 = this.contextCache.get(contextId2);

    if (!context1 || !context2) {
      throw new Error('One or both contexts not found');
    }

    return {
      riskChange: this.compareRiskLevels(context1.risk, context2.risk),
      threatChange: this.compareThreatLevels(context1.threats, context2.threats),
      alertLevelChange: this.compareAlertLevels(
        context1.situationalAwareness.alertLevel,
        context2.situationalAwareness.alertLevel
      ),
      timeline: {
        from: context1.timestamp,
        to: context2.timestamp,
        duration: context2.timestamp - context1.timestamp
      }
    };
  }

  getCapabilities(): ContextEngineCapabilities {
    return {
      contextAnalysis: {
        environmentalAnalysis: true,
        threatContextualization: true,
        assetRiskAssessment: true,
        complianceMapping: true,
        operationalAwareness: true
      },
      riskAssessment: {
        multiFactorAnalysis: true,
        businessImpactAssessment: true,
        technicalRiskEvaluation: true,
        trendAnalysis: true,
        mitigationEffectiveness: true
      },
      situationalAwareness: {
        alertLevelDetermination: true,
        criticalEventIdentification: true,
        contextualRecommendations: true,
        environmentalFactors: true,
        situationSummary: true
      },
      realTimeCapabilities: {
        continuousContextUpdates: true,
        adaptiveAnalysis: true,
        contextComparison: true,
        historicalAnalysis: true
      }
    };
  }

  getStatistics(): ContextEngineStatistics {
    const alertLevelDistribution: { [key: string]: number } = {
      'RED': 0, 'ORANGE': 0, 'YELLOW': 0, 'GREEN': 0
    };

    const riskLevelDistribution: { [key: string]: number } = {
      'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0
    };

    for (const context of this.contextCache.values()) {
      alertLevelDistribution[context.situationalAwareness.alertLevel]++;
      riskLevelDistribution[context.risk.overallRisk]++;
    }

    return {
      totalContextsAnalyzed: this.contextCache.size,
      alertLevelDistribution,
      riskLevelDistribution,
      isInitialized: this.isInitialized,
      capabilities: this.getCapabilities(),
      timestamp: Date.now()
    };
  }

  private startPeriodicUpdates(): void {
    // Update context every 5 minutes
    this.updateInterval = setInterval(() => {
      this.emit('periodic_update', {
        timestamp: Date.now(),
        activeContexts: this.contextCache.size
      });
    }, 5 * 60 * 1000);
  }

  private analyzeComplianceContext(complianceData: ComplianceData): ComplianceContext {
    return {
      frameworks: complianceData.frameworks || [],
      requirements: complianceData.requirements || [],
      auditStatus: complianceData.auditStatus || { overall: 'COMPLIANT' },
      violations: complianceData.violations || [],
      controlEffectiveness: complianceData.controlEffectiveness || { overall: 0.8 }
    };
  }

  private analyzeOperationalContext(operationalData: OperationalData): OperationalContext {
    return {
      securityPosture: operationalData.securityPosture || { level: 'MEDIUM' },
      incidentHistory: operationalData.incidentHistory || { total: 0, recent: 0 },
      responseCapability: operationalData.responseCapability || { level: 'MEDIUM' },
      monitoringCoverage: operationalData.monitoringCoverage || { percentage: 80 },
      teamCapacity: operationalData.teamCapacity || { utilization: 0.7 }
    };
  }

  private compareRiskLevels(risk1: RiskAssessment, risk2: RiskAssessment): RiskComparison {
    const riskOrder = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    const change = riskOrder[risk2.overallRisk] - riskOrder[risk1.overallRisk];

    return {
      from: risk1.overallRisk,
      to: risk2.overallRisk,
      change: change > 0 ? 'INCREASED' : change < 0 ? 'DECREASED' : 'UNCHANGED',
      magnitude: Math.abs(change)
    };
  }

  private compareThreatLevels(threats1: ThreatContext, threats2: ThreatContext): ThreatComparison {
    return {
      threatCountChange: threats2.currentThreats.length - threats1.currentThreats.length,
      criticalThreatChange: threats2.currentThreats.filter(t => t.severity === 'CRITICAL').length -
        threats1.currentThreats.filter(t => t.severity === 'CRITICAL').length,
      emergingThreatChange: threats2.emergingThreats.length - threats1.emergingThreats.length
    };
  }

  private compareAlertLevels(alert1: AlertLevel, alert2: AlertLevel): AlertComparison {
    const alertOrder = { 'GREEN': 1, 'YELLOW': 2, 'ORANGE': 3, 'RED': 4 };
    const change = alertOrder[alert2] - alertOrder[alert1];

    return {
      from: alert1,
      to: alert2,
      change: change > 0 ? 'ESCALATED' : change < 0 ? 'DE-ESCALATED' : 'UNCHANGED',
      magnitude: Math.abs(change)
    };
  }

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.contextCache.clear();
    this.isInitialized = false;
  }
}

// Export additional interfaces for external use
export type {
  SecurityContext,
  EnvironmentContext,
  ThreatContext,
  AssetContext,
  RiskAssessment,
  SituationalAwareness,
  RiskLevel,
  AlertLevel
};

// Export required interfaces that were referenced but not defined
interface DataClassification {
  confidential: number;
  restricted: number;
  internal: number;
  public: number;
  totalClassified: number;
}

interface BusinessCriticality {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  revenueImpact: number;
  operationalImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  complianceImpact: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface GeographicInfo {
  regions: string[];
  dataResidency: { [region: string]: string[] };
  crossBorderFlows: boolean;
}

interface TimeContext {
  currentTime: number;
  businessHours: boolean;
  timeZone: string;
  season: string;
  isHoliday: boolean;
}

interface NetworkConnection {
  source: string;
  target: string;
  type: string;
  encrypted: boolean;
}

interface SecurityZone {
  id: string;
  name: string;
  securityLevel: string;
  segments: string[];
}

interface PerimeterDefense {
  id: string;
  type: string;
  location: string;
  effectiveness: number;
}

interface ThreatLandscape {
  overallThreatLevel: string;
  dominantThreats: string[];
  threatActors: string[];
  techniques: string[];
  trends: string;
}

interface AttackSurface {
  totalEndpoints: number;
  internetFacingAssets: number;
  vulnerableServices: number;
  riskScore: number;
}

interface VulnerabilityExposure {
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  exploitableVulnerabilities: number;
  exposureScore: number;
}

interface ThreatIntelligence {
  feeds: string[];
  indicators: string[];
  lastUpdated: number;
  reliability: number;
}

interface EmergingThreat {
  id: string;
  name: string;
  description: string;
  confidence: number;
  firstSeen: number;
  indicators: string[];
}

interface AssetRelationship {
  id: string;
  sourceAsset: string;
  targetAsset: string;
  relationshipType: string;
  strength: number;
}

interface BusinessImpact {
  financial: number;
  operational: string;
  reputational: string;
  regulatory: string;
}

interface DataFlow {
  id: string;
  source: string;
  destination: string;
  dataType: string;
  volume: number;
  encrypted: boolean;
}

interface AssetDependency {
  id: string;
  asset: string;
  dependsOn: string;
  criticality: string;
  type: string;
}

interface AssetExposure {
  internetFacing: number;
  publicServices: number;
  vulnerableServices: number;
  exposureScore: number;
}

interface ComplianceFramework {
  name: string;
  version: string;
  applicability: string;
}

interface ComplianceRequirement {
  id: string;
  framework: string;
  requirement: string;
  status: string;
}

interface AuditStatus {
  overall: string;
  lastAudit?: number;
  nextAudit?: number;
}

interface ComplianceViolation {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  framework?: string;
  requirement?: string;
  status?: 'OPEN' | 'RESOLVED' | 'MITIGATED';
  timestamp?: number;
}

interface ControlEffectiveness {
  overall: number;
  byControl?: { [control: string]: number };
}

interface SecurityPosture {
  level: string;
  score?: number;
}

interface IncidentHistory {
  total: number;
  recent: number;
  byType?: { [type: string]: number };
}

interface ResponseCapability {
  level: string;
  resources?: string[];
}

interface MonitoringCoverage {
  percentage: number;
  gaps?: string[];
}

interface TeamCapacity {
  utilization: number;
  available?: number;
}

interface BusinessRisk {
  financialRisk: string;
  operationalRisk: string;
  reputationalRisk: string;
  complianceRisk: string;
  overallBusinessRisk: string;
}

interface TechnicalRisk {
  infrastructureRisk: string;
  applicationRisk: string;
  dataRisk: string;
  networkRisk: string;
  overallTechnicalRisk: string;
}

interface RiskTrend {
  factor: string;
  historicalValues: number[];
  trend: string;
  projection: number;
}

interface MitigationEffectiveness {
  preventiveControls: number;
  detectiveControls: number;
  responsiveControls: number;
  overallEffectiveness: number;
}

interface CriticalEvent {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  timestamp: number;
  affectedAssets: string[];
  status: string;
}

interface ContextualAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  timestamp: number;
  context: AlertContext;
  recommendations: string[];
}

interface EnvironmentalFactor {
  factor: string;
  impact: string;
  description: string;
  recommendations: string[];
}

interface ContextualRecommendation {
  id: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  estimatedEffort: 'HIGH' | 'MEDIUM' | 'LOW';
  expectedImpact: string;
  timeline: string;
  resources: string[];
  dependencies: string[];
}

export default SecurityContextEngine;
