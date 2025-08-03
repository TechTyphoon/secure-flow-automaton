/**
 * Device Compliance Validation Service
 * Implements comprehensive device compliance checking and posture assessment
 * Provides real-time compliance monitoring and automated remediation
 */

export interface CompliancePolicy {
  id: string;
  name: string;
  version: string;
  category: 'security' | 'configuration' | 'software' | 'hardware' | 'network' | 'data_protection';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  scope: 'global' | 'department' | 'role' | 'device_type';
  applicableTo: {
    deviceTypes: string[];
    operatingSystems: string[];
    departments?: string[];
    roles?: string[];
  };
  requirements: ComplianceRequirement[];
  compliance: {
    standard: string; // e.g., "ISO 27001", "NIST", "SOX", "HIPAA"
    section: string;
    description: string;
  };
  createdBy: string;
  createdDate: Date;
  lastModified: Date;
  effectiveDate: Date;
  expiryDate?: Date;
  status: 'active' | 'draft' | 'deprecated' | 'suspended';
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  type: 'configuration' | 'software_presence' | 'software_absence' | 'hardware' | 'network' | 'certificate' | 'custom';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  checkMethod: 'registry' | 'file_system' | 'service' | 'process' | 'network' | 'wmi' | 'api' | 'script';
  validation: {
    condition: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'exists' | 'not_exists' | 'matches_regex';
    target: string; // Registry key, file path, service name, etc.
    expectedValue?: string | number | boolean;
    pattern?: string; // For regex matches
  };
  remediation: {
    automatic: boolean;
    actions: ComplianceAction[];
    userGuidance: string[];
    requiredApproval: boolean;
  };
  exemptions: {
    allowed: boolean;
    maxDuration: number; // days
    approvalRequired: boolean;
    justificationRequired: boolean;
  };
}

export interface ComplianceAction {
  type: 'registry_set' | 'file_create' | 'file_delete' | 'service_start' | 'service_stop' | 'software_install' | 'software_uninstall' | 'script_execute' | 'notify';
  description: string;
  parameters: Record<string, any>;
  rollback?: ComplianceAction;
  riskLevel: 'low' | 'medium' | 'high';
  requiresRestart: boolean;
}

export interface DeviceComplianceStatus {
  deviceId: string;
  lastAssessment: Date;
  overallStatus: 'compliant' | 'non_compliant' | 'partial' | 'pending' | 'exempted' | 'unknown';
  complianceScore: number; // 0-100
  riskScore: number; // 0-100
  policies: PolicyComplianceResult[];
  summary: {
    totalPolicies: number;
    compliantPolicies: number;
    nonCompliantPolicies: number;
    exemptedPolicies: number;
    criticalViolations: number;
    pendingRemediation: number;
  };
  trends: {
    scoreHistory: { date: Date; score: number }[];
    recentChanges: ComplianceChange[];
  };
  nextAssessment: Date;
}

export interface PolicyComplianceResult {
  policyId: string;
  policyName: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'exempted' | 'not_applicable';
  score: number; // 0-100
  lastChecked: Date;
  requirements: RequirementComplianceResult[];
  exemption?: ComplianceExemption;
  remediation?: RemediationPlan;
}

export interface RequirementComplianceResult {
  requirementId: string;
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'not_checked' | 'exempted';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  actualValue?: string | number | boolean;
  expectedValue?: string | number | boolean;
  evidence: string[];
  checkDetails: {
    method: string;
    target: string;
    timestamp: Date;
    duration: number; // milliseconds
    error?: string;
  };
  remediation?: {
    available: boolean;
    automatic: boolean;
    actions: ComplianceAction[];
    estimatedTime: number; // minutes
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface ComplianceExemption {
  id: string;
  deviceId: string;
  policyId: string;
  requirementId?: string;
  reason: string;
  justification: string;
  approvedBy: string;
  approvalDate: Date;
  expiryDate: Date;
  conditions: string[];
  reviewRequired: boolean;
  status: 'active' | 'expired' | 'revoked' | 'pending';
}

export interface RemediationPlan {
  id: string;
  deviceId: string;
  policyId: string;
  status: 'planned' | 'approved' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actions: RemediationAction[];
  schedule: {
    plannedStart: Date;
    plannedEnd: Date;
    actualStart?: Date;
    actualEnd?: Date;
  };
  approvals: {
    required: boolean;
    approver?: string;
    approvalDate?: Date;
    comments?: string;
  };
  impact: {
    riskLevel: 'low' | 'medium' | 'high';
    affectedSystems: string[];
    downtime: number; // minutes
    rollbackTime: number; // minutes
  };
}

export interface RemediationAction {
  id: string;
  planId: string;
  type: ComplianceAction['type'];
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  parameters: Record<string, any>;
  sequence: number;
  dependencies: string[]; // Other action IDs
  execution: {
    startTime?: Date;
    endTime?: Date;
    duration?: number; // milliseconds
    result?: {
      success: boolean;
      message: string;
      evidence: string[];
      rollbackRequired: boolean;
    };
  };
}

export interface ComplianceChange {
  id: string;
  deviceId: string;
  timestamp: Date;
  changeType: 'policy_added' | 'policy_removed' | 'requirement_added' | 'requirement_removed' | 'status_changed' | 'exemption_granted' | 'exemption_expired';
  description: string;
  details: {
    policyId?: string;
    requirementId?: string;
    oldValue?: string;
    newValue?: string;
    triggeredBy: 'manual' | 'automatic' | 'scheduled' | 'policy_update';
  };
  impact: {
    scoreChange: number;
    statusChange?: string;
    remediationRequired: boolean;
  };
}

export interface ComplianceReport {
  id: string;
  generatedDate: Date;
  reportType: 'device' | 'policy' | 'department' | 'summary' | 'trend';
  scope: {
    deviceIds?: string[];
    policyIds?: string[];
    departments?: string[];
    dateRange?: { start: Date; end: Date };
  };
  summary: {
    totalDevices: number;
    compliantDevices: number;
    nonCompliantDevices: number;
    averageScore: number;
    criticalViolations: number;
    exemptedDevices: number;
  };
  details: {
    deviceBreakdown: Record<string, number>;
    policyBreakdown: Record<string, number>;
    trendAnalysis: {
      scoreImprovement: number;
      newViolations: number;
      resolvedViolations: number;
    };
  };
  recommendations: string[];
  attachments: {
    detailedResults: string; // JSON data
    executiveSummary: string;
    actionPlan: string;
  };
}

export class DeviceComplianceService {
  private policies: Map<string, CompliancePolicy> = new Map();
  private deviceStatuses: Map<string, DeviceComplianceStatus> = new Map();
  private exemptions: Map<string, ComplianceExemption> = new Map();
  private remediationPlans: Map<string, RemediationPlan> = new Map();
  private complianceChanges: Map<string, ComplianceChange> = new Map();

  constructor() {
    this.initializeComplianceService();
  }

  /**
   * Initialize compliance service with sample data
   */
  private initializeComplianceService(): void {
    // Initialize sample compliance policies
    const samplePolicies: CompliancePolicy[] = [
      {
        id: 'policy-security-001',
        name: 'Windows Security Baseline',
        version: '2.0',
        category: 'security',
        severity: 'critical',
        scope: 'global',
        applicableTo: {
          deviceTypes: ['laptop', 'desktop', 'server'],
          operatingSystems: ['Windows 10', 'Windows 11', 'Windows Server 2019', 'Windows Server 2022']
        },
        requirements: [
          {
            id: 'req-001',
            name: 'Windows Defender Enabled',
            description: 'Windows Defender real-time protection must be enabled',
            type: 'configuration',
            severity: 'critical',
            checkMethod: 'registry',
            validation: {
              condition: 'equals',
              target: 'HKLM\\SOFTWARE\\Microsoft\\Windows Defender\\Real-Time Protection\\DisableRealtimeMonitoring',
              expectedValue: 0
            },
            remediation: {
              automatic: true,
              actions: [
                {
                  type: 'registry_set',
                  description: 'Enable Windows Defender real-time monitoring',
                  parameters: {
                    key: 'HKLM\\SOFTWARE\\Microsoft\\Windows Defender\\Real-Time Protection\\DisableRealtimeMonitoring',
                    value: 0,
                    type: 'DWORD'
                  },
                  riskLevel: 'low',
                  requiresRestart: false
                }
              ],
              userGuidance: ['Windows Defender will be automatically enabled', 'No user action required'],
              requiredApproval: false
            },
            exemptions: {
              allowed: true,
              maxDuration: 30,
              approvalRequired: true,
              justificationRequired: true
            }
          },
          {
            id: 'req-002',
            name: 'Automatic Updates Enabled',
            description: 'Windows automatic updates must be configured to install automatically',
            type: 'configuration',
            severity: 'high',
            checkMethod: 'registry',
            validation: {
              condition: 'equals',
              target: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\WindowsUpdate\\Auto Update\\AUOptions',
              expectedValue: 4
            },
            remediation: {
              automatic: true,
              actions: [
                {
                  type: 'registry_set',
                  description: 'Configure automatic updates',
                  parameters: {
                    key: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\WindowsUpdate\\Auto Update\\AUOptions',
                    value: 4,
                    type: 'DWORD'
                  },
                  riskLevel: 'low',
                  requiresRestart: false
                }
              ],
              userGuidance: ['Automatic updates will be enabled', 'System may restart for updates'],
              requiredApproval: false
            },
            exemptions: {
              allowed: false,
              maxDuration: 0,
              approvalRequired: false,
              justificationRequired: false
            }
          }
        ],
        compliance: {
          standard: 'NIST Cybersecurity Framework',
          section: 'PR.DS-6',
          description: 'Integrity checking mechanisms are used to verify software, firmware, and information integrity'
        },
        createdBy: 'security.admin@secureflow.com',
        createdDate: new Date('2025-01-01'),
        lastModified: new Date('2025-07-01'),
        effectiveDate: new Date('2025-01-15'),
        status: 'active'
      },
      {
        id: 'policy-software-001',
        name: 'Prohibited Software Policy',
        version: '1.5',
        category: 'software',
        severity: 'high',
        scope: 'global',
        applicableTo: {
          deviceTypes: ['laptop', 'desktop'],
          operatingSystems: ['Windows 10', 'Windows 11', 'macOS', 'Ubuntu']
        },
        requirements: [
          {
            id: 'req-003',
            name: 'No Peer-to-Peer Software',
            description: 'Peer-to-peer file sharing software must not be installed',
            type: 'software_absence',
            severity: 'high',
            checkMethod: 'file_system',
            validation: {
              condition: 'not_exists',
              target: 'C:\\Program Files\\BitTorrent\\bittorrent.exe'
            },
            remediation: {
              automatic: true,
              actions: [
                {
                  type: 'software_uninstall',
                  description: 'Uninstall BitTorrent client',
                  parameters: {
                    productName: 'BitTorrent',
                    silentUninstall: true
                  },
                  riskLevel: 'low',
                  requiresRestart: false
                }
              ],
              userGuidance: ['Prohibited software will be removed', 'Contact IT for approved alternatives'],
              requiredApproval: false
            },
            exemptions: {
              allowed: true,
              maxDuration: 7,
              approvalRequired: true,
              justificationRequired: true
            }
          },
          {
            id: 'req-004',
            name: 'Approved Antivirus Required',
            description: 'An approved enterprise antivirus solution must be installed',
            type: 'software_presence',
            severity: 'critical',
            checkMethod: 'service',
            validation: {
              condition: 'exists',
              target: 'WinDefend|SentinelAgent|CrowdStrike'
            },
            remediation: {
              automatic: false,
              actions: [
                {
                  type: 'notify',
                  description: 'Notify IT for antivirus installation',
                  parameters: {
                    recipients: ['it-support@secureflow.com'],
                    urgency: 'high'
                  },
                  riskLevel: 'medium',
                  requiresRestart: false
                }
              ],
              userGuidance: ['Contact IT immediately for antivirus installation', 'Device may be isolated until compliant'],
              requiredApproval: true
            },
            exemptions: {
              allowed: false,
              maxDuration: 0,
              approvalRequired: false,
              justificationRequired: false
            }
          }
        ],
        compliance: {
          standard: 'ISO 27001',
          section: 'A.12.2.1',
          description: 'Controls against malware'
        },
        createdBy: 'policy.admin@secureflow.com',
        createdDate: new Date('2025-02-01'),
        lastModified: new Date('2025-06-15'),
        effectiveDate: new Date('2025-02-15'),
        status: 'active'
      },
      {
        id: 'policy-network-001',
        name: 'Network Security Configuration',
        version: '1.0',
        category: 'network',
        severity: 'high',
        scope: 'global',
        applicableTo: {
          deviceTypes: ['laptop', 'desktop', 'server'],
          operatingSystems: ['Windows 10', 'Windows 11', 'Windows Server 2019', 'Windows Server 2022', 'Ubuntu', 'CentOS']
        },
        requirements: [
          {
            id: 'req-005',
            name: 'Firewall Enabled',
            description: 'Host-based firewall must be enabled and configured',
            type: 'configuration',
            severity: 'high',
            checkMethod: 'service',
            validation: {
              condition: 'equals',
              target: 'MpsSvc',
              expectedValue: 'Running'
            },
            remediation: {
              automatic: true,
              actions: [
                {
                  type: 'service_start',
                  description: 'Start Windows Firewall service',
                  parameters: {
                    serviceName: 'MpsSvc',
                    startType: 'Automatic'
                  },
                  riskLevel: 'low',
                  requiresRestart: false
                }
              ],
              userGuidance: ['Windows Firewall will be enabled', 'Some applications may prompt for network access'],
              requiredApproval: false
            },
            exemptions: {
              allowed: true,
              maxDuration: 14,
              approvalRequired: true,
              justificationRequired: true
            }
          }
        ],
        compliance: {
          standard: 'NIST Cybersecurity Framework',
          section: 'PR.AC-4',
          description: 'Access permissions and authorizations are managed, incorporating the principles of least privilege and separation of duties'
        },
        createdBy: 'network.admin@secureflow.com',
        createdDate: new Date('2025-03-01'),
        lastModified: new Date('2025-03-01'),
        effectiveDate: new Date('2025-03-15'),
        status: 'active'
      }
    ];

    samplePolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });

    this.initializeSampleDeviceStatuses();
    this.initializeSampleExemptions();
  }

  /**
   * Initialize sample device compliance statuses
   */
  private initializeSampleDeviceStatuses(): void {
    const deviceIds = ['dev-laptop-001', 'dev-mobile-002', 'dev-server-003', 'dev-iot-004'];
    
    deviceIds.forEach((deviceId, index) => {
      const baseScore = 75 + (index * 5); // Varying scores
      const complianceStatus: DeviceComplianceStatus = {
        deviceId,
        lastAssessment: new Date(Date.now() - index * 60 * 60 * 1000), // Staggered assessments
        overallStatus: baseScore >= 90 ? 'compliant' : baseScore >= 70 ? 'partial' : 'non_compliant',
        complianceScore: baseScore,
        riskScore: 100 - baseScore,
        policies: this.generateSamplePolicyResults(deviceId, baseScore),
        summary: {
          totalPolicies: 3,
          compliantPolicies: baseScore >= 90 ? 3 : baseScore >= 70 ? 2 : 1,
          nonCompliantPolicies: baseScore >= 90 ? 0 : baseScore >= 70 ? 1 : 2,
          exemptedPolicies: 0,
          criticalViolations: baseScore < 70 ? 2 : baseScore < 90 ? 1 : 0,
          pendingRemediation: baseScore < 90 ? 1 : 0
        },
        trends: {
          scoreHistory: [
            { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), score: baseScore - 5 },
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), score: baseScore - 2 },
            { date: new Date(), score: baseScore }
          ],
          recentChanges: []
        },
        nextAssessment: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
      };

      this.deviceStatuses.set(deviceId, complianceStatus);
    });
  }

  /**
   * Generate sample policy compliance results
   */
  private generateSamplePolicyResults(deviceId: string, baseScore: number): PolicyComplianceResult[] {
    const policies = Array.from(this.policies.values());
    
    return policies.map((policy, index) => {
      const policyScore = baseScore + (index * 2) - 5; // Slight variation per policy
      const isCompliant = policyScore >= 85;
      
      return {
        policyId: policy.id,
        policyName: policy.name,
        status: isCompliant ? 'compliant' : 'non_compliant',
        score: Math.max(0, Math.min(100, policyScore)),
        lastChecked: new Date(),
        requirements: policy.requirements.map((req, reqIndex) => {
          const reqPassed = policyScore >= 80 || reqIndex === 0; // First requirement usually passes
          
          return {
            requirementId: req.id,
            name: req.name,
            status: reqPassed ? 'pass' : 'fail',
            severity: req.severity,
            actualValue: reqPassed ? req.validation.expectedValue : 'non_compliant_value',
            expectedValue: req.validation.expectedValue,
            evidence: [`Checked ${req.validation.target}`, `Method: ${req.checkMethod}`],
            checkDetails: {
              method: req.checkMethod,
              target: req.validation.target,
              timestamp: new Date(),
              duration: 150 + Math.random() * 100 // 150-250ms
            },
            remediation: req.remediation.automatic ? {
              available: true,
              automatic: true,
              actions: req.remediation.actions,
              estimatedTime: 2,
              riskLevel: req.remediation.actions[0]?.riskLevel || 'low'
            } : undefined
          };
        })
      };
    });
  }

  /**
   * Initialize sample exemptions
   */
  private initializeSampleExemptions(): void {
    const sampleExemptions: ComplianceExemption[] = [
      {
        id: 'exemption-001',
        deviceId: 'dev-server-003',
        policyId: 'policy-security-001',
        requirementId: 'req-002',
        reason: 'Critical production server - updates managed separately',
        justification: 'Server is part of critical infrastructure with separate patch management process',
        approvedBy: 'security.manager@secureflow.com',
        approvalDate: new Date('2025-07-01'),
        expiryDate: new Date('2025-10-01'),
        conditions: [
          'Monthly security review required',
          'Alternative patching process in place',
          'Dedicated security monitoring'
        ],
        reviewRequired: true,
        status: 'active'
      }
    ];

    sampleExemptions.forEach(exemption => {
      this.exemptions.set(exemption.id, exemption);
    });
  }

  /**
   * Assess device compliance
   */
  async assessDeviceCompliance(deviceId: string): Promise<DeviceComplianceStatus> {
    // Simulate compliance assessment
    const policies = Array.from(this.policies.values());
    const policyResults: PolicyComplianceResult[] = [];
    
    let totalScore = 0;
    let totalWeight = 0;
    let criticalViolations = 0;
    let compliantPolicies = 0;
    let nonCompliantPolicies = 0;
    let exemptedPolicies = 0;
    let pendingRemediation = 0;

    for (const policy of policies) {
      // Check if device is applicable for this policy
      if (!this.isPolicyApplicable(policy, deviceId)) {
        continue;
      }

      // Check for exemptions
      const exemption = Array.from(this.exemptions.values()).find(
        e => e.deviceId === deviceId && e.policyId === policy.id && e.status === 'active'
      );

      if (exemption) {
        exemptedPolicies++;
        policyResults.push({
          policyId: policy.id,
          policyName: policy.name,
          status: 'exempted',
          score: 100, // Exempted policies don't affect score negatively
          lastChecked: new Date(),
          requirements: [],
          exemption
        });
        continue;
      }

      // Assess policy requirements
      const requirementResults: RequirementComplianceResult[] = [];
      let policyScore = 0;
      let policyWeight = 0;

      for (const requirement of policy.requirements) {
        const result = await this.checkRequirement(deviceId, requirement);
        requirementResults.push(result);

        const weight = this.getRequirementWeight(requirement.severity);
        policyWeight += weight;

        if (result.status === 'pass') {
          policyScore += weight * 100;
        } else if (result.status === 'fail' && requirement.severity === 'critical') {
          criticalViolations++;
        }

        if (result.status === 'fail' && result.remediation?.automatic) {
          pendingRemediation++;
        }
      }

      const finalPolicyScore = policyWeight > 0 ? policyScore / policyWeight : 0;
      const policyStatus = finalPolicyScore >= 85 ? 'compliant' : 
                          finalPolicyScore >= 50 ? 'partial' : 'non_compliant';

      if (policyStatus === 'compliant') {
        compliantPolicies++;
      } else {
        nonCompliantPolicies++;
      }

      policyResults.push({
        policyId: policy.id,
        policyName: policy.name,
        status: policyStatus,
        score: Math.round(finalPolicyScore),
        lastChecked: new Date(),
        requirements: requirementResults
      });

      const policyWeight_overall = this.getPolicyWeight(policy.severity);
      totalScore += finalPolicyScore * policyWeight_overall;
      totalWeight += policyWeight_overall;
    }

    const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const overallStatus = overallScore >= 90 ? 'compliant' : 
                         overallScore >= 70 ? 'partial' : 'non_compliant';

    const complianceStatus: DeviceComplianceStatus = {
      deviceId,
      lastAssessment: new Date(),
      overallStatus,
      complianceScore: overallScore,
      riskScore: Math.max(0, 100 - overallScore + (criticalViolations * 10)),
      policies: policyResults,
      summary: {
        totalPolicies: policyResults.length,
        compliantPolicies,
        nonCompliantPolicies,
        exemptedPolicies,
        criticalViolations,
        pendingRemediation
      },
      trends: {
        scoreHistory: [{ date: new Date(), score: overallScore }],
        recentChanges: []
      },
      nextAssessment: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    this.deviceStatuses.set(deviceId, complianceStatus);
    return complianceStatus;
  }

  /**
   * Check individual requirement
   */
  private async checkRequirement(deviceId: string, requirement: ComplianceRequirement): Promise<RequirementComplianceResult> {
    // Simulate requirement checking based on type and method
    const startTime = Date.now();
    
    // Simulate various check results
    const simulatedResults = {
      'req-001': { pass: true, actualValue: 0 }, // Windows Defender enabled
      'req-002': { pass: false, actualValue: 1 }, // Auto updates disabled
      'req-003': { pass: true, actualValue: 'not_found' }, // No P2P software
      'req-004': { pass: true, actualValue: 'WinDefend' }, // Antivirus present
      'req-005': { pass: false, actualValue: 'Stopped' } // Firewall disabled
    };

    const result = simulatedResults[requirement.id] || { pass: true, actualValue: requirement.validation.expectedValue };
    
    const duration = Date.now() - startTime;
    
    const requirementResult: RequirementComplianceResult = {
      requirementId: requirement.id,
      name: requirement.name,
      status: result.pass ? 'pass' : 'fail',
      severity: requirement.severity,
      actualValue: result.actualValue,
      expectedValue: requirement.validation.expectedValue,
      evidence: [
        `Target: ${requirement.validation.target}`,
        `Method: ${requirement.checkMethod}`,
        `Condition: ${requirement.validation.condition}`,
        `Result: ${result.actualValue}`
      ],
      checkDetails: {
        method: requirement.checkMethod,
        target: requirement.validation.target,
        timestamp: new Date(),
        duration
      }
    };

    // Add remediation info if requirement failed and remediation is available
    if (!result.pass && requirement.remediation.actions.length > 0) {
      requirementResult.remediation = {
        available: true,
        automatic: requirement.remediation.automatic,
        actions: requirement.remediation.actions,
        estimatedTime: 2, // minutes
        riskLevel: requirement.remediation.actions[0]?.riskLevel || 'low'
      };
    }

    return requirementResult;
  }

  /**
   * Execute automated remediation
   */
  async executeRemediation(deviceId: string, policyId: string, requirementId?: string): Promise<RemediationPlan> {
    const planId = `remediation-${deviceId}-${Date.now()}`;
    
    const plan: RemediationPlan = {
      id: planId,
      deviceId,
      policyId,
      status: 'planned',
      priority: 'medium',
      actions: [],
      schedule: {
        plannedStart: new Date(),
        plannedEnd: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      },
      approvals: {
        required: false
      },
      impact: {
        riskLevel: 'low',
        affectedSystems: [deviceId],
        downtime: 0,
        rollbackTime: 5
      }
    };

    // Find the policy and requirements to remediate
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error('Policy not found');
    }

    const requirements = requirementId ? 
      policy.requirements.filter(r => r.id === requirementId) : 
      policy.requirements;

    let sequence = 1;
    for (const requirement of requirements) {
      if (requirement.remediation.automatic) {
        for (const action of requirement.remediation.actions) {
          const remediationAction: RemediationAction = {
            id: `action-${sequence}`,
            planId,
            type: action.type,
            description: action.description,
            status: 'pending',
            parameters: action.parameters,
            sequence,
            dependencies: [],
            execution: {}
          };

          plan.actions.push(remediationAction);
          sequence++;
        }
      }
    }

    this.remediationPlans.set(planId, plan);

    // Start execution if no approval required
    if (!plan.approvals.required) {
      await this.startRemediationExecution(planId);
    }

    return plan;
  }

  /**
   * Start remediation execution
   */
  private async startRemediationExecution(planId: string): Promise<void> {
    const plan = this.remediationPlans.get(planId);
    if (!plan) return;

    plan.status = 'in_progress';
    plan.schedule.actualStart = new Date();

    // Execute actions in sequence
    for (const action of plan.actions) {
      action.status = 'in_progress';
      action.execution.startTime = new Date();

      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

      // Simulate success/failure
      const success = Math.random() > 0.1; // 90% success rate

      action.status = success ? 'completed' : 'failed';
      action.execution.endTime = new Date();
      action.execution.duration = action.execution.endTime.getTime() - action.execution.startTime.getTime();
      action.execution.result = {
        success,
        message: success ? 'Action completed successfully' : 'Action failed - see logs for details',
        evidence: success ? [`${action.type}_success.log`] : [`${action.type}_error.log`],
        rollbackRequired: !success
      };

      if (!success) {
        plan.status = 'failed';
        break;
      }
    }

    if (plan.status !== 'failed') {
      plan.status = 'completed';
    }

    plan.schedule.actualEnd = new Date();
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(scope: ComplianceReport['scope']): ComplianceReport {
    const deviceStatuses = Array.from(this.deviceStatuses.values());
    const policies = Array.from(this.policies.values());
    
    // Filter devices based on scope
    let filteredDevices = deviceStatuses;
    if (scope.deviceIds) {
      filteredDevices = deviceStatuses.filter(d => scope.deviceIds!.includes(d.deviceId));
    }

    const totalDevices = filteredDevices.length;
    const compliantDevices = filteredDevices.filter(d => d.overallStatus === 'compliant').length;
    const nonCompliantDevices = filteredDevices.filter(d => d.overallStatus === 'non_compliant').length;
    const exemptedDevices = filteredDevices.filter(d => d.overallStatus === 'exempted').length;
    const averageScore = totalDevices > 0 ? 
      Math.round(filteredDevices.reduce((sum, d) => sum + d.complianceScore, 0) / totalDevices) : 0;
    const criticalViolations = filteredDevices.reduce((sum, d) => sum + d.summary.criticalViolations, 0);

    const deviceBreakdown = filteredDevices.reduce((acc, device) => {
      acc[device.overallStatus] = (acc[device.overallStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const policyBreakdown = policies.reduce((acc, policy) => {
      const policyResults = filteredDevices.flatMap(d => d.policies.filter(p => p.policyId === policy.id));
      const compliant = policyResults.filter(p => p.status === 'compliant').length;
      acc[policy.name] = compliant;
      return acc;
    }, {} as Record<string, number>);

    const recommendations: string[] = [];
    
    if (nonCompliantDevices > 0) {
      recommendations.push(`${nonCompliantDevices} devices are non-compliant and require immediate attention`);
    }
    
    if (criticalViolations > 0) {
      recommendations.push(`${criticalViolations} critical violations detected - prioritize remediation`);
    }
    
    if (averageScore < 80) {
      recommendations.push('Overall compliance score is below target - review policies and remediation processes');
    }

    const pendingRemediation = filteredDevices.reduce((sum, d) => sum + d.summary.pendingRemediation, 0);
    if (pendingRemediation > 0) {
      recommendations.push(`${pendingRemediation} automated remediations are available and should be executed`);
    }

    return {
      id: `report-${Date.now()}`,
      generatedDate: new Date(),
      reportType: 'summary',
      scope,
      summary: {
        totalDevices,
        compliantDevices,
        nonCompliantDevices,
        averageScore,
        criticalViolations,
        exemptedDevices
      },
      details: {
        deviceBreakdown,
        policyBreakdown,
        trendAnalysis: {
          scoreImprovement: 5, // Simulated
          newViolations: 2,
          resolvedViolations: 8
        }
      },
      recommendations,
      attachments: {
        detailedResults: JSON.stringify(filteredDevices, null, 2),
        executiveSummary: 'Executive summary content...',
        actionPlan: 'Action plan content...'
      }
    };
  }

  /**
   * Helper methods
   */
  private isPolicyApplicable(policy: CompliancePolicy, deviceId: string): boolean {
    // Simplified logic - in real implementation, would check device properties
    return policy.status === 'active' && new Date() >= policy.effectiveDate;
  }

  private getRequirementWeight(severity: ComplianceRequirement['severity']): number {
    switch (severity) {
      case 'critical': return 10;
      case 'high': return 7;
      case 'medium': return 5;
      case 'low': return 3;
      case 'info': return 1;
      default: return 5;
    }
  }

  private getPolicyWeight(severity: CompliancePolicy['severity']): number {
    switch (severity) {
      case 'critical': return 10;
      case 'high': return 7;
      case 'medium': return 5;
      case 'low': return 3;
      case 'info': return 1;
      default: return 5;
    }
  }

  /**
   * Public methods for external access
   */
  getPolicies(): CompliancePolicy[] {
    return Array.from(this.policies.values());
  }

  getPolicy(policyId: string): CompliancePolicy | undefined {
    return this.policies.get(policyId);
  }

  getDeviceStatus(deviceId: string): DeviceComplianceStatus | undefined {
    return this.deviceStatuses.get(deviceId);
  }

  getAllDeviceStatuses(): DeviceComplianceStatus[] {
    return Array.from(this.deviceStatuses.values());
  }

  getExemptions(): ComplianceExemption[] {
    return Array.from(this.exemptions.values());
  }

  getRemediationPlans(): RemediationPlan[] {
    return Array.from(this.remediationPlans.values());
  }

  getRemediationPlan(planId: string): RemediationPlan | undefined {
    return this.remediationPlans.get(planId);
  }
}

export default DeviceComplianceService;
