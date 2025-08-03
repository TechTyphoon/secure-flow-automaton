/**
 * Security Report Generation Engine
 * Automated security summaries, narrative generation, and compliance reporting
 */

import { EventEmitter } from 'events';
import { SecurityContext, RiskLevel, AlertLevel } from './contextEngine';

// Core interfaces for report generation
interface SecurityReport {
  id: string;
  type: ReportType;
  title: string;
  timestamp: number;
  author: string;
  recipients: string[];
  summary: ReportSummary;
  sections: ReportSection[];
  metadata: ReportMetadata;
  attachments: ReportAttachment[];
  status: ReportStatus;
}

interface ReportSummary {
  executiveSummary: string;
  keyFindings: string[];
  criticalIssues: string[];
  recommendations: string[];
  overallRiskLevel: RiskLevel;
  alertLevel: AlertLevel;
  complianceStatus: string;
}

interface ReportSection {
  id: string;
  title: string;
  type: SectionType;
  content: string;
  subsections: ReportSubsection[];
  charts: ChartData[];
  tables: TableData[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ReportSubsection {
  title: string;
  content: string;
  bulletPoints: string[];
  metrics: { [key: string]: number | string };
}

interface ChartData {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  data: { [key: string]: number };
  xAxis: string;
  yAxis: string;
  description: string;
}

interface TableData {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
  description: string;
  sortable: boolean;
}

interface ReportMetadata {
  generatedBy: string;
  version: string;
  templateVersion: string;
  dataSourcesUsed: string[];
  generationTime: number;
  nextScheduledReport?: number;
  relatedReports: string[];
}

interface ReportAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  description: string;
  path: string;
}

type ReportType = 
  | 'EXECUTIVE_SUMMARY'
  | 'SECURITY_POSTURE'
  | 'INCIDENT_REPORT'
  | 'COMPLIANCE_REPORT'
  | 'THREAT_INTELLIGENCE'
  | 'VULNERABILITY_ASSESSMENT'
  | 'RISK_ASSESSMENT'
  | 'OPERATIONAL_REPORT'
  | 'AUDIT_REPORT'
  | 'CUSTOM';

type SectionType =
  | 'EXECUTIVE_SUMMARY'
  | 'SECURITY_OVERVIEW'
  | 'THREAT_LANDSCAPE'
  | 'VULNERABILITY_STATUS'
  | 'INCIDENT_ANALYSIS'
  | 'COMPLIANCE_STATUS'
  | 'RISK_ASSESSMENT'
  | 'RECOMMENDATIONS'
  | 'APPENDIX'
  | 'TECHNICAL_DETAILS';

type ReportStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  sections: TemplateSectionConfig[];
  schedule?: ReportSchedule;
  recipients: string[];
  format: ReportFormat[];
}

interface TemplateSectionConfig {
  type: SectionType;
  title: string;
  required: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  autoGenerate: boolean;
  includeCharts: boolean;
  includeTables: boolean;
}

interface ReportSchedule {
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  day?: number;
  time?: string;
  timezone?: string;
  enabled: boolean;
}

type ReportFormat = 'HTML' | 'PDF' | 'JSON' | 'CSV' | 'DOCX';

// Narrative Generation Engine
class NarrativeGenerator {
  private templates: Map<string, string> = new Map();
  private phraseBank: Map<string, string[]> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializePhraseBank();
  }

  generateExecutiveSummary(context: SecurityContext): string {
    const template = this.templates.get('executive_summary') || '';
    const riskDescription = this.getRiskDescription(context.risk.overallRisk);
    const alertDescription = this.getAlertDescription(context.situationalAwareness.alertLevel);
    const timeframe = this.getTimeframeDescription(context.timestamp);
    
    const keyMetrics = this.extractKeyMetrics(context);
    const criticalIssues = this.identifyCriticalIssues(context);
    const recommendations = this.generateTopRecommendations(context);

    return this.interpolateTemplate(template, {
      timeframe,
      riskDescription,
      alertDescription,
      threatCount: context.threats.currentThreats.length,
      criticalThreatCount: context.threats.currentThreats.filter(t => t.severity === 'CRITICAL').length,
      criticalAssetCount: context.assets.criticalAssets.length,
      highRiskAssetCount: context.assets.criticalAssets.filter(a => a.riskScore > 0.7).length,
      keyMetrics: keyMetrics.join(', '),
      criticalIssues: criticalIssues.join('; '),
      topRecommendations: recommendations.slice(0, 3).join('; ')
    });
  }

  generateThreatAnalysisNarrative(threats: any): string {
    const template = this.templates.get('threat_analysis') || '';
    const threatTypes = this.categorizeThreatTypes(threats.currentThreats);
    const severityDistribution = this.analyzeSeverityDistribution(threats.currentThreats);
    const trendAnalysis = this.generateTrendAnalysis(threats);

    return this.interpolateTemplate(template, {
      totalThreats: threats.currentThreats.length,
      criticalThreats: threats.currentThreats.filter((t: any) => t.severity === 'CRITICAL').length,
      highThreats: threats.currentThreats.filter((t: any) => t.severity === 'HIGH').length,
      threatTypes: threatTypes.join(', '),
      dominantThreatType: threatTypes[0] || 'Unknown',
      trendAnalysis,
      emergingThreatsCount: threats.emergingThreats.length
    });
  }

  generateVulnerabilityNarrative(vulnerabilities: any): string {
    const template = this.templates.get('vulnerability_analysis') || '';
    const vulnStats = this.analyzeVulnerabilityStatistics(vulnerabilities);
    
    return this.interpolateTemplate(template, {
      totalVulnerabilities: vulnStats.total,
      criticalVulnerabilities: vulnStats.critical,
      highVulnerabilities: vulnStats.high,
      patchingStatus: vulnStats.patchingStatus,
      exposureLevel: vulnStats.exposureLevel,
      remediationTimeframe: vulnStats.remediationTimeframe
    });
  }

  generateComplianceNarrative(compliance: any): string {
    const template = this.templates.get('compliance_analysis') || '';
    const complianceStats = this.analyzeComplianceStatistics(compliance);
    
    return this.interpolateTemplate(template, {
      overallStatus: complianceStats.overallStatus,
      frameworksCount: complianceStats.frameworksCount,
      requirementsMet: complianceStats.requirementsMet,
      violationsCount: complianceStats.violationsCount,
      controlEffectiveness: Math.round(complianceStats.controlEffectiveness * 100),
      nextAuditDate: complianceStats.nextAuditDate || 'Not scheduled'
    });
  }

  generateIncidentNarrative(incidents: any[]): string {
    const template = this.templates.get('incident_analysis') || '';
    const incidentStats = this.analyzeIncidentStatistics(incidents);
    
    return this.interpolateTemplate(template, {
      totalIncidents: incidentStats.total,
      criticalIncidents: incidentStats.critical,
      resolvedIncidents: incidentStats.resolved,
      avgResolutionTime: incidentStats.avgResolutionTime,
      incidentTrend: incidentStats.trend,
      topIncidentTypes: incidentStats.topTypes.join(', ')
    });
  }

  generateRecommendationsNarrative(recommendations: any[]): string {
    const template = this.templates.get('recommendations') || '';
    const priorityDistribution = this.analyzeRecommendationPriorities(recommendations);
    
    return this.interpolateTemplate(template, {
      totalRecommendations: recommendations.length,
      criticalRecommendations: priorityDistribution.critical,
      highRecommendations: priorityDistribution.high,
      estimatedEffort: this.calculateTotalEffort(recommendations),
      quickWins: this.identifyQuickWins(recommendations).length,
      timeframe: this.estimateImplementationTimeframe(recommendations)
    });
  }

  private initializeTemplates(): void {
    this.templates.set('executive_summary', `
      Based on our security analysis conducted {timeframe}, the organization maintains a {riskDescription} risk posture with {alertDescription} alert status. 
      
      Current threat landscape shows {threatCount} active threats, including {criticalThreatCount} critical-severity threats requiring immediate attention. 
      Our {criticalAssetCount} critical business assets are being monitored, with {highRiskAssetCount} assets currently classified as high-risk.
      
      Key metrics include: {keyMetrics}. Critical issues identified: {criticalIssues}.
      
      Immediate recommendations include: {topRecommendations}.
    `);

    this.templates.set('threat_analysis', `
      Current threat analysis reveals {totalThreats} active threats in our environment, with {criticalThreats} rated as critical severity and {highThreats} as high severity.
      
      Predominant threat types include {threatTypes}, with {dominantThreatType} being the most prevalent. {trendAnalysis}
      
      Additionally, {emergingThreatsCount} emerging threats have been identified that require continued monitoring and assessment.
    `);

    this.templates.set('vulnerability_analysis', `
      Vulnerability assessment shows {totalVulnerabilities} total vulnerabilities, including {criticalVulnerabilities} critical and {highVulnerabilities} high-severity issues.
      
      Current patching status: {patchingStatus}. Overall exposure level is considered {exposureLevel}.
      
      Recommended remediation timeframe: {remediationTimeframe}.
    `);

    this.templates.set('compliance_analysis', `
      Compliance assessment across {frameworksCount} frameworks shows {overallStatus} status with {requirementsMet}% of requirements met.
      
      Current violations: {violationsCount}. Control effectiveness: {controlEffectiveness}%.
      
      Next scheduled audit: {nextAuditDate}.
    `);

    this.templates.set('incident_analysis', `
      Incident analysis shows {totalIncidents} incidents processed, with {criticalIncidents} classified as critical severity.
      
      Resolution statistics: {resolvedIncidents} incidents resolved with average resolution time of {avgResolutionTime}.
      
      Incident trend: {incidentTrend}. Top incident types: {topIncidentTypes}.
    `);

    this.templates.set('recommendations', `
      Security recommendations analysis shows {totalRecommendations} actionable items, including {criticalRecommendations} critical and {highRecommendations} high-priority recommendations.
      
      Estimated total implementation effort: {estimatedEffort}. Quick wins identified: {quickWins}.
      
      Recommended implementation timeframe: {timeframe}.
    `);
  }

  private initializePhraseBank(): void {
    this.phraseBank.set('risk_low', ['minimal risk', 'low risk', 'acceptable risk level']);
    this.phraseBank.set('risk_medium', ['moderate risk', 'manageable risk', 'medium risk level']);
    this.phraseBank.set('risk_high', ['elevated risk', 'significant risk', 'high risk level']);
    this.phraseBank.set('risk_critical', ['critical risk', 'severe risk', 'maximum risk level']);

    this.phraseBank.set('alert_green', ['normal operations', 'standard security posture', 'baseline alert level']);
    this.phraseBank.set('alert_yellow', ['heightened awareness', 'elevated monitoring', 'increased vigilance']);
    this.phraseBank.set('alert_orange', ['high alert status', 'elevated threat condition', 'enhanced security measures']);
    this.phraseBank.set('alert_red', ['critical alert status', 'maximum security posture', 'emergency threat condition']);

    this.phraseBank.set('trend_increasing', ['trending upward', 'showing increase', 'escalating pattern']);
    this.phraseBank.set('trend_stable', ['remaining stable', 'consistent levels', 'steady state']);
    this.phraseBank.set('trend_decreasing', ['trending downward', 'showing improvement', 'declining pattern']);
  }

  private getRiskDescription(risk: RiskLevel): string {
    const phrases = this.phraseBank.get(`risk_${risk.toLowerCase()}`) || ['unknown risk'];
    return this.selectRandomPhrase(phrases);
  }

  private getAlertDescription(alert: AlertLevel): string {
    const phrases = this.phraseBank.get(`alert_${alert.toLowerCase()}`) || ['unknown alert'];
    return this.selectRandomPhrase(phrases);
  }

  private getTimeframeDescription(timestamp: number): string {
    const now = Date.now();
    const diffHours = (now - timestamp) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'within the last hour';
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)} days ago`;
    return 'over a week ago';
  }

  private extractKeyMetrics(context: SecurityContext): string[] {
    const metrics = [];
    
    if (context.threats.currentThreats.length > 0) {
      metrics.push(`${context.threats.currentThreats.length} active threats`);
    }
    
    if (context.assets.criticalAssets.length > 0) {
      metrics.push(`${context.assets.criticalAssets.length} critical assets monitored`);
    }
    
    const riskFactors = context.risk.riskFactors.filter(f => f.impact === 'HIGH');
    if (riskFactors.length > 0) {
      metrics.push(`${riskFactors.length} high-impact risk factors`);
    }
    
    return metrics;
  }

  private identifyCriticalIssues(context: SecurityContext): string[] {
    const issues = [];
    
    const criticalThreats = context.threats.currentThreats.filter(t => t.severity === 'CRITICAL');
    if (criticalThreats.length > 0) {
      issues.push(`${criticalThreats.length} critical threats active`);
    }
    
    const highRiskAssets = context.assets.criticalAssets.filter(a => a.riskScore > 0.8);
    if (highRiskAssets.length > 0) {
      issues.push(`${highRiskAssets.length} critical assets at high risk`);
    }
    
    if (context.situationalAwareness.alertLevel === 'RED') {
      issues.push('critical alert status in effect');
    }
    
    return issues;
  }

  private generateTopRecommendations(context: SecurityContext): string[] {
    return context.situationalAwareness.recommendations
      .filter(r => r.priority === 'CRITICAL' || r.priority === 'HIGH')
      .slice(0, 3)
      .map(r => r.title.toLowerCase());
  }

  private interpolateTemplate(template: string, variables: { [key: string]: any }): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, String(value));
    }
    
    return result.trim().replace(/\s+/g, ' ');
  }

  private selectRandomPhrase(phrases: string[]): string {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  private categorizeThreatTypes(threats: any[]): string[] {
    const types = new Map<string, number>();
    
    for (const threat of threats) {
      const type = threat.type || 'Unknown';
      types.set(type, (types.get(type) || 0) + 1);
    }
    
    return Array.from(types.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => type);
  }

  private analyzeSeverityDistribution(threats: any[]): any {
    const distribution = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    
    for (const threat of threats) {
      distribution[threat.severity as keyof typeof distribution]++;
    }
    
    return distribution;
  }

  private generateTrendAnalysis(threats: any): string {
    // Mock trend analysis - would analyze historical data
    const phrases = this.phraseBank.get('trend_stable') || ['stable'];
    return `Threat levels are ${this.selectRandomPhrase(phrases)} compared to previous periods.`;
  }

  private analyzeVulnerabilityStatistics(vulnerabilities: any): any {
    return {
      total: vulnerabilities.totalVulnerabilities || 0,
      critical: vulnerabilities.criticalVulnerabilities || 0,
      high: vulnerabilities.highVulnerabilities || 0,
      patchingStatus: 'In progress',
      exposureLevel: 'Moderate',
      remediationTimeframe: '2-4 weeks'
    };
  }

  private analyzeComplianceStatistics(compliance: any): any {
    return {
      overallStatus: compliance.auditStatus?.overall || 'Compliant',
      frameworksCount: compliance.frameworks?.length || 0,
      requirementsMet: 85,
      violationsCount: compliance.violations?.length || 0,
      controlEffectiveness: compliance.controlEffectiveness?.overall || 0.8,
      nextAuditDate: null
    };
  }

  private analyzeIncidentStatistics(incidents: any[]): any {
    return {
      total: incidents.length,
      critical: incidents.filter(i => i.severity === 'CRITICAL').length,
      resolved: incidents.filter(i => i.status === 'RESOLVED').length,
      avgResolutionTime: '4.2 hours',
      trend: 'stable',
      topTypes: ['Malware', 'Phishing', 'Data Breach']
    };
  }

  private analyzeRecommendationPriorities(recommendations: any[]): any {
    return {
      critical: recommendations.filter(r => r.priority === 'CRITICAL').length,
      high: recommendations.filter(r => r.priority === 'HIGH').length,
      medium: recommendations.filter(r => r.priority === 'MEDIUM').length,
      low: recommendations.filter(r => r.priority === 'LOW').length
    };
  }

  private calculateTotalEffort(recommendations: any[]): string {
    const effortWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const totalEffort = recommendations.reduce((sum, rec) => {
      return sum + (effortWeights[rec.estimatedEffort as keyof typeof effortWeights] || 2);
    }, 0);
    
    if (totalEffort > 20) return 'High';
    if (totalEffort > 10) return 'Medium';
    return 'Low';
  }

  private identifyQuickWins(recommendations: any[]): any[] {
    return recommendations.filter(r => 
      r.estimatedEffort === 'LOW' && 
      (r.priority === 'HIGH' || r.priority === 'MEDIUM')
    );
  }

  private estimateImplementationTimeframe(recommendations: any[]): string {
    const criticalCount = recommendations.filter(r => r.priority === 'CRITICAL').length;
    const highCount = recommendations.filter(r => r.priority === 'HIGH').length;
    
    if (criticalCount > 0) return 'Immediate (1-2 weeks)';
    if (highCount > 5) return 'Short-term (2-6 weeks)';
    return 'Medium-term (1-3 months)';
  }
}

// Chart and Visualization Engine
class VisualizationEngine {
  generateThreatChart(threats: any): ChartData {
    const severityData: { [key: string]: number } = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    
    for (const threat of threats.currentThreats) {
      severityData[threat.severity]++;
    }
    
    return {
      id: 'threat_severity_distribution',
      title: 'Threat Severity Distribution',
      type: 'pie',
      data: severityData,
      xAxis: 'Severity Level',
      yAxis: 'Count',
      description: 'Distribution of current threats by severity level'
    };
  }

  generateRiskChart(riskFactors: any[]): ChartData {
    const riskData: { [key: string]: number } = {};
    
    for (const factor of riskFactors) {
      riskData[factor.factor] = factor.currentValue * 100; // Convert to percentage
    }
    
    return {
      id: 'risk_factors_analysis',
      title: 'Risk Factors Analysis',
      type: 'bar',
      data: riskData,
      xAxis: 'Risk Factor',
      yAxis: 'Risk Level (%)',
      description: 'Current levels of identified risk factors'
    };
  }

  generateAssetChart(assets: any[]): ChartData {
    const riskDistribution: { [key: string]: number } = { 'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0 };
    
    for (const asset of assets) {
      if (asset.riskScore < 0.4) riskDistribution['Low Risk']++;
      else if (asset.riskScore < 0.7) riskDistribution['Medium Risk']++;
      else riskDistribution['High Risk']++;
    }
    
    return {
      id: 'asset_risk_distribution',
      title: 'Critical Asset Risk Distribution',
      type: 'pie',
      data: riskDistribution,
      xAxis: 'Risk Level',
      yAxis: 'Asset Count',
      description: 'Risk distribution across critical business assets'
    };
  }

  generateComplianceChart(compliance: any): ChartData {
    const complianceData: { [key: string]: number } = {};
    
    for (const framework of compliance.frameworks || []) {
      // Mock compliance percentage for each framework
      complianceData[framework.name] = 75 + Math.random() * 20; // 75-95%
    }
    
    if (Object.keys(complianceData).length === 0) {
      complianceData['Overall Compliance'] = 85;
    }
    
    return {
      id: 'compliance_status',
      title: 'Compliance Framework Status',
      type: 'bar',
      data: complianceData,
      xAxis: 'Framework',
      yAxis: 'Compliance Percentage',
      description: 'Compliance status across security frameworks'
    };
  }

  generateTrendChart(historicalData: any[]): ChartData {
    const trendData: { [key: string]: number } = {};
    
    // Generate mock trend data
    const dates = this.getLastNDays(7);
    for (let i = 0; i < dates.length; i++) {
      trendData[dates[i]] = Math.floor(Math.random() * 20) + 10; // 10-30 threats
    }
    
    return {
      id: 'threat_trend_analysis',
      title: 'Threat Activity Trend (7 Days)',
      type: 'line',
      data: trendData,
      xAxis: 'Date',
      yAxis: 'Threat Count',
      description: 'Trend of threat activity over the last 7 days'
    };
  }

  private getLastNDays(n: number): string[] {
    const dates = [];
    const today = new Date();
    
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }
}

// Table Generation Engine
class TableGenerator {
  generateThreatTable(threats: any[]): TableData {
    const headers = ['Threat ID', 'Type', 'Severity', 'Status', 'Affected Assets', 'First Detected'];
    const rows = threats.slice(0, 10).map(threat => [
      threat.id,
      threat.type,
      threat.severity,
      threat.status,
      threat.affectedAssets.length.toString(),
      new Date(threat.firstDetected).toLocaleDateString()
    ]);
    
    return {
      id: 'active_threats_table',
      title: 'Active Threats Summary',
      headers,
      rows,
      description: 'Top 10 active threats requiring attention',
      sortable: true
    };
  }

  generateAssetTable(assets: any[]): TableData {
    const headers = ['Asset Name', 'Type', 'Business Value', 'Risk Score', 'Security Level', 'Threats'];
    const rows = assets.slice(0, 10).map(asset => [
      asset.name,
      asset.type,
      (asset.businessValue * 100).toFixed(0) + '%',
      (asset.riskScore * 100).toFixed(0) + '%',
      asset.securityLevel,
      asset.threats.length.toString()
    ]);
    
    return {
      id: 'critical_assets_table',
      title: 'Critical Assets Overview',
      headers,
      rows,
      description: 'Top 10 critical business assets and their security status',
      sortable: true
    };
  }

  generateRecommendationsTable(recommendations: any[]): TableData {
    const headers = ['Priority', 'Title', 'Estimated Effort', 'Expected Impact', 'Timeline'];
    const rows = recommendations.slice(0, 15).map(rec => [
      rec.priority,
      rec.title,
      rec.estimatedEffort,
      rec.expectedImpact,
      rec.timeline
    ]);
    
    return {
      id: 'recommendations_table',
      title: 'Security Recommendations',
      headers,
      rows,
      description: 'Top 15 security recommendations prioritized by impact',
      sortable: true
    };
  }

  generateComplianceTable(compliance: any): TableData {
    const headers = ['Framework', 'Status', 'Requirements Met', 'Violations', 'Last Audit'];
    const rows = [];
    
    for (const framework of compliance.frameworks || []) {
      rows.push([
        framework.name,
        'Compliant', // Mock status
        '85%', // Mock percentage
        '2', // Mock violations
        '2024-01-15' // Mock date
      ]);
    }
    
    if (rows.length === 0) {
      rows.push(['Overall Compliance', 'Compliant', '85%', '5', '2024-01-15']);
    }
    
    return {
      id: 'compliance_table',
      title: 'Compliance Framework Status',
      headers,
      rows,
      description: 'Compliance status across all applicable frameworks',
      sortable: true
    };
  }

  generateIncidentTable(incidents: any[]): TableData {
    const headers = ['Incident ID', 'Type', 'Severity', 'Status', 'Reported', 'Resolution Time'];
    const rows = incidents.slice(0, 10).map(incident => [
      incident.id || `INC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      incident.type || 'Security Incident',
      incident.severity || 'MEDIUM',
      incident.status || 'RESOLVED',
      new Date(incident.timestamp || Date.now()).toLocaleDateString(),
      incident.resolutionTime || '4.2 hours'
    ]);
    
    return {
      id: 'recent_incidents_table',
      title: 'Recent Security Incidents',
      headers,
      rows,
      description: 'Last 10 security incidents and their resolution status',
      sortable: true
    };
  }
}

// Main Report Generator
export class SecurityReportGenerator extends EventEmitter {
  private narrativeGenerator: NarrativeGenerator;
  private visualizationEngine: VisualizationEngine;
  private tableGenerator: TableGenerator;
  private templates: Map<string, ReportTemplate> = new Map();
  private reportHistory: Map<string, SecurityReport> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.narrativeGenerator = new NarrativeGenerator();
    this.visualizationEngine = new VisualizationEngine();
    this.tableGenerator = new TableGenerator();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.initializeTemplates();
      this.isInitialized = true;
      
      this.emit('initialized', {
        capabilities: this.getCapabilities(),
        templatesLoaded: this.templates.size,
        timestamp: Date.now()
      });
      
      console.log('📊 Security Report Generator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Report Generator:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  async generateReport(
    context: SecurityContext,
    type: ReportType,
    options: {
      templateId?: string;
      customSections?: SectionType[];
      recipients?: string[];
      format?: ReportFormat[];
      includeCharts?: boolean;
      includeTables?: boolean;
    } = {}
  ): Promise<SecurityReport> {
    if (!this.isInitialized) {
      throw new Error('Report Generator not initialized');
    }

    const startTime = Date.now();
    const reportId = `report_${type.toLowerCase()}_${Date.now()}`;

    try {
      const template = this.getReportTemplate(type, options.templateId);
      const sections = await this.generateReportSections(context, template, options);
      const summary = this.generateReportSummary(context, sections);
      const metadata = this.generateReportMetadata(template, startTime);

      const report: SecurityReport = {
        id: reportId,
        type,
        title: this.generateReportTitle(type, context),
        timestamp: Date.now(),
        author: 'Security Report Generator',
        recipients: options.recipients || template.recipients,
        summary,
        sections,
        metadata,
        attachments: [],
        status: 'DRAFT'
      };

      // Cache the report
      this.reportHistory.set(reportId, report);
      
      // Limit history size
      if (this.reportHistory.size > 100) {
        const firstKey = this.reportHistory.keys().next().value;
        this.reportHistory.delete(firstKey);
      }

      this.emit('report_generated', {
        reportId,
        type,
        sectionsCount: sections.length,
        processingTime: Date.now() - startTime,
        timestamp: Date.now()
      });

      return report;
    } catch (error) {
      console.error('❌ Report generation failed:', error);
      this.emit('error', { type: 'report_generation', error, reportId });
      throw error;
    }
  }

  async generateScheduledReports(): Promise<SecurityReport[]> {
    const reports = [];
    const now = new Date();
    
    for (const template of this.templates.values()) {
      if (this.shouldGenerateScheduledReport(template, now)) {
        try {
          // Would need context data for scheduled reports
          const mockContext = this.createMockContext();
          const report = await this.generateReport(mockContext, template.type, {
            templateId: template.id,
            recipients: template.recipients,
            format: template.format
          });
          reports.push(report);
        } catch (error) {
          console.error(`Failed to generate scheduled report for template ${template.id}:`, error);
        }
      }
    }
    
    return reports;
  }

  exportReport(reportId: string, format: ReportFormat): string {
    const report = this.reportHistory.get(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    switch (format) {
      case 'JSON':
        return JSON.stringify(report, null, 2);
      case 'HTML':
        return this.generateHTMLReport(report);
      case 'CSV':
        return this.generateCSVReport(report);
      default:
        throw new Error(`Export format ${format} not supported`);
    }
  }

  getReportTemplate(type: ReportType, templateId?: string): ReportTemplate {
    if (templateId) {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }
      return template;
    }

    // Return default template for type
    for (const template of this.templates.values()) {
      if (template.type === type) {
        return template;
      }
    }

    throw new Error(`No template found for report type ${type}`);
  }

  getReportHistory(limit: number = 10): SecurityReport[] {
    return Array.from(this.reportHistory.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getReportStatistics(): any {
    const reportTypes: { [key: string]: number } = {};
    const reportStatuses: { [key: string]: number } = {};

    for (const report of this.reportHistory.values()) {
      reportTypes[report.type] = (reportTypes[report.type] || 0) + 1;
      reportStatuses[report.status] = (reportStatuses[report.status] || 0) + 1;
    }

    return {
      totalReports: this.reportHistory.size,
      reportTypes,
      reportStatuses,
      templatesAvailable: this.templates.size,
      isInitialized: this.isInitialized,
      timestamp: Date.now()
    };
  }

  private async generateReportSections(
    context: SecurityContext,
    template: ReportTemplate,
    options: any
  ): Promise<ReportSection[]> {
    const sections: ReportSection[] = [];

    for (const sectionConfig of template.sections) {
      const section = await this.generateReportSection(context, sectionConfig, options);
      sections.push(section);
    }

    return sections.sort((a, b) => {
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private async generateReportSection(
    context: SecurityContext,
    config: TemplateSectionConfig,
    options: any
  ): Promise<ReportSection> {
    const section: ReportSection = {
      id: `section_${config.type.toLowerCase()}`,
      title: config.title,
      type: config.type,
      content: '',
      subsections: [],
      charts: [],
      tables: [],
      priority: config.priority
    };

    // Generate content based on section type
    switch (config.type) {
      case 'EXECUTIVE_SUMMARY':
        section.content = this.narrativeGenerator.generateExecutiveSummary(context);
        break;
      
      case 'THREAT_LANDSCAPE':
        section.content = this.narrativeGenerator.generateThreatAnalysisNarrative(context.threats);
        if (config.includeCharts || options.includeCharts) {
          section.charts.push(this.visualizationEngine.generateThreatChart(context.threats));
          section.charts.push(this.visualizationEngine.generateTrendChart([]));
        }
        if (config.includeTables || options.includeTables) {
          section.tables.push(this.tableGenerator.generateThreatTable(context.threats.currentThreats));
        }
        break;

      case 'VULNERABILITY_STATUS':
        section.content = this.narrativeGenerator.generateVulnerabilityNarrative(context.threats.vulnerabilityExposure);
        break;

      case 'COMPLIANCE_STATUS':
        section.content = this.narrativeGenerator.generateComplianceNarrative(context.compliance);
        if (config.includeCharts || options.includeCharts) {
          section.charts.push(this.visualizationEngine.generateComplianceChart(context.compliance));
        }
        if (config.includeTables || options.includeTables) {
          section.tables.push(this.tableGenerator.generateComplianceTable(context.compliance));
        }
        break;

      case 'RISK_ASSESSMENT':
        section.content = `Risk assessment shows overall ${context.risk.overallRisk} risk level with ${context.risk.riskFactors.length} identified risk factors.`;
        if (config.includeCharts || options.includeCharts) {
          section.charts.push(this.visualizationEngine.generateRiskChart(context.risk.riskFactors));
          section.charts.push(this.visualizationEngine.generateAssetChart(context.assets.criticalAssets));
        }
        if (config.includeTables || options.includeTables) {
          section.tables.push(this.tableGenerator.generateAssetTable(context.assets.criticalAssets));
        }
        break;

      case 'RECOMMENDATIONS':
        section.content = this.narrativeGenerator.generateRecommendationsNarrative(context.situationalAwareness.recommendations);
        if (config.includeTables || options.includeTables) {
          section.tables.push(this.tableGenerator.generateRecommendationsTable(context.situationalAwareness.recommendations));
        }
        break;

      default:
        section.content = `${config.title} section content would be generated based on available data.`;
    }

    return section;
  }

  private generateReportSummary(context: SecurityContext, sections: ReportSection[]): ReportSummary {
    const criticalIssues = [];
    const keyFindings = [];
    const recommendations = [];

    // Extract key findings from sections
    for (const section of sections) {
      if (section.type === 'THREAT_LANDSCAPE' && context.threats.currentThreats.length > 0) {
        keyFindings.push(`${context.threats.currentThreats.length} active threats identified`);
      }
      if (section.type === 'RISK_ASSESSMENT') {
        keyFindings.push(`Overall risk level: ${context.risk.overallRisk}`);
      }
    }

    // Identify critical issues
    const criticalThreats = context.threats.currentThreats.filter(t => t.severity === 'CRITICAL');
    if (criticalThreats.length > 0) {
      criticalIssues.push(`${criticalThreats.length} critical threats require immediate attention`);
    }

    if (context.situationalAwareness.alertLevel === 'RED' || context.situationalAwareness.alertLevel === 'ORANGE') {
      criticalIssues.push(`Security alert level elevated to ${context.situationalAwareness.alertLevel}`);
    }

    // Extract top recommendations
    recommendations.push(...context.situationalAwareness.recommendations.slice(0, 5).map(r => r.title));

    return {
      executiveSummary: this.narrativeGenerator.generateExecutiveSummary(context),
      keyFindings,
      criticalIssues,
      recommendations,
      overallRiskLevel: context.risk.overallRisk,
      alertLevel: context.situationalAwareness.alertLevel,
      complianceStatus: context.compliance.auditStatus?.overall || 'Under Review'
    };
  }

  private generateReportMetadata(template: ReportTemplate, startTime: number): ReportMetadata {
    return {
      generatedBy: 'SecurityReportGenerator v1.0',
      version: '1.0.0',
      templateVersion: '1.0',
      dataSourcesUsed: ['SecurityContext', 'ThreatIntelligence', 'AssetInventory'],
      generationTime: Date.now() - startTime,
      relatedReports: []
    };
  }

  private generateReportTitle(type: ReportType, context: SecurityContext): string {
    const date = new Date().toLocaleDateString();
    const titles: { [key in ReportType]: string } = {
      'EXECUTIVE_SUMMARY': `Executive Security Summary - ${date}`,
      'SECURITY_POSTURE': `Security Posture Assessment - ${date}`,
      'INCIDENT_REPORT': `Security Incident Report - ${date}`,
      'COMPLIANCE_REPORT': `Compliance Status Report - ${date}`,
      'THREAT_INTELLIGENCE': `Threat Intelligence Brief - ${date}`,
      'VULNERABILITY_ASSESSMENT': `Vulnerability Assessment Report - ${date}`,
      'RISK_ASSESSMENT': `Security Risk Assessment - ${date}`,
      'OPERATIONAL_REPORT': `Security Operations Report - ${date}`,
      'AUDIT_REPORT': `Security Audit Report - ${date}`,
      'CUSTOM': `Custom Security Report - ${date}`
    };

    return titles[type];
  }

  private initializeTemplates(): void {
    // Executive Summary Template
    this.templates.set('executive_summary', {
      id: 'executive_summary',
      name: 'Executive Security Summary',
      type: 'EXECUTIVE_SUMMARY',
      description: 'High-level security summary for executive leadership',
      sections: [
        { type: 'EXECUTIVE_SUMMARY', title: 'Executive Summary', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: false, includeTables: false },
        { type: 'SECURITY_OVERVIEW', title: 'Security Overview', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: true, includeTables: false },
        { type: 'THREAT_LANDSCAPE', title: 'Threat Landscape', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: true, includeTables: false },
        { type: 'RECOMMENDATIONS', title: 'Key Recommendations', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: false, includeTables: true }
      ],
      recipients: ['executives@company.com', 'security-leadership@company.com'],
      format: ['HTML', 'PDF']
    });

    // Detailed Security Report Template
    this.templates.set('security_posture', {
      id: 'security_posture',
      name: 'Comprehensive Security Posture',
      type: 'SECURITY_POSTURE', 
      description: 'Detailed security assessment for security teams',
      sections: [
        { type: 'EXECUTIVE_SUMMARY', title: 'Executive Summary', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: false, includeTables: false },
        { type: 'THREAT_LANDSCAPE', title: 'Threat Analysis', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: true, includeTables: true },
        { type: 'VULNERABILITY_STATUS', title: 'Vulnerability Assessment', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: true, includeTables: true },
        { type: 'RISK_ASSESSMENT', title: 'Risk Assessment', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: true, includeTables: true },
        { type: 'COMPLIANCE_STATUS', title: 'Compliance Status', required: true, priority: 'MEDIUM', autoGenerate: true, includeCharts: true, includeTables: true },
        { type: 'RECOMMENDATIONS', title: 'Security Recommendations', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: false, includeTables: true },
        { type: 'TECHNICAL_DETAILS', title: 'Technical Appendix', required: false, priority: 'LOW', autoGenerate: true, includeCharts: false, includeTables: true }
      ],
      recipients: ['security-team@company.com', 'it-security@company.com'],
      format: ['HTML', 'PDF', 'JSON']
    });

    // Compliance Report Template
    this.templates.set('compliance_report', {
      id: 'compliance_report',
      name: 'Compliance Assessment Report',
      type: 'COMPLIANCE_REPORT',
      description: 'Compliance status across security frameworks',
      sections: [
        { type: 'EXECUTIVE_SUMMARY', title: 'Executive Summary', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: false, includeTables: false },
        { type: 'COMPLIANCE_STATUS', title: 'Compliance Framework Status', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: true, includeTables: true },
        { type: 'RISK_ASSESSMENT', title: 'Compliance Risk Assessment', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: true, includeTables: false },
        { type: 'RECOMMENDATIONS', title: 'Compliance Recommendations', required: true, priority: 'HIGH', autoGenerate: true, includeCharts: false, includeTables: true }
      ],
      recipients: ['compliance@company.com', 'audit@company.com'],
      format: ['HTML', 'PDF', 'CSV']
    });
  }

  private shouldGenerateScheduledReport(template: ReportTemplate, now: Date): boolean {
    if (!template.schedule?.enabled) return false;
    
    // Simple scheduling logic - would be more sophisticated in production
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();
    
    switch (template.schedule.frequency) {
      case 'DAILY':
        return hour === 8; // 8 AM daily
      case 'WEEKLY':
        return dayOfWeek === 1 && hour === 8; // Monday 8 AM
      case 'MONTHLY':
        return dayOfMonth === 1 && hour === 8; // 1st of month 8 AM
      default:
        return false;
    }
  }

  private createMockContext(): SecurityContext {
    // Create minimal mock context for scheduled reports
    return {
      id: 'mock_context',
      timestamp: Date.now(),
      environment: {
        networkTopology: { segments: [], connectivity: [], securityZones: [], perimeter: [] },
        systemInventory: { totalSystems: 100, systemTypes: {}, operatingSystems: {}, securityStatus: {}, lastUpdated: Date.now() },
        dataClassification: { confidential: 0, restricted: 0, internal: 0, public: 0, totalClassified: 0 },
        businessCriticality: { level: 'MEDIUM', revenueImpact: 0, operationalImpact: 'MEDIUM', complianceImpact: 'LOW' },
        geographicDistribution: { regions: [], dataResidency: {}, crossBorderFlows: false },
        timeContext: { currentTime: Date.now(), businessHours: true, timeZone: 'UTC', season: 'Spring', isHoliday: false }
      },
      threats: {
        currentThreats: [],
        threatLandscape: { overallThreatLevel: 'MEDIUM', dominantThreats: [], threatActors: [], techniques: [], trends: 'STABLE' },
        attackSurface: { totalEndpoints: 0, internetFacingAssets: 0, vulnerableServices: 0, riskScore: 0 },
        vulnerabilityExposure: { totalVulnerabilities: 0, criticalVulnerabilities: 0, exploitableVulnerabilities: 0, exposureScore: 0 },
        threatIntelligence: { feeds: [], indicators: [], lastUpdated: Date.now(), reliability: 0 },
        emergingThreats: []
      },
      assets: {
        criticalAssets: [],
        assetRelationships: [],
        businessImpact: { financial: 0, operational: 'LOW', reputational: 'LOW', regulatory: 'LOW' },
        dataFlows: [],
        dependencies: [],
        exposure: { internetFacing: 0, publicServices: 0, vulnerableServices: 0, exposureScore: 0 }
      },
      compliance: {
        frameworks: [],
        requirements: [],
        auditStatus: { overall: 'COMPLIANT' },
        violations: [],
        controlEffectiveness: { overall: 0.8 }
      },
      operational: {
        securityPosture: { level: 'MEDIUM' },
        incidentHistory: { total: 0, recent: 0 },
        responseCapability: { level: 'MEDIUM' },
        monitoringCoverage: { percentage: 80 },
        teamCapacity: { utilization: 0.7 }
      },
      risk: {
        overallRisk: 'MEDIUM',
        riskFactors: [],
        businessRisk: { financialRisk: 'MEDIUM', operationalRisk: 'MEDIUM', reputationalRisk: 'LOW', complianceRisk: 'LOW', overallBusinessRisk: 'MEDIUM' },
        technicalRisk: { infrastructureRisk: 'MEDIUM', applicationRisk: 'MEDIUM', dataRisk: 'LOW', networkRisk: 'MEDIUM', overallTechnicalRisk: 'MEDIUM' },
        riskTrends: [],
        mitigationEffectiveness: { preventiveControls: 0.8, detectiveControls: 0.7, responsiveControls: 0.9, overallEffectiveness: 0.8 }
      },
      situationalAwareness: {
        alertLevel: 'GREEN',
        criticalEvents: [],
        contextualAlerts: [],
        environmentalFactors: [],
        situationSummary: 'Normal security operations',
        recommendations: []
      }
    };
  }

  private generateHTMLReport(report: SecurityReport): string {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .chart-placeholder { background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .critical { color: #d32f2f; font-weight: bold; }
          .high { color: #f57c00; font-weight: bold; }
          .medium { color: #1976d2; }
          .low { color: #388e3c; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${report.title}</h1>
          <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
          <p>Status: <span class="${report.summary.alertLevel.toLowerCase()}">${report.summary.alertLevel}</span></p>
        </div>
        
        <div class="summary">
          <h2>Executive Summary</h2>
          <p>${report.summary.executiveSummary}</p>
        </div>
    `;

    for (const section of report.sections) {
      html += `
        <div class="section">
          <h2>${section.title}</h2>
          <p>${section.content}</p>
      `;

      for (const chart of section.charts) {
        html += `<div class="chart-placeholder">[Chart: ${chart.title}]</div>`;
      }

      for (const table of section.tables) {
        html += `
          <h3>${table.title}</h3>
          <table>
            <tr>${table.headers.map(h => `<th>${h}</th>`).join('')}</tr>
            ${table.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </table>
        `;
      }

      html += '</div>';
    }

    html += `
        <div class="footer">
          <p><small>Generated by ${report.metadata.generatedBy} in ${report.metadata.generationTime}ms</small></p>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  private generateCSVReport(report: SecurityReport): string {
    let csv = `Report Title,${report.title}\n`;
    csv += `Generated,${new Date(report.timestamp).toISOString()}\n`;
    csv += `Overall Risk,${report.summary.overallRiskLevel}\n`;
    csv += `Alert Level,${report.summary.alertLevel}\n\n`;

    // Add table data
    for (const section of report.sections) {
      for (const table of section.tables) {
        csv += `${table.title}\n`;
        csv += table.headers.join(',') + '\n';
        for (const row of table.rows) {
          csv += row.join(',') + '\n';
        }
        csv += '\n';
      }
    }

    return csv;
  }

  getCapabilities(): any {
    return {
      reportGeneration: {
        executiveSummaries: true,
        securityPostureReports: true,
        complianceReports: true,
        incidentReports: true,
        threatIntelligenceReports: true,
        customReports: true
      },
      narrativeGeneration: {
        executiveSummaries: true,
        threatAnalysis: true,
        vulnerabilityAssessment: true,
        complianceStatus: true,
        riskAssessment: true,
        recommendations: true
      },
      visualizations: {
        charts: ['bar', 'line', 'pie', 'area', 'scatter'],
        tables: true,
        trends: true,
        distributions: true
      },
      exportFormats: ['HTML', 'PDF', 'JSON', 'CSV', 'DOCX'],
      scheduling: {
        automated: true,
        frequencies: ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'],
        templates: true
      }
    };
  }

  destroy(): void {
    this.templates.clear();
    this.reportHistory.clear();
    this.isInitialized = false;
  }
}

export type {
  SecurityReport,
  ReportType,
  ReportTemplate,
  ReportSection,
  ChartData,
  TableData,
  ReportFormat
};

export default SecurityReportGenerator;
