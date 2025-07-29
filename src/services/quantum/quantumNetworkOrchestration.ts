/**
 * Quantum Network Orchestration System
 * Implementation of quantum mesh networking, service discovery, and network analytics
 */

import { EventEmitter } from 'events';
import { PostQuantumCryptoEngine } from '../quantum/postQuantumCrypto';
import { QuantumKeyDistribution } from '../quantum/quantumKeyDistribution';
import { QuantumResistantAuthentication } from '../quantum/quantumAuth';

// Core interfaces for quantum network orchestration
interface QuantumNode {
  nodeId: string;
  type: 'QUANTUM_RELAY' | 'QUANTUM_ENDPOINT' | 'QUANTUM_GATEWAY' | 'QUANTUM_BRIDGE';
  address: {
    ip: string;
    port: number;
    quantumPort?: number;
  };
  capabilities: {
    qkdSupport: boolean;
    maxQuantumChannels: number;
    supportedAlgorithms: string[];
    hardwareAcceleration: boolean;
    quantumMemory: boolean;
  };
  status: {
    online: boolean;
    quantumReady: boolean;
    lastSeen: number;
    uptime: number;
    load: number;
    qberRate: number;
  };
  security: {
    nodePublicKey: Uint8Array;
    certificateChain: string[];
    trustLevel: number;
    attestationValid: boolean;
  };
  connections: Map<string, QuantumConnection>;
  metrics: {
    packetsTransmitted: number;
    packetsReceived: number;
    quantumKeysGenerated: number;
    quantumBitRate: number;
    errorRate: number;
  };
}

interface QuantumConnection {
  connectionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: 'QUANTUM_DIRECT' | 'QUANTUM_RELAY' | 'CLASSICAL_FALLBACK';
  status: 'ESTABLISHING' | 'ACTIVE' | 'DEGRADED' | 'FAILED';
  channel: {
    quantumChannelId?: string;
    qberRate: number;
    keyRate: number; // bits/second
    distance: number; // kilometers
    fidelity: number;
  };
  security: {
    sessionKey: Uint8Array;
    keyRotationInterval: number;
    lastKeyRotation: number;
    encryptionAlgorithm: string;
  };
  qos: {
    latency: number;
    jitter: number;
    bandwidth: number;
    reliability: number;
  };
  metrics: {
    bytesTransmitted: number;
    bytesReceived: number;
    connectTime: number;
    lastActivity: number;
  };
}

interface QuantumService {
  serviceId: string;
  name: string;
  type: 'QUANTUM_SERVICE' | 'HYBRID_SERVICE' | 'CLASSICAL_SERVICE';
  endpoint: {
    nodeId: string;
    address: string;
    port: number;
    quantumSecured: boolean;
  };
  metadata: {
    version: string;
    description: string;
    tags: string[];
    quantumRequirements: string[];
  };
  health: {
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
    lastCheck: number;
    responseTime: number;
    quantumChannelStatus: boolean;
  };
  security: {
    requiredAuthLevel: number;
    quantumAuthentication: boolean;
    postQuantumEncryption: boolean;
    servicePublicKey?: Uint8Array;
  };
  loadBalancing: {
    instances: QuantumServiceInstance[];
    algorithm: 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'QUANTUM_OPTIMIZED';
    weights: Map<string, number>;
  };
}

interface QuantumServiceInstance {
  instanceId: string;
  serviceId: string;
  nodeId: string;
  endpoint: string;
  status: 'STARTING' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'FAILED';
  health: {
    healthy: boolean;
    lastCheck: number;
    consecutiveFailures: number;
  };
  metrics: {
    requestCount: number;
    responseTime: number;
    errorRate: number;
    quantumOperations: number;
  };
  resources: {
    cpu: number;
    memory: number;
    quantumChannels: number;
    networkBandwidth: number;
  };
}

interface QuantumNetworkTopology {
  nodes: Map<string, QuantumNode>;
  connections: Map<string, QuantumConnection>;
  routes: Map<string, QuantumRoute>;
  clusters: Map<string, QuantumCluster>;
  metrics: {
    totalNodes: number;
    activeConnections: number;
    averageQBER: number;
    totalKeyRate: number;
    networkReliability: number;
  };
}

interface QuantumRoute {
  routeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  path: string[];
  type: 'QUANTUM_DIRECT' | 'QUANTUM_MULTI_HOP' | 'HYBRID';
  metrics: {
    totalDistance: number;
    totalLatency: number;
    reliability: number;
    keyRate: number;
    qberRate: number;
  };
  status: 'ACTIVE' | 'BACKUP' | 'FAILED';
  lastUpdated: number;
}

interface QuantumCluster {
  clusterId: string;
  name: string;
  nodes: string[];
  type: 'QUANTUM_COMPUTE' | 'QUANTUM_STORAGE' | 'QUANTUM_NETWORK' | 'MIXED';
  resources: {
    totalQuantumChannels: number;
    availableQuantumChannels: number;
    totalKeyRate: number;
    averageReliability: number;
  };
  loadBalancer: {
    algorithm: string;
    healthCheckInterval: number;
    failoverEnabled: boolean;
  };
}

interface QuantumNetworkEvent {
  eventId: string;
  type: 'NODE_JOIN' | 'NODE_LEAVE' | 'CONNECTION_ESTABLISHED' | 'CONNECTION_FAILED' | 
        'ROUTE_CHANGED' | 'QUANTUM_CHANNEL_ERROR' | 'SERVICE_REGISTERED' | 'SERVICE_FAILED';
  nodeId?: string;
  connectionId?: string;
  serviceId?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  data: any;
  timestamp: number;
}

// Quantum Network Discovery Protocol
class QuantumNetworkDiscovery {
  private discoveredNodes: Map<string, QuantumNode> = new Map();
  private discoveryInterval: number = 30000; // 30 seconds
  private discoveryTimer?: NodeJS.Timeout;

  constructor(private networkManager: QuantumMeshNetworkManager) {}

  startDiscovery(): void {
    this.performDiscovery();
    this.discoveryTimer = setInterval(() => {
      this.performDiscovery();
    }, this.discoveryInterval);
    
    console.log('🔍 Quantum network discovery started');
  }

  stopDiscovery(): void {
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = undefined;
    }
    console.log('🔍 Quantum network discovery stopped');
  }

  private async performDiscovery(): Promise<void> {
    try {
      // Broadcast quantum discovery beacon
      const discoveryPacket = this.createDiscoveryPacket();
      await this.broadcastDiscovery(discoveryPacket);
      
      // Listen for responses
      await this.listenForResponses();
      
      // Update network topology
      this.updateTopology();
      
    } catch (error) {
      console.error('Discovery error:', error);
    }
  }

  private createDiscoveryPacket(): any {
    return {
      type: 'QUANTUM_DISCOVERY',
      nodeId: this.networkManager.getLocalNodeId(),
      timestamp: Date.now(),
      capabilities: this.networkManager.getLocalCapabilities(),
      publicKey: this.networkManager.getLocalPublicKey()
    };
  }

  private async broadcastDiscovery(packet: any): Promise<void> {
    // Simulate quantum discovery broadcast
    const networkInterfaces = this.getNetworkInterfaces();
    
    for (const iface of networkInterfaces) {
      try {
        await this.sendDiscoveryPacket(iface.broadcast, packet);
      } catch (error) {
        console.warn(`Discovery broadcast failed on ${iface.name}:`, error.message);
      }
    }
  }

  private async sendDiscoveryPacket(address: string, packet: any): Promise<void> {
    // Simulate sending discovery packet
    // In real implementation, this would use UDP multicast or quantum channels
    console.log(`📡 Sending discovery packet to ${address}`);
  }

  private async listenForResponses(): Promise<void> {
    // Simulate listening for discovery responses
    const responses = await this.simulateDiscoveryResponses();
    
    for (const response of responses) {
      await this.processDiscoveryResponse(response);
    }
  }

  private async simulateDiscoveryResponses(): Promise<any[]> {
    // Simulate discovery of quantum nodes
    const mockResponses = [
      {
        nodeId: 'quantum-node-001',
        type: 'QUANTUM_ENDPOINT',
        address: { ip: '10.0.1.10', port: 8080, quantumPort: 9080 },
        capabilities: {
          qkdSupport: true,
          maxQuantumChannels: 8,
          supportedAlgorithms: ['KYBER-768', 'DILITHIUM-3'],
          hardwareAcceleration: true,
          quantumMemory: false
        }
      },
      {
        nodeId: 'quantum-node-002',
        type: 'QUANTUM_RELAY',
        address: { ip: '10.0.1.20', port: 8080, quantumPort: 9080 },
        capabilities: {
          qkdSupport: true,
          maxQuantumChannels: 16,
          supportedAlgorithms: ['KYBER-1024', 'DILITHIUM-5'],
          hardwareAcceleration: true,
          quantumMemory: true
        }
      }
    ];

    return mockResponses;
  }

  private async processDiscoveryResponse(response: any): Promise<void> {
    const nodeId = response.nodeId;
    
    if (this.discoveredNodes.has(nodeId)) {
      // Update existing node
      const existingNode = this.discoveredNodes.get(nodeId)!;
      existingNode.status.lastSeen = Date.now();
      existingNode.status.online = true;
    } else {
      // Add new node
      const newNode: QuantumNode = {
        nodeId,
        type: response.type,
        address: response.address,
        capabilities: response.capabilities,
        status: {
          online: true,
          quantumReady: false,
          lastSeen: Date.now(),
          uptime: 0,
          load: 0.1,
          qberRate: 0.02
        },
        security: {
          nodePublicKey: new Uint8Array(32),
          certificateChain: [],
          trustLevel: 0.5,
          attestationValid: false
        },
        connections: new Map(),
        metrics: {
          packetsTransmitted: 0,
          packetsReceived: 0,
          quantumKeysGenerated: 0,
          quantumBitRate: 0,
          errorRate: 0
        }
      };

      this.discoveredNodes.set(nodeId, newNode);
      
      // Attempt quantum handshake
      await this.performQuantumHandshake(newNode);
    }
  }

  private async performQuantumHandshake(node: QuantumNode): Promise<void> {
    try {
      console.log(`🤝 Performing quantum handshake with ${node.nodeId}`);
      
      // Simulate quantum key exchange for node authentication
      const qkdSession = await this.networkManager.getQKD().startBB84Session('default', 256);
      const sessionKey = this.networkManager.getQKD().getSessionKey(qkdSession);
      
      if (sessionKey) {
        node.status.quantumReady = true;
        node.security.trustLevel = 0.9;
        node.security.attestationValid = true;
        
        // Add to network manager
        this.networkManager.addNode(node);
        
        console.log(`✅ Quantum handshake successful with ${node.nodeId}`);
      } else {
        console.warn(`⚠️ Quantum handshake failed with ${node.nodeId}`);
      }
    } catch (error) {
      console.error(`❌ Quantum handshake error with ${node.nodeId}:`, error);
    }
  }

  private updateTopology(): void {
    // Update network topology based on discovered nodes
    const topology = this.networkManager.getTopology();
    
    // Remove stale nodes
    const staleThreshold = Date.now() - (this.discoveryInterval * 3);
    for (const [nodeId, node] of topology.nodes.entries()) {
      if (node.status.lastSeen < staleThreshold) {
        console.log(`🗑️ Removing stale node: ${nodeId}`);
        this.networkManager.removeNode(nodeId);
      }
    }
    
    // Update metrics
    topology.metrics.totalNodes = topology.nodes.size;
    topology.metrics.activeConnections = Array.from(topology.connections.values())
      .filter(conn => conn.status === 'ACTIVE').length;
  }

  private getNetworkInterfaces(): Array<{ name: string; broadcast: string }> {
    // Simulate network interface discovery
    return [
      { name: 'eth0', broadcast: '10.0.1.255' },
      { name: 'wlan0', broadcast: '192.168.1.255' }
    ];
  }

  getDiscoveredNodes(): Map<string, QuantumNode> {
    return new Map(this.discoveredNodes);
  }
}

// Quantum Routing Protocol
class QuantumRoutingProtocol {
  private routingTable: Map<string, QuantumRoute[]> = new Map();
  private routingUpdateInterval: number = 60000; // 1 minute
  private routingTimer?: NodeJS.Timeout;

  constructor(private networkManager: QuantumMeshNetworkManager) {}

  startRouting(): void {
    this.calculateRoutes();
    this.routingTimer = setInterval(() => {
      this.calculateRoutes();
    }, this.routingUpdateInterval);
    
    console.log('🛣️ Quantum routing protocol started');
  }

  stopRouting(): void {
    if (this.routingTimer) {
      clearInterval(this.routingTimer);
      this.routingTimer = undefined;
    }
    console.log('🛣️ Quantum routing protocol stopped');
  }

  private calculateRoutes(): void {
    const topology = this.networkManager.getTopology();
    const nodes = Array.from(topology.nodes.keys());
    
    // Calculate shortest quantum paths between all node pairs
    for (const sourceNodeId of nodes) {
      const routes: QuantumRoute[] = [];
      
      for (const targetNodeId of nodes) {
        if (sourceNodeId !== targetNodeId) {
          const route = this.findBestQuantumRoute(sourceNodeId, targetNodeId, topology);
          if (route) {
            routes.push(route);
          }
        }
      }
      
      this.routingTable.set(sourceNodeId, routes);
    }
    
    console.log(`🛣️ Calculated routes for ${nodes.length} nodes`);
  }

  private findBestQuantumRoute(
    sourceNodeId: string, 
    targetNodeId: string, 
    topology: QuantumNetworkTopology
  ): QuantumRoute | null {
    // Implement quantum-aware shortest path algorithm
    const visited = new Set<string>();
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const keyRates = new Map<string, number>();
    
    // Initialize distances
    for (const nodeId of topology.nodes.keys()) {
      distances.set(nodeId, Infinity);
      keyRates.set(nodeId, 0);
    }
    distances.set(sourceNodeId, 0);
    keyRates.set(sourceNodeId, Infinity);
    
    while (visited.size < topology.nodes.size) {
      // Find unvisited node with minimum distance
      let currentNode: string | null = null;
      let minDistance = Infinity;
      
      for (const [nodeId, distance] of distances.entries()) {
        if (!visited.has(nodeId) && distance < minDistance) {
          minDistance = distance;
          currentNode = nodeId;
        }
      }
      
      if (!currentNode || minDistance === Infinity) break;
      
      visited.add(currentNode);
      
      // Update distances to neighbors
      const node = topology.nodes.get(currentNode);
      if (node) {
        for (const [neighborId, connection] of node.connections.entries()) {
          if (!visited.has(neighborId) && connection.status === 'ACTIVE') {
            // Quantum-aware distance calculation
            const quantumDistance = this.calculateQuantumDistance(connection);
            const newDistance = distances.get(currentNode)! + quantumDistance;
            
            if (newDistance < distances.get(neighborId)!) {
              distances.set(neighborId, newDistance);
              previous.set(neighborId, currentNode);
              
              // Update minimum key rate along path
              const currentKeyRate = keyRates.get(currentNode)!;
              const connectionKeyRate = connection.channel.keyRate;
              keyRates.set(neighborId, Math.min(currentKeyRate, connectionKeyRate));
            }
          }
        }
      }
    }
    
    // Reconstruct path
    if (!previous.has(targetNodeId)) {
      return null; // No route found
    }
    
    const path: string[] = [];
    let current: string | null = targetNodeId;
    
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current)!;
    }
    
    // Create route object
    const route: QuantumRoute = {
      routeId: `route_${sourceNodeId}_${targetNodeId}_${Date.now()}`,
      sourceNodeId,
      targetNodeId,
      path,
      type: path.length === 2 ? 'QUANTUM_DIRECT' : 'QUANTUM_MULTI_HOP',
      metrics: {
        totalDistance: distances.get(targetNodeId)!,
        totalLatency: this.calculateRouteLatency(path, topology),
        reliability: this.calculateRouteReliability(path, topology),
        keyRate: keyRates.get(targetNodeId)!,
        qberRate: this.calculateRouteQBER(path, topology)
      },
      status: 'ACTIVE',
      lastUpdated: Date.now()
    };
    
    return route;
  }

  private calculateQuantumDistance(connection: QuantumConnection): number {
    // Quantum-aware distance metric considering QBER, key rate, and reliability
    const qberPenalty = connection.channel.qberRate * 10;
    const keyRateBonus = Math.log(connection.channel.keyRate + 1) / 10;
    const reliabilityBonus = connection.qos.reliability * 2;
    
    return connection.channel.distance + qberPenalty - keyRateBonus - reliabilityBonus;
  }

  private calculateRouteLatency(path: string[], topology: QuantumNetworkTopology): number {
    let totalLatency = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const sourceNodeId = path[i];
      const targetNodeId = path[i + 1];
      const sourceNode = topology.nodes.get(sourceNodeId);
      
      if (sourceNode) {
        const connection = sourceNode.connections.get(targetNodeId);
        if (connection) {
          totalLatency += connection.qos.latency;
        }
      }
    }
    
    return totalLatency;
  }

  private calculateRouteReliability(path: string[], topology: QuantumNetworkTopology): number {
    let minReliability = 1.0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const sourceNodeId = path[i];
      const targetNodeId = path[i + 1];
      const sourceNode = topology.nodes.get(sourceNodeId);
      
      if (sourceNode) {
        const connection = sourceNode.connections.get(targetNodeId);
        if (connection) {
          minReliability = Math.min(minReliability, connection.qos.reliability);
        }
      }
    }
    
    return minReliability;
  }

  private calculateRouteQBER(path: string[], topology: QuantumNetworkTopology): number {
    let totalQBER = 0;
    let hops = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const sourceNodeId = path[i];
      const targetNodeId = path[i + 1];
      const sourceNode = topology.nodes.get(sourceNodeId);
      
      if (sourceNode) {
        const connection = sourceNode.connections.get(targetNodeId);
        if (connection) {
          totalQBER += connection.channel.qberRate;
          hops++;
        }
      }
    }
    
    return hops > 0 ? totalQBER / hops : 0;
  }

  findRoute(sourceNodeId: string, targetNodeId: string): QuantumRoute | null {
    const routes = this.routingTable.get(sourceNodeId);
    return routes?.find(route => route.targetNodeId === targetNodeId) || null;
  }

  getAllRoutes(): Map<string, QuantumRoute[]> {
    return new Map(this.routingTable);
  }

  updateRouteStatus(routeId: string, status: QuantumRoute['status']): void {
    for (const routes of this.routingTable.values()) {
      const route = routes.find(r => r.routeId === routeId);
      if (route) {
        route.status = status;
        route.lastUpdated = Date.now();
        break;
      }
    }
  }
}

// Main Quantum Mesh Network Manager
export class QuantumMeshNetworkManager extends EventEmitter {
  private postQuantumCrypto: PostQuantumCryptoEngine;
  private quantumKeyDistribution: QuantumKeyDistribution;
  private quantumAuth: QuantumResistantAuthentication;
  
  private localNodeId: string;
  private topology: QuantumNetworkTopology;
  private discovery: QuantumNetworkDiscovery;
  private routing: QuantumRoutingProtocol;
  
  private eventLog: QuantumNetworkEvent[] = [];
  private maxEventLogSize: number = 10000;
  
  private isInitialized: boolean = false;
  private healthCheckInterval: number = 30000; // 30 seconds
  private healthCheckTimer?: NodeJS.Timeout;

  constructor() {
    super();
    
    this.localNodeId = `quantum-node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize quantum components
    this.postQuantumCrypto = new PostQuantumCryptoEngine();
    this.quantumKeyDistribution = new QuantumKeyDistribution();
    this.quantumAuth = new QuantumResistantAuthentication();
    
    // Initialize network topology
    this.topology = {
      nodes: new Map(),
      connections: new Map(),
      routes: new Map(),
      clusters: new Map(),
      metrics: {
        totalNodes: 0,
        activeConnections: 0,
        averageQBER: 0,
        totalKeyRate: 0,
        networkReliability: 0
      }
    };
    
    // Initialize network protocols
    this.discovery = new QuantumNetworkDiscovery(this);
    this.routing = new QuantumRoutingProtocol(this);
    
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Wait for quantum components to initialize
      await this.waitForQuantumComponents();
      
      // Add local node to topology
      await this.addLocalNode();
      
      // Start network protocols
      this.discovery.startDiscovery();
      this.routing.startRouting();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      this.isInitialized = true;
      
      this.emit('initialized', {
        localNodeId: this.localNodeId,
        timestamp: Date.now()
      });
      
      console.log(`🌐 Quantum mesh network manager initialized: ${this.localNodeId}`);
    } catch (error) {
      console.error('❌ Failed to initialize quantum network manager:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  private async waitForQuantumComponents(): Promise<void> {
    // Wait for post-quantum crypto
    if (!this.postQuantumCrypto.getStatistics().isInitialized) {
      await new Promise(resolve => {
        this.postQuantumCrypto.once('initialized', resolve);
      });
    }
    
    // Generate local node key pair
    const keyPair = await this.postQuantumCrypto.generateKeyPair('DILITHIUM-3', this.localNodeId);
    console.log(`🔑 Generated quantum node key pair: ${keyPair.keyId}`);
  }

  private async addLocalNode(): Promise<void> {
    const localNode: QuantumNode = {
      nodeId: this.localNodeId,
      type: 'QUANTUM_ENDPOINT',
      address: {
        ip: '127.0.0.1',
        port: 8080,
        quantumPort: 9080
      },
      capabilities: {
        qkdSupport: true,
        maxQuantumChannels: 16,
        supportedAlgorithms: ['KYBER-768', 'DILITHIUM-3'],
        hardwareAcceleration: true,
        quantumMemory: false
      },
      status: {
        online: true,
        quantumReady: true,
        lastSeen: Date.now(),
        uptime: 0,
        load: 0.1,
        qberRate: 0.01
      },
      security: {
        nodePublicKey: this.getLocalPublicKey(),
        certificateChain: [],
        trustLevel: 1.0,
        attestationValid: true
      },
      connections: new Map(),
      metrics: {
        packetsTransmitted: 0,
        packetsReceived: 0,
        quantumKeysGenerated: 0,
        quantumBitRate: 1000,
        errorRate: 0.01
      }
    };
    
    this.topology.nodes.set(this.localNodeId, localNode);
    this.logEvent('NODE_JOIN', 'INFO', 'Local node added to network', { nodeId: this.localNodeId });
  }

  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckInterval);
    
    console.log('❤️ Network health monitoring started');
  }

  private async performHealthCheck(): Promise<void> {
    const unhealthyNodes: string[] = [];
    const currentTime = Date.now();
    
    for (const [nodeId, node] of this.topology.nodes.entries()) {
      if (nodeId === this.localNodeId) continue;
      
      // Check if node is responsive
      const timeSinceLastSeen = currentTime - node.status.lastSeen;
      if (timeSinceLastSeen > this.healthCheckInterval * 2) {
        node.status.online = false;
        unhealthyNodes.push(nodeId);
      }
      
      // Check quantum channel health
      if (node.status.qberRate > 0.11) { // 11% QBER threshold
        node.status.quantumReady = false;
        this.logEvent('QUANTUM_CHANNEL_ERROR', 'WARNING', 
          `High QBER detected: ${(node.status.qberRate * 100).toFixed(1)}%`, 
          { nodeId });
      }
    }
    
    // Handle unhealthy nodes
    for (const nodeId of unhealthyNodes) {
      this.handleUnhealthyNode(nodeId);
    }
    
    // Update network metrics
    this.updateNetworkMetrics();
  }

  private handleUnhealthyNode(nodeId: string): void {
    const node = this.topology.nodes.get(nodeId);
    if (!node) return;
    
    // Mark all connections as failed
    for (const [connectionId, connection] of node.connections.entries()) {
      connection.status = 'FAILED';
      this.topology.connections.set(connectionId, connection);
    }
    
    // Update routes
    this.routing.updateRouteStatus(`*_${nodeId}_*`, 'FAILED');
    
    this.logEvent('NODE_LEAVE', 'WARNING', 'Node became unhealthy', { nodeId });
    console.log(`⚠️ Node ${nodeId} marked as unhealthy`);
  }

  private updateNetworkMetrics(): void {
    const nodes = Array.from(this.topology.nodes.values());
    const connections = Array.from(this.topology.connections.values());
    
    // Update topology metrics
    this.topology.metrics.totalNodes = nodes.length;
    this.topology.metrics.activeConnections = connections.filter(c => c.status === 'ACTIVE').length;
    
    // Calculate average QBER
    const onlineNodes = nodes.filter(n => n.status.online);
    this.topology.metrics.averageQBER = onlineNodes.length > 0 ?
      onlineNodes.reduce((sum, n) => sum + n.status.qberRate, 0) / onlineNodes.length : 0;
    
    // Calculate total key rate
    this.topology.metrics.totalKeyRate = connections
      .filter(c => c.status === 'ACTIVE')
      .reduce((sum, c) => sum + c.channel.keyRate, 0);
    
    // Calculate network reliability
    this.topology.metrics.networkReliability = connections.length > 0 ?
      connections.reduce((sum, c) => sum + c.qos.reliability, 0) / connections.length : 0;
  }

  // Public API methods
  addNode(node: QuantumNode): void {
    this.topology.nodes.set(node.nodeId, node);
    this.logEvent('NODE_JOIN', 'INFO', 'Node added to network', { nodeId: node.nodeId });
    
    this.emit('node_added', {
      nodeId: node.nodeId,
      type: node.type,
      timestamp: Date.now()
    });
  }

  removeNode(nodeId: string): boolean {
    const node = this.topology.nodes.get(nodeId);
    if (!node) return false;
    
    // Remove all connections
    for (const connectionId of node.connections.keys()) {
      this.topology.connections.delete(connectionId);
    }
    
    // Remove node
    this.topology.nodes.delete(nodeId);
    
    this.logEvent('NODE_LEAVE', 'INFO', 'Node removed from network', { nodeId });
    
    this.emit('node_removed', {
      nodeId,
      timestamp: Date.now()
    });
    
    return true;
  }

  async establishConnection(sourceNodeId: string, targetNodeId: string): Promise<string | null> {
    const sourceNode = this.topology.nodes.get(sourceNodeId);
    const targetNode = this.topology.nodes.get(targetNodeId);
    
    if (!sourceNode || !targetNode) {
      return null;
    }
    
    try {
      // Start quantum key distribution session
      const qkdSessionId = await this.quantumKeyDistribution.startBB84Session('default', 1024);
      const sessionKey = this.quantumKeyDistribution.getSessionKey(qkdSessionId);
      
      if (!sessionKey) {
        throw new Error('Failed to establish quantum key');
      }
      
      const connectionId = `conn_${sourceNodeId}_${targetNodeId}_${Date.now()}`;
      
      const connection: QuantumConnection = {
        connectionId,
        sourceNodeId,
        targetNodeId,
        type: 'QUANTUM_DIRECT',
        status: 'ACTIVE',
        channel: {
          quantumChannelId: qkdSessionId,
          qberRate: 0.02,
          keyRate: 1000,
          distance: 10,
          fidelity: 0.98
        },
        security: {
          sessionKey,
          keyRotationInterval: 3600000, // 1 hour
          lastKeyRotation: Date.now(),
          encryptionAlgorithm: 'KYBER-768'
        },
        qos: {
          latency: 5,
          jitter: 1,
          bandwidth: 1000000,
          reliability: 0.99
        },
        metrics: {
          bytesTransmitted: 0,
          bytesReceived: 0,
          connectTime: Date.now(),
          lastActivity: Date.now()
        }
      };
      
      // Add connection to both nodes
      sourceNode.connections.set(targetNodeId, connection);
      targetNode.connections.set(sourceNodeId, connection);
      this.topology.connections.set(connectionId, connection);
      
      this.logEvent('CONNECTION_ESTABLISHED', 'INFO', 'Quantum connection established', 
        { sourceNodeId, targetNodeId, connectionId });
      
      this.emit('connection_established', {
        connectionId,
        sourceNodeId,
        targetNodeId,
        timestamp: Date.now()
      });
      
      return connectionId;
    } catch (error) {
      this.logEvent('CONNECTION_FAILED', 'ERROR', 'Failed to establish connection', 
        { sourceNodeId, targetNodeId, error: error.message });
      return null;
    }
  }

  getTopology(): QuantumNetworkTopology {
    return this.topology;
  }

  getLocalNodeId(): string {
    return this.localNodeId;
  }

  getLocalCapabilities(): QuantumNode['capabilities'] {
    const localNode = this.topology.nodes.get(this.localNodeId);
    return localNode?.capabilities || {
      qkdSupport: true,
      maxQuantumChannels: 16,
      supportedAlgorithms: ['KYBER-768', 'DILITHIUM-3'],
      hardwareAcceleration: true,
      quantumMemory: false
    };
  }

  getLocalPublicKey(): Uint8Array {
    const publicKey = this.postQuantumCrypto.getKey(this.localNodeId, 'PUBLIC');
    return publicKey?.keyData || new Uint8Array(32);
  }

  getQKD(): QuantumKeyDistribution {
    return this.quantumKeyDistribution;
  }

  findRoute(sourceNodeId: string, targetNodeId: string): QuantumRoute | null {
    return this.routing.findRoute(sourceNodeId, targetNodeId);
  }

  getNetworkStatistics(): any {
    return {
      topology: {
        nodes: this.topology.metrics.totalNodes,
        activeConnections: this.topology.metrics.activeConnections,
        averageQBER: this.topology.metrics.averageQBER,
        totalKeyRate: this.topology.metrics.totalKeyRate,
        networkReliability: this.topology.metrics.networkReliability
      },
      events: this.eventLog.length,
      discoveredNodes: this.discovery.getDiscoveredNodes().size,
      routes: Array.from(this.routing.getAllRoutes().values()).flat().length,
      uptime: Date.now() - (this.topology.nodes.get(this.localNodeId)?.status.lastSeen || Date.now()),
      isInitialized: this.isInitialized,
      timestamp: Date.now()
    };
  }

  getEventLog(limit?: number): QuantumNetworkEvent[] {
    const events = [...this.eventLog].reverse();
    return limit ? events.slice(0, limit) : events;
  }

  private logEvent(
    type: QuantumNetworkEvent['type'],
    severity: QuantumNetworkEvent['severity'],
    message: string,
    data: any = {}
  ): void {
    const event: QuantumNetworkEvent = {
      eventId: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      data,
      timestamp: Date.now(),
      ...data
    };
    
    this.eventLog.push(event);
    
    // Maintain event log size
    if (this.eventLog.length > this.maxEventLogSize) {
      this.eventLog.shift();
    }
    
    this.emit('network_event', event);
  }

  destroy(): void {
    // Stop network protocols
    this.discovery.stopDiscovery();
    this.routing.stopRouting();
    
    // Stop health monitoring
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    // Clear topology
    this.topology.nodes.clear();
    this.topology.connections.clear();
    this.topology.routes.clear();
    this.topology.clusters.clear();
    
    // Clear event log
    this.eventLog = [];
    
    // Destroy quantum components
    this.postQuantumCrypto.destroy();
    this.quantumKeyDistribution.destroy();
    this.quantumAuth.destroy();
    
    this.isInitialized = false;
    console.log('🌐 Quantum mesh network manager destroyed');
  }
}

export type {
  QuantumNode,
  QuantumConnection,
  QuantumService,
  QuantumServiceInstance,
  QuantumNetworkTopology,
  QuantumRoute,
  QuantumCluster,
  QuantumNetworkEvent
};

export default QuantumMeshNetworkManager;
