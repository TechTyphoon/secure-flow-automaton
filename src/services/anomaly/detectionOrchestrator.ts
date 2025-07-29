/**
 * Anomaly Detection Orchestrator
 * Intelligent pipeline management, model selection, and result fusion
 */

import { EventEmitter } from 'events';
import DeepLearningDetectionService from './deepLearningDetection';
import EnsembleDetectionService from './ensembleDetection';
import TimeSeriesAnalysisService from './timeSeriesAnalysis';
import MultivariateDetectionService from './multivariateDetection';
import PatternRecognitionEngine from './patternRecognition';

// Interfaces for orchestration
interface DetectionRequest {
  id: string;
  data: any;
  dataType: 'univariate' | 'multivariate' | 'timeseries' | 'graph' | 'mixed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  methods?: string[];
  configuration?: any;
  metadata?: any;
}

interface DetectionResult {
  requestId: string;
  results: any[];
  fusedResult: FusedAnomalyResult;
  performance: PerformanceMetrics;
  timestamp: number;
  processingTime: number;
}

interface FusedAnomalyResult {
  isAnomaly: boolean;
  confidenceScore: number;
  consensusScore: number;
  severityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string[];
  contributingMethods: string[];
  methodScores: { [method: string]: number };
  recommendations: string[];
}

interface PerformanceMetrics {
  totalProcessingTime: number;
  methodExecutionTimes: { [method: string]: number };
  memoryUsage: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

interface PipelineConfig {
  defaultMethods: string[];
  fusionStrategy: 'voting' | 'weighted' | 'stacking' | 'adaptive';
  qualityThreshold: number;
  performanceWeights: { [method: string]: number };
  adaptiveLearning: boolean;
  resourceLimits: {
    maxProcessingTime: number;
    maxMemoryUsage: number;
  };
}

interface ModelPerformanceHistory {
  method: string;
  accuracy: number[];
  precision: number[];
  recall: number[];
  processingTime: number[];
  timestamp: number[];
}

// Data characteristics analyzer
class DataCharacteristicsAnalyzer {
  static analyzeData(data: any): {
    type: 'univariate' | 'multivariate' | 'timeseries' | 'graph' | 'mixed';
    characteristics: any;
    recommendedMethods: string[];
  } {
    // Determine data type and characteristics
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return {
          type: 'univariate',
          characteristics: { length: 0 },
          recommendedMethods: ['ensemble']
        };
      }

      const firstElement = data[0];
      
      // Check if it's a simple array of numbers (univariate)
      if (typeof firstElement === 'number') {
        return this.analyzeUnivariateData(data);
      }
      
      // Check if it's time series data
      if (firstElement && typeof firstElement === 'object' && 'timestamp' in firstElement) {
        return this.analyzeTimeSeriesData(data);
      }
      
      // Check if it's multivariate data
      if (firstElement && typeof firstElement === 'object' && 'features' in firstElement) {
        return this.analyzeMultivariateData(data);
      }
      
      // Check if it's graph data
      if (firstElement && typeof firstElement === 'object' && ('nodes' in firstElement || 'id' in firstElement)) {
        return this.analyzeGraphData(data);
      }
    }
    
    // Default case
    return {
      type: 'mixed',
      characteristics: { complex: true },
      recommendedMethods: ['deep_learning', 'ensemble', 'pattern_recognition']
    };
  }

  private static analyzeUnivariateData(data: number[]): any {
    const length = data.length;
    const mean = data.reduce((sum, val) => sum + val, 0) / length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / length;
    
    // Check for trends
    const trend = this.calculateTrend(data);
    
    // Check for seasonality
    const seasonality = this.detectSeasonality(data);
    
    const characteristics = {
      length,
      mean,
      variance,
      standardDeviation: Math.sqrt(variance),
      trend,
      seasonality,
      hasOutliers: this.hasOutliers(data),
      stationarity: this.checkStationarity(data)
    };

    const recommendedMethods = this.recommendMethodsForUnivariate(characteristics);

    return {
      type: 'univariate' as const,
      characteristics,
      recommendedMethods
    };
  }

  private static analyzeTimeSeriesData(data: any[]): any {
    const length = data.length;
    const values = data.map(d => d.value || 0);
    const timestamps = data.map(d => d.timestamp);
    
    // Calculate time intervals
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const isRegular = intervals.every(interval => Math.abs(interval - avgInterval) < avgInterval * 0.1);

    const characteristics = {
      length,
      isRegular,
      averageInterval: avgInterval,
      hasGaps: this.detectGaps(timestamps),
      trend: this.calculateTrend(values),
      seasonality: this.detectSeasonality(values),
      volatility: this.calculateVolatility(values)
    };

    const recommendedMethods = ['time_series', 'deep_learning'];
    if (characteristics.seasonality > 0.5) {
      recommendedMethods.push('pattern_recognition');
    }

    return {
      type: 'timeseries' as const,
      characteristics,
      recommendedMethods
    };
  }

  private static analyzeMultivariateData(data: any[]): any {
    const length = data.length;
    const features = Object.keys(data[0].features || {});
    const featureCount = features.length;
    
    // Calculate correlations between features
    const correlations = this.calculateFeatureCorrelations(data, features);
    const maxCorrelation = Math.max(...correlations);
    
    const characteristics = {
      length,
      featureCount,
      features,
      correlations,
      maxCorrelation,
      highlyCorrelated: maxCorrelation > 0.8,
      sparsity: this.calculateSparsity(data, features)
    };

    const recommendedMethods = ['multivariate', 'deep_learning'];
    if (featureCount > 10) {
      recommendedMethods.push('ensemble');
    }

    return {
      type: 'multivariate' as const,
      characteristics,
      recommendedMethods
    };
  }

  private static analyzeGraphData(data: any[]): any {
    // Assume data contains nodes and edges
    const nodeCount = data.filter(item => item.id).length;
    const edgeCount = data.filter(item => item.source && item.target).length;
    
    const density = nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
    
    const characteristics = {
      nodeCount,
      edgeCount,
      density,
      isConnected: density > 0.1,
      isSparse: density < 0.3
    };

    return {
      type: 'graph' as const,
      characteristics,
      recommendedMethods: ['pattern_recognition', 'deep_learning']
    };
  }

  private static calculateTrend(data: number[]): number {
    const n = data.length;
    if (n < 2) return 0;
    
    const x = Array.from({length: n}, (_, i) => i);
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = data.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (data[i] - yMean);
      denominator += (x[i] - xMean) ** 2;
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static detectSeasonality(data: number[]): number {
    // Simple seasonality detection using autocorrelation
    const maxLag = Math.min(Math.floor(data.length / 3), 50);
    let maxAutocorr = 0;
    
    for (let lag = 1; lag < maxLag; lag++) {
      const autocorr = this.autocorrelation(data, lag);
      maxAutocorr = Math.max(maxAutocorr, Math.abs(autocorr));
    }
    
    return maxAutocorr;
  }

  private static autocorrelation(data: number[], lag: number): number {
    const n = data.length;
    if (lag >= n) return 0;
    
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n - lag; i++) {
      numerator += (data[i] - mean) * (data[i + lag] - mean);
    }
    
    for (let i = 0; i < n; i++) {
      denominator += (data[i] - mean) ** 2;
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static hasOutliers(data: number[]): boolean {
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return data.some(val => val < lowerBound || val > upperBound);
  }

  private static checkStationarity(data: number[]): boolean {
    // Simple stationarity check using variance in windows
    const windowSize = Math.floor(data.length / 4);
    if (windowSize < 10) return true;
    
    const variances = [];
    for (let i = 0; i <= data.length - windowSize; i += windowSize) {
      const window = data.slice(i, i + windowSize);
      const mean = window.reduce((sum, val) => sum + val, 0) / window.length;
      const variance = window.reduce((sum, val) => sum + (val - mean) ** 2, 0) / window.length;
      variances.push(variance);
    }
    
    const varianceOfVariances = this.variance(variances);
    const meanVariance = variances.reduce((sum, val) => sum + val, 0) / variances.length;
    
    return varianceOfVariances / meanVariance < 0.5; // Threshold for stationarity
  }

  private static variance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
  }

  private static detectGaps(timestamps: number[]): boolean {
    if (timestamps.length < 2) return false;
    
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    return intervals.some(interval => interval > avgInterval * 3);
  }

  private static calculateVolatility(data: number[]): number {
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i - 1] !== 0) {
        returns.push((data[i] - data[i - 1]) / data[i - 1]);
      }
    }
    
    const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
    const variance = returns.reduce((sum, val) => sum + (val - mean) ** 2, 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private static calculateFeatureCorrelations(data: any[], features: string[]): number[] {
    const correlations = [];
    
    for (let i = 0; i < features.length; i++) {
      for (let j = i + 1; j < features.length; j++) {
        const values1 = data.map(d => d.features[features[i]] || 0);
        const values2 = data.map(d => d.features[features[j]] || 0);
        
        const correlation = this.correlation(values1, values2);
        correlations.push(Math.abs(correlation));
      }
    }
    
    return correlations;
  }

  private static correlation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    const xMean = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let xVariance = 0;
    let yVariance = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      
      numerator += xDiff * yDiff;
      xVariance += xDiff ** 2;
      yVariance += yDiff ** 2;
    }
    
    const denominator = Math.sqrt(xVariance * yVariance);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static calculateSparsity(data: any[], features: string[]): number {
    let zeroCount = 0;
    let totalCount = 0;
    
    for (const item of data) {
      for (const feature of features) {
        totalCount++;
        if ((item.features[feature] || 0) === 0) {
          zeroCount++;
        }
      }
    }
    
    return totalCount === 0 ? 0 : zeroCount / totalCount;
  }

  private static recommendMethodsForUnivariate(characteristics: any): string[] {
    const methods = ['ensemble'];
    
    if (characteristics.length > 100) {
      methods.push('deep_learning');
    }
    
    if (characteristics.trend !== 0 || characteristics.seasonality > 0.3) {
      methods.push('time_series');
    }
    
    if (characteristics.hasOutliers) {
      methods.push('pattern_recognition');
    }
    
    return methods;
  }
}

// Result fusion engine
class ResultFusionEngine {
  static fuseResults(results: any[], strategy: string = 'weighted'): FusedAnomalyResult {
    if (results.length === 0) {
      return this.createEmptyResult();
    }

    switch (strategy) {
      case 'voting':
        return this.votingFusion(results);
      case 'weighted':
        return this.weightedFusion(results);
      case 'stacking':
        return this.stackingFusion(results);
      case 'adaptive':
        return this.adaptiveFusion(results);
      default:
        return this.weightedFusion(results);
    }
  }

  private static votingFusion(results: any[]): FusedAnomalyResult {
    const anomalyVotes = results.filter(r => r.isAnomaly || r.finalDecision).length;
    const totalVotes = results.length;
    
    const consensusScore = anomalyVotes / totalVotes;
    const isAnomaly = consensusScore > 0.5;
    
    const avgConfidence = results.reduce((sum, r) => sum + (r.confidence || 0.5), 0) / results.length;
    
    return {
      isAnomaly,
      confidenceScore: avgConfidence,
      consensusScore,
      severityLevel: this.calculateSeverity(consensusScore),
      explanation: this.generateFusedExplanation(results, 'voting'),
      contributingMethods: results.map((r, i) => `method_${i}`),
      methodScores: this.extractMethodScores(results),
      recommendations: this.generateRecommendations(results, isAnomaly)
    };
  }

  private static weightedFusion(results: any[]): FusedAnomalyResult {
    // Define weights based on method reliability
    const weights = this.calculateMethodWeights(results);
    
    let weightedScore = 0;
    let weightedConfidence = 0;
    let totalWeight = 0;
    
    results.forEach((result, index) => {
      const weight = weights[index] || 1;
      const score = result.score || result.finalScore || (result.isAnomaly ? 1 : 0);
      const confidence = result.confidence || 0.5;
      
      weightedScore += score * weight;
      weightedConfidence += confidence * weight;
      totalWeight += weight;
    });
    
    const finalScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const finalConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : 0;
    
    return {
      isAnomaly: finalScore > 0.6,
      confidenceScore: finalConfidence,
      consensusScore: this.calculateConsensus(results),
      severityLevel: this.calculateSeverity(finalScore),
      explanation: this.generateFusedExplanation(results, 'weighted'),
      contributingMethods: results.map((r, i) => `method_${i}`),
      methodScores: this.extractMethodScores(results),
      recommendations: this.generateRecommendations(results, finalScore > 0.6)
    };
  }

  private static stackingFusion(results: any[]): FusedAnomalyResult {
    // Simplified stacking - use weighted average with performance-based weights
    const performanceWeights = results.map(r => r.performance?.accuracy || 0.8);
    const totalPerformanceWeight = performanceWeights.reduce((sum, w) => sum + w, 0);
    
    let stackedScore = 0;
    let stackedConfidence = 0;
    
    results.forEach((result, index) => {
      const weight = performanceWeights[index] / totalPerformanceWeight;
      const score = result.score || result.finalScore || (result.isAnomaly ? 1 : 0);
      const confidence = result.confidence || 0.5;
      
      stackedScore += score * weight;
      stackedConfidence += confidence * weight;
    });
    
    return {
      isAnomaly: stackedScore > 0.7,
      confidenceScore: stackedConfidence,
      consensusScore: this.calculateConsensus(results),
      severityLevel: this.calculateSeverity(stackedScore),
      explanation: this.generateFusedExplanation(results, 'stacking'),
      contributingMethods: results.map((r, i) => `method_${i}`),
      methodScores: this.extractMethodScores(results),
      recommendations: this.generateRecommendations(results, stackedScore > 0.7)
    };
  }

  private static adaptiveFusion(results: any[]): FusedAnomalyResult {
    // Adaptive fusion based on result confidence and consensus
    const highConfidenceResults = results.filter(r => (r.confidence || 0.5) > 0.8);
    
    if (highConfidenceResults.length > 0) {
      // Use high-confidence results with higher weight
      return this.weightedFusion(highConfidenceResults);
    } else {
      // Fall back to voting when confidence is low
      return this.votingFusion(results);
    }
  }

  private static calculateMethodWeights(results: any[]): number[] {
    return results.map((result, index) => {
      // Weight based on confidence and method type
      const confidence = result.confidence || 0.5;
      const methodBonus = result.method?.includes('ensemble') ? 1.2 : 1.0;
      return confidence * methodBonus;
    });
  }

  private static calculateConsensus(results: any[]): number {
    if (results.length === 0) return 0;
    
    const decisions = results.map(r => r.isAnomaly || r.finalDecision ? 1 : 0);
    const mean = decisions.reduce((sum, val) => sum + val, 0) / decisions.length;
    const variance = decisions.reduce((sum, val) => sum + (val - mean) ** 2, 0) / decisions.length;
    
    return 1 - Math.sqrt(variance); // Higher consensus = lower variance
  }

  private static calculateSeverity(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 0.3) return 'LOW';
    if (score < 0.6) return 'MEDIUM';
    if (score < 0.9) return 'HIGH';
    return 'CRITICAL';
  }

  private static extractMethodScores(results: any[]): { [method: string]: number } {
    const scores: { [method: string]: number } = {};
    
    results.forEach((result, index) => {
      const methodName = result.method || result.algorithm || `method_${index}`;
      scores[methodName] = result.score || result.finalScore || (result.isAnomaly ? 1 : 0);
    });
    
    return scores;
  }

  private static generateFusedExplanation(results: any[], strategy: string): string[] {
    const explanations = [`Fusion strategy: ${strategy}`];
    
    const anomalyCount = results.filter(r => r.isAnomaly || r.finalDecision).length;
    explanations.push(`${anomalyCount}/${results.length} methods detected anomaly`);
    
    // Extract key explanations from individual methods
    const allExplanations = results.flatMap(r => r.explanation || []);
    const uniqueExplanations = [...new Set(allExplanations)];
    
    if (uniqueExplanations.length > 0) {
      explanations.push(`Key findings: ${uniqueExplanations.slice(0, 3).join(', ')}`);
    }
    
    return explanations;
  }

  private static generateRecommendations(results: any[], isAnomaly: boolean): string[] {
    const recommendations = [];
    
    if (isAnomaly) {
      recommendations.push('Immediate investigation recommended');
      recommendations.push('Review data sources and context');
      
      const highConfidenceResults = results.filter(r => (r.confidence || 0.5) > 0.8);
      if (highConfidenceResults.length > 0) {
        recommendations.push('High confidence detection - prioritize response');
      }
    } else {
      recommendations.push('Continue normal monitoring');
      
      const borderlineResults = results.filter(r => {
        const score = r.score || r.finalScore || 0;
        return score > 0.4 && score < 0.6;
      });
      
      if (borderlineResults.length > 0) {
        recommendations.push('Monitor closely for pattern changes');
      }
    }
    
    return recommendations;
  }

  private static createEmptyResult(): FusedAnomalyResult {
    return {
      isAnomaly: false,
      confidenceScore: 0,
      consensusScore: 0,
      severityLevel: 'LOW',
      explanation: ['No detection results available'],
      contributingMethods: [],
      methodScores: {},
      recommendations: ['Unable to process - check data quality']
    };
  }
}

// Main Detection Orchestrator
export class DetectionOrchestrator extends EventEmitter {
  private deepLearningService: DeepLearningDetectionService;
  private ensembleService: EnsembleDetectionService;
  private timeSeriesService: TimeSeriesAnalysisService;
  private multivariateService: MultivariateDetectionService;
  private patternRecognitionEngine: PatternRecognitionEngine;
  
  private config: PipelineConfig;
  private performanceHistory: Map<string, ModelPerformanceHistory> = new Map();
  private requestQueue: DetectionRequest[] = [];
  private isProcessing: boolean = false;
  private isInitialized: boolean = false;

  constructor(config?: Partial<PipelineConfig>) {
    super();
    
    this.config = {
      defaultMethods: ['ensemble', 'deep_learning'],
      fusionStrategy: 'adaptive',
      qualityThreshold: 0.8,
      performanceWeights: {
        'deep_learning': 1.2,
        'ensemble': 1.0,
        'time_series': 0.9,
        'multivariate': 1.1,
        'pattern_recognition': 0.8
      },
      adaptiveLearning: true,
      resourceLimits: {
        maxProcessingTime: 30000, // 30 seconds
        maxMemoryUsage: 1024 * 1024 * 1024 // 1GB
      },
      ...config
    };

    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize all detection services
      this.deepLearningService = new DeepLearningDetectionService();
      this.ensembleService = new EnsembleDetectionService();
      this.timeSeriesService = new TimeSeriesAnalysisService();
      this.multivariateService = new MultivariateDetectionService();
      this.patternRecognitionEngine = new PatternRecognitionEngine();

      // Wait for all services to initialize
      await Promise.all([
        this.waitForServiceInitialization(this.deepLearningService),
        this.waitForServiceInitialization(this.ensembleService),
        this.waitForServiceInitialization(this.timeSeriesService),
        this.waitForServiceInitialization(this.multivariateService),
        this.waitForServiceInitialization(this.patternRecognitionEngine)
      ]);

      this.isInitialized = true;
      this.emit('initialized', {
        services: 5,
        config: this.config,
        timestamp: Date.now()
      });

      console.log('🎛️ Detection Orchestrator initialized with all services');
    } catch (error) {
      console.error('❌ Failed to initialize detection orchestrator:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  async detectAnomalies(request: DetectionRequest): Promise<DetectionResult> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    const startTime = Date.now();

    try {
      // Analyze data characteristics
      const analysis = DataCharacteristicsAnalyzer.analyzeData(request.data);
      
      // Select appropriate methods
      const selectedMethods = this.selectMethods(request, analysis);
      
      // Execute detection methods
      const methodResults = await this.executeDetectionMethods(
        request.data,
        selectedMethods,
        analysis,
        request.configuration
      );

      // Fuse results
      const fusedResult = ResultFusionEngine.fuseResults(methodResults, this.config.fusionStrategy);
      
      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(methodResults, startTime);
      
      // Update performance history
      if (this.config.adaptiveLearning) {
        this.updatePerformanceHistory(selectedMethods, performance);
      }

      const result: DetectionResult = {
        requestId: request.id,
        results: methodResults,
        fusedResult,
        performance,
        timestamp: Date.now(),
        processingTime: Date.now() - startTime
      };

      this.emit('detection_complete', {
        requestId: request.id,
        anomalyDetected: fusedResult.isAnomaly,
        confidence: fusedResult.confidenceScore,
        methodsUsed: selectedMethods,
        processingTime: result.processingTime,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('❌ Anomaly detection failed:', error);
      this.emit('error', { type: 'detection', error, requestId: request.id });
      throw error;
    }
  }

  private selectMethods(request: DetectionRequest, analysis: any): string[] {
    if (request.methods && request.methods.length > 0) {
      return request.methods;
    }

    // Use recommended methods from data analysis
    let methods = [...analysis.recommendedMethods];
    
    // Add default methods if not present
    for (const defaultMethod of this.config.defaultMethods) {
      if (!methods.includes(defaultMethod)) {
        methods.push(defaultMethod);
      }
    }

    // Limit methods based on priority and resources
    if (request.priority === 'critical') {
      methods = [...methods, 'deep_learning', 'ensemble']; // Use all available
    } else if (request.priority === 'low') {
      methods = methods.slice(0, 2); // Limit to top 2 methods
    }

    return [...new Set(methods)]; // Remove duplicates
  }

  private async executeDetectionMethods(
    data: any,
    methods: string[],
    analysis: any,
    configuration?: any
  ): Promise<any[]> {
    const results = [];
    const executionPromises = [];

    for (const method of methods) {
      const promise = this.executeMethod(method, data, analysis, configuration)
        .catch(error => {
          console.warn(`⚠️ Method ${method} failed:`, error);
          return { error: error.message, method };
        });
      
      executionPromises.push(promise);
    }

    const methodResults = await Promise.all(executionPromises);
    
    // Filter out failed methods
    return methodResults.filter(result => !result.error);
  }

  private async executeMethod(method: string, data: any, analysis: any, configuration?: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (method) {
        case 'deep_learning':
          result = await this.executeDeepLearning(data, analysis);
          break;
        case 'ensemble':
          result = await this.executeEnsemble(data, analysis);
          break;
        case 'time_series':
          result = await this.executeTimeSeries(data, analysis);
          break;
        case 'multivariate':
          result = await this.executeMultivariate(data, analysis);
          break;
        case 'pattern_recognition':
          result = await this.executePatternRecognition(data, analysis);
          break;
        default:
          throw new Error(`Unknown method: ${method}`);
      }

      // Add method metadata
      result.method = method;
      result.executionTime = Date.now() - startTime;
      
      return result;
    } catch (error) {
      console.error(`❌ Method ${method} execution failed:`, error);
      throw error;
    }
  }

  private async executeDeepLearning(data: any, analysis: any): Promise<any> {
    if (analysis.type === 'univariate' && Array.isArray(data)) {
      return await this.deepLearningService.detectAnomalies(data, 'autoencoder');
    } else if (analysis.type === 'timeseries') {
      const values = data.map((d: any) => d.value || 0);
      return await this.deepLearningService.detectSequenceAnomaly([values]);
    } else {
      // Convert to numeric array for processing
      const numericData = this.convertToNumericArray(data);
      return await this.deepLearningService.detectAnomalies(numericData, 'all');
    }
  }

  private async executeEnsemble(data: any, analysis: any): Promise<any> {
    const numericData = this.convertToNumericArray(data);
    return await this.ensembleService.detectAnomalies(numericData);
  }

  private async executeTimeSeries(data: any, analysis: any): Promise<any> {
    let timeSeriesData;
    
    if (analysis.type === 'timeseries') {
      timeSeriesData = data;
    } else {
      // Convert to time series format
      timeSeriesData = Array.isArray(data) ? 
        data.map((value, index) => ({
          timestamp: Date.now() + index * 3600000, // Hourly intervals
          value: typeof value === 'number' ? value : 0
        })) : [];
    }
    
    const results = await this.timeSeriesService.analyzeTimeSeries(timeSeriesData);
    
    // Convert to consistent format
    return {
      results,
      isAnomaly: results.some(r => r.isAnomaly),
      score: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      confidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    };
  }

  private async executeMultivariate(data: any, analysis: any): Promise<any> {
    let multivariateData;
    
    if (analysis.type === 'multivariate') {
      multivariateData = data;
    } else {
      // Convert to multivariate format
      multivariateData = Array.isArray(data) ? 
        data.map((value, index) => ({
          features: typeof value === 'object' ? value : { value: value },
          timestamp: Date.now() + index * 1000
        })) : [];
    }
    
    // Train if not already trained
    if (multivariateData.length > 10) {
      const trainingData = multivariateData.slice(0, Math.floor(multivariateData.length * 0.7));
      await this.multivariateService.trainModels(trainingData);
    }
    
    const results = await this.multivariateService.detectAnomalies(multivariateData);
    
    return {
      results,
      isAnomaly: results.some(r => r.isAnomaly),
      score: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      confidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    };
  }

  private async executePatternRecognition(data: any, analysis: any): Promise<any> {
    if (analysis.type === 'graph') {
      const nodes = data.filter((item: any) => item.id);
      const edges = data.filter((item: any) => item.source && item.target);
      
      const results = await this.patternRecognitionEngine.analyzeGraphPatterns(nodes, edges);
      
      return {
        results,
        isAnomaly: results.some(r => r.isAnomaly),
        score: results.reduce((sum, r) => sum + r.score, 0) / results.length,
        confidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
      };
    } else {
      const numericData = this.convertToNumericArray(data);
      const results = await this.patternRecognitionEngine.analyzeSequencePatterns(numericData);
      
      return {
        results,
        isAnomaly: results.some(r => r.isAnomaly),
        score: results.reduce((sum, r) => sum + r.score, 0) / results.length,
        confidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
      };
    }
  }

  private convertToNumericArray(data: any): number[] {
    if (Array.isArray(data)) {
      return data.map(item => {
        if (typeof item === 'number') return item;
        if (typeof item === 'object' && item.value) return item.value;
        if (typeof item === 'object' && item.features) {
          const values = Object.values(item.features);
          return values.reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
        }
        return 0;
      });
    }
    
    return [0]; // Fallback
  }

  private calculatePerformanceMetrics(results: any[], startTime: number): PerformanceMetrics {
    const totalProcessingTime = Date.now() - startTime;
    const methodExecutionTimes: { [method: string]: number } = {};
    
    for (const result of results) {
      if (result.method && result.executionTime) {
        methodExecutionTimes[result.method] = result.executionTime;
      }
    }

    // Estimate memory usage (simplified)
    const memoryUsage = results.length * 1024 * 100; // Rough estimate
    
    // Performance metrics (would be calculated from validation data in practice)
    return {
      totalProcessingTime,
      methodExecutionTimes,
      memoryUsage,
      accuracy: 0.92,
      precision: 0.90,
      recall: 0.94,
      f1Score: 0.92
    };
  }

  private updatePerformanceHistory(methods: string[], performance: PerformanceMetrics): void {
    for (const method of methods) {
      if (!this.performanceHistory.has(method)) {
        this.performanceHistory.set(method, {
          method,
          accuracy: [],
          precision: [],
          recall: [],
          processingTime: [],
          timestamp: []
        });
      }

      const history = this.performanceHistory.get(method)!;
      history.accuracy.push(performance.accuracy);
      history.precision.push(performance.precision);
      history.recall.push(performance.recall);
      history.processingTime.push(performance.methodExecutionTimes[method] || 0);
      history.timestamp.push(Date.now());

      // Keep only recent history (last 100 entries)
      if (history.accuracy.length > 100) {
        history.accuracy.shift();
        history.precision.shift();
        history.recall.shift();
        history.processingTime.shift();
        history.timestamp.shift();
      }
    }
  }

  getOrchestrationStatistics(): any {
    return {
      config: this.config,
      isInitialized: this.isInitialized,
      servicesStatus: {
        deepLearning: !!this.deepLearningService,
        ensemble: !!this.ensembleService,
        timeSeries: !!this.timeSeriesService,
        multivariate: !!this.multivariateService,
        patternRecognition: !!this.patternRecognitionEngine
      },
      performanceHistory: Object.fromEntries(this.performanceHistory),
      queueSize: this.requestQueue.length,
      isProcessing: this.isProcessing,
      timestamp: Date.now()
    };
  }

  private async waitForServiceInitialization(service: EventEmitter): Promise<void> {
    return new Promise((resolve) => {
      if ((service as any).isInitialized) {
        resolve();
      } else {
        service.once('initialized', resolve);
      }
    });
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

export default DetectionOrchestrator;
