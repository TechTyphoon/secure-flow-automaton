/**
 * Experimental Validation Framework
 * For collecting real performance and security metrics for academic research
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Core experiment configuration
 */
export interface ExperimentConfig {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  participants: ParticipantInfo[];
  groups: ExperimentGroup[];
  metrics: MetricDefinition[];
  hypotheses: Hypothesis[];
}

export interface ParticipantInfo {
  id: string;
  organizationId: string;
  organizationSize: 'small' | 'medium' | 'large';
  industry: string;
  role: 'developer' | 'security_engineer' | 'devops' | 'manager';
  experience_years: number;
  consent: boolean;
  anonymized_id?: string;
}

export interface ExperimentGroup {
  id: string;
  name: string;
  type: 'control' | 'treatment';
  participants: string[];
  configuration: any;
}

export interface MetricDefinition {
  id: string;
  name: string;
  category: 'performance' | 'security' | 'user_experience' | 'business';
  unit: string;
  collection_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  aggregation: 'mean' | 'median' | 'sum' | 'count' | 'p95' | 'p99';
}

export interface Hypothesis {
  id: string;
  description: string;
  null_hypothesis: string;
  alternative_hypothesis: string;
  metrics: string[];
  expected_effect_size: number;
  significance_level: number;
}

/**
 * Real-time data collector for experimental metrics
 */
export class ExperimentalDataCollector extends EventEmitter {
  private config: ExperimentConfig;
  private dataStore: Map<string, any[]>;
  private sessionStore: Map<string, SessionData>;
  private isRunning: boolean = false;
  
  constructor(config: ExperimentConfig) {
    super();
    this.config = config;
    this.dataStore = new Map();
    this.sessionStore = new Map();
  }
  
  /**
   * Start data collection
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Data collector is already running');
      return;
    }
    
    this.isRunning = true;
    this.emit('collection:started', {
      timestamp: Date.now(),
      experiment: this.config.name
    });
    
    // Initialize metric collectors
    this.initializeCollectors();
  }
  
  /**
   * Stop data collection
   */
  stop(): void {
    this.isRunning = false;
    this.emit('collection:stopped', {
      timestamp: Date.now(),
      experiment: this.config.name
    });
    
    // Save collected data
    this.persistData();
  }
  
  /**
   * Record a metric value
   */
  recordMetric(
    metricId: string,
    value: number,
    metadata?: any
  ): void {
    if (!this.isRunning) {
      console.warn('Cannot record metric - collector is not running');
      return;
    }
    
    const metric = this.config.metrics.find(m => m.id === metricId);
    if (!metric) {
      console.error(`Unknown metric: ${metricId}`);
      return;
    }
    
    const dataPoint = {
      timestamp: Date.now(),
      value,
      metadata: metadata || {},
      sessionId: this.getCurrentSessionId(),
      participantId: metadata?.participantId,
      groupId: metadata?.groupId
    };
    
    if (!this.dataStore.has(metricId)) {
      this.dataStore.set(metricId, []);
    }
    
    this.dataStore.get(metricId)!.push(dataPoint);
    
    this.emit('metric:recorded', {
      metric: metricId,
      value,
      timestamp: dataPoint.timestamp
    });
  }
  
  /**
   * Record Core Web Vitals
   */
  recordWebVitals(vitals: {
    LCP: number;
    FID: number;
    CLS: number;
    TTFB?: number;
    FCP?: number;
  }, metadata?: any): void {
    this.recordMetric('core_web_vitals_lcp', vitals.LCP, metadata);
    this.recordMetric('core_web_vitals_fid', vitals.FID, metadata);
    this.recordMetric('core_web_vitals_cls', vitals.CLS, metadata);
    
    if (vitals.TTFB) {
      this.recordMetric('core_web_vitals_ttfb', vitals.TTFB, metadata);
    }
    if (vitals.FCP) {
      this.recordMetric('core_web_vitals_fcp', vitals.FCP, metadata);
    }
  }
  
  /**
   * Record security scan results
   */
  recordSecurityScan(scan: {
    duration_ms: number;
    vulnerabilities_found: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    false_positives: number;
    scan_type: string;
  }, metadata?: any): void {
    this.recordMetric('security_scan_duration', scan.duration_ms, {
      ...metadata,
      scan_type: scan.scan_type
    });
    
    this.recordMetric('security_vulnerabilities_total', scan.vulnerabilities_found, metadata);
    this.recordMetric('security_vulnerabilities_critical', scan.critical, metadata);
    this.recordMetric('security_vulnerabilities_high', scan.high, metadata);
    this.recordMetric('security_vulnerabilities_medium', scan.medium, metadata);
    this.recordMetric('security_vulnerabilities_low', scan.low, metadata);
    this.recordMetric('security_false_positives', scan.false_positives, metadata);
  }
  
  /**
   * Record user behavior metrics
   */
  recordUserBehavior(behavior: {
    session_duration: number;
    pages_visited: number;
    features_used: string[];
    errors_encountered: number;
    task_completion: boolean;
    satisfaction_score?: number;
  }, metadata?: any): void {
    this.recordMetric('user_session_duration', behavior.session_duration, metadata);
    this.recordMetric('user_pages_visited', behavior.pages_visited, metadata);
    this.recordMetric('user_feature_adoption', behavior.features_used.length, {
      ...metadata,
      features: behavior.features_used
    });
    this.recordMetric('user_errors', behavior.errors_encountered, metadata);
    this.recordMetric('user_task_completion', behavior.task_completion ? 1 : 0, metadata);
    
    if (behavior.satisfaction_score !== undefined) {
      this.recordMetric('user_satisfaction', behavior.satisfaction_score, metadata);
    }
  }
  
  /**
   * Initialize metric collectors
   */
  private initializeCollectors(): void {
    // Set up automated collectors based on frequency
    this.config.metrics.forEach(metric => {
      switch (metric.collection_frequency) {
        case 'realtime':
          // Real-time metrics are recorded on-demand
          break;
        case 'hourly':
          setInterval(() => this.collectScheduledMetric(metric), 3600 * 1000);
          break;
        case 'daily':
          setInterval(() => this.collectScheduledMetric(metric), 24 * 3600 * 1000);
          break;
        case 'weekly':
          setInterval(() => this.collectScheduledMetric(metric), 7 * 24 * 3600 * 1000);
          break;
      }
    });
  }
  
  /**
   * Collect scheduled metric
   */
  private collectScheduledMetric(metric: MetricDefinition): void {
    // Implementation depends on metric type
    // This would integrate with actual monitoring systems
    console.log(`Collecting scheduled metric: ${metric.name}`);
  }
  
  /**
   * Get current session ID
   */
  private getCurrentSessionId(): string {
    // Generate or retrieve current session
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Persist collected data to storage
   */
  private persistData(): void {
    const dataDir = path.join(process.cwd(), 'experimental-data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${this.config.name}_${timestamp}.json`;
    const filepath = path.join(dataDir, filename);
    
    const exportData = {
      experiment: this.config,
      data: Object.fromEntries(this.dataStore),
      collection_period: {
        start: this.config.startDate,
        end: new Date(),
      },
      summary: this.generateSummary()
    };
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    console.log(`Data persisted to ${filepath}`);
  }
  
  /**
   * Generate summary statistics
   */
  private generateSummary(): any {
    const summary: any = {};
    
    this.dataStore.forEach((data, metricId) => {
      const metric = this.config.metrics.find(m => m.id === metricId);
      if (!metric) return;
      
      const values = data.map(d => d.value);
      summary[metricId] = {
        count: values.length,
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        median: this.calculateMedian(values),
        min: Math.min(...values),
        max: Math.max(...values),
        std_dev: this.calculateStdDev(values),
        p95: this.calculatePercentile(values, 95),
        p99: this.calculatePercentile(values, 99)
      };
    });
    
    return summary;
  }
  
  /**
   * Statistical calculation helpers
   */
  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }
  
  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  }
  
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

/**
 * Session tracking for user studies
 */
interface SessionData {
  id: string;
  participantId: string;
  groupId: string;
  startTime: number;
  endTime?: number;
  events: any[];
  metrics: Map<string, any>;
}

/**
 * A/B Test Manager for controlled experiments
 */
export class ABTestManager {
  private tests: Map<string, ABTest>;
  
  constructor() {
    this.tests = new Map();
  }
  
  /**
   * Create new A/B test
   */
  createTest(config: {
    id: string;
    name: string;
    hypothesis: string;
    control_config: any;
    treatment_config: any;
    metrics: string[];
    minimum_sample_size: number;
    allocation_ratio?: number; // Default 50/50
  }): ABTest {
    const test = new ABTest(config);
    this.tests.set(config.id, test);
    return test;
  }
  
  /**
   * Allocate participant to test group
   */
  allocateParticipant(
    testId: string,
    participantId: string
  ): 'control' | 'treatment' {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }
    
    return test.allocateParticipant(participantId);
  }
  
  /**
   * Record conversion event
   */
  recordConversion(
    testId: string,
    participantId: string,
    value?: number
  ): void {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }
    
    test.recordConversion(participantId, value);
  }
  
  /**
   * Get test results
   */
  getResults(testId: string): TestResults | null {
    const test = this.tests.get(testId);
    return test ? test.getResults() : null;
  }
}

/**
 * Individual A/B test
 */
class ABTest {
  private config: any;
  private allocations: Map<string, 'control' | 'treatment'>;
  private conversions: Map<string, { converted: boolean; value?: number }>;
  private startTime: number;
  
  constructor(config: any) {
    this.config = config;
    this.allocations = new Map();
    this.conversions = new Map();
    this.startTime = Date.now();
  }
  
  allocateParticipant(participantId: string): 'control' | 'treatment' {
    if (this.allocations.has(participantId)) {
      return this.allocations.get(participantId)!;
    }
    
    const ratio = this.config.allocation_ratio || 0.5;
    const group = Math.random() < ratio ? 'treatment' : 'control';
    this.allocations.set(participantId, group);
    
    return group;
  }
  
  recordConversion(participantId: string, value?: number): void {
    if (!this.allocations.has(participantId)) {
      console.warn(`Participant ${participantId} not in test`);
      return;
    }
    
    this.conversions.set(participantId, {
      converted: true,
      value
    });
  }
  
  getResults(): TestResults {
    const control = {
      participants: 0,
      conversions: 0,
      conversion_rate: 0,
      values: [] as number[]
    };
    
    const treatment = {
      participants: 0,
      conversions: 0,
      conversion_rate: 0,
      values: [] as number[]
    };
    
    this.allocations.forEach((group, participantId) => {
      const target = group === 'control' ? control : treatment;
      target.participants++;
      
      const conversion = this.conversions.get(participantId);
      if (conversion?.converted) {
        target.conversions++;
        if (conversion.value !== undefined) {
          target.values.push(conversion.value);
        }
      }
    });
    
    control.conversion_rate = control.participants > 0
      ? control.conversions / control.participants
      : 0;
    
    treatment.conversion_rate = treatment.participants > 0
      ? treatment.conversions / treatment.participants
      : 0;
    
    // Calculate statistical significance
    const { pValue, confidence } = this.calculateSignificance(
      control,
      treatment
    );
    
    return {
      testId: this.config.id,
      testName: this.config.name,
      control,
      treatment,
      lift: ((treatment.conversion_rate - control.conversion_rate) / control.conversion_rate) * 100,
      pValue,
      confidence,
      isSignificant: pValue < 0.05,
      duration_days: (Date.now() - this.startTime) / (1000 * 60 * 60 * 24)
    };
  }
  
  private calculateSignificance(control: any, treatment: any): {
    pValue: number;
    confidence: number;
  } {
    // Simplified z-test for proportions
    const p1 = control.conversion_rate;
    const p2 = treatment.conversion_rate;
    const n1 = control.participants;
    const n2 = treatment.participants;
    
    if (n1 === 0 || n2 === 0) {
      return { pValue: 1, confidence: 0 };
    }
    
    const pooledP = (control.conversions + treatment.conversions) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
    
    if (se === 0) {
      return { pValue: 1, confidence: 0 };
    }
    
    const z = (p2 - p1) / se;
    const pValue = 2 * (1 - this.normalCDF(Math.abs(z)));
    const confidence = 1 - pValue;
    
    return { pValue, confidence };
  }
  
  private normalCDF(z: number): number {
    // Approximation of normal CDF
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
}

interface TestResults {
  testId: string;
  testName: string;
  control: {
    participants: number;
    conversions: number;
    conversion_rate: number;
    values: number[];
  };
  treatment: {
    participants: number;
    conversions: number;
    conversion_rate: number;
    values: number[];
  };
  lift: number;
  pValue: number;
  confidence: number;
  isSignificant: boolean;
  duration_days: number;
}

export default {
  ExperimentalDataCollector,
  ABTestManager
};
