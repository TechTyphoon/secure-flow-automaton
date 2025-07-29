/**
 * Time Series Anomaly Analysis Service
 * Advanced temporal pattern recognition and forecasting for anomaly detection
 */

import { EventEmitter } from 'events';

// Interfaces for time series analysis
interface TimeSeriesData {
  timestamp: number;
  value: number;
  metadata?: any;
}

interface SeasonalComponents {
  trend: number[];
  seasonal: number[];
  residual: number[];
  originalSeries: number[];
}

interface ChangePoint {
  timestamp: number;
  index: number;
  confidence: number;
  type: 'mean' | 'variance' | 'trend' | 'seasonal';
  magnitude: number;
}

interface ForecastResult {
  predictions: number[];
  upperBound: number[];
  lowerBound: number[];
  confidence: number[];
  timestamps: number[];
}

interface AnomalyDetectionResult {
  isAnomaly: boolean;
  score: number;
  confidence: number;
  type: 'point' | 'contextual' | 'collective';
  explanation: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  changePoints?: ChangePoint[];
  forecast?: ForecastResult;
}

interface ModelParameters {
  method: 'arima' | 'prophet' | 'seasonal_decompose' | 'changepoint' | 'ensemble';
  seasonality: 'auto' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
  trendMethod: 'linear' | 'exponential' | 'additive' | 'multiplicative';
  anomalyThreshold: number;
  confidenceLevel: number;
}

// Statistical utility functions
class StatUtils {
  static mean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  static variance(values: number[]): number {
    const mean = this.mean(values);
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  static standardDeviation(values: number[]): number {
    return Math.sqrt(this.variance(values));
  }

  static autocorrelation(values: number[], lag: number): number {
    if (lag >= values.length) return 0;
    
    const mean = this.mean(values);
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < values.length - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
    }

    for (let i = 0; i < values.length; i++) {
      denominator += Math.pow(values[i] - mean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  static movingAverage(values: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(values.length, i + Math.ceil(window / 2));
      const subset = values.slice(start, end);
      result.push(this.mean(subset));
    }
    return result;
  }

  static exponentialSmoothing(values: number[], alpha: number = 0.3): number[] {
    const result: number[] = [values[0]];
    for (let i = 1; i < values.length; i++) {
      result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
    }
    return result;
  }
}

// ARIMA model implementation (simplified)
class ARIMAModel {
  private ar: number[];
  private ma: number[];
  private d: number;
  private residuals: number[] = [];

  constructor(p: number = 1, d: number = 1, q: number = 1) {
    this.ar = new Array(p).fill(0).map(() => Math.random() * 0.1);
    this.ma = new Array(q).fill(0).map(() => Math.random() * 0.1);
    this.d = d;
  }

  fit(data: number[]): void {
    // Simplified ARIMA fitting (in practice, would use MLE)
    const differenced = this.difference(data, this.d);
    
    // Estimate AR parameters using Yule-Walker equations
    this.estimateARParameters(differenced);
    
    // Calculate residuals
    this.residuals = this.calculateResiduals(differenced);
  }

  private difference(data: number[], order: number): number[] {
    let result = [...data];
    for (let d = 0; d < order; d++) {
      const newResult: number[] = [];
      for (let i = 1; i < result.length; i++) {
        newResult.push(result[i] - result[i - 1]);
      }
      result = newResult;
    }
    return result;
  }

  private estimateARParameters(data: number[]): void {
    // Simplified parameter estimation using autocorrelations
    for (let i = 0; i < this.ar.length; i++) {
      const lag = i + 1;
      this.ar[i] = StatUtils.autocorrelation(data, lag) * 0.8; // Damping factor
    }
  }

  private calculateResiduals(data: number[]): number[] {
    const residuals: number[] = [];
    
    for (let t = Math.max(this.ar.length, this.ma.length); t < data.length; t++) {
      let predicted = 0;
      
      // AR component
      for (let i = 0; i < this.ar.length; i++) {
        if (t - i - 1 >= 0) {
          predicted += this.ar[i] * data[t - i - 1];
        }
      }
      
      // MA component (simplified)
      for (let i = 0; i < this.ma.length && i < residuals.length; i++) {
        predicted += this.ma[i] * residuals[residuals.length - 1 - i];
      }
      
      const residual = data[t] - predicted;
      residuals.push(residual);
    }
    
    return residuals;
  }

  forecast(steps: number): ForecastResult {
    const predictions: number[] = [];
    const upperBound: number[] = [];
    const lowerBound: number[] = [];
    const confidence: number[] = [];
    const timestamps: number[] = [];

    const residualStd = StatUtils.standardDeviation(this.residuals);
    const baseTime = Date.now();

    for (let h = 1; h <= steps; h++) {
      // Simple forecast (simplified ARIMA prediction)
      let prediction = 0;
      
      // Use last AR values for prediction
      for (let i = 0; i < this.ar.length; i++) {
        prediction += this.ar[i] * (predictions[h - 2 - i] || 0);
      }

      predictions.push(prediction);
      
      // Calculate prediction intervals
      const intervalWidth = 1.96 * residualStd * Math.sqrt(h); // 95% confidence
      upperBound.push(prediction + intervalWidth);
      lowerBound.push(prediction - intervalWidth);
      confidence.push(Math.max(0, 1 - (intervalWidth / Math.abs(prediction + 0.01))));
      timestamps.push(baseTime + h * 3600000); // Hourly intervals
    }

    return {
      predictions,
      upperBound,
      lowerBound,
      confidence,
      timestamps
    };
  }

  detectAnomalies(data: number[], threshold: number = 2.5): boolean[] {
    const anomalies: boolean[] = new Array(data.length).fill(false);
    
    if (this.residuals.length === 0) {
      this.fit(data);
    }

    const residualStd = StatUtils.standardDeviation(this.residuals);
    const residualMean = StatUtils.mean(this.residuals);

    // Mark points with residuals exceeding threshold
    for (let i = 0; i < this.residuals.length; i++) {
      const zScore = Math.abs(this.residuals[i] - residualMean) / residualStd;
      if (zScore > threshold) {
        const originalIndex = i + Math.max(this.ar.length, this.ma.length);
        if (originalIndex < anomalies.length) {
          anomalies[originalIndex] = true;
        }
      }
    }

    return anomalies;
  }
}

// Seasonal decomposition
class SeasonalDecomposition {
  static decompose(data: number[], period: number = 24): SeasonalComponents {
    const trend = this.extractTrend(data, period);
    const detrended = data.map((val, i) => val - trend[i]);
    const seasonal = this.extractSeasonal(detrended, period);
    const residual = data.map((val, i) => val - trend[i] - seasonal[i % period]);

    return {
      trend,
      seasonal,
      residual,
      originalSeries: [...data]
    };
  }

  private static extractTrend(data: number[], period: number): number[] {
    // Use centered moving average for trend extraction
    const windowSize = period % 2 === 0 ? period + 1 : period;
    return StatUtils.movingAverage(data, windowSize);
  }

  private static extractSeasonal(data: number[], period: number): number[] {
    const seasonal: number[] = new Array(period).fill(0);
    const counts: number[] = new Array(period).fill(0);

    // Calculate average for each seasonal component
    for (let i = 0; i < data.length; i++) {
      const seasonIndex = i % period;
      seasonal[seasonIndex] += data[i];
      counts[seasonIndex]++;
    }

    // Normalize by count
    for (let i = 0; i < period; i++) {
      seasonal[i] = counts[i] > 0 ? seasonal[i] / counts[i] : 0;
    }

    // Center the seasonal component
    const seasonalMean = StatUtils.mean(seasonal);
    return seasonal.map(val => val - seasonalMean);
  }
}

// Changepoint detection
class ChangePointDetection {
  static detectChangePoints(data: number[], method: 'cusum' | 'binary_segmentation' | 'pelt' = 'cusum'): ChangePoint[] {
    switch (method) {
      case 'cusum':
        return this.cusumDetection(data);
      case 'binary_segmentation':
        return this.binarySegmentation(data);
      case 'pelt':
        return this.peltDetection(data);
      default:
        return this.cusumDetection(data);
    }
  }

  private static cusumDetection(data: number[], threshold: number = 3): ChangePoint[] {
    const changePoints: ChangePoint[] = [];
    const mean = StatUtils.mean(data);
    const std = StatUtils.standardDeviation(data);
    
    let posSum = 0;
    let negSum = 0;
    
    for (let i = 1; i < data.length; i++) {
      const standardized = (data[i] - mean) / std;
      
      posSum = Math.max(0, posSum + standardized - 0.5);
      negSum = Math.max(0, negSum - standardized - 0.5);
      
      if (posSum > threshold || negSum > threshold) {
        const magnitude = Math.max(posSum, negSum);
        changePoints.push({
          timestamp: Date.now() + i * 3600000, // Hourly intervals
          index: i,
          confidence: Math.min(magnitude / threshold, 1),
          type: 'mean',
          magnitude
        });
        
        // Reset sums after detection
        posSum = 0;
        negSum = 0;
      }
    }
    
    return changePoints;
  }

  private static binarySegmentation(data: number[], minSegmentLength: number = 10): ChangePoint[] {
    const changePoints: ChangePoint[] = [];
    this.segmentRecursively(data, 0, data.length - 1, minSegmentLength, changePoints);
    return changePoints;
  }

  private static segmentRecursively(
    data: number[], 
    start: number, 
    end: number, 
    minLength: number, 
    changePoints: ChangePoint[]
  ): void {
    if (end - start < 2 * minLength) return;

    let maxStatistic = 0;
    let bestSplit = -1;

    for (let split = start + minLength; split <= end - minLength; split++) {
      const leftSegment = data.slice(start, split);
      const rightSegment = data.slice(split, end + 1);
      
      const leftMean = StatUtils.mean(leftSegment);
      const rightMean = StatUtils.mean(rightSegment);
      const leftVar = StatUtils.variance(leftSegment);
      const rightVar = StatUtils.variance(rightSegment);
      
      // Calculate test statistic for mean change
      const pooledVar = (leftVar * leftSegment.length + rightVar * rightSegment.length) / 
                       (leftSegment.length + rightSegment.length);
      const statistic = Math.abs(leftMean - rightMean) / Math.sqrt(pooledVar);
      
      if (statistic > maxStatistic) {
        maxStatistic = statistic;
        bestSplit = split;
      }
    }

    if (maxStatistic > 2.5) { // Threshold for significance
      changePoints.push({
        timestamp: Date.now() + bestSplit * 3600000,
        index: bestSplit,
        confidence: Math.min(maxStatistic / 5, 1),
        type: 'mean',
        magnitude: maxStatistic
      });

      // Recursively segment left and right parts
      this.segmentRecursively(data, start, bestSplit - 1, minLength, changePoints);
      this.segmentRecursively(data, bestSplit, end, minLength, changePoints);
    }
  }

  private static peltDetection(data: number[], penalty: number = 5): ChangePoint[] {
    // Simplified PELT (Pruned Exact Linear Time) implementation
    const n = data.length;
    const costs: number[] = new Array(n + 1).fill(Infinity);
    const changePoints: number[] = new Array(n + 1).fill(-1);
    costs[0] = 0;

    for (let t = 1; t <= n; t++) {
      for (let s = 0; s < t; s++) {
        const segmentData = data.slice(s, t);
        const segmentCost = this.calculateSegmentCost(segmentData);
        const totalCost = costs[s] + segmentCost + penalty;
        
        if (totalCost < costs[t]) {
          costs[t] = totalCost;
          changePoints[t] = s;
        }
      }
    }

    // Extract change points
    const detectedChangePoints: ChangePoint[] = [];
    let current = n;
    
    while (changePoints[current] !== -1) {
      const cp = changePoints[current];
      if (cp > 0) {
        detectedChangePoints.unshift({
          timestamp: Date.now() + cp * 3600000,
          index: cp,
          confidence: 0.8, // Simplified confidence
          type: 'mean',
          magnitude: costs[current] - costs[cp]
        });
      }
      current = cp;
    }

    return detectedChangePoints;
  }

  private static calculateSegmentCost(segment: number[]): number {
    if (segment.length === 0) return 0;
    const variance = StatUtils.variance(segment);
    return segment.length * Math.log(variance + 1e-8); // Add small epsilon to avoid log(0)
  }
}

// Main Time Series Analysis Service
export class TimeSeriesAnalysisService extends EventEmitter {
  private models: Map<string, ARIMAModel> = new Map();
  private parameters: ModelParameters;
  private isInitialized: boolean = false;

  constructor(parameters?: Partial<ModelParameters>) {
    super();
    
    this.parameters = {
      method: 'ensemble',
      seasonality: 'auto',
      trendMethod: 'linear',
      anomalyThreshold: 2.5,
      confidenceLevel: 0.95,
      ...parameters
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize ARIMA models for different scenarios
      this.models.set('default', new ARIMAModel(2, 1, 1));
      this.models.set('seasonal', new ARIMAModel(1, 1, 1));
      this.models.set('trend', new ARIMAModel(3, 2, 1));

      this.isInitialized = true;
      this.emit('initialized', {
        models: this.models.size,
        parameters: this.parameters,
        timestamp: Date.now()
      });

      console.log('⏰ Time Series Analysis Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize time series service:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  async analyzeTimeSeries(data: TimeSeriesData[]): Promise<AnomalyDetectionResult[]> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    const startTime = Date.now();

    try {
      const values = data.map(d => d.value);
      const results: AnomalyDetectionResult[] = [];

      switch (this.parameters.method) {
        case 'arima':
          return this.arimaAnalysis(values, data);
        case 'prophet':
          return this.prophetAnalysis(values, data);
        case 'seasonal_decompose':
          return this.seasonalAnalysis(values, data);
        case 'changepoint':
          return this.changepointAnalysis(values, data);
        case 'ensemble':
          return this.ensembleAnalysis(values, data);
        default:
          return this.ensembleAnalysis(values, data);
      }
    } catch (error) {
      console.error('❌ Time series analysis failed:', error);
      this.emit('error', { type: 'analysis', error });
      throw error;
    }
  }

  private async arimaAnalysis(values: number[], data: TimeSeriesData[]): Promise<AnomalyDetectionResult[]> {
    const model = this.models.get('default')!;
    model.fit(values);
    
    const anomalies = model.detectAnomalies(values, this.parameters.anomalyThreshold);
    const forecast = model.forecast(24); // 24-hour forecast

    return anomalies.map((isAnomaly, index) => ({
      isAnomaly,
      score: isAnomaly ? 0.8 : 0.2,
      confidence: 0.85,
      type: 'point' as const,
      explanation: isAnomaly ? ['ARIMA residual exceeds threshold', 'Point anomaly detected'] : ['Normal data point'],
      severity: this.calculateSeverity(isAnomaly ? 0.8 : 0.2),
      forecast: index === anomalies.length - 1 ? forecast : undefined
    }));
  }

  private async prophetAnalysis(values: number[], data: TimeSeriesData[]): Promise<AnomalyDetectionResult[]> {
    // Simplified Prophet-like analysis
    const period = this.detectSeasonalPeriod(values);
    const decomposition = SeasonalDecomposition.decompose(values, period);
    
    // Detect anomalies in residuals
    const residualStd = StatUtils.standardDeviation(decomposition.residual);
    const residualMean = StatUtils.mean(decomposition.residual);
    
    return decomposition.residual.map((residual, index) => {
      const zScore = Math.abs(residual - residualMean) / residualStd;
      const isAnomaly = zScore > this.parameters.anomalyThreshold;
      const score = Math.min(zScore / this.parameters.anomalyThreshold, 1);
      
      return {
        isAnomaly,
        score,
        confidence: Math.min(zScore / 3, 1),
        type: 'contextual' as const,
        explanation: isAnomaly ? 
          [`Residual z-score: ${zScore.toFixed(2)}`, 'Seasonal pattern deviation'] : 
          ['Normal seasonal pattern'],
        severity: this.calculateSeverity(score)
      };
    });
  }

  private async seasonalAnalysis(values: number[], data: TimeSeriesData[]): Promise<AnomalyDetectionResult[]> {
    const period = this.detectSeasonalPeriod(values);
    const decomposition = SeasonalDecomposition.decompose(values, period);
    
    const results: AnomalyDetectionResult[] = [];
    
    for (let i = 0; i < values.length; i++) {
      const trendAnomaly = this.detectTrendAnomaly(decomposition.trend, i);
      const seasonalAnomaly = this.detectSeasonalAnomaly(decomposition.seasonal, i, period);
      const residualAnomaly = this.detectResidualAnomaly(decomposition.residual, i);
      
      const isAnomaly = trendAnomaly || seasonalAnomaly || residualAnomaly;
      const score = Math.min((Number(trendAnomaly) + Number(seasonalAnomaly) + Number(residualAnomaly)) / 3, 1);
      
      results.push({
        isAnomaly,
        score,
        confidence: 0.75,
        type: 'contextual',
        explanation: this.generateSeasonalExplanation(trendAnomaly, seasonalAnomaly, residualAnomaly),
        severity: this.calculateSeverity(score)
      });
    }
    
    return results;
  }

  private async changepointAnalysis(values: number[], data: TimeSeriesData[]): Promise<AnomalyDetectionResult[]> {
    const changePoints = ChangePointDetection.detectChangePoints(values);
    const results: AnomalyDetectionResult[] = new Array(values.length).fill(null).map(() => ({
      isAnomaly: false,
      score: 0.1,
      confidence: 0.5,
      type: 'point' as const,
      explanation: ['No change point detected'],
      severity: 'LOW' as const
    }));

    // Mark change points as anomalies
    for (const cp of changePoints) {
      if (cp.index < results.length) {
        results[cp.index] = {
          isAnomaly: true,
          score: 0.9,
          confidence: cp.confidence,
          type: 'collective',
          explanation: [`Change point detected: ${cp.type}`, `Magnitude: ${cp.magnitude.toFixed(2)}`],
          severity: this.calculateSeverity(0.9),
          changePoints: [cp]
        };
      }
    }

    return results;
  }

  private async ensembleAnalysis(values: number[], data: TimeSeriesData[]): Promise<AnomalyDetectionResult[]> {
    // Combine multiple methods
    const arimaResults = await this.arimaAnalysis(values, data);
    const prophetResults = await this.prophetAnalysis(values, data);
    const seasonalResults = await this.seasonalAnalysis(values, data);
    const changepointResults = await this.changepointAnalysis(values, data);

    const ensembleResults: AnomalyDetectionResult[] = [];

    for (let i = 0; i < values.length; i++) {
      const scores = [
        arimaResults[i]?.score || 0,
        prophetResults[i]?.score || 0,
        seasonalResults[i]?.score || 0,
        changepointResults[i]?.score || 0
      ];

      const confidences = [
        arimaResults[i]?.confidence || 0,
        prophetResults[i]?.confidence || 0,
        seasonalResults[i]?.confidence || 0,
        changepointResults[i]?.confidence || 0
      ];

      const ensembleScore = StatUtils.mean(scores);
      const ensembleConfidence = StatUtils.mean(confidences);
      const isAnomaly = ensembleScore > 0.6;

      const explanations: string[] = [];
      if (arimaResults[i]?.isAnomaly) explanations.push('ARIMA detected anomaly');
      if (prophetResults[i]?.isAnomaly) explanations.push('Seasonal analysis detected anomaly');
      if (seasonalResults[i]?.isAnomaly) explanations.push('Decomposition detected anomaly');
      if (changepointResults[i]?.isAnomaly) explanations.push('Change point detected');

      ensembleResults.push({
        isAnomaly,
        score: ensembleScore,
        confidence: ensembleConfidence,
        type: this.determineAnomalyType(arimaResults[i], prophetResults[i], changepointResults[i]),
        explanation: explanations.length > 0 ? explanations : ['Normal time series point'],
        severity: this.calculateSeverity(ensembleScore),
        changePoints: changepointResults[i]?.changePoints,
        forecast: arimaResults[i]?.forecast
      });
    }

    const processingTime = Date.now() - Date.now();
    this.emit('analysis_complete', {
      method: 'ensemble',
      anomaliesDetected: ensembleResults.filter(r => r.isAnomaly).length,
      totalPoints: ensembleResults.length,
      processingTime,
      timestamp: Date.now()
    });

    return ensembleResults;
  }

  private detectSeasonalPeriod(values: number[]): number {
    // Simple period detection using autocorrelation
    let maxCorrelation = 0;
    let bestPeriod = 24; // Default to daily

    for (let period = 12; period <= Math.min(values.length / 3, 168); period++) {
      const correlation = StatUtils.autocorrelation(values, period);
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }

    return bestPeriod;
  }

  private detectTrendAnomaly(trend: number[], index: number): boolean {
    if (index < 2 || index >= trend.length - 2) return false;
    
    const window = trend.slice(Math.max(0, index - 5), Math.min(trend.length, index + 6));
    const std = StatUtils.standardDeviation(window);
    const mean = StatUtils.mean(window);
    
    return Math.abs(trend[index] - mean) > 2 * std;
  }

  private detectSeasonalAnomaly(seasonal: number[], index: number, period: number): boolean {
    const seasonIndex = index % period;
    const seasonalValues = seasonal.filter((_, i) => i % period === seasonIndex);
    
    if (seasonalValues.length < 2) return false;
    
    const std = StatUtils.standardDeviation(seasonalValues);
    const mean = StatUtils.mean(seasonalValues);
    
    return Math.abs(seasonal[seasonIndex] - mean) > 2 * std;
  }

  private detectResidualAnomaly(residual: number[], index: number): boolean {
    const std = StatUtils.standardDeviation(residual);
    const mean = StatUtils.mean(residual);
    
    return Math.abs(residual[index] - mean) > 2.5 * std;
  }

  private generateSeasonalExplanation(trend: boolean, seasonal: boolean, residual: boolean): string[] {
    const explanations: string[] = [];
    
    if (trend) explanations.push('Trend component anomaly detected');
    if (seasonal) explanations.push('Seasonal component anomaly detected');
    if (residual) explanations.push('Residual component anomaly detected');
    
    if (!trend && !seasonal && !residual) {
      explanations.push('Normal seasonal pattern');
    }
    
    return explanations;
  }

  private determineAnomalyType(
    arimaResult?: AnomalyDetectionResult,
    prophetResult?: AnomalyDetectionResult,
    changepointResult?: AnomalyDetectionResult
  ): 'point' | 'contextual' | 'collective' {
    if (changepointResult?.isAnomaly) return 'collective';
    if (prophetResult?.isAnomaly) return 'contextual';
    return 'point';
  }

  private calculateSeverity(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 0.3) return 'LOW';
    if (score < 0.6) return 'MEDIUM';
    if (score < 0.9) return 'HIGH';
    return 'CRITICAL';
  }

  async forecast(data: TimeSeriesData[], horizonHours: number = 24): Promise<ForecastResult> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    const values = data.map(d => d.value);
    const model = this.models.get('default')!;
    model.fit(values);
    
    const forecast = model.forecast(horizonHours);
    
    this.emit('forecast_complete', {
      horizonHours,
      forecast,
      timestamp: Date.now()
    });

    return forecast;
  }

  getAnalysisStatistics(): any {
    return {
      models: Array.from(this.models.keys()),
      parameters: this.parameters,
      isInitialized: this.isInitialized,
      supportedMethods: ['arima', 'prophet', 'seasonal_decompose', 'changepoint', 'ensemble'],
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

export default TimeSeriesAnalysisService;
