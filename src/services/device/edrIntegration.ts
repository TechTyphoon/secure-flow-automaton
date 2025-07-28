/**
 * EDR (Endpoint Detection and Response) Integration Service
 * Provides comprehensive endpoint security monitoring and threat response
 * Integrates with multiple EDR solutions for real-time security assessment
 */

export interface EDRProvider {
  id: string;
  name: string;
  type: 'crowdstrike' | 'sentinelone' | 'carbonblack' | 'defender' | 'custom';
  endpoint: string;
  apiKey: string;
  region?: string;
  version: string;
  capabilities: EDRCapability[];
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  lastSync: Date;
  configuration: {
    scanInterval: number; // minutes
    alertThreshold: 'low' | 'medium' | 'high' | 'critical';
    autoResponse: boolean;
    quarantineEnabled: boolean;
    reportingEnabled: boolean;
  };
}

export interface EDRCapability {
  type: 'malware_detection' | 'behavior_analysis' | 'network_monitoring' | 'file_integrity' | 'process_monitoring' | 'memory_analysis' | 'threat_hunting';
  enabled: boolean;
  confidence: number; // 0-100
  lastUpdated: Date;
}

export interface EDREndpoint {
  deviceId: string;
  edrDeviceId: string;
  providerId: string;
  hostname: string;
  ipAddress: string;
  macAddress: string;
  os: {
    platform: string;
    version: string;
    architecture: string;
  };
  agent: {
    version: string;
    status: 'online' | 'offline' | 'installing' | 'error';
    lastCheckIn: Date;
    installDate: Date;
    configuration: {
      realTimeProtection: boolean;
      behaviorMonitoring: boolean;
      networkInspection: boolean;
      cloudAnalysis: boolean;
    };
  };
  policies: string[];
  exclusions: EDRExclusion[];
  lastScan: Date;
  riskScore: number; // 0-100
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface EDRExclusion {
  id: string;
  type: 'file' | 'folder' | 'process' | 'registry' | 'network';
  value: string;
  reason: string;
  createdBy: string;
  createdDate: Date;
  expiryDate?: Date;
  scope: 'global' | 'device_specific';
}

export interface EDRAlert {
  id: string;
  providerId: string;
  deviceId: string;
  alertType: 'malware' | 'suspicious_behavior' | 'policy_violation' | 'network_anomaly' | 'data_exfiltration' | 'privilege_escalation' | 'persistence' | 'lateral_movement';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved' | 'suppressed';
  title: string;
  description: string;
  timestamp: Date;
  detectionMethod: 'signature' | 'behavior' | 'machine_learning' | 'heuristic' | 'cloud_analysis';
  confidence: number; // 0-100
  riskScore: number; // 0-100
  evidence: EDREvidence[];
  indicators: IOCIndicator[];
  mitreAttack: {
    tactics: string[];
    techniques: string[];
    subTechniques: string[];
  };
  response: {
    automated: boolean;
    actions: EDRResponseAction[];
    analyst: string;
    notes: string[];
    timeline: EDRTimelineEvent[];
  };
}

export interface EDREvidence {
  type: 'file' | 'process' | 'network' | 'registry' | 'memory' | 'behavioral';
  category: 'artifact' | 'indicator' | 'context';
  data: {
    name: string;
    path?: string;
    hash?: string;
    size?: number;
    timestamp: Date;
    attributes?: Record<string, any>;
  };
  analysis: {
    verdict: 'clean' | 'suspicious' | 'malicious' | 'unknown';
    confidence: number;
    reasoning: string[];
  };
}

export interface IOCIndicator {
  type: 'file_hash' | 'ip_address' | 'domain' | 'url' | 'email' | 'process_name' | 'registry_key';
  value: string;
  source: 'internal' | 'threat_intel' | 'community' | 'vendor';
  severity: 'low' | 'medium' | 'high' | 'critical';
  firstSeen: Date;
  lastSeen: Date;
  context: {
    campaign?: string;
    malwareFamily?: string;
    threatActor?: string;
    description?: string;
  };
}

export interface EDRResponseAction {
  id: string;
  type: 'isolate' | 'quarantine' | 'kill_process' | 'delete_file' | 'block_network' | 'collect_forensics' | 'notify' | 'escalate';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  executor: 'system' | 'analyst' | 'automated_response';
  parameters: Record<string, any>;
  result: {
    success: boolean;
    message: string;
    evidence?: string[];
  };
}

export interface EDRTimelineEvent {
  timestamp: Date;
  event: string;
  details: string;
  actor: 'system' | 'analyst' | 'user';
  impact: 'none' | 'low' | 'medium' | 'high';
}

export interface EDRScanResult {
  deviceId: string;
  scanId: string;
  scanType: 'quick' | 'full' | 'custom' | 'scheduled';
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  statistics: {
    filesScanned: number;
    threatsFound: number;
    threatsRemoved: number;
    suspiciousItems: number;
    errorsEncountered: number;
  };
  findings: {
    malware: EDRFinding[];
    suspicious: EDRFinding[];
    vulnerabilities: EDRFinding[];
  };
  recommendations: string[];
}

export interface EDRFinding {
  id: string;
  type: 'malware' | 'pua' | 'vulnerability' | 'configuration' | 'behavioral';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  name: string;
  description: string;
  location: string;
  action: 'quarantined' | 'deleted' | 'allowed' | 'requires_action';
  confidence: number;
  evidence: string[];
}

export interface EDRComplianceStatus {
  deviceId: string;
  providerId: string;
  overallStatus: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
  lastAssessment: Date;
  requirements: EDRRequirement[];
  score: number; // 0-100
  recommendations: string[];
}

export interface EDRRequirement {
  id: string;
  category: 'agent_deployment' | 'policy_compliance' | 'threat_protection' | 'data_collection' | 'response_capability';
  name: string;
  description: string;
  status: 'met' | 'not_met' | 'partial' | 'not_applicable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string[];
  remediation: string[];
}

export class EDRIntegrationService {
  private providers: Map<string, EDRProvider> = new Map();
  private endpoints: Map<string, EDREndpoint> = new Map();
  private alerts: Map<string, EDRAlert> = new Map();
  private scanResults: Map<string, EDRScanResult> = new Map();
  private exclusions: Map<string, EDRExclusion> = new Map();

  constructor() {
    this.initializeEDRService();
  }

  /**
   * Initialize EDR service with sample data
   */
  private initializeEDRService(): void {
    // Initialize sample EDR providers
    const sampleProviders: EDRProvider[] = [
      {
        id: 'crowdstrike-001',
        name: 'CrowdStrike Falcon',
        type: 'crowdstrike',
        endpoint: 'https://api.crowdstrike.com',
        apiKey: 'cs-api-key-encrypted',
        region: 'us-1',
        version: '6.52.15907.0',
        capabilities: [
          { type: 'malware_detection', enabled: true, confidence: 98, lastUpdated: new Date() },
          { type: 'behavior_analysis', enabled: true, confidence: 95, lastUpdated: new Date() },
          { type: 'network_monitoring', enabled: true, confidence: 92, lastUpdated: new Date() },
          { type: 'threat_hunting', enabled: true, confidence: 96, lastUpdated: new Date() }
        ],
        status: 'active',
        lastSync: new Date(),
        configuration: {
          scanInterval: 60,
          alertThreshold: 'medium',
          autoResponse: true,
          quarantineEnabled: true,
          reportingEnabled: true
        }
      },
      {
        id: 'sentinel-001',
        name: 'SentinelOne Singularity',
        type: 'sentinelone',
        endpoint: 'https://api.sentinelone.com',
        apiKey: 's1-api-key-encrypted',
        version: '23.3.2.11',
        capabilities: [
          { type: 'malware_detection', enabled: true, confidence: 97, lastUpdated: new Date() },
          { type: 'behavior_analysis', enabled: true, confidence: 94, lastUpdated: new Date() },
          { type: 'process_monitoring', enabled: true, confidence: 93, lastUpdated: new Date() },
          { type: 'memory_analysis', enabled: true, confidence: 89, lastUpdated: new Date() }
        ],
        status: 'active',
        lastSync: new Date(),
        configuration: {
          scanInterval: 30,
          alertThreshold: 'high',
          autoResponse: false,
          quarantineEnabled: true,
          reportingEnabled: true
        }
      },
      {
        id: 'defender-001',
        name: 'Microsoft Defender for Endpoint',
        type: 'defender',
        endpoint: 'https://api.securitycenter.microsoft.com',
        apiKey: 'mde-api-key-encrypted',
        version: '10.8750.22621.2428',
        capabilities: [
          { type: 'malware_detection', enabled: true, confidence: 94, lastUpdated: new Date() },
          { type: 'behavior_analysis', enabled: true, confidence: 91, lastUpdated: new Date() },
          { type: 'network_monitoring', enabled: true, confidence: 88, lastUpdated: new Date() },
          { type: 'file_integrity', enabled: true, confidence: 92, lastUpdated: new Date() }
        ],
        status: 'active',
        lastSync: new Date(),
        configuration: {
          scanInterval: 45,
          alertThreshold: 'medium',
          autoResponse: true,
          quarantineEnabled: false,
          reportingEnabled: true
        }
      }
    ];

    sampleProviders.forEach(provider => {
      this.providers.set(provider.id, provider);
    });

    this.initializeSampleEndpoints();
    this.initializeSampleAlerts();
    this.initializeSampleExclusions();
  }

  /**
   * Initialize sample endpoints
   */
  private initializeSampleEndpoints(): void {
    const sampleEndpoints: EDREndpoint[] = [
      {
        deviceId: 'dev-laptop-001',
        edrDeviceId: 'cs-dev-001-abcd1234',
        providerId: 'crowdstrike-001',
        hostname: 'CORP-LAPTOP-JS001',
        ipAddress: '192.168.1.101',
        macAddress: '00:1B:44:11:3A:B7',
        os: {
          platform: 'Windows 11 Pro',
          version: '23H2',
          architecture: 'x64'
        },
        agent: {
          version: '6.52.15907.0',
          status: 'online',
          lastCheckIn: new Date(),
          installDate: new Date('2025-07-15'),
          configuration: {
            realTimeProtection: true,
            behaviorMonitoring: true,
            networkInspection: true,
            cloudAnalysis: true
          }
        },
        policies: ['corporate-laptop-policy', 'high-privilege-policy'],
        exclusions: [],
        lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        riskScore: 15,
        threatLevel: 'low'
      },
      {
        deviceId: 'dev-mobile-002',
        edrDeviceId: 's1-mob-002-efgh5678',
        providerId: 'sentinel-001',
        hostname: 'iPhone-SJ-15Pro',
        ipAddress: '192.168.1.102',
        macAddress: '02:1B:44:22:4A:C8',
        os: {
          platform: 'iOS',
          version: '17.1.2',
          architecture: 'arm64'
        },
        agent: {
          version: '23.3.2.11',
          status: 'online',
          lastCheckIn: new Date(),
          installDate: new Date('2025-07-20'),
          configuration: {
            realTimeProtection: true,
            behaviorMonitoring: true,
            networkInspection: false,
            cloudAnalysis: true
          }
        },
        policies: ['mobile-device-policy'],
        exclusions: [],
        lastScan: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        riskScore: 8,
        threatLevel: 'none'
      },
      {
        deviceId: 'dev-server-003',
        edrDeviceId: 'mde-srv-003-ijkl9012',
        providerId: 'defender-001',
        hostname: 'PROD-WEB-01',
        ipAddress: '10.0.1.10',
        macAddress: '00:1B:44:33:5B:D9',
        os: {
          platform: 'Ubuntu Server',
          version: '22.04.3 LTS',
          architecture: 'x64'
        },
        agent: {
          version: '10.8750.22621.2428',
          status: 'online',
          lastCheckIn: new Date(),
          installDate: new Date('2025-07-10'),
          configuration: {
            realTimeProtection: true,
            behaviorMonitoring: true,
            networkInspection: true,
            cloudAnalysis: false // Compliance requirement
          }
        },
        policies: ['server-security-policy', 'critical-system-policy'],
        exclusions: [],
        lastScan: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        riskScore: 25,
        threatLevel: 'low'
      }
    ];

    sampleEndpoints.forEach(endpoint => {
      this.endpoints.set(endpoint.deviceId, endpoint);
    });
  }

  /**
   * Initialize sample alerts
   */
  private initializeSampleAlerts(): void {
    const sampleAlerts: EDRAlert[] = [
      {
        id: 'alert-001',
        providerId: 'crowdstrike-001',
        deviceId: 'dev-laptop-001',
        alertType: 'suspicious_behavior',
        severity: 'medium',
        status: 'investigating',
        title: 'Suspicious PowerShell Execution',
        description: 'Detected PowerShell execution with obfuscated commands and potential privilege escalation attempts',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        detectionMethod: 'behavior',
        confidence: 87,
        riskScore: 65,
        evidence: [
          {
            type: 'process',
            category: 'artifact',
            data: {
              name: 'powershell.exe',
              path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
              hash: 'a4b3c2d1e5f6789012345abcdef67890',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              attributes: {
                commandLine: 'powershell.exe -encodedCommand JABhAGIAYwBkAGUAZgA=',
                parentProcess: 'explorer.exe',
                userId: 'CORP\\john.smith'
              }
            },
            analysis: {
              verdict: 'suspicious',
              confidence: 87,
              reasoning: ['Encoded command execution', 'Unusual parent process', 'Non-standard execution path']
            }
          }
        ],
        indicators: [
          {
            type: 'process_name',
            value: 'powershell.exe',
            source: 'internal',
            severity: 'medium',
            firstSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
            context: {
              description: 'PowerShell with encoded commands'
            }
          }
        ],
        mitreAttack: {
          tactics: ['TA0002'], // Execution
          techniques: ['T1059.001'], // PowerShell
          subTechniques: []
        },
        response: {
          automated: false,
          actions: [
            {
              id: 'action-001',
              type: 'collect_forensics',
              status: 'completed',
              timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
              executor: 'automated_response',
              parameters: { processId: '1234', collectMemory: true },
              result: {
                success: true,
                message: 'Forensic data collected successfully',
                evidence: ['memory_dump_001.dmp', 'process_timeline.json']
              }
            }
          ],
          analyst: 'security.analyst@secureflow.com',
          notes: ['Initial triage completed', 'Escalating for manual analysis'],
          timeline: [
            {
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              event: 'Alert Generated',
              details: 'Suspicious PowerShell behavior detected',
              actor: 'system',
              impact: 'medium'
            },
            {
              timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
              event: 'Forensics Collection Started',
              details: 'Automated collection of process artifacts',
              actor: 'system',
              impact: 'low'
            }
          ]
        }
      },
      {
        id: 'alert-002',
        providerId: 'sentinel-001',
        deviceId: 'dev-server-003',
        alertType: 'network_anomaly',
        severity: 'high',
        status: 'new',
        title: 'Unusual Outbound Network Traffic',
        description: 'Server establishing connections to multiple external IPs with high data volume transfer',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        detectionMethod: 'machine_learning',
        confidence: 92,
        riskScore: 78,
        evidence: [
          {
            type: 'network',
            category: 'indicator',
            data: {
              name: 'Outbound Connection',
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              attributes: {
                destinationIps: ['185.234.217.42', '91.189.94.156', '203.0.113.45'],
                ports: [443, 8080, 9001],
                bytesTransferred: 2048576000, // ~2GB
                protocol: 'TCP'
              }
            },
            analysis: {
              verdict: 'suspicious',
              confidence: 92,
              reasoning: ['High data volume', 'Multiple unknown destinations', 'Unusual time pattern']
            }
          }
        ],
        indicators: [
          {
            type: 'ip_address',
            value: '185.234.217.42',
            source: 'threat_intel',
            severity: 'high',
            firstSeen: new Date(Date.now() - 30 * 60 * 1000),
            lastSeen: new Date(Date.now() - 30 * 60 * 1000),
            context: {
              description: 'Known C2 infrastructure'
            }
          }
        ],
        mitreAttack: {
          tactics: ['TA0011'], // Command and Control
          techniques: ['T1071.001'], // Application Layer Protocol: Web Protocols
          subTechniques: []
        },
        response: {
          automated: true,
          actions: [
            {
              id: 'action-002',
              type: 'block_network',
              status: 'completed',
              timestamp: new Date(Date.now() - 25 * 60 * 1000),
              executor: 'automated_response',
              parameters: { 
                ips: ['185.234.217.42', '91.189.94.156', '203.0.113.45'],
                duration: 3600 // 1 hour
              },
              result: {
                success: true,
                message: 'Network traffic blocked successfully',
                evidence: ['firewall_rules.json']
              }
            }
          ],
          analyst: '',
          notes: [],
          timeline: [
            {
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              event: 'Alert Generated',
              details: 'Anomalous network traffic detected',
              actor: 'system',
              impact: 'high'
            },
            {
              timestamp: new Date(Date.now() - 25 * 60 * 1000),
              event: 'Automated Response Executed',
              details: 'Network traffic blocked to suspicious IPs',
              actor: 'system',
              impact: 'medium'
            }
          ]
        }
      }
    ];

    sampleAlerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
    });
  }

  /**
   * Initialize sample exclusions
   */
  private initializeSampleExclusions(): void {
    const sampleExclusions: EDRExclusion[] = [
      {
        id: 'excl-001',
        type: 'folder',
        value: '/opt/secureflow/temp',
        reason: 'Application temporary files - approved by security team',
        createdBy: 'security.admin@secureflow.com',
        createdDate: new Date('2025-07-01'),
        expiryDate: new Date('2026-07-01'),
        scope: 'global'
      },
      {
        id: 'excl-002',
        type: 'process',
        value: 'backup_agent.exe',
        reason: 'Approved backup software - generates false positives',
        createdBy: 'it.admin@secureflow.com',
        createdDate: new Date('2025-06-15'),
        scope: 'device_specific'
      }
    ];

    sampleExclusions.forEach(exclusion => {
      this.exclusions.set(exclusion.id, exclusion);
    });
  }

  /**
   * Add EDR provider
   */
  async addProvider(provider: Omit<EDRProvider, 'id' | 'lastSync'>): Promise<string> {
    const providerId = `${provider.type}-${Date.now()}`;
    const newProvider: EDRProvider = {
      ...provider,
      id: providerId,
      lastSync: new Date()
    };

    this.providers.set(providerId, newProvider);
    return providerId;
  }

  /**
   * Register endpoint with EDR provider
   */
  async registerEndpoint(
    deviceId: string, 
    providerId: string, 
    endpointData: Partial<EDREndpoint>
  ): Promise<EDREndpoint> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error('EDR provider not found');
    }

    const endpoint: EDREndpoint = {
      deviceId,
      edrDeviceId: `${provider.type}-${deviceId}-${Date.now()}`,
      providerId,
      hostname: endpointData.hostname || 'unknown',
      ipAddress: endpointData.ipAddress || '0.0.0.0',
      macAddress: endpointData.macAddress || '00:00:00:00:00:00',
      os: endpointData.os || { platform: 'unknown', version: 'unknown', architecture: 'unknown' },
      agent: {
        version: provider.version,
        status: 'installing',
        lastCheckIn: new Date(),
        installDate: new Date(),
        configuration: {
          realTimeProtection: true,
          behaviorMonitoring: true,
          networkInspection: true,
          cloudAnalysis: true
        }
      },
      policies: [],
      exclusions: [],
      lastScan: new Date(0),
      riskScore: 50, // Initial neutral score
      threatLevel: 'none'
    };

    this.endpoints.set(deviceId, endpoint);
    return endpoint;
  }

  /**
   * Perform endpoint scan
   */
  async performScan(
    deviceId: string, 
    scanType: EDRScanResult['scanType'] = 'quick'
  ): Promise<EDRScanResult> {
    const endpoint = this.endpoints.get(deviceId);
    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    const scanId = `scan-${deviceId}-${Date.now()}`;
    const startTime = new Date();

    // Simulate scan execution
    const scanResult: EDRScanResult = {
      deviceId,
      scanId,
      scanType,
      status: 'running',
      startTime,
      statistics: {
        filesScanned: 0,
        threatsFound: 0,
        threatsRemoved: 0,
        suspiciousItems: 0,
        errorsEncountered: 0
      },
      findings: {
        malware: [],
        suspicious: [],
        vulnerabilities: []
      },
      recommendations: []
    };

    this.scanResults.set(scanId, scanResult);

    // Simulate scan completion after a delay
    setTimeout(() => {
      this.completeScan(scanId, scanType);
    }, scanType === 'full' ? 5000 : 2000);

    return scanResult;
  }

  /**
   * Complete scan simulation
   */
  private completeScan(scanId: string, scanType: EDRScanResult['scanType']): void {
    const scanResult = this.scanResults.get(scanId);
    if (!scanResult) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - scanResult.startTime.getTime()) / 1000);

    // Simulate scan results based on type
    let filesScanned = scanType === 'full' ? 150000 : 25000;
    let threatsFound = Math.floor(Math.random() * 3);
    let suspiciousItems = Math.floor(Math.random() * 5);

    const findings: EDRFinding[] = [];

    // Add some sample findings
    if (threatsFound > 0) {
      findings.push({
        id: `finding-${Date.now()}-1`,
        type: 'malware',
        severity: 'high',
        name: 'Trojan.Generic.Suspicious',
        description: 'Generic trojan detected in downloaded file',
        location: 'C:\\Users\\john.smith\\Downloads\\suspicious_file.exe',
        action: 'quarantined',
        confidence: 95,
        evidence: ['file_hash_analysis', 'behavioral_detection']
      });
    }

    if (suspiciousItems > 0) {
      findings.push({
        id: `finding-${Date.now()}-2`,
        type: 'pua',
        severity: 'medium',
        name: 'PUA.Adware.Generic',
        description: 'Potentially unwanted adware application',
        location: 'C:\\Program Files\\AdwareApp\\app.exe',
        action: 'requires_action',
        confidence: 78,
        evidence: ['signature_match', 'reputation_analysis']
      });
    }

    scanResult.status = 'completed';
    scanResult.endTime = endTime;
    scanResult.duration = duration;
    scanResult.statistics = {
      filesScanned,
      threatsFound,
      threatsRemoved: threatsFound,
      suspiciousItems,
      errorsEncountered: 0
    };
    
    scanResult.findings = {
      malware: findings.filter(f => f.type === 'malware'),
      suspicious: findings.filter(f => f.type === 'pua'),
      vulnerabilities: findings.filter(f => f.type === 'vulnerability')
    };

    scanResult.recommendations = [
      'Update endpoint agent to latest version',
      'Review and approve quarantined items',
      'Consider additional security training for users'
    ];

    // Update endpoint last scan time
    const endpoint = this.endpoints.get(scanResult.deviceId);
    if (endpoint) {
      endpoint.lastScan = endTime;
      endpoint.riskScore = Math.max(0, endpoint.riskScore - (threatsFound * 10));
    }
  }

  /**
   * Generate compliance assessment
   */
  generateComplianceAssessment(deviceId: string): EDRComplianceStatus {
    const endpoint = this.endpoints.get(deviceId);
    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    const provider = this.providers.get(endpoint.providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    const requirements: EDRRequirement[] = [
      {
        id: 'req-001',
        category: 'agent_deployment',
        name: 'EDR Agent Installed',
        description: 'EDR agent must be installed and running on the endpoint',
        status: endpoint.agent.status === 'online' ? 'met' : 'not_met',
        severity: 'critical',
        evidence: [`Agent version: ${endpoint.agent.version}`, `Status: ${endpoint.agent.status}`],
        remediation: endpoint.agent.status !== 'online' ? ['Reinstall EDR agent', 'Check network connectivity'] : []
      },
      {
        id: 'req-002',
        category: 'policy_compliance',
        name: 'Security Policies Applied',
        description: 'Required security policies must be applied to the endpoint',
        status: endpoint.policies.length > 0 ? 'met' : 'not_met',
        severity: 'high',
        evidence: [`Applied policies: ${endpoint.policies.join(', ')}`],
        remediation: endpoint.policies.length === 0 ? ['Apply required security policies'] : []
      },
      {
        id: 'req-003',
        category: 'threat_protection',
        name: 'Real-time Protection Enabled',
        description: 'Real-time threat protection must be enabled',
        status: endpoint.agent.configuration.realTimeProtection ? 'met' : 'not_met',
        severity: 'critical',
        evidence: [`Real-time protection: ${endpoint.agent.configuration.realTimeProtection}`],
        remediation: !endpoint.agent.configuration.realTimeProtection ? ['Enable real-time protection'] : []
      },
      {
        id: 'req-004',
        category: 'data_collection',
        name: 'Regular Scanning',
        description: 'Endpoint must be scanned within the last 24 hours',
        status: (Date.now() - endpoint.lastScan.getTime()) < 24 * 60 * 60 * 1000 ? 'met' : 'not_met',
        severity: 'medium',
        evidence: [`Last scan: ${endpoint.lastScan.toISOString()}`],
        remediation: (Date.now() - endpoint.lastScan.getTime()) >= 24 * 60 * 60 * 1000 ? ['Perform immediate scan'] : []
      }
    ];

    const metRequirements = requirements.filter(req => req.status === 'met').length;
    const totalRequirements = requirements.length;
    const score = Math.round((metRequirements / totalRequirements) * 100);

    let overallStatus: EDRComplianceStatus['overallStatus'] = 'compliant';
    if (score < 100) {
      const criticalUnmet = requirements.some(req => req.status !== 'met' && req.severity === 'critical');
      overallStatus = criticalUnmet ? 'non_compliant' : 'partial';
    }

    const recommendations: string[] = [];
    requirements.forEach(req => {
      recommendations.push(...req.remediation);
    });

    return {
      deviceId,
      providerId: endpoint.providerId,
      overallStatus,
      lastAssessment: new Date(),
      requirements,
      score,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }

  /**
   * Generate comprehensive EDR report
   */
  generateEDRReport(): {
    summary: {
      totalEndpoints: number;
      activeProviders: number;
      totalAlerts: number;
      criticalAlerts: number;
      averageRiskScore: number;
    };
    endpointStatus: {
      online: number;
      offline: number;
      error: number;
    };
    threatLevels: Record<string, number>;
    recentAlerts: EDRAlert[];
    recommendations: string[];
  } {
    const endpoints = Array.from(this.endpoints.values());
    const alerts = Array.from(this.alerts.values());
    const providers = Array.from(this.providers.values());

    const summary = {
      totalEndpoints: endpoints.length,
      activeProviders: providers.filter(p => p.status === 'active').length,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      averageRiskScore: endpoints.length > 0 ? 
        Math.round(endpoints.reduce((sum, e) => sum + e.riskScore, 0) / endpoints.length) : 0
    };

    const endpointStatus = {
      online: endpoints.filter(e => e.agent.status === 'online').length,
      offline: endpoints.filter(e => e.agent.status === 'offline').length,
      error: endpoints.filter(e => e.agent.status === 'error').length
    };

    const threatLevels = endpoints.reduce((acc, endpoint) => {
      acc[endpoint.threatLevel] = (acc[endpoint.threatLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentAlerts = alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    const recommendations: string[] = [];
    
    if (endpointStatus.offline > 0) {
      recommendations.push(`${endpointStatus.offline} endpoints are offline - investigate connectivity issues`);
    }
    
    if (summary.criticalAlerts > 0) {
      recommendations.push(`${summary.criticalAlerts} critical alerts require immediate attention`);
    }
    
    if (summary.averageRiskScore > 30) {
      recommendations.push('Average risk score is elevated - review security posture');
    }

    const expiredExclusions = Array.from(this.exclusions.values())
      .filter(excl => excl.expiryDate && excl.expiryDate < new Date()).length;
    
    if (expiredExclusions > 0) {
      recommendations.push(`${expiredExclusions} security exclusions have expired and need review`);
    }

    return {
      summary,
      endpointStatus,
      threatLevels,
      recentAlerts,
      recommendations
    };
  }

  /**
   * Public methods for external access
   */
  getProviders(): EDRProvider[] {
    return Array.from(this.providers.values());
  }

  getEndpoints(): EDREndpoint[] {
    return Array.from(this.endpoints.values());
  }

  getEndpoint(deviceId: string): EDREndpoint | undefined {
    return this.endpoints.get(deviceId);
  }

  getAlerts(): EDRAlert[] {
    return Array.from(this.alerts.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getAlert(alertId: string): EDRAlert | undefined {
    return this.alerts.get(alertId);
  }

  getScanResults(): EDRScanResult[] {
    return Array.from(this.scanResults.values()).sort((a, b) => 
      b.startTime.getTime() - a.startTime.getTime()
    );
  }

  getScanResult(scanId: string): EDRScanResult | undefined {
    return this.scanResults.get(scanId);
  }

  getExclusions(): EDRExclusion[] {
    return Array.from(this.exclusions.values());
  }
}

export default EDRIntegrationService;
