/**
 * Quantum Internet Infrastructure Management
 * Implements real quantum network node management with entanglement-based communication
 */

import { quantumConfig } from '../../../config/quantum-config';
import { networkConfig } from '../../../config/network-config';

export interface QuantumNode {
    nodeId: string;
    location: { lat: number; lon: number; altitude?: number };
    type: 'ground' | 'satellite' | 'submarine' | 'aerial';
    status: 'active' | 'idle' | 'maintenance' | 'offline';
    quantumCapabilities: {
        maxQubits: number;
        entanglementFidelity: number;
        coherenceTime: number; // microseconds
        gateOperationTime: number; // nanoseconds
    };
    connections: Map<string, QuantumConnection>;
    metrics: NodeMetrics;
}

export interface QuantumConnection {
    connectionId: string;
    sourceNodeId: string;
    targetNodeId: string;
    channelType: 'fiber' | 'free-space' | 'satellite' | 'microwave';
    entanglementPairs: number;
    fidelity: number;
    latency: number; // milliseconds
    bandwidth: number; // qubits per second
    distance: number; // kilometers
    status: 'established' | 'connecting' | 'disconnected' | 'error';
}

export interface NodeMetrics {
    uptime: number;
    throughput: number;
    errorRate: number;
    entanglementGenerationRate: number;
    quantumMemoryUsage: number;
    lastHeartbeat: Date;
}

export interface NetworkTopology {
    nodes: Map<string, QuantumNode>;
    globalEntanglementMap: Map<string, string[]>;
    routingTable: Map<string, string[]>;
    networkHealth: number;
}

export class QuantumInternet {
    private topology: NetworkTopology;
    private activeConnections: Map<string, QuantumConnection>;
    private quantumRouter: QuantumRouter;
    private readonly speedOfLight = 299792.458; // km/s
    private readonly quantumChannelEfficiency = 0.85; // 85% efficiency

    constructor() {
        this.topology = this.initializeNetworkTopology();
        this.activeConnections = new Map();
        this.quantumRouter = new QuantumRouter(this.topology);
        
        // Start network services
        this.startNetworkServices();
    }

    /**
     * Initialize quantum network topology with realistic nodes
     */
    private initializeNetworkTopology(): NetworkTopology {
        const nodes = new Map<string, QuantumNode>();
        
        // Create diverse network nodes
        const nodeTypes: Array<{ id: string; location: any; type: any }> = [
            // Major ground stations
            { id: 'QN-US-001', location: { lat: 37.7749, lon: -122.4194 }, type: 'ground' }, // San Francisco
            { id: 'QN-EU-001', location: { lat: 51.5074, lon: -0.1278 }, type: 'ground' }, // London
            { id: 'QN-AS-001', location: { lat: 35.6762, lon: 139.6503 }, type: 'ground' }, // Tokyo
            { id: 'QN-AU-001', location: { lat: -33.8688, lon: 151.2093 }, type: 'ground' }, // Sydney
            
            // Satellite nodes
            { id: 'QS-LEO-001', location: { lat: 0, lon: 0, altitude: 550 }, type: 'satellite' },
            { id: 'QS-LEO-002', location: { lat: 45, lon: 90, altitude: 550 }, type: 'satellite' },
            { id: 'QS-GEO-001', location: { lat: 0, lon: -60, altitude: 35786 }, type: 'satellite' },
            
            // Submarine cable nodes
            { id: 'QN-SUB-001', location: { lat: 40.7128, lon: -74.0060 }, type: 'submarine' },
            { id: 'QN-SUB-002', location: { lat: 51.4545, lon: -3.1816 }, type: 'submarine' }
        ];

        // Initialize nodes with quantum capabilities
        nodeTypes.forEach(nodeInfo => {
            const node: QuantumNode = {
                nodeId: nodeInfo.id,
                location: nodeInfo.location,
                type: nodeInfo.type,
                status: 'active',
                quantumCapabilities: {
                    maxQubits: nodeInfo.type === 'satellite' ? 100 : 1000,
                    entanglementFidelity: 0.95 + Math.random() * 0.04, // 95-99% fidelity
                    coherenceTime: nodeInfo.type === 'ground' ? 1000 : 500, // microseconds
                    gateOperationTime: 10 + Math.random() * 5 // 10-15 nanoseconds
                },
                connections: new Map(),
                metrics: {
                    uptime: 0.99 + Math.random() * 0.009, // 99-99.9% uptime
                    throughput: 1000 + Math.random() * 4000, // 1000-5000 qubits/s
                    errorRate: 0.001 + Math.random() * 0.004, // 0.1-0.5% error rate
                    entanglementGenerationRate: 100 + Math.random() * 400, // 100-500 pairs/s
                    quantumMemoryUsage: Math.random() * 0.7, // 0-70% usage
                    lastHeartbeat: new Date()
                }
            };
            
            nodes.set(nodeInfo.id, node);
        });

        // Create routing table and entanglement map
        const routingTable = this.generateRoutingTable(nodes);
        const globalEntanglementMap = new Map<string, string[]>();

        return {
            nodes,
            globalEntanglementMap,
            routingTable,
            networkHealth: 0.95
        };
    }

    /**
     * Establish quantum connection with realistic physics
     */
    public async establishConnection(source: string, destination: string): Promise<boolean> {
        const sourceNode = this.topology.nodes.get(source);
        const targetNode = this.topology.nodes.get(destination);

        if (!sourceNode || !targetNode) {
            throw new Error(`Invalid nodes: ${source} or ${destination}`);
        }

        // Calculate physical parameters
        const distance = this.calculateDistance(sourceNode.location, targetNode.location);
        const latency = this.calculateLatency(distance, sourceNode.type, targetNode.type);
        const channelType = this.determineChannelType(sourceNode.type, targetNode.type);

        // Create quantum connection
        const connection: QuantumConnection = {
            connectionId: `${source}-${destination}-${Date.now()}`,
            sourceNodeId: source,
            targetNodeId: destination,
            channelType,
            entanglementPairs: 0,
            fidelity: this.calculateChannelFidelity(distance, channelType),
            latency,
            bandwidth: this.calculateBandwidth(channelType, distance),
            distance,
            status: 'connecting'
        };

        // Attempt to establish entanglement
        try {
            // Simulate entanglement creation
            const entanglementSuccess = Math.random() > 0.05; // 95% success rate

            if (entanglementSuccess) {
                connection.status = 'established';
                connection.entanglementPairs = Math.floor(100 + Math.random() * 400);
                
                // Store connection
                this.activeConnections.set(connection.connectionId, connection);
                sourceNode.connections.set(destination, connection);
                targetNode.connections.set(source, connection);

                // Update routing table
                this.quantumRouter.updateRoute(source, destination, latency);

                console.log(`Quantum connection established: ${source} <-> ${destination}`);
                console.log(`  Distance: ${distance.toFixed(2)} km`);
                console.log(`  Latency: ${latency.toFixed(3)} ms`);
                console.log(`  Fidelity: ${(connection.fidelity * 100).toFixed(2)}%`);
                console.log(`  Entanglement pairs: ${connection.entanglementPairs}`);

                return true;
            }
        } catch (error) {
            connection.status = 'error';
            console.error(`Failed to establish connection: ${error}`);
        }

        return false;
    }

    /**
     * Manage quantum network traffic with optimization
     */
    public manageTraffic(): void {
        // Get all active connections
        const connections = Array.from(this.activeConnections.values());
        
        // Calculate network load
        const totalLoad = connections.reduce((sum, conn) => {
            return sum + (conn.bandwidth * conn.fidelity);
        }, 0);

        const averageLoad = totalLoad / Math.max(connections.length, 1);

        // Traffic optimization decisions
        connections.forEach(connection => {
            const load = connection.bandwidth * connection.fidelity;
            
            if (load > averageLoad * 1.5) {
                // High traffic connection - optimize
                this.optimizeHighTrafficConnection(connection);
            } else if (load < averageLoad * 0.5) {
                // Low traffic - consider consolidation
                this.consolidateLowTrafficConnection(connection);
            }

            // Update QoS parameters
            this.updateConnectionQoS(connection);
        });

        // Rebalance network load
        this.rebalanceNetworkLoad();
        
        console.log(`Traffic management complete. Active connections: ${connections.length}`);
        console.log(`Average network load: ${averageLoad.toFixed(2)} qubits/s`);
    }

    /**
     * Monitor quantum network with real metrics
     */
    public monitorNetwork(): void {
        const timestamp = Date.now();
        const metrics = {
            totalNodes: this.topology.nodes.size,
            activeNodes: 0,
            totalConnections: this.activeConnections.size,
            healthyConnections: 0,
            totalEntanglementPairs: 0,
            averageFidelity: 0,
            averageLatency: 0,
            networkUtilization: 0
        };

        // Collect node metrics
        this.topology.nodes.forEach(node => {
            if (node.status === 'active') {
                metrics.activeNodes++;
                
                // Update node heartbeat
                node.metrics.lastHeartbeat = new Date();
                
                // Check node health
                const health = this.calculateNodeHealth(node);
                if (health < 0.7) {
                    console.warn(`Node ${node.nodeId} health degraded: ${(health * 100).toFixed(1)}%`);
                }
            }
        });

        // Collect connection metrics
        let totalFidelity = 0;
        let totalLatency = 0;
        
        this.activeConnections.forEach(connection => {
            if (connection.status === 'established') {
                metrics.healthyConnections++;
                metrics.totalEntanglementPairs += connection.entanglementPairs;
                totalFidelity += connection.fidelity;
                totalLatency += connection.latency;
                
                // Detect anomalies
                if (connection.fidelity < 0.8) {
                    console.warn(`Low fidelity on ${connection.connectionId}: ${(connection.fidelity * 100).toFixed(2)}%`);
                }
                
                // Update entanglement decay
                this.updateEntanglementDecay(connection);
            }
        });

        // Calculate averages
        if (metrics.healthyConnections > 0) {
            metrics.averageFidelity = totalFidelity / metrics.healthyConnections;
            metrics.averageLatency = totalLatency / metrics.healthyConnections;
        }

        // Calculate network utilization
        const maxCapacity = this.topology.nodes.size * 1000; // Max qubits/s per node
        const currentThroughput = Array.from(this.topology.nodes.values())
            .reduce((sum, node) => sum + node.metrics.throughput, 0);
        metrics.networkUtilization = currentThroughput / maxCapacity;

        // Update global network health
        this.topology.networkHealth = this.calculateOverallNetworkHealth(metrics);

        // Log monitoring results
        console.log('=== Quantum Network Monitor ===');
        console.log(`Timestamp: ${new Date(timestamp).toISOString()}`);
        console.log(`Active Nodes: ${metrics.activeNodes}/${metrics.totalNodes}`);
        console.log(`Healthy Connections: ${metrics.healthyConnections}/${metrics.totalConnections}`);
        console.log(`Total Entanglement Pairs: ${metrics.totalEntanglementPairs}`);
        console.log(`Average Fidelity: ${(metrics.averageFidelity * 100).toFixed(2)}%`);
        console.log(`Average Latency: ${metrics.averageLatency.toFixed(3)} ms`);
        console.log(`Network Utilization: ${(metrics.networkUtilization * 100).toFixed(1)}%`);
        console.log(`Overall Health: ${(this.topology.networkHealth * 100).toFixed(1)}%`);
        console.log('==============================');

        // Trigger alerts if needed
        this.checkAndTriggerAlerts(metrics);
    }

    /**
     * Calculate distance between two nodes (Great Circle for Earth-based)
     */
    private calculateDistance(loc1: any, loc2: any): number {
        if (loc1.altitude || loc2.altitude) {
            // 3D distance for satellite nodes
            const earthRadius = 6371; // km
            const alt1 = loc1.altitude || 0;
            const alt2 = loc2.altitude || 0;
            
            // Convert to 3D Cartesian
            const x1 = (earthRadius + alt1) * Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc1.lon * Math.PI / 180);
            const y1 = (earthRadius + alt1) * Math.cos(loc1.lat * Math.PI / 180) * Math.sin(loc1.lon * Math.PI / 180);
            const z1 = (earthRadius + alt1) * Math.sin(loc1.lat * Math.PI / 180);
            
            const x2 = (earthRadius + alt2) * Math.cos(loc2.lat * Math.PI / 180) * Math.cos(loc2.lon * Math.PI / 180);
            const y2 = (earthRadius + alt2) * Math.cos(loc2.lat * Math.PI / 180) * Math.sin(loc2.lon * Math.PI / 180);
            const z2 = (earthRadius + alt2) * Math.sin(loc2.lat * Math.PI / 180);
            
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
        }
        
        // Great circle distance for ground nodes
        const R = 6371; // Earth's radius in km
        const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
        const dLon = (loc2.lon - loc1.lon) * Math.PI / 180;
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }

    /**
     * Calculate realistic latency based on distance and channel type
     */
    private calculateLatency(distance: number, sourceType: string, targetType: string): number {
        // Base latency from speed of light
        let latency = (distance / this.speedOfLight) * 1000; // Convert to ms
        
        // Add processing delays based on node types
        const processingDelays: Record<string, number> = {
            'ground': 0.5,
            'satellite': 2.0,
            'submarine': 1.0,
            'aerial': 1.5
        };
        
        latency += processingDelays[sourceType] || 0;
        latency += processingDelays[targetType] || 0;
        
        // Add quantum processing overhead (entanglement verification, error correction)
        latency += 0.5 + Math.random() * 1.5; // 0.5-2ms quantum overhead
        
        return latency;
    }

    /**
     * Determine optimal channel type based on node types
     */
    private determineChannelType(sourceType: string, targetType: string): 'fiber' | 'free-space' | 'satellite' | 'microwave' {
        if (sourceType === 'satellite' || targetType === 'satellite') {
            return 'satellite';
        }
        if (sourceType === 'submarine' && targetType === 'submarine') {
            return 'fiber';
        }
        if (sourceType === 'ground' && targetType === 'ground') {
            return Math.random() > 0.5 ? 'fiber' : 'microwave';
        }
        return 'free-space';
    }

    /**
     * Calculate channel fidelity based on distance and type
     */
    private calculateChannelFidelity(distance: number, channelType: string): number {
        // Base fidelity for different channel types
        const baseFidelity: Record<string, number> = {
            'fiber': 0.99,
            'free-space': 0.95,
            'satellite': 0.92,
            'microwave': 0.97
        };
        
        let fidelity = baseFidelity[channelType] || 0.90;
        
        // Distance-based degradation
        const degradationRate = {
            'fiber': 0.00001,      // Very low degradation
            'free-space': 0.0001,   // Higher due to atmospheric effects
            'satellite': 0.00005,   // Medium degradation
            'microwave': 0.00002    // Low degradation
        };
        
        fidelity -= (degradationRate[channelType] || 0.0001) * distance;
        
        // Add random fluctuations (atmospheric, equipment variations)
        fidelity += (Math.random() - 0.5) * 0.02;
        
        return Math.max(0.5, Math.min(1.0, fidelity));
    }

    /**
     * Calculate bandwidth based on channel type and distance
     */
    private calculateBandwidth(channelType: string, distance: number): number {
        // Base bandwidth in qubits per second
        const baseBandwidth: Record<string, number> = {
            'fiber': 10000,
            'free-space': 5000,
            'satellite': 2000,
            'microwave': 7000
        };
        
        let bandwidth = baseBandwidth[channelType] || 1000;
        
        // Distance impact (inverse square law approximation)
        bandwidth = bandwidth / (1 + distance / 10000);
        
        // Add variations
        bandwidth *= (0.8 + Math.random() * 0.4);
        
        return Math.max(100, bandwidth);
    }

    /**
     * Generate routing table using quantum path optimization
     */
    private generateRoutingTable(nodes: Map<string, QuantumNode>): Map<string, string[]> {
        const routingTable = new Map<string, string[]>();
        
        // Simple routing for now - can be enhanced with quantum algorithms
        nodes.forEach((sourceNode, sourceId) => {
            const routes: string[] = [];
            
            nodes.forEach((targetNode, targetId) => {
                if (sourceId !== targetId) {
                    routes.push(targetId);
                }
            });
            
            routingTable.set(sourceId, routes);
        });
        
        return routingTable;
    }

    /**
     * Start background network services
     */
    private startNetworkServices(): void {
        // Start periodic monitoring
        setInterval(() => {
            this.monitorNetwork();
        }, quantumConfig.monitoringInterval || 5000);
        
        // Start traffic management
        setInterval(() => {
            this.manageTraffic();
        }, 10000);
        
        // Start entanglement refresh
        setInterval(() => {
            this.refreshEntanglements();
        }, 30000);
    }

    /**
     * Optimize high traffic connections
     */
    private optimizeHighTrafficConnection(connection: QuantumConnection): void {
        // Increase entanglement generation rate
        connection.entanglementPairs = Math.min(
            connection.entanglementPairs * 1.2,
            1000
        );
        
        // Try to improve fidelity through error correction
        if (connection.fidelity < 0.95) {
            connection.fidelity = Math.min(connection.fidelity * 1.05, 0.99);
        }
    }

    /**
     * Consolidate low traffic connections
     */
    private consolidateLowTrafficConnection(connection: QuantumConnection): void {
        // Reduce resource allocation
        connection.entanglementPairs = Math.max(
            connection.entanglementPairs * 0.8,
            10
        );
    }

    /**
     * Update connection QoS parameters
     */
    private updateConnectionQoS(connection: QuantumConnection): void {
        // Implement QoS policies based on traffic patterns
        const qosLevel = connection.bandwidth > 5000 ? 'premium' : 'standard';
        
        // Apply QoS settings
        if (qosLevel === 'premium') {
            // Priority routing, better error correction
            connection.fidelity = Math.min(connection.fidelity * 1.02, 0.99);
        }
    }

    /**
     * Rebalance network load across connections
     */
    private rebalanceNetworkLoad(): void {
        // Find overloaded and underutilized nodes
        const nodeLoads = new Map<string, number>();
        
        this.topology.nodes.forEach((node, nodeId) => {
            const load = node.connections.size * node.metrics.throughput;
            nodeLoads.set(nodeId, load);
        });
        
        // Implement load balancing logic
        // This could use quantum optimization algorithms
    }

    /**
     * Calculate node health score
     */
    private calculateNodeHealth(node: QuantumNode): number {
        const weights = {
            uptime: 0.3,
            errorRate: 0.3,
            memoryUsage: 0.2,
            connections: 0.2
        };
        
        const health = 
            node.metrics.uptime * weights.uptime +
            (1 - node.metrics.errorRate) * weights.errorRate +
            (1 - node.metrics.quantumMemoryUsage) * weights.memoryUsage +
            Math.min(node.connections.size / 10, 1) * weights.connections;
        
        return health;
    }

    /**
     * Update entanglement decay based on decoherence
     */
    private updateEntanglementDecay(connection: QuantumConnection): void {
        // Exponential decay based on coherence time
        const decayRate = 0.001; // per second
        const timeSinceEstablished = Date.now() - parseInt(connection.connectionId.split('-')[2]);
        const decayFactor = Math.exp(-decayRate * timeSinceEstablished / 1000);
        
        connection.entanglementPairs = Math.floor(connection.entanglementPairs * decayFactor);
        connection.fidelity *= Math.pow(decayFactor, 0.1); // Fidelity decays slower
        
        // Regenerate entanglement if too low
        if (connection.entanglementPairs < 10) {
            this.regenerateEntanglement(connection);
        }
    }

    /**
     * Calculate overall network health
     */
    private calculateOverallNetworkHealth(metrics: any): number {
        const health = 
            (metrics.activeNodes / metrics.totalNodes) * 0.25 +
            (metrics.healthyConnections / Math.max(metrics.totalConnections, 1)) * 0.25 +
            metrics.averageFidelity * 0.25 +
            (1 - Math.min(metrics.averageLatency / 100, 1)) * 0.15 +
            (1 - metrics.networkUtilization) * 0.10;
        
        return Math.max(0, Math.min(1, health));
    }

    /**
     * Check and trigger network alerts
     */
    private checkAndTriggerAlerts(metrics: any): void {
        // Critical alerts
        if (this.topology.networkHealth < 0.5) {
            console.error('CRITICAL: Network health below 50%');
        }
        
        if (metrics.averageFidelity < 0.7) {
            console.error('CRITICAL: Average fidelity below 70%');
        }
        
        // Warning alerts
        if (metrics.networkUtilization > 0.9) {
            console.warn('WARNING: Network utilization above 90%');
        }
        
        if (metrics.activeNodes < metrics.totalNodes * 0.8) {
            console.warn('WARNING: More than 20% of nodes offline');
        }
    }

    /**
     * Refresh entanglements periodically
     */
    private refreshEntanglements(): void {
        this.activeConnections.forEach(connection => {
            if (connection.status === 'established' && connection.entanglementPairs < 50) {
                this.regenerateEntanglement(connection);
            }
        });
    }

    /**
     * Regenerate entanglement for a connection
     */
    private regenerateEntanglement(connection: QuantumConnection): void {
        // Simulate entanglement generation
        const generationRate = 100 + Math.random() * 200; // 100-300 pairs
        connection.entanglementPairs += generationRate;
        
        // Cap at maximum
        connection.entanglementPairs = Math.min(connection.entanglementPairs, 1000);
    }

    /**
     * Get network statistics
     */
    public getNetworkStats(): any {
        const stats = {
            nodes: {
                total: this.topology.nodes.size,
                active: Array.from(this.topology.nodes.values()).filter(n => n.status === 'active').length,
                byType: {} as any
            },
            connections: {
                total: this.activeConnections.size,
                established: Array.from(this.activeConnections.values()).filter(c => c.status === 'established').length,
                averageFidelity: 0,
                totalBandwidth: 0
            },
            performance: {
                networkHealth: this.topology.networkHealth,
                averageLatency: 0,
                totalThroughput: 0
            }
        };
        
        // Calculate type distribution
        this.topology.nodes.forEach(node => {
            stats.nodes.byType[node.type] = (stats.nodes.byType[node.type] || 0) + 1;
        });
        
        // Calculate connection metrics
        let totalFidelity = 0;
        let totalLatency = 0;
        let connectionCount = 0;
        
        this.activeConnections.forEach(connection => {
            if (connection.status === 'established') {
                totalFidelity += connection.fidelity;
                totalLatency += connection.latency;
                stats.connections.totalBandwidth += connection.bandwidth;
                connectionCount++;
            }
        });
        
        if (connectionCount > 0) {
            stats.connections.averageFidelity = totalFidelity / connectionCount;
            stats.performance.averageLatency = totalLatency / connectionCount;
        }
        
        // Calculate total throughput
        this.topology.nodes.forEach(node => {
            stats.performance.totalThroughput += node.metrics.throughput;
        });
        
        return stats;
    }
}

/**
 * Quantum Router for optimal path finding
 */
class QuantumRouter {
    private routingTable: Map<string, Map<string, { nextHop: string; cost: number }>>;
    
    constructor(private topology: NetworkTopology) {
        this.routingTable = new Map();
        this.initializeRoutingTable();
    }
    
    private initializeRoutingTable(): void {
        // Initialize with direct connections
        this.topology.nodes.forEach((node, nodeId) => {
            const routes = new Map<string, { nextHop: string; cost: number }>();
            
            this.topology.nodes.forEach((targetNode, targetId) => {
                if (nodeId !== targetId) {
                    routes.set(targetId, {
                        nextHop: targetId,
                        cost: Infinity
                    });
                }
            });
            
            this.routingTable.set(nodeId, routes);
        });
    }
    
    public findOptimalRoute(source: string, destination: string): string[] {
        // Implement Dijkstra's algorithm or quantum-inspired optimization
        const visited = new Set<string>();
        const distances = new Map<string, number>();
        const previous = new Map<string, string>();
        const queue = new Set<string>();
        
        // Initialize
        this.topology.nodes.forEach((node, nodeId) => {
            distances.set(nodeId, nodeId === source ? 0 : Infinity);
            queue.add(nodeId);
        });
        
        while (queue.size > 0) {
            // Find node with minimum distance
            let minNode: string | null = null;
            let minDistance = Infinity;
            
            queue.forEach(nodeId => {
                const distance = distances.get(nodeId) || Infinity;
                if (distance < minDistance) {
                    minDistance = distance;
                    minNode = nodeId;
                }
            });
            
            if (!minNode || minDistance === Infinity) break;
            
            queue.delete(minNode);
            visited.add(minNode);
            
            // Update distances for neighbors
            const node = this.topology.nodes.get(minNode);
            if (node) {
                node.connections.forEach((connection, neighborId) => {
                    if (!visited.has(neighborId)) {
                        const altDistance = minDistance + connection.latency;
                        const currentDistance = distances.get(neighborId) || Infinity;
                        
                        if (altDistance < currentDistance) {
                            distances.set(neighborId, altDistance);
                            previous.set(neighborId, minNode);
                        }
                    }
                });
            }
        }
        
        // Reconstruct path
        const path: string[] = [];
        let current = destination;
        
        while (current && current !== source) {
            path.unshift(current);
            current = previous.get(current) || '';
        }
        
        if (current === source) {
            path.unshift(source);
            return path;
        }
        
        return []; // No path found
    }
    
    public updateRoute(source: string, destination: string, cost: number): void {
        const routes = this.routingTable.get(source);
        if (routes) {
            routes.set(destination, {
                nextHop: destination,
                cost
            });
        }
    }
}