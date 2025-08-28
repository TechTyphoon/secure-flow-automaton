import { EventEmitter } from 'events';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';

/**
 * Production Anomaly Detection Service
 * Uses machine learning for real-time anomaly detection
 */

export interface AnomalyEvent {
  id: string;
  timestamp: string;
  type: 'security' | 'performance' | 'behavior' | 'network' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  source: string;
  details: any;
  metrics?: AnomalyMetrics;
  context?: any;
}

export interface AnomalyMetrics {
  deviation: number;
  zscore: number;
  percentile: number;
  baselineValue: number;
  observedValue: number;
  threshold: number;
}

export interface DetectionConfig {
  sensitivity: 'high' | 'medium' | 'low';
  windowSize: number;
  algorithms: string[];
  thresholds: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface BaselineProfile {
  metric: string;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: {
    p50: number;
    p95: number;
    p99: number;
  };
  lastUpdated: string;
}

export class AnomalyDetectionService extends EventEmitter {
  private model: tf.LayersModel | null = null;
  private baselines: Map<string, BaselineProfile> = new Map();
  private detectionConfig: DetectionConfig;
  private isInitialized: boolean = false;
  private dataBuffer: Map<string, number[]> = new Map();
  
  constructor(config?: Partial<DetectionConfig>) {
    super();
    this.detectionConfig = {
      sensitivity: config?.sensitivity || 'medium',
      windowSize: config?.windowSize || 100,
      algorithms: config?.algorithms || ['zscore', 'isolation-forest', 'lstm'],
      thresholds: config?.thresholds || {
        critical: 0.95,
        high: 0.85,
        medium: 0.70,
        low: 0.50
      }
    };
  }

  /**
   * Initialize the anomaly detection service
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Anomaly Detection Service...');
    
    // Load pre-trained model or create new one
    await this.loadModel();
    
    // Load historical baselines
    await this.loadBaselines();
    
    // Start monitoring
    this.startMonitoring();
    
    this.isInitialized = true;
    console.log('✅ Anomaly Detection Service initialized');
  }

  /**
   * Detect anomalies in real-time data
   */
  async detectAnomalies(data: any, source: string): Promise<AnomalyEvent[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const anomalies: AnomalyEvent[] = [];
    
    // Process each metric
    for (const [metric, value] of Object.entries(data)) {
      if (typeof value !== 'number') continue;
      
      // Update data buffer
      this.updateDataBuffer(metric, value);
      
      // Check against baseline
      const baseline = this.baselines.get(metric);
      if (!baseline) {
        await this.createBaseline(metric, value);
        continue;
      }
      
      // Run detection algorithms
      const anomalyScore = await this.calculateAnomalyScore(metric, value, baseline);
      
      if (anomalyScore > this.detectionConfig.thresholds.low) {
        const severity = this.determineSeverity(anomalyScore);
        const anomaly = this.createAnomalyEvent(
          metric,
          value,
          baseline,
          anomalyScore,
          severity,
          source
        );
        
        anomalies.push(anomaly);
        this.emit('anomaly', anomaly);
        
        // Update model with feedback
        await this.updateModel(metric, value, true);
      } else {
        // Update model with normal data
        await this.updateModel(metric, value, false);
      }
    }
    
    return anomalies;
  }

  /**
   * Analyze historical data for patterns
   */
  async analyzeHistoricalData(data: any[], timeRange: { start: Date; end: Date }): Promise<any> {
    const patterns = {
      periodicPatterns: [],
      trends: [],
      outliers: [],
      correlations: []
    };

    // Detect periodic patterns (daily, weekly, monthly)
    patterns.periodicPatterns = await this.detectPeriodicPatterns(data);
    
    // Detect trends
    patterns.trends = this.detectTrends(data);
    
    // Detect outliers
    patterns.outliers = this.detectOutliers(data);
    
    // Detect correlations between metrics
    patterns.correlations = this.detectCorrelations(data);
    
    return patterns;
  }

  /**
   * Train custom model on specific data
   */
  async trainModel(trainingData: any[], labels: number[]): Promise<void> {
    console.log('Training anomaly detection model...');
    
    // Prepare data
    const xs = tf.tensor2d(trainingData);
    const ys = tf.tensor1d(labels);
    
    // Create model architecture
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [trainingData[0].length], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    // Compile model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    // Train model
    await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}`);
        }
      }
    });
    
    // Save model
    await this.saveModel();
    
    // Clean up tensors
    xs.dispose();
    ys.dispose();
  }

  /**
   * Get current anomaly detection status
   */
  getStatus(): any {
    return {
      initialized: this.isInitialized,
      modelLoaded: this.model !== null,
      baselines: Array.from(this.baselines.keys()),
      config: this.detectionConfig,
      bufferSize: this.dataBuffer.size
    };
  }

  /**
   * Private methods
   */
  
  private async loadModel(): Promise<void> {
    try {
      // Try to load existing model
      const modelUrl = '/models/anomaly-detection/model.json';
      this.model = await tf.loadLayersModel(modelUrl);
      console.log('Loaded existing anomaly detection model');
    } catch (error) {
      console.log('No existing model found, will create new one when training data is available');
    }
  }
  
  private async saveModel(): Promise<void> {
    if (this.model) {
      await this.model.save('localstorage://anomaly-detection-model');
    }
  }
  
  private async loadBaselines(): Promise<void> {
    try {
      const response = await axios.get('/api/anomaly/baselines');
      response.data.baselines.forEach((baseline: BaselineProfile) => {
        this.baselines.set(baseline.metric, baseline);
      });
    } catch (error) {
      console.log('No existing baselines found, will create as data comes in');
    }
  }
  
  private startMonitoring(): void {
    // Set up periodic baseline updates
    setInterval(() => {
      this.updateBaselines();
    }, 60000); // Every minute
    
    // Set up model retraining
    setInterval(() => {
      this.retrainModel();
    }, 3600000); // Every hour
  }
  
  private updateDataBuffer(metric: string, value: number): void {
    if (!this.dataBuffer.has(metric)) {
      this.dataBuffer.set(metric, []);
    }
    
    const buffer = this.dataBuffer.get(metric)!;
    buffer.push(value);
    
    // Keep only recent data
    if (buffer.length > this.detectionConfig.windowSize) {
      buffer.shift();
    }
  }
  
  private async createBaseline(metric: string, initialValue: number): Promise<void> {
    const baseline: BaselineProfile = {
      metric,
      mean: initialValue,
      stdDev: 0,
      min: initialValue,
      max: initialValue,
      percentiles: {
        p50: initialValue,
        p95: initialValue,
        p99: initialValue
      },
      lastUpdated: new Date().toISOString()
    };
    
    this.baselines.set(metric, baseline);
  }
  
  private async calculateAnomalyScore(
    metric: string,
    value: number,
    baseline: BaselineProfile
  ): Promise<number> {
    const scores: number[] = [];
    
    // Z-score based detection
    if (this.detectionConfig.algorithms.includes('zscore')) {
      const zscore = Math.abs((value - baseline.mean) / (baseline.stdDev || 1));
      const zscoreAnomaly = this.normalizeScore(zscore / 4); // Normalize to 0-1
      scores.push(zscoreAnomaly);
    }
    
    // Isolation Forest detection (simplified)
    if (this.detectionConfig.algorithms.includes('isolation-forest')) {
      const isolationScore = this.calculateIsolationScore(value, baseline);
      scores.push(isolationScore);
    }
    
    // LSTM-based detection using the model
    if (this.detectionConfig.algorithms.includes('lstm') && this.model) {
      const buffer = this.dataBuffer.get(metric) || [];
      if (buffer.length >= 10) {
        const lstmScore = await this.predictWithModel(buffer.slice(-10));
        scores.push(lstmScore);
      }
    }
    
    // Combine scores (average for now, could use weighted average)
    return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
  }
  
  private calculateIsolationScore(value: number, baseline: BaselineProfile): number {
    // Simplified isolation score based on distance from normal range
    const range = baseline.max - baseline.min;
    if (range === 0) return 0;
    
    let score = 0;
    if (value < baseline.min) {
      score = (baseline.min - value) / range;
    } else if (value > baseline.max) {
      score = (value - baseline.max) / range;
    }
    
    return Math.min(1, score);
  }
  
  private async predictWithModel(data: number[]): Promise<number> {
    if (!this.model) return 0;
    
    const input = tf.tensor2d([data]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const score = await prediction.data();
    
    input.dispose();
    prediction.dispose();
    
    return score[0];
  }
  
  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(1, score));
  }
  
  private determineSeverity(score: number): AnomalyEvent['severity'] {
    if (score >= this.detectionConfig.thresholds.critical) return 'critical';
    if (score >= this.detectionConfig.thresholds.high) return 'high';
    if (score >= this.detectionConfig.thresholds.medium) return 'medium';
    return 'low';
  }
  
  private createAnomalyEvent(
    metric: string,
    value: number,
    baseline: BaselineProfile,
    score: number,
    severity: AnomalyEvent['severity'],
    source: string
  ): AnomalyEvent {
    const zscore = (value - baseline.mean) / (baseline.stdDev || 1);
    
    return {
      id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: this.classifyAnomalyType(metric),
      severity,
      confidence: score,
      source,
      details: {
        metric,
        value,
        baseline: {
          mean: baseline.mean,
          stdDev: baseline.stdDev,
          min: baseline.min,
          max: baseline.max
        }
      },
      metrics: {
        deviation: Math.abs(value - baseline.mean),
        zscore,
        percentile: this.calculatePercentile(value, baseline),
        baselineValue: baseline.mean,
        observedValue: value,
        threshold: this.detectionConfig.thresholds[severity]
      }
    };
  }
  
  private classifyAnomalyType(metric: string): AnomalyEvent['type'] {
    if (metric.includes('security') || metric.includes('threat')) return 'security';
    if (metric.includes('cpu') || metric.includes('memory') || metric.includes('latency')) return 'performance';
    if (metric.includes('user') || metric.includes('session')) return 'behavior';
    if (metric.includes('network') || metric.includes('traffic')) return 'network';
    return 'system';
  }
  
  private calculatePercentile(value: number, baseline: BaselineProfile): number {
    // Simplified percentile calculation
    if (value <= baseline.min) return 0;
    if (value >= baseline.max) return 100;
    
    const range = baseline.max - baseline.min;
    return ((value - baseline.min) / range) * 100;
  }
  
  private async updateModel(metric: string, value: number, isAnomaly: boolean): Promise<void> {
    // Store training data for periodic model updates
    // This would typically be stored in a database
  }
  
  private async updateBaselines(): Promise<void> {
    for (const [metric, buffer] of this.dataBuffer.entries()) {
      if (buffer.length < 10) continue;
      
      const baseline = this.baselines.get(metric);
      if (!baseline) continue;
      
      // Calculate new statistics
      const mean = buffer.reduce((a, b) => a + b) / buffer.length;
      const variance = buffer.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / buffer.length;
      const stdDev = Math.sqrt(variance);
      const sorted = [...buffer].sort((a, b) => a - b);
      
      baseline.mean = mean;
      baseline.stdDev = stdDev;
      baseline.min = Math.min(baseline.min, Math.min(...buffer));
      baseline.max = Math.max(baseline.max, Math.max(...buffer));
      baseline.percentiles = {
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      };
      baseline.lastUpdated = new Date().toISOString();
    }
  }
  
  private async retrainModel(): Promise<void> {
    // Periodically retrain the model with new data
    // This would fetch recent data and labels from the database
  }
  
  private async detectPeriodicPatterns(data: any[]): Promise<any[]> {
    // Implement FFT or autocorrelation for periodic pattern detection
    return [];
  }
  
  private detectTrends(data: any[]): any[] {
    // Implement trend detection using linear regression or similar
    return [];
  }
  
  private detectOutliers(data: any[]): any[] {
    // Implement outlier detection using IQR or other methods
    return [];
  }
  
  private detectCorrelations(data: any[]): any[] {
    // Implement correlation detection between different metrics
    return [];
  }
}