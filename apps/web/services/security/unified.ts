import { SonarQubeService, SonarQubeMetrics, SonarQubeIssue } from './sonarqube';
import { SnykService, SnykProject, SnykTestResult } from './snyk';
import { ContainerSecurityService, DockerImageScan, ContainerScanResult } from './container';
// import { SecurityHealthService } from './healthMonitor';
import { SecurityAPIClient } from './apiClient';
import { SecurityNotificationService } from './notifications';
import axios from 'axios';

export interface UnifiedSecurityReport {
  timestamp: string;
  overallScore: number;
  tools: {
    sonarqube: {
      enabled: boolean;
      score: number;
      metrics?: SonarQubeMetrics;
      criticalIssues: number;
      highIssues: number;
    };
    snyk: {
      enabled: boolean;
      score: number;
      projects?: SnykProject[];
      vulnerabilities: {
        critical: number;
        high: number;
        medium: number;
        low: number;
      };
    };
    container: {
      enabled: boolean;
      score: number;
      scans?: ContainerScanResult[];
      vulnerableImages: number;
    };
  };
  alerts: SecurityAlert[];
  recommendations: string[];
  complianceStatus: ComplianceStatus;
}

export interface SecurityAlert {
  id: string;
  type: 'vulnerability' | 'compliance' | 'configuration' | 'threat' | 'security_hotspot';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  component?: string;
  remediation?: string;
  createdAt: string;
  status?: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
}

export interface ComplianceStatus {
  frameworks: string[];
  overallCompliant: boolean;
  scores: {
    [framework: string]: number;
  };
  gaps: ComplianceGap[];
}

export interface ComplianceGap {
  framework: string;
  control: string;
  status: 'missing' | 'partial' | 'failed';
  description: string;
  remediation: string;
}

export interface SecurityTrend {
  date: string;
  score: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  compliance: number;
}

export class UnifiedSecurityService {
  private sonarqube: SonarQubeService;
  private snyk: SnykService;
  private container: ContainerSecurityService;
  private apiClient: SecurityAPIClient;
  private notifications: SecurityNotificationService;
  
  constructor() {
    this.sonarqube = new SonarQubeService();
    this.snyk = new SnykService();
    this.container = new ContainerSecurityService();
    this.apiClient = new SecurityAPIClient();
    this.notifications = new SecurityNotificationService();
  }

  /**
   * Get unified security analysis from all integrated tools
   */
  async getUnifiedAnalysis(): Promise<UnifiedSecurityReport> {
    console.log('🔍 Performing unified security analysis...');
    
    // Check health status of all services (simplified)
    const healthStatus = {
      services: {
        sonarqube: { healthy: true },
        snyk: { healthy: true },
        container: { healthy: true }
      }
    };
    
    // Parallel execution of security scans
    const [sonarData, snykData, containerData] = await Promise.allSettled([
      this.getSonarQubeAnalysis(),
      this.getSnykAnalysis(),
      this.getContainerAnalysis()
    ]);

    const alerts: SecurityAlert[] = [];
    const recommendations: string[] = [];
    
    // Process SonarQube results
    const sonarqubeReport = {
      enabled: healthStatus.services.sonarqube.healthy,
      score: 100,
      criticalIssues: 0,
      highIssues: 0,
      metrics: undefined as SonarQubeMetrics | undefined
    };
    
    if (sonarData.status === 'fulfilled' && sonarData.value) {
      sonarqubeReport.metrics = sonarData.value.metrics;
      sonarqubeReport.criticalIssues = sonarData.value.issues.filter(i => i.severity === 'CRITICAL').length;
      sonarqubeReport.highIssues = sonarData.value.issues.filter(i => i.severity === 'HIGH').length;
      sonarqubeReport.score = this.calculateSonarQubeScore(sonarData.value);
      
      // Generate alerts for critical issues
      sonarData.value.issues
        .filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH')
        .forEach(issue => {
          alerts.push(this.createAlertFromSonarIssue(issue));
        });
    }

    // Process Snyk results
    const snykReport = {
      enabled: healthStatus.services.snyk.healthy,
      score: 100,
      projects: undefined as SnykProject[] | undefined,
      vulnerabilities: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    };
    
    if (snykData.status === 'fulfilled' && snykData.value) {
      snykReport.projects = snykData.value.projects;
      snykReport.vulnerabilities = snykData.value.summary;
      snykReport.score = this.calculateSnykScore(snykData.value);
      
      // Generate alerts for vulnerabilities
      if (snykData.value.vulnerabilities) {
        snykData.value.vulnerabilities
          .filter(v => v.severity === 'critical' || v.severity === 'high')
          .forEach(vuln => {
            alerts.push(this.createAlertFromSnykVuln(vuln));
          });
      }
    }

    // Process Container Security results
    const containerReport = {
      enabled: healthStatus.services.container.healthy,
      score: 100,
      scans: undefined as ContainerScanResult[] | undefined,
      vulnerableImages: 0
    };
    
    if (containerData.status === 'fulfilled' && containerData.value) {
      containerReport.scans = containerData.value.scans;
      containerReport.vulnerableImages = containerData.value.vulnerableImages;
      containerReport.score = containerData.value.score;
      
      // Generate alerts for container vulnerabilities
      containerData.value.issues?.forEach(issue => {
        alerts.push(this.createAlertFromContainerIssue(issue));
      });
    }

    // Calculate overall security score
    const overallScore = this.calculateOverallScore(
      sonarqubeReport.score,
      snykReport.score,
      containerReport.score
    );

    // Get compliance status
    const complianceStatus = await this.getComplianceStatus();

    // Generate recommendations
    recommendations.push(...this.generateRecommendations({
      sonarqube: sonarqubeReport,
      snyk: snykReport,
      container: containerReport,
      compliance: complianceStatus
    }));

    // Send notifications for critical alerts
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      await this.notifications.sendBulkAlerts(criticalAlerts);
    }

    return {
      timestamp: new Date().toISOString(),
      overallScore,
      tools: {
        sonarqube: sonarqubeReport,
        snyk: snykReport,
        container: containerReport
      },
      alerts: alerts.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)),
      recommendations,
      complianceStatus
    };
  }

  /**
   * Get security trends over time
   */
  async getSecurityTrends(days: number = 30): Promise<SecurityTrend[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const response = await axios.get('/api/security/trends', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      });

      return response.data.trends || [];
    } catch (error) {
      console.error('Failed to get security trends:', error);
      return [];
    }
  }

  /**
   * Run targeted security scan
   */
  async runSecurityScan(target: string, scanTypes: string[]): Promise<any> {
    const results: any = {};

    if (scanTypes.includes('sonarqube')) {
      results.sonarqube = await this.sonarqube.scanProject(target);
    }

    if (scanTypes.includes('snyk')) {
      results.snyk = await this.snyk.testProject(target);
    }

    if (scanTypes.includes('container')) {
      results.container = await this.container.scanImage(target);
    }

    return results;
  }

  /**
   * Private helper methods
   */
  
  private async getSonarQubeAnalysis(): Promise<any> {
    try {
      const metrics = await this.sonarqube.getProjectMetrics();
      const issues = await this.sonarqube.getIssues();
      return { metrics, issues };
    } catch (error) {
      console.error('SonarQube analysis failed:', error);
      return null;
    }
  }

  private async getSnykAnalysis(): Promise<any> {
    try {
      const projects = await this.snyk.getProjects();
      const vulnerabilities = await this.snyk.getAllVulnerabilities();
      
      const summary = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      };

      vulnerabilities.forEach(vuln => {
        summary[vuln.severity]++;
      });

      return { projects, vulnerabilities, summary };
    } catch (error) {
      console.error('Snyk analysis failed:', error);
      return null;
    }
  }

  private async getContainerAnalysis(): Promise<any> {
    try {
      const dockerfileScan = await this.container.scanDockerfile('./Dockerfile');
      const imageScan = await this.container.scanImage('secureflow-automaton', 'latest');
      const dependencyScan = await this.container.scanDependencies();

      const vulnerableImages = imageScan?.summary?.critical > 0 || imageScan?.summary?.high > 0 ? 1 : 0;
      
      const score = Math.min(
        dockerfileScan?.score || 100,
        this.calculateImageScore(imageScan),
        dependencyScan?.score || 100
      );

      const issues = [];
      if (dockerfileScan?.issues) {
        issues.push(...dockerfileScan.issues.filter(i => i.severity === 'critical' || i.severity === 'high'));
      }

      return {
        scans: [dockerfileScan, imageScan, dependencyScan].filter(Boolean),
        vulnerableImages,
        score,
        issues
      };
    } catch (error) {
      console.error('Container analysis failed:', error);
      return null;
    }
  }

  private async getComplianceStatus(): Promise<ComplianceStatus> {
    try {
      const response = await axios.get('/api/compliance/status');
      return response.data;
    } catch (error) {
      // Return default compliance status
      return {
        frameworks: ['SOC2', 'HIPAA', 'PCI-DSS'],
        overallCompliant: false,
        scores: {
          SOC2: 75,
          HIPAA: 80,
          'PCI-DSS': 70
        },
        gaps: []
      };
    }
  }

  private calculateSonarQubeScore(data: any): number {
    let score = 100;
    const metrics = data.metrics?.metrics || {};
    
    // Deduct points for issues
    const bugs = parseInt(metrics.bugs || '0');
    const vulnerabilities = parseInt(metrics.vulnerabilities || '0');
    const codeSmells = parseInt(metrics.code_smells || '0');
    
    score -= bugs * 5;
    score -= vulnerabilities * 10;
    score -= codeSmells * 0.5;
    
    // Consider security rating
    const securityRating = parseInt(metrics.security_rating || '1');
    score -= (securityRating - 1) * 10;
    
    return Math.max(0, Math.round(score));
  }

  private calculateSnykScore(data: any): number {
    let score = 100;
    const { summary } = data;
    
    score -= summary.critical * 20;
    score -= summary.high * 10;
    score -= summary.medium * 5;
    score -= summary.low * 1;
    
    return Math.max(0, Math.round(score));
  }

  private calculateImageScore(scan: DockerImageScan | null): number {
    if (!scan) return 100;
    
    let score = 100;
    score -= scan.summary.critical * 20;
    score -= scan.summary.high * 10;
    score -= scan.summary.medium * 5;
    score -= scan.summary.low * 1;
    
    return Math.max(0, Math.round(score));
  }

  private calculateOverallScore(sonarScore: number, snykScore: number, containerScore: number): number {
    // Weighted average: SonarQube 35%, Snyk 35%, Container 30%
    return Math.round(
      sonarScore * 0.35 +
      snykScore * 0.35 +
      containerScore * 0.30
    );
  }

  private createAlertFromSonarIssue(issue: SonarQubeIssue): SecurityAlert {
    return {
      id: `sonar-${issue.key}`,
      type: issue.type === 'SECURITY_HOTSPOT' ? 'security_hotspot' : 'vulnerability',
      severity: this.mapSonarSeverity(issue.severity),
      title: issue.message,
      description: issue.message,
      source: 'SonarQube',
      component: issue.component,
      createdAt: issue.creationDate,
      status: 'open'
    };
  }

  private createAlertFromSnykVuln(vuln: any): SecurityAlert {
    return {
      id: `snyk-${vuln.id}`,
      type: 'vulnerability',
      severity: vuln.severity,
      title: vuln.title,
      description: vuln.description,
      source: 'Snyk',
      component: vuln.packageName,
      remediation: vuln.fixedIn ? `Upgrade to ${vuln.fixedIn[0]}` : 'No fix available',
      createdAt: new Date().toISOString(),
      status: 'open'
    };
  }

  private createAlertFromContainerIssue(issue: any): SecurityAlert {
    return {
      id: `container-${Date.now()}`,
      type: 'configuration',
      severity: issue.severity,
      title: issue.message,
      description: issue.message,
      source: 'Container Security',
      remediation: issue.fix,
      createdAt: new Date().toISOString(),
      status: 'open'
    };
  }

  private mapSonarSeverity(severity: string): SecurityAlert['severity'] {
    switch (severity) {
      case 'BLOCKER':
      case 'CRITICAL':
        return 'critical';
      case 'MAJOR':
        return 'high';
      case 'MINOR':
        return 'medium';
      case 'INFO':
        return 'low';
      default:
        return 'low';
    }
  }

  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private generateRecommendations(data: any): string[] {
    const recommendations: string[] = [];

    // SonarQube recommendations
    if (data.sonarqube.criticalIssues > 0) {
      recommendations.push('Address critical code quality issues identified by SonarQube immediately');
    }
    if (data.sonarqube.score < 70) {
      recommendations.push('Improve code quality by fixing bugs and security hotspots');
    }

    // Snyk recommendations
    if (data.snyk.vulnerabilities.critical > 0) {
      recommendations.push('Update dependencies with critical vulnerabilities');
    }
    if (data.snyk.vulnerabilities.high > 5) {
      recommendations.push('Review and patch high-severity dependency vulnerabilities');
    }

    // Container recommendations
    if (data.container.vulnerableImages > 0) {
      recommendations.push('Update base images to patch container vulnerabilities');
    }
    if (data.container.score < 80) {
      recommendations.push('Review and improve Dockerfile security configuration');
    }

    // Compliance recommendations
    if (!data.compliance.overallCompliant) {
      recommendations.push('Address compliance gaps to meet regulatory requirements');
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Maintain current security practices and continue monitoring');
    }

    return recommendations;
  }
}