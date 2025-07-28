/**
 * Data Security Services Index
 * Exports all data protection and classification services
 */

// Data Classification Services
export { 
  default as DataClassificationService,
  type DataClassification,
  type DataAsset,
  type ClassificationRule,
  type DataDiscoveryResult,
  type ComplianceRequirement,
  type DataHandlingRequirements,
  type DataRetentionPolicy,
  type PersonalDataElement,
  type DataLineage,
  type DataProtectionStatus,
  type ComplianceStatus
} from './dataClassification';

// Data Loss Prevention Services  
export {
  default as DLPService,
  type DLPPolicy,
  type DLPIncident,
  type DLPProtectionProfile,
  type DLPConfiguration,
  type DLPMonitoringResult,
  type DLPScope,
  type DLPChannel,
  type DLPCondition,
  type DLPAction,
  type DLPException,
  type DLPNotification
} from './dlpService';

// Data Encryption Services
export {
  default as DataEncryptionService,
  type EncryptionConfiguration,
  type EncryptionKey,
  type EncryptionOperation,
  type EncryptedData,
  type KeyRotationPolicy,
  type HSMConfiguration
} from './dataEncryption';

// Import services for internal use
import DataClassificationService from './dataClassification';
import DLPService from './dlpService';
import DataEncryptionService from './dataEncryption';

/**
 * Data Security Service Factory
 * Creates and configures data security services
 */
export class DataSecurityServiceFactory {
  private static instance: DataSecurityServiceFactory;
  
  private dataClassificationService?: DataClassificationService;
  private dlpService?: DLPService;
  private dataEncryptionService?: DataEncryptionService;

  private constructor() {}

  static getInstance(): DataSecurityServiceFactory {
    if (!DataSecurityServiceFactory.instance) {
      DataSecurityServiceFactory.instance = new DataSecurityServiceFactory();
    }
    return DataSecurityServiceFactory.instance;
  }

  getDataClassificationService(): DataClassificationService {
    if (!this.dataClassificationService) {
      this.dataClassificationService = new DataClassificationService();
    }
    return this.dataClassificationService;
  }

  getDLPService(): DLPService {
    if (!this.dlpService) {
      this.dlpService = new DLPService();
    }
    return this.dlpService;
  }

  getDataEncryptionService(): DataEncryptionService {
    if (!this.dataEncryptionService) {
      this.dataEncryptionService = new DataEncryptionService();
    }
    return this.dataEncryptionService;
  }

  /**
   * Initialize all data security services
   */
  initializeServices(): {
    classification: DataClassificationService;
    dlp: DLPService;
    encryption: DataEncryptionService;
  } {
    return {
      classification: this.getDataClassificationService(),
      dlp: this.getDLPService(),
      encryption: this.getDataEncryptionService()
    };
  }

  /**
   * Generate comprehensive data security report
   */
  generateDataSecurityReport(): {
    classification: {
      totalAssets: number;
      complianceScore: number;
      riskAreas: string[];
    };
    dlp: {
      totalPolicies: number;
      activeIncidents: number;
      blockedTransmissions: number;
    };
    encryption: {
      totalKeys: number;
      activeKeys: number;
      rotationsPending: number;
    };
    overallScore: number;
    recommendations: string[];
  } {
    const classificationService = this.getDataClassificationService();
    const dlpService = this.getDLPService();
    const encryptionService = this.getDataEncryptionService();

    // Get individual reports
    const classificationReport = classificationService.generateComplianceReport();
    const dlpIncidents = dlpService.getIncidents();
    const encryptionReport = encryptionService.generateEncryptionReport();

    // Classification metrics
    const classification = {
      totalAssets: classificationReport.summary.totalAssets,
      complianceScore: classificationReport.summary.complianceScore,
      riskAreas: classificationReport.riskAreas
    };

    // DLP metrics
    const dlp = {
      totalPolicies: dlpService.getPolicies().length,
      activeIncidents: dlpIncidents.filter(i => i.status === 'new' || i.status === 'investigating').length,
      blockedTransmissions: dlpIncidents.filter(i => 
        i.actions.some(a => a.type === 'block' && a.status === 'completed')
      ).length
    };

    // Encryption metrics
    const encryption = {
      totalKeys: encryptionReport.summary.totalKeys,
      activeKeys: encryptionReport.summary.activeKeys,
      rotationsPending: encryptionReport.rotationSchedule.filter(r => r.daysUntilRotation <= 30).length
    };

    // Calculate overall security score
    const classificationWeight = 0.4;
    const dlpWeight = 0.3;
    const encryptionWeight = 0.3;

    const dlpScore = Math.max(0, 100 - (dlp.activeIncidents * 10)); // Penalty for active incidents
    const encryptionScore = encryptionReport.summary.successRate;

    const overallScore = Math.round(
      classification.complianceScore * classificationWeight +
      dlpScore * dlpWeight +
      encryptionScore * encryptionWeight
    );

    // Aggregate recommendations
    const recommendations = [
      ...classificationReport.recommendations,
      ...encryptionReport.recommendations
    ];

    if (dlp.activeIncidents > 5) {
      recommendations.push('High number of active DLP incidents - review policies and training');
    }

    if (encryption.rotationsPending > 3) {
      recommendations.push('Multiple encryption keys pending rotation - schedule maintenance window');
    }

    return {
      classification,
      dlp,
      encryption,
      overallScore,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }
}

export default DataSecurityServiceFactory;
