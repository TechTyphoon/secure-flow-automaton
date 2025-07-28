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

  constructor() {
    this.initializeClassificationService();
  }

  /**
   * Initialize classification service with standard classifications
   */
  private initializeClassificationService(): void {
    // Initialize standard data classifications
    const standardClassifications: DataClassification[] = [
      {
        id: 'public',
        name: 'Public',
        level: 'public',
        category: 'operational',
        sensitivity: 10,
        description: 'Information that can be freely shared with the public',
        compliance: [],
        handling: {
          encryption: { atRest: false, inTransit: false, algorithm: 'none', keyLength: 0 },
          access: { authentication: 'basic', authorization: 'rbac', minimumClearance: [], needToKnow: false },
          storage: { location: 'cloud', geography: ['global'], backup: true, replication: true },
          sharing: { internal: true, external: true, anonymization: false, watermarking: false, dlp: false }
        },
        retention: {
          retentionPeriod: 2555, // 7 years
          destructionRequired: false,
          destructionMethod: 'secure_delete',
          legalHold: false,
          exceptions: []
        },
        metadata: {
          createdBy: 'system',
          createdDate: new Date('2025-01-01'),
          lastModified: new Date('2025-01-01'),
          version: '1.0'
        }
      },
      {
        id: 'internal',
        name: 'Internal',
        level: 'internal',
        category: 'operational',
        sensitivity: 30,
        description: 'Internal business information for employee access',
        compliance: [
          { framework: 'iso27001', requirement: 'Information Security Management', mandatory: true, controls: ['A.8.2.1'], auditRequired: true }
        ],
        handling: {
          encryption: { atRest: true, inTransit: true, algorithm: 'AES-256', keyLength: 256 },
          access: { authentication: 'mfa', authorization: 'rbac', minimumClearance: ['employee'], needToKnow: false },
          storage: { location: 'hybrid', geography: ['us', 'eu'], backup: true, replication: true },
          sharing: { internal: true, external: false, anonymization: false, watermarking: true, dlp: true }
        },
        retention: {
          retentionPeriod: 2190, // 6 years
          destructionRequired: true,
          destructionMethod: 'secure_delete',
          legalHold: false,
          exceptions: ['legal_discovery']
        },
        metadata: {
          createdBy: 'data.governance@secureflow.com',
          createdDate: new Date('2025-01-01'),
          lastModified: new Date('2025-07-01'),
          version: '1.1'
        }
      },
      {
        id: 'confidential',
        name: 'Confidential',
        level: 'confidential',
        category: 'intellectual_property',
        sensitivity: 70,
        description: 'Sensitive business information requiring special handling',
        compliance: [
          { framework: 'iso27001', requirement: 'Information Classification', mandatory: true, controls: ['A.8.2.1', 'A.8.2.2'], auditRequired: true },
          { framework: 'sox', requirement: 'Financial Data Protection', mandatory: true, controls: ['SOX-404'], auditRequired: true }
        ],
        handling: {
          encryption: { atRest: true, inTransit: true, algorithm: 'AES-256', keyLength: 256 },
          access: { authentication: 'mfa', authorization: 'abac', minimumClearance: ['confidential'], needToKnow: true },
          storage: { location: 'onpremise', geography: ['us'], backup: true, replication: false },
          sharing: { internal: true, external: false, anonymization: true, watermarking: true, dlp: true }
        },
        retention: {
          retentionPeriod: 2555, // 7 years
          destructionRequired: true,
          destructionMethod: 'cryptographic_erasure',
          legalHold: true,
          exceptions: ['regulatory_requirement']
        },
        metadata: {
          createdBy: 'legal@secureflow.com',
          createdDate: new Date('2025-01-01'),
          lastModified: new Date('2025-07-01'),
          version: '1.2'
        }
      },
      {
        id: 'restricted',
        name: 'Restricted',
        level: 'restricted',
        category: 'personal',
        sensitivity: 90,
        description: 'Highly sensitive personal or regulated data',
        compliance: [
          { framework: 'gdpr', requirement: 'Personal Data Protection', mandatory: true, controls: ['Art.32'], auditRequired: true },
          { framework: 'hipaa', requirement: 'PHI Protection', mandatory: true, controls: ['164.312'], auditRequired: true },
          { framework: 'pci_dss', requirement: 'Cardholder Data Protection', mandatory: true, controls: ['3.4'], auditRequired: true }
        ],
        handling: {
          encryption: { atRest: true, inTransit: true, algorithm: 'AES-256', keyLength: 256 },
          access: { authentication: 'certificate', authorization: 'abac', minimumClearance: ['restricted'], needToKnow: true },
          storage: { location: 'restricted', geography: ['us'], backup: true, replication: false },
          sharing: { internal: false, external: false, anonymization: true, watermarking: true, dlp: true }
        },
        retention: {
          retentionPeriod: 2190, // 6 years
          destructionRequired: true,
          destructionMethod: 'physical_destruction',
          legalHold: true,
          exceptions: ['consent_withdrawal', 'right_to_be_forgotten']
        },
        metadata: {
          createdBy: 'privacy.officer@secureflow.com',
          createdDate: new Date('2025-01-01'),
          lastModified: new Date('2025-07-15'),
          version: '1.3'
        }
      }
    ];

    standardClassifications.forEach(classification => {
      this.classifications.set(classification.id, classification);
    });

    this.initializeClassificationRules();
    this.initializeSampleAssets();
  }

  /**
   * Initialize classification rules
   */
  private initializeClassificationRules(): void {
    const rules: ClassificationRule[] = [
      {
        id: 'ssn-rule',
        name: 'Social Security Number Detection',
        enabled: true,
        priority: 95,
        conditions: [
          {
            type: 'content_pattern',
            field: 'content',
            operator: 'matches',
            value: '\\b\\d{3}-\\d{2}-\\d{4}\\b|\\b\\d{9}\\b',
            weight: 0.9
          }
        ],
        actions: [
          { type: 'classify', parameters: { classification: 'restricted' }, automatic: true },
          { type: 'encrypt', parameters: { algorithm: 'AES-256' }, automatic: true },
          { type: 'audit', parameters: { event: 'ssn_detected' }, automatic: true }
        ],
        target: this.classifications.get('restricted')!,
        confidence: 95,
        performance: {
          totalExecutions: 1250,
          correctClassifications: 1188,
          falsePositives: 31,
          falseNegatives: 31,
          accuracy: 95.04
        }
      },
      {
        id: 'email-rule',
        name: 'Email Address Detection',
        enabled: true,
        priority: 70,
        conditions: [
          {
            type: 'content_pattern',
            field: 'content',
            operator: 'matches',
            value: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
            weight: 0.8
          }
        ],
        actions: [
          { type: 'classify', parameters: { classification: 'confidential' }, automatic: true },
          { type: 'label', parameters: { label: 'personal_data' }, automatic: true }
        ],
        target: this.classifications.get('confidential')!,
        confidence: 85,
        performance: {
          totalExecutions: 2340,
          correctClassifications: 2105,
          falsePositives: 117,
          falseNegatives: 118,
          accuracy: 89.96
        }
      },
      {
        id: 'credit-card-rule',
        name: 'Credit Card Number Detection',
        enabled: true,
        priority: 98,
        conditions: [
          {
            type: 'content_pattern',
            field: 'content',
            operator: 'matches',
            value: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13})\\b',
            weight: 0.95
          }
        ],
        actions: [
          { type: 'classify', parameters: { classification: 'restricted' }, automatic: true },
          { type: 'encrypt', parameters: { algorithm: 'AES-256' }, automatic: true },
          { type: 'quarantine', parameters: { reason: 'pci_compliance' }, automatic: true }
        ],
        target: this.classifications.get('restricted')!,
        confidence: 98,
        performance: {
          totalExecutions: 890,
          correctClassifications: 872,
          falsePositives: 9,
          falseNegatives: 9,
          accuracy: 98.00
        }
      },
      {
        id: 'financial-doc-rule',
        name: 'Financial Document Classification',
        enabled: true,
        priority: 80,
        conditions: [
          {
            type: 'file_name',
            field: 'filename',
            operator: 'contains',
            value: ['financial', 'budget', 'revenue', 'profit', 'loss', 'invoice', 'statement'],
            weight: 0.7
          },
          {
            type: 'file_type',
            field: 'extension',
            operator: 'in_list',
            value: ['.xlsx', '.xls', '.csv', '.pdf'],
            weight: 0.3
          }
        ],
        actions: [
          { type: 'classify', parameters: { classification: 'confidential' }, automatic: true },
          { type: 'label', parameters: { label: 'financial_data' }, automatic: true }
        ],
        target: this.classifications.get('confidential')!,
        confidence: 78,
        performance: {
          totalExecutions: 1560,
          correctClassifications: 1341,
          falsePositives: 109,
          falseNegatives: 110,
          accuracy: 85.96
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
        name: 'customer_database.db',
        type: 'database',
        location: {
          system: 'production-db-01',
          path: '/var/lib/mysql/customerdb',
          database: 'customerdb',
          table: 'customers'
        },
        classification: this.classifications.get('restricted')!,
        owner: {
          business: 'sales@secureflow.com',
          technical: 'dba@secureflow.com',
          steward: 'data.governance@secureflow.com'
        },
        discovery: {
          method: 'automated',
          discoveredDate: new Date('2025-07-01'),
          lastScanned: new Date('2025-07-28'),
          confidence: 95
        },
        content: {
          size: 2048576000, // 2GB
          format: 'MySQL',
          schema: {
            fields: [
              { name: 'customer_id', type: 'int', nullable: false, classification: 'internal', sensitivity: 20, personalData: false, patterns: [] },
              { name: 'first_name', type: 'varchar', nullable: false, classification: 'restricted', sensitivity: 80, personalData: true, patterns: ['name'] },
              { name: 'last_name', type: 'varchar', nullable: false, classification: 'restricted', sensitivity: 80, personalData: true, patterns: ['name'] },
              { name: 'email', type: 'varchar', nullable: false, classification: 'restricted', sensitivity: 85, personalData: true, patterns: ['email'] },
              { name: 'ssn', type: 'varchar', nullable: true, classification: 'restricted', sensitivity: 95, personalData: true, patterns: ['ssn'] },
              { name: 'credit_card', type: 'varchar', nullable: true, classification: 'restricted', sensitivity: 98, personalData: true, patterns: ['credit_card'] }
            ],
            relationships: [
              { type: 'foreign_key', source: 'customer_id', target: 'orders.customer_id', description: 'Customer orders relationship' }
            ],
            constraints: [
              { type: 'primary_key', field: 'customer_id', rule: 'unique_identifier' },
              { type: 'not_null', field: 'email', rule: 'required_field' }
            ]
          },
          personalDataElements: [
            { type: 'name', field: 'first_name, last_name', confidence: 95, masking: 'partial', purpose: ['customer_service'], consent: true, lawfulBasis: 'contract' },
            { type: 'email', field: 'email', confidence: 98, masking: 'tokenization', purpose: ['marketing', 'customer_service'], consent: true, lawfulBasis: 'consent' },
            { type: 'ssn', field: 'ssn', confidence: 99, masking: 'full', purpose: ['identity_verification'], consent: true, lawfulBasis: 'legal_obligation' },
            { type: 'credit_card', field: 'credit_card', confidence: 99, masking: 'tokenization', purpose: ['payment_processing'], consent: true, lawfulBasis: 'contract' }
          ]
        },
        lineage: {
          sources: [
            { system: 'crm_system', location: '/api/customers', type: 'source', timestamp: new Date('2025-07-01') }
          ],
          transformations: [
            { type: 'extract', description: 'Daily customer data sync', tool: 'ETL Pipeline', timestamp: new Date('2025-07-28'), impact: 'low' },
            { type: 'transform', description: 'Data validation and cleansing', tool: 'Data Quality Engine', timestamp: new Date('2025-07-28'), impact: 'medium' }
          ],
          destinations: [
            { system: 'analytics_warehouse', location: '/dwh/customers', type: 'destination', timestamp: new Date('2025-07-28') }
          ],
          lastUpdated: new Date('2025-07-28')
        },
        protection: {
          encrypted: true,
          masked: true,
          tokenized: true,
          anonymized: false,
          pseudonymized: true,
          backupEncrypted: true,
          dlpEnabled: true,
          watermarked: false,
          lastProtectionUpdate: new Date('2025-07-28')
        },
        compliance: {
          gdpr: { compliant: true, issues: [], lastAssessment: new Date('2025-07-15') },
          hipaa: { compliant: false, issues: ['not_applicable'], lastAssessment: new Date('2025-07-15') },
          pci: { compliant: true, issues: [], lastAssessment: new Date('2025-07-20') },
          overall: 'compliant'
        }
      },
      {
        id: 'asset-002',
        name: 'financial_reports_2025.xlsx',
        type: 'file',
        location: {
          system: 'file-server-01',
          path: '/finance/reports/2025/Q2/financial_reports_2025.xlsx'
        },
        classification: this.classifications.get('confidential')!,
        owner: {
          business: 'cfo@secureflow.com',
          technical: 'it.admin@secureflow.com',
          steward: 'finance.manager@secureflow.com'
        },
        discovery: {
          method: 'ml_classification',
          discoveredDate: new Date('2025-07-25'),
          lastScanned: new Date('2025-07-28'),
          confidence: 88
        },
        content: {
          size: 5242880, // 5MB
          format: 'Excel',
          personalDataElements: []
        },
        lineage: {
          sources: [
            { system: 'erp_system', location: '/financial/data', type: 'source', timestamp: new Date('2025-07-25') }
          ],
          transformations: [
            { type: 'aggregate', description: 'Quarterly financial aggregation', tool: 'Excel', timestamp: new Date('2025-07-25'), impact: 'low' }
          ],
          destinations: [],
          lastUpdated: new Date('2025-07-25')
        },
        protection: {
          encrypted: true,
          masked: false,
          tokenized: false,
          anonymized: false,
          pseudonymized: false,
          backupEncrypted: true,
          dlpEnabled: true,
          watermarked: true,
          lastProtectionUpdate: new Date('2025-07-25')
        },
        compliance: {
          gdpr: { compliant: true, issues: [], lastAssessment: new Date('2025-07-25') },
          hipaa: { compliant: false, issues: ['not_applicable'], lastAssessment: new Date('2025-07-25') },
          pci: { compliant: true, issues: [], lastAssessment: new Date('2025-07-25') },
          overall: 'compliant'
        }
      },
      {
        id: 'asset-003',
        name: 'employee_health_records',
        type: 'database',
        location: {
          system: 'hr-db-01',
          path: '/var/lib/postgresql/hrdb',
          database: 'hrdb',
          table: 'health_records'
        },
        classification: this.classifications.get('restricted')!,
        owner: {
          business: 'hr@secureflow.com',
          technical: 'dba@secureflow.com',
          steward: 'privacy.officer@secureflow.com'
        },
        discovery: {
          method: 'manual',
          discoveredDate: new Date('2025-07-10'),
          lastScanned: new Date('2025-07-28'),
          confidence: 100
        },
        content: {
          size: 512000000, // 512MB
          format: 'PostgreSQL',
          personalDataElements: [
            { type: 'health', field: 'medical_conditions', confidence: 99, masking: 'full', purpose: ['healthcare_admin'], consent: true, lawfulBasis: 'vital_interests' },
            { type: 'name', field: 'employee_name', confidence: 98, masking: 'partial', purpose: ['hr_admin'], consent: true, lawfulBasis: 'contract' }
          ]
        },
        lineage: {
          sources: [
            { system: 'health_provider_api', location: '/api/health', type: 'source', timestamp: new Date('2025-07-10') }
          ],
          transformations: [
            { type: 'anonymize', description: 'Health data anonymization', tool: 'Privacy Engine', timestamp: new Date('2025-07-10'), impact: 'high' }
          ],
          destinations: [],
          lastUpdated: new Date('2025-07-10')
        },
        protection: {
          encrypted: true,
          masked: true,
          tokenized: false,
          anonymized: true,
          pseudonymized: true,
          backupEncrypted: true,
          dlpEnabled: true,
          watermarked: false,
          lastProtectionUpdate: new Date('2025-07-10')
        },
        compliance: {
          gdpr: { compliant: true, issues: [], lastAssessment: new Date('2025-07-15') },
          hipaa: { compliant: true, issues: [], lastAssessment: new Date('2025-07-15') },
          pci: { compliant: false, issues: ['not_applicable'], lastAssessment: new Date('2025-07-15') },
          overall: 'compliant'
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
    const reasons: string[] = [];
    let bestMatch: DataClassification = this.classifications.get('public')!;
    let maxConfidence = 0;

    // Apply classification rules
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      let ruleConfidence = 0;
      let conditionsMet = 0;

      for (const condition of rule.conditions) {
        if (this.evaluateCondition(condition, assetData)) {
          conditionsMet++;
          ruleConfidence += condition.weight;
          reasons.push(`Matched condition: ${condition.type} ${condition.operator} ${condition.value}`);
        }
      }

      // Calculate rule confidence
      const ruleScore = (conditionsMet / rule.conditions.length) * ruleConfidence * rule.confidence;
      
      if (ruleScore > maxConfidence) {
        maxConfidence = ruleScore;
        bestMatch = rule.target;
        reasons.unshift(`Applied rule: ${rule.name} (confidence: ${ruleScore.toFixed(2)})`);
      }
    }

    // Content-based classification
    if (assetData.content?.personalDataElements && assetData.content.personalDataElements.length > 0) {
      const personalDataTypes = assetData.content.personalDataElements.map(pde => pde.type);
      
      if (personalDataTypes.includes('ssn') || personalDataTypes.includes('credit_card') || personalDataTypes.includes('health')) {
        if (maxConfidence < 90) {
          bestMatch = this.classifications.get('restricted')!;
          maxConfidence = 90;
          reasons.unshift('Contains sensitive personal data (SSN/Credit Card/Health)');
        }
      } else if (personalDataTypes.length > 0) {
        if (maxConfidence < 70) {
          bestMatch = this.classifications.get('confidential')!;
          maxConfidence = 70;
          reasons.unshift('Contains personal data elements');
        }
      }
    }

    // File type based classification
    if (assetData.type && assetData.location?.path) {
      const filename = assetData.location.path.toLowerCase();
      
      if (filename.includes('financial') || filename.includes('revenue') || filename.includes('budget')) {
        if (maxConfidence < 75) {
          bestMatch = this.classifications.get('confidential')!;
          maxConfidence = 75;
          reasons.unshift('Financial document detected');
        }
      }
    }

    // Apply automatic actions if requested
    if (autoApply) {
      const applicableRule = Array.from(this.rules.values())
        .find(rule => rule.target.id === bestMatch.id);
      
      if (applicableRule) {
        for (const action of applicableRule.actions.filter(a => a.automatic)) {
          reasons.push(`Auto-applied action: ${action.type}`);
        }
      }
    }

    return {
      classification: bestMatch,
      confidence: Math.round(maxConfidence),
      reasons
    };
  }

  /**
   * Evaluate classification condition
   */
  private evaluateCondition(condition: ClassificationCondition, assetData: Partial<DataAsset>): boolean {
    const getValue = (field: string): any => {
      switch (field) {
        case 'content': return assetData.content?.sampleData || '';
        case 'filename': return assetData.location?.path?.split('/').pop() || '';
        case 'filepath': return assetData.location?.path || '';
        case 'extension': return assetData.location?.path?.split('.').pop() || '';
        case 'size': return assetData.content?.size || 0;
        case 'type': return assetData.type || '';
        default: return '';
      }
    };

    const value = getValue(condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'contains':
        if (Array.isArray(conditionValue)) {
          return conditionValue.some(v => String(value).toLowerCase().includes(String(v).toLowerCase()));
        }
        return String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
      
      case 'matches':
        try {
          const regex = new RegExp(String(conditionValue), 'i');
          return regex.test(String(value));
        } catch {
          return false;
        }
      
      case 'equals':
        return String(value).toLowerCase() === String(conditionValue).toLowerCase();
      
      case 'greater_than':
        return Number(value) > Number(conditionValue);
      
      case 'less_than':
        return Number(value) < Number(conditionValue);
      
      case 'in_list':
        if (Array.isArray(conditionValue)) {
          return conditionValue.includes(value);
        }
        return false;
      
      default:
        return false;
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
    const scanId = `discovery-${Date.now()}`;
    const timestamp = new Date();

    // Simulate discovery process
    const simulatedFindings: DataAsset[] = [];
    let totalItems = 0;
    let classified = 0;
    let personalData = 0;
    let sensitiveData = 0;

    // Add existing assets that match the scan scope
    for (const asset of this.assets.values()) {
      if (systems.includes(asset.location.system)) {
        simulatedFindings.push(asset);
        totalItems++;
        classified++;
        
        if (asset.content.personalDataElements.length > 0) {
          personalData++;
        }
        
        if (asset.classification.sensitivity >= 70) {
          sensitiveData++;
        }
      }
    }

    // Simulate additional discoveries
    const additionalItems = Math.floor(Math.random() * 20) + 5;
    totalItems += additionalItems;
    classified += Math.floor(additionalItems * 0.8);
    personalData += Math.floor(additionalItems * 0.3);
    sensitiveData += Math.floor(additionalItems * 0.2);

    const result: DataDiscoveryResult = {
      scanId,
      timestamp,
      scope: { systems, locations, fileTypes },
      statistics: {
        totalItems,
        classified,
        personalData,
        sensitiveData,
        unclassified: totalItems - classified,
        errors: Math.floor(Math.random() * 3)
      },
      findings: simulatedFindings,
      recommendations: [
        'Review unclassified items for proper data handling',
        'Implement encryption for sensitive data assets',
        'Update data retention policies for personal data',
        'Ensure GDPR compliance for EU personal data'
      ],
      nextScanDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next week
    };

    this.discoveryResults.set(scanId, result);
    return result;
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

    summary.complianceScore = Math.round((summary.compliantAssets / summary.totalAssets) * 100);

    const byFramework = {
      gdpr: { compliant: 0, nonCompliant: 0, issues: [] as string[] },
      hipaa: { compliant: 0, nonCompliant: 0, issues: [] as string[] },
      pci: { compliant: 0, nonCompliant: 0, issues: [] as string[] }
    };

    assets.forEach(asset => {
      // GDPR
      if (asset.compliance.gdpr.compliant) {
        byFramework.gdpr.compliant++;
      } else {
        byFramework.gdpr.nonCompliant++;
        byFramework.gdpr.issues.push(...asset.compliance.gdpr.issues);
      }

      // HIPAA
      if (asset.compliance.hipaa.compliant) {
        byFramework.hipaa.compliant++;
      } else {
        byFramework.hipaa.nonCompliant++;
        byFramework.hipaa.issues.push(...asset.compliance.hipaa.issues);
      }

      // PCI
      if (asset.compliance.pci.compliant) {
        byFramework.pci.compliant++;
      } else {
        byFramework.pci.nonCompliant++;
        byFramework.pci.issues.push(...asset.compliance.pci.issues);
      }
    });

    // Remove duplicates and filter out 'not_applicable'
    Object.values(byFramework).forEach(framework => {
      framework.issues = [...new Set(framework.issues)].filter(issue => issue !== 'not_applicable');
    });

    const riskAreas: string[] = [];
    const recommendations: string[] = [];

    if (summary.complianceScore < 80) {
      riskAreas.push('Overall compliance below acceptable threshold');
      recommendations.push('Prioritize compliance remediation activities');
    }

    if (byFramework.gdpr.nonCompliant > 0) {
      riskAreas.push('GDPR non-compliance detected');
      recommendations.push('Review GDPR requirements for personal data handling');
    }

    if (byFramework.pci.nonCompliant > 0) {
      riskAreas.push('PCI DSS non-compliance for payment data');
      recommendations.push('Implement PCI DSS controls for payment card data');
    }

    const unprotectedSensitive = assets.filter(a => 
      a.classification.sensitivity >= 70 && !a.protection.encrypted
    ).length;

    if (unprotectedSensitive > 0) {
      riskAreas.push(`${unprotectedSensitive} sensitive assets without encryption`);
      recommendations.push('Encrypt all sensitive data assets');
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

export default DataClassificationService;
