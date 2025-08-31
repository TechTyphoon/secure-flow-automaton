/**
 * Quantum Kubernetes Controller
 * Advanced Kubernetes integration with quantum-aware scheduling and resource management
 */

import { EventEmitter } from 'events';
import { QuantumOrchestrationIntegrator } from './quantumOrchestrationIntegrator';
import { QuantumServiceDiscoveryEngine } from './quantumServiceDiscovery';
import { PostQuantumCryptoEngine } from '../quantum/postQuantumCrypto';

// Kubernetes API interfaces
interface QuantumCustomResource {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  spec: QuantumServiceSpec;
  status?: QuantumServiceStatus;
}

interface QuantumServiceSpec {
  quantumResources: {
    qubits?: number;
    qkdChannels?: number;
    cryptoAcceleration?: boolean;
    entanglementPairs?: number;
    quantumMemory?: number;
  };
  deployment: {
    replicas: number;
    image: string;
    ports: ContainerPort[];
    env?: EnvironmentVariable[];
    volumes?: VolumeMount[];
  };
  networking: {
    quantumMesh: boolean;
    serviceType: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'QuantumMesh';
    quantumPorts?: QuantumPort[];
  };
  security: {
    postQuantumEncryption: boolean;
    quantumAuthentication: boolean;
    biometricVerification?: boolean;
    complianceLevel: string;
  };
  scaling: {
    minReplicas: number;
    maxReplicas: number;
    targetQuantumUtilization: number;
    scaleDownDelay: number;
  };
  affinity?: QuantumAffinity;
}

interface QuantumServiceStatus {
  phase: 'Pending' | 'Running' | 'Scaling' | 'Failed' | 'Succeeded';
  replicas: number;
  readyReplicas: number;
  quantumResourcesAllocated: {
    qubits: number;
    qkdChannels: number;
    entanglementPairs: number;
  };
  conditions: QuantumCondition[];
  observedGeneration: number;
  lastUpdateTime: string;
}

interface QuantumCondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  lastTransitionTime: string;
  reason: string;
  message: string;
}

interface ContainerPort {
  name: string;
  containerPort: number;
  protocol: 'TCP' | 'UDP' | 'QUANTUM';
}

interface QuantumPort {
  name: string;
  port: number;
  quantumProtocol: 'QKD' | 'ENTANGLEMENT' | 'TELEPORTATION';
  securityLevel: number;
}

interface EnvironmentVariable {
  name: string;
  value?: string;
  valueFrom?: {
    secretKeyRef?: { name: string; key: string };
    configMapKeyRef?: { name: string; key: string };
    quantumKeyRef?: { name: string; algorithm: string };
  };
}

interface VolumeMount {
  name: string;
  mountPath: string;
  readOnly?: boolean;
  quantumEncrypted?: boolean;
}

interface QuantumAffinity {
  nodeAffinity?: {
    requiredDuringSchedulingIgnoredDuringExecution?: {
      nodeSelectorTerms: NodeSelectorTerm[];
    };
    preferredDuringSchedulingIgnoredDuringExecution?: {
      weight: number;
      preference: NodeSelectorTerm;
    }[];
  };
  quantumAffinity?: {
    requiredQuantumCapabilities: string[];
    preferredQuantumNodes: string[];
    quantumResourceRequirements: QuantumResourceRequirement[];
  };
}

interface NodeSelectorTerm {
  matchExpressions?: {
    key: string;
    operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist';
    values?: string[];
  }[];
}

interface QuantumResourceRequirement {
  type: 'qubits' | 'qkd_channels' | 'quantum_memory' | 'entanglement_pairs';
  minimum: number;
  preferred: number;
}

interface KubernetesNode {
  name: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  capacity: {
    cpu: string;
    memory: string;
    'quantum.io/qubits': string;
    'quantum.io/qkd-channels': string;
    'quantum.io/quantum-memory': string;
  };
  allocatable: Record<string, string>;
  conditions: {
    type: string;
    status: string;
    lastHeartbeatTime: string;
  }[];
  quantumCapabilities?: {
    qkdSupport: boolean;
    entanglementSupport: boolean;
    quantumMemorySize: number;
    supportedAlgorithms: string[];
    quantumProcessors: number;
  };
}

interface QuantumPod {
  name: string;
  namespace: string;
  nodeName: string;
  phase: 'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Unknown';
  quantumResources: {
    requests: Record<string, number>;
    limits: Record<string, number>;
    allocated: Record<string, number>;
  };
  conditions: {
    type: string;
    status: string;
    lastTransitionTime: string;
  }[];
  quantumStatus: {
    qkdSessionsActive: number;
    entanglementPairsActive: number;
    quantumOperationsPerSecond: number;
    lastQuantumHealthCheck: string;
  };
}

interface QuantumSchedulingResult {
  selectedNode: string;
  score: number;
  reasons: string[];
  quantumResourceAllocation: Record<string, number>;
  estimatedStartTime: number;
}

interface QuantumMetrics {
  namespace: string;
  name: string;
  timestamp: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    qubits: number;
    qkdChannels: number;
  };
  performance: {
    responseTime: number;
    throughput: number;
    quantumOperationsPerSecond: number;
    errorRate: number;
  };
  scaling: {
    currentReplicas: number;
    desiredReplicas: number;
    scaleEvents: number;
    lastScaleTime: number;
  };
}

// Quantum Resource Manager
class QuantumResourceManager {
  private nodeResources: Map<string, KubernetesNode> = new Map();
  private podAllocations: Map<string, QuantumPod> = new Map();
  private resourceQuotas: Map<string, Record<string, number>> = new Map();

  constructor() {
    this.initializeDefaultQuotas();
  }

  private initializeDefaultQuotas(): void {
    // Default namespace quota
    this.resourceQuotas.set('default', {
      'quantum.io/qubits': 100,
      'quantum.io/qkd-channels': 50,
      'quantum.io/quantum-memory': 1024,
      'quantum.io/entanglement-pairs': 25
    });

    // System namespace quota
    this.resourceQuotas.set('kube-system', {
      'quantum.io/qubits': 200,
      'quantum.io/qkd-channels': 100,
      'quantum.io/quantum-memory': 2048,
      'quantum.io/entanglement-pairs': 50
    });
  }

  updateNodeResources(node: KubernetesNode): void {
    this.nodeResources.set(node.name, node);
    console.log(`📊 Updated quantum resources for node: ${node.name}`);
  }

  allocateQuantumResources(pod: QuantumPod): boolean {
    const node = this.nodeResources.get(pod.nodeName);
    if (!node) return false;

    // Check if node has sufficient quantum resources
    const requiredQubits = pod.quantumResources.requests['quantum.io/qubits'] || 0;
    const requiredChannels = pod.quantumResources.requests['quantum.io/qkd-channels'] || 0;
    const requiredMemory = pod.quantumResources.requests['quantum.io/quantum-memory'] || 0;

    const availableQubits = parseInt(node.allocatable['quantum.io/qubits'] || '0');
    const availableChannels = parseInt(node.allocatable['quantum.io/qkd-channels'] || '0');
    const availableMemory = parseInt(node.allocatable['quantum.io/quantum-memory'] || '0');

    if (requiredQubits > availableQubits ||
      requiredChannels > availableChannels ||
      requiredMemory > availableMemory) {
      return false;
    }

    // Allocate resources
    pod.quantumResources.allocated = {
      'quantum.io/qubits': requiredQubits,
      'quantum.io/qkd-channels': requiredChannels,
      'quantum.io/quantum-memory': requiredMemory
    };

    // Update allocatable resources
    node.allocatable['quantum.io/qubits'] = (availableQubits - requiredQubits).toString();
    node.allocatable['quantum.io/qkd-channels'] = (availableChannels - requiredChannels).toString();
    node.allocatable['quantum.io/quantum-memory'] = (availableMemory - requiredMemory).toString();

    this.podAllocations.set(pod.name, pod);
    console.log(`✅ Allocated quantum resources for pod: ${pod.name}`);
    return true;
  }

  releaseQuantumResources(podName: string): boolean {
    const pod = this.podAllocations.get(podName);
    if (!pod) return false;

    const node = this.nodeResources.get(pod.nodeName);
    if (!node) return false;

    // Release allocated resources back to node
    const allocatedQubits = pod.quantumResources.allocated['quantum.io/qubits'] || 0;
    const allocatedChannels = pod.quantumResources.allocated['quantum.io/qkd-channels'] || 0;
    const allocatedMemory = pod.quantumResources.allocated['quantum.io/quantum-memory'] || 0;

    const currentQubits = parseInt(node.allocatable['quantum.io/qubits'] || '0');
    const currentChannels = parseInt(node.allocatable['quantum.io/qkd-channels'] || '0');
    const currentMemory = parseInt(node.allocatable['quantum.io/quantum-memory'] || '0');

    node.allocatable['quantum.io/qubits'] = (currentQubits + allocatedQubits).toString();
    node.allocatable['quantum.io/qkd-channels'] = (currentChannels + allocatedChannels).toString();
    node.allocatable['quantum.io/quantum-memory'] = (currentMemory + allocatedMemory).toString();

    this.podAllocations.delete(podName);
    console.log(`🔄 Released quantum resources for pod: ${podName}`);
    return true;
  }

  getNodeQuantumCapacity(nodeName: string): Record<string, number> | null {
    const node = this.nodeResources.get(nodeName);
    if (!node) return null;

    return {
      qubits: parseInt(node.capacity['quantum.io/qubits'] || '0'),
      qkdChannels: parseInt(node.capacity['quantum.io/qkd-channels'] || '0'),
      quantumMemory: parseInt(node.capacity['quantum.io/quantum-memory'] || '0')
    };
  }

  getNodeQuantumUtilization(nodeName: string): Record<string, number> | null {
    const node = this.nodeResources.get(nodeName);
    if (!node) return null;

    const capacity = this.getNodeQuantumCapacity(nodeName);
    if (!capacity) return null;

    const available = {
      qubits: parseInt(node.allocatable['quantum.io/qubits'] || '0'),
      qkdChannels: parseInt(node.allocatable['quantum.io/qkd-channels'] || '0'),
      quantumMemory: parseInt(node.allocatable['quantum.io/quantum-memory'] || '0')
    };

    return {
      qubits: ((capacity.qubits - available.qubits) / capacity.qubits) * 100,
      qkdChannels: ((capacity.qkdChannels - available.qkdChannels) / capacity.qkdChannels) * 100,
      quantumMemory: ((capacity.quantumMemory - available.quantumMemory) / capacity.quantumMemory) * 100
    };
  }

  checkResourceQuota(namespace: string, requested: Record<string, number>): boolean {
    const quota = this.resourceQuotas.get(namespace);
    if (!quota) return true; // No quota means no limits

    for (const [resource, amount] of Object.entries(requested)) {
      const limit = quota[resource];
      if (limit !== undefined && amount > limit) {
        console.warn(`❌ Resource quota exceeded for ${resource} in namespace ${namespace}`);
        return false;
      }
    }

    return true;
  }

  setResourceQuota(namespace: string, quota: Record<string, number>): void {
    this.resourceQuotas.set(namespace, quota);
    console.log(`📋 Set resource quota for namespace: ${namespace}`);
  }

  getResourceUsage(): Map<string, Record<string, number>> {
    const usage = new Map<string, Record<string, number>>();

    for (const [nodeName, node] of this.nodeResources.entries()) {
      const capacity = this.getNodeQuantumCapacity(nodeName);
      const utilization = this.getNodeQuantumUtilization(nodeName);

      if (capacity && utilization) {
        usage.set(nodeName, {
          qubitsUsed: capacity.qubits * (utilization.qubits / 100),
          qkdChannelsUsed: capacity.qkdChannels * (utilization.qkdChannels / 100),
          quantumMemoryUsed: capacity.quantumMemory * (utilization.quantumMemory / 100)
        });
      }
    }

    return usage;
  }
}

// Quantum Scheduler
class QuantumScheduler {
  private resourceManager: QuantumResourceManager;

  constructor(resourceManager: QuantumResourceManager) {
    this.resourceManager = resourceManager;
  }

  async scheduleQuantumPod(pod: QuantumPod, nodes: KubernetesNode[]): Promise<QuantumSchedulingResult | null> {
    const candidates = this.filterNodes(pod, nodes);
    if (candidates.length === 0) {
      console.warn(`❌ No suitable nodes found for quantum pod: ${pod.name}`);
      return null;
    }

    const scoredNodes = candidates.map(node => ({
      node,
      score: this.scoreNode(pod, node),
      reasons: this.getSchedulingReasons(pod, node)
    }));

    // Sort by score (highest first)
    scoredNodes.sort((a, b) => b.score - a.score);
    const selectedNode = scoredNodes[0];

    return {
      selectedNode: selectedNode.node.name,
      score: selectedNode.score,
      reasons: selectedNode.reasons,
      quantumResourceAllocation: this.calculateResourceAllocation(pod, selectedNode.node),
      estimatedStartTime: Date.now() + 30000 // 30 seconds estimated
    };
  }

  private filterNodes(pod: QuantumPod, nodes: KubernetesNode[]): KubernetesNode[] {
    return nodes.filter(node => {
      // Check basic node readiness
      const readyCondition = node.conditions.find(c => c.type === 'Ready');
      if (!readyCondition || readyCondition.status !== 'True') {
        return false;
      }

      // Check quantum capabilities
      if (pod.quantumResources.requests['quantum.io/qubits']) {
        const availableQubits = parseInt(node.allocatable['quantum.io/qubits'] || '0');
        const requiredQubits = pod.quantumResources.requests['quantum.io/qubits'];
        if (availableQubits < requiredQubits) {
          return false;
        }
      }

      // Check QKD channel requirements
      if (pod.quantumResources.requests['quantum.io/qkd-channels']) {
        const availableChannels = parseInt(node.allocatable['quantum.io/qkd-channels'] || '0');
        const requiredChannels = pod.quantumResources.requests['quantum.io/qkd-channels'];
        if (availableChannels < requiredChannels) {
          return false;
        }
      }

      // Check quantum memory requirements
      if (pod.quantumResources.requests['quantum.io/quantum-memory']) {
        const availableMemory = parseInt(node.allocatable['quantum.io/quantum-memory'] || '0');
        const requiredMemory = pod.quantumResources.requests['quantum.io/quantum-memory'];
        if (availableMemory < requiredMemory) {
          return false;
        }
      }

      return true;
    });
  }

  private scoreNode(pod: QuantumPod, node: KubernetesNode): number {
    let score = 0;

    // Resource utilization score (prefer nodes with balanced utilization)
    const utilization = this.resourceManager.getNodeQuantumUtilization(node.name);
    if (utilization) {
      const avgUtilization = (utilization.qubits + utilization.qkdChannels + utilization.quantumMemory) / 3;
      // Prefer nodes with 30-70% utilization
      if (avgUtilization >= 30 && avgUtilization <= 70) {
        score += 50;
      } else if (avgUtilization < 30) {
        score += 30; // Slightly prefer underutilized nodes
      } else {
        score += 10; // Avoid heavily utilized nodes
      }
    }

    // Quantum capability score
    if (node.quantumCapabilities) {
      if (node.quantumCapabilities.qkdSupport) score += 20;
      if (node.quantumCapabilities.entanglementSupport) score += 20;
      score += Math.min(10, node.quantumCapabilities.quantumProcessors * 2);
    }

    // Node affinity score
    if (node.labels['quantum.io/tier'] === 'premium') score += 15;
    if (node.labels['quantum.io/zone'] === 'quantum-zone-1') score += 10;

    // Avoid single point of failure
    if (node.labels['quantum.io/role'] === 'quantum-master') score -= 20;

    return Math.max(0, Math.min(100, score));
  }

  private getSchedulingReasons(pod: QuantumPod, node: KubernetesNode): string[] {
    const reasons: string[] = [];

    const utilization = this.resourceManager.getNodeQuantumUtilization(node.name);
    if (utilization) {
      reasons.push(`Node utilization: qubits ${utilization.qubits.toFixed(1)}%, channels ${utilization.qkdChannels.toFixed(1)}%`);
    }

    if (node.quantumCapabilities) {
      if (node.quantumCapabilities.qkdSupport) {
        reasons.push('Node supports QKD');
      }
      if (node.quantumCapabilities.entanglementSupport) {
        reasons.push('Node supports quantum entanglement');
      }
    }

    if (node.labels['quantum.io/tier']) {
      reasons.push(`Node tier: ${node.labels['quantum.io/tier']}`);
    }

    return reasons;
  }

  private calculateResourceAllocation(pod: QuantumPod, node: KubernetesNode): Record<string, number> {
    const allocation: Record<string, number> = {};

    const qubits = pod.quantumResources.requests['quantum.io/qubits'] || 0;
    const channels = pod.quantumResources.requests['quantum.io/qkd-channels'] || 0;
    const memory = pod.quantumResources.requests['quantum.io/quantum-memory'] || 0;

    if (qubits > 0) allocation['quantum.io/qubits'] = qubits;
    if (channels > 0) allocation['quantum.io/qkd-channels'] = channels;
    if (memory > 0) allocation['quantum.io/quantum-memory'] = memory;

    return allocation;
  }
}

// Quantum Auto-scaler
class QuantumHorizontalPodAutoscaler {
  private scalingPolicies: Map<string, QuantumScalingPolicy> = new Map();
  private metrics: Map<string, QuantumMetrics> = new Map();
  private scalingHistory: Array<{ timestamp: number; resource: string; action: string; reason: string }> = [];

  async evaluateScaling(serviceName: string, currentMetrics: QuantumMetrics): Promise<ScalingDecision | null> {
    const policy = this.scalingPolicies.get(serviceName);
    if (!policy || !policy.enabled) return null;

    const decision = this.makeScalingDecision(policy, currentMetrics);
    if (decision) {
      this.recordScalingEvent(serviceName, decision);
    }

    return decision;
  }

  private makeScalingDecision(policy: QuantumScalingPolicy, metrics: QuantumMetrics): ScalingDecision | null {
    const currentReplicas = metrics.scaling.currentReplicas;
    let desiredReplicas = currentReplicas;

    // Check quantum resource utilization
    const quantumUtilization = (metrics.resourceUtilization.qubits + metrics.resourceUtilization.qkdChannels) / 2;

    if (quantumUtilization > policy.targetQuantumUtilization * 1.2) {
      // Scale up if quantum utilization is 20% above target
      desiredReplicas = Math.min(policy.maxReplicas, Math.ceil(currentReplicas * 1.5));
    } else if (quantumUtilization < policy.targetQuantumUtilization * 0.7) {
      // Scale down if quantum utilization is 30% below target
      desiredReplicas = Math.max(policy.minReplicas, Math.floor(currentReplicas * 0.8));
    }

    // Check performance metrics
    if (metrics.performance.responseTime > policy.maxResponseTime) {
      desiredReplicas = Math.min(policy.maxReplicas, currentReplicas + 1);
    }

    if (metrics.performance.errorRate > policy.maxErrorRate) {
      desiredReplicas = Math.min(policy.maxReplicas, currentReplicas + 2);
    }

    if (desiredReplicas === currentReplicas) {
      return null; // No scaling needed
    }

    return {
      currentReplicas,
      desiredReplicas,
      reason: this.getScalingReason(policy, metrics, desiredReplicas > currentReplicas),
      estimatedTime: 60000, // 1 minute
      quantumResourcesRequired: this.calculateRequiredResources(desiredReplicas - currentReplicas)
    };
  }

  private getScalingReason(policy: QuantumScalingPolicy, metrics: QuantumMetrics, scaleUp: boolean): string {
    const quantumUtilization = (metrics.resourceUtilization.qubits + metrics.resourceUtilization.qkdChannels) / 2;

    if (scaleUp) {
      if (quantumUtilization > policy.targetQuantumUtilization * 1.2) {
        return `High quantum resource utilization: ${quantumUtilization.toFixed(1)}%`;
      }
      if (metrics.performance.responseTime > policy.maxResponseTime) {
        return `High response time: ${metrics.performance.responseTime}ms`;
      }
      if (metrics.performance.errorRate > policy.maxErrorRate) {
        return `High error rate: ${(metrics.performance.errorRate * 100).toFixed(2)}%`;
      }
    } else {
      return `Low quantum resource utilization: ${quantumUtilization.toFixed(1)}%`;
    }

    return 'Performance optimization';
  }

  private calculateRequiredResources(replicaDelta: number): Record<string, number> {
    // Estimate resources needed for additional replicas
    const baseResources = {
      'quantum.io/qubits': 10,
      'quantum.io/qkd-channels': 2,
      'quantum.io/quantum-memory': 256
    };

    const requiredResources: Record<string, number> = {};
    for (const [resource, baseAmount] of Object.entries(baseResources)) {
      requiredResources[resource] = baseAmount * Math.abs(replicaDelta);
    }

    return requiredResources;
  }

  private recordScalingEvent(serviceName: string, decision: ScalingDecision): void {
    this.scalingHistory.push({
      timestamp: Date.now(),
      resource: serviceName,
      action: decision.desiredReplicas > decision.currentReplicas ? 'SCALE_UP' : 'SCALE_DOWN',
      reason: decision.reason
    });

    // Keep only last 100 events
    if (this.scalingHistory.length > 100) {
      this.scalingHistory = this.scalingHistory.slice(-100);
    }
  }

  setScalingPolicy(serviceName: string, policy: QuantumScalingPolicy): void {
    this.scalingPolicies.set(serviceName, policy);
    console.log(`📊 Set scaling policy for service: ${serviceName}`);
  }

  getScalingHistory(): Array<{ timestamp: number; resource: string; action: string; reason: string }> {
    return [...this.scalingHistory];
  }

  getScalingPolicies(): Map<string, QuantumScalingPolicy> {
    return new Map(this.scalingPolicies);
  }
}

interface ScalingDecision {
  currentReplicas: number;
  desiredReplicas: number;
  reason: string;
  estimatedTime: number;
  quantumResourcesRequired: Record<string, number>;
}

interface ControllerMetrics {
  services: {
    total: number;
    running: number;
    pending: number;
    failed: number;
  };
  pods: {
    total: number;
    running: number;
    pending: number;
    failed: number;
  };
  nodes: {
    total: number;
    utilization: Map<string, Record<string, number>>;
  };
  autoScaling: {
    policies: number;
    history: Array<{ timestamp: number; resource: string; action: string; reason: string }>;
  };
  isInitialized: boolean;
  timestamp: number;
}

interface QuantumScalingPolicy {
  enabled: boolean;
  minReplicas: number;
  maxReplicas: number;
  targetQuantumUtilization: number;
  maxResponseTime: number;
  maxErrorRate: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
}

interface ControllerMetrics {
  services: {
    total: number;
    running: number;
    pending: number;
    failed: number;
  };
  pods: {
    total: number;
    running: number;
    pending: number;
    failed: number;
  };
  nodes: {
    total: number;
    utilization: Map<string, Record<string, number>>;
  };
  autoScaling: {
    policies: number;
    history: Array<{ timestamp: number; resource: string; action: string; reason: string }>;
  };
  isInitialized: boolean;
  timestamp: number;
}

// Main Quantum Kubernetes Controller
export class QuantumKubernetesController extends EventEmitter {
  private resourceManager: QuantumResourceManager;
  private scheduler: QuantumScheduler;
  private autoScaler: QuantumHorizontalPodAutoscaler;
  private quantumServices: Map<string, QuantumCustomResource> = new Map();
  private quantumPods: Map<string, QuantumPod> = new Map();
  private isInitialized: boolean = false;
  private controllerTimer?: NodeJS.Timeout;

  constructor(
    private orchestrationIntegrator: QuantumOrchestrationIntegrator,
    private serviceDiscovery: QuantumServiceDiscoveryEngine,
    private cryptoEngine: PostQuantumCryptoEngine
  ) {
    super();

    this.resourceManager = new QuantumResourceManager();
    this.scheduler = new QuantumScheduler(this.resourceManager);
    this.autoScaler = new QuantumHorizontalPodAutoscaler();

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Quantum Kubernetes Controller...');

      // Initialize default quantum nodes
      await this.initializeQuantumNodes();

      // Set up default scaling policies
      this.setupDefaultScalingPolicies();

      // Start controller loop
      this.startControllerLoop();

      this.isInitialized = true;

      this.emit('initialized', {
        timestamp: Date.now(),
        quantumNodes: this.resourceManager.getResourceUsage().size,
        quantumServices: this.quantumServices.size
      });

      console.log('✅ Quantum Kubernetes Controller initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Quantum Kubernetes Controller:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  private async initializeQuantumNodes(): Promise<void> {
    // Create sample quantum-enabled nodes
    const quantumNodes: KubernetesNode[] = [
      {
        name: 'quantum-node-1',
        labels: {
          'quantum.io/enabled': 'true',
          'quantum.io/tier': 'premium',
          'quantum.io/zone': 'quantum-zone-1'
        },
        annotations: {
          'quantum.io/capabilities': 'qkd,entanglement,quantum-memory'
        },
        capacity: {
          cpu: '8',
          memory: '32Gi',
          'quantum.io/qubits': '50',
          'quantum.io/qkd-channels': '25',
          'quantum.io/quantum-memory': '1024'
        },
        allocatable: {
          cpu: '7.5',
          memory: '30Gi',
          'quantum.io/qubits': '50',
          'quantum.io/qkd-channels': '25',
          'quantum.io/quantum-memory': '1024'
        },
        conditions: [
          { type: 'Ready', status: 'True', lastHeartbeatTime: new Date().toISOString() }
        ],
        quantumCapabilities: {
          qkdSupport: true,
          entanglementSupport: true,
          quantumMemorySize: 1024,
          supportedAlgorithms: ['BB84', 'E91', 'SARG04'],
          quantumProcessors: 4
        }
      },
      {
        name: 'quantum-node-2',
        labels: {
          'quantum.io/enabled': 'true',
          'quantum.io/tier': 'standard',
          'quantum.io/zone': 'quantum-zone-2'
        },
        annotations: {
          'quantum.io/capabilities': 'qkd,quantum-memory'
        },
        capacity: {
          cpu: '4',
          memory: '16Gi',
          'quantum.io/qubits': '25',
          'quantum.io/qkd-channels': '10',
          'quantum.io/quantum-memory': '512'
        },
        allocatable: {
          cpu: '3.5',
          memory: '14Gi',
          'quantum.io/qubits': '25',
          'quantum.io/qkd-channels': '10',
          'quantum.io/quantum-memory': '512'
        },
        conditions: [
          { type: 'Ready', status: 'True', lastHeartbeatTime: new Date().toISOString() }
        ],
        quantumCapabilities: {
          qkdSupport: true,
          entanglementSupport: false,
          quantumMemorySize: 512,
          supportedAlgorithms: ['BB84', 'SARG04'],
          quantumProcessors: 2
        }
      }
    ];

    for (const node of quantumNodes) {
      this.resourceManager.updateNodeResources(node);
    }

    console.log(`📦 Initialized ${quantumNodes.length} quantum-enabled nodes`);
  }

  private setupDefaultScalingPolicies(): void {
    // Default scaling policy for quantum services
    this.autoScaler.setScalingPolicy('default', {
      enabled: true,
      minReplicas: 1,
      maxReplicas: 10,
      targetQuantumUtilization: 70,
      maxResponseTime: 200,
      maxErrorRate: 0.05,
      scaleUpCooldown: 300000,   // 5 minutes
      scaleDownCooldown: 600000  // 10 minutes
    });

    // High-performance policy for critical quantum services
    this.autoScaler.setScalingPolicy('critical', {
      enabled: true,
      minReplicas: 3,
      maxReplicas: 20,
      targetQuantumUtilization: 50,
      maxResponseTime: 100,
      maxErrorRate: 0.01,
      scaleUpCooldown: 180000,   // 3 minutes
      scaleDownCooldown: 900000  // 15 minutes
    });

    console.log('📊 Default quantum auto-scaling policies configured');
  }

  private startControllerLoop(): void {
    this.controllerTimer = setInterval(async () => {
      await this.runControllerCycle();
    }, 30000); // Run every 30 seconds

    console.log('🔄 Quantum controller loop started');
  }

  private async runControllerCycle(): Promise<void> {
    try {
      // Update quantum service status
      await this.updateQuantumServiceStatus();

      // Process auto-scaling
      await this.processAutoScaling();

      // Reconcile desired state
      await this.reconcileQuantumServices();

      this.emit('controller_cycle_completed', {
        timestamp: Date.now(),
        servicesManaged: this.quantumServices.size,
        podsManaged: this.quantumPods.size
      });

    } catch (error) {
      console.error('❌ Error in controller cycle:', error);
      this.emit('error', { type: 'controller_cycle', error });
    }
  }

  private async updateQuantumServiceStatus(): Promise<void> {
    for (const [name, service] of this.quantumServices.entries()) {
      const pods = Array.from(this.quantumPods.values())
        .filter(pod => pod.name.startsWith(name));

      const runningPods = pods.filter(pod => pod.phase === 'Running');
      const readyPods = runningPods.filter(pod =>
        pod.conditions.some(c => c.type === 'Ready' && c.status === 'True')
      );

      if (service.status) {
        service.status.replicas = pods.length;
        service.status.readyReplicas = readyPods.length;
        service.status.phase = this.determineServicePhase(service, pods);
        service.status.lastUpdateTime = new Date().toISOString();
      }
    }
  }

  private determineServicePhase(service: QuantumCustomResource, pods: QuantumPod[]): 'Pending' | 'Running' | 'Scaling' | 'Failed' | 'Succeeded' {
    const desiredReplicas = service.spec.deployment.replicas;
    const runningPods = pods.filter(pod => pod.phase === 'Running').length;
    const failedPods = pods.filter(pod => pod.phase === 'Failed').length;

    if (failedPods > 0 && runningPods === 0) return 'Failed';
    if (runningPods === 0) return 'Pending';
    if (runningPods === desiredReplicas) return 'Running';
    if (runningPods !== desiredReplicas) return 'Scaling';

    return 'Running';
  }

  private async processAutoScaling(): Promise<void> {
    for (const [serviceName, service] of this.quantumServices.entries()) {
      if (!service.spec.scaling) continue;

      // Create current metrics
      const currentMetrics: QuantumMetrics = {
        namespace: service.metadata.namespace,
        name: serviceName,
        timestamp: Date.now(),
        resourceUtilization: {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          qubits: Math.random() * 100,
          qkdChannels: Math.random() * 100
        },
        performance: {
          responseTime: Math.random() * 300,
          throughput: Math.random() * 1000,
          quantumOperationsPerSecond: Math.random() * 500,
          errorRate: Math.random() * 0.1
        },
        scaling: {
          currentReplicas: service.status?.replicas || 0,
          desiredReplicas: service.spec.deployment.replicas,
          scaleEvents: 0,
          lastScaleTime: Date.now()
        }
      };

      const scalingDecision = await this.autoScaler.evaluateScaling(serviceName, currentMetrics);
      if (scalingDecision) {
        await this.executeScalingDecision(serviceName, scalingDecision);
      }
    }
  }

  private async executeScalingDecision(serviceName: string, decision: ScalingDecision): Promise<void> {
    const service = this.quantumServices.get(serviceName);
    if (!service) return;

    console.log(`⚖️ Scaling service ${serviceName}: ${decision.currentReplicas} -> ${decision.desiredReplicas} (${decision.reason})`);

    // Update service replica count
    service.spec.deployment.replicas = decision.desiredReplicas;

    // Emit scaling event
    this.emit('service_scaled', {
      serviceName,
      currentReplicas: decision.currentReplicas,
      desiredReplicas: decision.desiredReplicas,
      reason: decision.reason,
      timestamp: Date.now()
    });
  }

  private async reconcileQuantumServices(): Promise<void> {
    for (const [serviceName, service] of this.quantumServices.entries()) {
      const currentPods = Array.from(this.quantumPods.values())
        .filter(pod => pod.name.startsWith(serviceName));

      const desiredReplicas = service.spec.deployment.replicas;
      const currentReplicas = currentPods.length;

      if (currentReplicas < desiredReplicas) {
        // Scale up - create new pods
        const podsToCreate = desiredReplicas - currentReplicas;
        for (let i = 0; i < podsToCreate; i++) {
          await this.createQuantumPod(service, i);
        }
      } else if (currentReplicas > desiredReplicas) {
        // Scale down - remove pods
        const podsToRemove = currentReplicas - desiredReplicas;
        const podsToDelete = currentPods.slice(-podsToRemove);
        for (const pod of podsToDelete) {
          await this.deleteQuantumPod(pod.name);
        }
      }
    }
  }

  private async createQuantumPod(service: QuantumCustomResource, index: number): Promise<void> {
    const podName = `${service.metadata.name}-${index}-${Math.random().toString(36).substr(2, 6)}`;

    const quantumPod: QuantumPod = {
      name: podName,
      namespace: service.metadata.namespace,
      nodeName: '', // Will be set by scheduler
      phase: 'Pending',
      quantumResources: {
        requests: {
          'quantum.io/qubits': service.spec.quantumResources.qubits || 0,
          'quantum.io/qkd-channels': service.spec.quantumResources.qkdChannels || 0,
          'quantum.io/quantum-memory': service.spec.quantumResources.quantumMemory || 0
        },
        limits: {
          'quantum.io/qubits': (service.spec.quantumResources.qubits || 0) * 2,
          'quantum.io/qkd-channels': (service.spec.quantumResources.qkdChannels || 0) * 2,
          'quantum.io/quantum-memory': (service.spec.quantumResources.quantumMemory || 0) * 2
        },
        allocated: {}
      },
      conditions: [
        { type: 'PodScheduled', status: 'False', lastTransitionTime: new Date().toISOString() }
      ],
      quantumStatus: {
        qkdSessionsActive: 0,
        entanglementPairsActive: 0,
        quantumOperationsPerSecond: 0,
        lastQuantumHealthCheck: new Date().toISOString()
      }
    };

    // Schedule the pod
    const nodes = Array.from(this.resourceManager.getResourceUsage().keys())
      .map(nodeName => ({
        name: nodeName,
        labels: { 'quantum.io/enabled': 'true' },
        annotations: {},
        capacity: { cpu: '8', memory: '32Gi', 'quantum.io/qubits': '50', 'quantum.io/qkd-channels': '25', 'quantum.io/quantum-memory': '1024' },
        allocatable: { cpu: '7', memory: '30Gi', 'quantum.io/qubits': '40', 'quantum.io/qkd-channels': '20', 'quantum.io/quantum-memory': '800' },
        conditions: [{ type: 'Ready', status: 'True', lastHeartbeatTime: new Date().toISOString() }]
      }));

    const schedulingResult = await this.scheduler.scheduleQuantumPod(quantumPod, nodes);
    if (schedulingResult) {
      quantumPod.nodeName = schedulingResult.selectedNode;
      quantumPod.phase = 'Running';

      // Allocate quantum resources
      if (this.resourceManager.allocateQuantumResources(quantumPod)) {
        this.quantumPods.set(podName, quantumPod);

        this.emit('pod_created', {
          podName,
          serviceName: service.metadata.name,
          nodeName: quantumPod.nodeName,
          quantumResources: quantumPod.quantumResources.allocated,
          timestamp: Date.now()
        });

        console.log(`🚀 Created quantum pod: ${podName} on node: ${quantumPod.nodeName}`);
      } else {
        console.error(`❌ Failed to allocate quantum resources for pod: ${podName}`);
      }
    } else {
      console.error(`❌ Failed to schedule quantum pod: ${podName}`);
    }
  }

  private async deleteQuantumPod(podName: string): Promise<void> {
    const pod = this.quantumPods.get(podName);
    if (!pod) return;

    // Release quantum resources
    this.resourceManager.releaseQuantumResources(podName);

    // Remove pod
    this.quantumPods.delete(podName);

    this.emit('pod_deleted', {
      podName,
      nodeName: pod.nodeName,
      timestamp: Date.now()
    });

    console.log(`🗑️ Deleted quantum pod: ${podName}`);
  }

  // Public API methods
  async createQuantumService(spec: QuantumCustomResource): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Quantum Kubernetes Controller not initialized');
    }

    const serviceName = spec.metadata.name;

    // Add default status
    spec.status = {
      phase: 'Pending',
      replicas: 0,
      readyReplicas: 0,
      quantumResourcesAllocated: {
        qubits: 0,
        qkdChannels: 0,
        entanglementPairs: 0
      },
      conditions: [
        {
          type: 'Available',
          status: 'False',
          lastTransitionTime: new Date().toISOString(),
          reason: 'ServiceCreated',
          message: 'Quantum service created, waiting for pods'
        }
      ],
      observedGeneration: 1,
      lastUpdateTime: new Date().toISOString()
    };

    this.quantumServices.set(serviceName, spec);

    this.emit('service_created', {
      serviceName,
      namespace: spec.metadata.namespace,
      quantumResources: spec.spec.quantumResources,
      timestamp: Date.now()
    });

    console.log(`📦 Created quantum service: ${serviceName}`);
    return serviceName;
  }

  async deleteQuantumService(serviceName: string): Promise<boolean> {
    const service = this.quantumServices.get(serviceName);
    if (!service) return false;

    // Delete all pods for this service
    const servicePods = Array.from(this.quantumPods.values())
      .filter(pod => pod.name.startsWith(serviceName));

    for (const pod of servicePods) {
      await this.deleteQuantumPod(pod.name);
    }

    // Remove service
    this.quantumServices.delete(serviceName);

    this.emit('service_deleted', {
      serviceName,
      timestamp: Date.now()
    });

    console.log(`🗑️ Deleted quantum service: ${serviceName}`);
    return true;
  }

  getQuantumService(serviceName: string): QuantumCustomResource | undefined {
    return this.quantumServices.get(serviceName);
  }

  getQuantumServices(): QuantumCustomResource[] {
    return Array.from(this.quantumServices.values());
  }

  getQuantumPods(serviceName?: string): QuantumPod[] {
    const pods = Array.from(this.quantumPods.values());
    return serviceName ? pods.filter(pod => pod.name.startsWith(serviceName)) : pods;
  }

  getNodeQuantumUtilization(): Map<string, Record<string, number>> {
    const utilization = new Map<string, Record<string, number>>();

    for (const nodeName of this.resourceManager.getResourceUsage().keys()) {
      const nodeUtilization = this.resourceManager.getNodeQuantumUtilization(nodeName);
      if (nodeUtilization) {
        utilization.set(nodeName, nodeUtilization);
      }
    }

    return utilization;
  }

  getControllerMetrics(): ControllerMetrics {
    return {
      services: {
        total: this.quantumServices.size,
        running: Array.from(this.quantumServices.values()).filter(s => s.status?.phase === 'Running').length,
        pending: Array.from(this.quantumServices.values()).filter(s => s.status?.phase === 'Pending').length,
        failed: Array.from(this.quantumServices.values()).filter(s => s.status?.phase === 'Failed').length
      },
      pods: {
        total: this.quantumPods.size,
        running: Array.from(this.quantumPods.values()).filter(p => p.phase === 'Running').length,
        pending: Array.from(this.quantumPods.values()).filter(p => p.phase === 'Pending').length,
        failed: Array.from(this.quantumPods.values()).filter(p => p.phase === 'Failed').length
      },
      nodes: {
        total: this.resourceManager.getResourceUsage().size,
        utilization: this.getNodeQuantumUtilization()
      },
      autoScaling: {
        policies: this.autoScaler.getScalingPolicies().size,
        history: this.autoScaler.getScalingHistory().slice(-10)
      },
      isInitialized: this.isInitialized,
      timestamp: Date.now()
    };
  }

  setQuantumResourceQuota(namespace: string, quota: Record<string, number>): void {
    this.resourceManager.setResourceQuota(namespace, quota);
  }

  destroy(): void {
    if (this.controllerTimer) {
      clearInterval(this.controllerTimer);
    }

    this.quantumServices.clear();
    this.quantumPods.clear();
    this.isInitialized = false;

    console.log('🔧 Quantum Kubernetes Controller destroyed');
  }
}

export type {
  QuantumCustomResource,
  QuantumServiceSpec,
  QuantumServiceStatus,
  QuantumPod,
  QuantumSchedulingResult,
  QuantumMetrics,
  ScalingDecision,
  QuantumScalingPolicy
};

export default QuantumKubernetesController;
