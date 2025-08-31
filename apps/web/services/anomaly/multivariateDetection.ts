/**
 * Multivariate Anomaly Detection Service
 * Advanced statistical methods for detecting anomalies in multivariate data
 */

import { EventEmitter } from 'events';

// Interfaces for multivariate analysis
interface MultivariateDataPoint {
  features: { [key: string]: number };
  timestamp?: number;
  metadata?: DataPointMetadata;
}

interface CorrelationMatrix {
  variables: string[];
  matrix: number[][];
  significance: number[][];
}

interface PCAResult {
  components: number[][];
  explainedVariance: number[];
  cumulativeVariance: number[];
  transformedData: number[][];
  reconstructionError: number[];
}

interface ICAResult {
  components: number[][];
  mixingMatrix: number[][];
  sources: number[][];
  reconstructionError: number[];
}

interface MultivariateAnomalyResult {
  isAnomaly: boolean;
  score: number;
  confidence: number;
  method: string;
  contributingFeatures: { [key: string]: number };
  explanation: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  diagnostics: {
    mahalanobisDistance?: number;
    hotellingsT2?: number;
    reconstructionError?: number;
    kernelDistance?: number;
  };
}

interface DetectionConfig {
  methods: string[];
  threshold: number;
  confidenceLevel: number;
  correlationThreshold: number;
  pcaComponents: number;
  kernelType: 'rbf' | 'polynomial' | 'linear';
}

// Mathematical utility functions
class MathUtils {
  static mean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  static covariance(x: number[], y: number[]): number {
    const meanX = this.mean(x);
    const meanY = this.mean(y);
    let sum = 0;
    
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
      sum += (x[i] - meanX) * (y[i] - meanY);
    }
    
    return sum / (Math.min(x.length, y.length) - 1);
  }

  static correlation(x: number[], y: number[]): number {
    const cov = this.covariance(x, y);
    const stdX = this.standardDeviation(x);
    const stdY = this.standardDeviation(y);
    
    return (stdX === 0 || stdY === 0) ? 0 : cov / (stdX * stdY);
  }

  static standardDeviation(values: number[]): number {
    const mean = this.mean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  static matrixMultiply(a: number[][], b: number[][]): number[][] {
    const result: number[][] = [];
    
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        result[i][j] = 0;
        for (let k = 0; k < b.length; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    
    return result;
  }

  static matrixTranspose(matrix: number[][]): number[][] {
    const result: number[][] = [];
    
    for (let i = 0; i < matrix[0].length; i++) {
      result[i] = [];
      for (let j = 0; j < matrix.length; j++) {
        result[i][j] = matrix[j][i];
      }
    }
    
    return result;
  }

  static matrixInverse(matrix: number[][]): number[][] {
    const n = matrix.length;
    const identity: number[][] = [];
    const augmented: number[][] = [];
    
    // Create identity matrix
    for (let i = 0; i < n; i++) {
      identity[i] = new Array(n).fill(0);
      identity[i][i] = 1;
    }
    
    // Create augmented matrix [A|I]
    for (let i = 0; i < n; i++) {
      augmented[i] = [...matrix[i], ...identity[i]];
    }
    
    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      
      // Make diagonal element 1
      const pivot = augmented[i][i];
      if (Math.abs(pivot) < 1e-10) {
        // Matrix is singular, return approximation
        return this.pseudoInverse(matrix);
      }
      
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }
      
      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }
    
    // Extract inverse matrix
    const inverse: number[][] = [];
    for (let i = 0; i < n; i++) {
      inverse[i] = augmented[i].slice(n);
    }
    
    return inverse;
  }

  static pseudoInverse(matrix: number[][]): number[][] {
    // Simplified pseudo-inverse using Moore-Penrose formula
    const transpose = this.matrixTranspose(matrix);
    const product = this.matrixMultiply(transpose, matrix);
    
    // Add small regularization term for numerical stability
    for (let i = 0; i < product.length; i++) {
      product[i][i] += 1e-6;
    }
    
    const inverse = this.matrixInverse(product);
    return this.matrixMultiply(inverse, transpose);
  }

  // Eigenvalue computation (simplified power iteration)
  static dominantEigenvalue(matrix: number[][]): { value: number; vector: number[] } {
    const n = matrix.length;
    let vector = new Array(n).fill(1);
    let eigenvalue = 0;
    
    for (let iter = 0; iter < 100; iter++) {
      // Matrix-vector multiplication
      const newVector = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          newVector[i] += matrix[i][j] * vector[j];
        }
      }
      
      // Compute eigenvalue (Rayleigh quotient)
      let numerator = 0;
      let denominator = 0;
      for (let i = 0; i < n; i++) {
        numerator += vector[i] * newVector[i];
        denominator += vector[i] * vector[i];
      }
      eigenvalue = numerator / denominator;
      
      // Normalize vector
      const norm = Math.sqrt(newVector.reduce((sum, val) => sum + val * val, 0));
      vector = newVector.map(val => val / norm);
    }
    
    return { value: eigenvalue, vector };
  }
}

// Principal Component Analysis
class PCA {
  private components: number[][] = [];
  private explainedVariance: number[] = [];
  private mean: number[] = [];

  fit(data: number[][]): void {
    const n = data.length;
    const d = data[0].length;
    
    // Calculate mean
    this.mean = new Array(d).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < d; j++) {
        this.mean[j] += data[i][j];
      }
    }
    this.mean = this.mean.map(val => val / n);
    
    // Center data
    const centeredData = data.map(row => 
      row.map((val, j) => val - this.mean[j])
    );
    
    // Calculate covariance matrix
    const covariance: number[][] = [];
    for (let i = 0; i < d; i++) {
      covariance[i] = [];
      for (let j = 0; j < d; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += centeredData[k][i] * centeredData[k][j];
        }
        covariance[i][j] = sum / (n - 1);
      }
    }
    
    // Simplified eigendecomposition (power iteration for first few components)
    this.components = [];
    this.explainedVariance = [];
    
    for (let comp = 0; comp < Math.min(d, 10); comp++) {
      const eigen = MathUtils.dominantEigenvalue(covariance);
      this.components.push(eigen.vector);
      this.explainedVariance.push(Math.max(0, eigen.value));
      
      // Deflate matrix for next component
      const outerProduct = this.outerProduct(eigen.vector, eigen.vector);
      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          covariance[i][j] -= eigen.value * outerProduct[i][j];
        }
      }
    }
  }

  transform(data: number[][]): number[][] {
    return data.map(row => {
      const centered = row.map((val, j) => val - this.mean[j]);
      return this.components.map(component => {
        let dot = 0;
        for (let i = 0; i < centered.length; i++) {
          dot += centered[i] * component[i];
        }
        return dot;
      });
    });
  }

  inverseTransform(transformedData: number[][]): number[][] {
    return transformedData.map(row => {
      const reconstructed = new Array(this.mean.length).fill(0);
      
      for (let i = 0; i < row.length; i++) {
        for (let j = 0; j < this.mean.length; j++) {
          reconstructed[j] += row[i] * this.components[i][j];
        }
      }
      
      return reconstructed.map((val, j) => val + this.mean[j]);
    });
  }

  private outerProduct(a: number[], b: number[]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b.length; j++) {
        result[i][j] = a[i] * b[j];
      }
    }
    return result;
  }

  getExplainedVariance(): number[] {
    return [...this.explainedVariance];
  }

  getComponents(): number[][] {
    return this.components.map(comp => [...comp]);
  }
}

// Independent Component Analysis (simplified)
class ICA {
  private components: number[][] = [];
  private mixingMatrix: number[][] = [];

  fit(data: number[][], numComponents: number = 2): void {
    // Simplified FastICA implementation
    const n = data.length;
    const d = data[0].length;
    numComponents = Math.min(numComponents, d);
    
    // Center and whiten data using PCA
    const pca = new PCA();
    pca.fit(data);
    const whitenedData = pca.transform(data);
    
    this.components = [];
    
    for (let comp = 0; comp < numComponents; comp++) {
      // Random initialization
      let w = new Array(whitenedData[0].length).fill(0).map(() => Math.random() - 0.5);
      
      // Normalize
      const norm = Math.sqrt(w.reduce((sum, val) => sum + val * val, 0));
      w = w.map(val => val / norm);
      
      // FastICA iterations
      for (let iter = 0; iter < 100; iter++) {
        const oldW = [...w];
        
        // Calculate E[g(w^T x)] and E[g'(w^T x)]
        let g_mean = 0;
        let g_prime_mean = 0;
        const newW = new Array(w.length).fill(0);
        
        for (let i = 0; i < whitenedData.length; i++) {
          const wTx = w.reduce((sum, val, idx) => sum + val * whitenedData[i][idx], 0);
          const g = wTx * Math.exp(-0.5 * wTx * wTx); // Gaussian non-linearity
          const g_prime = (1 - wTx * wTx) * Math.exp(-0.5 * wTx * wTx);
          
          g_mean += g;
          g_prime_mean += g_prime;
          
          for (let j = 0; j < w.length; j++) {
            newW[j] += g * whitenedData[i][j];
          }
        }
        
        g_mean /= n;
        g_prime_mean /= n;
        
        for (let j = 0; j < w.length; j++) {
          w[j] = newW[j] / n - g_prime_mean * w[j];
        }
        
        // Orthogonalization against previous components
        for (let prevComp = 0; prevComp < this.components.length; prevComp++) {
          const dot = w.reduce((sum, val, idx) => sum + val * this.components[prevComp][idx], 0);
          for (let j = 0; j < w.length; j++) {
            w[j] -= dot * this.components[prevComp][j];
          }
        }
        
        // Normalize
        const newNorm = Math.sqrt(w.reduce((sum, val) => sum + val * val, 0));
        w = w.map(val => val / newNorm);
        
        // Check convergence
        const convergence = Math.abs(w.reduce((sum, val, idx) => sum + val * oldW[idx], 0));
        if (convergence > 0.9999) break;
      }
      
      this.components.push(w);
    }
  }

  transform(data: number[][]): number[][] {
    const pca = new PCA();
    pca.fit(data);
    const whitenedData = pca.transform(data);
    
    return whitenedData.map(row => 
      this.components.map(component => 
        row.reduce((sum, val, idx) => sum + val * component[idx], 0)
      )
    );
  }
}

// Mahalanobis Distance Calculator
class MahalanobisDistance {
  private mean: number[] = [];
  private invCovariance: number[][] = [];

  fit(data: number[][]): void {
    const n = data.length;
    const d = data[0].length;
    
    // Calculate mean
    this.mean = new Array(d).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < d; j++) {
        this.mean[j] += data[i][j];
      }
    }
    this.mean = this.mean.map(val => val / n);
    
    // Calculate covariance matrix
    const covariance: number[][] = [];
    for (let i = 0; i < d; i++) {
      covariance[i] = [];
      for (let j = 0; j < d; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += (data[k][i] - this.mean[i]) * (data[k][j] - this.mean[j]);
        }
        covariance[i][j] = sum / (n - 1);
      }
    }
    
    // Calculate inverse covariance matrix
    this.invCovariance = MathUtils.matrixInverse(covariance);
  }

  distance(point: number[]): number {
    const diff = point.map((val, i) => val - this.mean[i]);
    
    // Calculate x^T * S^-1 * x
    let distance = 0;
    for (let i = 0; i < diff.length; i++) {
      for (let j = 0; j < diff.length; j++) {
        distance += diff[i] * this.invCovariance[i][j] * diff[j];
      }
    }
    
    return Math.sqrt(Math.max(0, distance));
  }
}

// Main Multivariate Anomaly Detection Service
export class MultivariateDetectionService extends EventEmitter {
  private config: DetectionConfig;
  private pca: PCA = new PCA();
  private ica: ICA = new ICA();
  private mahalanobis: MahalanobisDistance = new MahalanobisDistance();
  private trainingData: number[][] = [];
  private featureNames: string[] = [];
  private isInitialized: boolean = false;

  constructor(config?: Partial<DetectionConfig>) {
    super();
    
    this.config = {
      methods: ['pca', 'mahalanobis', 'ica', 'correlation'],
      threshold: 0.7,
      confidenceLevel: 0.95,
      correlationThreshold: 0.8,
      pcaComponents: 5,
      kernelType: 'rbf',
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

      console.log('📊 Multivariate Anomaly Detection Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize multivariate detection:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  async trainModels(data: MultivariateDataPoint[]): Promise<void> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    try {
      // Extract feature names and convert to matrix
      this.featureNames = Object.keys(data[0].features);
      this.trainingData = data.map(point => 
        this.featureNames.map(name => point.features[name] || 0)
      );

      // Train all models
      if (this.config.methods.includes('pca')) {
        this.pca.fit(this.trainingData);
      }

      if (this.config.methods.includes('ica')) {
        this.ica.fit(this.trainingData, this.config.pcaComponents);
      }

      if (this.config.methods.includes('mahalanobis')) {
        this.mahalanobis.fit(this.trainingData);
      }

      this.emit('training_complete', {
        dataPoints: data.length,
        features: this.featureNames.length,
        methods: this.config.methods,
        timestamp: Date.now()
      });

      console.log(`✅ Multivariate models trained with ${data.length} samples`);
    } catch (error) {
      console.error('❌ Model training failed:', error);
      this.emit('error', { type: 'training', error });
      throw error;
    }
  }

  async detectAnomalies(data: MultivariateDataPoint[]): Promise<MultivariateAnomalyResult[]> {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    if (this.trainingData.length === 0) {
      throw new Error('Models must be trained before detection');
    }

    const startTime = Date.now();
    const results: MultivariateAnomalyResult[] = [];

    try {
      // Convert data to matrix
      const dataMatrix = data.map(point => 
        this.featureNames.map(name => point.features[name] || 0)
      );

      for (let i = 0; i < dataMatrix.length; i++) {
        const point = dataMatrix[i];
        const methodResults: { [key: string]: DetectionMethodResult } = {};

        // PCA-based detection
        if (this.config.methods.includes('pca')) {
          methodResults.pca = this.pcaAnomalyDetection(point);
        }

        // Mahalanobis distance detection
        if (this.config.methods.includes('mahalanobis')) {
          methodResults.mahalanobis = this.mahalanobisAnomalyDetection(point);
        }

        // ICA-based detection
        if (this.config.methods.includes('ica')) {
          methodResults.ica = this.icaAnomalyDetection(point);
        }

        // Correlation-based detection
        if (this.config.methods.includes('correlation')) {
          methodResults.correlation = this.correlationAnomalyDetection(point, data[i]);
        }

        // Combine results
        const ensembleResult = this.combineMethodResults(methodResults, data[i]);
        results.push(ensembleResult);
      }

      const processingTime = Date.now() - startTime;
      this.emit('detection_complete', {
        anomaliesDetected: results.filter(r => r.isAnomaly).length,
        totalPoints: results.length,
        processingTime,
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      console.error('❌ Multivariate anomaly detection failed:', error);
      this.emit('error', { type: 'detection', error });
      throw error;
    }
  }

  private pcaAnomalyDetection(point: number[]): DetectionMethodResult {
    const transformed = this.pca.transform([point]);
    const reconstructed = this.pca.inverseTransform(transformed)[0];
    
    // Calculate reconstruction error
    const reconstructionError = Math.sqrt(
      point.reduce((sum, val, idx) => sum + Math.pow(val - reconstructed[idx], 2), 0)
    );

    const explainedVariance = this.pca.getExplainedVariance();
    const totalVariance = explainedVariance.reduce((sum, val) => sum + val, 0);
    const normalizedError = reconstructionError / Math.sqrt(totalVariance);

    return {
      score: Math.min(normalizedError, 1),
      reconstructionError,
      isAnomaly: normalizedError > this.config.threshold
    };
  }

  private mahalanobisAnomalyDetection(point: number[]): DetectionMethodResult {
    const distance = this.mahalanobis.distance(point);
    
    // Convert to probability-like score (assuming chi-square distribution)
    const degreesOfFreedom = point.length;
    const threshold = Math.sqrt(2 * degreesOfFreedom); // Approximate threshold
    const score = Math.min(distance / threshold, 1);

    return {
      score,
      mahalanobisDistance: distance,
      isAnomaly: distance > threshold * this.config.threshold
    };
  }

  private icaAnomalyDetection(point: number[]): DetectionMethodResult {
    const sources = this.ica.transform([point])[0];
    
    // Calculate non-Gaussianity measure
    let nonGaussianity = 0;
    for (const source of sources) {
      // Simple kurtosis-based measure
      nonGaussianity += Math.abs(source);
    }
    
    const score = Math.min(nonGaussianity / sources.length, 1);

    return {
      score,
      sources,
      isAnomaly: score > this.config.threshold
    };
  }

  private correlationAnomalyDetection(point: number[], originalPoint: MultivariateDataPoint): DetectionMethodResult {
    // Calculate correlation with historical patterns
    const contributingFeatures: { [key: string]: number } = {};
    let maxCorrelationAnomaly = 0;

    // Calculate feature correlations with expected patterns
    for (let i = 0; i < this.featureNames.length; i++) {
      const featureName = this.featureNames[i];
      const featureValues = this.trainingData.map(row => row[i]);
      const featureMean = MathUtils.mean(featureValues);
      const featureStd = MathUtils.standardDeviation(featureValues);
      
      // Z-score based anomaly
      const zScore = Math.abs(point[i] - featureMean) / (featureStd || 1);
      contributingFeatures[featureName] = zScore;
      maxCorrelationAnomaly = Math.max(maxCorrelationAnomaly, zScore);
    }

    const score = Math.min(maxCorrelationAnomaly / 3, 1); // Normalize

    return {
      score,
      contributingFeatures,
      isAnomaly: score > this.config.threshold
    };
  }

  private combineMethodResults(methodResults: { [key: string]: DetectionMethodResult }, originalPoint: MultivariateDataPoint): MultivariateAnomalyResult {
    const scores = Object.values(methodResults).map((result: DetectionMethodResult) => result.score);
    const ensembleScore = MathUtils.mean(scores);
    const isAnomaly = ensembleScore > this.config.threshold;

    // Combine contributing features
    const contributingFeatures: { [key: string]: number } = {};
    if (methodResults.correlation?.contributingFeatures) {
      Object.assign(contributingFeatures, methodResults.correlation.contributingFeatures);
    }

    // Generate explanations
    const explanations: string[] = [];
    if (methodResults.pca?.isAnomaly) {
      explanations.push(`PCA reconstruction error: ${methodResults.pca.reconstructionError.toFixed(3)}`);
    }
    if (methodResults.mahalanobis?.isAnomaly) {
      explanations.push(`High Mahalanobis distance: ${methodResults.mahalanobis.mahalanobisDistance.toFixed(3)}`);
    }
    if (methodResults.ica?.isAnomaly) {
      explanations.push('ICA detected non-Gaussian patterns');
    }
    if (methodResults.correlation?.isAnomaly) {
      explanations.push('Correlation analysis detected anomaly');
    }

    if (explanations.length === 0) {
      explanations.push('Normal multivariate pattern');
    }

    return {
      isAnomaly,
      score: ensembleScore,
      confidence: Math.abs(ensembleScore - 0.5) * 2,
      method: 'multivariate_ensemble',
      contributingFeatures,
      explanation: explanations,
      severity: this.calculateSeverity(ensembleScore),
      diagnostics: {
        mahalanobisDistance: methodResults.mahalanobis?.mahalanobisDistance,
        reconstructionError: methodResults.pca?.reconstructionError,
        hotellingsT2: this.calculateHotellingsT2(originalPoint),
        kernelDistance: this.calculateKernelDistance(originalPoint)
      }
    };
  }

  private calculateHotellingsT2(point: MultivariateDataPoint): number {
    // Simplified Hotelling's T² calculation
    const dataVector = this.featureNames.map(name => point.features[name] || 0);
    const distance = this.mahalanobis.distance(dataVector);
    return distance * distance; // T² is squared Mahalanobis distance
  }

  private calculateKernelDistance(point: MultivariateDataPoint): number {
    // Simplified kernel distance using RBF kernel
    const dataVector = this.featureNames.map(name => point.features[name] || 0);
    let minDistance = Infinity;

    // Find minimum distance to training points
    for (const trainPoint of this.trainingData.slice(0, 100)) { // Sample for efficiency
      let squaredDistance = 0;
      for (let i = 0; i < dataVector.length; i++) {
        const diff = dataVector[i] - trainPoint[i];
        squaredDistance += diff * diff;
      }
      
      const kernelValue = Math.exp(-0.1 * squaredDistance); // RBF kernel
      minDistance = Math.min(minDistance, 1 - kernelValue);
    }

    return minDistance;
  }

  private calculateSeverity(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 0.3) return 'LOW';
    if (score < 0.6) return 'MEDIUM';
    if (score < 0.9) return 'HIGH';
    return 'CRITICAL';
  }

  async calculateCorrelationMatrix(data: MultivariateDataPoint[]): Promise<CorrelationMatrix> {
    const dataMatrix = data.map(point => 
      this.featureNames.map(name => point.features[name] || 0)
    );

    const n = this.featureNames.length;
    const matrix: number[][] = [];
    const significance: number[][] = [];

    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      significance[i] = [];
      
      for (let j = 0; j < n; j++) {
        const column1 = dataMatrix.map(row => row[i]);
        const column2 = dataMatrix.map(row => row[j]);
        
        const correlation = MathUtils.correlation(column1, column2);
        matrix[i][j] = correlation;
        
        // Simple significance test (correlation magnitude)
        significance[i][j] = Math.abs(correlation);
      }
    }

    return {
      variables: [...this.featureNames],
      matrix,
      significance
    };
  }

  async performPCA(data: MultivariateDataPoint[]): Promise<PCAResult> {
    const dataMatrix = data.map(point => 
      this.featureNames.map(name => point.features[name] || 0)
    );

    const pca = new PCA();
    pca.fit(dataMatrix);
    
    const transformedData = pca.transform(dataMatrix);
    const reconstructed = pca.inverseTransform(transformedData);
    
    const reconstructionError = dataMatrix.map((original, i) => 
      Math.sqrt(original.reduce((sum, val, j) => sum + Math.pow(val - reconstructed[i][j], 2), 0))
    );

    const explainedVariance = pca.getExplainedVariance();
    const totalVariance = explainedVariance.reduce((sum, val) => sum + val, 0);
    const cumulativeVariance = explainedVariance.map((_, i) => 
      explainedVariance.slice(0, i + 1).reduce((sum, val) => sum + val, 0) / totalVariance
    );

    return {
      components: pca.getComponents(),
      explainedVariance,
      cumulativeVariance,
      transformedData,
      reconstructionError
    };
  }

  getDetectionStatistics(): DetectionStatistics {
    return {
      config: this.config,
      featureNames: this.featureNames,
      trainingDataSize: this.trainingData.length,
      isInitialized: this.isInitialized,
      supportedMethods: ['pca', 'mahalanobis', 'ica', 'correlation'],
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

// Type definitions for multivariate detection
interface DataPointMetadata {
  source: string;
  timestamp: Date;
  [key: string]: unknown;
}

interface DetectionMethodResult {
  score: number;
  isAnomaly: boolean;
  reconstructionError?: number;
  mahalanobisDistance?: number;
  sources?: number[];
  [key: string]: unknown;
}

interface DetectionStatistics {
  config: DetectionConfig;
  featureNames: string[];
  trainingDataSize: number;
  isInitialized: boolean;
  supportedMethods: string[];
  timestamp: number;
}

export default MultivariateDetectionService;
