/**
 * Network Micro-Segmentation Service Index
 * Exports all network security services for Phase 4.2
 */

import SoftwareDefinedPerimeter from './sdpService';
import NetworkAccessController from './nacService';
import MicroSegmentationEngine from './microSegmentation';
import EastWestTrafficInspector from './trafficInspection';
import DynamicPolicyEngine from './policyEngine';

export { SoftwareDefinedPerimeter, NetworkAccessController, MicroSegmentationEngine, EastWestTrafficInspector, DynamicPolicyEngine };

// Type exports
export type {
  // SDP Types
  SDPController,
  SDPGateway,
  SDPClient,
  SDPPolicy,
  SDPTunnel
} from './sdpService';

export type {
  // NAC Types
  NetworkDevice,
  DeviceCompliance,
  NetworkPolicy,
  NetworkSegment,
  AccessRequest
} from './nacService';

export type {
  // Micro-segmentation Types
  MicroSegment,
  SegmentationPolicy,
  TrafficFlow,
  SegmentationMetrics,
  SecurityEvent
} from './microSegmentation';

export type {
  // Traffic Inspection Types
  InspectionRule,
  InspectedTraffic,
  ThreatDetection,
  AnomalyDetection,
  InspectionMetrics
} from './trafficInspection';

export type {
  // Policy Engine Types
  PolicyRule,
  PolicyEvaluation,
  PolicyViolation,
  AdaptivePolicyRecommendation,
  PolicyMetrics
} from './policyEngine';

/**
 * Unified Network Security Service
 * Orchestrates all network micro-segmentation components
 */
export class NetworkMicroSegmentationService {
  private sdp: SoftwareDefinedPerimeter;
  private nac: NetworkAccessController;
  private microSegmentation: MicroSegmentationEngine;
  private trafficInspector: EastWestTrafficInspector;
  private policyEngine: DynamicPolicyEngine;

  constructor() {
    this.sdp = new SoftwareDefinedPerimeter();
    this.nac = new NetworkAccessController();
    this.microSegmentation = new MicroSegmentationEngine();
    this.trafficInspector = new EastWestTrafficInspector();
    this.policyEngine = new DynamicPolicyEngine();
  }

  /**
   * Get comprehensive network security status
   */
  async getNetworkSecurityStatus(): Promise<{
    sdp: ReturnType<SoftwareDefinedPerimeter['getInfrastructureStatus']>;
    nac: ReturnType<NetworkAccessController['getAccessStatistics']>;
    microSegmentation: ReturnType<MicroSegmentationEngine['getSegmentationMetrics']>;
    trafficInspection: ReturnType<EastWestTrafficInspector['getInspectionMetrics']>;
    policyEngine: ReturnType<DynamicPolicyEngine['getPolicyMetrics']>;
    overallSecurity: {
      score: number;
      level: 'low' | 'medium' | 'high' | 'critical';
      recommendations: string[];
    };
  }> {
    const sdpStatus = this.sdp.getInfrastructureStatus();
    const nacStats = this.nac.getAccessStatistics();
    const microSegStats = this.microSegmentation.getSegmentationMetrics();
    const inspectionMetrics = this.trafficInspector.getInspectionMetrics();
    const policyMetrics = this.policyEngine.getPolicyMetrics();

    // Calculate overall security score
    const securityFactors = [
      { weight: 0.2, score: (sdpStatus.activeTunnels / Math.max(sdpStatus.controllers.length * 100, 1)) * 100 },
      { weight: 0.2, score: (nacStats.compliantDevices / Math.max(nacStats.totalDevices, 1)) * 100 },
      { weight: 0.2, score: microSegStats.complianceScore },
      { weight: 0.2, score: Math.max(0, 100 - (inspectionMetrics.threatsDetected * 10)) },
      { weight: 0.2, score: policyMetrics.userExperienceScore }
    ];

    const overallScore = securityFactors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);
    
    let securityLevel: 'low' | 'medium' | 'high' | 'critical';
    if (overallScore >= 90) securityLevel = 'critical';
    else if (overallScore >= 75) securityLevel = 'high';
    else if (overallScore >= 50) securityLevel = 'medium';
    else securityLevel = 'low';

    const recommendations = [
      ...(overallScore < 80 ? ['Consider reviewing and updating security policies'] : []),
      ...(inspectionMetrics.threatsDetected > 5 ? ['Investigate recent threat detections'] : []),
      ...(nacStats.quarantinedDevices > 0 ? ['Review quarantined devices for compliance'] : []),
      ...(microSegStats.policyViolations > 10 ? ['Address micro-segmentation policy violations'] : [])
    ];

    return {
      sdp: sdpStatus,
      nac: nacStats,
      microSegmentation: microSegStats,
      trafficInspection: inspectionMetrics,
      policyEngine: policyMetrics,
      overallSecurity: {
        score: Math.round(overallScore),
        level: securityLevel,
        recommendations
      }
    };
  }

  /**
   * Process comprehensive access request
   */
  async processAccessRequest(request: {
    userId: string;
    deviceId: string;
    sourceIp: string;
    destinationService: string;
    requestedActions: string[];
  }): Promise<{
    allowed: boolean;
    requirements: string[];
    restrictions: string[];
    monitoring: string[];
    reason: string;
  }> {
    // Evaluate through policy engine
    const policyEvaluation = await this.policyEngine.evaluateAccess(
      {
        userId: request.userId,
        deviceId: request.deviceId,
        ipAddress: request.sourceIp
      },
      {
        type: 'application',
        identifier: request.destinationService
      }
    );

    // Check NAC compliance
    const deviceCompliance = this.nac.getDeviceCompliance(request.deviceId);
    
    // Evaluate micro-segmentation
    const segmentationResult = await this.microSegmentation.evaluateTrafficFlow(
      'user-segment',
      'service-segment',
      'tcp',
      443,
      request.userId
    );

    // Combine results
    const allowed = policyEvaluation.evaluation.result === 'allow' && 
                   segmentationResult.allowed &&
                   (deviceCompliance?.isCompliant !== false);

    const requirements: string[] = [];
    const restrictions: string[] = [];
    const monitoring: string[] = [];

    if (policyEvaluation.evaluation.enforcedActions.includes('require-mfa')) {
      requirements.push('Multi-factor authentication required');
    }

    if (!deviceCompliance?.isCompliant) {
      requirements.push('Device compliance validation required');
    }

    if (policyEvaluation.evaluation.riskScore > 50) {
      monitoring.push('Enhanced monitoring enabled');
    }

    return {
      allowed,
      requirements,
      restrictions,
      monitoring,
      reason: allowed ? 'Access granted based on security policies' : 'Access denied due to policy violations'
    };
  }

  /**
   * Get service instances for detailed operations
   */
  getServices() {
    return {
      sdp: this.sdp,
      nac: this.nac,
      microSegmentation: this.microSegmentation,
      trafficInspector: this.trafficInspector,
      policyEngine: this.policyEngine
    };
  }
}

export default NetworkMicroSegmentationService;
