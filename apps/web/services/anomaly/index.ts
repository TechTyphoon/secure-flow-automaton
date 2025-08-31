/**
 * Phase 5.3 Advanced Anomaly Detection - Integration Index
 * Centralized exports and service registry for anomaly detection system
 */

// Core detection services
export { default as DeepLearningDetectionService } from './deepLearningDetection';
export { default as EnsembleDetectionService } from './ensembleDetection';
export { default as TimeSeriesAnalysisService } from './timeSeriesAnalysis';
export { default as MultivariateDetectionService } from './multivariateDetection';
export { default as PatternRecognitionEngine } from './patternRecognition';

// Orchestration and management
export { DetectionOrchestrator } from './detectionOrchestrator';

import DeepLearningDetectionService from './deepLearningDetection';
import EnsembleDetectionService from './ensembleDetection';
import TimeSeriesAnalysisService from './timeSeriesAnalysis';
import MultivariateDetectionService from './multivariateDetection';
import PatternRecognitionEngine from './patternRecognition';
import { DetectionOrchestrator } from './detectionOrchestrator';

// Type definitions
export interface AnomalyDetectionConfig {
  methods: string[];
  threshold: number;
  adaptiveLearning: boolean;
  realTimeProcessing: boolean;
  ensembleStrategy: 'voting' | 'weighted' | 'stacking' | 'adaptive';
  resourceLimits: {
    maxProcessingTime: number;
    maxMemoryUsage: number;
  };
}

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  confidence: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string[];
  recommendations: string[];
  timestamp: number;
  processingTime: number;
}

export interface DetectionPipeline {
  id: string;
  name: string;
  methods: string[];
  dataTypes: string[];
  isActive: boolean;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}

// Service factory for easy instantiation
export class AnomalyDetectionFactory {
  static createOrchestrator(config?: Partial<AnomalyDetectionConfig>): DetectionOrchestrator {
    return new DetectionOrchestrator({
      defaultMethods: config?.methods || ['ensemble', 'deep_learning'],
      fusionStrategy: config?.ensembleStrategy || 'adaptive',
      qualityThreshold: config?.threshold || 0.8,
      adaptiveLearning: config?.adaptiveLearning ?? true,
      resourceLimits: config?.resourceLimits || {
        maxProcessingTime: 30000,
        maxMemoryUsage: 1024 * 1024 * 1024
      }
    });
  }

  static createDeepLearningService(): DeepLearningDetectionService {
    return new DeepLearningDetectionService();
  }

  static createEnsembleService(): EnsembleDetectionService {
    return new EnsembleDetectionService();
  }

  static createTimeSeriesService(): TimeSeriesAnalysisService {
    return new TimeSeriesAnalysisService();
  }

  static createMultivariateService(): MultivariateDetectionService {
    return new MultivariateDetectionService();
  }

  static createPatternRecognitionEngine(): PatternRecognitionEngine {
    return new PatternRecognitionEngine();
  }
}

// Default configuration presets
export const DEFAULT_CONFIGS = {
  LIGHTWEIGHT: {
    methods: ['ensemble'],
    threshold: 0.7,
    adaptiveLearning: false,
    realTimeProcessing: true,
    ensembleStrategy: 'voting' as const,
    resourceLimits: {
      maxProcessingTime: 5000,
      maxMemoryUsage: 256 * 1024 * 1024
    }
  },
  
  STANDARD: {
    methods: ['ensemble', 'deep_learning'],
    threshold: 0.8,
    adaptiveLearning: true,
    realTimeProcessing: true,
    ensembleStrategy: 'weighted' as const,
    resourceLimits: {
      maxProcessingTime: 15000,
      maxMemoryUsage: 512 * 1024 * 1024
    }
  },
  
  COMPREHENSIVE: {
    methods: ['deep_learning', 'ensemble', 'time_series', 'multivariate', 'pattern_recognition'],
    threshold: 0.85,
    adaptiveLearning: true,
    realTimeProcessing: false,
    ensembleStrategy: 'adaptive' as const,
    resourceLimits: {
      maxProcessingTime: 45000,
      maxMemoryUsage: 2 * 1024 * 1024 * 1024
    }
  },
  
  HIGH_PRECISION: {
    methods: ['deep_learning', 'multivariate', 'pattern_recognition'],
    threshold: 0.9,
    adaptiveLearning: true,
    realTimeProcessing: false,
    ensembleStrategy: 'stacking' as const,
    resourceLimits: {
      maxProcessingTime: 60000,
      maxMemoryUsage: 4 * 1024 * 1024 * 1024
    }
  }
};

// Utility functions
export class AnomalyDetectionUtils {
  static validateDataFormat(data: DetectionData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data) {
      errors.push('Data is required');
    } else if (!Array.isArray(data) && typeof data !== 'object') {
      errors.push('Data must be an array or object');
    } else if (Array.isArray(data) && data.length === 0) {
      errors.push('Data array cannot be empty');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static formatDetectionRequest(data: DetectionData, options?: DetectionOptions): DetectionRequest {
    return {
      id: options?.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      dataType: this.inferDataType(data),
      priority: options?.priority || 'medium',
      methods: options?.methods,
      configuration: options?.configuration,
      metadata: {
        timestamp: Date.now(),
        source: options?.source || 'unknown',
        ...options?.metadata
      }
    };
  }

  static inferDataType(data: DetectionData): 'univariate' | 'multivariate' | 'timeseries' | 'graph' | 'mixed' {
    if (!Array.isArray(data)) {
      return 'mixed';
    }

    if (data.length === 0) {
      return 'univariate';
    }

    const firstElement = data[0];
    
    if (typeof firstElement === 'number') {
      return 'univariate';
    }
    
    if (typeof firstElement === 'object') {
      if ('timestamp' in firstElement && 'value' in firstElement) {
        return 'timeseries';
      }
      
      if ('features' in firstElement) {
        return 'multivariate';
      }
      
      if ('id' in firstElement || 'source' in firstElement) {
        return 'graph';
      }
    }
    
    return 'mixed';
  }

  static benchmarkPerformance(results: AnomalyResult[]): {
    averageProcessingTime: number;
    averageConfidence: number;
    anomalyRate: number;
    severityDistribution: { [key: string]: number };
  } {
    if (results.length === 0) {
      return {
        averageProcessingTime: 0,
        averageConfidence: 0,
        anomalyRate: 0,
        severityDistribution: {}
      };
    }

    const totalProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0);
    const totalConfidence = results.reduce((sum, r) => sum + r.confidence, 0);
    const anomalies = results.filter(r => r.isAnomaly);
    
    const severityDistribution: { [key: string]: number } = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    };
    
    results.forEach(r => {
      severityDistribution[r.severity]++;
    });

    return {
      averageProcessingTime: totalProcessingTime / results.length,
      averageConfidence: totalConfidence / results.length,
      anomalyRate: anomalies.length / results.length,
      severityDistribution
    };
  }
}

// Quick start helper
export async function quickDetect(
  data: DetectionData, 
  config: 'LIGHTWEIGHT' | 'STANDARD' | 'COMPREHENSIVE' | 'HIGH_PRECISION' = 'STANDARD'
): Promise<AnomalyResult> {
  const orchestrator = AnomalyDetectionFactory.createOrchestrator(DEFAULT_CONFIGS[config]);
  const request = AnomalyDetectionUtils.formatDetectionRequest(data);
  
  try {
    const result = await orchestrator.detectAnomalies(request);
    
    return {
      isAnomaly: result.fusedResult.isAnomaly,
      score: result.fusedResult.consensusScore,
      confidence: result.fusedResult.confidenceScore,
      severity: result.fusedResult.severityLevel,
      explanation: result.fusedResult.explanation,
      recommendations: result.fusedResult.recommendations,
      timestamp: result.timestamp,
      processingTime: result.processingTime
    };
  } catch (error) {
    console.error('Quick detection failed:', error);
    throw error;
  }
}

// Type definitions for anomaly detection
type DetectionData = number[] | Record<string, unknown>[] | unknown;

interface DetectionOptions {
  id?: string;
  priority?: string;
  methods?: string[];
  configuration?: Record<string, unknown>;
  source?: string;
  metadata?: Record<string, unknown>;
}

interface DetectionRequest {
  id: string;
  data: DetectionData;
  dataType: 'univariate' | 'multivariate' | 'timeseries' | 'graph' | 'mixed';
  priority: string;
  methods?: string[];
  configuration?: Record<string, unknown>;
  metadata: {
    timestamp: number;
    source: string;
    [key: string]: unknown;
  };
}

// Export everything for easy imports
export default {
  // Services
  DeepLearningDetectionService,
  EnsembleDetectionService,
  TimeSeriesAnalysisService,
  MultivariateDetectionService,
  PatternRecognitionEngine,
  DetectionOrchestrator,
  
  // Factory
  AnomalyDetectionFactory,
  
  // Utilities
  AnomalyDetectionUtils,
  quickDetect,
  
  // Configurations
  DEFAULT_CONFIGS
};
