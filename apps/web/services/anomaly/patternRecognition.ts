/**
 * Advanced Pattern Recognition Engine
 * Graph-based anomaly detection, motif discovery, and subsequence analysis
 */

import { EventEmitter } from 'events';

// Interfaces for pattern recognition
interface GraphNode {
  id: string;
  features: { [key: string]: number };
  connections: string[];
  weight: number;
  timestamp?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  type: string;
  properties?: { [key: string]: unknown };
}

interface Graph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  adjacencyMatrix: number[][];
  nodeIndex: Map<string, number>;
}

interface Motif {
  pattern: string[];
  frequency: number;
  significance: number;
  instances: number[][];
  type: 'sequence' | 'graph' | 'temporal';
}

interface Subsequence {
  data: number[];
  startIndex: number;
  endIndex: number;
  score: number;
  type: 'anomalous' | 'normal' | 'periodic';
}

interface PatternAnomalyResult {
  isAnomaly: boolean;
  score: number;
  confidence: number;
  patternType: 'graph' | 'motif' | 'subsequence' | 'structural';
  explanation: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: {
    graphMetrics?: GraphMetrics;
    motifs?: Motif[];
    subsequences?: Subsequence[];
    structuralFeatures?: { [key: string]: number };
  };
}

interface GraphMetrics {
  degree: { [nodeId: string]: number };
  betweenness: { [nodeId: string]: number };
  closeness: { [nodeId: string]: number };
  clustering: { [nodeId: string]: number };
  pagerank: { [nodeId: string]: number };
  anomalyScore: { [nodeId: string]: number };
}

interface PatternConfig {
  methods: string[];
  motifMinLength: number;
  motifMaxLength: number;
  subsequenceWindowSize: number;
  graphAnomalyThreshold: number;
  significanceThreshold: number;
}

// Graph analysis utilities
class GraphAnalyzer {
  static calculateDegree(graph: Graph): { [nodeId: string]: number } {
    const degree: { [nodeId: string]: number } = {};
    
    for (const [nodeId, node] of graph.nodes) {
      degree[nodeId] = node.connections.length;
    }
    
    return degree;
  }

  static calculateBetweennessCentrality(graph: Graph): { [nodeId: string]: number } {
    const betweenness: { [nodeId: string]: number } = {};
    const nodes = Array.from(graph.nodes.keys());
    
    // Initialize all values to 0
    for (const nodeId of nodes) {
      betweenness[nodeId] = 0;
    }

    // For each pair of nodes, find shortest paths
    for (let s = 0; s < nodes.length; s++) {
      for (let t = s + 1; t < nodes.length; t++) {
        const paths = this.findAllShortestPaths(graph, nodes[s], nodes[t]);
        
        if (paths.length > 0) {
          for (const path of paths) {
            // Add to betweenness score for intermediate nodes
            for (let i = 1; i < path.length - 1; i++) {
              betweenness[path[i]] += 1 / paths.length;
            }
          }
        }
      }
    }

    // Normalize
    const n = nodes.length;
    const normalizationFactor = (n - 1) * (n - 2) / 2;
    
    for (const nodeId of nodes) {
      betweenness[nodeId] /= normalizationFactor;
    }

    return betweenness;
  }

  static calculateClosenessCentrality(graph: Graph): { [nodeId: string]: number } {
    const closeness: { [nodeId: string]: number } = {};
    const nodes = Array.from(graph.nodes.keys());

    for (const nodeId of nodes) {
      const distances = this.dijkstraShortestPaths(graph, nodeId);
      const totalDistance = Object.values(distances).reduce((sum, dist) => sum + dist, 0);
      
      closeness[nodeId] = totalDistance > 0 ? (nodes.length - 1) / totalDistance : 0;
    }

    return closeness;
  }

  static calculateClusteringCoefficient(graph: Graph): { [nodeId: string]: number } {
    const clustering: { [nodeId: string]: number } = {};

    for (const [nodeId, node] of graph.nodes) {
      const neighbors = node.connections;
      
      if (neighbors.length < 2) {
        clustering[nodeId] = 0;
        continue;
      }

      let edgesBetweenNeighbors = 0;
      
      for (let i = 0; i < neighbors.length; i++) {
        for (let j = i + 1; j < neighbors.length; j++) {
          const neighbor1 = graph.nodes.get(neighbors[i]);
          if (neighbor1 && neighbor1.connections.includes(neighbors[j])) {
            edgesBetweenNeighbors++;
          }
        }
      }

      const possibleEdges = neighbors.length * (neighbors.length - 1) / 2;
      clustering[nodeId] = edgesBetweenNeighbors / possibleEdges;
    }

    return clustering;
  }

  static calculatePageRank(graph: Graph, dampingFactor: number = 0.85, maxIterations: number = 100): { [nodeId: string]: number } {
    const pagerank: { [nodeId: string]: number } = {};
    const nodes = Array.from(graph.nodes.keys());
    const n = nodes.length;

    // Initialize PageRank values
    for (const nodeId of nodes) {
      pagerank[nodeId] = 1 / n;
    }

    // Iterative calculation
    for (let iter = 0; iter < maxIterations; iter++) {
      const newPagerank: { [nodeId: string]: number } = {};
      
      for (const nodeId of nodes) {
        newPagerank[nodeId] = (1 - dampingFactor) / n;
        
        // Add contributions from incoming links
        for (const [otherId, otherNode] of graph.nodes) {
          if (otherNode.connections.includes(nodeId)) {
            const outDegree = otherNode.connections.length;
            newPagerank[nodeId] += dampingFactor * pagerank[otherId] / outDegree;
          }
        }
      }

      // Check convergence
      let maxDiff = 0;
      for (const nodeId of nodes) {
        maxDiff = Math.max(maxDiff, Math.abs(newPagerank[nodeId] - pagerank[nodeId]));
        pagerank[nodeId] = newPagerank[nodeId];
      }

      if (maxDiff < 1e-6) break;
    }

    return pagerank;
  }

  private static findAllShortestPaths(graph: Graph, source: string, target: string): string[][] {
    const queue: { node: string; path: string[]; distance: number }[] = [{ node: source, path: [source], distance: 0 }];
    const visited = new Set<string>();
    const shortestPaths: string[][] = [];
    let shortestDistance = Infinity;

    while (queue.length > 0) {
      const { node, path, distance } = queue.shift()!;

      if (distance > shortestDistance) continue;

      if (node === target) {
        if (distance < shortestDistance) {
          shortestDistance = distance;
          shortestPaths.length = 0;
          shortestPaths.push([...path]);
        } else if (distance === shortestDistance) {
          shortestPaths.push([...path]);
        }
        continue;
      }

      if (visited.has(node)) continue;
      visited.add(node);

      const nodeObj = graph.nodes.get(node);
      if (nodeObj) {
        for (const neighbor of nodeObj.connections) {
          if (!path.includes(neighbor)) {
            queue.push({
              node: neighbor,
              path: [...path, neighbor],
              distance: distance + 1
            });
          }
        }
      }
    }

    return shortestPaths;
  }

  private static dijkstraShortestPaths(graph: Graph, source: string): { [nodeId: string]: number } {
    const distances: { [nodeId: string]: number } = {};
    const visited = new Set<string>();
    const nodes = Array.from(graph.nodes.keys());

    // Initialize distances
    for (const nodeId of nodes) {
      distances[nodeId] = nodeId === source ? 0 : Infinity;
    }

    while (visited.size < nodes.length) {
      // Find unvisited node with minimum distance
      let currentNode = '';
      let minDistance = Infinity;
      
      for (const nodeId of nodes) {
        if (!visited.has(nodeId) && distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          currentNode = nodeId;
        }
      }

      if (currentNode === '') break;
      visited.add(currentNode);

      const node = graph.nodes.get(currentNode);
      if (node) {
        for (const neighbor of node.connections) {
          const newDistance = distances[currentNode] + 1; // Assuming unit edge weights
          if (newDistance < distances[neighbor]) {
            distances[neighbor] = newDistance;
          }
        }
      }
    }

    return distances;
  }
}

// Motif discovery engine
class MotifDiscovery {
  static discoverMotifs(data: number[], minLength: number = 3, maxLength: number = 10): Motif[] {
    const motifs: Motif[] = [];
    
    // Convert numeric data to symbolic representation
    const symbols = this.discretizeData(data);
    
    // Find frequent patterns
    for (let length = minLength; length <= maxLength; length++) {
      const patterns = this.findFrequentPatterns(symbols, length);
      
      for (const [pattern, instances] of patterns) {
        if (instances.length >= 2) { // At least 2 occurrences
          const significance = this.calculatePatternSignificance(pattern, instances, symbols.length);
          
          motifs.push({
            pattern: pattern.split(''),
            frequency: instances.length,
            significance,
            instances,
            type: 'sequence'
          });
        }
      }
    }

    return motifs.sort((a, b) => b.significance - a.significance);
  }

  private static discretizeData(data: number[], numBins: number = 5): string {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binSize = (max - min) / numBins;
    
    return data.map(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), numBins - 1);
      return String.fromCharCode(65 + binIndex); // A, B, C, D, E
    }).join('');
  }

  private static findFrequentPatterns(symbols: string, length: number): Map<string, number[][]> {
    const patterns = new Map<string, number[][]>();
    
    for (let i = 0; i <= symbols.length - length; i++) {
      const pattern = symbols.substring(i, i + length);
      
      if (!patterns.has(pattern)) {
        patterns.set(pattern, []);
      }
      
      patterns.get(pattern)!.push([i, i + length - 1]);
    }

    return patterns;
  }

  private static calculatePatternSignificance(pattern: string, instances: number[][], totalLength: number): number {
    const patternLength = pattern.length;
    const frequency = instances.length;
    
    // Calculate expected frequency assuming random distribution
    const expectedFrequency = (totalLength - patternLength + 1) / Math.pow(5, patternLength); // 5 symbols
    
    // Z-score based significance
    const variance = expectedFrequency * (1 - 1/Math.pow(5, patternLength));
    const zScore = (frequency - expectedFrequency) / Math.sqrt(variance);
    
    return Math.max(0, zScore);
  }

  static discoverGraphMotifs(graph: Graph): Motif[] {
    const motifs: Motif[] = [];
    const nodes = Array.from(graph.nodes.keys());
    
    // Find triangular motifs (3-node cliques)
    const triangles = this.findTriangles(graph);
    if (triangles.length > 0) {
      motifs.push({
        pattern: ['triangle'],
        frequency: triangles.length,
        significance: this.calculateTriangleSignificance(triangles.length, nodes.length),
        instances: triangles,
        type: 'graph'
      });
    }

    // Find star motifs (central node with multiple connections)
    const stars = this.findStarMotifs(graph);
    if (stars.length > 0) {
      motifs.push({
        pattern: ['star'],
        frequency: stars.length,
        significance: this.calculateStarSignificance(stars, graph),
        instances: stars,
        type: 'graph'
      });
    }

    return motifs;
  }

  private static findTriangles(graph: Graph): number[][] {
    const triangles: number[][] = [];
    const nodes = Array.from(graph.nodes.keys());
    const nodeToIndex = new Map(nodes.map((node, index) => [node, index]));

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          const node1 = graph.nodes.get(nodes[i])!;
          const node2 = graph.nodes.get(nodes[j])!;
          const node3 = graph.nodes.get(nodes[k])!;

          if (node1.connections.includes(nodes[j]) &&
              node1.connections.includes(nodes[k]) &&
              node2.connections.includes(nodes[k])) {
            triangles.push([i, j, k]);
          }
        }
      }
    }

    return triangles;
  }

  private static findStarMotifs(graph: Graph, minDegree: number = 3): number[][] {
    const stars: number[][] = [];
    const nodes = Array.from(graph.nodes.keys());

    for (let i = 0; i < nodes.length; i++) {
      const node = graph.nodes.get(nodes[i])!;
      
      if (node.connections.length >= minDegree) {
        const starIndices = [i, ...node.connections.map(conn => 
          nodes.findIndex(n => n === conn)
        ).filter(idx => idx !== -1)];
        
        stars.push(starIndices);
      }
    }

    return stars;
  }

  private static calculateTriangleSignificance(triangleCount: number, nodeCount: number): number {
    const maxTriangles = nodeCount * (nodeCount - 1) * (nodeCount - 2) / 6;
    return triangleCount / maxTriangles;
  }

  private static calculateStarSignificance(stars: number[][], graph: Graph): number {
    const totalStars = stars.length;
    const totalNodes = graph.nodes.size;
    return totalStars / totalNodes;
  }
}

// Subsequence analysis
class SubsequenceAnalyzer {
  static findAnomalousSubsequences(data: number[], windowSize: number = 20): Subsequence[] {
    const subsequences: Subsequence[] = [];
    
    for (let i = 0; i <= data.length - windowSize; i++) {
      const subsequence = data.slice(i, i + windowSize);
      const score = this.calculateAnomalyScore(subsequence, data);
      const type = this.classifySubsequence(subsequence, score);
      
      subsequences.push({
        data: subsequence,
        startIndex: i,
        endIndex: i + windowSize - 1,
        score,
        type
      });
    }

    return subsequences.filter(sub => sub.type === 'anomalous');
  }

  private static calculateAnomalyScore(subsequence: number[], fullData: number[]): number {
    // Calculate statistical measures
    const subMean = this.mean(subsequence);
    const subStd = this.standardDeviation(subsequence);
    const fullMean = this.mean(fullData);
    const fullStd = this.standardDeviation(fullData);

    // Z-score for mean
    const meanZScore = Math.abs(subMean - fullMean) / fullStd;
    
    // Variance ratio
    const varianceRatio = subStd / fullStd;
    
    // Trend analysis
    const trend = this.calculateTrend(subsequence);
    const fullTrend = this.calculateTrend(fullData);
    const trendDiff = Math.abs(trend - fullTrend);

    // Combine scores
    const anomalyScore = (meanZScore + Math.abs(Math.log(varianceRatio)) + trendDiff) / 3;
    
    return Math.min(anomalyScore, 1);
  }

  private static classifySubsequence(subsequence: number[], score: number): 'anomalous' | 'normal' | 'periodic' {
    if (score > 0.7) return 'anomalous';
    
    // Check for periodicity
    const autocorrelations = this.calculateAutocorrelations(subsequence);
    const maxAutocorr = Math.max(...autocorrelations.slice(1)); // Exclude lag 0
    
    if (maxAutocorr > 0.8) return 'periodic';
    
    return 'normal';
  }

  private static calculateTrend(data: number[]): number {
    const n = data.length;
    const x = Array.from({length: n}, (_, i) => i);
    
    const xMean = this.mean(x);
    const yMean = this.mean(data);
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (data[i] - yMean);
      denominator += (x[i] - xMean) ** 2;
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static calculateAutocorrelations(data: number[]): number[] {
    const n = data.length;
    const correlations: number[] = [];
    const mean = this.mean(data);
    
    for (let lag = 0; lag < Math.min(n, 10); lag++) {
      let numerator = 0;
      let denominator = 0;
      
      for (let i = 0; i < n - lag; i++) {
        numerator += (data[i] - mean) * (data[i + lag] - mean);
      }
      
      for (let i = 0; i < n; i++) {
        denominator += (data[i] - mean) ** 2;
      }
      
      correlations.push(denominator === 0 ? 0 : numerator / denominator);
    }
    
    return correlations;
  }

  private static mean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private static standardDeviation(values: number[]): number {
    const mean = this.mean(values);
    const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }
}

// Main Pattern Recognition Engine
export class PatternRecognitionEngine extends EventEmitter {
  private config: PatternConfig;
  private graphs: Map<string, Graph> = new Map();
  private historicalData: number[] = [];
  private isInitialized: boolean = false;

  constructor(config?: Partial<PatternConfig>) {
    super();
    
    this.config = {
      methods: ['graph', 'motif', 'subsequence', 'structural'],
      motifMinLength: 3,
      motifMaxLength: 10,
      subsequenceWindowSize: 20,
      graphAnomalyThreshold: 0.7,
      significanceThreshold: 2.0,
      ...config
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.isInitialized = true;
      this.emit('initialized', {
        config: this.config,
        timestamp: Date.now()
      });

      console.log('🎯 Pattern Recognition Engine initialized');
    } catch (error) {
      console.error('❌ Failed to initialize pattern recognition:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  async analyzeGraphPatterns(nodes: GraphNode[], edges: GraphEdge[]): Promise<PatternAnomalyResult[]> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    try {
      // Build graph structure
      const graph = this.buildGraph(nodes, edges);
      const graphId = `graph_${Date.now()}`;
      this.graphs.set(graphId, graph);

      // Calculate graph metrics
      const metrics = this.calculateGraphMetrics(graph);
      
      // Discover motifs
      const motifs = MotifDiscovery.discoverGraphMotifs(graph);
      
      // Detect anomalous nodes
      const anomalousNodes = this.detectGraphAnomalies(graph, metrics);

      const results: PatternAnomalyResult[] = [];

      // Analyze each node
      for (const [nodeId, node] of graph.nodes) {
        const isAnomaly = anomalousNodes.has(nodeId);
        const score = metrics.anomalyScore[nodeId] || 0;

        results.push({
          isAnomaly,
          score,
          confidence: Math.abs(score - 0.5) * 2,
          patternType: 'graph',
          explanation: this.generateGraphExplanation(nodeId, metrics, motifs, isAnomaly),
          severity: this.calculateSeverity(score),
          details: {
            graphMetrics: metrics,
            motifs,
            structuralFeatures: this.extractStructuralFeatures(nodeId, graph)
          }
        });
      }

      this.emit('graph_analysis_complete', {
        graphId,
        nodesAnalyzed: results.length,
        anomaliesDetected: results.filter(r => r.isAnomaly).length,
        motifsDiscovered: motifs.length,
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      console.error('❌ Graph pattern analysis failed:', error);
      this.emit('error', { type: 'graph_analysis', error });
      throw error;
    }
  }

  async analyzeSequencePatterns(data: number[]): Promise<PatternAnomalyResult[]> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    try {
      // Store historical data
      this.historicalData = [...this.historicalData, ...data];
      if (this.historicalData.length > 10000) {
        this.historicalData = this.historicalData.slice(-5000); // Keep recent data
      }

      // Discover motifs
      const motifs = MotifDiscovery.discoverMotifs(data, this.config.motifMinLength, this.config.motifMaxLength);
      
      // Find anomalous subsequences
      const subsequences = SubsequenceAnalyzer.findAnomalousSubsequences(data, this.config.subsequenceWindowSize);

      const results: PatternAnomalyResult[] = [];

      // Analyze each data point
      for (let i = 0; i < data.length; i++) {
        const isInAnomalousSubsequence = subsequences.some(sub => 
          i >= sub.startIndex && i <= sub.endIndex
        );

        const localScore = this.calculateLocalAnomalyScore(data, i);
        const isAnomaly = isInAnomalousSubsequence || localScore > this.config.graphAnomalyThreshold;

        results.push({
          isAnomaly,
          score: Math.max(localScore, isInAnomalousSubsequence ? 0.8 : 0),
          confidence: 0.75,
          patternType: 'subsequence',
          explanation: this.generateSequenceExplanation(i, motifs, subsequences, isAnomaly),
          severity: this.calculateSeverity(localScore),
          details: {
            motifs,
            subsequences: subsequences.filter(sub => i >= sub.startIndex && i <= sub.endIndex)
          }
        });
      }

      this.emit('sequence_analysis_complete', {
        dataPoints: results.length,
        anomaliesDetected: results.filter(r => r.isAnomaly).length,
        motifsDiscovered: motifs.length,
        anomalousSubsequences: subsequences.length,
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      console.error('❌ Sequence pattern analysis failed:', error);
      this.emit('error', { type: 'sequence_analysis', error });
      throw error;
    }
  }

  private buildGraph(nodes: GraphNode[], edges: GraphEdge[]): Graph {
    const graph: Graph = {
      nodes: new Map(),
      edges: new Map(),
      adjacencyMatrix: [],
      nodeIndex: new Map()
    };

    // Add nodes
    nodes.forEach((node, index) => {
      graph.nodes.set(node.id, { ...node });
      graph.nodeIndex.set(node.id, index);
    });

    // Add edges and update connections
    for (const edge of edges) {
      graph.edges.set(`${edge.source}-${edge.target}`, edge);
      
      const sourceNode = graph.nodes.get(edge.source);
      const targetNode = graph.nodes.get(edge.target);
      
      if (sourceNode && !sourceNode.connections.includes(edge.target)) {
        sourceNode.connections.push(edge.target);
      }
      
      if (targetNode && !targetNode.connections.includes(edge.source)) {
        targetNode.connections.push(edge.source);
      }
    }

    // Build adjacency matrix
    const n = nodes.length;
    graph.adjacencyMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
    
    for (const edge of edges) {
      const sourceIndex = graph.nodeIndex.get(edge.source);
      const targetIndex = graph.nodeIndex.get(edge.target);
      
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        graph.adjacencyMatrix[sourceIndex][targetIndex] = edge.weight;
        graph.adjacencyMatrix[targetIndex][sourceIndex] = edge.weight; // Undirected
      }
    }

    return graph;
  }

  private calculateGraphMetrics(graph: Graph): GraphMetrics {
    return {
      degree: GraphAnalyzer.calculateDegree(graph),
      betweenness: GraphAnalyzer.calculateBetweennessCentrality(graph),
      closeness: GraphAnalyzer.calculateClosenessCentrality(graph),
      clustering: GraphAnalyzer.calculateClusteringCoefficient(graph),
      pagerank: GraphAnalyzer.calculatePageRank(graph),
      anomalyScore: this.calculateNodeAnomalyScores(graph)
    };
  }

  private calculateNodeAnomalyScores(graph: Graph): { [nodeId: string]: number } {
    const scores: { [nodeId: string]: number } = {};
    const degree = GraphAnalyzer.calculateDegree(graph);
    const clustering = GraphAnalyzer.calculateClusteringCoefficient(graph);
    
    // Calculate z-scores for degree and clustering
    const degrees = Object.values(degree);
    const clusterings = Object.values(clustering);
    
    const degreeMean = degrees.reduce((sum, val) => sum + val, 0) / degrees.length;
    const degreeStd = Math.sqrt(degrees.reduce((sum, val) => sum + (val - degreeMean) ** 2, 0) / degrees.length);
    
    const clusteringMean = clusterings.reduce((sum, val) => sum + val, 0) / clusterings.length;
    const clusteringStd = Math.sqrt(clusterings.reduce((sum, val) => sum + (val - clusteringMean) ** 2, 0) / clusterings.length);

    for (const [nodeId, node] of graph.nodes) {
      const degreeZScore = degreeStd > 0 ? Math.abs(degree[nodeId] - degreeMean) / degreeStd : 0;
      const clusteringZScore = clusteringStd > 0 ? Math.abs(clustering[nodeId] - clusteringMean) / clusteringStd : 0;
      
      scores[nodeId] = Math.min((degreeZScore + clusteringZScore) / 2, 1);
    }

    return scores;
  }

  private detectGraphAnomalies(graph: Graph, metrics: GraphMetrics): Set<string> {
    const anomalousNodes = new Set<string>();

    for (const [nodeId, score] of Object.entries(metrics.anomalyScore)) {
      if (score > this.config.graphAnomalyThreshold) {
        anomalousNodes.add(nodeId);
      }
    }

    return anomalousNodes;
  }

  private calculateLocalAnomalyScore(data: number[], index: number): number {
    const windowSize = Math.min(10, Math.floor(data.length / 10));
    const start = Math.max(0, index - windowSize);
    const end = Math.min(data.length, index + windowSize + 1);
    
    const localData = data.slice(start, end);
    const mean = localData.reduce((sum, val) => sum + val, 0) / localData.length;
    const std = Math.sqrt(localData.reduce((sum, val) => sum + (val - mean) ** 2, 0) / localData.length);
    
    const zScore = std > 0 ? Math.abs(data[index] - mean) / std : 0;
    return Math.min(zScore / 3, 1); // Normalize
  }

  private extractStructuralFeatures(nodeId: string, graph: Graph): { [key: string]: number } {
    const node = graph.nodes.get(nodeId);
    if (!node) return {};

    const features: { [key: string]: number } = {};
    
    // Basic structural features
    features.degree = node.connections.length;
    features.weight = node.weight;
    features.localDensity = this.calculateLocalDensity(nodeId, graph);
    features.triangleCount = this.countTriangles(nodeId, graph);
    
    return features;
  }

  private calculateLocalDensity(nodeId: string, graph: Graph): number {
    const node = graph.nodes.get(nodeId);
    if (!node || node.connections.length < 2) return 0;

    let edgeCount = 0;
    const neighbors = node.connections;
    
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const neighbor1 = graph.nodes.get(neighbors[i]);
        if (neighbor1 && neighbor1.connections.includes(neighbors[j])) {
          edgeCount++;
        }
      }
    }

    const maxPossibleEdges = neighbors.length * (neighbors.length - 1) / 2;
    return maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
  }

  private countTriangles(nodeId: string, graph: Graph): number {
    const node = graph.nodes.get(nodeId);
    if (!node) return 0;

    let triangleCount = 0;
    const neighbors = node.connections;

    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const neighbor1 = graph.nodes.get(neighbors[i]);
        if (neighbor1 && neighbor1.connections.includes(neighbors[j])) {
          triangleCount++;
        }
      }
    }

    return triangleCount;
  }

  private generateGraphExplanation(nodeId: string, metrics: GraphMetrics, motifs: Motif[], isAnomaly: boolean): string[] {
    const explanations: string[] = [];

    if (isAnomaly) {
      const score = metrics.anomalyScore[nodeId];
      explanations.push(`Node anomaly score: ${score.toFixed(3)}`);

      const degree = metrics.degree[nodeId];
      const clustering = metrics.clustering[nodeId];
      
      if (degree > 10) {
        explanations.push(`High degree connectivity: ${degree} connections`);
      } else if (degree < 2) {
        explanations.push(`Low connectivity: ${degree} connections`);
      }

      if (clustering < 0.1) {
        explanations.push('Low clustering coefficient indicates structural anomaly');
      }

      if (motifs.length > 0) {
        explanations.push(`Involved in ${motifs.length} structural motifs`);
      }
    } else {
      explanations.push('Normal graph structure');
    }

    return explanations;
  }

  private generateSequenceExplanation(index: number, motifs: Motif[], subsequences: Subsequence[], isAnomaly: boolean): string[] {
    const explanations: string[] = [];

    if (isAnomaly) {
      const relevantSubsequences = subsequences.filter(sub => 
        index >= sub.startIndex && index <= sub.endIndex
      );

      if (relevantSubsequences.length > 0) {
        explanations.push(`Part of ${relevantSubsequences.length} anomalous subsequence(s)`);
        const maxScore = Math.max(...relevantSubsequences.map(sub => sub.score));
        explanations.push(`Maximum subsequence anomaly score: ${maxScore.toFixed(3)}`);
      }

      if (motifs.length > 0) {
        explanations.push(`Found ${motifs.length} significant patterns in data`);
      }
    } else {
      explanations.push('Normal sequence pattern');
    }

    return explanations;
  }

  private calculateSeverity(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 0.3) return 'LOW';
    if (score < 0.6) return 'MEDIUM';
    if (score < 0.9) return 'HIGH';
    return 'CRITICAL';
  }

  getPatternStatistics(): PatternStatistics {
    return {
      config: this.config,
      graphsAnalyzed: this.graphs.size,
      historicalDataPoints: this.historicalData.length,
      isInitialized: this.isInitialized,
      supportedMethods: ['graph', 'motif', 'subsequence', 'structural'],
      timestamp: Date.now()
    };
  }

  private async waitForInitialization(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve();
      } else {
        this.once('initialized', resolve);
      }
    });
  }
}

// Type definitions for pattern recognition
interface PatternStatistics {
  config: PatternConfig;
  graphsAnalyzed: number;
  historicalDataPoints: number;
  isInitialized: boolean;
  supportedMethods: string[];
  timestamp: number;
}

export default PatternRecognitionEngine;
