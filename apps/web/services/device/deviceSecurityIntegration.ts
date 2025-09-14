/**
 * Device Security Integration Service
 * Orchestrates all device trust and compliance services for Zero Trust architecture
 * Provides unified interface for device security management
 */

import DeviceIdentityService, {
  type DeviceIdentity,
  type DeviceEnrollmentRequest,
  type DeviceAuthenticationResult
} from './device/deviceIdentity';

import EDRIntegrationService, {
  type EDREndpoint,
  type EDRAlert,
  type EDRScanResult
} from './device/edrIntegration';

import DeviceComplianceService, {
  type DeviceComplianceStatus,
  type ComplianceReport,
  type RemediationPlan
} from './device/deviceCompliance';

export interface DeviceSecurityProfile {
  deviceId: string;
  identity: DeviceIdentity;
  edrStatus: EDREndpoint;
  complianceStatus: DeviceComplianceStatus;
  securityScore: number;
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'critical';
  recommendations: string[];
  lastUpdated: Date;
}

export interface DeviceSecurityMetrics {
  totalDevices: number;
  enrolledDevices: number;
  compliantDevices: number;
  protectedDevices: number;
  averageSecurityScore: number;
  criticalAlerts: number;
  pendingRemediation: number;
  devicesByRiskLevel: Record<string, number>;
  devicesByType: Record<string, number>;
  trendData: {
    enrollmentTrend: { date: Date; count: number }[];
    complianceTrend: { date: Date; score: number }[];
    threatTrend: { date: Date; alerts: number }[];
  };
}

export interface DeviceSecurityDashboard {
  overview: DeviceSecurityMetrics;
  recentAlerts: EDRAlert[];
  complianceViolations: Array<{
    deviceId: string;
    deviceName: string;
    violations: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  remediationQueue: Array<{
    deviceId: string;
    deviceName: string;
    actions: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  recommendations: Array<{
    category: 'enrollment' | 'compliance' | 'security' | 'monitoring';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
}

export interface DeviceTrustAssessment {
  deviceId: string;
  assessmentDate: Date;
  trustFactors: {
    identityVerification: {
      score: number;
      factors: string[];
    };
    compliancePosture: {
      score: number;
      factors: string[];
    };
    securityControls: {
      score: number;
      factors: string[];
    };
    behaviorAnalysis: {
      score: number;
      factors: string[];
    };
    locationContext: {
      score: number;
      factors: string[];
    };
  };
  overallTrustScore: number;
  trustLevel: 'untrusted' | 'limited' | 'conditional' | 'trusted' | 'highly_trusted';
  accessRecommendations: {
    networkAccess: 'deny' | 'limited' | 'standard' | 'privileged';
    resourceAccess: 'minimal' | 'standard' | 'elevated' | 'administrative';
    monitoringLevel: 'basic' | 'enhanced' | 'intensive' | 'real_time';
  };
  conditions: string[];
  validUntil: Date;
}

export class DeviceSecurityIntegrationService {
  private deviceIdentityService: DeviceIdentityService;
  private edrIntegrationService: EDRIntegrationService;
  private deviceComplianceService: DeviceComplianceService;

  constructor() {
    this.deviceIdentityService = new DeviceIdentityService();
    this.edrIntegrationService = new EDRIntegrationService();
    this.deviceComplianceService = new DeviceComplianceService();
  }

  /**
   * Enroll a new device with comprehensive security setup
   */
  async enrollDevice(enrollmentRequest: DeviceEnrollmentRequest): Promise<{
    identityResult: DeviceAuthenticationResult;
    edrResult: EDREndpoint;
    complianceResult: DeviceComplianceStatus;
    securityProfile: DeviceSecurityProfile;
  }> {
    // Step 1: Enroll device identity
    const identityResult = await this.deviceIdentityService.enrollDevice(enrollmentRequest);
    
    if (!identityResult.success || !identityResult.deviceId) {
      throw new Error('Device identity enrollment failed');
    }

    // Step 2: Register with EDR provider
    const edrResult = await this.edrIntegrationService.registerEndpoint(
      identityResult.deviceId,
      'crowdstrike-001', // Default provider
      {
        hostname: enrollmentRequest.deviceInfo.hostname,
        ipAddress: '0.0.0.0', // Will be updated on first check-in
        macAddress: enrollmentRequest.deviceInfo.macAddress,
        os: {
          platform: enrollmentRequest.deviceInfo.os,
          version: enrollmentRequest.deviceInfo.version,
          architecture: 'x64'
        }
      }
    );

    // Step 3: Perform initial compliance assessment
    const complianceResult = await this.deviceComplianceService.assessDeviceCompliance(identityResult.deviceId);

    // Step 4: Create security profile
    const securityProfile = await this.createDeviceSecurityProfile(identityResult.deviceId);

    return {
      identityResult,
      edrResult,
      complianceResult,
      securityProfile
    };
  }

  /**
   * Create comprehensive device security profile
   */
  async createDeviceSecurityProfile(deviceId: string): Promise<DeviceSecurityProfile> {
    const identity = this.deviceIdentityService.getDevice(deviceId);
    const edrStatus = this.edrIntegrationService.getEndpoint(deviceId);
    const complianceStatus = this.deviceComplianceService.getDeviceStatus(deviceId);

    if (!identity || !edrStatus || !complianceStatus) {
      throw new Error('Unable to retrieve complete device information');
    }

    // Calculate overall security score
    const securityScore = this.calculateSecurityScore(identity, edrStatus, complianceStatus);
    const riskLevel = this.calculateRiskLevel(securityScore, edrStatus, complianceStatus);
    const recommendations = this.generateSecurityRecommendations(identity, edrStatus, complianceStatus);

    return {
      deviceId,
      identity,
      edrStatus,
      complianceStatus,
      securityScore,
      riskLevel,
      recommendations,
      lastUpdated: new Date()
    };
  }

  /**
   * Perform comprehensive device trust assessment
   */
  async assessDeviceTrust(deviceId: string): Promise<DeviceTrustAssessment> {
    const securityProfile = await this.createDeviceSecurityProfile(deviceId);
    const { identity, edrStatus, complianceStatus } = securityProfile;

    // Identity verification assessment
    const identityVerification = this.assessIdentityVerification(identity);
    
    // Compliance posture assessment
    const compliancePosture = this.assessCompliancePosture(complianceStatus);
    
    // Security controls assessment
    const securityControls = this.assessSecurityControls(edrStatus);
    
    // Behavior analysis assessment
    const behaviorAnalysis = this.assessBehaviorAnalysis(edrStatus);
    
    // Location context assessment
    const locationContext = this.assessLocationContext(identity);

    // Calculate overall trust score
    const trustFactors = {
      identityVerification,
      compliancePosture,
      securityControls,
      behaviorAnalysis,
      locationContext
    };

    const overallTrustScore = this.calculateTrustScore(trustFactors);
    const trustLevel = this.determineTrustLevel(overallTrustScore);
    const accessRecommendations = this.generateAccessRecommendations(trustLevel, trustFactors);
    const conditions = this.generateTrustConditions(trustFactors);

    return {
      deviceId,
      assessmentDate: new Date(),
      trustFactors,
      overallTrustScore,
      trustLevel,
      accessRecommendations,
      conditions,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }

  /**
   * Generate comprehensive device security dashboard
   */
  generateSecurityDashboard(): DeviceSecurityDashboard {
    const devices = this.deviceIdentityService.getDevices();
    const endpoints = this.edrIntegrationService.getEndpoints();
    const deviceStatuses = this.deviceComplianceService.getAllDeviceStatuses();
    const alerts = this.edrIntegrationService.getAlerts();

    // Calculate overview metrics
    const overview: DeviceSecurityMetrics = {
      totalDevices: devices.length,
      enrolledDevices: devices.filter(d => d.status === 'active').length,
      compliantDevices: deviceStatuses.filter(s => s.overallStatus === 'compliant').length,
      protectedDevices: endpoints.filter(e => e.agent.status === 'online').length,
      averageSecurityScore: this.calculateAverageSecurityScore(devices),
      criticalAlerts: alerts.filter(a => a.severity === 'critical' && a.status === 'new').length,
      pendingRemediation: deviceStatuses.reduce((sum, s) => sum + s.summary.pendingRemediation, 0),
      devicesByRiskLevel: this.calculateDevicesByRiskLevel(devices, endpoints, deviceStatuses),
      devicesByType: devices.reduce((acc, device) => {
        acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      trendData: this.calculateTrendData(devices, deviceStatuses, alerts)
    };

    // Recent critical alerts
    const recentAlerts = alerts
      .filter(a => a.severity === 'critical' || a.severity === 'high')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Compliance violations
    const complianceViolations = deviceStatuses
      .filter(s => s.summary.criticalViolations > 0 || s.summary.nonCompliantPolicies > 0)
      .map(s => ({
        deviceId: s.deviceId,
        deviceName: devices.find(d => d.deviceId === s.deviceId)?.deviceName || 'Unknown',
        violations: s.summary.criticalViolations + s.summary.nonCompliantPolicies,
        severity: s.summary.criticalViolations > 0 ? 'critical' as const :
                 s.summary.nonCompliantPolicies > 2 ? 'high' as const :
                 s.summary.nonCompliantPolicies > 1 ? 'medium' as const : 'low' as const
      }))
      .sort((a, b) => b.violations - a.violations)
      .slice(0, 10);

    // Remediation queue
    const remediationQueue = deviceStatuses
      .filter(s => s.summary.pendingRemediation > 0)
      .map(s => ({
        deviceId: s.deviceId,
        deviceName: devices.find(d => d.deviceId === s.deviceId)?.deviceName || 'Unknown',
        actions: s.summary.pendingRemediation,
        priority: s.summary.criticalViolations > 0 ? 'critical' as const :
                 s.complianceScore < 70 ? 'high' as const :
                 s.complianceScore < 85 ? 'medium' as const : 'low' as const
      }))
      .sort((a, b) => b.actions - a.actions)
      .slice(0, 10);

    // Generate recommendations
    const recommendations = this.generateDashboardRecommendations(overview, complianceViolations, remediationQueue);

    return {
      overview,
      recentAlerts,
      complianceViolations,
      remediationQueue,
      recommendations
    };
  }

  /**
   * Orchestrate automated remediation across all services
   */
  async orchestrateRemediation(deviceId: string): Promise<{
    complianceRemediation?: RemediationPlan;
    edrActions: string[];
    identityActions: string[];
    summary: {
      totalActions: number;
      automaticActions: number;
      manualActions: number;
      estimatedTime: number;
    };
  }> {
    const complianceStatus = this.deviceComplianceService.getDeviceStatus(deviceId);
    const edrEndpoint = this.edrIntegrationService.getEndpoint(deviceId);
    
    if (!complianceStatus || !edrEndpoint) {
      throw new Error('Device not found in security systems');
    }

    const results = {
      edrActions: [] as string[],
      identityActions: [] as string[],
      summary: {
        totalActions: 0,
        automaticActions: 0,
        manualActions: 0,
        estimatedTime: 0
      }
    } as any;

    // Handle compliance remediation
    if (complianceStatus.summary.pendingRemediation > 0) {
      const nonCompliantPolicies = complianceStatus.policies.filter(p => p.status === 'non_compliant');
      
      for (const policy of nonCompliantPolicies) {
        try {
          const remediationPlan = await this.deviceComplianceService.executeRemediation(
            deviceId,
            policy.policyId
          );
          results.complianceRemediation = remediationPlan;
          results.summary.totalActions += remediationPlan.actions.length;
          results.summary.automaticActions += remediationPlan.actions.filter(a => a.type !== 'notify').length;
          results.summary.estimatedTime += 5; // 5 minutes per policy
        } catch (error) {
          console.error(`Failed to execute remediation for policy ${policy.policyId}:`, error);
        }
      }
    }

    // Handle EDR actions
    if (edrEndpoint.agent.status !== 'online') {
      results.edrActions.push('Restart EDR agent');
      results.summary.totalActions++;
      results.summary.manualActions++;
    }

    if (edrEndpoint.riskScore > 50) {
      results.edrActions.push('Perform full system scan');
      results.summary.totalActions++;
      results.summary.automaticActions++;
      results.summary.estimatedTime += 30; // 30 minutes for scan
    }

    // Handle identity actions
    const device = this.deviceIdentityService.getDevice(deviceId);
    if (device && device.trustLevel === 'low') {
      results.identityActions.push('Require additional authentication');
      results.identityActions.push('Update device certificates');
      results.summary.totalActions += 2;
      results.summary.manualActions += 2;
    }

    return results;
  }

  /**
   * Helper methods for calculations and assessments
   */
  private calculateSecurityScore(
    identity: DeviceIdentity,
    edrStatus: EDREndpoint,
    complianceStatus: DeviceComplianceStatus
  ): number {
    let score = 0;
    let weight = 0;

    // Identity score (25% weight)
    const identityScore = this.getIdentityScore(identity);
    score += identityScore * 0.25;
    weight += 0.25;

    // EDR score (35% weight)
    const edrScore = this.getEDRScore(edrStatus);
    score += edrScore * 0.35;
    weight += 0.35;

    // Compliance score (40% weight)
    score += complianceStatus.complianceScore * 0.40;
    weight += 0.40;

    return Math.round(score / weight);
  }

  private getIdentityScore(identity: DeviceIdentity): number {
    let score = 50; // Base score

    // Trust level adjustment
    switch (identity.trustLevel) {
      case 'critical': score += 40; break;
      case 'high': score += 30; break;
      case 'medium': score += 15; break;
      case 'low': score -= 10; break;
      case 'unknown': score -= 25; break;
    }

    // Hardware security features
    if (identity.hardware.tpmPresent) score += 10;
    if (identity.hardware.secureBootEnabled) score += 10;

    // Certificate status
    const validCerts = identity.certificates.filter(c => c.status === 'valid').length;
    score += validCerts * 5;

    // Device age (newer devices get higher scores)
    const daysSinceEnrollment = (Date.now() - identity.enrollmentDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceEnrollment < 30) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private getEDRScore(edrStatus: EDREndpoint): number {
    let score = 50; // Base score

    // Agent status
    switch (edrStatus.agent.status) {
      case 'online': score += 30; break;
      case 'offline': score -= 20; break;
      case 'error': score -= 30; break;
      case 'installing': score += 10; break;
    }

    // Configuration
    if (edrStatus.agent.configuration.realTimeProtection) score += 15;
    if (edrStatus.agent.configuration.behaviorMonitoring) score += 10;
    if (edrStatus.agent.configuration.networkInspection) score += 10;
    if (edrStatus.agent.configuration.cloudAnalysis) score += 5;

    // Risk and threat level
    score -= edrStatus.riskScore / 2;
    
    switch (edrStatus.threatLevel) {
      case 'none': score += 10; break;
      case 'low': score += 5; break;
      case 'medium': score -= 10; break;
      case 'high': score -= 20; break;
      case 'critical': score -= 40; break;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateRiskLevel(
    securityScore: number,
    edrStatus: EDREndpoint,
    complianceStatus: DeviceComplianceStatus
  ): DeviceSecurityProfile['riskLevel'] {
    // Critical conditions override everything
    if (
      edrStatus.threatLevel === 'critical' ||
      complianceStatus.summary.criticalViolations > 2 ||
      securityScore < 30
    ) {
      return 'critical';
    }

    if (
      edrStatus.threatLevel === 'high' ||
      complianceStatus.summary.criticalViolations > 0 ||
      securityScore < 50
    ) {
      return 'very_high';
    }

    if (
      edrStatus.threatLevel === 'medium' ||
      complianceStatus.overallStatus === 'non_compliant' ||
      securityScore < 65
    ) {
      return 'high';
    }

    if (
      edrStatus.threatLevel === 'low' ||
      complianceStatus.overallStatus === 'partial' ||
      securityScore < 80
    ) {
      return 'medium';
    }

    if (securityScore < 90) {
      return 'low';
    }

    return 'very_low';
  }

  private generateSecurityRecommendations(
    identity: DeviceIdentity,
    edrStatus: EDREndpoint,
    complianceStatus: DeviceComplianceStatus
  ): string[] {
    const recommendations: string[] = [];

    // Identity recommendations
    if (identity.trustLevel === 'low' || identity.trustLevel === 'unknown') {
      recommendations.push('Improve device trust level through compliance and security controls');
    }

    if (!identity.hardware.tpmPresent) {
      recommendations.push('Consider upgrading to hardware with TPM support');
    }

    const expiredCerts = identity.certificates.filter(c => c.status === 'expired').length;
    if (expiredCerts > 0) {
      recommendations.push(`Renew ${expiredCerts} expired certificates`);
    }

    // EDR recommendations
    if (edrStatus.agent.status !== 'online') {
      recommendations.push('Ensure EDR agent is online and communicating');
    }

    if (!edrStatus.agent.configuration.realTimeProtection) {
      recommendations.push('Enable real-time protection in EDR agent');
    }

    if (edrStatus.riskScore > 30) {
      recommendations.push('Investigate and remediate elevated risk indicators');
    }

    // Compliance recommendations
    if (complianceStatus.summary.criticalViolations > 0) {
      recommendations.push(`Address ${complianceStatus.summary.criticalViolations} critical compliance violations immediately`);
    }

    if (complianceStatus.summary.pendingRemediation > 0) {
      recommendations.push(`Execute ${complianceStatus.summary.pendingRemediation} pending automatic remediations`);
    }

    if (complianceStatus.complianceScore < 80) {
      recommendations.push('Improve overall compliance score through policy adherence');
    }

    return recommendations;
  }

  // Additional helper methods for trust assessment
  private assessIdentityVerification(identity: DeviceIdentity) {
    let score = 50;
    const factors: string[] = [];

    if (identity.hardware.tpmPresent) {
      score += 20;
      factors.push('TPM hardware security module present');
    }

    if (identity.hardware.secureBootEnabled) {
      score += 15;
      factors.push('Secure boot enabled');
    }

    const validCerts = identity.certificates.filter(c => c.status === 'valid').length;
    if (validCerts > 0) {
      score += validCerts * 10;
      factors.push(`${validCerts} valid certificates installed`);
    }

    if (identity.ownership === 'corporate') {
      score += 10;
      factors.push('Corporate-owned device');
    }

    return { score: Math.min(100, score), factors };
  }

  private assessCompliancePosture(complianceStatus: DeviceComplianceStatus) {
    const score = complianceStatus.complianceScore;
    const factors: string[] = [];

    if (complianceStatus.summary.compliantPolicies > 0) {
      factors.push(`${complianceStatus.summary.compliantPolicies} policies compliant`);
    }

    if (complianceStatus.summary.criticalViolations === 0) {
      factors.push('No critical violations');
    } else {
      factors.push(`${complianceStatus.summary.criticalViolations} critical violations`);
    }

    if (complianceStatus.summary.exemptedPolicies > 0) {
      factors.push(`${complianceStatus.summary.exemptedPolicies} policies exempted`);
    }

    return { score, factors };
  }

  private assessSecurityControls(edrStatus: EDREndpoint) {
    let score = 30;
    const factors: string[] = [];

    if (edrStatus.agent.status === 'online') {
      score += 25;
      factors.push('EDR agent online and communicating');
    }

    if (edrStatus.agent.configuration.realTimeProtection) {
      score += 20;
      factors.push('Real-time protection enabled');
    }

    if (edrStatus.agent.configuration.behaviorMonitoring) {
      score += 15;
      factors.push('Behavior monitoring active');
    }

    if (edrStatus.threatLevel === 'none') {
      score += 10;
      factors.push('No active threats detected');
    }

    return { score: Math.min(100, score), factors };
  }

  private assessBehaviorAnalysis(edrStatus: EDREndpoint) {
    let score = 70; // Default neutral score
    const factors: string[] = [];

    // Risk score affects behavior assessment
    score -= edrStatus.riskScore / 2;

    const hoursSinceLastScan = (Date.now() - edrStatus.lastScan.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastScan < 24) {
      score += 10;
      factors.push('Recent security scan completed');
    }

    if (edrStatus.threatLevel === 'none') {
      factors.push('Normal behavior patterns observed');
    } else {
      factors.push(`Behavior anomalies detected (${edrStatus.threatLevel} threat level)`);
    }

    return { score: Math.max(0, Math.min(100, score)), factors };
  }

  private assessLocationContext(identity: DeviceIdentity) {
    let score = 50; // Neutral default
    const factors: string[] = [];

    // Check last seen timing
    const hoursSinceLastSeen = (Date.now() - identity.lastSeen.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSeen < 1) {
      score += 20;
      factors.push('Recently active on network');
    } else if (hoursSinceLastSeen > 72) {
      score -= 15;
      factors.push('Extended absence from network');
    }

    if (identity.metadata.location) {
      score += 15;
      factors.push(`Registered location: ${identity.metadata.location}`);
    }

    return { score: Math.max(0, Math.min(100, score)), factors };
  }

  private calculateTrustScore(trustFactors: DeviceTrustAssessment['trustFactors']): number {
    const weights = {
      identityVerification: 0.25,
      compliancePosture: 0.30,
      securityControls: 0.25,
      behaviorAnalysis: 0.15,
      locationContext: 0.05
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [factor, weight] of Object.entries(weights)) {
      const factorScore = trustFactors[factor as keyof typeof trustFactors].score;
      totalScore += factorScore * weight;
      totalWeight += weight;
    }

    return Math.round(totalScore / totalWeight);
  }

  private determineTrustLevel(trustScore: number): DeviceTrustAssessment['trustLevel'] {
    if (trustScore >= 90) return 'highly_trusted';
    if (trustScore >= 75) return 'trusted';
    if (trustScore >= 60) return 'conditional';
    if (trustScore >= 40) return 'limited';
    return 'untrusted';
  }

  private generateAccessRecommendations(
    trustLevel: DeviceTrustAssessment['trustLevel'],
    trustFactors: DeviceTrustAssessment['trustFactors']
  ): DeviceTrustAssessment['accessRecommendations'] {
    const baseRecommendations = {
      networkAccess: 'limited' as const,
      resourceAccess: 'minimal' as const,
      monitoringLevel: 'enhanced' as const
    };

    switch (trustLevel) {
      case 'highly_trusted':
        return {
          networkAccess: 'privileged',
          resourceAccess: 'elevated',
          monitoringLevel: 'basic'
        };
      case 'trusted':
        return {
          networkAccess: 'standard',
          resourceAccess: 'standard',
          monitoringLevel: 'basic'
        };
      case 'conditional':
        return {
          networkAccess: 'limited',
          resourceAccess: 'standard',
          monitoringLevel: 'enhanced'
        };
      case 'limited':
        return {
          networkAccess: 'limited',
          resourceAccess: 'minimal',
          monitoringLevel: 'intensive'
        };
      case 'untrusted':
        return {
          networkAccess: 'deny',
          resourceAccess: 'minimal',
          monitoringLevel: 'real_time'
        };
      default:
        return baseRecommendations;
    }
  }

  private generateTrustConditions(trustFactors: DeviceTrustAssessment['trustFactors']): string[] {
    const conditions: string[] = [];

    if (trustFactors.compliancePosture.score < 80) {
      conditions.push('Must maintain compliance score above 80%');
    }

    if (trustFactors.securityControls.score < 70) {
      conditions.push('All security controls must be active and functional');
    }

    if (trustFactors.behaviorAnalysis.score < 60) {
      conditions.push('Continuous behavior monitoring required');
    }

    conditions.push('Regular security assessments required');
    conditions.push('Must comply with all applicable security policies');

    return conditions;
  }

  private calculateAverageSecurityScore(devices: DeviceIdentity[]): number {
    if (devices.length === 0) return 0;
    
    const scores = devices.map(device => {
      const edrStatus = this.edrIntegrationService.getEndpoint(device.deviceId);
      const complianceStatus = this.deviceComplianceService.getDeviceStatus(device.deviceId);
      
      if (edrStatus && complianceStatus) {
        return this.calculateSecurityScore(device, edrStatus, complianceStatus);
      }
      return 50; // Default neutral score
    });

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  private calculateDevicesByRiskLevel(
    devices: DeviceIdentity[],
    endpoints: EDREndpoint[],
    deviceStatuses: DeviceComplianceStatus[]
  ): Record<string, number> {
    const riskLevels = { very_low: 0, low: 0, medium: 0, high: 0, very_high: 0, critical: 0 };

    devices.forEach(device => {
      const edrStatus = endpoints.find(e => e.deviceId === device.deviceId);
      const complianceStatus = deviceStatuses.find(s => s.deviceId === device.deviceId);
      
      if (edrStatus && complianceStatus) {
        const securityScore = this.calculateSecurityScore(device, edrStatus, complianceStatus);
        const riskLevel = this.calculateRiskLevel(securityScore, edrStatus, complianceStatus);
        riskLevels[riskLevel]++;
      }
    });

    return riskLevels;
  }

  private calculateTrendData(
    devices: DeviceIdentity[],
    deviceStatuses: DeviceComplianceStatus[],
    alerts: EDRAlert[]
  ): DeviceSecurityMetrics['trendData'] {
    // Simplified trend calculation - in production would use historical data
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    return {
      enrollmentTrend: [
        { date: fourteenDaysAgo, count: Math.floor(devices.length * 0.7) },
        { date: sevenDaysAgo, count: Math.floor(devices.length * 0.85) },
        { date: now, count: devices.length }
      ],
      complianceTrend: [
        { date: fourteenDaysAgo, score: 75 },
        { date: sevenDaysAgo, score: 78 },
        { date: now, score: this.calculateAverageCompliance(deviceStatuses) }
      ],
      threatTrend: [
        { date: fourteenDaysAgo, alerts: Math.floor(alerts.length * 1.2) },
        { date: sevenDaysAgo, alerts: Math.floor(alerts.length * 1.1) },
        { date: now, alerts: alerts.length }
      ]
    };
  }

  private calculateAverageCompliance(deviceStatuses: DeviceComplianceStatus[]): number {
    if (deviceStatuses.length === 0) return 0;
    return Math.round(
      deviceStatuses.reduce((sum, status) => sum + status.complianceScore, 0) / deviceStatuses.length
    );
  }

  private generateDashboardRecommendations(
    overview: DeviceSecurityMetrics,
    violations: ComplianceViolation[],
    remediation: RemediationAction[]
  ): DeviceSecurityDashboard['recommendations'] {
    const recommendations: DeviceSecurityDashboard['recommendations'] = [];

    if (overview.criticalAlerts > 0) {
      recommendations.push({
        category: 'security',
        priority: 'critical',
        description: `${overview.criticalAlerts} critical security alerts require immediate investigation`,
        impact: 'Potential compromise or data loss',
        effort: 'high'
      });
    }

    if (overview.pendingRemediation > 5) {
      recommendations.push({
        category: 'compliance',
        priority: 'high',
        description: `${overview.pendingRemediation} automated remediations are pending execution`,
        impact: 'Improved compliance scores and security posture',
        effort: 'low'
      });
    }

    if (overview.averageSecurityScore < 70) {
      recommendations.push({
        category: 'security',
        priority: 'high',
        description: 'Average security score is below recommended threshold',
        impact: 'Enhanced overall security posture',
        effort: 'medium'
      });
    }

    if (violations.length > 10) {
      recommendations.push({
        category: 'compliance',
        priority: 'medium',
        description: 'Multiple devices have compliance violations that need attention',
        impact: 'Reduced compliance risk and improved audit readiness',
        effort: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Public accessor methods
   */
  getDeviceIdentityService(): DeviceIdentityService {
    return this.deviceIdentityService;
  }

  getEDRIntegrationService(): EDRIntegrationService {
    return this.edrIntegrationService;
  }

  getDeviceComplianceService(): DeviceComplianceService {
    return this.deviceComplianceService;
  }
}

// Type definitions for device security integration
interface ComplianceViolation {
  deviceId: string;
  violationType: string;
  severity: string;
  description: string;
  [key: string]: unknown;
}

interface RemediationAction {
  deviceId: string;
  actionType: string;
  priority: string;
  description: string;
  [key: string]: unknown;
}

export default DeviceSecurityIntegrationService;
