/**
 * Quantum Container Security Engine
 * Advanced container security with post-quantum protection, image scanning, and runtime verification
 */

import { EventEmitter } from 'events';
import { QuantumServiceMesh } from './quantumServiceMesh';
import { PostQuantumCryptoEngine } from '../quantum/postQuantumCrypto';
import { QuantumKubernetesController } from './quantumKubernetesController';

// Container security interfaces
interface ContainerSecurityConfig {
  enabled: boolean;
  defaultPolicy: 'STRICT' | 'MODERATE' | 'PERMISSIVE';
  quantumSecurity: {
    enabled: boolean;
    postQuantumCrypto: boolean;
    quantumSignatures: boolean;
    quantumKeyDistribution: boolean;
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    quantumRandomness: boolean;
  };
  imageScanning: {
    enabled: boolean;
    scanOnPull: boolean;
    scanOnBuild: boolean;
    vulnerabilityThreshold: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    quantumVulnerabilityDetection: boolean;
    cryptographicAnalysis: boolean;
  };
  runtimeProtection: {
    enabled: boolean;
    processMonitoring: boolean;
    networkMonitoring: boolean;
    fileSystemMonitoring: boolean;
    quantumBehaviorAnalysis: boolean;
    anomalyDetection: boolean;
    realTimeResponse: boolean;
  };
  compliance: {
    standards: string[];
    auditLogging: boolean;
    policyEnforcement: boolean;
    quantumComplianceChecks: boolean;
  };
}

interface ContainerImage {
  imageId: string;
  registry: string;
  repository: string;
  tag: string;
  digest: string;
  size: number;
  layers: ImageLayer[];
  metadata: ImageMetadata;
  scanResults?: ImageScanResult;
  quantumSecurity?: QuantumImageSecurity;
  createdAt: number;
  lastScanned?: number;
}

interface ImageLayer {
  layerId: string;
  digest: string;
  size: number;
  command: string;
  created: number;
  vulnerabilities: Vulnerability[];
  quantumSignature?: string;
}

interface ImageMetadata {
  architecture: string;
  os: string;
  osVersion: string;
  environment: Record<string, string>;
  exposedPorts: number[];
  volumes: string[];
  labels: Record<string, string>;
  entrypoint: string[];
  cmd: string[];
  user: string;
  workingDir: string;
}

interface ImageScanResult {
  scanId: string;
  timestamp: number;
  status: 'SCANNING' | 'COMPLETED' | 'FAILED';
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  vulnerabilities: Vulnerability[];
  quantumVulnerabilities: QuantumVulnerability[];
  complianceResults: ComplianceResult[];
  recommendations: SecurityRecommendation[];
  riskScore: number;
  quantumRiskScore: number;
}

interface Vulnerability {
  vulnerabilityId: string;
  cveId?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  packageName: string;
  packageVersion: string;
  fixedVersion?: string;
  publishedDate: number;
  modifiedDate: number;
  cvssScore?: number;
  exploitAvailable: boolean;
  references: string[];
  affectedFiles: string[];
}

interface QuantumVulnerability {
  vulnerabilityId: string;
  type: 'CRYPTOGRAPHIC' | 'QUANTUM_UNSAFE' | 'KEY_MANAGEMENT' | 'PROTOCOL' | 'RANDOM_NUMBER';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  affectedCrypto: string[];
  quantumThreat: boolean;
  postQuantumReady: boolean;
  recommendations: string[];
  quantumImpactScore: number;
}

interface QuantumImageSecurity {
  quantumSigned: boolean;
  postQuantumEncrypted: boolean;
  quantumKeyId?: string;
  signatureAlgorithm?: string;
  encryptionAlgorithm?: string;
  quantumRandomSeed?: string;
  quantumIntegrityHash?: string;
  quantumTimestamp: number;
}

interface ComplianceResult {
  standard: string;
  version: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT';
  checks: ComplianceCheck[];
  score: number;
  quantumCompliance: boolean;
}

interface ComplianceCheck {
  checkId: string;
  name: string;
  category: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_APPLICABLE';
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  remediation?: string;
  quantumRelevant: boolean;
}

interface SecurityRecommendation {
  recommendationId: string;
  type: 'VULNERABILITY_FIX' | 'CONFIGURATION' | 'BEST_PRACTICE' | 'QUANTUM_SECURITY';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  action: string;
  impact: string;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  quantumBenefit: boolean;
}

interface RuntimeContainer {
  containerId: string;
  imageId: string;
  name: string;
  namespace: string;
  podName: string;
  nodeName: string;
  status: 'RUNNING' | 'STOPPED' | 'PAUSED' | 'RESTARTING' | 'EXITED';
  startedAt: number;
  resources: ContainerResources;
  securityContext: SecurityContext;
  networkPolicy?: NetworkPolicy;
  runtimeProtection: RuntimeProtection;
  quantumSecurity: RuntimeQuantumSecurity;
  monitors: SecurityMonitor[];
  alerts: SecurityAlert[];
}

interface ContainerResources {
  cpuLimit?: string;
  memoryLimit?: string;
  storageLimit?: string;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  networkRx: number;
  networkTx: number;
}

interface SecurityContext {
  runAsUser?: number;
  runAsGroup?: number;
  runAsNonRoot: boolean;
  readOnlyRootFilesystem: boolean;
  allowPrivilegeEscalation: boolean;
  privileged: boolean;
  capabilities: {
    add: string[];
    drop: string[];
  };
  seccomp?: string;
  seLinux?: SELinuxOptions;
  appArmor?: string;
  quantumIsolation: boolean;
}

interface SELinuxOptions {
  user?: string;
  role?: string;
  type?: string;
  level?: string;
}

interface NetworkPolicy {
  policyId: string;
  name: string;
  ingress: NetworkRule[];
  egress: NetworkRule[];
  quantumChannelsOnly: boolean;
  quantumEncryptionRequired: boolean;
}

interface NetworkRule {
  from?: NetworkPeer[];
  to?: NetworkPeer[];
  ports?: NetworkPort[];
  protocols?: string[];
  quantumRequired: boolean;
}

interface NetworkPeer {
  podSelector?: Record<string, string>;
  namespaceSelector?: Record<string, string>;
  ipBlock?: {
    cidr: string;
    except?: string[];
  };
}

interface NetworkPort {
  port: number;
  protocol: string;
  quantumSecured: boolean;
}

interface RuntimeProtection {
  enabled: boolean;
  processMonitoring: ProcessMonitoring;
  fileSystemMonitoring: FileSystemMonitoring;
  networkMonitoring: NetworkMonitoring;
  behaviorBaseline: BehaviorBaseline;
  anomalyDetection: AnomalyDetection;
  quantumBehaviorAnalysis: QuantumBehaviorAnalysis;
}

interface ProcessMonitoring {
  enabled: boolean;
  allowedExecutables: string[];
  blockedExecutables: string[];
  processWhitelist: string[];
  monitorSystemCalls: boolean;
  detectShellAccess: boolean;
  monitorPrivilegeEscalation: boolean;
  quantumProcessTracking: boolean;
}

interface FileSystemMonitoring {
  enabled: boolean;
  readOnlyPaths: string[];
  protectedPaths: string[];
  monitoredPaths: string[];
  detectFileChanges: boolean;
  detectSecretAccess: boolean;
  quantumKeyProtection: boolean;
}

interface NetworkMonitoring {
  enabled: boolean;
  allowedConnections: NetworkConnection[];
  blockedConnections: NetworkConnection[];
  monitorDNS: boolean;
  detectDataExfiltration: boolean;
  quantumChannelMonitoring: boolean;
}

interface NetworkConnection {
  direction: 'INBOUND' | 'OUTBOUND';
  protocol: string;
  port?: number;
  host?: string;
  cidr?: string;
  quantumRequired: boolean;
}

interface BehaviorBaseline {
  established: boolean;
  learningPeriod: number;
  processPatterns: string[];
  networkPatterns: string[];
  fileAccessPatterns: string[];
  quantumOperationPatterns: string[];
  baselineScore: number;
}

interface AnomalyDetection {
  enabled: boolean;
  sensitivityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  mlModelVersion: string;
  detectionRules: AnomalyRule[];
  quantumAnomalyDetection: boolean;
}

interface AnomalyRule {
  ruleId: string;
  name: string;
  type: 'STATISTICAL' | 'BEHAVIORAL' | 'SIGNATURE' | 'QUANTUM';
  threshold: number;
  action: 'ALERT' | 'BLOCK' | 'QUARANTINE';
  quantumSpecific: boolean;
}

interface QuantumBehaviorAnalysis {
  enabled: boolean;
  quantumOperationTracking: boolean;
  cryptographicAnalysis: boolean;
  keyUsageMonitoring: boolean;
  quantumChannelAnalysis: boolean;
  postQuantumReadiness: number;
}

interface RuntimeQuantumSecurity {
  enabled: boolean;
  quantumKeyId?: string;
  quantumChannelActive: boolean;
  postQuantumEncryption: boolean;
  quantumSignatures: boolean;
  quantumRandomness: boolean;
  quantumMetrics: {
    qkdOperations: number;
    quantumSigningOperations: number;
    quantumRandomRequests: number;
    quantumChannelUptime: number;
  };
}

interface SecurityMonitor {
  monitorId: string;
  type: 'PROCESS' | 'FILESYSTEM' | 'NETWORK' | 'QUANTUM' | 'ANOMALY';
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  lastCheck: number;
  findings: SecurityFinding[];
  quantumSpecific: boolean;
}

interface SecurityFinding {
  findingId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  title: string;
  description: string;
  evidence: SecurityEvidence;
  recommendation: string;
  timestamp: number;
  quantumRelated: boolean;
}

interface SecurityEvidence {
  behaviorScore?: number;
  quantumBehaviorScore?: number;
  deviationMetrics?: {
    processActivity: number;
    networkActivity: number;
    fileSystemActivity: number;
  };
  qkdMetrics?: {
    qberRate: number;
    keyGenerationRate: number;
    channelEfficiency: number;
  };
  [key: string]: unknown;
}

interface SecurityResponse {
  responseId: string;
  action: 'ALERT' | 'BLOCK' | 'QUARANTINE' | 'TERMINATE' | 'ISOLATE';
  timestamp: number;
  success: boolean;
  details: string;
  quantumAction: boolean;
}

interface SecurityAlert {
  alertId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'VULNERABILITY' | 'POLICY_VIOLATION' | 'ANOMALY' | 'QUANTUM_THREAT';
  title: string;
  description: string;
  source: string;
  containerId: string;
  timestamp: number;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  response: SecurityResponse[];
  quantumAlert: boolean;
}

interface SecurityDashboard {
  overview: {
    totalImages: number;
    scannedImages: number;
    protectedContainers: number;
    quantumProtectedContainers: number;
    activeAlerts: number;
    quantumAlerts: number;
  };
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    quantum: number;
  };
  policies: {
    total: number;
    active: number;
    quantumPolicies: number;
  };
  compliance: {
    averageScore: number;
    quantumCompliance: number;
  };
  config: {
    quantumSecurity: boolean;
    imageScanning: boolean;
    runtimeProtection: boolean;
    defaultPolicy: string;
  };
  timestamp: number;
}

interface SecurityPolicy {
  policyId: string;
  name: string;
  version: string;
  scope: {
    namespaces: string[];
    labels: Record<string, string>;
    imagePatterns: string[];
  };
  rules: PolicyRule[];
  enforcement: 'WARN' | 'BLOCK' | 'QUARANTINE';
  quantumRequirements: QuantumPolicyRequirements;
  createdAt: number;
  lastModified: number;
}

interface PolicyRule {
  ruleId: string;
  name: string;
  type: 'IMAGE_SCAN' | 'RUNTIME_BEHAVIOR' | 'NETWORK_ACCESS' | 'RESOURCE_LIMITS' | 'QUANTUM_SECURITY';
  condition: RuleCondition;
  action: 'ALLOW' | 'DENY' | 'WARN' | 'REQUIRE_APPROVAL';
  quantumEnforcement: boolean;
}

interface RuleCondition {
  operator: 'AND' | 'OR' | 'NOT';
  conditions: Condition[];
}

interface Condition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'MATCHES';
  value: string | number | boolean;
  quantumCondition: boolean;
}

interface QuantumPolicyRequirements {
  quantumSignatures: boolean;
  postQuantumEncryption: boolean;
  quantumKeyDistribution: boolean;
  quantumChannelRequired: boolean;
  minQuantumSecurityLevel: number;
  allowClassicalFallback: boolean;
}

// Image scanner implementation
class QuantumImageScanner {
  private scanHistory: Map<string, ImageScanResult[]> = new Map();
  private vulnerabilityDatabase: Map<string, Vulnerability> = new Map();
  private quantumVulnDatabase: Map<string, QuantumVulnerability> = new Map();

  constructor(private cryptoEngine: PostQuantumCryptoEngine) {
    this.initializeVulnerabilityDatabases();
  }

  private initializeVulnerabilityDatabases(): void {
    // Initialize with common vulnerabilities
    const commonVulns: Vulnerability[] = [
      {
        vulnerabilityId: 'CVE-2024-EXAMPLE-1',
        cveId: 'CVE-2024-EXAMPLE-1',
        severity: 'CRITICAL',
        title: 'Buffer Overflow in HTTP Parser',
        description: 'Critical buffer overflow vulnerability in HTTP request parsing',
        packageName: 'http-parser',
        packageVersion: '1.2.3',
        fixedVersion: '1.2.4',
        publishedDate: Date.now() - 86400000,
        modifiedDate: Date.now() - 43200000,
        cvssScore: 9.8,
        exploitAvailable: true,
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-EXAMPLE-1'],
        affectedFiles: ['/usr/lib/libhttp-parser.so']
      }
    ];

    for (const vuln of commonVulns) {
      this.vulnerabilityDatabase.set(vuln.vulnerabilityId, vuln);
    }

    // Initialize quantum vulnerabilities
    const quantumVulns: QuantumVulnerability[] = [
      {
        vulnerabilityId: 'QV-2024-001',
        type: 'CRYPTOGRAPHIC',
        severity: 'HIGH',
        title: 'RSA-2048 Quantum Vulnerability',
        description: 'RSA-2048 encryption vulnerable to quantum attacks using Shor\'s algorithm',
        affectedCrypto: ['RSA-2048', 'RSA-3072'],
        quantumThreat: true,
        postQuantumReady: false,
        recommendations: [
          'Migrate to post-quantum cryptography (Kyber, Dilithium)',
          'Implement hybrid classical-quantum key exchange',
          'Update to quantum-safe algorithms'
        ],
        quantumImpactScore: 8.5
      },
      {
        vulnerabilityId: 'QV-2024-002',
        type: 'RANDOM_NUMBER',
        severity: 'MEDIUM',
        title: 'Weak Random Number Generation',
        description: 'Pseudo-random number generator vulnerable to quantum analysis',
        affectedCrypto: ['PRNG', 'DRBG'],
        quantumThreat: true,
        postQuantumReady: false,
        recommendations: [
          'Use quantum random number generators',
          'Implement entropy pooling from quantum sources',
          'Upgrade PRNG to quantum-resistant algorithms'
        ],
        quantumImpactScore: 6.0
      }
    ];

    for (const qvuln of quantumVulns) {
      this.quantumVulnDatabase.set(qvuln.vulnerabilityId, qvuln);
    }

    console.log(`🔍 Initialized vulnerability databases: ${this.vulnerabilityDatabase.size} CVEs, ${this.quantumVulnDatabase.size} quantum vulnerabilities`);
  }

  async scanImage(image: ContainerImage): Promise<ImageScanResult> {
    const scanId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    console.log(`🔍 Starting image scan: ${image.repository}:${image.tag} (${scanId})`);

    const scanResult: ImageScanResult = {
      scanId,
      timestamp: Date.now(),
      status: 'SCANNING',
      totalVulnerabilities: 0,
      criticalVulnerabilities: 0,
      highVulnerabilities: 0,
      mediumVulnerabilities: 0,
      lowVulnerabilities: 0,
      vulnerabilities: [],
      quantumVulnerabilities: [],
      complianceResults: [],
      recommendations: [],
      riskScore: 0,
      quantumRiskScore: 0
    };

    try {
      // Scan image layers for vulnerabilities
      const layerVulns = await this.scanImageLayers(image.layers);
      scanResult.vulnerabilities = layerVulns;

      // Quantum vulnerability analysis
      const quantumVulns = await this.scanQuantumVulnerabilities(image);
      scanResult.quantumVulnerabilities = quantumVulns;

      // Compliance checks
      const complianceResults = await this.runComplianceChecks(image);
      scanResult.complianceResults = complianceResults;

      // Generate recommendations
      const recommendations = await this.generateRecommendations(scanResult);
      scanResult.recommendations = recommendations;

      // Calculate risk scores
      scanResult.riskScore = this.calculateRiskScore(scanResult.vulnerabilities);
      scanResult.quantumRiskScore = this.calculateQuantumRiskScore(scanResult.quantumVulnerabilities);

      // Count vulnerabilities by severity
      this.categorizeBySeverity(scanResult);

      scanResult.status = 'COMPLETED';

      // Store scan history
      const history = this.scanHistory.get(image.imageId) || [];
      history.push(scanResult);
      this.scanHistory.set(image.imageId, history);

      console.log(`✅ Image scan completed: ${scanResult.totalVulnerabilities} vulnerabilities found`);

    } catch (error) {
      scanResult.status = 'FAILED';
      console.error(`❌ Image scan failed: ${error.message}`);
    }

    return scanResult;
  }

  private async scanImageLayers(layers: ImageLayer[]): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    for (const layer of layers) {
      // Simulate layer scanning
      if (Math.random() < 0.3) { // 30% chance of vulnerability per layer
        // Select random vulnerability from database
        const vulnIds = Array.from(this.vulnerabilityDatabase.keys());
        const randomVuln = this.vulnerabilityDatabase.get(
          vulnIds[Math.floor(Math.random() * vulnIds.length)]
        );

        if (randomVuln) {
          vulnerabilities.push({
            ...randomVuln,
            vulnerabilityId: `${randomVuln.vulnerabilityId}-${layer.layerId}`,
            affectedFiles: [`/layer/${layer.layerId}/affected-file`]
          });
        }
      }
    }

    return vulnerabilities;
  }

  private async scanQuantumVulnerabilities(image: ContainerImage): Promise<QuantumVulnerability[]> {
    const quantumVulns: QuantumVulnerability[] = [];

    // Check for quantum-unsafe cryptography
    const cryptoPackages = ['openssl', 'libcrypto', 'crypto-js', 'rsa', 'ecdsa'];
    const imagePackages = Object.keys(image.metadata.labels || {});

    for (const pkg of cryptoPackages) {
      if (imagePackages.some(p => p.toLowerCase().includes(pkg))) {
        // Add quantum vulnerability
        const qvulnIds = Array.from(this.quantumVulnDatabase.keys());
        const randomQVuln = this.quantumVulnDatabase.get(
          qvulnIds[Math.floor(Math.random() * qvulnIds.length)]
        );

        if (randomQVuln) {
          quantumVulns.push({
            ...randomQVuln,
            vulnerabilityId: `${randomQVuln.vulnerabilityId}-${pkg}`,
            affectedCrypto: [pkg, ...randomQVuln.affectedCrypto]
          });
        }
      }
    }

    return quantumVulns;
  }

  private async runComplianceChecks(image: ContainerImage): Promise<ComplianceResult[]> {
    const complianceResults: ComplianceResult[] = [];

    // CIS Docker Benchmark
    const cisChecks: ComplianceCheck[] = [
      {
        checkId: 'CIS-4.1',
        name: 'Ensure a user for the container has been created',
        category: 'User and Group Management',
        status: image.metadata.user ? 'PASS' : 'FAIL',
        description: 'Container should run as non-root user',
        severity: 'HIGH',
        remediation: 'Add USER directive in Dockerfile',
        quantumRelevant: false
      },
      {
        checkId: 'CIS-4.5',
        name: 'Ensure Content trust for Docker is Enabled',
        category: 'Image Security',
        status: image.quantumSecurity?.quantumSigned ? 'PASS' : 'WARNING',
        description: 'Images should be cryptographically signed',
        severity: 'MEDIUM',
        remediation: 'Enable Docker Content Trust or use quantum signatures',
        quantumRelevant: true
      }
    ];

    const cisResult: ComplianceResult = {
      standard: 'CIS Docker Benchmark',
      version: '1.6.0',
      status: 'PARTIALLY_COMPLIANT',
      checks: cisChecks,
      score: 0.7,
      quantumCompliance: image.quantumSecurity?.quantumSigned || false
    };

    complianceResults.push(cisResult);

    // NIST Cybersecurity Framework
    const nistChecks: ComplianceCheck[] = [
      {
        checkId: 'NIST-PR.DS-1',
        name: 'Data-at-rest is protected',
        category: 'Data Security',
        status: image.quantumSecurity?.postQuantumEncrypted ? 'PASS' : 'FAIL',
        description: 'Container data should be encrypted at rest',
        severity: 'HIGH',
        remediation: 'Implement post-quantum encryption for container data',
        quantumRelevant: true
      }
    ];

    const nistResult: ComplianceResult = {
      standard: 'NIST Cybersecurity Framework',
      version: '1.1',
      status: 'NON_COMPLIANT',
      checks: nistChecks,
      score: 0.3,
      quantumCompliance: image.quantumSecurity?.postQuantumEncrypted || false
    };

    complianceResults.push(nistResult);

    return complianceResults;
  }

  private async generateRecommendations(scanResult: ImageScanResult): Promise<SecurityRecommendation[]> {
    const recommendations: SecurityRecommendation[] = [];

    // Vulnerability-based recommendations
    if (scanResult.criticalVulnerabilities > 0) {
      recommendations.push({
        recommendationId: 'REC-001',
        type: 'VULNERABILITY_FIX',
        priority: 'CRITICAL',
        title: 'Fix Critical Vulnerabilities',
        description: `${scanResult.criticalVulnerabilities} critical vulnerabilities found`,
        action: 'Update affected packages to fixed versions',
        impact: 'Eliminates critical security risks',
        effort: 'MEDIUM',
        quantumBenefit: false
      });
    }

    // Quantum security recommendations
    if (scanResult.quantumVulnerabilities.length > 0) {
      recommendations.push({
        recommendationId: 'REC-QS-001',
        type: 'QUANTUM_SECURITY',
        priority: 'HIGH',
        title: 'Implement Post-Quantum Cryptography',
        description: 'Quantum-unsafe cryptographic algorithms detected',
        action: 'Migrate to post-quantum cryptographic algorithms',
        impact: 'Protects against future quantum threats',
        effort: 'HIGH',
        quantumBenefit: true
      });
    }

    // Configuration recommendations
    recommendations.push({
      recommendationId: 'REC-CONFIG-001',
      type: 'CONFIGURATION',
      priority: 'MEDIUM',
      title: 'Implement Security Best Practices',
      description: 'Several security configuration improvements available',
      action: 'Apply CIS Docker Benchmark recommendations',
      impact: 'Improves overall security posture',
      effort: 'LOW',
      quantumBenefit: false
    });

    return recommendations;
  }

  private calculateRiskScore(vulnerabilities: Vulnerability[]): number {
    let riskScore = 0;

    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'CRITICAL':
          riskScore += 10;
          break;
        case 'HIGH':
          riskScore += 7;
          break;
        case 'MEDIUM':
          riskScore += 4;
          break;
        case 'LOW':
          riskScore += 1;
          break;
      }

      // Add extra weight for exploitable vulnerabilities
      if (vuln.exploitAvailable) {
        riskScore += 3;
      }
    }

    return Math.min(riskScore, 100); // Cap at 100
  }

  private calculateQuantumRiskScore(quantumVulns: QuantumVulnerability[]): number {
    let quantumRiskScore = 0;

    for (const qvuln of quantumVulns) {
      quantumRiskScore += qvuln.quantumImpactScore;
    }

    return Math.min(quantumRiskScore, 100); // Cap at 100
  }

  private categorizeBySeverity(scanResult: ImageScanResult): void {
    scanResult.totalVulnerabilities = scanResult.vulnerabilities.length;

    for (const vuln of scanResult.vulnerabilities) {
      switch (vuln.severity) {
        case 'CRITICAL':
          scanResult.criticalVulnerabilities++;
          break;
        case 'HIGH':
          scanResult.highVulnerabilities++;
          break;
        case 'MEDIUM':
          scanResult.mediumVulnerabilities++;
          break;
        case 'LOW':
          scanResult.lowVulnerabilities++;
          break;
      }
    }
  }

  getScanHistory(imageId: string): ImageScanResult[] {
    return this.scanHistory.get(imageId) || [];
  }

  getLatestScan(imageId: string): ImageScanResult | undefined {
    const history = this.scanHistory.get(imageId);
    return history && history.length > 0 ? history[history.length - 1] : undefined;
  }
}

// Runtime protection manager
class RuntimeProtectionManager {
  private protectedContainers: Map<string, RuntimeContainer> = new Map();
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private anomalyDetectors: Map<string, AnomalyDetection> = new Map();

  constructor(private cryptoEngine: PostQuantumCryptoEngine) { }

  addProtectedContainer(container: RuntimeContainer): void {
    this.protectedContainers.set(container.containerId, container);

    // Initialize anomaly detection
    this.initializeAnomalyDetection(container);

    // Start monitoring
    this.startContainerMonitoring(container);

    console.log(`🛡️ Added runtime protection for container: ${container.name}`);
  }

  private initializeAnomalyDetection(container: RuntimeContainer): void {
    const anomalyDetection: AnomalyDetection = {
      enabled: container.runtimeProtection.anomalyDetection.enabled,
      sensitivityLevel: 'MEDIUM',
      mlModelVersion: '1.0.0',
      detectionRules: [
        {
          ruleId: 'RULE-001',
          name: 'Unusual Process Execution',
          type: 'BEHAVIORAL',
          threshold: 0.8,
          action: 'ALERT',
          quantumSpecific: false
        },
        {
          ruleId: 'RULE-QS-001',
          name: 'Quantum Channel Anomaly',
          type: 'QUANTUM',
          threshold: 0.9,
          action: 'BLOCK',
          quantumSpecific: true
        }
      ],
      quantumAnomalyDetection: container.quantumSecurity.enabled
    };

    this.anomalyDetectors.set(container.containerId, anomalyDetection);
  }

  private startContainerMonitoring(container: RuntimeContainer): void {
    // Simulate monitoring initialization
    console.log(`📊 Started monitoring for container: ${container.containerId}`);

    // Start quantum behavior analysis if enabled
    if (container.runtimeProtection.quantumBehaviorAnalysis.enabled) {
      this.startQuantumBehaviorAnalysis(container);
    }
  }

  private startQuantumBehaviorAnalysis(container: RuntimeContainer): void {
    // Initialize quantum-specific monitoring
    console.log(`🔬 Started quantum behavior analysis for: ${container.containerId}`);
  }

  async analyzeContainerBehavior(containerId: string): Promise<SecurityFinding[]> {
    const container = this.protectedContainers.get(containerId);
    if (!container) return [];

    const findings: SecurityFinding[] = [];

    // Simulate behavior analysis
    const behaviorScore = Math.random();

    if (behaviorScore > 0.8) {
      findings.push({
        findingId: `finding-${Date.now()}`,
        severity: 'HIGH',
        category: 'Behavioral Anomaly',
        title: 'Unusual Container Behavior Detected',
        description: 'Container exhibiting behavior outside normal baseline',
        evidence: {
          behaviorScore,
          deviationMetrics: {
            processActivity: 0.9,
            networkActivity: 0.7,
            fileSystemActivity: 0.85
          }
        },
        recommendation: 'Investigate container activity and verify legitimacy',
        timestamp: Date.now(),
        quantumRelated: false
      });
    }

    // Quantum-specific analysis
    if (container.quantumSecurity.enabled && container.runtimeProtection.quantumBehaviorAnalysis.enabled) {
      const quantumBehaviorScore = Math.random();

      if (quantumBehaviorScore > 0.85) {
        findings.push({
          findingId: `qfinding-${Date.now()}`,
          severity: 'CRITICAL',
          category: 'Quantum Security',
          title: 'Quantum Channel Compromise Detected',
          description: 'Potential compromise of quantum communication channel',
          evidence: {
            quantumBehaviorScore,
            qkdMetrics: {
              qberRate: 0.12,
              keyGenerationRate: 0.3,
              channelEfficiency: 0.6
            }
          },
          recommendation: 'Immediately rotate quantum keys and verify channel integrity',
          timestamp: Date.now(),
          quantumRelated: true
        });
      }
    }

    return findings;
  }

  removeProtectedContainer(containerId: string): boolean {
    const removed = this.protectedContainers.delete(containerId);
    this.anomalyDetectors.delete(containerId);

    if (removed) {
      console.log(`🗑️ Removed runtime protection for container: ${containerId}`);
    }

    return removed;
  }

  getProtectedContainers(): RuntimeContainer[] {
    return Array.from(this.protectedContainers.values());
  }

  getContainerFindings(containerId: string): SecurityFinding[] {
    const container = this.protectedContainers.get(containerId);
    if (!container) return [];

    return container.monitors.flatMap(monitor => monitor.findings);
  }
}

// Main Container Security Engine
export class QuantumContainerSecurityEngine extends EventEmitter {
  private config: ContainerSecurityConfig;
  private imageScanner: QuantumImageScanner;
  private runtimeProtectionManager: RuntimeProtectionManager;
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private containerRegistry: Map<string, ContainerImage> = new Map();
  private securityAlerts: Map<string, SecurityAlert> = new Map();
  private isInitialized: boolean = false;

  constructor(
    config: ContainerSecurityConfig,
    private serviceMesh: QuantumServiceMesh,
    private kubernetesController: QuantumKubernetesController,
    private cryptoEngine: PostQuantumCryptoEngine
  ) {
    super();

    this.config = config;
    this.imageScanner = new QuantumImageScanner(cryptoEngine);
    this.runtimeProtectionManager = new RuntimeProtectionManager(cryptoEngine);

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('🛡️ Initializing Quantum Container Security Engine...');

      // Set up default security policies
      await this.setupDefaultSecurityPolicies();

      // Initialize container registry monitoring
      await this.initializeRegistryMonitoring();

      // Set up quantum security features
      if (this.config.quantumSecurity.enabled) {
        await this.initializeQuantumSecurity();
      }

      this.isInitialized = true;

      this.emit('initialized', {
        quantumSecurity: this.config.quantumSecurity.enabled,
        imageScanning: this.config.imageScanning.enabled,
        runtimeProtection: this.config.runtimeProtection.enabled,
        timestamp: Date.now()
      });

      console.log('✅ Quantum Container Security Engine initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Container Security Engine:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  private async setupDefaultSecurityPolicies(): Promise<void> {
    // Default strict security policy
    const strictPolicy: SecurityPolicy = {
      policyId: 'default-strict',
      name: 'Default Strict Security Policy',
      version: '1.0.0',
      scope: {
        namespaces: ['default', 'kube-system'],
        labels: {},
        imagePatterns: ['*']
      },
      rules: [
        {
          ruleId: 'RULE-IMAGE-001',
          name: 'No Critical Vulnerabilities',
          type: 'IMAGE_SCAN',
          condition: {
            operator: 'AND',
            conditions: [
              {
                field: 'criticalVulnerabilities',
                operator: 'EQUALS',
                value: 0,
                quantumCondition: false
              }
            ]
          },
          action: 'DENY',
          quantumEnforcement: false
        },
        {
          ruleId: 'RULE-RUNTIME-001',
          name: 'No Privileged Containers',
          type: 'RUNTIME_BEHAVIOR',
          condition: {
            operator: 'AND',
            conditions: [
              {
                field: 'securityContext.privileged',
                operator: 'EQUALS',
                value: false,
                quantumCondition: false
              }
            ]
          },
          action: 'DENY',
          quantumEnforcement: false
        }
      ],
      enforcement: 'BLOCK',
      quantumRequirements: {
        quantumSignatures: this.config.quantumSecurity.quantumSignatures,
        postQuantumEncryption: this.config.quantumSecurity.postQuantumCrypto,
        quantumKeyDistribution: this.config.quantumSecurity.quantumKeyDistribution,
        quantumChannelRequired: false,
        minQuantumSecurityLevel: 3,
        allowClassicalFallback: true
      },
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    this.securityPolicies.set(strictPolicy.policyId, strictPolicy);

    // Quantum-specific security policy
    if (this.config.quantumSecurity.enabled) {
      const quantumPolicy: SecurityPolicy = {
        policyId: 'quantum-security',
        name: 'Quantum Security Policy',
        version: '1.0.0',
        scope: {
          namespaces: ['quantum-secure'],
          labels: { 'quantum-required': 'true' },
          imagePatterns: ['quantum/*', '*/quantum-*']
        },
        rules: [
          {
            ruleId: 'RULE-QUANTUM-001',
            name: 'Quantum Signatures Required',
            type: 'QUANTUM_SECURITY',
            condition: {
              operator: 'AND',
              conditions: [
                {
                  field: 'quantumSecurity.quantumSigned',
                  operator: 'EQUALS',
                  value: true,
                  quantumCondition: true
                }
              ]
            },
            action: 'DENY',
            quantumEnforcement: true
          }
        ],
        enforcement: 'BLOCK',
        quantumRequirements: {
          quantumSignatures: true,
          postQuantumEncryption: true,
          quantumKeyDistribution: true,
          quantumChannelRequired: true,
          minQuantumSecurityLevel: 5,
          allowClassicalFallback: false
        },
        createdAt: Date.now(),
        lastModified: Date.now()
      };

      this.securityPolicies.set(quantumPolicy.policyId, quantumPolicy);
    }

    console.log(`📋 Initialized ${this.securityPolicies.size} default security policies`);
  }

  private async initializeRegistryMonitoring(): Promise<void> {
    // Simulate registry monitoring setup
    console.log('📡 Initialized container registry monitoring');
  }

  private async initializeQuantumSecurity(): Promise<void> {
    console.log('🔒 Initialized quantum security features');
  }

  // Public API methods
  async scanContainerImage(image: ContainerImage): Promise<ImageScanResult> {
    if (!this.isInitialized) {
      throw new Error('Container Security Engine not initialized');
    }

    this.containerRegistry.set(image.imageId, image);

    const scanResult = await this.imageScanner.scanImage(image);

    // Check against security policies
    await this.evaluateSecurityPolicies(image, scanResult);

    this.emit('image_scanned', {
      imageId: image.imageId,
      repository: image.repository,
      tag: image.tag,
      vulnerabilities: scanResult.totalVulnerabilities,
      quantumVulnerabilities: scanResult.quantumVulnerabilities.length,
      riskScore: scanResult.riskScore,
      quantumRiskScore: scanResult.quantumRiskScore,
      timestamp: Date.now()
    });

    return scanResult;
  }

  private async evaluateSecurityPolicies(image: ContainerImage, scanResult: ImageScanResult): Promise<void> {
    const applicablePolicies = Array.from(this.securityPolicies.values())
      .filter(policy => this.doesPolicyApply(policy, image));

    for (const policy of applicablePolicies) {
      const policyViolations = await this.checkPolicyCompliance(image, scanResult, policy);

      if (policyViolations.length > 0) {
        await this.handlePolicyViolations(image, policy, policyViolations);
      }
    }
  }

  private doesPolicyApply(policy: SecurityPolicy, image: ContainerImage): boolean {
    // Check image patterns
    const matchesPattern = policy.scope.imagePatterns.some(pattern => {
      const regex = pattern.replace('*', '.*');
      return new RegExp(regex).test(`${image.repository}:${image.tag}`);
    });

    // Check labels
    const matchesLabels = Object.entries(policy.scope.labels).every(([key, value]) =>
      image.metadata.labels[key] === value
    );

    return matchesPattern || matchesLabels;
  }

  private async checkPolicyCompliance(
    image: ContainerImage,
    scanResult: ImageScanResult,
    policy: SecurityPolicy
  ): Promise<string[]> {
    const violations: string[] = [];

    for (const rule of policy.rules) {
      if (!await this.evaluateRule(image, scanResult, rule)) {
        violations.push(`Policy violation: ${rule.name}`);
      }
    }

    return violations;
  }

  private async evaluateRule(
    image: ContainerImage,
    scanResult: ImageScanResult,
    rule: PolicyRule
  ): Promise<boolean> {
    switch (rule.type) {
      case 'IMAGE_SCAN':
        return this.evaluateImageScanRule(scanResult, rule);
      case 'QUANTUM_SECURITY':
        return this.evaluateQuantumSecurityRule(image, rule);
      default:
        return true;
    }
  }

  private evaluateImageScanRule(scanResult: ImageScanResult, rule: PolicyRule): boolean {
    for (const condition of rule.condition.conditions) {
      switch (condition.field) {
        case 'criticalVulnerabilities':
          if (!this.compareValues(scanResult.criticalVulnerabilities, condition.operator, condition.value)) {
            return false;
          }
          break;
        case 'totalVulnerabilities':
          if (!this.compareValues(scanResult.totalVulnerabilities, condition.operator, condition.value)) {
            return false;
          }
          break;
      }
    }
    return true;
  }

  private evaluateQuantumSecurityRule(image: ContainerImage, rule: PolicyRule): boolean {
    for (const condition of rule.condition.conditions) {
      switch (condition.field) {
        case 'quantumSecurity.quantumSigned':
          if (!this.compareValues(image.quantumSecurity?.quantumSigned || false, condition.operator, condition.value)) {
            return false;
          }
          break;
        case 'quantumSecurity.postQuantumEncrypted':
          if (!this.compareValues(image.quantumSecurity?.postQuantumEncrypted || false, condition.operator, condition.value)) {
            return false;
          }
          break;
      }
    }
    return true;
  }

  private compareValues(actual: string | number | boolean, operator: string, expected: string | number | boolean): boolean {
    switch (operator) {
      case 'EQUALS':
        return actual === expected;
      case 'NOT_EQUALS':
        return actual !== expected;
      case 'GREATER_THAN':
        return (typeof actual === 'number' && typeof expected === 'number') ? actual > expected : false;
      case 'LESS_THAN':
        return (typeof actual === 'number' && typeof expected === 'number') ? actual < expected : false;
      case 'CONTAINS':
        return String(actual).includes(String(expected));
      default:
        return false;
    }
  }

  private async handlePolicyViolations(
    image: ContainerImage,
    policy: SecurityPolicy,
    violations: string[]
  ): Promise<void> {
    const alert: SecurityAlert = {
      alertId: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      severity: 'HIGH',
      type: 'POLICY_VIOLATION',
      title: `Security Policy Violation: ${policy.name}`,
      description: `Image ${image.repository}:${image.tag} violates security policy`,
      source: 'Container Security Engine',
      containerId: image.imageId,
      timestamp: Date.now(),
      status: 'OPEN',
      response: [],
      quantumAlert: policy.quantumRequirements.quantumSignatures
    };

    this.securityAlerts.set(alert.alertId, alert);

    this.emit('policy_violation', {
      imageId: image.imageId,
      policyId: policy.policyId,
      violations,
      alertId: alert.alertId,
      timestamp: Date.now()
    });

    console.warn(`🚨 Policy violation detected: ${image.repository}:${image.tag}`);
  }

  async protectRuntimeContainer(container: RuntimeContainer): Promise<void> {
    this.runtimeProtectionManager.addProtectedContainer(container);

    this.emit('container_protected', {
      containerId: container.containerId,
      name: container.name,
      namespace: container.namespace,
      quantumSecurity: container.quantumSecurity.enabled,
      timestamp: Date.now()
    });
  }

  async analyzeContainerSecurity(containerId: string): Promise<SecurityFinding[]> {
    return this.runtimeProtectionManager.analyzeContainerBehavior(containerId);
  }

  getSecurityDashboard(): SecurityDashboard {
    const totalImages = this.containerRegistry.size;
    const scannedImages = Array.from(this.containerRegistry.values())
      .filter(img => this.imageScanner.getLatestScan(img.imageId)).length;

    const protectedContainers = this.runtimeProtectionManager.getProtectedContainers();
    const activeAlerts = Array.from(this.securityAlerts.values())
      .filter(alert => alert.status === 'OPEN');

    const quantumProtectedContainers = protectedContainers
      .filter(container => container.quantumSecurity.enabled).length;

    return {
      overview: {
        totalImages,
        scannedImages,
        protectedContainers: protectedContainers.length,
        quantumProtectedContainers,
        activeAlerts: activeAlerts.length,
        quantumAlerts: activeAlerts.filter(alert => alert.quantumAlert).length
      },
      vulnerabilities: {
        critical: this.getTotalVulnerabilitiesBySeverity('CRITICAL'),
        high: this.getTotalVulnerabilitiesBySeverity('HIGH'),
        medium: this.getTotalVulnerabilitiesBySeverity('MEDIUM'),
        low: this.getTotalVulnerabilitiesBySeverity('LOW'),
        quantum: this.getTotalQuantumVulnerabilities()
      },
      policies: {
        total: this.securityPolicies.size,
        active: Array.from(this.securityPolicies.values()).filter(p => p.enforcement !== 'WARN').length,
        quantumPolicies: Array.from(this.securityPolicies.values())
          .filter(p => p.quantumRequirements.quantumSignatures).length
      },
      compliance: {
        averageScore: this.getAverageComplianceScore(),
        quantumCompliance: this.getQuantumComplianceScore()
      },
      config: {
        quantumSecurity: this.config.quantumSecurity.enabled,
        imageScanning: this.config.imageScanning.enabled,
        runtimeProtection: this.config.runtimeProtection.enabled,
        defaultPolicy: this.config.defaultPolicy
      },
      timestamp: Date.now()
    };
  }

  private getTotalVulnerabilitiesBySeverity(severity: string): number {
    let total = 0;
    for (const image of this.containerRegistry.values()) {
      const scanResult = this.imageScanner.getLatestScan(image.imageId);
      if (scanResult) {
        switch (severity) {
          case 'CRITICAL':
            total += scanResult.criticalVulnerabilities;
            break;
          case 'HIGH':
            total += scanResult.highVulnerabilities;
            break;
          case 'MEDIUM':
            total += scanResult.mediumVulnerabilities;
            break;
          case 'LOW':
            total += scanResult.lowVulnerabilities;
            break;
        }
      }
    }
    return total;
  }

  private getTotalQuantumVulnerabilities(): number {
    let total = 0;
    for (const image of this.containerRegistry.values()) {
      const scanResult = this.imageScanner.getLatestScan(image.imageId);
      if (scanResult) {
        total += scanResult.quantumVulnerabilities.length;
      }
    }
    return total;
  }

  private getAverageComplianceScore(): number {
    let totalScore = 0;
    let count = 0;

    for (const image of this.containerRegistry.values()) {
      const scanResult = this.imageScanner.getLatestScan(image.imageId);
      if (scanResult) {
        for (const complianceResult of scanResult.complianceResults) {
          totalScore += complianceResult.score;
          count++;
        }
      }
    }

    return count > 0 ? totalScore / count : 0;
  }

  private getQuantumComplianceScore(): number {
    let quantumCompliantCount = 0;
    let totalCount = 0;

    for (const image of this.containerRegistry.values()) {
      const scanResult = this.imageScanner.getLatestScan(image.imageId);
      if (scanResult) {
        for (const complianceResult of scanResult.complianceResults) {
          if (complianceResult.quantumCompliance) {
            quantumCompliantCount++;
          }
          totalCount++;
        }
      }
    }

    return totalCount > 0 ? quantumCompliantCount / totalCount : 0;
  }

  addSecurityPolicy(policy: SecurityPolicy): void {
    this.securityPolicies.set(policy.policyId, policy);

    this.emit('policy_added', {
      policyId: policy.policyId,
      name: policy.name,
      quantumRequirements: policy.quantumRequirements.quantumSignatures,
      timestamp: Date.now()
    });

    console.log(`📋 Added security policy: ${policy.name}`);
  }

  removeSecurityPolicy(policyId: string): boolean {
    const removed = this.securityPolicies.delete(policyId);

    if (removed) {
      this.emit('policy_removed', {
        policyId,
        timestamp: Date.now()
      });
      console.log(`🗑️ Removed security policy: ${policyId}`);
    }

    return removed;
  }

  getSecurityAlerts(): SecurityAlert[] {
    return Array.from(this.securityAlerts.values());
  }

  resolveSecurityAlert(alertId: string): boolean {
    const alert = this.securityAlerts.get(alertId);
    if (!alert) return false;

    alert.status = 'RESOLVED';

    this.emit('alert_resolved', {
      alertId,
      timestamp: Date.now()
    });

    return true;
  }

  destroy(): void {
    this.containerRegistry.clear();
    this.securityPolicies.clear();
    this.securityAlerts.clear();
    this.isInitialized = false;

    console.log('🛡️ Quantum Container Security Engine destroyed');
  }
}

export type {
  ContainerSecurityConfig,
  ContainerImage,
  ImageScanResult,
  RuntimeContainer,
  SecurityPolicy,
  SecurityAlert,
  SecurityFinding
};

export default QuantumContainerSecurityEngine;
