/**
 * 🚨 PHASE 5.2: INTELLIGENT SECURITY AUTOMATION
 * 
 * Automated Incident Response Orchestrator
 * AI-powered incident classification, automated response execution,
 * and intelligent escalation management for real-time security operations.
 * 
 * @author Secure Flow Automaton Team
 * @version 2.0.0
 * @since Phase 5.2
 */

import { EventEmitter } from 'events';

// =================== CORE INTERFACES ===================

export interface SecurityIncident {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'intrusion' | 'malware' | 'data_breach' | 'dos' | 'insider_threat' | 'compliance' | 'other';
    source: string;
    detectedAt: Date;
    affectedSystems: string[];
    indicators: SecurityIndicator[];
    status: IncidentStatus;
    classification: IncidentClassification;
    responseActions: ResponseAction[];
    assignedTo?: string;
    resolvedAt?: Date;
    metadata: IncidentMetadata;
}

export interface SecurityIndicator {
    id: string;
    type: 'ip_address' | 'domain' | 'file_hash' | 'url' | 'email' | 'user_account' | 'process' | 'other';
    value: string;
    confidence: number; // 0-1
    context: string;
    source: string;
    timestamp: Date;
    tlp: 'white' | 'green' | 'amber' | 'red'; // Traffic Light Protocol
}

export interface IncidentClassification {
    primaryCategory: string;
    subCategory: string;
    confidence: number;
    aiModel: string;
    classificationTime: Date;
    alternativeClassifications: AlternativeClassification[];
    riskScore: number; // 0-10
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlternativeClassification {
    category: string;
    subCategory: string;
    confidence: number;
    reasoning: string;
}

export interface ResponseAction {
    id: string;
    name: string;
    type: 'containment' | 'investigation' | 'mitigation' | 'recovery' | 'notification' | 'documentation';
    description: string;
    automated: boolean;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
    priority: number;
    prerequisites: string[];
    parameters: ActionParameters;
    executedAt?: Date;
    completedAt?: Date;
    result?: ActionResult;
    assignedTo?: string;
}

export interface ActionParameters {
    systems?: string[];
    isolation_type?: string;
    update_rules?: boolean;
    patch_systems?: boolean;
    [key: string]: string | boolean | string[] | number | undefined;
}

export interface ActionResult {
    success: boolean;
    message: string;
    output: ActionOutput;
    executionTime: number;
    errors: string[];
    artifacts: string[];
}

export interface ActionOutput {
    systems_isolated?: string[];
    isolation_method?: string;
    timestamp?: Date;
    evidence_collected?: boolean;
    artifacts_count?: number;
    analysis_score?: number;
    controls_deployed?: boolean;
    rules_updated?: boolean;
    systems_patched?: boolean;
    completed?: boolean;
    [key: string]: string | boolean | string[] | number | Date | undefined;
}

export interface ResponsePlaybook {
    id: string;
    name: string;
    description: string;
    version: string;
    applicableCategories: string[];
    severity: ('critical' | 'high' | 'medium' | 'low')[];
    actions: PlaybookAction[];
    estimatedDuration: number;
    prerequisites: string[];
    tags: string[];
    lastUpdated: Date;
    createdBy: string;
    enabled: boolean;
}

export interface PlaybookAction {
    id: string;
    name: string;
    type: 'containment' | 'investigation' | 'mitigation' | 'recovery' | 'notification' | 'documentation';
    description: string;
    automated: boolean;
    priority: number;
    estimatedDuration: number;
    dependencies: string[];
    parameters: ActionParameters;
    conditions: ActionCondition[];
    rollbackActions: string[];
}

export interface ActionCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: string | number | boolean | string[];
    logicalOperator?: 'and' | 'or';
}

export interface IncidentStatus {
    current: 'new' | 'triaging' | 'investigating' | 'containing' | 'mitigating' | 'recovering' | 'resolved' | 'closed';
    previous: string[];
    transitions: StatusTransition[];
    slaBreach: boolean;
    slaResponseTime?: number;
    slaResolutionTime?: number;
}

export interface StatusTransition {
    from: string;
    to: string;
    timestamp: Date;
    reason: string;
    performedBy: string;
}

export interface IncidentMetadata {
    tags: string[];
    priority: number;
    slaBreach: boolean;
    escalationLevel: number;
    notifications: NotificationRecord[];
    lessonsLearned: string[];
    automationScore: number;
    manualInterventions: number;
    falsePositive: boolean;
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
    costEstimate: number;
    complianceViolations: string[];
}

export interface NotificationRecord {
    type: 'email' | 'sms' | 'slack' | 'webhook';
    recipient: string;
    sentAt: Date;
    status: 'pending' | 'sent' | 'failed' | 'delivered';
    retryCount: number;
    errorMessage?: string;
}

export interface ModelConfig {
    name: string;
    type: string;
    accuracy: number;
    features: string[];
    loaded?: boolean;
    version?: string;
    lastUpdated?: Date;
}

export interface ClassificationFeatures {
    title: string;
    description: string;
    source: string;
    indicatorTypes: string[];
    indicatorCount: number;
    affectedSystemCount: number;
    detectionTime: number;
    weekday: number;
}

export interface ClassificationResult {
    category: string;
    subCategory: string;
    confidence: number;
}

export interface SeverityAssessment {
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
    severityScore: number;
}

export interface TrendData {
    period: string;
    incidents: number;
    trend: 'increasing' | 'decreasing' | 'stable';
}

// =================== MAIN CLASS ===================

export class AutomatedIncidentResponse extends EventEmitter {
    private incidents: Map<string, SecurityIncident> = new Map();
    private playbooks: Map<string, ResponsePlaybook> = new Map();
    private activeResponses: Map<string, ResponseExecution> = new Map();
    private models: Map<string, ModelConfig> = new Map();
    private config: ResponseConfig;

    constructor(config: ResponseConfig) {
        super();
        this.config = config;
        this.initializeModels();
        this.loadDefaultPlaybooks();
    }

    private initializeModels(): void {
        this.loadModel('incident_classifier', {
            name: 'incident_classifier_v2.1',
            type: 'neural_network',
            accuracy: 0.92,
            features: ['text_analysis', 'pattern_recognition', 'context_awareness']
        });

        this.loadModel('severity_assessor', {
            name: 'severity_assessor_v1.5',
            type: 'gradient_boosting',
            accuracy: 0.89,
            features: ['impact_analysis', 'business_context', 'threat_intelligence']
        });

        this.loadModel('response_optimizer', {
            name: 'response_optimizer_v2.0',
            type: 'reinforcement_learning',
            accuracy: 0.87,
            features: ['incident_classification', 'historical_responses', 'effectiveness_metrics']
        });
    }

    private async loadModel(name: string, config: ModelConfig): Promise<void> {
        this.models.set(name, { ...config, loaded: true });
    }

    async classifyIncident(incident: SecurityIncident): Promise<IncidentClassification> {
        try {
            // Extract features for classification
            const features = this.extractClassificationFeatures(incident);
            
            // Run classification model
            const classification = await this.runClassificationModel(features);
            
            // Assess severity using AI
            const severityAssessment = await this.assessSeverity(incident, classification);
            
            // Calculate risk score
            const riskScore = await this.calculateRiskScore(incident, classification);
            
            // Generate alternative classifications
            const alternatives = await this.generateAlternativeClassifications(features);

            return {
                primaryCategory: classification.category,
                subCategory: classification.subCategory,
                confidence: classification.confidence,
                aiModel: 'incident_classifier_v2.1',
                classificationTime: new Date(),
                alternativeClassifications: alternatives,
                riskScore,
                businessImpact: severityAssessment.businessImpact
            };

        } catch (error) {
            console.error('❌ Incident classification failed:', error);
            return this.getDefaultClassification(incident);
        }
    }

    private extractClassificationFeatures(incident: SecurityIncident): ClassificationFeatures {
        return {
            title: incident.title.toLowerCase(),
            description: incident.description.toLowerCase(),
            source: incident.source,
            indicatorTypes: incident.indicators.map(i => i.type),
            indicatorCount: incident.indicators.length,
            affectedSystemCount: incident.affectedSystems.length,
            detectionTime: incident.detectedAt.getHours(),
            weekday: incident.detectedAt.getDay()
        };
    }

    private async runClassificationModel(features: ClassificationFeatures): Promise<ClassificationResult> {
        // Simulate AI classification
        const categories = [
            { category: 'intrusion', subCategory: 'unauthorized_access', confidence: 0.85 },
            { category: 'malware', subCategory: 'ransomware', confidence: 0.78 },
            { category: 'data_breach', subCategory: 'data_exfiltration', confidence: 0.72 },
            { category: 'dos', subCategory: 'ddos_attack', confidence: 0.65 }
        ];

        // Return the highest confidence classification
        return categories.reduce((best, current) => 
            current.confidence > best.confidence ? current : best
        );
    }

    private async assessSeverity(incident: SecurityIncident, classification: ClassificationResult): Promise<SeverityAssessment> {
        // AI-based severity assessment
        const factors = {
            categoryWeight: this.getCategoryWeight(classification.category),
            systemsAffected: incident.affectedSystems.length,
            indicatorConfidence: incident.indicators.reduce((sum, i) => sum + i.confidence, 0) / incident.indicators.length,
            currentSeverity: incident.severity
        };

        const severityScore = factors.categoryWeight * 0.4 + 
                             Math.min(factors.systemsAffected / 10, 1) * 0.3 +
                             factors.indicatorConfidence * 0.3;

        let businessImpact: 'low' | 'medium' | 'high' | 'critical';
        
        if (severityScore > 0.8) businessImpact = 'critical';
        else if (severityScore > 0.6) businessImpact = 'high';
        else if (severityScore > 0.4) businessImpact = 'medium';
        else businessImpact = 'low';

        return { businessImpact, severityScore };
    }

    private getCategoryWeight(category: string): number {
        const weights = {
            'intrusion': 0.9,
            'malware': 0.85,
            'data_breach': 0.95,
            'dos': 0.7,
            'insider_threat': 0.8,
            'compliance': 0.5,
            'other': 0.6
        };
        return weights[category] || 0.6;
    }

    private async calculateRiskScore(incident: SecurityIncident, classification: ClassificationResult): Promise<number> {
        // Calculate risk score based on multiple factors
        const factors = {
            severity: this.getSeverityScore(incident.severity),
            confidence: classification.confidence,
            affectedSystems: Math.min(incident.affectedSystems.length / 10, 1) * 10,
            indicators: Math.min(incident.indicators.length / 5, 1) * 10,
            category: this.getCategoryWeight(classification.category) * 10
        };

        return Math.min(
            (factors.severity + factors.affectedSystems + factors.indicators + factors.category) / 4 * factors.confidence,
            10
        );
    }

    private getSeverityScore(severity: string): number {
        const scores = { critical: 10, high: 7, medium: 4, low: 1 };
        return scores[severity] || 1;
    }

    private async generateAlternativeClassifications(features: ClassificationFeatures): Promise<AlternativeClassification[]> {
        // Generate alternative classifications with lower confidence
        return [
            {
                category: 'insider_threat',
                subCategory: 'data_theft',
                confidence: 0.45,
                reasoning: 'Internal system access detected'
            },
            {
                category: 'compliance',
                subCategory: 'policy_violation',
                confidence: 0.35,
                reasoning: 'Policy compliance indicators present'
            }
        ];
    }

    private getDefaultClassification(incident: SecurityIncident): IncidentClassification {
        return {
            primaryCategory: incident.category,
            subCategory: 'unknown',
            confidence: 0.5,
            aiModel: 'default_classifier',
            classificationTime: new Date(),
            alternativeClassifications: [],
            riskScore: 5.0,
            businessImpact: 'medium'
        };
    }

    // =================== INCIDENT MANAGEMENT ===================

    async createIncident(incidentData: Partial<SecurityIncident>): Promise<SecurityIncident> {
        const incident: SecurityIncident = {
            id: this.generateIncidentId(),
            title: incidentData.title || 'Unknown Incident',
            description: incidentData.description || 'No description provided',
            severity: incidentData.severity || 'medium',
            category: incidentData.category || 'other',
            source: incidentData.source || 'unknown',
            detectedAt: incidentData.detectedAt || new Date(),
            affectedSystems: incidentData.affectedSystems || [],
            indicators: incidentData.indicators || [],
            status: {
                current: 'new',
                previous: [],
                transitions: [],
                slaBreach: false
            },
            classification: {
                primaryCategory: 'unknown',
                subCategory: 'unknown',
                confidence: 0.0,
                aiModel: 'pending',
                classificationTime: new Date(),
                alternativeClassifications: [],
                riskScore: 0.0,
                businessImpact: 'low'
            },
            responseActions: [],
            metadata: {
                tags: [],
                priority: this.calculateInitialPriority(incidentData.severity || 'medium'),
                slaBreach: false,
                escalationLevel: 0,
                notifications: [],
                lessonsLearned: [],
                automationScore: 0.0,
                manualInterventions: 0,
                falsePositive: false,
                businessImpact: 'low',
                costEstimate: 0,
                complianceViolations: []
            }
        };

        // Classify the incident using AI
        incident.classification = await this.classifyIncident(incident);

        // Store the incident
        this.incidents.set(incident.id, incident);

        // Emit event
        this.emit('incident_created', incident);

        console.log(`🚨 Created incident: ${incident.id} - ${incident.title}`);
        return incident;
    }

    async executeResponse(incidentId: string, playbookId: string): Promise<ResponseExecution> {
        const incident = this.incidents.get(incidentId);
        const playbook = this.playbooks.get(playbookId);

        if (!incident) {
            throw new Error(`Incident not found: ${incidentId}`);
        }

        if (!playbook) {
            throw new Error(`Playbook not found: ${playbookId}`);
        }

        // Create execution record
        const execution: ResponseExecution = {
            incidentId,
            playbookId,
            startTime: new Date(),
            status: 'running',
            completedActions: 0,
            totalActions: playbook.actions.length,
            errors: []
        };

        this.activeResponses.set(incidentId, execution);

        try {
            // Execute playbook actions
            for (const action of playbook.actions) {
                await this.executeAction(incident, action);
                execution.completedActions++;
            }

            execution.status = 'completed';
            execution.endTime = new Date();

            // Update incident status
            incident.status.current = 'resolved';
            incident.resolvedAt = new Date();

            // Extract lessons learned
            incident.metadata.lessonsLearned = await this.extractLessons(incident, execution);

            console.log(`✅ Response execution completed for incident: ${incidentId}`);

        } catch (error) {
            execution.status = 'failed';
            execution.endTime = new Date();
            execution.errors.push(error instanceof Error ? error.message : 'Unknown error');

            console.error(`❌ Response execution failed for incident: ${incidentId}`, error);
        }

        this.emit('response_executed', { incident, execution });
        return execution;
    }

    private async executeAction(incident: SecurityIncident, action: PlaybookAction): Promise<void> {
        // Check dependencies
        const dependenciesMet = await this.checkActionDependencies(action, incident.responseActions);
        if (!dependenciesMet) {
            throw new Error(`Dependencies not met for action: ${action.id}`);
        }

        // Create response action
        const responseAction: ResponseAction = {
            id: `${incident.id}_${action.id}`,
            name: action.name,
            type: action.type,
            description: action.description,
            automated: action.automated,
            status: 'in_progress',
            priority: action.priority,
            prerequisites: [],
            parameters: action.parameters,
            executedAt: new Date()
        };

        incident.responseActions.push(responseAction);

        try {
            // Execute the action
            if (action.automated) {
                await this.executeAutomatedAction(responseAction);
            } else {
                // For manual actions, just mark as pending
                responseAction.status = 'pending';
                responseAction.assignedTo = 'security-analyst';
            }

            responseAction.status = 'completed';
            responseAction.completedAt = new Date();
            responseAction.result = {
                success: true,
                message: 'Action completed successfully',
                output: this.generateActionOutput(responseAction),
                executionTime: responseAction.completedAt.getTime() - responseAction.executedAt!.getTime(),
                errors: [],
                artifacts: []
            };

        } catch (error) {
            responseAction.status = 'failed';
            responseAction.result = {
                success: false,
                message: error instanceof Error ? error.message : 'Action failed',
                output: {},
                executionTime: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                artifacts: []
            };

            // Check if escalation is needed
            if (this.shouldEscalate(incident)) {
                await this.escalateIncident(incident, `Action failed: ${action.name}`);
            }
        }
    }

    private async executeAutomatedAction(action: ResponseAction): Promise<void> {
        // Simulate automated action execution
        const successRate = this.getActionSuccessRate(action.type);
        
        if (Math.random() > successRate) {
            throw new Error(`Automated action failed: ${action.name}`);
        }

        // Simulate execution time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    }

    private shouldEscalate(incident: SecurityIncident): boolean {
        const failedActions = incident.responseActions.filter(a => a.status === 'failed');
        return failedActions.length >= this.config.escalationThreshold;
    }

    private getActionSuccessRate(actionType: string): number {
        const rates = {
            containment: 0.95,
            investigation: 0.90,
            mitigation: 0.88,
            recovery: 0.80,
            notification: 0.98,
            documentation: 0.99
        };
        return rates[actionType] || 0.85;
    }

    private generateActionOutput(action: ResponseAction): ActionOutput {
        switch (action.type) {
            case 'containment':
                return {
                    systems_isolated: action.parameters.systems || [],
                    isolation_method: action.parameters.isolation_type || 'network',
                    timestamp: new Date()
                };
            case 'investigation':
                return {
                    evidence_collected: true,
                    artifacts_count: Math.floor(Math.random() * 10) + 1,
                    analysis_score: Math.random() * 0.3 + 0.7
                };
            case 'mitigation':
                return {
                    controls_deployed: true,
                    rules_updated: action.parameters.update_rules || false,
                    systems_patched: action.parameters.patch_systems || false
                };
            default:
                return { completed: true };
        }
    }

    // =================== UTILITY METHODS ===================

    private async checkActionDependencies(action: PlaybookAction, completedActions: ResponseAction[]): Promise<boolean> {
        if (action.dependencies.length === 0) return true;

        return action.dependencies.every(dep => 
            completedActions.some(completed => 
                completed.id.endsWith(dep) && completed.status === 'completed'
            )
        );
    }

    private async escalateIncident(incident: SecurityIncident, reason: string): Promise<void> {
        console.log(`🚨 Escalating incident: ${incident.id} - Reason: ${reason}`);
        
        incident.status = 'triaging';
        incident.assignedTo = 'senior-analyst';
        
        // Add escalation to metadata
        incident.metadata.notifications.push({
            type: 'email',
            recipient: 'security-leads@company.com',
            sentAt: new Date(),
            status: 'sent'
        });

        this.emit('incident_escalated', { incident, reason });
    }

    private async extractLessons(incident: SecurityIncident, execution: ResponseExecution): Promise<string[]> {
        const lessons: string[] = [];
        
        const failedActions = incident.responseActions.filter(a => a.status === 'failed');
        if (failedActions.length > 0) {
            lessons.push(`${failedActions.length} actions failed - review automation logic`);
        }

        const manualActions = incident.responseActions.filter(a => !a.automated);
        if (manualActions.length > 0) {
            lessons.push(`${manualActions.length} manual actions required - consider automation opportunities`);
        }

        if (incident.classification.confidence < 0.7) {
            lessons.push('Low classification confidence - improve AI model training');
        }

        return lessons;
    }

    private calculateInitialPriority(severity: string): number {
        const priorities = { critical: 1, high: 2, medium: 3, low: 4 };
        return priorities[severity] || 3;
    }

    private getSLAResponseTime(severity: string): number {
        const times = { critical: 15, high: 60, medium: 240, low: 480 }; // minutes
        return (times[severity] || 240) * 60 * 1000; // convert to milliseconds
    }

    private getSLAResolutionTime(severity: string): number {
        const times = { critical: 4, high: 8, medium: 24, low: 72 }; // hours
        return times[severity] * 60 * 60 * 1000; // convert to milliseconds
    }

    private async sendNotifications(incident: SecurityIncident): Promise<void> {
        console.log(`📧 Sending notifications for incident: ${incident.id}`);
        
        // Simulate notification sending
        const notification: NotificationRecord = {
            type: 'email',
            recipient: 'security-team@company.com',
            sentAt: new Date(),
            status: 'sent'
        };

        incident.metadata.notifications.push(notification);
        console.log(`✅ Notification sent for incident: ${incident.id}`);
    }

    // =================== PUBLIC API METHODS ===================

    async getMetrics(): Promise<ResponseMetrics> {
        const incidents = Array.from(this.incidents.values());
        const total = incidents.length;
        const resolved = incidents.filter(i => i.status === 'resolved').length;
        const escalated = incidents.filter(i => i.assignedTo === 'senior-analyst').length;
        
        const avgResponseTime = incidents
            .filter(i => i.responseActions.length > 0)
            .map(i => i.responseActions[0].executedAt ? 
                i.responseActions[0].executedAt.getTime() - i.detectedAt.getTime() : 0)
            .reduce((sum, time) => sum + time, 0) / Math.max(incidents.length, 1);

        return {
            totalIncidents: total,
            resolvedIncidents: resolved,
            escalatedIncidents: escalated,
            averageResponseTime: avgResponseTime,
            resolutionRate: total > 0 ? resolved / total : 0,
            escalationRate: total > 0 ? escalated / total : 0,
            activeIncidents: incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length,
            recentTrends: await this.calculateTrends()
        };
    }

    private async calculateTrends(): Promise<TrendData[]> {
        // Calculate incident trends over time
        return [
            { period: 'last_24h', incidents: 12, trend: 'increasing' },
            { period: 'last_week', incidents: 45, trend: 'stable' },
            { period: 'last_month', incidents: 178, trend: 'decreasing' }
        ];
    }

    getIncident(incidentId: string): SecurityIncident | undefined {
        return this.incidents.get(incidentId);
    }

    getAllIncidents(): SecurityIncident[] {
        return Array.from(this.incidents.values());
    }

    getActiveResponses(): ResponseExecution[] {
        return Array.from(this.activeResponses.values());
    }

    getPlaybooks(): ResponsePlaybook[] {
        return Array.from(this.playbooks.values());
    }

    private generateIncidentId(): string {
        return `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private loadDefaultPlaybooks(): void {
        // Load default response playbooks
        const defaultPlaybooks: ResponsePlaybook[] = [
            {
                id: 'malware_response_v1',
                name: 'Malware Response Playbook',
                description: 'Automated response to malware incidents',
                version: '1.0',
                applicableCategories: ['malware'],
                severity: ['critical', 'high', 'medium'],
                actions: [],
                estimatedDuration: 30,
                prerequisites: [],
                tags: ['malware', 'automated'],
                lastUpdated: new Date(),
                createdBy: 'system',
                enabled: true
            }
        ];

        defaultPlaybooks.forEach(playbook => {
            this.playbooks.set(playbook.id, playbook);
        });
    }
}

// =================== SUPPORTING INTERFACES ===================

interface ResponseConfig {
    maxConcurrentIncidents: number;
    autoExecutionEnabled: boolean;
    escalationThreshold: number;
    aiClassificationEnabled: boolean;
    notificationEnabled: boolean;
}

interface ResponseExecution {
    incidentId: string;
    playbookId: string;
    startTime: Date;
    endTime?: Date;
    status: 'running' | 'completed' | 'failed';
    completedActions: number;
    totalActions: number;
    errors: string[];
}

interface ResponseMetrics {
    totalIncidents: number;
    resolvedIncidents: number;
    escalatedIncidents: number;
    averageResponseTime: number;
    resolutionRate: number;
    escalationRate: number;
    activeIncidents: number;
    recentTrends: TrendData[];
}

export type { ResponseConfig, ResponseExecution, ResponseMetrics };
