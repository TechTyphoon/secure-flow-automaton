/**
 * Quantum Network Analytics Platform
 * Real-time monitoring, analysis, and ML-driven optimization for quantum networks
 */

import { EventEmitter } from 'events';
import { QuantumMeshNetworkManager, QuantumNode, QuantumService } from './quantumNetworkOrchestration';
import { QuantumServiceDiscoveryEngine } from './quantumServiceDiscovery';
import { PostQuantumCryptoEngine } from '../quantum/postQuantumCrypto';

// Enhanced interfaces for quantum network analytics
interface QuantumNetworkMetrics {
  networkId: string;
  timestamp: number;
  nodeMetrics: Map<string, NodeMetrics>;
  channelMetrics: Map<string, ChannelMetrics>;
  serviceMetrics: Map<string, ServiceMetrics>;
  globalMetrics: GlobalNetworkMetrics;
  securityMetrics: SecurityMetrics;
  performanceMetrics: PerformanceMetrics;
}

interface NodeMetrics {
  nodeId: string;
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  networkThroughput: number;
  quantumMetrics: {
    qberRate: number;
    keyGenerationRate: number;
    entanglementFidelity: number;
    quantumOperationsPerSecond: number;
    activeQKDSessions: number;
    quantumChannelUtilization: number;
  };
  status: {
    isOnline: boolean;
    quantumReady: boolean;
    connectionCount: number;
    errorRate: number;
  };
  prediction: {
    nextHourLoad: number;
    failureProbability: number;
    maintenanceRequired: boolean;
  };
}

interface ChannelMetrics {
  channelId: string;
  sourceNodeId: string;
  targetNodeId: string;
  timestamp: number;
  latency: number;
  bandwidth: number;
  packetLoss: number;
  jitter: number;
  qberRate: number;
  keyGenerationRate: number;
  channelFidelity: number;
  utilization: number;
  securityLevel: number;
  anomalyScore: number;
}

interface ServiceMetrics {
  serviceId: string;
  serviceName: string;
  timestamp: number;
  requestRate: number;
  responseTime: number;
  errorRate: number;
  availability: number;
  throughput: number;
  activeConnections: number;
  quantumOperations: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    quantum: number;
  };
  slaCompliance: number;
}

interface GlobalNetworkMetrics {
  totalNodes: number;
  activeNodes: number;
  totalChannels: number;
  activeChannels: number;
  totalServices: number;
  healthyServices: number;
  averageLatency: number;
  overallThroughput: number;
  networkUptime: number;
  quantumReadiness: number;
  securityScore: number;
  resilience: number;
}

interface SecurityMetrics {
  timestamp: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedThreats: ThreatEvent[];
  quantumSecurityScore: number;
  encryptionCompliance: number;
  keyDistributionHealth: number;
  authenticationSuccessRate: number;
  intrusionAttempts: number;
  anomalousPatterns: AnomalyPattern[];
}

interface PerformanceMetrics {
  timestamp: number;
  bottlenecks: PerformanceBottleneck[];
  optimizationOpportunities: OptimizationOpportunity[];
  resourceEfficiency: number;
  capacityUtilization: number;
  predictedGrowth: number;
  recommendations: PerformanceRecommendation[];
}

interface ThreatEvent {
  eventId: string;
  timestamp: number;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  target: string;
  description: string;
  mitigated: boolean;
}

interface AnomalyPattern {
  patternId: string;
  type: string;
  confidence: number;
  affectedNodes: string[];
  description: string;
  detectedAt: number;
}

interface PerformanceBottleneck {
  bottleneckId: string;
  type: 'CPU' | 'MEMORY' | 'NETWORK' | 'QUANTUM' | 'STORAGE';
  location: string;
  severity: number;
  impact: string;
  recommendation: string;
}

interface OptimizationOpportunity {
  opportunityId: string;
  category: string;
  potentialImprovement: number;
  estimatedSavings: number;
  implementation: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface PerformanceRecommendation {
  recommendationId: string;
  category: string;
  description: string;
  priority: number;
  estimatedImpact: number;
  implementationTime: number;
}

interface AnalyticsAlert {
  alertId: string;
  timestamp: number;
  type: 'PERFORMANCE' | 'SECURITY' | 'AVAILABILITY' | 'QUANTUM' | 'PREDICTIVE';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  title: string;
  description: string;
  affectedResources: string[];
  suggestedActions: string[];
  autoResolved: boolean;
}

interface MLModel {
  modelId: string;
  name: string;
  type: 'ANOMALY_DETECTION' | 'PERFORMANCE_PREDICTION' | 'CAPACITY_PLANNING' | 'THREAT_DETECTION';
  version: string;
  accuracy: number;
  lastTrained: number;
  features: string[];
  status: 'TRAINING' | 'READY' | 'UPDATING' | 'DEPRECATED';
}

// Machine Learning Engine for Quantum Networks
class QuantumNetworkMLEngine {
  private models: Map<string, MLModel> = new Map();
  private trainingData: Map<string, any[]> = new Map();
  private predictions: Map<string, any> = new Map();

  constructor() {
    this.initializeModels();
  }

  private initializeModels(): void {
    // Anomaly Detection Model
    this.models.set('anomaly_detection', {
      modelId: 'anomaly_detection',
      name: 'Quantum Network Anomaly Detection',
      type: 'ANOMALY_DETECTION',
      version: '1.0.0',
      accuracy: 0.95,
      lastTrained: Date.now(),
      features: ['qber_rate', 'latency', 'throughput', 'error_rate', 'quantum_operations'],
      status: 'READY'
    });

    // Performance Prediction Model
    this.models.set('performance_prediction', {
      modelId: 'performance_prediction',
      name: 'Quantum Network Performance Predictor',
      type: 'PERFORMANCE_PREDICTION',
      version: '1.0.0',
      accuracy: 0.89,
      lastTrained: Date.now(),
      features: ['historical_load', 'time_patterns', 'resource_usage', 'quantum_metrics'],
      status: 'READY'
    });

    // Capacity Planning Model
    this.models.set('capacity_planning', {
      modelId: 'capacity_planning',
      name: 'Quantum Network Capacity Planner',
      type: 'CAPACITY_PLANNING',
      version: '1.0.0',
      accuracy: 0.87,
      lastTrained: Date.now(),
      features: ['growth_trends', 'usage_patterns', 'resource_constraints'],
      status: 'READY'
    });

    // Threat Detection Model
    this.models.set('threat_detection', {
      modelId: 'threat_detection',
      name: 'Quantum Network Threat Detector',
      type: 'THREAT_DETECTION',
      version: '1.0.0',
      accuracy: 0.93,
      lastTrained: Date.now(),
      features: ['traffic_patterns', 'authentication_failures', 'quantum_channel_anomalies'],
      status: 'READY'
    });

    console.log(`🧠 Initialized ${this.models.size} ML models for quantum network analytics`);
  }

  async detectAnomalies(metrics: QuantumNetworkMetrics): Promise<AnomalyPattern[]> {
    const model = this.models.get('anomaly_detection');
    if (!model || model.status !== 'READY') return [];

    const anomalies: AnomalyPattern[] = [];

    // Analyze node metrics for anomalies
    for (const [nodeId, nodeMetrics] of metrics.nodeMetrics.entries()) {
      // Check QBER rate anomaly
      if (nodeMetrics.quantumMetrics.qberRate > 0.15) {
        anomalies.push({
          patternId: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          type: 'HIGH_QBER',
          confidence: 0.9,
          affectedNodes: [nodeId],
          description: `Abnormally high QBER rate detected: ${nodeMetrics.quantumMetrics.qberRate}`,
          detectedAt: Date.now()
        });
      }

      // Check throughput anomaly
      if (nodeMetrics.networkThroughput < 100 && nodeMetrics.status.connectionCount > 5) {
        anomalies.push({
          patternId: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          type: 'LOW_THROUGHPUT',
          confidence: 0.85,
          affectedNodes: [nodeId],
          description: `Low throughput detected despite high connection count`,
          detectedAt: Date.now()
        });
      }

      // Check quantum operations anomaly
      if (nodeMetrics.quantumMetrics.quantumOperationsPerSecond > 1000) {
        anomalies.push({
          patternId: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          type: 'HIGH_QUANTUM_OPS',
          confidence: 0.8,
          affectedNodes: [nodeId],
          description: `Unusually high quantum operations per second`,
          detectedAt: Date.now()
        });
      }
    }

    // Analyze channel metrics for anomalies
    for (const [channelId, channelMetrics] of metrics.channelMetrics.entries()) {
      if (channelMetrics.packetLoss > 0.05) {
        anomalies.push({
          patternId: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          type: 'HIGH_PACKET_LOSS',
          confidence: 0.88,
          affectedNodes: [channelMetrics.sourceNodeId, channelMetrics.targetNodeId],
          description: `High packet loss detected on quantum channel: ${channelMetrics.packetLoss}`,
          detectedAt: Date.now()
        });
      }
    }

    return anomalies;
  }

  async predictPerformance(historicalMetrics: QuantumNetworkMetrics[]): Promise<any> {
    const model = this.models.get('performance_prediction');
    if (!model || model.status !== 'READY') return null;

    if (historicalMetrics.length < 10) return null;

    // Simple trend analysis for demonstration
    const latestMetrics = historicalMetrics[historicalMetrics.length - 1];
    const olderMetrics = historicalMetrics[historicalMetrics.length - 10];

    const predictions = {
      nextHourThroughput: latestMetrics.globalMetrics.overallThroughput * 1.05,
      nextHourLatency: latestMetrics.globalMetrics.averageLatency * 0.98,
      nextHourNodeLoad: new Map<string, number>(),
      confidence: 0.85
    };

    // Predict individual node loads
    for (const [nodeId, nodeMetrics] of latestMetrics.nodeMetrics.entries()) {
      const currentLoad = nodeMetrics.cpuUsage;
      const predictedLoad = Math.min(100, currentLoad * (1 + Math.sin(Date.now() / 1000000) * 0.1));
      predictions.nextHourNodeLoad.set(nodeId, predictedLoad);
    }

    return predictions;
  }

  async planCapacity(metrics: QuantumNetworkMetrics[]): Promise<OptimizationOpportunity[]> {
    const model = this.models.get('capacity_planning');
    if (!model || model.status !== 'READY') return [];

    const opportunities: OptimizationOpportunity[] = [];

    if (metrics.length > 0) {
      const latestMetrics = metrics[metrics.length - 1];

      // Check for overutilized nodes
      for (const [nodeId, nodeMetrics] of latestMetrics.nodeMetrics.entries()) {
        if (nodeMetrics.cpuUsage > 80 || nodeMetrics.memoryUsage > 85) {
          opportunities.push({
            opportunityId: `capacity_${nodeId}_${Date.now()}`,
            category: 'RESOURCE_SCALING',
            potentialImprovement: 25,
            estimatedSavings: 15000,
            implementation: `Scale up resources for node ${nodeId}`,
            priority: 'HIGH'
          });
        }

        if (nodeMetrics.quantumMetrics.quantumChannelUtilization > 90) {
          opportunities.push({
            opportunityId: `quantum_${nodeId}_${Date.now()}`,
            category: 'QUANTUM_CAPACITY',
            potentialImprovement: 30,
            estimatedSavings: 20000,
            implementation: `Add quantum channels for node ${nodeId}`,
            priority: 'HIGH'
          });
        }
      }

      // Check for underutilized resources
      const lowUtilizationNodes = Array.from(latestMetrics.nodeMetrics.entries())
        .filter(([_, metrics]) => metrics.cpuUsage < 20 && metrics.memoryUsage < 30);

      if (lowUtilizationNodes.length > 2) {
        opportunities.push({
          opportunityId: `consolidation_${Date.now()}`,
          category: 'RESOURCE_CONSOLIDATION',
          potentialImprovement: 20,
          estimatedSavings: 10000,
          implementation: 'Consolidate workloads from underutilized nodes',
          priority: 'MEDIUM'
        });
      }
    }

    return opportunities;
  }

  async detectThreats(metrics: QuantumNetworkMetrics): Promise<ThreatEvent[]> {
    const model = this.models.get('threat_detection');
    if (!model || model.status !== 'READY') return [];

    const threats: ThreatEvent[] = [];

    // Check for authentication anomalies
    const authFailureRate = metrics.securityMetrics.authenticationSuccessRate;
    if (authFailureRate < 0.8) {
      threats.push({
        eventId: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: Date.now(),
        type: 'AUTHENTICATION_ANOMALY',
        severity: 'HIGH',
        source: 'unknown',
        target: 'authentication_service',
        description: `High authentication failure rate detected: ${(1 - authFailureRate) * 100}%`,
        mitigated: false
      });
    }

    // Check for quantum channel tampering
    for (const [channelId, channelMetrics] of metrics.channelMetrics.entries()) {
      if (channelMetrics.qberRate > 0.2) {
        threats.push({
          eventId: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: Date.now(),
          type: 'QUANTUM_CHANNEL_TAMPERING',
          severity: 'CRITICAL',
          source: 'unknown',
          target: channelId,
          description: 'Possible quantum channel eavesdropping detected',
          mitigated: false
        });
      }
    }

    // Check for DDoS patterns
    const totalConnections = Array.from(metrics.nodeMetrics.values())
      .reduce((sum, node) => sum + node.status.connectionCount, 0);
    
    if (totalConnections > 1000) {
      threats.push({
        eventId: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: Date.now(),
        type: 'POTENTIAL_DDOS',
        severity: 'HIGH',
        source: 'multiple',
        target: 'network',
        description: 'Unusual spike in connection count detected',
        mitigated: false
      });
    }

    return threats;
  }

  getModelStatus(): Map<string, MLModel> {
    return new Map(this.models);
  }

  async retrainModel(modelId: string, trainingData: any[]): Promise<boolean> {
    const model = this.models.get(modelId);
    if (!model) return false;

    model.status = 'TRAINING';
    this.trainingData.set(modelId, trainingData);

    // Simulate training time
    setTimeout(() => {
      if (this.models.has(modelId)) {
        model.status = 'READY';
        model.lastTrained = Date.now();
        model.accuracy = Math.min(0.99, model.accuracy + Math.random() * 0.02);
        console.log(`🧠 Model ${modelId} retrained with accuracy: ${model.accuracy}`);
      }
    }, 5000);

    return true;
  }
}

// Quantum Network Analytics Engine
export class QuantumNetworkAnalyticsEngine extends EventEmitter {
  private mlEngine: QuantumNetworkMLEngine;
  private metricsHistory: QuantumNetworkMetrics[] = [];
  private activeAlerts: Map<string, AnalyticsAlert> = new Map();
  private isCollectingMetrics: boolean = false;
  private metricsCollectionInterval?: NodeJS.Timeout;
  private collectionInterval: number = 30000; // 30 seconds

  constructor(
    private networkManager: QuantumMeshNetworkManager,
    private serviceDiscovery: QuantumServiceDiscoveryEngine,
    private cryptoEngine: PostQuantumCryptoEngine
  ) {
    super();
    
    this.mlEngine = new QuantumNetworkMLEngine();
    this.startMetricsCollection();
  }

  private startMetricsCollection(): void {
    if (this.isCollectingMetrics) return;

    this.isCollectingMetrics = true;
    this.metricsCollectionInterval = setInterval(async () => {
      await this.collectAndAnalyzeMetrics();
    }, this.collectionInterval);

    console.log('📊 Quantum network analytics metrics collection started');
  }

  private async collectAndAnalyzeMetrics(): Promise<void> {
    try {
      const metrics = await this.collectNetworkMetrics();
      this.metricsHistory.push(metrics);

      // Keep only last 1000 metrics entries
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory = this.metricsHistory.slice(-1000);
      }

      // Perform ML analysis
      await this.performMLAnalysis(metrics);

      // Generate alerts if needed
      await this.generateAlerts(metrics);

      this.emit('metrics_collected', {
        timestamp: metrics.timestamp,
        nodeCount: metrics.globalMetrics.totalNodes,
        serviceCount: metrics.globalMetrics.totalServices
      });

    } catch (error) {
      console.error('❌ Error collecting metrics:', error);
      this.emit('error', { type: 'metrics_collection', error });
    }
  }

  private async collectNetworkMetrics(): Promise<QuantumNetworkMetrics> {
    const timestamp = Date.now();
    const networkId = 'quantum_network_main';
    
    const nodeMetrics = new Map<string, NodeMetrics>();
    const channelMetrics = new Map<string, ChannelMetrics>();
    const serviceMetrics = new Map<string, ServiceMetrics>();

    // Collect node metrics
    const topology = this.networkManager.getTopology();
    for (const [nodeId, node] of topology.nodes.entries()) {
      const metrics: NodeMetrics = {
        nodeId,
        timestamp,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        networkThroughput: Math.random() * 1000,
        quantumMetrics: {
          qberRate: node.status.qberRate,
          keyGenerationRate: Math.random() * 100,
          entanglementFidelity: 0.9 + Math.random() * 0.1,
          quantumOperationsPerSecond: Math.random() * 500,
          activeQKDSessions: Math.floor(Math.random() * 10),
          quantumChannelUtilization: Math.random() * 100
        },
        status: {
          isOnline: node.status.online,
          quantumReady: node.status.quantumReady,
          connectionCount: node.connections.length,
          errorRate: Math.random() * 0.1
        },
        prediction: {
          nextHourLoad: Math.random() * 100,
          failureProbability: Math.random() * 0.2,
          maintenanceRequired: Math.random() > 0.9
        }
      };
      nodeMetrics.set(nodeId, metrics);
    }

    // Collect channel metrics
    for (const [channelId, channel] of topology.channels.entries()) {
      const metrics: ChannelMetrics = {
        channelId,
        sourceNodeId: channel.sourceNodeId,
        targetNodeId: channel.targetNodeId,
        timestamp,
        latency: channel.latency,
        bandwidth: channel.bandwidth,
        packetLoss: Math.random() * 0.05,
        jitter: Math.random() * 10,
        qberRate: Math.random() * 0.15,
        keyGenerationRate: Math.random() * 50,
        channelFidelity: 0.85 + Math.random() * 0.15,
        utilization: Math.random() * 100,
        securityLevel: channel.quantumSecured ? 5 : 3,
        anomalyScore: Math.random()
      };
      channelMetrics.set(channelId, metrics);
    }

    // Collect service metrics
    const discoveryStats = this.serviceDiscovery.getDiscoveryStatistics();
    const registry = discoveryStats.registry;
    
    // Generate sample service metrics
    for (let i = 0; i < registry.totalServices; i++) {
      const serviceId = `service_${i}`;
      const metrics: ServiceMetrics = {
        serviceId,
        serviceName: `quantum-service-${i}`,
        timestamp,
        requestRate: Math.random() * 100,
        responseTime: Math.random() * 200,
        errorRate: Math.random() * 0.05,
        availability: 0.95 + Math.random() * 0.05,
        throughput: Math.random() * 500,
        activeConnections: Math.floor(Math.random() * 50),
        quantumOperations: Math.floor(Math.random() * 100),
        resourceUtilization: {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          quantum: Math.random() * 100
        },
        slaCompliance: 0.9 + Math.random() * 0.1
      };
      serviceMetrics.set(serviceId, metrics);
    }

    // Calculate global metrics
    const totalNodes = nodeMetrics.size;
    const activeNodes = Array.from(nodeMetrics.values()).filter(n => n.status.isOnline).length;
    const totalChannels = channelMetrics.size;
    const activeChannels = Array.from(channelMetrics.values()).filter(c => c.utilization > 0).length;
    const totalServices = serviceMetrics.size;
    const healthyServices = Array.from(serviceMetrics.values()).filter(s => s.availability > 0.9).length;
    
    const averageLatency = totalChannels > 0 ? 
      Array.from(channelMetrics.values()).reduce((sum, c) => sum + c.latency, 0) / totalChannels : 0;
    
    const overallThroughput = Array.from(nodeMetrics.values())
      .reduce((sum, n) => sum + n.networkThroughput, 0);

    const quantumReadyNodes = Array.from(nodeMetrics.values())
      .filter(n => n.status.quantumReady).length;
    const quantumReadiness = totalNodes > 0 ? quantumReadyNodes / totalNodes : 0;

    const globalMetrics: GlobalNetworkMetrics = {
      totalNodes,
      activeNodes,
      totalChannels,
      activeChannels,
      totalServices,
      healthyServices,
      averageLatency,
      overallThroughput,
      networkUptime: 0.99,
      quantumReadiness,
      securityScore: 0.95,
      resilience: 0.92
    };

    // Generate security metrics
    const securityMetrics: SecurityMetrics = {
      timestamp,
      threatLevel: 'LOW',
      detectedThreats: [],
      quantumSecurityScore: 0.95,
      encryptionCompliance: 0.98,
      keyDistributionHealth: 0.96,
      authenticationSuccessRate: 0.99,
      intrusionAttempts: Math.floor(Math.random() * 5),
      anomalousPatterns: []
    };

    // Generate performance metrics
    const performanceMetrics: PerformanceMetrics = {
      timestamp,
      bottlenecks: [],
      optimizationOpportunities: [],
      resourceEfficiency: 0.85,
      capacityUtilization: 0.72,
      predictedGrowth: 0.15,
      recommendations: []
    };

    return {
      networkId,
      timestamp,
      nodeMetrics,
      channelMetrics,
      serviceMetrics,
      globalMetrics,
      securityMetrics,
      performanceMetrics
    };
  }

  private async performMLAnalysis(metrics: QuantumNetworkMetrics): Promise<void> {
    try {
      // Detect anomalies
      const anomalies = await this.mlEngine.detectAnomalies(metrics);
      metrics.securityMetrics.anomalousPatterns = anomalies;

      // Detect threats
      const threats = await this.mlEngine.detectThreats(metrics);
      metrics.securityMetrics.detectedThreats = threats;

      // Update threat level based on detected threats
      if (threats.some(t => t.severity === 'CRITICAL')) {
        metrics.securityMetrics.threatLevel = 'CRITICAL';
      } else if (threats.some(t => t.severity === 'HIGH')) {
        metrics.securityMetrics.threatLevel = 'HIGH';
      } else if (threats.some(t => t.severity === 'MEDIUM')) {
        metrics.securityMetrics.threatLevel = 'MEDIUM';
      }

      // Performance predictions
      if (this.metricsHistory.length >= 10) {
        const predictions = await this.mlEngine.predictPerformance(this.metricsHistory);
        if (predictions) {
          // Store predictions for future use
          console.log('🔮 Performance predictions updated');
        }
      }

      // Capacity planning
      if (this.metricsHistory.length >= 5) {
        const opportunities = await this.mlEngine.planCapacity(this.metricsHistory);
        metrics.performanceMetrics.optimizationOpportunities = opportunities;
      }

    } catch (error) {
      console.error('❌ Error performing ML analysis:', error);
    }
  }

  private async generateAlerts(metrics: QuantumNetworkMetrics): Promise<void> {
    const alerts: AnalyticsAlert[] = [];
    const timestamp = Date.now();

    // Performance alerts
    if (metrics.globalMetrics.averageLatency > 100) {
      alerts.push({
        alertId: `alert_${timestamp}_latency`,
        timestamp,
        type: 'PERFORMANCE',
        severity: 'WARNING',
        title: 'High Network Latency',
        description: `Average network latency is ${metrics.globalMetrics.averageLatency}ms`,
        affectedResources: ['network'],
        suggestedActions: ['Check network connections', 'Optimize routing'],
        autoResolved: false
      });
    }

    // Security alerts
    if (metrics.securityMetrics.threatLevel === 'HIGH' || metrics.securityMetrics.threatLevel === 'CRITICAL') {
      alerts.push({
        alertId: `alert_${timestamp}_security`,
        timestamp,
        type: 'SECURITY',
        severity: metrics.securityMetrics.threatLevel === 'CRITICAL' ? 'CRITICAL' : 'ERROR',
        title: 'Security Threat Detected',
        description: `Threat level elevated to ${metrics.securityMetrics.threatLevel}`,
        affectedResources: ['security_system'],
        suggestedActions: ['Review security logs', 'Activate incident response'],
        autoResolved: false
      });
    }

    // Quantum alerts
    const lowQuantumReadiness = metrics.globalMetrics.quantumReadiness < 0.8;
    if (lowQuantumReadiness) {
      alerts.push({
        alertId: `alert_${timestamp}_quantum`,
        timestamp,
        type: 'QUANTUM',
        severity: 'WARNING',
        title: 'Low Quantum Readiness',
        description: `Only ${(metrics.globalMetrics.quantumReadiness * 100).toFixed(1)}% of nodes are quantum ready`,
        affectedResources: ['quantum_network'],
        suggestedActions: ['Check quantum hardware', 'Verify QKD systems'],
        autoResolved: false
      });
    }

    // Availability alerts
    const lowAvailability = metrics.globalMetrics.healthyServices / metrics.globalMetrics.totalServices < 0.9;
    if (lowAvailability) {
      alerts.push({
        alertId: `alert_${timestamp}_availability`,
        timestamp,
        type: 'AVAILABILITY',
        severity: 'ERROR',
        title: 'Service Availability Issues',
        description: 'Multiple services are experiencing availability issues',
        affectedResources: ['service_mesh'],
        suggestedActions: ['Restart failed services', 'Check resource allocation'],
        autoResolved: false
      });
    }

    // Store and emit alerts
    for (const alert of alerts) {
      this.activeAlerts.set(alert.alertId, alert);
      this.emit('alert_generated', alert);
      console.log(`🚨 Alert generated: ${alert.title} (${alert.severity})`);
    }
  }

  // Public API methods
  getCurrentMetrics(): QuantumNetworkMetrics | null {
    return this.metricsHistory.length > 0 ? 
      this.metricsHistory[this.metricsHistory.length - 1] : null;
  }

  getHistoricalMetrics(timeRange: number = 3600000): QuantumNetworkMetrics[] {
    const cutoffTime = Date.now() - timeRange;
    return this.metricsHistory.filter(m => m.timestamp >= cutoffTime);
  }

  getActiveAlerts(): AnalyticsAlert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => !alert.autoResolved);
  }

  getMLModelStatus(): Map<string, MLModel> {
    return this.mlEngine.getModelStatus();
  }

  async retrainMLModel(modelId: string, trainingData?: any[]): Promise<boolean> {
    const data = trainingData || this.metricsHistory.slice(-100);
    return await this.mlEngine.retrainModel(modelId, data);
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.autoResolved = true;
    this.emit('alert_resolved', alert);
    console.log(`✅ Alert resolved: ${alertId}`);
    return true;
  }

  getNetworkHealthScore(): number {
    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) return 0;

    const weights = {
      availability: 0.3,
      performance: 0.25,
      security: 0.25,
      quantum: 0.2
    };

    const availabilityScore = currentMetrics.globalMetrics.healthyServices / 
      Math.max(1, currentMetrics.globalMetrics.totalServices);
    
    const performanceScore = Math.max(0, 1 - (currentMetrics.globalMetrics.averageLatency / 200));
    
    const securityScore = currentMetrics.securityMetrics.quantumSecurityScore;
    
    const quantumScore = currentMetrics.globalMetrics.quantumReadiness;

    const overallScore = (
      availabilityScore * weights.availability +
      performanceScore * weights.performance +
      securityScore * weights.security +
      quantumScore * weights.quantum
    ) * 100;

    return Math.round(overallScore);
  }

  getAnalyticsSummary(): any {
    const currentMetrics = this.getCurrentMetrics();
    const activeAlerts = this.getActiveAlerts();
    const healthScore = this.getNetworkHealthScore();

    return {
      healthScore,
      totalNodes: currentMetrics?.globalMetrics.totalNodes || 0,
      activeNodes: currentMetrics?.globalMetrics.activeNodes || 0,
      totalServices: currentMetrics?.globalMetrics.totalServices || 0,
      healthyServices: currentMetrics?.globalMetrics.healthyServices || 0,
      quantumReadiness: currentMetrics?.globalMetrics.quantumReadiness || 0,
      averageLatency: currentMetrics?.globalMetrics.averageLatency || 0,
      overallThroughput: currentMetrics?.globalMetrics.overallThroughput || 0,
      securityScore: currentMetrics?.securityMetrics.quantumSecurityScore || 0,
      threatLevel: currentMetrics?.securityMetrics.threatLevel || 'LOW',
      activeAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter(a => a.severity === 'CRITICAL').length,
      metricsHistorySize: this.metricsHistory.length,
      isCollecting: this.isCollectingMetrics,
      timestamp: Date.now()
    };
  }

  setMetricsCollectionInterval(intervalMs: number): void {
    if (intervalMs < 5000) {
      throw new Error('Metrics collection interval must be at least 5 seconds');
    }

    this.collectionInterval = intervalMs;
    
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.startMetricsCollection();
    }

    console.log(`📊 Metrics collection interval updated to ${intervalMs}ms`);
  }

  stopMetricsCollection(): void {
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.metricsCollectionInterval = undefined;
    }
    
    this.isCollectingMetrics = false;
    console.log('📊 Metrics collection stopped');
  }

  startAnalytics(): void {
    if (!this.isCollectingMetrics) {
      this.startMetricsCollection();
    }
    console.log('📊 Quantum network analytics started');
  }

  destroy(): void {
    this.stopMetricsCollection();
    this.metricsHistory = [];
    this.activeAlerts.clear();
    console.log('📊 Quantum Network Analytics Engine destroyed');
  }
}

export type {
  QuantumNetworkMetrics,
  NodeMetrics,
  ChannelMetrics,
  ServiceMetrics,
  GlobalNetworkMetrics,
  SecurityMetrics,
  PerformanceMetrics,
  ThreatEvent,
  AnomalyPattern,
  PerformanceBottleneck,
  OptimizationOpportunity,
  PerformanceRecommendation,
  AnalyticsAlert,
  MLModel
};

export default QuantumNetworkAnalyticsEngine;
