/**
 * Conversational AI Security Assistant
 * Natural language interface for security operations and threat analysis
 */

import { EventEmitter } from 'events';
import SecurityNLPEngine from './nlpEngine';
import {
  BaseError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  SecurityError,
  InternalError,
  ErrorHandler,
  withErrorHandling,
  createErrorContext,
  ErrorContext
} from '../common/errors';
import { getLogger, LogContext, SecurityContext, PerformanceContext, AuditContext } from '../common/logger';
import { createMonitoringService, MonitoringService } from '../common/monitoring';
import { validateSecurityQuery, validateSessionId, sanitizeQuery, getValidator } from '../common/validation';

// Core interfaces for conversational AI
interface SecurityQuery {
  id: string;
  text: string;
  intent: QueryIntent;
  entities: QueryEntity[];
  context: ConversationContext;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: number;
}

interface QueryIntent {
  primary: string;
  confidence: number;
  secondary?: string[];
  category: 'INVESTIGATION' | 'MONITORING' | 'RESPONSE' | 'ANALYSIS' | 'REPORTING' | 'CONFIGURATION';
}

interface QueryEntity {
  type: string;
  value: string;
  role: string; // subject, object, time, location, etc.
  confidence: number;
}

interface ConversationContext {
  sessionId: string;
  userId?: string;
  previousQueries: string[];
  currentTopic?: string;
  securityContext: {
    clearanceLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'TOP_SECRET';
    accessibleSystems: string[];
    currentIncidents: string[];
  };
  preferences: {
    verbosity: 'BRIEF' | 'DETAILED' | 'TECHNICAL';
    visualizations: boolean;
    realTimeUpdates: boolean;
  };
}

interface SecurityData {
  count?: number;
  riskLevel?: string;
  status?: string;
  anomalies?: Array<{ description?: string; type?: string }>;
  threats?: Array<{ id: string; severity: string; description: string }>;
  vulnerabilities?: Array<{ id: string; severity: string; description: string }>;
  recommendations?: Array<{ id: string; priority: string; description: string }>;
  actions?: Array<{ urgency: string; description: string }>;
  metrics?: {
    systemHealth?: number;
    threatLevel?: string;
    activeAlerts?: number;
  };
  changes?: Array<{ type: string; description: string }>;
  [key: string]: unknown;
}

interface SecurityResponse {
  queryId: string;
  text: string;
  data?: SecurityData;
  visualizations?: Visualization[];
  actions?: RecommendedAction[];
  confidence: number;
  sources: string[];
  followUpSuggestions: string[];
  processingTime: number;
  timestamp: number;
}

interface VisualizationData {
  labels?: string[];
  values?: number[];
  categories?: string[];
  series?: Array<{ name: string; data: number[] }>;
  coordinates?: Array<{ lat: number; lng: number; value: number }>;
  rows?: Array<Record<string, string | number>>;
  [key: string]: unknown;
}

interface VisualizationConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'scatter';
  colors?: string[];
  axisLabels?: { x?: string; y?: string };
  legend?: boolean;
  animation?: boolean;
  [key: string]: unknown;
}

interface Visualization {
  type: 'CHART' | 'GRAPH' | 'TIMELINE' | 'MAP' | 'TABLE' | 'HEATMAP';
  title: string;
  data: VisualizationData;
  config: VisualizationConfig;
  description: string;
}

interface RecommendedAction {
  action: string;
  description: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedTime: string;
  prerequisites: string[];
  risks: string[];
}

interface ConversationContext {
  currentTopic?: string;
  collectedData?: Record<string, unknown>;
  userPreferences?: Record<string, unknown>;
  sessionState?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ConversationFlow {
  currentStep: string;
  steps: FlowStep[];
  context: ConversationContext;
  isComplete: boolean;
}

interface FlowStep {
  id: string;
  question: string;
  expectedResponse: string;
  validation?: (response: string) => boolean;
  nextStep?: string;
}

// Intent classification engine
class SecurityIntentClassifier {
  private intentPatterns = new Map([
    ['SHOW_ANOMALIES', {
      patterns: [
        /show.*anomal/i,
        /find.*unusual/i,
        /detect.*strange/i,
        /list.*suspicious/i,
        /display.*outlier/i
      ],
      category: 'INVESTIGATION' as const,
      confidence: 0.9
    }],
    ['THREAT_ANALYSIS', {
      patterns: [
        /analyze.*threat/i,
        /threat.*analysis/i,
        /risk.*assessment/i,
        /vulnerability.*scan/i,
        /security.*evaluation/i
      ],
      category: 'ANALYSIS' as const,
      confidence: 0.95
    }],
    ['INCIDENT_RESPONSE', {
      patterns: [
        /respond.*incident/i,
        /handle.*breach/i,
        /contain.*attack/i,
        /mitigate.*threat/i,
        /emergency.*response/i
      ],
      category: 'RESPONSE' as const,
      confidence: 0.9
    }],
    ['MONITORING_STATUS', {
      patterns: [
        /status.*monitor/i,
        /system.*health/i,
        /network.*status/i,
        /security.*dashboard/i,
        /current.*state/i
      ],
      category: 'MONITORING' as const,
      confidence: 0.85
    }],
    ['GENERATE_REPORT', {
      patterns: [
        /generate.*report/i,
        /create.*summary/i,
        /export.*data/i,
        /compliance.*report/i,
        /executive.*brief/i
      ],
      category: 'REPORTING' as const,
      confidence: 0.9
    }],
    ['CONFIGURE_SETTINGS', {
      patterns: [
        /configure.*settings/i,
        /update.*config/i,
        /change.*threshold/i,
        /modify.*rule/i,
        /adjust.*parameter/i
      ],
      category: 'CONFIGURATION' as const,
      confidence: 0.8
    }]
  ]);

  classifyIntent(text: string): QueryIntent {
    let bestMatch = {
      intent: 'UNKNOWN',
      confidence: 0,
      category: 'INVESTIGATION' as QueryIntent['category']
    };

    for (const [intent, config] of this.intentPatterns) {
      for (const pattern of config.patterns) {
        if (pattern.test(text)) {
          const confidence = config.confidence * this.calculateContextualBoost(text, intent);
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              intent,
              confidence,
              category: config.category
            };
          }
        }
      }
    }

    // Extract secondary intents
    const secondary = this.extractSecondaryIntents(text, bestMatch.intent);

    return {
      primary: bestMatch.intent,
      confidence: bestMatch.confidence,
      secondary,
      category: bestMatch.category
    };
  }

  private calculateContextualBoost(text: string, intent: string): number {
    // Boost confidence based on contextual keywords
    const contextKeywords = {
      'SHOW_ANOMALIES': ['last', 'recent', 'today', 'hour', 'minute'],
      'THREAT_ANALYSIS': ['critical', 'high', 'risk', 'vulnerability', 'exploit'],
      'INCIDENT_RESPONSE': ['urgent', 'immediate', 'now', 'emergency', 'critical'],
      'MONITORING_STATUS': ['current', 'now', 'real-time', 'live', 'active'],
      'GENERATE_REPORT': ['executive', 'compliance', 'audit', 'summary', 'weekly'],
      'CONFIGURE_SETTINGS': ['new', 'update', 'change', 'modify', 'set']
    };

    const keywords = contextKeywords[intent] || [];
    const boostCount = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;

    return Math.min(1.2, 1 + (boostCount * 0.05));
  }

  private extractSecondaryIntents(text: string, primaryIntent: string): string[] {
    const secondary: string[] = [];

    // Look for additional intents that might be present
    for (const [intent, config] of this.intentPatterns) {
      if (intent === primaryIntent) continue;

      for (const pattern of config.patterns) {
        if (pattern.test(text)) {
          secondary.push(intent);
          break;
        }
      }
    }

    return secondary.slice(0, 2); // Limit to top 2 secondary intents
  }
}

// Entity extraction for security queries
class SecurityQueryEntityExtractor {
  private entityPatterns = new Map([
    ['TIME_RANGE', {
      patterns: [
        /last (\d+) (minute|hour|day|week|month)s?/i,
        /past (\d+) (minute|hour|day|week|month)s?/i,
        /in the (last|past) (hour|day|week|month)/i,
        /(today|yesterday|this week|this month)/i
      ],
      role: 'temporal_filter'
    }],
    ['IP_ADDRESS', {
      patterns: [
        /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
      ],
      role: 'target_entity'
    }],
    ['SYSTEM_NAME', {
      patterns: [
        /\b(server|database|workstation|laptop|desktop|router|switch|firewall)\s+(\w+)/i,
        /\b(\w+)-(server|db|ws|laptop|desktop|router|sw|fw)\b/i
      ],
      role: 'target_system'
    }],
    ['SEVERITY_LEVEL', {
      patterns: [
        /\b(low|medium|high|critical|severe)\s+(severity|priority|risk)/i,
        /\b(minor|major|critical|blocker)\s+(issue|problem|incident)/i
      ],
      role: 'filter_criteria'
    }],
    ['METRIC_TYPE', {
      patterns: [
        /\b(cpu|memory|disk|network|bandwidth|latency|response\s+time)/i,
        /\b(login|authentication|access|connection|session)/i,
        /\b(error|warning|alert|exception|failure)/i
      ],
      role: 'data_type'
    }]
  ]);

  extractEntities(text: string): QueryEntity[] {
    const entities: QueryEntity[] = [];

    for (const [entityType, config] of this.entityPatterns) {
      for (const pattern of config.patterns) {
        const matches = text.matchAll(pattern);
        
        for (const match of matches) {
          entities.push({
            type: entityType,
            value: match[0],
            role: config.role,
            confidence: this.calculateEntityConfidence(entityType, match[0])
          });
        }
      }
    }

    return this.deduplicateEntities(entities);
  }

  private calculateEntityConfidence(type: string, value: string): number {
    // Higher confidence for more specific patterns
    switch (type) {
      case 'IP_ADDRESS':
        return this.isValidIP(value) ? 0.95 : 0.6;
      case 'TIME_RANGE':
        return 0.9;
      case 'SEVERITY_LEVEL':
        return 0.85;
      case 'SYSTEM_NAME':
        return 0.8;
      case 'METRIC_TYPE':
        return 0.75;
      default:
        return 0.7;
    }
  }

  private isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    return parts.length === 4 && 
           parts.every(part => {
             const num = parseInt(part);
             return num >= 0 && num <= 255;
           });
  }

  private deduplicateEntities(entities: QueryEntity[]): QueryEntity[] {
    const seen = new Set<string>();
    return entities.filter(entity => {
      const key = `${entity.type}:${entity.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// Response generation engine
class SecurityResponseGenerator {
  private responseTemplates = new Map([
    ['SHOW_ANOMALIES', {
      template: "I found {count} anomalies in the {timeRange}. {details}",
      requiresData: true,
      visualizationType: 'TIMELINE'
    }],
    ['THREAT_ANALYSIS', {
      template: "Threat analysis complete. Risk level: {riskLevel}. {findings}",
      requiresData: true,
      visualizationType: 'HEATMAP'
    }],
    ['INCIDENT_RESPONSE', {
      template: "Incident response initiated. Current status: {status}. {actions}",
      requiresData: false,
      visualizationType: 'TIMELINE'
    }],
    ['MONITORING_STATUS', {
      template: "System status: {status}. {metrics}",
      requiresData: true,
      visualizationType: 'CHART'
    }],
    ['GENERATE_REPORT', {
      template: "Report generated successfully. {summary}",
      requiresData: true,
      visualizationType: 'TABLE'
    }],
    ['CONFIGURE_SETTINGS', {
      template: "Configuration updated. {changes}",
      requiresData: false,
      visualizationType: null
    }]
  ]);

  generateResponse(
    query: SecurityQuery,
    data: SecurityData,
    context: ConversationContext
  ): SecurityResponse {
    const template = this.responseTemplates.get(query.intent.primary);
    
    if (!template) {
      return this.generateFallbackResponse(query);
    }

    const responseText = this.populateTemplate(template.template, data, query);
    const visualizations = this.generateVisualizations(template.visualizationType, data, query);
    const actions = this.generateRecommendedActions(query, data);
    const followUps = this.generateFollowUpSuggestions(query, data);

    return {
      queryId: query.id,
      text: responseText,
      data,
      visualizations,
      actions,
      confidence: this.calculateResponseConfidence(query, data),
      sources: this.identifySources(query, data),
      followUpSuggestions: followUps,
      processingTime: 0, // Will be set by caller
      timestamp: Date.now()
    };
  }

  private populateTemplate(template: string, data: SecurityData, query: SecurityQuery): string {
    let response = template;

    // Replace placeholders with actual data
    const replacements = {
      '{count}': data?.count || '0',
      '{timeRange}': this.extractTimeRange(query),
      '{details}': this.generateDetails(data, query),
      '{riskLevel}': data?.riskLevel || 'UNKNOWN',
      '{findings}': this.generateFindings(data, query),
      '{status}': data?.status || 'UNKNOWN',
      '{actions}': this.generateActionSummary(data, query),
      '{metrics}': this.generateMetricsSummary(data, query),
      '{summary}': this.generateSummary(data, query),
      '{changes}': this.generateChangesSummary(data, query)
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      response = response.replace(placeholder, String(value));
    }

    return response;
  }

  private extractTimeRange(query: SecurityQuery): string {
    const timeEntity = query.entities.find(e => e.type === 'TIME_RANGE');
    return timeEntity ? timeEntity.value : 'specified period';
  }

  private generateDetails(data: SecurityData, query: SecurityQuery): string {
    if (!data) return 'No additional details available.';
    
    if (data.anomalies && Array.isArray(data.anomalies)) {
      const topAnomalies = data.anomalies.slice(0, 3);
      return `Top anomalies: ${topAnomalies.map(a => a.description || a.type).join(', ')}.`;
    }
    
    return 'Additional analysis available in detailed view.';
  }

  private generateFindings(data: SecurityData, query: SecurityQuery): string {
    if (!data) return 'Analysis in progress.';
    
    const findings = [];
    
    if (data.threats?.length > 0) {
      findings.push(`${data.threats.length} potential threats identified`);
    }
    
    if (data.vulnerabilities?.length > 0) {
      findings.push(`${data.vulnerabilities.length} vulnerabilities detected`);
    }
    
    if (data.recommendations?.length > 0) {
      findings.push(`${data.recommendations.length} recommendations generated`);
    }
    
    return findings.join(', ') || 'No significant findings.';
  }

  private generateActionSummary(data: SecurityData, query: SecurityQuery): string {
    if (!data?.actions) return 'No actions required at this time.';
    
    const urgentActions = data.actions.filter((a: { urgency: string; description: string }) => 
      a.urgency === 'HIGH' || a.urgency === 'CRITICAL'
    );
    
    if (urgentActions.length > 0) {
      return `${urgentActions.length} urgent actions recommended.`;
    }
    
    return `${data.actions.length} actions recommended.`;
  }

  private generateMetricsSummary(data: SecurityData, query: SecurityQuery): string {
    if (!data?.metrics) return 'Metrics unavailable.';
    
    const metrics = [];
    
    if (data.metrics.systemHealth) {
      metrics.push(`System Health: ${data.metrics.systemHealth}%`);
    }
    
    if (data.metrics.threatLevel) {
      metrics.push(`Threat Level: ${data.metrics.threatLevel}`);
    }
    
    if (data.metrics.activeAlerts) {
      metrics.push(`Active Alerts: ${data.metrics.activeAlerts}`);
    }
    
    return metrics.join(', ') || 'All systems nominal.';
  }

  private generateSummary(data: SecurityData, query: SecurityQuery): string {
    if (!data) return 'Report generated with available data.';
    
    return `Report includes ${data.sections || 'multiple'} sections with ${data.dataPoints || 'comprehensive'} data points.`;
  }

  private generateChangesSummary(data: SecurityData, query: SecurityQuery): string {
    if (!data?.changes) return 'Settings updated successfully.';
    
    return `${data.changes.length} configuration changes applied.`;
  }

  private generateVisualizations(
    type: string | null, 
    data: SecurityData, 
    query: SecurityQuery
  ): Visualization[] {
    if (!type || !data) return [];

    const visualizations: Visualization[] = [];

    switch (type) {
      case 'TIMELINE':
        visualizations.push({
          type: 'TIMELINE',
          title: 'Security Events Timeline',
          data: (data.timelineData as VisualizationData) || this.generateSampleTimelineData(),
          config: { showGrid: true, zoomable: true },
          description: 'Chronological view of security events'
        });
        break;
        
      case 'HEATMAP':
        visualizations.push({
          type: 'HEATMAP',
          title: 'Threat Risk Heatmap',
          data: (data.heatmapData as VisualizationData) || this.generateSampleHeatmapData(),
          config: { colorScale: 'risk', interactive: true },
          description: 'Risk intensity across different areas'
        });
        break;
        
      case 'CHART':
        visualizations.push({
          type: 'CHART',
          title: 'Security Metrics',
          data: (data.chartData as VisualizationData) || this.generateSampleChartData(),
          config: { type: 'line', animated: true },
          description: 'Key security performance indicators'
        });
        break;
        
      case 'TABLE':
        visualizations.push({
          type: 'TABLE',
          title: 'Detailed Data',
          data: (data.tableData as VisualizationData) || this.generateSampleTableData(),
          config: { sortable: true, filterable: true },
          description: 'Tabular view of security data'
        });
        break;
    }

    return visualizations;
  }

  private generateRecommendedActions(query: SecurityQuery, data: SecurityData): RecommendedAction[] {
    const actions: RecommendedAction[] = [];

    // Generate actions based on intent and data
    switch (query.intent.primary) {
      case 'SHOW_ANOMALIES':
        if (data?.anomalies?.length > 0) {
          actions.push({
            action: 'INVESTIGATE_ANOMALIES',
            description: 'Investigate detected anomalies for potential threats',
            urgency: 'MEDIUM',
            estimatedTime: '15-30 minutes',
            prerequisites: ['Access to security logs'],
            risks: ['Potential false positives']
          });
        }
        break;
        
      case 'THREAT_ANALYSIS':
        actions.push({
          action: 'UPDATE_SECURITY_CONTROLS',
          description: 'Update security controls based on threat analysis',
          urgency: data?.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
          estimatedTime: '1-2 hours',
          prerequisites: ['Administrative access', 'Change approval'],
          risks: ['Service disruption during updates']
        });
        break;
        
      case 'INCIDENT_RESPONSE':
        actions.push({
          action: 'ESCALATE_INCIDENT',
          description: 'Escalate incident to security team',
          urgency: 'CRITICAL',
          estimatedTime: 'Immediate',
          prerequisites: ['Incident details', 'Contact information'],
          risks: ['Potential data exposure if delayed']
        });
        break;
    }

    return actions;
  }

  private generateFollowUpSuggestions(query: SecurityQuery, data: SecurityData): string[] {
    const suggestions: string[] = [];

    // Generate contextual follow-up questions
    switch (query.intent.primary) {
      case 'SHOW_ANOMALIES':
        suggestions.push(
          'Would you like to see details for any specific anomaly?',
          'Should I analyze the root cause of these anomalies?',
          'Do you want to set up alerts for similar anomalies?'
        );
        break;
        
      case 'THREAT_ANALYSIS':
        suggestions.push(
          'Would you like me to generate a detailed threat report?',
          'Should I check for similar threats in other systems?',
          'Do you want to implement the recommended countermeasures?'
        );
        break;
        
      case 'MONITORING_STATUS':
        suggestions.push(
          'Would you like to see historical trends?',
          'Should I set up monitoring alerts?',
          'Do you want to drill down into specific metrics?'
        );
        break;
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  private calculateResponseConfidence(query: SecurityQuery, data: SecurityData): number {
    let confidence = query.intent.confidence;

    // Boost confidence if we have good data
    if (data) {
      confidence += 0.1;
      
      // More data points = higher confidence
      if (data.count && data.count > 10) confidence += 0.05;
      if (data.metrics) confidence += 0.05;
      if (data.recommendations) confidence += 0.05;
    }

    return Math.min(0.99, confidence);
  }

  private identifySources(query: SecurityQuery, data: SecurityData): string[] {
    const sources = ['Security Analytics Engine'];
    
    if (data?.sourceTypes) {
      sources.push(...(data.sourceTypes as string[]));
    } else {
      // Default sources based on intent
      switch (query.intent.primary) {
        case 'SHOW_ANOMALIES':
          sources.push('Anomaly Detection System');
          break;
        case 'THREAT_ANALYSIS':
          sources.push('Threat Intelligence Database');
          break;
        case 'MONITORING_STATUS':
          sources.push('System Monitoring Service');
          break;
      }
    }
    
    return sources;
  }

  private generateFallbackResponse(query: SecurityQuery): SecurityResponse {
    return {
      queryId: query.id,
      text: "I'm not sure how to handle that request. Could you please rephrase or provide more details?",
      confidence: 0.3,
      sources: ['Security Assistant'],
      followUpSuggestions: [
        'Try asking about system status',
        'Ask about recent anomalies',
        'Request a threat analysis'
      ],
      processingTime: 0,
      timestamp: Date.now()
    };
  }

  // Sample data generators for visualizations
  private generateSampleTimelineData(): VisualizationData {
    return {
      labels: ['10:30', '11:15', '12:00'],
      values: [Date.now() - 3600000, Date.now() - 1800000, Date.now() - 900000],
      categories: ['Anomaly Detected', 'Threat Blocked', 'System Update'],
      events: [
        { time: Date.now() - 3600000, type: 'anomaly', severity: 'medium' },
        { time: Date.now() - 1800000, type: 'alert', severity: 'high' },
        { time: Date.now() - 900000, type: 'resolved', severity: 'low' }
      ]
    };
  }

  private generateSampleHeatmapData(): VisualizationData {
    return {
      values: [0.1, 0.3, 0.8, 0.4, 0.7, 0.2, 0.9, 0.1, 0.5],
      categories: ['Network', 'Endpoints', 'Cloud'],
      labels: ['Low', 'Medium', 'High'],
      matrix: [
        [0.1, 0.3, 0.8],
        [0.4, 0.7, 0.2],
        [0.9, 0.1, 0.5]
      ],
      heatmapLabels: { x: ['Network', 'Endpoints', 'Cloud'], y: ['Low', 'Medium', 'High'] }
    };
  }

  private generateSampleChartData(): VisualizationData {
    return {
      series: [{
        name: 'Threat Level',
        data: [0.2, 0.4, 0.6, 0.3, 0.5, 0.7, 0.4]
      }],
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };
  }

  private generateSampleTableData(): VisualizationData {
    return {
      labels: ['Time', 'Event', 'Severity', 'Status'],
      rows: [
        { Time: '10:30', Event: 'Anomaly Detected', Severity: 'Medium', Status: 'Investigating' },
        { Time: '11:15', Event: 'Threat Blocked', Severity: 'High', Status: 'Resolved' },
        { Time: '12:00', Event: 'System Update', Severity: 'Low', Status: 'Complete' }
      ],
      headers: ['Time', 'Event', 'Severity', 'Status'],
      tableData: [
        ['10:30', 'Anomaly Detected', 'Medium', 'Investigating'],
        ['11:15', 'Threat Blocked', 'High', 'Resolved'],
        ['12:00', 'System Update', 'Low', 'Complete']
      ]
    };
  }
}

// Main Security Assistant
export class SecurityAssistant extends EventEmitter {
  private nlpEngine: SecurityNLPEngine;
  private intentClassifier: SecurityIntentClassifier;
  private entityExtractor: SecurityQueryEntityExtractor;
  private responseGenerator: SecurityResponseGenerator;
  private conversations: Map<string, ConversationContext> = new Map();
  private conversationFlows: Map<string, ConversationFlow> = new Map();
  private isInitialized: boolean = false;

  private logger = getLogger();
  private monitoring: MonitoringService;

  constructor(
    nlpEngine?: SecurityNLPEngine,
    intentClassifier?: SecurityIntentClassifier,
    entityExtractor?: SecurityQueryEntityExtractor,
    responseGenerator?: SecurityResponseGenerator
  ) {
    super();

    // Use provided dependencies or create defaults
    this.nlpEngine = nlpEngine || new SecurityNLPEngine();
    this.intentClassifier = intentClassifier || new SecurityIntentClassifier();
    this.entityExtractor = entityExtractor || new SecurityQueryEntityExtractor();
    this.responseGenerator = responseGenerator || new SecurityResponseGenerator();

    // Initialize error handling system
    ErrorHandler.initializeWithLogger();

    // Initialize monitoring service
    this.monitoring = createMonitoringService(this.logger, {
      enabled: true,
      metricsInterval: 30000,
      healthCheckInterval: 60000
    });

    // Register health check
    this.monitoring.registerHealthCheck('SecurityAssistant', async () => ({
      service: 'SecurityAssistant',
      status: this.isInitialized ? 'healthy' : 'degraded',
      lastCheck: new Date(),
      uptime: process.uptime(),
      metrics: {
        requestsTotal: this.conversations.size,
        requestsPerSecond: 0,
        averageResponseTime: 0,
        errorRate: 0,
        memoryUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        cpuUsage: 0,
        activeConnections: this.conversations.size,
        queueDepth: 0
      },
      dependencies: []
    }));

    this.initialize();
  }

  private async initialize(): Promise<void> {
    const context = createErrorContext('SecurityAssistant', 'initialize');

    try {
      this.logger.info('Initializing Security Assistant...', context);

      // Wait for NLP engine to initialize
      await withErrorHandling(
        () => new Promise<void>((resolve, reject) => {
          if (this.nlpEngine.getProcessingStatistics().isInitialized) {
            resolve();
          } else {
            this.nlpEngine.once('initialized', resolve);
            // Add timeout for safety
            setTimeout(() => {
              reject(new Error('NLP Engine initialization timeout'));
            }, 30000); // 30 second timeout
          }
        }),
        createErrorContext('SecurityAssistant', 'nlp_engine_initialization'),
        () => { throw new InternalError('NLP Engine failed to initialize', context); }
      );

      this.isInitialized = true;

      const capabilities = this.getCapabilities();
      this.emit('initialized', {
        capabilities,
        timestamp: Date.now()
      });

      this.logger.info('Security Assistant initialized successfully', {
        ...context,
        metadata: { capabilities: Object.keys(capabilities) }
      });

    } catch (error) {
      const baseError = ErrorHandler.handle(error, context);
      this.logger.error('Failed to initialize Security Assistant', context, baseError);
      this.emit('error', { type: 'initialization', error: baseError });
      throw baseError;
    }
  }

  async processQuery(
    query: SecurityQuery,
    sessionId: string,
    options?: {
      userId?: string;
      urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      context?: Partial<ConversationContext>;
    }
  ): Promise<SecurityResponse> {
    const context = createErrorContext('SecurityAssistant', 'processQuery', options?.userId, sessionId, query.id);
    const endTimer = this.logger.startTimer('processQuery', context);
    const startTime = Date.now();

    // Validate and sanitize inputs
    const sanitizedQuery = sanitizeQuery(query.text);

    try {
      if (!this.isInitialized) {
        throw new InternalError('Security Assistant not initialized', context);
      }
      if (sanitizedQuery !== query.text) {
        this.logger.warn('Query text was sanitized', { ...context, metadata: { originalLength: query.text.length, sanitizedLength: sanitizedQuery.length } });
      }

      const queryValidation = validateSecurityQuery(sanitizedQuery, context);
      if (!queryValidation.isValid) {
        throw queryValidation.errors[0]; // Throw first validation error
      }

      const sessionValidation = validateSessionId(sessionId, context);
      if (!sessionValidation.isValid) {
        throw sessionValidation.errors[0];
      }

      const startTime = Date.now();
      const queryId = query.id || `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.logger.debug('Processing security query', { ...context, metadata: { queryText: sanitizedQuery.substring(0, 100) } });

      // Get or create conversation context
      const conversationContext = this.getOrCreateContext(sessionId, options);

      // Analyze the query text with error handling
      const textAnalysis = await withErrorHandling(
        () => this.nlpEngine.analyzeText(query.text),
        createErrorContext('SecurityAssistant', 'nlp_analysis', options?.userId, sessionId, queryId),
        null
      );

      if (!textAnalysis) {
        throw new ValidationError('Failed to analyze query text', context, 'text');
      }

      // Classify intent with error handling
      const intent = await withErrorHandling(
        () => this.intentClassifier.classifyIntent(query.text),
        createErrorContext('SecurityAssistant', 'intent_classification', options?.userId, sessionId, queryId),
        { primary: 'UNKNOWN', confidence: 0, category: 'INVESTIGATION' as const }
      );

      // Extract entities with error handling
      const entities = await withErrorHandling(
        () => this.entityExtractor.extractEntities(query.text),
        createErrorContext('SecurityAssistant', 'entity_extraction', options?.userId, sessionId, queryId),
        []
      );

      // Determine urgency
      const urgency = options?.urgency || this.determineUrgency(textAnalysis, intent);

      // Create security query
      const securityQuery: SecurityQuery = {
        id: queryId,
        text: sanitizedQuery, // Use sanitized query text
        intent,
        entities,
        context: conversationContext,
        urgency,
        timestamp: Date.now()
      };

      // Update conversation context
      this.updateConversationContext(sessionId, securityQuery);

      // Generate response data with error handling
      const responseData = await withErrorHandling(
        () => this.fetchResponseData(securityQuery),
        createErrorContext('SecurityAssistant', 'response_data_fetch', options?.userId, sessionId, queryId),
        {}
      );

      // Generate response with error handling
      const response = await withErrorHandling(
        () => this.responseGenerator.generateResponse(securityQuery, responseData, conversationContext),
        createErrorContext('SecurityAssistant', 'response_generation', options?.userId, sessionId, queryId),
        {
          text: 'I apologize, but I encountered an error processing your request. Please try again.',
          confidence: 0,
          intent: 'ERROR',
          entities: [],
          processingTime: Date.now() - startTime,
          queryId
        }
      );

      response.processingTime = Date.now() - startTime;
      response.queryId = queryId;

      this.logger.info('Query processed successfully', {
        ...context,
        metadata: {
          intent: intent.primary,
          urgency,
          processingTime: response.processingTime,
          entityCount: entities.length
        }
      });

      this.emit('query_processed', {
        queryId,
        sessionId,
        intent: intent.primary,
        urgency,
        processingTime: response.processingTime,
        timestamp: Date.now()
      });

      // Record performance metrics
      this.monitoring.recordPerformanceMetrics('SecurityAssistant', {
        responseTime: response.processingTime,
        memoryUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        throughput: 1,
        errorRate: 0
      }, context);

      // Audit successful query processing
      this.logger.audit('Security query processed successfully', context, {
        action: 'query_processing',
        resource: queryId,
        resourceType: 'security_query',
        compliance: ['data_processing', 'user_tracking']
      });

      endTimer();
      return response;

    } catch (error) {
      endTimer();
      const baseError = ErrorHandler.handle(error, context);

      // Record error metrics and security events
      this.monitoring.recordPerformanceMetrics('SecurityAssistant', {
        responseTime: Date.now() - startTime,
        memoryUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        errorRate: 100
      }, context);

      // Record security event if it's a security-related error
      if (error instanceof SecurityError || error instanceof ValidationError) {
        this.monitoring.recordSecurityEvent(
          'query_processing_failed',
          baseError.severity === 'critical' ? 'high' : baseError.severity === 'high' ? 'medium' : 'low',
          context,
          {
            errorType: baseError.category,
            errorCode: baseError.code,
            queryText: sanitizedQuery?.substring(0, 100)
          },
          baseError.severity === 'critical' ? 80 : baseError.severity === 'high' ? 60 : 30
        );
      }

      this.logger.error('Query processing failed', context, baseError);
      this.emit('error', { type: 'query_processing', error: baseError, queryId: context.requestId });
      throw baseError;
    }
  }

  async startConversationFlow(
    flowType: string, 
    sessionId: string
  ): Promise<{ question: string; flowId: string }> {
    const flowId = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const flow = this.createConversationFlow(flowType);
    this.conversationFlows.set(flowId, flow);

    return {
      question: flow.steps[0].question,
      flowId
    };
  }

  async continueConversationFlow(
    flowId: string,
    response: string
  ): Promise<{ question?: string; result?: SecurityData; isComplete: boolean }> {
    const flow = this.conversationFlows.get(flowId);
    if (!flow) {
      throw new Error('Conversation flow not found');
    }

    const currentStep = flow.steps.find(s => s.id === flow.currentStep);
    if (!currentStep) {
      throw new Error('Invalid flow state');
    }

    // Validate response if validator exists
    if (currentStep.validation && !currentStep.validation(response)) {
      return {
        question: `Invalid response. ${currentStep.question}`,
        isComplete: false
      };
    }

    // Store response in context
    flow.context[currentStep.id] = response;

    // Move to next step
    if (currentStep.nextStep) {
      flow.currentStep = currentStep.nextStep;
      const nextStep = flow.steps.find(s => s.id === currentStep.nextStep);
      
      return {
        question: nextStep?.question,
        isComplete: false
      };
    } else {
      // Flow complete
      flow.isComplete = true;
      const result = await this.processFlowResult(flow);
      
      return {
        result,
        isComplete: true
      };
    }
  }

  getConversationHistory(sessionId: string): string[] {
    const context = this.conversations.get(sessionId);
    return context?.previousQueries || [];
  }

  updateUserPreferences(
    sessionId: string, 
    preferences: Partial<ConversationContext['preferences']>
  ): void {
    const context = this.conversations.get(sessionId);
    if (context) {
      context.preferences = { ...context.preferences, ...preferences };
      this.conversations.set(sessionId, context);
    }
  }

  getCapabilities(): Record<string, unknown> {
    return {
      naturalLanguageProcessing: true,
      intentClassification: true,
      entityExtraction: true,
      contextualConversation: true,
      securityDomainExpertise: true,
      multiModalResponses: true,
      conversationFlows: true,
      realTimeData: true,
      supportedIntents: Array.from(this.intentClassifier['intentPatterns'].keys()),
      supportedEntities: Array.from(this.entityExtractor['entityPatterns'].keys()),
      languages: ['en'], // Expandable
      responseFormats: ['text', 'structured', 'visualizations', 'actions']
    };
  }

  getStatistics(): Record<string, unknown> {
    return {
      activeConversations: this.conversations.size,
      activeFlows: this.conversationFlows.size,
      isInitialized: this.isInitialized,
      nlpStats: this.nlpEngine.getProcessingStatistics(),
      capabilities: this.getCapabilities(),
      timestamp: Date.now()
    };
  }

  private getOrCreateContext(
    sessionId: string,
    options?: ContextOptions
  ): ConversationContext {
    let context = this.conversations.get(sessionId);

    if (!context) {
      context = {
        sessionId,
        userId: options?.userId,
        previousQueries: [],
        securityContext: {
          clearanceLevel: 'MEDIUM',
          accessibleSystems: ['monitoring', 'alerts', 'reports'],
          currentIncidents: []
        },
        preferences: {
          verbosity: 'DETAILED',
          visualizations: true,
          realTimeUpdates: true
        },
        ...options?.context
      };

      this.conversations.set(sessionId, context);
    }

    return context;
  }

  private determineUrgency(
    textAnalysis: { sentiment: { urgency: number } },
    intent: QueryIntent
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (textAnalysis.sentiment.urgency > 0.7) return 'CRITICAL';
    if (textAnalysis.sentiment.urgency > 0.5) return 'HIGH';
    if (intent.category === 'RESPONSE') return 'HIGH';
    if (intent.category === 'INVESTIGATION') return 'MEDIUM';
    return 'LOW';
  }

  private updateConversationContext(sessionId: string, query: SecurityQuery): void {
    const context = this.conversations.get(sessionId);
    if (context) {
      context.previousQueries.push(query.text);
      context.currentTopic = query.intent.primary;

      // Keep only recent queries
      if (context.previousQueries.length > 10) {
        context.previousQueries = context.previousQueries.slice(-10);
      }
    }
  }

  private async fetchResponseData(query: SecurityQuery): Promise<SecurityData> {
    // This would integrate with actual security systems
    // For now, return mock data based on intent

    switch (query.intent.primary) {
      case 'SHOW_ANOMALIES':
        return {
          count: Math.floor(Math.random() * 10) + 1,
          anomalies: [
            { type: 'network_spike', description: 'Network spike detected' },
            { type: 'unusual_login', description: 'Unusual login activity' }
          ]
        };

      case 'THREAT_ANALYSIS':
        return {
          riskLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as 'LOW' | 'MEDIUM' | 'HIGH',
          threats: [
            { id: 'malware', severity: 'HIGH', description: 'Malware detected' },
            { id: 'phishing', severity: 'MEDIUM', description: 'Phishing attempt detected' }
          ],
          recommendations: [
            { id: 'update_firewall', priority: 'HIGH', description: 'Update firewall rules' },
            { id: 'patch_systems', priority: 'MEDIUM', description: 'Apply system patches' }
          ]
        };

      case 'MONITORING_STATUS':
        return {
          status: 'HEALTHY',
          metrics: {
            systemHealth: 95,
            threatLevel: 'LOW',
            activeAlerts: 3
          }
        };

      default:
        return {} as SecurityData;
    }
  }

  private createConversationFlow(flowType: string): ConversationFlow {
    // Example flow for incident investigation
    if (flowType === 'incident_investigation') {
      return {
        currentStep: 'incident_type',
        steps: [
          {
            id: 'incident_type',
            question: 'What type of security incident are you investigating?',
            expectedResponse: 'string',
            nextStep: 'time_range'
          },
          {
            id: 'time_range',
            question: 'What time range should I analyze?',
            expectedResponse: 'time_range',
            nextStep: 'affected_systems'
          },
          {
            id: 'affected_systems',
            question: 'Which systems are potentially affected?',
            expectedResponse: 'string'
          }
        ],
        context: {
          sessionId: '',
          previousQueries: [],
          securityContext: {
            clearanceLevel: 'MEDIUM',
            accessibleSystems: [],
            currentIncidents: []
          },
          preferences: {
            verbosity: 'DETAILED',
            visualizations: true,
            realTimeUpdates: true
          }
        },
        isComplete: false
      };
    }

    // Default flow
    return {
      currentStep: 'general',
      steps: [
        {
          id: 'general',
          question: 'How can I help you with security operations today?',
          expectedResponse: 'string'
        }
      ],
      context: {},
      isComplete: false
    };
  }

  private async processFlowResult(flow: ConversationFlow): Promise<SecurityData> {
    // Process the completed flow context to generate results
    return {
      recommendations: [
        { id: 'review_findings', priority: 'HIGH', description: 'Review findings' },
        { id: 'take_action', priority: 'MEDIUM', description: 'Take appropriate action' }
      ]
    };
  }
}

interface ContextOptions {
  userId?: string;
  context?: Partial<ConversationContext>;
}

// Type definitions for security assistant
interface FlowResult {
  summary: string;
  data: Record<string, unknown>;
  recommendations: string[];
}

export default SecurityAssistant;
