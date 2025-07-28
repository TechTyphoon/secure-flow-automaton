/**
 * Device Trust & Compliance Services
 * Export all device-related services for Zero Trust architecture
 */

export { default as DeviceIdentityService } from './deviceIdentity';
export { default as EDRIntegrationService } from './edrIntegration';
export { default as DeviceComplianceService } from './deviceCompliance';

export type {
  // Device Identity Types
  DeviceIdentity,
  DeviceCertificate,
  DeviceEnrollmentRequest,
  DeviceEnrollmentResponse,
  DeviceAuthentication,
  DeviceAuthenticationResult,
  DeviceLifecycleEvent
} from './deviceIdentity';

export type {
  // EDR Integration Types
  EDRProvider,
  EDRCapability,
  EDREndpoint,
  EDRAlert,
  EDREvidence,
  IOCIndicator,
  EDRResponseAction,
  EDRScanResult,
  EDRComplianceStatus,
  EDRExclusion,
  EDRFinding,
  EDRRequirement,
  EDRTimelineEvent
} from './edrIntegration';

export type {
  // Device Compliance Types
  CompliancePolicy,
  ComplianceRequirement,
  DeviceComplianceStatus,
  PolicyComplianceResult,
  RequirementComplianceResult,
  ComplianceExemption,
  RemediationPlan,
  ComplianceReport,
  ComplianceAction,
  RemediationAction,
  ComplianceChange
} from './deviceCompliance';
