
/**
 * Security orchestrator service
 * Coordinates security services and operations
 */

import { EventEmitter } from 'events';
import { SecurityNLPEngine } from './nlpEngine';
import { SecurityAssistant } from './securityAssistant';
import { SecurityKnowledgeGraph } from './knowledgeGraph';
import { SecurityContextEngine, SecurityContext, RiskLevel, AlertLevel } from './contextEngine';
import { SecurityReportGenerator, SecurityReport, ReportType } from './reportGenerator';

// Interfaces
interface CognitiveSession {
  id: string;
  userId: string;
  startTime: number;
  lastActivity: number;
  context: SessionContext;
  history: CognitiveInteraction[];
  status: SessionStatus;
  capabilities: string[];
  metadata: SessionMetadata;
}

interface SessionContext {
  securityContext?: SecurityContext;
  activeThreats: string[];
  focusAreas: string[];
  preferences: UserPreferences;
  clearanceLevel: SecurityClearanceLevel;
  organizationalRole: string;
}

interface CognitiveInteraction {
  id: string;
  timestamp: number;
  type: InteractionType;
  input: string | object;
  output: string | object | SecurityReport;
  processingTime: number;
  servicesUsed: string[];
  confidence: number;
  feedback?: InteractionFeedback;
}

interface InteractionFeedback {
  rating: number; // 1-5
  helpful: boolean;
  accurate: boolean;
  complete: boolean;
  comments?: string;
  suggestions?: string[];
}

interface UserPreferences {
  reportFormats: string[];
  notificationSettings: NotificationSettings;
  visualizationPreferences: VisualizationPreferences;
  alertThresholds: AlertThresholds;
  languageSettings: LanguageSettings;
}

interface NotificationSettings {
  criticalAlerts: boolean;
  reportGeneration: boolean;
  threatUpdates: boolean;
  complianceChanges: boolean;
  channels: NotificationChannel[];
}

interface VisualizationPreferences {
  chartTypes: string[];
  colorScheme: string;
  detailLevel: 'SUMMARY' | 'DETAILED' | 'COMPREHENSIVE';
  interactiveElements: boolean;
}

interface AlertThresholds {
  riskLevelThreshold: RiskLevel;
  threatSeverityThreshold: string;
  complianceViolationThreshold: number;
  customThresholds: { [metric: string]: number };
}

interface LanguageSettings {
  primaryLanguage: string;
  technicalLevel: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  glossaryEnabled: boolean;
  translationEnabled: boolean;
}

interface SessionMetadata {
  clientInfo: string;
  location: string;
  sessionType: 'INTERACTIVE' | 'AUTOMATED' | 'SCHEDULED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  tags: string[];
}

interface WorkflowParameters {
  text?: string;
  data?: unknown;
  entities?: string[];
  entity?: KnowledgeGraphEntity;
  entityId?: string;
  depth?: number;
  query?: string;
  reportType?: ReportType;
  options?: Record<string, unknown>;
  [key: string]: unknown;
}

interface KnowledgeGraphEntity {
  type: string;
  id: string;
  name?: string;
}

interface WorkflowContext {
  [key: string]: unknown;
  session?: CognitiveSession;
}

interface PipelineInput {
  [key: string]: unknown;
  timestamp?: number;
  processed?: boolean;
  inputType?: string;
  threats?: unknown[];
  query?: string;
  analysisType?: string;
  securityData?: unknown;
  reportType?: string;
  recipients?: string[];
  format?: string[];
  includeCharts?: boolean;
  includeTables?: boolean;
  threatId?: string;
  threat?: { id: string; type?: string; severity?: string };
  description?: string;
  framework?: string;
  workflowId?: string;
  parameters?: WorkflowParameters;
}

interface PipelineOutput {
  [key: string]: unknown;
  executionId?: string;
  result?: unknown;
  processingTime?: number;
  stepsExecuted?: number;
  summary?: string;
  details?: unknown;
  metadata?: {
    processingTime?: number;
    confidence?: number;
    version?: string;
  };
}

interface ServiceStatus {
  nlpEngine: string;
  securityAssistant: string;
  knowledgeGraph: string;
  contextEngine: string;
  reportGenerator: string;
}

interface OrchestratorCapabilities {
  cognitiveServices: {
    naturalLanguageProcessing: boolean;
    conversationalAI: boolean;
    knowledgeGraphQueries: boolean;
    contextualAnalysis: boolean;
    reportGeneration: boolean;
  };
  orchestrationFeatures: {
    sessionManagement: boolean;
    workflowExecution: boolean;
    cognitivePipelines: boolean;
    performanceMonitoring: boolean;
    serviceIntegration: boolean;
  };
  interactionTypes: string[];
  supportedFormats: string[];
  securityClearanceLevels: string[];
}

interface OrchestratorStatistics {
  activeSessions: number;
  availableWorkflows: number;
  performanceMetrics: Record<string, unknown>;
  serviceStatus: ServiceStatus;
  isInitialized: boolean;
  timestamp: number;
}

interface ThreatInfo {
  id?: string;
  properties?: {
    name?: string;
  };
}

interface MitreInfo {
  techniques?: string[];
  tactics?: string[];
  mitigations?: string[];
}

interface WorkflowResult {
  stepId: string;
  result: unknown;
  duration: number;
}

interface PerformanceMetrics {
  interactions_processed: number;
  average_processing_time: number;
  service_usage: Map<string, number>;
  error_count: number;
  session_count: number;
}

interface CognitiveWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  outputs: WorkflowOutput[];
  schedule?: WorkflowSchedule;
  enabled: boolean;
}

interface WorkflowTrigger {
  type: 'EVENT' | 'SCHEDULE' | 'MANUAL' | 'THRESHOLD';
  condition: string;
  parameters: WorkflowParameters;
}

interface WorkflowStep {
  id: string;
  type: 'NLP' | 'CONTEXT_ANALYSIS' | 'KNOWLEDGE_QUERY' | 'REPORT_GENERATION' | 'NOTIFICATION';
  service: string;
  method: string;
  parameters: WorkflowParameters;
  dependencies: string[];
  timeout: number;
}

interface WorkflowCondition {
  id: string;
  expression: string;
  action: 'CONTINUE' | 'SKIP' | 'TERMINATE' | 'BRANCH';
  target?: string;
}

interface WorkflowOutput {
  type: 'REPORT' | 'ALERT' | 'NOTIFICATION' | 'DATA_UPDATE';
  destination: string[];
  format: string;
  template?: string;
}

interface WorkflowSchedule {
  frequency: string;
  time?: string;
  days?: string[];
  timezone: string;
}

type InteractionType =
  | 'QUERY'
  | 'ANALYSIS_REQUEST'
  | 'REPORT_GENERATION'
  | 'CONTEXT_UPDATE'
  | 'THREAT_INVESTIGATION'
  | 'COMPLIANCE_CHECK'
  | 'WORKFLOW_EXECUTION';

type SessionStatus = 'ACTIVE' | 'IDLE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED';

type SecurityClearanceLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';

type NotificationChannel = 'EMAIL' | 'SMS' | 'SLACK' | 'TEAMS' | 'WEBHOOK' | 'IN_APP';

// Cognitive Pipeline Components
class CognitivePipeline {
  private steps: Map<string, CognitivePipelineStep> = new Map();
  private isExecuting: boolean = false;

  constructor() {
    this.initializePipelineSteps();
  }

  async execute(input: PipelineInput, selectedSteps?: string[]): Promise<PipelineOutput> {
    if (this.isExecuting) {
      throw new Error('Pipeline is already executing');
    }

    this.isExecuting = true;
    const startTime = Date.now();
    const executionId = `pipeline_${Date.now()}`;
    let result = input;

    try {
      const stepsToExecute = selectedSteps || Array.from(this.steps.keys());

      for (const stepId of stepsToExecute) {
        const step = this.steps.get(stepId);
        if (!step) continue;

        const stepStartTime = Date.now();
        result = await step.execute(result);
        const stepDuration = Date.now() - stepStartTime;

        console.log(`✅ Pipeline step ${stepId} completed in ${stepDuration}ms`);
      }

      console.log(`🔄 Cognitive pipeline execution completed in ${Date.now() - startTime}ms`);
      return {
        executionId,
        result,
        processingTime: Date.now() - startTime,
        stepsExecuted: stepsToExecute.length
      };
    } finally {
      this.isExecuting = false;
    }
  }

  private initializePipelineSteps(): void {
    this.steps.set('input_processing', new InputProcessingStep());
    this.steps.set('context_enrichment', new ContextEnrichmentStep());
    this.steps.set('threat_analysis', new ThreatAnalysisStep());
    this.steps.set('risk_assessment', new RiskAssessmentStep());
    this.steps.set('recommendation_generation', new RecommendationGenerationStep());
    this.steps.set('output_formatting', new OutputFormattingStep());
  }
}

abstract class CognitivePipelineStep {
  abstract execute(input: PipelineInput): Promise<PipelineOutput>;
}

class InputProcessingStep extends CognitivePipelineStep {
  async execute(input: PipelineInput): Promise<PipelineOutput> {
    // Normalize and validate input data
    return {
      ...input,
      timestamp: input.timestamp || Date.now(),
      processed: true,
      inputType: this.detectInputType(input)
    };
  }

  private detectInputType(input: PipelineInput): string {
    if (typeof input === 'string') return 'TEXT';
    if (input.query) return 'QUERY';
    if (input.threats) return 'THREAT_DATA';
    if (input.securityData) return 'ASSET_DATA';
    return 'UNKNOWN';
  }
}

class ContextEnrichmentStep extends CognitivePipelineStep {
  async execute(input: PipelineInput): Promise<PipelineOutput> {
    // Enrich input with contextual information
    return {
      ...input,
      enriched: true,
      contextualData: {
        businessHours: this.isBusinessHours(),
        timeZone: 'UTC',
        organizationalContext: 'enterprise',
        environmentType: 'production'
      }
    };
  }

  private isBusinessHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
  }
}

class ThreatAnalysisStep extends CognitivePipelineStep {
  async execute(input: PipelineInput): Promise<PipelineOutput> {
    // Analyze threats in the input
    const threats = input.threats || [];
    const threatAnalysis = {
      totalThreats: threats.length,
      criticalThreats: threats.filter((t: unknown) => this.isCriticalThreat(t)).length,
      activeThreatTypes: this.analyzeThreatTypes(threats),
      threatTrend: 'STABLE' // Mock analysis
    };

    return {
      ...input,
      threatAnalysis
    };
  }

  private isCriticalThreat(threat: unknown): boolean {
    if (typeof threat === 'object' && threat !== null && 'severity' in threat) {
      return (threat as { severity: string }).severity === 'CRITICAL';
    }
    return false;
  }

  private analyzeThreatTypes(threats: unknown[]): string[] {
    const types = new Set<string>();
    for (const threat of threats) {
      if (typeof threat === 'object' && threat !== null && 'type' in threat) {
        const threatType = (threat as { type?: string }).type;
        if (threatType) types.add(threatType);
      }
    }
    return Array.from(types);
  }
}

class RiskAssessmentStep extends CognitivePipelineStep {
  async execute(input: PipelineInput): Promise<PipelineOutput> {
    // Assess risk based on input data
    const riskScore = this.calculateRiskScore(input);
    const riskLevel = this.determineRiskLevel(riskScore);

    return {
      ...input,
      riskAssessment: {
        score: riskScore,
        level: riskLevel,
        factors: this.identifyRiskFactors(input)
      }
    };
  }

  private calculateRiskScore(input: PipelineInput): number {
    let score = 0.3; // Base risk

    if (input.threatAnalysis && typeof input.threatAnalysis === 'object') {
      const threatAnalysis = input.threatAnalysis as { criticalThreats?: number; totalThreats?: number };
      if (threatAnalysis.criticalThreats && threatAnalysis.criticalThreats > 0) {
        score += 0.4;
      }
      if (threatAnalysis.totalThreats && threatAnalysis.totalThreats > 10) {
        score += 0.2;
      }
    }

    if (input.contextualData && typeof input.contextualData === 'object') {
      const contextualData = input.contextualData as { businessHours?: boolean };
      if (contextualData.businessHours === false) {
        score += 0.1; // Higher risk during off-hours
      }
    }

    return Math.min(1.0, score);
  }

  private determineRiskLevel(score: number): RiskLevel {
    if (score >= 0.8) return 'CRITICAL';
    if (score >= 0.6) return 'HIGH';
    if (score >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  private identifyRiskFactors(input: PipelineInput): string[] {
    const factors = [];

    if (input.threatAnalysis && typeof input.threatAnalysis === 'object') {
      const threatAnalysis = input.threatAnalysis as { criticalThreats?: number; totalThreats?: number };
      if (threatAnalysis.criticalThreats && threatAnalysis.criticalThreats > 0) {
        factors.push('Critical threats present');
      }
      if (threatAnalysis.totalThreats && threatAnalysis.totalThreats > 10) {
        factors.push('High threat volume');
      }
    }

    if (input.contextualData && typeof input.contextualData === 'object') {
      const contextualData = input.contextualData as { businessHours?: boolean };
      if (!contextualData.businessHours) {
        factors.push('Off-hours operation');
      }
    }

    return factors;
  }
}

class RecommendationGenerationStep extends CognitivePipelineStep {
  async execute(input: PipelineInput): Promise<PipelineOutput> {
    const recommendations = this.generateRecommendations(input);

    return {
      ...input,
      recommendations
    };
  }

  private generateRecommendations(input: PipelineInput): unknown[] {
    const recommendations = [];

    if (input.riskAssessment && typeof input.riskAssessment === 'object') {
      const riskAssessment = input.riskAssessment as { level?: string };
      if (riskAssessment.level === 'CRITICAL') {
        recommendations.push({
          priority: 'CRITICAL',
          title: 'Immediate Threat Response',
          description: 'Critical risk level detected - activate incident response procedures',
          timeline: 'Immediate'
        });
      }
    }

    if (input.threatAnalysis && typeof input.threatAnalysis === 'object') {
      const threatAnalysis = input.threatAnalysis as { criticalThreats?: number };
      if (threatAnalysis.criticalThreats && threatAnalysis.criticalThreats > 0) {
        recommendations.push({
          priority: 'HIGH',
          title: 'Address Critical Threats',
          description: `${threatAnalysis.criticalThreats} critical threats require immediate attention`,
          timeline: '1-2 hours'
        });
      }
    }

    if (input.threatAnalysis && typeof input.threatAnalysis === 'object') {
      const threatAnalysis = input.threatAnalysis as { totalThreats?: number };
      if (threatAnalysis.totalThreats && threatAnalysis.totalThreats > 10) {
        recommendations.push({
          priority: 'MEDIUM',
          title: 'Enhanced Monitoring',
          description: 'High threat volume detected - increase monitoring frequency',
          timeline: '4-8 hours'
        });
      }
    }

    return recommendations;
  }
}

class OutputFormattingStep extends CognitivePipelineStep {
  async execute(input: PipelineInput): Promise<PipelineOutput> {
    return {
      summary: this.generateSummary(input),
      details: input,
      metadata: {
        processingTime: Date.now() - (input.timestamp || Date.now()),
        confidence: this.calculateConfidence(input),
        version: '1.0.0'
      }
    };
  }

  private generateSummary(input: PipelineInput): string {
    const parts = [];

    if (input.riskAssessment && typeof input.riskAssessment === 'object') {
      const riskAssessment = input.riskAssessment as { level?: string };
      if (riskAssessment.level) {
        parts.push(`Risk level: ${riskAssessment.level}`);
      }
    }

    if (input.threatAnalysis && typeof input.threatAnalysis === 'object') {
      const threatAnalysis = input.threatAnalysis as { totalThreats?: number };
      if (threatAnalysis.totalThreats) {
        parts.push(`${threatAnalysis.totalThreats} threats analyzed`);
      }
    }

    if (input.recommendations && Array.isArray(input.recommendations)) {
      parts.push(`${input.recommendations.length} recommendations generated`);
    }

    return parts.join('. ') + '.';
  }

  private calculateConfidence(input: PipelineInput): number {
    let confidence = 0.7; // Base confidence

    if (input.threatAnalysis) confidence += 0.1;
    if (input.riskAssessment) confidence += 0.1;
    if (input.contextualData) confidence += 0.1;

    return Math.min(1.0, confidence);
  }
}

// Main Cognitive Orchestrator
export class CognitiveSecurityOrchestrator extends EventEmitter {
  private nlpEngine: SecurityNLPEngine;
  private securityAssistant: SecurityAssistant;
  private knowledgeGraph: SecurityKnowledgeGraph;
  private contextEngine: SecurityContextEngine;
  private reportGenerator: SecurityReportGenerator;
  private cognitivePipeline: CognitivePipeline;

  private sessions: Map<string, CognitiveSession> = new Map();
  private workflows: Map<string, CognitiveWorkflow> = new Map();
  private isInitialized: boolean = false;
  private performanceMetrics: Map<string, unknown> = new Map();

  constructor() {
    super();
    this.cognitivePipeline = new CognitivePipeline();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize all cognitive services
      this.nlpEngine = new SecurityNLPEngine();
      this.securityAssistant = new SecurityAssistant();
      this.knowledgeGraph = new SecurityKnowledgeGraph();
      this.contextEngine = new SecurityContextEngine();
      this.reportGenerator = new SecurityReportGenerator();

      // Set up service event handlers
      this.setupServiceEventHandlers();

      // Initialize default workflows
      this.initializeDefaultWorkflows();

      // Initialize performance monitoring
      this.initializePerformanceMonitoring();

      this.isInitialized = true;

      this.emit('initialized', {
        services: this.getServiceStatus(),
        workflows: this.workflows.size,
        capabilities: this.getCapabilities(),
        timestamp: Date.now()
      });

      console.log('🧠 Cognitive Security Orchestrator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Cognitive Orchestrator:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  async createSession(
    userId: string,
    preferences?: UserPreferences,
    metadata?: Partial<SessionMetadata>
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Cognitive Orchestrator not initialized');
    }

    const sessionId = `session_${userId}_${Date.now()}`;
    const session: CognitiveSession = {
      id: sessionId,
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      context: {
        activeThreats: [],
        focusAreas: [],
        preferences: preferences || this.getDefaultPreferences(),
        clearanceLevel: 'INTERNAL',
        organizationalRole: 'security_analyst'
      },
      history: [],
      status: 'ACTIVE',
      capabilities: this.getAvailableCapabilities(),
      metadata: {
        clientInfo: 'CognitiveOrchestrator',
        location: 'Unknown',
        sessionType: 'INTERACTIVE',
        priority: 'NORMAL',
        tags: [],
        ...metadata
      }
    };

    this.sessions.set(sessionId, session);

    // Set up session cleanup after 4 hours of inactivity
    setTimeout(() => {
      this.cleanupInactiveSessions();
    }, 4 * 60 * 60 * 1000);

    this.emit('session_created', { sessionId, userId, timestamp: Date.now() });

    return sessionId;
  }

  async processInteraction(
    sessionId: string,
    input: PipelineInput,
    type: InteractionType = 'QUERY'
  ): Promise<unknown> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const startTime = Date.now();
    const interactionId = `interaction_${Date.now()}`;

    try {
      session.lastActivity = Date.now();

      let result;
      const servicesUsed: string[] = [];

      switch (type) {
        case 'QUERY':
          result = await this.processQuery(input, session, servicesUsed);
          break;
        case 'ANALYSIS_REQUEST':
          result = await this.processAnalysisRequest(input, session, servicesUsed);
          break;
        case 'REPORT_GENERATION':
          result = await this.processReportGeneration(input, session, servicesUsed);
          break;
        case 'CONTEXT_UPDATE':
          result = await this.processContextUpdate(input, session, servicesUsed);
          break;
        case 'THREAT_INVESTIGATION':
          result = await this.processThreatInvestigation(input, session, servicesUsed);
          break;
        case 'COMPLIANCE_CHECK':
          result = await this.processComplianceCheck(input, session, servicesUsed);
          break;
        case 'WORKFLOW_EXECUTION':
          result = await this.executeWorkflow(input.workflowId, input.parameters, session);
          servicesUsed.push('WorkflowEngine');
          break;
        default:
          throw new Error(`Unsupported interaction type: ${type}`);
      }

      const processingTime = Date.now() - startTime;
      const confidence = this.calculateInteractionConfidence(result, servicesUsed);

      const interaction: CognitiveInteraction = {
        id: interactionId,
        timestamp: Date.now(),
        type,
        input,
        output: result,
        processingTime,
        servicesUsed,
        confidence
      };

      session.history.push(interaction);

      // Limit history size
      if (session.history.length > 100) {
        session.history = session.history.slice(-50);
      }

      this.updatePerformanceMetrics(type, processingTime, servicesUsed);

      this.emit('interaction_processed', {
        sessionId,
        interactionId,
        type,
        processingTime,
        confidence,
        timestamp: Date.now()
      });

      return {
        interactionId,
        result,
        confidence,
        processingTime,
        servicesUsed
      };
    } catch (error) {
      console.error(`❌ Interaction processing failed for session ${sessionId}:`, error);
      this.emit('error', { type: 'interaction_processing', sessionId, error });
      throw error;
    }
  }

  async executeWorkflow(
    workflowId: string,
    parameters: WorkflowParameters = {},
    session?: CognitiveSession
  ): Promise<unknown> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (!workflow.enabled) {
      throw new Error(`Workflow ${workflowId} is disabled`);
    }

    const executionId = `workflow_${workflowId}_${Date.now()}`;
    const startTime = Date.now();

    try {
      console.log(`🔄 Executing workflow: ${workflow.name}`);

      const results: WorkflowResult[] = [];
      let context: WorkflowContext = { ...parameters, session };

      for (const step of workflow.steps) {
        if (!this.shouldExecuteStep(step, context, workflow.conditions)) {
          console.log(`⏭️ Skipping step ${step.id} due to conditions`);
          continue;
        }

        const stepStartTime = Date.now();
        const stepResult = await this.executeWorkflowStep(step, context);
        const stepDuration = Date.now() - stepStartTime;

        results.push({
          stepId: step.id,
          result: stepResult,
          duration: stepDuration
        });

        // Update context with step result
        context = { ...context, [`${step.id}_result`]: stepResult };

        console.log(`✅ Workflow step ${step.id} completed in ${stepDuration}ms`);
      }

      // Process workflow outputs
      const outputs = await this.processWorkflowOutputs(workflow.outputs, context, results);

      const totalDuration = Date.now() - startTime;

      this.emit('workflow_completed', {
        workflowId,
        executionId,
        duration: totalDuration,
        stepsExecuted: results.length,
        timestamp: Date.now()
      });

      console.log(`✅ Workflow ${workflow.name} completed in ${totalDuration}ms`);

      return {
        executionId,
        workflowId,
        results,
        outputs,
        duration: totalDuration
      };
    } catch (error) {
      console.error(`❌ Workflow execution failed for ${workflowId}:`, error);
      this.emit('error', { type: 'workflow_execution', workflowId, error });
      throw error;
    }
  }

  // Service-specific processing methods
  private async processQuery(input: PipelineInput, session: CognitiveSession, servicesUsed: string[]): Promise<unknown> {
    const query = typeof input === 'string' ? input : input.query;

    // Process with NLP Engine
    const nlpResult = await this.nlpEngine.analyzeText(query, {
      extractEntities: true,
      analyzeSentiment: true,
      extractThreatIntel: true
    });
    servicesUsed.push('NLPEngine');

    // Get response from Security Assistant
    const assistantResponse = await this.securityAssistant.processQuery(query, session.id);
    servicesUsed.push('SecurityAssistant');

    // Query knowledge graph if entities were extracted
    let knowledgeResults = null;
    if (nlpResult.entities.length > 0) {
      const entityValues = nlpResult.entities.map(e => e.value);
      knowledgeResults = await this.knowledgeGraph.executeQuery({
        query: `MATCH (n) WHERE n.name IN [${entityValues.map(v => `'${v}'`).join(',')}] RETURN n LIMIT 10`,
        parameters: { entityValues },
        resultLimit: 10,
        includeRelationships: true
      });
      servicesUsed.push('KnowledgeGraph');
    }

    return {
      query,
      nlpAnalysis: nlpResult,
      response: assistantResponse.text,
      actions: assistantResponse.actions,
      knowledgeResults,
      confidence: assistantResponse.confidence
    };
  }

  private async processAnalysisRequest(input: PipelineInput, session: CognitiveSession, servicesUsed: string[]): Promise<unknown> {
    // Use cognitive pipeline for comprehensive analysis
    const pipelineResult = await this.cognitivePipeline.execute(input);
    servicesUsed.push('CognitivePipeline');

    // Update session context if security context is provided
    if (input.securityData) {
      const securityContext = await this.contextEngine.analyzeSecurityContext(input.securityData);
      session.context.securityContext = securityContext;
      servicesUsed.push('ContextEngine');
    }

    return {
      analysisType: input.analysisType || 'comprehensive',
      pipelineResult,
      contextUpdated: !!input.securityData
    };
  }

  private async processReportGeneration(input: PipelineInput, session: CognitiveSession, servicesUsed: string[]): Promise<unknown> {
    if (!session.context.securityContext) {
      throw new Error('Security context required for report generation');
    }

    const reportType: ReportType = (input.reportType as ReportType) || 'SECURITY_POSTURE';
    const report = await this.reportGenerator.generateReport(
      session.context.securityContext,
      reportType,
      {
        recipients: input.recipients as string[],
        format: (input.format as string[]) || ['HTML'],
        includeCharts: input.includeCharts !== false,
        includeTables: input.includeTables !== false
      }
    );
    servicesUsed.push('ReportGenerator');

    return {
      reportId: report.id,
      reportType,
      title: report.title,
      summary: report.summary,
      sectionsCount: report.sections.length,
      generationTime: report.metadata.generationTime
    };
  }

  private async processContextUpdate(input: PipelineInput, session: CognitiveSession, servicesUsed: string[]): Promise<unknown> {
    const securityContext = await this.contextEngine.analyzeSecurityContext(input);
    session.context.securityContext = securityContext;
    servicesUsed.push('ContextEngine');

    // Update knowledge graph with new context - simplified approach
    if (input.threats && Array.isArray(input.threats)) {
      for (const threat of input.threats) {
        if (typeof threat === 'object' && threat !== null) {
          const threatObj = threat as { id?: string; type?: string; severity?: string };
          try {
            await this.knowledgeGraph.executeQuery({
              query: `CREATE (t:Threat {id: '${threatObj.id || 'unknown'}', name: '${threatObj.type || 'Unknown'}', severity: '${threatObj.severity || 'MEDIUM'}'})`,
              parameters: { threat }
            });
          } catch (error) {
            console.warn('Failed to add threat to knowledge graph:', error);
          }
        }
      }
      servicesUsed.push('KnowledgeGraph');
    }

    return {
      contextId: securityContext.id,
      riskLevel: securityContext.risk.overallRisk,
      alertLevel: securityContext.situationalAwareness.alertLevel,
      threatsAnalyzed: input.threats?.length || 0,
      lastUpdated: securityContext.timestamp
    };
  }

  private async processThreatInvestigation(input: PipelineInput, session: CognitiveSession, servicesUsed: string[]): Promise<unknown> {
    const threatId = input.threatId || input.threat?.id;
    if (!threatId) {
      throw new Error('Threat ID required for investigation');
    }

    // Query knowledge graph for threat information
    const threatQuery = await this.knowledgeGraph.executeQuery({
      query: `MATCH (t:Threat {id: '${threatId}'}) RETURN t`,
      parameters: { threatId },
      resultLimit: 1,
      includeRelationships: true
    });
    servicesUsed.push('KnowledgeGraph');

    // Get related entities
    const relatedQuery = await this.knowledgeGraph.executeQuery({
      query: `MATCH (t:Threat {id: '${threatId}'})-[r]-(related) RETURN related, r LIMIT 10`,
      parameters: { threatId },
      resultLimit: 10,
      includeRelationships: true,
      traversalDepth: 2
    });

    // Simulate MITRE information
    const mitreInfo = {
      techniques: ['T1566', 'T1059'],
      tactics: ['Initial Access', 'Execution'],
      mitigations: ['M1031', 'M1038']
    };

    // Analyze with NLP if threat description is provided
    let nlpAnalysis = null;
    if (input.description) {
      nlpAnalysis = await this.nlpEngine.analyzeText(input.description, {
        extractEntities: true,
        extractThreatIntel: true
      });
      servicesUsed.push('NLPEngine');
    }

    return {
      threatId,
      threatInfo: threatQuery.entities[0] || null,
      relatedEntities: relatedQuery.entities,
      mitreInfo,
      nlpAnalysis,
      investigationSummary: this.generateInvestigationSummary(threatQuery.entities[0], relatedQuery.entities, mitreInfo)
    };
  }

  private async processComplianceCheck(input: PipelineInput, session: CognitiveSession, servicesUsed: string[]): Promise<unknown> {
    if (!session.context.securityContext) {
      throw new Error('Security context required for compliance check');
    }

    const compliance = session.context.securityContext.compliance;
    const framework = input.framework || 'ALL';

    // Generate compliance report
    const complianceReport = await this.reportGenerator.generateReport(
      session.context.securityContext,
      'COMPLIANCE_REPORT',
      { format: ['JSON'] }
    );
    servicesUsed.push('ReportGenerator');

    return {
      framework,
      overallStatus: compliance.auditStatus?.overall || 'Unknown',
      frameworksCount: compliance.frameworks?.length || 0,
      violationsCount: compliance.violations?.length || 0,
      controlEffectiveness: compliance.controlEffectiveness?.overall || 0,
      reportId: complianceReport.id
    };
  }

  private async executeWorkflowStep(step: WorkflowStep, context: WorkflowContext): Promise<unknown> {
    switch (step.service) {
      case 'NLPEngine':
        return await this.executeNLPStep(step, context);
      case 'ContextEngine':
        return await this.executeContextStep(step, context);
      case 'KnowledgeGraph':
        return await this.executeKnowledgeStep(step, context);
      case 'SecurityAssistant':
        return await this.executeAssistantStep(step, context);
      case 'ReportGenerator':
        return await this.executeReportStep(step, context);
      default:
        throw new Error(`Unknown workflow service: ${step.service}`);
    }
  }

  private async executeNLPStep(step: WorkflowStep, context: WorkflowContext): Promise<unknown> {
    const text = step.parameters.text || context.text;
    return await this.nlpEngine.analyzeText(text as string, {
      extractEntities: true,
      analyzeSentiment: true,
      extractThreatIntel: true
    });
  }

  private async executeContextStep(step: WorkflowStep, context: WorkflowContext): Promise<unknown> {
    const data = step.parameters.data || context.securityData;
    return await this.contextEngine.analyzeSecurityContext(data);
  }

  private async executeKnowledgeStep(step: WorkflowStep, context: WorkflowContext): Promise<unknown> {
    switch (step.method) {
      case 'queryEntities': {
        const entities = step.parameters.entities || [];
        return await this.knowledgeGraph.executeQuery({
          query: `MATCH (n) WHERE n.name IN [${entities.map((e: string) => `'${e}'`).join(',')}] RETURN n LIMIT 10`,
          parameters: { entities },
          resultLimit: 10
        });
      }
      case 'addEntity': {
        const entity = step.parameters.entity;
        return await this.knowledgeGraph.executeQuery({
          query: `CREATE (n:${entity.type} {id: '${entity.id}', name: '${entity.name || entity.id}'})`,
          parameters: { entity }
        });
      }
      case 'getRelatedEntities': {
        const entityId = step.parameters.entityId;
        const depth = step.parameters.depth || 2;
        return await this.knowledgeGraph.executeQuery({
          query: `MATCH (n {id: '${entityId}'})-[r]-(related) RETURN related, r LIMIT 20`,
          parameters: { entityId, depth },
          resultLimit: 20,
          traversalDepth: depth
        });
      }
      default:
        throw new Error(`Unknown knowledge graph method: ${step.method}`);
    }
  }

  private async executeAssistantStep(step: WorkflowStep, context: WorkflowContext): Promise<unknown> {
    const query = step.parameters.query || context.query;
    return await this.securityAssistant.processQuery(query as string, context.session?.id || 'workflow');
  }

  private async executeReportStep(step: WorkflowStep, context: WorkflowContext): Promise<unknown> {
    const securityContext = context.securityContext || context.session?.context.securityContext;
    if (!securityContext) {
      throw new Error('Security context required for report generation');
    }

    return await this.reportGenerator.generateReport(
      securityContext as SecurityContext,
      step.parameters.reportType as ReportType,
      step.parameters.options as Record<string, unknown>
    );
  }

  // Helper methods
  private setupServiceEventHandlers(): void {
    // Forward service events
    const services = [
      { service: this.nlpEngine, name: 'NLPEngine' },
      { service: this.securityAssistant, name: 'SecurityAssistant' },
      { service: this.knowledgeGraph, name: 'KnowledgeGraph' },
      { service: this.contextEngine, name: 'ContextEngine' },
      { service: this.reportGenerator, name: 'ReportGenerator' }
    ];

    for (const { service, name } of services) {
      if (service && typeof service.on === 'function') {
        service.on('error', (error: unknown) => {
          this.emit('service_error', { service: name, error, timestamp: Date.now() });
        });
      }
    }
  }

  private initializeDefaultWorkflows(): void {
    // Threat Analysis Workflow
    this.workflows.set('threat_analysis', {
      id: 'threat_analysis',
      name: 'Comprehensive Threat Analysis',
      description: 'Analyze threats using NLP, context, and knowledge graph',
      triggers: [
        { type: 'MANUAL', condition: 'user_request', parameters: {} }
      ],
      steps: [
        {
          id: 'nlp_analysis',
          type: 'NLP',
          service: 'NLPEngine',
          method: 'processSecurityText',
          parameters: {},
          dependencies: [],
          timeout: 30000
        },
        {
          id: 'context_analysis',
          type: 'CONTEXT_ANALYSIS',
          service: 'ContextEngine',
          method: 'analyzeSecurityContext',
          parameters: {},
          dependencies: [],
          timeout: 60000
        },
        {
          id: 'knowledge_query',
          type: 'KNOWLEDGE_QUERY',
          service: 'KnowledgeGraph',
          method: 'queryEntities',
          parameters: {},
          dependencies: ['nlp_analysis'],
          timeout: 30000
        }
      ],
      conditions: [],
      outputs: [
        {
          type: 'REPORT',
          destination: ['security-team@company.com'],
          format: 'HTML',
          template: 'threat_analysis'
        }
      ],
      enabled: true
    });

    // Automated Security Report Workflow
    this.workflows.set('daily_security_report', {
      id: 'daily_security_report',
      name: 'Daily Security Report',
      description: 'Generate daily security posture report',
      triggers: [
        { type: 'SCHEDULE', condition: 'daily_8am', parameters: { time: '08:00' } }
      ],
      steps: [
        {
          id: 'context_update',
          type: 'CONTEXT_ANALYSIS',
          service: 'ContextEngine',
          method: 'analyzeSecurityContext',
          parameters: {},
          dependencies: [],
          timeout: 120000
        },
        {
          id: 'generate_report',
          type: 'REPORT_GENERATION',
          service: 'ReportGenerator',
          method: 'generateReport',
          parameters: { reportType: 'SECURITY_POSTURE' },
          dependencies: ['context_update'],
          timeout: 180000
        }
      ],
      conditions: [],
      outputs: [
        {
          type: 'REPORT',
          destination: ['security-leadership@company.com'],
          format: 'HTML'
        }
      ],
      schedule: {
        frequency: 'daily',
        time: '08:00',
        timezone: 'UTC'
      },
      enabled: false // Disabled by default
    });
  }

  private initializePerformanceMonitoring(): void {
    this.performanceMetrics.set('interactions_processed', 0);
    this.performanceMetrics.set('average_processing_time', 0);
    this.performanceMetrics.set('service_usage', new Map<string, number>());
    this.performanceMetrics.set('error_count', 0);
    this.performanceMetrics.set('session_count', 0);
  }

  private updatePerformanceMetrics(
    interactionType: InteractionType,
    processingTime: number,
    servicesUsed: string[]
  ): void {
    // Update interaction count
    const currentCount = (this.performanceMetrics.get('interactions_processed') as number || 0) + 1;
    this.performanceMetrics.set('interactions_processed', currentCount);

    // Update average processing time
    const currentAvg = this.performanceMetrics.get('average_processing_time') as number || 0;
    const newAvg = (currentAvg * (currentCount - 1) + processingTime) / currentCount;
    this.performanceMetrics.set('average_processing_time', newAvg);

    // Update service usage
    const serviceUsage = this.performanceMetrics.get('service_usage') as Map<string, number> || new Map();
    for (const service of servicesUsed) {
      serviceUsage.set(service, (serviceUsage.get(service) || 0) + 1);
    }
    this.performanceMetrics.set('service_usage', serviceUsage);
  }

  private calculateInteractionConfidence(result: unknown, servicesUsed: string[]): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence based on services used
    if (servicesUsed.includes('NLPEngine')) confidence += 0.05;
    if (servicesUsed.includes('ContextEngine')) confidence += 0.1;
    if (servicesUsed.includes('KnowledgeGraph')) confidence += 0.05;
    if (servicesUsed.includes('SecurityAssistant')) confidence += 0.1;

    // Adjust based on result characteristics
    if (result && typeof result === 'object') {
      const resultObj = result as { recommendations?: unknown[]; confidence?: number };
      if (resultObj.recommendations && Array.isArray(resultObj.recommendations) && resultObj.recommendations.length > 0) confidence += 0.05;
      if (resultObj.confidence && typeof resultObj.confidence === 'number') {
        confidence = (confidence + resultObj.confidence) / 2;
      }
    }

    return Math.min(1.0, confidence);
  }

  private shouldExecuteStep(
    step: WorkflowStep,
    context: WorkflowContext,
    conditions: WorkflowCondition[]
  ): boolean {
    // Check dependencies
    for (const dependency of step.dependencies) {
      if (!context[`${dependency}_result`]) {
        return false; // Dependency not met
      }
    }

    // Check workflow conditions
    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return condition.action !== 'SKIP';
      }
    }

    return true;
  }

  private evaluateCondition(condition: WorkflowCondition, context: WorkflowContext): boolean {
    // Simple condition evaluation - would be more sophisticated in production
    try {
      // Mock evaluation - in production would use a proper expression evaluator
      return true;
    } catch (error) {
      console.warn(`Failed to evaluate condition ${condition.id}:`, error);
      return true;
    }
  }

  private async processWorkflowOutputs(
    outputs: WorkflowOutput[],
    context: WorkflowContext,
    results: WorkflowResult[]
  ): Promise<unknown[]> {
    const processedOutputs = [];

    for (const output of outputs) {
      try {
        let processedOutput;

        switch (output.type) {
          case 'REPORT':
            processedOutput = await this.processReportOutput(output, context, results);
            break;
          case 'ALERT':
            processedOutput = await this.processAlertOutput(output, context, results);
            break;
          case 'NOTIFICATION':
            processedOutput = await this.processNotificationOutput(output, context, results);
            break;
          default:
            processedOutput = { type: output.type, status: 'unsupported' };
        }

        processedOutputs.push(processedOutput);
      } catch (error) {
        console.error(`Failed to process workflow output:`, error);
        processedOutputs.push({ type: output.type, status: 'error', error: error.message });
      }
    }

    return processedOutputs;
  }

  private async processReportOutput(output: WorkflowOutput, context: WorkflowContext, results: WorkflowResult[]): Promise<unknown> {
    // Find report generation result
    const reportResult = results.find(r => r.stepId === 'generate_report');

    if (reportResult?.result) {
      return {
        type: 'REPORT',
        reportId: (reportResult.result as { id?: string }).id,
        destinations: output.destination,
        format: output.format,
        status: 'generated'
      };
    }

    return { type: 'REPORT', status: 'not_found' };
  }

  private async processAlertOutput(output: WorkflowOutput, context: WorkflowContext, results: WorkflowResult[]): Promise<unknown> {
    return {
      type: 'ALERT',
      destinations: output.destination,
      status: 'sent',
      timestamp: Date.now()
    };
  }

  private async processNotificationOutput(output: WorkflowOutput, context: WorkflowContext, results: WorkflowResult[]): Promise<unknown> {
    return {
      type: 'NOTIFICATION',
      destinations: output.destination,
      status: 'sent',
      timestamp: Date.now()
    };
  }

  private generateInvestigationSummary(threatInfo: ThreatInfo, relatedEntities: unknown[], mitreInfo: MitreInfo): string {
    const parts = [];

    if (threatInfo) {
      parts.push(`Threat: ${threatInfo.properties?.name || threatInfo.id}`);
    }

    if (relatedEntities.length > 0) {
      parts.push(`${relatedEntities.length} related entities found`);
    }

    if (mitreInfo?.techniques?.length > 0) {
      parts.push(`MITRE techniques: ${mitreInfo.techniques.slice(0, 3).join(', ')}`);
    }

    return parts.join('. ') + '.';
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    const maxInactivity = 4 * 60 * 60 * 1000; // 4 hours

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > maxInactivity) {
        session.status = 'EXPIRED';
        this.sessions.delete(sessionId);
        console.log(`🧹 Cleaned up inactive session: ${sessionId}`);
      }
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      reportFormats: ['HTML'],
      notificationSettings: {
        criticalAlerts: true,
        reportGeneration: true,
        threatUpdates: true,
        complianceChanges: true,
        channels: ['EMAIL']
      },
      visualizationPreferences: {
        chartTypes: ['bar', 'pie', 'line'],
        colorScheme: 'default',
        detailLevel: 'DETAILED',
        interactiveElements: true
      },
      alertThresholds: {
        riskLevelThreshold: 'HIGH',
        threatSeverityThreshold: 'HIGH',
        complianceViolationThreshold: 5,
        customThresholds: {}
      },
      languageSettings: {
        primaryLanguage: 'en',
        technicalLevel: 'INTERMEDIATE',
        glossaryEnabled: true,
        translationEnabled: false
      }
    };
  }

  private getAvailableCapabilities(): string[] {
    return [
      'natural_language_processing',
      'conversational_ai',
      'knowledge_graph_queries',
      'context_analysis',
      'report_generation',
      'threat_investigation',
      'compliance_checking',
      'workflow_execution',
      'cognitive_pipeline'
    ];
  }

  private getServiceStatus(): ServiceStatus {
    return {
      nlpEngine: this.nlpEngine ? 'initialized' : 'not_initialized',
      securityAssistant: this.securityAssistant ? 'initialized' : 'not_initialized',
      knowledgeGraph: this.knowledgeGraph ? 'initialized' : 'not_initialized',
      contextEngine: this.contextEngine ? 'initialized' : 'not_initialized',
      reportGenerator: this.reportGenerator ? 'initialized' : 'not_initialized'
    };
  }

  // Public interface methods
  getCapabilities(): OrchestratorCapabilities {
    return {
      cognitiveServices: {
        naturalLanguageProcessing: true,
        conversationalAI: true,
        knowledgeGraphQueries: true,
        contextualAnalysis: true,
        reportGeneration: true
      },
      orchestrationFeatures: {
        sessionManagement: true,
        workflowExecution: true,
        cognitivePipelines: true,
        performanceMonitoring: true,
        serviceIntegration: true
      },
      interactionTypes: [
        'QUERY',
        'ANALYSIS_REQUEST',
        'REPORT_GENERATION',
        'CONTEXT_UPDATE',
        'THREAT_INVESTIGATION',
        'COMPLIANCE_CHECK',
        'WORKFLOW_EXECUTION'
      ],
      supportedFormats: ['JSON', 'HTML', 'PDF', 'CSV'],
      securityClearanceLevels: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET']
    };
  }

  getStatistics(): OrchestratorStatistics {
    return {
      activeSessions: this.sessions.size,
      availableWorkflows: this.workflows.size,
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      serviceStatus: this.getServiceStatus(),
      isInitialized: this.isInitialized,
      timestamp: Date.now()
    };
  }

  getSessionInfo(sessionId: string): CognitiveSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getAllWorkflows(): CognitiveWorkflow[] {
    return Array.from(this.workflows.values());
  }

  enableWorkflow(workflowId: string): void {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.enabled = true;
      this.emit('workflow_enabled', { workflowId, timestamp: Date.now() });
    }
  }

  disableWorkflow(workflowId: string): void {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.enabled = false;
      this.emit('workflow_disabled', { workflowId, timestamp: Date.now() });
    }
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'COMPLETED';
      this.sessions.delete(sessionId);
      this.emit('session_closed', { sessionId, timestamp: Date.now() });
    }
  }

  destroy(): void {
    // Cleanup all sessions
    for (const sessionId of this.sessions.keys()) {
      this.closeSession(sessionId);
    }

    // Cleanup services - only call destroy if they have the method
    try {
      // Most services don't have destroy methods in our implementation
      // but we clean up their references
      this.nlpEngine = null!;
      this.securityAssistant = null!;
      this.knowledgeGraph = null!;
      this.contextEngine = null!;
      this.reportGenerator = null!;
    } catch (error) {
      console.warn('Error during service cleanup:', error);
    }

    this.workflows.clear();
    this.performanceMetrics.clear();
    this.isInitialized = false;
  }
}

export type {
  CognitiveSession,
  CognitiveInteraction,
  CognitiveWorkflow,
  InteractionType,
  UserPreferences
};

export default CognitiveSecurityOrchestrator;
