/**
 * Quantum Service Discovery and Load Balancing System
 * Implementation of quantum-safe service registry, discovery, and load balancing
 */

import { EventEmitter } from 'events';
import { QuantumMeshNetworkManager, QuantumService, QuantumServiceInstance } from './quantumNetworkOrchestration';
import { PostQuantumCryptoEngine } from '../quantum/postQuantumCrypto';

// Enhanced interfaces for quantum service discovery
interface QuantumServiceRegistry {
  services: Map<string, QuantumService>;
  instances: Map<string, QuantumServiceInstance>;
  subscriptions: Map<string, ServiceSubscription>;
  metrics: {
    totalServices: number;
    healthyInstances: number;
    totalRequests: number;
    averageResponseTime: number;
  };
}

interface ServiceSubscription {
  subscriptionId: string;
  servicePattern: string;
  nodeId: string;
  callback: (service: QuantumService) => void;
  quantumSecured: boolean;
  lastNotified: number;
}

interface ServiceDiscoveryRequest {
  requestId: string;
  servicePattern: string;
  requesterNodeId: string;
  securityLevel: number;
  quantumRequired: boolean;
  timeout: number;
  timestamp: number;
}

interface ServiceBinding {
  bindingId: string;
  serviceId: string;
  instanceId: string;
  clientNodeId: string;
  sessionKey: Uint8Array;
  bindingTime: number;
  expiresAt: number;
  quantumSecured: boolean;
}

interface QuantumHealthCheck {
  checkId: string;
  serviceId: string;
  instanceId: string;
  type: 'HTTP' | 'TCP' | 'QUANTUM_CHANNEL' | 'QUANTUM_HANDSHAKE';
  endpoint: string;
  interval: number;
  timeout: number;
  quantumVerification: boolean;
  consecutiveFailures: number;
  maxFailures: number;
  lastCheck: number;
  status: 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN';
}

interface LoadBalancingStrategy {
  name: string;
  algorithm: 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'WEIGHTED_ROUND_ROBIN' |
  'LEAST_RESPONSE_TIME' | 'QUANTUM_OPTIMIZED' | 'ADAPTIVE';
  quantumAware: boolean;
  selector: (instances: QuantumServiceInstance[], metrics: LoadBalancingMetrics) => QuantumServiceInstance | null;
}

interface LoadBalancingMetrics {
  clientId: string;
  serviceId: string;
}

interface LoadBalancingStats {
  totalConnections: number;
  activeAffinities: number;
  instanceDistribution: Array<{
    instanceId: string;
    connections: number;
  }>;
  strategies: string[];
  timestamp: number;
}

interface DiscoveryStatistics {
  registry: {
    totalServices: number;
    healthyInstances: number;
    totalRequests: number;
    averageResponseTime: number;
  };
  loadBalancing: LoadBalancingStats;
  activeBindings: number;
  discoveryRequests: number;
  networkNodes: number;
  isInitialized: boolean;
  timestamp: number;
}

// Quantum Service Registry
class QuantumServiceRegistryManager {
  private registry: QuantumServiceRegistry;
  private healthChecks: Map<string, QuantumHealthCheck> = new Map();
  private healthCheckTimer?: NodeJS.Timeout;
  private healthCheckInterval: number = 10000; // 10 seconds

  constructor(
    private networkManager: QuantumMeshNetworkManager,
    private cryptoEngine: PostQuantumCryptoEngine
  ) {
    this.registry = {
      services: new Map(),
      instances: new Map(),
      subscriptions: new Map(),
      metrics: {
        totalServices: 0,
        healthyInstances: 0,
        totalRequests: 0,
        averageResponseTime: 0
      }
    };

    this.startHealthChecking();
  }

  async registerService(service: Omit<QuantumService, 'serviceId'>): Promise<string> {
    const serviceId = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const quantumService: QuantumService = {
      serviceId,
      ...service,
      health: {
        status: 'UNKNOWN',
        lastCheck: 0,
        responseTime: 0,
        quantumChannelStatus: false
      }
    };

    // Generate quantum-safe service key if quantum authentication required
    if (service.security.quantumAuthentication) {
      const keyPair = await this.cryptoEngine.generateKeyPair('DILITHIUM-3', serviceId);
      quantumService.security.servicePublicKey = keyPair.publicKey.keyData;
    }

    this.registry.services.set(serviceId, quantumService);
    this.registry.metrics.totalServices = this.registry.services.size;

    // Create health check
    const healthCheck: QuantumHealthCheck = {
      checkId: `health_${serviceId}`,
      serviceId,
      instanceId: service.loadBalancing.instances[0]?.instanceId || '',
      type: service.security.quantumAuthentication ? 'QUANTUM_HANDSHAKE' : 'HTTP',
      endpoint: service.endpoint.address,
      interval: 30000, // 30 seconds
      timeout: 5000,
      quantumVerification: service.security.quantumAuthentication,
      consecutiveFailures: 0,
      maxFailures: 3,
      lastCheck: 0,
      status: 'UNKNOWN'
    };

    this.healthChecks.set(serviceId, healthCheck);

    // Notify subscribers
    await this.notifySubscribers(quantumService);

    console.log(`📋 Service registered: ${serviceId} (${service.name})`);
    return serviceId;
  }

  async registerServiceInstance(instance: Omit<QuantumServiceInstance, 'instanceId'>): Promise<string> {
    const instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const quantumInstance: QuantumServiceInstance = {
      instanceId,
      ...instance,
      status: 'STARTING',
      health: {
        healthy: false,
        lastCheck: 0,
        consecutiveFailures: 0
      },
      metrics: {
        requestCount: 0,
        responseTime: 0,
        errorRate: 0,
        quantumOperations: 0
      }
    };

    this.registry.instances.set(instanceId, quantumInstance);

    // Add instance to service
    const service = this.registry.services.get(instance.serviceId);
    if (service) {
      service.loadBalancing.instances.push(quantumInstance);
    }

    // Create instance-specific health check
    const healthCheck: QuantumHealthCheck = {
      checkId: `health_${instanceId}`,
      serviceId: instance.serviceId,
      instanceId,
      type: 'HTTP',
      endpoint: instance.endpoint,
      interval: 15000, // 15 seconds
      timeout: 3000,
      quantumVerification: false,
      consecutiveFailures: 0,
      maxFailures: 3,
      lastCheck: 0,
      status: 'UNKNOWN'
    };

    this.healthChecks.set(instanceId, healthCheck);

    console.log(`🏃 Service instance registered: ${instanceId}`);
    return instanceId;
  }

  async discoverServices(pattern: string, requesterNodeId: string): Promise<QuantumService[]> {
    const matchedServices: QuantumService[] = [];

    for (const [serviceId, service] of this.registry.services.entries()) {
      if (this.matchesPattern(service.name, pattern) ||
        service.metadata.tags.some(tag => this.matchesPattern(tag, pattern))) {

        // Check if requester has access to this service
        if (await this.checkServiceAccess(service, requesterNodeId)) {
          matchedServices.push(service);
        }
      }
    }

    this.registry.metrics.totalRequests++;

    console.log(`🔍 Discovered ${matchedServices.length} services for pattern: ${pattern}`);
    return matchedServices;
  }

  private matchesPattern(text: string, pattern: string): boolean {
    // Simple pattern matching with wildcards
    const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
    return regex.test(text);
  }

  private async checkServiceAccess(service: QuantumService, nodeId: string): Promise<boolean> {
    // Check if node meets service security requirements
    const node = this.networkManager.getTopology().nodes.get(nodeId);
    if (!node) return false;

    // Check quantum capabilities if required
    if (service.security.quantumAuthentication && !node.capabilities.qkdSupport) {
      return false;
    }

    // Check supported algorithms
    if (service.metadata.quantumRequirements.length > 0) {
      const hasRequiredAlgorithms = service.metadata.quantumRequirements.every(req =>
        node.capabilities.supportedAlgorithms.includes(req)
      );
      if (!hasRequiredAlgorithms) return false;
    }

    return true;
  }

  async subscribeToServices(
    pattern: string,
    nodeId: string,
    callback: (service: QuantumService) => void
  ): Promise<string> {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const subscription: ServiceSubscription = {
      subscriptionId,
      servicePattern: pattern,
      nodeId,
      callback,
      quantumSecured: true,
      lastNotified: Date.now()
    };

    this.registry.subscriptions.set(subscriptionId, subscription);

    // Send current matching services
    const matchingServices = await this.discoverServices(pattern, nodeId);
    for (const service of matchingServices) {
      callback(service);
    }

    console.log(`📬 Service subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  private async notifySubscribers(service: QuantumService): Promise<void> {
    for (const [subId, subscription] of this.registry.subscriptions.entries()) {
      if (this.matchesPattern(service.name, subscription.servicePattern) ||
        service.metadata.tags.some(tag => this.matchesPattern(tag, subscription.servicePattern))) {

        try {
          subscription.callback(service);
          subscription.lastNotified = Date.now();
        } catch (error) {
          console.warn(`Failed to notify subscriber ${subId}:`, error);
        }
      }
    }
  }

  private startHealthChecking(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.healthCheckInterval);

    console.log('❤️ Service health checking started');
  }

  private async performHealthChecks(): Promise<void> {
    const currentTime = Date.now();

    for (const [checkId, healthCheck] of this.healthChecks.entries()) {
      if (currentTime - healthCheck.lastCheck >= healthCheck.interval) {
        await this.executeHealthCheck(healthCheck);
      }
    }

    this.updateRegistryMetrics();
  }

  private async executeHealthCheck(healthCheck: QuantumHealthCheck): Promise<void> {
    healthCheck.lastCheck = Date.now();

    try {
      let isHealthy = false;

      switch (healthCheck.type) {
        case 'HTTP':
          isHealthy = await this.performHttpHealthCheck(healthCheck);
          break;
        case 'TCP':
          isHealthy = await this.performTcpHealthCheck(healthCheck);
          break;
        case 'QUANTUM_CHANNEL':
          isHealthy = await this.performQuantumChannelCheck(healthCheck);
          break;
        case 'QUANTUM_HANDSHAKE':
          isHealthy = await this.performQuantumHandshakeCheck(healthCheck);
          break;
      }

      if (isHealthy) {
        healthCheck.status = 'HEALTHY';
        healthCheck.consecutiveFailures = 0;
        this.updateInstanceHealth(healthCheck.instanceId, true);
      } else {
        healthCheck.consecutiveFailures++;
        if (healthCheck.consecutiveFailures >= healthCheck.maxFailures) {
          healthCheck.status = 'UNHEALTHY';
          this.updateInstanceHealth(healthCheck.instanceId, false);
        }
      }
    } catch (error) {
      healthCheck.consecutiveFailures++;
      if (healthCheck.consecutiveFailures >= healthCheck.maxFailures) {
        healthCheck.status = 'UNHEALTHY';
        this.updateInstanceHealth(healthCheck.instanceId, false);
      }
    }
  }

  private async performHttpHealthCheck(healthCheck: QuantumHealthCheck): Promise<boolean> {
    // Simulate HTTP health check
    const success = Math.random() > 0.1; // 90% success rate
    return success;
  }

  private async performTcpHealthCheck(healthCheck: QuantumHealthCheck): Promise<boolean> {
    // Simulate TCP health check
    const success = Math.random() > 0.05; // 95% success rate
    return success;
  }

  private async performQuantumChannelCheck(healthCheck: QuantumHealthCheck): Promise<boolean> {
    // Check quantum channel health
    const service = this.registry.services.get(healthCheck.serviceId);
    if (!service) return false;

    const node = this.networkManager.getTopology().nodes.get(service.endpoint.nodeId);
    if (!node) return false;

    return node.status.quantumReady && node.status.qberRate < 0.11;
  }

  private async performQuantumHandshakeCheck(healthCheck: QuantumHealthCheck): Promise<boolean> {
    // Perform quantum handshake with service
    try {
      const sessionId = await this.networkManager.getQKD().startBB84Session('default', 256);
      const sessionKey = this.networkManager.getQKD().getSessionKey(sessionId);
      return sessionKey !== null;
    } catch (error) {
      return false;
    }
  }

  private updateInstanceHealth(instanceId: string, healthy: boolean): void {
    const instance = this.registry.instances.get(instanceId);
    if (instance) {
      instance.health.healthy = healthy;
      instance.health.lastCheck = Date.now();

      if (!healthy) {
        instance.health.consecutiveFailures++;
        instance.status = 'FAILED';
      } else {
        instance.health.consecutiveFailures = 0;
        instance.status = 'RUNNING';
      }
    }
  }

  private updateRegistryMetrics(): void {
    const healthyInstances = Array.from(this.registry.instances.values())
      .filter(instance => instance.health.healthy).length;

    this.registry.metrics.healthyInstances = healthyInstances;

    // Calculate average response time
    const instances = Array.from(this.registry.instances.values());
    if (instances.length > 0) {
      const totalResponseTime = instances.reduce((sum, instance) => sum + instance.metrics.responseTime, 0);
      this.registry.metrics.averageResponseTime = totalResponseTime / instances.length;
    }
  }

  getRegistry(): QuantumServiceRegistry {
    return this.registry;
  }

  getService(serviceId: string): QuantumService | undefined {
    return this.registry.services.get(serviceId);
  }

  getServiceInstances(serviceId: string): QuantumServiceInstance[] {
    return Array.from(this.registry.instances.values())
      .filter(instance => instance.serviceId === serviceId);
  }

  unregisterService(serviceId: string): boolean {
    const service = this.registry.services.get(serviceId);
    if (!service) return false;

    // Remove all instances
    for (const instance of service.loadBalancing.instances) {
      this.registry.instances.delete(instance.instanceId);
      this.healthChecks.delete(instance.instanceId);
    }

    // Remove service
    this.registry.services.delete(serviceId);
    this.healthChecks.delete(serviceId);

    this.registry.metrics.totalServices = this.registry.services.size;

    console.log(`🗑️ Service unregistered: ${serviceId}`);
    return true;
  }

  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.registry.services.clear();
    this.registry.instances.clear();
    this.registry.subscriptions.clear();
    this.healthChecks.clear();
  }
}

// Quantum Load Balancer
class QuantumLoadBalancer {
  private strategies: Map<string, LoadBalancingStrategy> = new Map();
  private sessionAffinity: Map<string, string> = new Map(); // clientId -> instanceId
  private connectionMetrics: Map<string, number> = new Map(); // instanceId -> connection count

  constructor(
    private registryManager: QuantumServiceRegistryManager,
    private networkManager: QuantumMeshNetworkManager
  ) {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    // Round Robin Strategy
    this.strategies.set('ROUND_ROBIN', {
      name: 'Round Robin',
      algorithm: 'ROUND_ROBIN',
      quantumAware: false,
      selector: (instances: QuantumServiceInstance[]) => {
        const healthyInstances = instances.filter(i => i.health.healthy && i.status === 'RUNNING');
        if (healthyInstances.length === 0) return null;

        // Simple round-robin based on timestamp
        const index = Date.now() % healthyInstances.length;
        return healthyInstances[index];
      }
    });

    // Least Connections Strategy
    this.strategies.set('LEAST_CONNECTIONS', {
      name: 'Least Connections',
      algorithm: 'LEAST_CONNECTIONS',
      quantumAware: false,
      selector: (instances: QuantumServiceInstance[]) => {
        const healthyInstances = instances.filter(i => i.health.healthy && i.status === 'RUNNING');
        if (healthyInstances.length === 0) return null;

        return healthyInstances.reduce((least, current) => {
          const leastConnections = this.connectionMetrics.get(least.instanceId) || 0;
          const currentConnections = this.connectionMetrics.get(current.instanceId) || 0;
          return currentConnections < leastConnections ? current : least;
        });
      }
    });

    // Least Response Time Strategy
    this.strategies.set('LEAST_RESPONSE_TIME', {
      name: 'Least Response Time',
      algorithm: 'LEAST_RESPONSE_TIME',
      quantumAware: false,
      selector: (instances: QuantumServiceInstance[]) => {
        const healthyInstances = instances.filter(i => i.health.healthy && i.status === 'RUNNING');
        if (healthyInstances.length === 0) return null;

        return healthyInstances.reduce((fastest, current) =>
          current.metrics.responseTime < fastest.metrics.responseTime ? current : fastest
        );
      }
    });

    // Quantum Optimized Strategy
    this.strategies.set('QUANTUM_OPTIMIZED', {
      name: 'Quantum Optimized',
      algorithm: 'QUANTUM_OPTIMIZED',
      quantumAware: true,
      selector: (instances: QuantumServiceInstance[], metrics: LoadBalancingMetrics) => {
        const healthyInstances = instances.filter(i => i.health.healthy && i.status === 'RUNNING');
        if (healthyInstances.length === 0) return null;

        // Score instances based on quantum capabilities and performance
        const scoredInstances = healthyInstances.map(instance => {
          const node = this.networkManager.getTopology().nodes.get(instance.nodeId);
          let score = 0;

          // Quantum readiness score
          if (node?.status.quantumReady) score += 50;

          // QBER score (lower is better)
          if (node?.status.qberRate) {
            score += (0.11 - node.status.qberRate) * 100;
          }

          // Response time score (lower is better)
          score += Math.max(0, 100 - instance.metrics.responseTime);

          // Quantum operations score
          score += instance.metrics.quantumOperations * 0.1;

          return { instance, score };
        });

        // Return instance with highest score
        const best = scoredInstances.reduce((best, current) =>
          current.score > best.score ? current : best
        );

        return best.instance;
      }
    });

    console.log(`⚖️ Initialized ${this.strategies.size} load balancing strategies`);
  }

  async selectInstance(
    serviceId: string,
    clientId: string,
    strategy: string = 'QUANTUM_OPTIMIZED'
  ): Promise<QuantumServiceInstance | null> {
    const service = this.registryManager.getService(serviceId);
    if (!service) return null;

    const loadBalancingStrategy = this.strategies.get(strategy);
    if (!loadBalancingStrategy) {
      console.warn(`Unknown load balancing strategy: ${strategy}, using ROUND_ROBIN`);
      return this.selectInstance(serviceId, clientId, 'ROUND_ROBIN');
    }

    // Check for session affinity
    if (this.sessionAffinity.has(clientId)) {
      const affinityInstanceId = this.sessionAffinity.get(clientId)!;
      const affinityInstance = service.loadBalancing.instances
        .find(i => i.instanceId === affinityInstanceId);

      if (affinityInstance && affinityInstance.health.healthy && affinityInstance.status === 'RUNNING') {
        return affinityInstance;
      } else {
        // Remove stale affinity
        this.sessionAffinity.delete(clientId);
      }
    }

    // Select instance using strategy
    const selectedInstance = loadBalancingStrategy.selector(
      service.loadBalancing.instances,
      { clientId, serviceId }
    );

    if (selectedInstance) {
      // Update connection metrics
      const currentConnections = this.connectionMetrics.get(selectedInstance.instanceId) || 0;
      this.connectionMetrics.set(selectedInstance.instanceId, currentConnections + 1);

      // Set session affinity if sticky sessions enabled
      if (service.loadBalancing.algorithm === 'ROUND_ROBIN') {
        this.sessionAffinity.set(clientId, selectedInstance.instanceId);
      }

      console.log(`⚖️ Selected instance ${selectedInstance.instanceId} for service ${serviceId} using ${strategy}`);
    }

    return selectedInstance;
  }

  async bindToService(
    serviceId: string,
    clientNodeId: string,
    requireQuantumSecurity: boolean = true
  ): Promise<ServiceBinding | null> {
    const selectedInstance = await this.selectInstance(serviceId, clientNodeId);
    if (!selectedInstance) return null;

    const bindingId = `binding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate session key if quantum security required
    let sessionKey = new Uint8Array(32);
    let quantumSecured = false;

    if (requireQuantumSecurity) {
      try {
        const qkdSessionId = await this.networkManager.getQKD().startBB84Session('default', 256);
        const qkdKey = this.networkManager.getQKD().getSessionKey(qkdSessionId);

        if (qkdKey) {
          sessionKey = new Uint8Array(qkdKey);
          quantumSecured = true;
        }
      } catch (error) {
        console.warn('Failed to establish quantum session key, using classical fallback');
      }
    }

    const binding: ServiceBinding = {
      bindingId,
      serviceId,
      instanceId: selectedInstance.instanceId,
      clientNodeId,
      sessionKey,
      bindingTime: Date.now(),
      expiresAt: Date.now() + (3600 * 1000), // 1 hour
      quantumSecured
    };

    console.log(`🔗 Service binding created: ${bindingId} (quantum: ${quantumSecured})`);
    return binding;
  }

  releaseConnection(instanceId: string): void {
    const currentConnections = this.connectionMetrics.get(instanceId) || 0;
    if (currentConnections > 0) {
      this.connectionMetrics.set(instanceId, currentConnections - 1);
    }
  }

  getLoadBalancingStats(): LoadBalancingStats {
    const totalConnections = Array.from(this.connectionMetrics.values())
      .reduce((sum, connections) => sum + connections, 0);

    const instanceDistribution = Array.from(this.connectionMetrics.entries())
      .map(([instanceId, connections]) => ({ instanceId, connections }))
      .sort((a, b) => b.connections - a.connections);

    return {
      totalConnections,
      activeAffinities: this.sessionAffinity.size,
      instanceDistribution,
      strategies: Array.from(this.strategies.keys()),
      timestamp: Date.now()
    };
  }

  clearSessionAffinity(clientId: string): void {
    this.sessionAffinity.delete(clientId);
  }

  clearAllAffinities(): void {
    this.sessionAffinity.clear();
  }
}

// Main Quantum Service Discovery Engine
export class QuantumServiceDiscoveryEngine extends EventEmitter {
  private registryManager: QuantumServiceRegistryManager;
  private loadBalancer: QuantumLoadBalancer;
  private serviceBindings: Map<string, ServiceBinding> = new Map();
  private discoveryRequests: Map<string, ServiceDiscoveryRequest> = new Map();

  private isInitialized: boolean = false;

  constructor(
    private networkManager: QuantumMeshNetworkManager,
    private cryptoEngine: PostQuantumCryptoEngine
  ) {
    super();

    this.registryManager = new QuantumServiceRegistryManager(networkManager, cryptoEngine);
    this.loadBalancer = new QuantumLoadBalancer(this.registryManager, networkManager);

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Register default quantum services
      await this.registerDefaultServices();

      this.isInitialized = true;

      this.emit('initialized', {
        services: this.registryManager.getRegistry().services.size,
        timestamp: Date.now()
      });

      console.log('🔍 Quantum Service Discovery Engine initialized');
    } catch (error) {
      console.error('❌ Failed to initialize service discovery engine:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  private async registerDefaultServices(): Promise<void> {
    // Register Quantum Key Distribution Service
    await this.registerService({
      name: 'quantum-key-distribution',
      type: 'QUANTUM_SERVICE',
      endpoint: {
        nodeId: this.networkManager.getLocalNodeId(),
        address: '127.0.0.1:9080',
        port: 9080,
        quantumSecured: true
      },
      metadata: {
        version: '1.0.0',
        description: 'Quantum Key Distribution Service',
        tags: ['quantum', 'security', 'key-distribution'],
        quantumRequirements: ['KYBER-768', 'BB84']
      },
      health: {
        status: 'HEALTHY',
        lastCheck: Date.now(),
        responseTime: 10,
        quantumChannelStatus: true
      },
      security: {
        requiredAuthLevel: 3,
        quantumAuthentication: true,
        postQuantumEncryption: true
      },
      loadBalancing: {
        instances: [],
        algorithm: 'QUANTUM_OPTIMIZED',
        weights: new Map()
      }
    });

    // Register Quantum Authentication Service
    await this.registerService({
      name: 'quantum-authentication',
      type: 'QUANTUM_SERVICE',
      endpoint: {
        nodeId: this.networkManager.getLocalNodeId(),
        address: '127.0.0.1:9081',
        port: 9081,
        quantumSecured: true
      },
      metadata: {
        version: '1.0.0',
        description: 'Quantum-Resistant Authentication Service',
        tags: ['quantum', 'authentication', 'biometric'],
        quantumRequirements: ['DILITHIUM-3', 'LATTICE-ZK']
      },
      health: {
        status: 'HEALTHY',
        lastCheck: Date.now(),
        responseTime: 15,
        quantumChannelStatus: true
      },
      security: {
        requiredAuthLevel: 4,
        quantumAuthentication: true,
        postQuantumEncryption: true
      },
      loadBalancing: {
        instances: [],
        algorithm: 'QUANTUM_OPTIMIZED',
        weights: new Map()
      }
    });
  }

  // Public API methods
  async registerService(service: Omit<QuantumService, 'serviceId'>): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Service discovery engine not initialized');
    }

    const serviceId = await this.registryManager.registerService(service);

    this.emit('service_registered', {
      serviceId,
      name: service.name,
      type: service.type,
      timestamp: Date.now()
    });

    return serviceId;
  }

  async registerServiceInstance(instance: Omit<QuantumServiceInstance, 'instanceId'>): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Service discovery engine not initialized');
    }

    const instanceId = await this.registryManager.registerServiceInstance(instance);

    this.emit('instance_registered', {
      instanceId,
      serviceId: instance.serviceId,
      nodeId: instance.nodeId,
      timestamp: Date.now()
    });

    return instanceId;
  }

  async discoverServices(pattern: string, requesterNodeId?: string): Promise<QuantumService[]> {
    if (!this.isInitialized) {
      throw new Error('Service discovery engine not initialized');
    }

    const requesterId = requesterNodeId || this.networkManager.getLocalNodeId();
    const services = await this.registryManager.discoverServices(pattern, requesterId);

    this.emit('services_discovered', {
      pattern,
      count: services.length,
      requesterNodeId: requesterId,
      timestamp: Date.now()
    });

    return services;
  }

  async bindToService(
    serviceName: string,
    clientNodeId?: string,
    requireQuantumSecurity: boolean = true
  ): Promise<ServiceBinding | null> {
    if (!this.isInitialized) {
      throw new Error('Service discovery engine not initialized');
    }

    // Find service by name
    const services = await this.discoverServices(serviceName, clientNodeId);
    if (services.length === 0) return null;

    const service = services[0]; // Use first matching service
    const requesterId = clientNodeId || this.networkManager.getLocalNodeId();

    const binding = await this.loadBalancer.bindToService(
      service.serviceId,
      requesterId,
      requireQuantumSecurity
    );

    if (binding) {
      this.serviceBindings.set(binding.bindingId, binding);

      this.emit('service_bound', {
        bindingId: binding.bindingId,
        serviceId: binding.serviceId,
        instanceId: binding.instanceId,
        quantumSecured: binding.quantumSecured,
        timestamp: Date.now()
      });
    }

    return binding;
  }

  async subscribeToServices(
    pattern: string,
    callback: (service: QuantumService) => void,
    nodeId?: string
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Service discovery engine not initialized');
    }

    const requesterId = nodeId || this.networkManager.getLocalNodeId();
    const subscriptionId = await this.registryManager.subscribeToServices(pattern, requesterId, callback);

    this.emit('subscription_created', {
      subscriptionId,
      pattern,
      nodeId: requesterId,
      timestamp: Date.now()
    });

    return subscriptionId;
  }

  getService(serviceId: string): QuantumService | undefined {
    return this.registryManager.getService(serviceId);
  }

  getServiceByName(serviceName: string): QuantumService | undefined {
    const services = Array.from(this.registryManager.getRegistry().services.values());
    return services.find(service => service.name === serviceName);
  }

  getServiceInstances(serviceId: string): QuantumServiceInstance[] {
    return this.registryManager.getServiceInstances(serviceId);
  }

  getServiceBinding(bindingId: string): ServiceBinding | undefined {
    return this.serviceBindings.get(bindingId);
  }

  releaseServiceBinding(bindingId: string): boolean {
    const binding = this.serviceBindings.get(bindingId);
    if (!binding) return false;

    this.loadBalancer.releaseConnection(binding.instanceId);
    this.serviceBindings.delete(bindingId);

    this.emit('binding_released', {
      bindingId,
      serviceId: binding.serviceId,
      instanceId: binding.instanceId,
      timestamp: Date.now()
    });

    return true;
  }

  unregisterService(serviceId: string): boolean {
    const success = this.registryManager.unregisterService(serviceId);

    if (success) {
      // Remove related bindings
      for (const [bindingId, binding] of this.serviceBindings.entries()) {
        if (binding.serviceId === serviceId) {
          this.serviceBindings.delete(bindingId);
        }
      }

      this.emit('service_unregistered', {
        serviceId,
        timestamp: Date.now()
      });
    }

    return success;
  }

  getDiscoveryStatistics(): DiscoveryStatistics {
    const registry = this.registryManager.getRegistry();
    const loadBalancingStats = this.loadBalancer.getLoadBalancingStats();

    return {
      registry: registry.metrics,
      loadBalancing: loadBalancingStats,
      activeBindings: this.serviceBindings.size,
      discoveryRequests: this.discoveryRequests.size,
      networkNodes: this.networkManager.getTopology().nodes.size,
      isInitialized: this.isInitialized,
      timestamp: Date.now()
    };
  }

  destroy(): void {
    this.registryManager.destroy();
    this.serviceBindings.clear();
    this.discoveryRequests.clear();
    this.isInitialized = false;
    console.log('🔍 Quantum Service Discovery Engine destroyed');
  }
}

export type {
  QuantumServiceRegistry,
  ServiceSubscription,
  ServiceDiscoveryRequest,
  ServiceBinding,
  LoadBalancingStrategy,
  QuantumHealthCheck
};

export default QuantumServiceDiscoveryEngine;
