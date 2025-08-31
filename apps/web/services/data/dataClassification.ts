/**
 * Data Classification Service
 * Implements comprehensive data discovery, classification, and labeling
 * Provides automated data sensitivity assessment and compliance mapping
 */

export interface DataClassification {
  id: string;
  name: string;
  level: 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
  category: 'personal' | 'financial' | 'healthcare' | 'intellectual_property' | 'operational' | 'regulatory' | 'other';
  sensitivity: number; // 0-100
  description: string;
  compliance: ComplianceRequirement[];
  handling: DataHandlingRequirements;
  retention: DataRetentionPolicy;
  metadata: {
    createdBy: string;
    createdDate: Date;
    lastModified: Date;
    version: string;
    approver?: string;
    approvalDate?: Date;
  };
}

export interface ComplianceRequirement {
  framework: 'gdpr' | 'hipaa' | 'pci_dss' | 'sox' | 'iso27001' | 'ccpa' | 'ferpa' | 'custom';
  requirement: string;
  mandatory: boolean;
  controls: string[];
  auditRequired: boolean;
}

export interface DataHandlingRequirements {
  encryption: {
    atRest: boolean;
    inTransit: boolean;
    algorithm: string;
    keyLength: number;
  };
  access: {
    authentication: 'basic' | 'mfa' | 'certificate' | 'biometric';
    authorization: 'rbac' | 'abac' | 'mac' | 'dac';
    minimumClearance: string[];
    needToKnow: boolean;
  };
  storage: {
    location: 'onpremise' | 'cloud' | 'hybrid' | 'restricted';
    geography: string[];
    backup: boolean;
    replication: boolean;
  };
  sharing: {
    internal: boolean;
    external: boolean;
    anonymization: boolean;
    watermarking: boolean;
    dlp: boolean;
  };
}

export interface DataRetentionPolicy {
  retentionPeriod: number; // days
  archivePeriod?: number; // days
  destructionRequired: boolean;
  destructionMethod: 'secure_delete' | 'cryptographic_erasure' | 'physical_destruction';
  legalHold: boolean;
  exceptions: string[];
}

export interface DataAsset {
  id: string;
  name: string;
  type: 'file' | 'database' | 'stream' | 'document' | 'message' | 'email' | 'image' | 'video' | 'audio';
  location: {
    system: string;
    path: string;
    container?: string;
    database?: string;
    table?: string;
  };
  classification: DataClassification;
  owner: {
    business: string;
    technical: string;
    steward: string;
  };
  discovery: {
    method: 'manual' | 'automated' | 'ml_classification' | 'pattern_matching';
    discoveredDate: Date;
    lastScanned: Date;
    confidence: number; // 0-100
  };
  content: {
    size: number; // bytes
    format: string;
    schema?: DataSchema;
    sampleData?: string;
    personalDataElements: PersonalDataElement[];
  };
  lineage: DataLineage;
  protection: DataProtectionStatus;
  compliance: ComplianceStatus;
}

export interface DataSchema {
  fields: DataField[];
  relationships: DataRelationship[];
  constraints: DataConstraint[];
}

export interface DataField {
  name: string;
  type: string;
  nullable: boolean;
  classification: string;
  sensitivity: number;
  personalData: boolean;
  patterns: string[];
}

export interface DataRelationship {
  type: 'foreign_key' | 'reference' | 'dependency' | 'derived';
  source: string;
  target: string;
  description: string;
}

export interface DataConstraint {
  type: 'primary_key' | 'unique' | 'check' | 'not_null' | 'format';
  field: string;
  rule: string;
}

export interface PersonalDataElement {
  type: 'name' | 'email' | 'phone' | 'ssn' | 'address' | 'dob' | 'passport' | 'credit_card' | 'biometric' | 'health' | 'custom';
  field: string;
  confidence: number;
  masking: 'none' | 'partial' | 'full' | 'tokenization' | 'encryption';
  purpose: string[];
  consent: boolean;
  lawfulBasis?: string;
}

export interface DataLineage {
  sources: DataLineageNode[];
  transformations: DataTransformation[];
  destinations: DataLineageNode[];
  lastUpdated: Date;
}

export interface DataLineageNode {
  system: string;
  location: string;
  type: 'source' | 'intermediate' | 'destination';
  timestamp: Date;
}

export interface DataTransformation {
  type: 'extract' | 'transform' | 'load' | 'aggregate' | 'filter' | 'join' | 'anonymize' | 'encrypt';
  description: string;
  tool: string;
  timestamp: Date;
  impact: 'none' | 'low' | 'medium' | 'high';
}

export interface DataProtectionStatus {
  encrypted: boolean;
  masked: boolean;
  tokenized: boolean;
  anonymized: boolean;
  pseudonymized: boolean;
  backupEncrypted: boolean;
  dlpEnabled: boolean;
  watermarked: boolean;
  lastProtectionUpdate: Date;
}

export interface ComplianceStatus {
  gdpr: {
    compliant: boolean;
    issues: string[];
    lastAssessment: Date;
  };
  hipaa: {
    compliant: boolean;
    issues: string[];
    lastAssessment: Date;
  };
  pci: {
    compliant: boolean;
    issues: string[];
    lastAssessment: Date;
  };
  overall: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
}

export interface ClassificationRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: ClassificationCondition[];
  actions: ClassificationAction[];
  target: DataClassification;
  confidence: number;
  performance: {
    totalExecutions: number;
    correctClassifications: number;
    falsePositives: number;
    falseNegatives: number;
    accuracy: number;
  };
}

export interface ClassificationCondition {
  type: 'content_pattern' | 'file_name' | 'file_path' | 'file_size' | 'file_type' | 'metadata' | 'source_system';
  field: string;
  operator: 'contains' | 'matches' | 'equals' | 'greater_than' | 'less_than' | 'in_list';
  value: string | number | string[];
  weight: number; // 0-1
}

export interface ClassificationAction {
  type: 'classify' | 'label' | 'encrypt' | 'quarantine' | 'notify' | 'audit';
  parameters: Record<string, any>;
  automatic: boolean;
}

export interface DataDiscoveryResult {
  scanId: string;
  timestamp: Date;
  scope: {
    systems: string[];
    locations: string[];
    fileTypes: string[];
  };
  statistics: {
    totalItems: number;
    classified: number;
    personalData: number;
    sensitiveData: number;
    unclassified: number;
    errors: number;
  };
  findings: DataAsset[];
  recommendations: string[];
  nextScanDate: Date;
}

export class DataClassificationService {
  private classifications: Map<string, DataClassification> = new Map();
  private assets: Map<string, DataAsset> = new Map();
  private rules: Map<string, ClassificationRule> = new Map();
  private discoveryResults: Map<string, DataDiscoveryResult> = new Map();
  private mlClassifier: MLDataClassifier;
  private complianceEngine: DataComplianceEngine;

  constructor() {
    this.mlClassifier = new MLDataClassifier();
    this.complianceEngine = new DataComplianceEngine();
    this.initializeClassificationService();
  }

  /**
   * Initialize classification service with standard classifications
   */
  private initializeClassificationService(): void {
    this.initializeClassifications();
    this.initializeClassificationRules();
    this.initializeSampleAssets();
  }

  private initializeClassifications(): void {
    const classifications: DataClassification[] = [
      {
        id: 'class-public',
        name: 'Public Information',
        level: 'public',
        category: 'operational',
        sensitivity: 10,
        description: 'Information that can be freely shared with the public',
        compliance: [
          {
            framework: 'gdpr',
            requirement: 'Article 5 - Lawful processing',
            mandatory: false,
            controls: ['data_minimization', 'purpose_limitation'],
            auditRequired: false
          }
        ],
        handling: {
          encryption: {
            atRest: false,
            inTransit: false,
            algorithm: 'none',
            keyLength: 0
          },
          access: {
            authentication: 'basic',
            authorization: 'dac',
            minimumClearance: [],
            needToKnow: false
          },
          storage: {
            location: 'cloud',
            geography: ['global'],
            backup: true,
            replication: true
          },
          sharing: {
            internal: true,
            external: true,
            anonymization: false,
            watermarking: false,
            dlp: false
          }
        },
        retention: {
          retentionPeriod: 2555, // 7 years
          archivePeriod: 1825, // 5 years
          destructionRequired: true,
          destructionMethod: 'secure_delete',
          legalHold: false,
          exceptions: []
        },
        metadata: {
          createdBy: 'system',
          createdDate: new Date('2024-01-01'),
          lastModified: new Date('2024-01-01'),
          version: '1.0'
        }
      },
      {
        id: 'class-internal',
        name: 'Internal Use Only',
        level: 'internal',
        category: 'operational',
        sensitivity: 30,
        description: 'Information for internal company use only',
        compliance: [
          {
            framework: 'gdpr',
            requirement: 'Article 32 - Security of processing',
            mandatory: true,
            controls: ['access_control', 'encryption'],
            auditRequired: true
          }
        ],
        handling: {
          encryption: {
            atRest: true,
            inTransit: true,
            algorithm: 'AES-256',
            keyLength: 256
          },
          access: {
            authentication: 'basic',
            authorization: 'rbac',
            minimumClearance: ['employee'],
            needToKnow: true
          },
          storage: {
            location: 'onpremise',
            geography: ['US', 'EU'],
            backup: true,
            replication: true
          },
          sharing: {
            internal: true,
            external: false,
            anonymization: false,
            watermarking: true,
            dlp: true
          }
        },
        retention: {
          retentionPeriod: 1825, // 5 years
          archivePeriod: 1095, // 3 years
          destructionRequired: true,
          destructionMethod: 'secure_delete',
          legalHold: false,
          exceptions: []
        },
        metadata: {
          createdBy: 'system',
          createdDate: new Date('2024-01-01'),
          lastModified: new Date('2024-01-01'),
          version: '1.0'
        }
      },
      {
        id: 'class-confidential',
        name: 'Confidential Information',
        level: 'confidential',
        category: 'intellectual_property',
        sensitivity: 70,
        description: 'Sensitive business information requiring protection',
        compliance: [
          {
            framework: 'gdpr',
            requirement: 'Article 32 - Security of processing',
            mandatory: true,
            controls: ['access_control', 'encryption', 'audit_logging'],
            auditRequired: true
          },
          {
            framework: 'sox',
            requirement: 'Section 404 - Internal controls',
            mandatory: true,
            controls: ['access_control', 'audit_trail'],
            auditRequired: true
          }
        ],
        handling: {
          encryption: {
            atRest: true,
            inTransit: true,
            algorithm: 'AES-256-GCM',
            keyLength: 256
          },
          access: {
            authentication: 'mfa',
            authorization: 'abac',
            minimumClearance: ['manager'],
            needToKnow: true
          },
          storage: {
            location: 'onpremise',
            geography: ['US'],
            backup: true,
            replication: false
          },
          sharing: {
            internal: true,
            external: false,
            anonymization: true,
            watermarking: true,
            dlp: true
          }
        },
        retention: {
          retentionPeriod: 1095, // 3 years
          archivePeriod: 730, // 2 years
          destructionRequired: true,
          destructionMethod: 'cryptographic_erasure',
          legalHold: true,
          exceptions: ['legal_hold']
        },
        metadata: {
          createdBy: 'system',
          createdDate: new Date('2024-01-01'),
          lastModified: new Date('2024-01-01'),
          version: '1.0'
        }
      },
      {
        id: 'class-restricted',
        name: 'Restricted Information',
        level: 'restricted',
        category: 'financial',
        sensitivity: 90,
        description: 'Highly sensitive information with strict controls',
        compliance: [
          {
            framework: 'pci_dss',
            requirement: 'Requirement 3 - Protect stored cardholder data',
            mandatory: true,
            controls: ['encryption', 'key_management', 'access_control'],
            auditRequired: true
          },
          {
            framework: 'sox',
            requirement: 'Section 302 - Corporate responsibility',
            mandatory: true,
            controls: ['access_control', 'audit_trail', 'segregation'],
            auditRequired: true
          }
        ],
        handling: {
          encryption: {
            atRest: true,
            inTransit: true,
            algorithm: 'AES-256-GCM',
            keyLength: 256
          },
          access: {
            authentication: 'certificate',
            authorization: 'mac',
            minimumClearance: ['director'],
            needToKnow: true
          },
          storage: {
            location: 'restricted',
            geography: ['US'],
            backup: true,
            replication: false
          },
          sharing: {
            internal: false,
            external: false,
            anonymization: true,
            watermarking: true,
            dlp: true
          }
        },
        retention: {
          retentionPeriod: 730, // 2 years
          archivePeriod: 365, // 1 year
          destructionRequired: true,
          destructionMethod: 'physical_destruction',
          legalHold: true,
          exceptions: ['legal_hold', 'regulatory_requirement']
        },
        metadata: {
          createdBy: 'system',
          createdDate: new Date('2024-01-01'),
          lastModified: new Date('2024-01-01'),
          version: '1.0'
        }
      }
    ];

    classifications.forEach(classification => {
      this.classifications.set(classification.id, classification);
    });
  }

  /**
   * Initialize classification rules
   */
  private initializeClassificationRules(): void {
    const rules: ClassificationRule[] = [
      {
        id: 'rule-pii-detection',
        name: 'PII Detection Rule',
        enabled: true,
        priority: 100,
        conditions: [
          {
            type: 'content_pattern',
            field: 'content',
            operator: 'contains',
            value: ['ssn', 'social security', 'credit card', 'passport'],
            weight: 0.8
          },
          {
            type: 'content_pattern',
            field: 'content',
            operator: 'contains',
            value: ['@company.com', '@corp.com'],
            weight: 0.6
          }
        ],
        actions: [
          {
            type: 'classify',
            parameters: { classificationId: 'class-confidential' },
            automatic: true
          },
          {
            type: 'notify',
            parameters: { recipients: ['security@company.com'] },
            automatic: true
          }
        ],
        target: this.classifications.get('class-confidential')!,
        confidence: 0.85,
        performance: {
          totalExecutions: 1250,
          correctClassifications: 1187,
          falsePositives: 45,
          falseNegatives: 18,
          accuracy: 0.95
        }
      },
      {
        id: 'rule-financial-data',
        name: 'Financial Data Detection',
        enabled: true,
        priority: 90,
        conditions: [
          {
            type: 'content_pattern',
            field: 'content',
            operator: 'contains',
            value: ['account number', 'routing number', 'credit card', 'bank account'],
            weight: 0.9
          },
          {
            type: 'file_name',
            field: 'name',
            operator: 'contains',
            value: ['financial', 'accounting', 'payroll'],
            weight: 0.7
          }
        ],
        actions: [
          {
            type: 'classify',
            parameters: { classificationId: 'class-restricted' },
            automatic: true
          },
          {
            type: 'encrypt',
            parameters: { algorithm: 'AES-256-GCM' },
            automatic: true
          }
        ],
        target: this.classifications.get('class-restricted')!,
        confidence: 0.92,
        performance: {
          totalExecutions: 890,
          correctClassifications: 856,
          falsePositives: 23,
          falseNegatives: 11,
          accuracy: 0.97
        }
      },
      {
        id: 'rule-healthcare-data',
        name: 'Healthcare Data Detection',
        enabled: true,
        priority: 95,
        conditions: [
          {
            type: 'content_pattern',
            field: 'content',
            operator: 'contains',
            value: ['medical record', 'diagnosis', 'treatment', 'patient'],
            weight: 0.9
          },
          {
            type: 'file_name',
            field: 'name',
            operator: 'contains',
            value: ['medical', 'health', 'patient'],
            weight: 0.8
          }
        ],
        actions: [
          {
            type: 'classify',
            parameters: { classificationId: 'class-restricted' },
            automatic: true
          },
          {
            type: 'notify',
            parameters: { recipients: ['compliance@company.com'] },
            automatic: true
          }
        ],
        target: this.classifications.get('class-restricted')!,
        confidence: 0.88,
        performance: {
          totalExecutions: 456,
          correctClassifications: 432,
          falsePositives: 18,
          falseNegatives: 6,
          accuracy: 0.96
        }
      }
    ];

    rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Initialize sample data assets
   */
  private initializeSampleAssets(): void {
    const sampleAssets: DataAsset[] = [
      {
        id: 'asset-001',
        name: 'employee_database.csv',
        type: 'database',
        location: {
          system: 'HR-System',
          path: '/data/hr/employees',
          database: 'hr_db',
          table: 'employees'
        },
        classification: this.classifications.get('class-confidential')!,
        owner: {
          business: 'HR Department',
          technical: 'hr-admin@company.com',
          steward: 'hr-director@company.com'
        },
        discovery: {
          method: 'automated',
          discoveredDate: new Date('2024-01-15'),
          lastScanned: new Date(),
          confidence: 0.95
        },
        content: {
          size: 2048576, // 2MB
          format: 'CSV',
          schema: {
            fields: [
              { name: 'employee_id', type: 'string', nullable: false, classification: 'internal', sensitivity: 30, personalData: false, patterns: [] },
              { name: 'first_name', type: 'string', nullable: false, classification: 'confidential', sensitivity: 70, personalData: true, patterns: ['name'] },
              { name: 'last_name', type: 'string', nullable: false, classification: 'confidential', sensitivity: 70, personalData: true, patterns: ['name'] },
              { name: 'email', type: 'string', nullable: false, classification: 'confidential', sensitivity: 70, personalData: true, patterns: ['email'] },
              { name: 'ssn', type: 'string', nullable: true, classification: 'restricted', sensitivity: 90, personalData: true, patterns: ['ssn'] },
              { name: 'salary', type: 'number', nullable: true, classification: 'restricted', sensitivity: 90, personalData: true, patterns: [] }
            ],
            relationships: [],
            constraints: []
          },
          sampleData: 'employee_id,first_name,last_name,email,ssn,salary\n001,John,Doe,john.doe@company.com,123-45-6789,75000',
          personalDataElements: [
            { type: 'name', field: 'first_name', confidence: 0.95, masking: 'partial', purpose: ['hr_management'], consent: true },
            { type: 'name', field: 'last_name', confidence: 0.95, masking: 'partial', purpose: ['hr_management'], consent: true },
            { type: 'email', field: 'email', confidence: 0.98, masking: 'none', purpose: ['hr_management'], consent: true },
            { type: 'ssn', field: 'ssn', confidence: 0.99, masking: 'full', purpose: ['hr_management'], consent: true, lawfulBasis: 'legitimate_interest' }
          ]
        },
        lineage: {
          sources: [
            { system: 'HR-Application', location: '/api/employees', type: 'source', timestamp: new Date('2024-01-15') }
          ],
          transformations: [
            { type: 'extract', description: 'Export from HR system', tool: 'HR-API', timestamp: new Date('2024-01-15'), impact: 'low' }
          ],
          destinations: [
            { system: 'Data-Warehouse', location: '/warehouse/hr/employees', type: 'destination', timestamp: new Date('2024-01-15') }
          ],
          lastUpdated: new Date('2024-01-15')
        },
        protection: {
          encrypted: true,
          masked: true,
          tokenized: false,
          anonymized: false,
          pseudonymized: true,
          backupEncrypted: true,
          dlpEnabled: true,
          watermarked: true,
          lastProtectionUpdate: new Date('2024-01-15')
        },
        compliance: {
          gdpr: { compliant: true, issues: [], lastAssessment: new Date('2024-01-15') },
          hipaa: { compliant: false, issues: ['Contains SSN without proper safeguards'], lastAssessment: new Date('2024-01-15') },
          pci: { compliant: true, issues: [], lastAssessment: new Date('2024-01-15') },
          overall: 'partial'
        }
      }
    ];

    sampleAssets.forEach(asset => {
      this.assets.set(asset.id, asset);
    });
  }

  /**
   * Classify data asset
   */
  async classifyAsset(
    assetData: Partial<DataAsset>,
    autoApply: boolean = false
  ): Promise<{ classification: DataClassification; confidence: number; reasons: string[] }> {
    try {
      // Use ML classifier for initial assessment
      const mlResult = await this.mlClassifier.classifyContent(assetData);
      
      // Apply classification rules
      const ruleResults = await this.applyClassificationRules(assetData);
      
      // Combine ML and rule-based results
      const combinedScore = (mlResult.confidence * 0.6) + (ruleResults.confidence * 0.4);
      const finalClassification = combinedScore > 0.7 ? ruleResults.classification : mlResult.classification;
      
      // Generate reasons for classification
      const reasons = [
        `ML confidence: ${(mlResult.confidence * 100).toFixed(1)}%`,
        `Rule-based confidence: ${(ruleResults.confidence * 100).toFixed(1)}%`,
        `Combined confidence: ${(combinedScore * 100).toFixed(1)}%`
      ];

      if (mlResult.reasons.length > 0) {
        reasons.push(...mlResult.reasons);
      }

      if (ruleResults.reasons.length > 0) {
        reasons.push(...ruleResults.reasons);
      }

      // Auto-apply classification if requested
      if (autoApply && assetData.id) {
        const asset = this.assets.get(assetData.id);
        if (asset) {
          asset.classification = finalClassification;
          asset.discovery.lastScanned = new Date();
          asset.discovery.confidence = combinedScore;
        }
      }

      return {
        classification: finalClassification,
        confidence: combinedScore,
        reasons
      };

    } catch (error) {
      console.error('Asset classification failed:', error);
      
      // Fallback to default classification
      return {
        classification: this.classifications.get('class-internal')!,
        confidence: 0.5,
        reasons: ['Classification failed, using default internal classification']
      };
    }
  }

  /**
   * Evaluate classification condition
   */
  private async applyClassificationRules(assetData: Partial<DataAsset>): Promise<{
    classification: DataClassification;
    confidence: number;
    reasons: string[];
  }> {
    let bestMatch = {
      classification: this.classifications.get('class-internal')!,
      confidence: 0,
      reasons: [] as string[]
    };

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const matchScore = this.evaluateRule(rule, assetData);
      
      if (matchScore > bestMatch.confidence) {
        bestMatch = {
          classification: rule.target,
          confidence: matchScore,
          reasons: [`Matched rule: ${rule.name}`]
        };
      }
    }

    return bestMatch;
  }

  private evaluateRule(rule: ClassificationRule, assetData: Partial<DataAsset>): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const condition of rule.conditions) {
      const matches = this.evaluateCondition(condition, assetData);
      totalScore += matches * condition.weight;
      totalWeight += condition.weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private evaluateCondition(condition: ClassificationCondition, assetData: Partial<DataAsset>): number {
    const getValue = (field: string): string | number => {
      switch (field) {
        case 'content':
          return assetData.content?.sampleData || '';
        case 'name':
          return assetData.name || '';
        case 'path':
          return assetData.location?.path || '';
        case 'size':
          return assetData.content?.size || 0;
        case 'type':
          return assetData.type || '';
        default:
          return '';
      }
    };

    const value = getValue(condition.field);
    
    switch (condition.operator) {
      case 'contains':
        if (Array.isArray(condition.value)) {
          return condition.value.some(v => value.toLowerCase().includes(v.toLowerCase())) ? 1 : 0;
        }
        return value.toLowerCase().includes(condition.value.toLowerCase()) ? 1 : 0;
      
      case 'matches':
        if (Array.isArray(condition.value)) {
          return condition.value.some(v => value.toLowerCase() === v.toLowerCase()) ? 1 : 0;
        }
        return value.toLowerCase() === condition.value.toLowerCase() ? 1 : 0;
      
      case 'equals':
        return value === condition.value ? 1 : 0;
      
      case 'greater_than':
        return value > condition.value ? 1 : 0;
      
      case 'less_than':
        return value < condition.value ? 1 : 0;
      
      case 'in_list':
        if (Array.isArray(condition.value)) {
          return condition.value.includes(value) ? 1 : 0;
        }
        return 0;
      
      default:
        return 0;
    }
  }

  /**
   * Perform data discovery scan
   */
  async performDiscovery(
    systems: string[],
    locations: string[],
    fileTypes: string[] = []
  ): Promise<DataDiscoveryResult> {
    try {
      const scanId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const startTime = Date.now();

      // Simulate discovery process
      const discoveredAssets: DataAsset[] = [];
      let totalItems = 0;
      let classified = 0;
      let personalData = 0;
      let sensitiveData = 0;
      let unclassified = 0;
      let errors = 0;

      // Simulate scanning different systems
      for (const system of systems) {
        const systemAssets = await this.scanSystem(system, locations, fileTypes);
        discoveredAssets.push(...systemAssets);
        
        for (const asset of systemAssets) {
          totalItems++;
          
          try {
            const classification = await this.classifyAsset(asset, true);
            classified++;
            
            if (classification.classification.level === 'confidential' || classification.classification.level === 'restricted') {
              sensitiveData++;
            }
            
            if (asset.content?.personalDataElements && asset.content.personalDataElements.length > 0) {
              personalData++;
            }
          } catch (error) {
            errors++;
            console.error(`Classification failed for asset ${asset.id}:`, error);
          }
        }
      }

      unclassified = totalItems - classified;

      const scanTime = Date.now() - startTime;
      const nextScanDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week

      const result: DataDiscoveryResult = {
        scanId,
        timestamp: new Date(),
        scope: {
          systems,
          locations,
          fileTypes
        },
        statistics: {
          totalItems,
          classified,
          personalData,
          sensitiveData,
          unclassified,
          errors
        },
        findings: discoveredAssets,
        recommendations: this.generateRecommendations(discoveredAssets),
        nextScanDate
      };

      this.discoveryResults.set(scanId, result);
      return result;

    } catch (error) {
      console.error('Data discovery failed:', error);
      throw error;
    }
  }

  private async scanSystem(system: string, locations: string[], fileTypes: string[]): Promise<DataAsset[]> {
    // Simulate system scanning
    const assets: DataAsset[] = [];
    
    // Generate mock assets based on system type
    const systemAssetCount = Math.floor(Math.random() * 50) + 10;
    
    for (let i = 0; i < systemAssetCount; i++) {
      const asset: DataAsset = {
        id: `asset-${system}-${Date.now()}-${i}`,
        name: `${system}_data_${i}.${fileTypes[Math.floor(Math.random() * fileTypes.length)] || 'csv'}`,
        type: 'file',
        location: {
          system,
          path: `/data/${system}/files`,
          container: system
        },
        classification: this.classifications.get('class-internal')!,
        owner: {
          business: `${system} Department`,
          technical: `${system}-admin@company.com`,
          steward: `${system}-director@company.com`
        },
        discovery: {
          method: 'automated',
          discoveredDate: new Date(),
          lastScanned: new Date(),
          confidence: 0.8
        },
        content: {
          size: Math.floor(Math.random() * 10000000) + 1000,
          format: fileTypes[Math.floor(Math.random() * fileTypes.length)] || 'csv',
          personalDataElements: []
        },
        lineage: {
          sources: [],
          transformations: [],
          destinations: [],
          lastUpdated: new Date()
        },
        protection: {
          encrypted: false,
          masked: false,
          tokenized: false,
          anonymized: false,
          pseudonymized: false,
          backupEncrypted: false,
          dlpEnabled: false,
          watermarked: false,
          lastProtectionUpdate: new Date()
        },
        compliance: {
          gdpr: { compliant: true, issues: [], lastAssessment: new Date() },
          hipaa: { compliant: true, issues: [], lastAssessment: new Date() },
          pci: { compliant: true, issues: [], lastAssessment: new Date() },
          overall: 'compliant'
        }
      };
      
      assets.push(asset);
    }
    
    return assets;
  }

  private generateRecommendations(assets: DataAsset[]): string[] {
    const recommendations: string[] = [];
    
    const unencryptedAssets = assets.filter(asset => !asset.protection.encrypted);
    if (unencryptedAssets.length > 0) {
      recommendations.push(`Encrypt ${unencryptedAssets.length} unencrypted assets`);
    }
    
    const nonCompliantAssets = assets.filter(asset => asset.compliance.overall !== 'compliant');
    if (nonCompliantAssets.length > 0) {
      recommendations.push(`Review compliance for ${nonCompliantAssets.length} non-compliant assets`);
    }
    
    const assetsWithoutDLP = assets.filter(asset => !asset.protection.dlpEnabled);
    if (assetsWithoutDLP.length > 0) {
      recommendations.push(`Enable DLP for ${assetsWithoutDLP.length} assets`);
    }
    
    return recommendations;
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(): {
    summary: {
      totalAssets: number;
      compliantAssets: number;
      nonCompliantAssets: number;
      partialCompliantAssets: number;
      complianceScore: number;
    };
    byFramework: {
      gdpr: { compliant: number; nonCompliant: number; issues: string[] };
      hipaa: { compliant: number; nonCompliant: number; issues: string[] };
      pci: { compliant: number; nonCompliant: number; issues: string[] };
    };
    riskAreas: string[];
    recommendations: string[];
  } {
    const assets = Array.from(this.assets.values());
    
    const summary = {
      totalAssets: assets.length,
      compliantAssets: assets.filter(a => a.compliance.overall === 'compliant').length,
      nonCompliantAssets: assets.filter(a => a.compliance.overall === 'non_compliant').length,
      partialCompliantAssets: assets.filter(a => a.compliance.overall === 'partial').length,
      complianceScore: 0
    };
    
    summary.complianceScore = summary.totalAssets > 0 ? 
      (summary.compliantAssets / summary.totalAssets) * 100 : 0;
    
    const byFramework = {
      gdpr: {
        compliant: assets.filter(a => a.compliance.gdpr.compliant).length,
        nonCompliant: assets.filter(a => !a.compliance.gdpr.compliant).length,
        issues: assets.flatMap(a => a.compliance.gdpr.issues)
      },
      hipaa: {
        compliant: assets.filter(a => a.compliance.hipaa.compliant).length,
        nonCompliant: assets.filter(a => !a.compliance.hipaa.compliant).length,
        issues: assets.flatMap(a => a.compliance.hipaa.issues)
      },
      pci: {
        compliant: assets.filter(a => a.compliance.pci.compliant).length,
        nonCompliant: assets.filter(a => !a.compliance.pci.compliant).length,
        issues: assets.flatMap(a => a.compliance.pci.issues)
      }
    };
    
    const riskAreas: string[] = [];
    if (byFramework.gdpr.nonCompliant > 0) riskAreas.push('GDPR Compliance');
    if (byFramework.hipaa.nonCompliant > 0) riskAreas.push('HIPAA Compliance');
    if (byFramework.pci.nonCompliant > 0) riskAreas.push('PCI DSS Compliance');
    
    const recommendations: string[] = [];
    if (summary.complianceScore < 90) {
      recommendations.push('Implement automated compliance monitoring');
    }
    if (byFramework.gdpr.nonCompliant > 0) {
      recommendations.push('Review and update GDPR compliance controls');
    }
    if (byFramework.hipaa.nonCompliant > 0) {
      recommendations.push('Implement HIPAA-compliant data handling');
    }
    
    return {
      summary,
      byFramework,
      riskAreas,
      recommendations
    };
  }

  /**
   * Public methods for external access
   */
  getClassifications(): DataClassification[] {
    return Array.from(this.classifications.values());
  }

  getClassification(id: string): DataClassification | undefined {
    return this.classifications.get(id);
  }

  getAssets(): DataAsset[] {
    return Array.from(this.assets.values());
  }

  getAsset(id: string): DataAsset | undefined {
    return this.assets.get(id);
  }

  getRules(): ClassificationRule[] {
    return Array.from(this.rules.values());
  }

  getRule(id: string): ClassificationRule | undefined {
    return this.rules.get(id);
  }

  getDiscoveryResults(): DataDiscoveryResult[] {
    return Array.from(this.discoveryResults.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getDiscoveryResult(scanId: string): DataDiscoveryResult | undefined {
    return this.discoveryResults.get(scanId);
  }
}

// ML Data Classifier Service
class MLDataClassifier {
  async classifyContent(assetData: Partial<DataAsset>): Promise<{
    classification: DataClassification;
    confidence: number;
    reasons: string[];
  }> {
    // Simulate ML-based classification
    const content = assetData.content?.sampleData || '';
    const fileName = assetData.name || '';
    
    let classification: DataClassification;
    let confidence = 0.5;
    const reasons: string[] = [];
    
    // Simple pattern-based classification (in real implementation, this would use ML models)
    if (content.includes('ssn') || content.includes('credit card') || content.includes('passport')) {
      classification = this.getClassificationByLevel('restricted');
      confidence = 0.9;
      reasons.push('Contains sensitive personal information');
    } else if (content.includes('@company.com') || fileName.includes('employee') || fileName.includes('customer')) {
      classification = this.getClassificationByLevel('confidential');
      confidence = 0.8;
      reasons.push('Contains business contact information');
    } else if (fileName.includes('public') || fileName.includes('marketing')) {
      classification = this.getClassificationByLevel('public');
      confidence = 0.7;
      reasons.push('Appears to be public information');
    } else {
      classification = this.getClassificationByLevel('internal');
      confidence = 0.6;
      reasons.push('Default internal classification');
    }
    
    return { classification, confidence, reasons };
  }
  
  private getClassificationByLevel(level: string): DataClassification {
    const classifications = [
      { level: 'public', id: 'class-public' },
      { level: 'internal', id: 'class-internal' },
      { level: 'confidential', id: 'class-confidential' },
      { level: 'restricted', id: 'class-restricted' }
    ];
    
    const match = classifications.find(c => c.level === level);
    return this.getClassificationById(match?.id || 'class-internal');
  }
  
  private getClassificationById(id: string): DataClassification {
    // This would be replaced with actual classification lookup
    return {
      id: 'class-internal',
      name: 'Internal Use Only',
      level: 'internal',
      category: 'operational',
      sensitivity: 30,
      description: 'Information for internal company use only',
      compliance: [],
      handling: {
        encryption: { atRest: true, inTransit: true, algorithm: 'AES-256', keyLength: 256 },
        access: { authentication: 'basic', authorization: 'rbac', minimumClearance: ['employee'], needToKnow: true },
        storage: { location: 'onpremise', geography: ['US', 'EU'], backup: true, replication: true },
        sharing: { internal: true, external: false, anonymization: false, watermarking: true, dlp: true }
      },
      retention: {
        retentionPeriod: 1825,
        archivePeriod: 1095,
        destructionRequired: true,
        destructionMethod: 'secure_delete',
        legalHold: false,
        exceptions: []
      },
      metadata: {
        createdBy: 'system',
        createdDate: new Date(),
        lastModified: new Date(),
        version: '1.0'
      }
    };
  }
}

// Data Compliance Engine Service
class DataComplianceEngine {
  async checkCompliance(asset: DataAsset): Promise<{
    gdpr: { compliant: boolean; issues: string[] };
    hipaa: { compliant: boolean; issues: string[] };
    pci: { compliant: boolean; issues: string[] };
    overall: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
  }> {
    const gdprIssues: string[] = [];
    const hipaaIssues: string[] = [];
    const pciIssues: string[] = [];
    
    // Check GDPR compliance
    if (asset.content?.personalDataElements && asset.content.personalDataElements.length > 0) {
      const hasConsent = asset.content.personalDataElements.every(element => element.consent);
      if (!hasConsent) {
        gdprIssues.push('Personal data processing without proper consent');
      }
      
      const hasLawfulBasis = asset.content.personalDataElements.every(element => element.lawfulBasis);
      if (!hasLawfulBasis) {
        gdprIssues.push('Missing lawful basis for data processing');
      }
    }
    
    // Check HIPAA compliance
    if (asset.content?.personalDataElements) {
      const hasHealthData = asset.content.personalDataElements.some(element => 
        element.type === 'health' || element.type === 'biometric'
      );
      if (hasHealthData && !asset.protection.encrypted) {
        hipaaIssues.push('Health data not encrypted');
      }
    }
    
    // Check PCI compliance
    if (asset.content?.personalDataElements) {
      const hasPaymentData = asset.content.personalDataElements.some(element => 
        element.type === 'credit_card'
      );
      if (hasPaymentData && !asset.protection.encrypted) {
        pciIssues.push('Payment data not encrypted');
      }
    }
    
    const gdprCompliant = gdprIssues.length === 0;
    const hipaaCompliant = hipaaIssues.length === 0;
    const pciCompliant = pciIssues.length === 0;
    
    let overall: 'compliant' | 'non_compliant' | 'partial' | 'unknown' = 'unknown';
    if (gdprCompliant && hipaaCompliant && pciCompliant) {
      overall = 'compliant';
    } else if (!gdprCompliant && !hipaaCompliant && !pciCompliant) {
      overall = 'non_compliant';
    } else {
      overall = 'partial';
    }
    
    return {
      gdpr: { compliant: gdprCompliant, issues: gdprIssues },
      hipaa: { compliant: hipaaCompliant, issues: hipaaIssues },
      pci: { compliant: pciCompliant, issues: pciIssues },
      overall
    };
  }
}

export default DataClassificationService;
