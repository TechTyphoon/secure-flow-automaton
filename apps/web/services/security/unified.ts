import { sonarQubeService, SonarQubeMetrics, SonarQubeIssue } from './sonarqube';
import { snykService, SnykTestResult, SnykVulnerability } from './snyk';
import { containerSecurityService, DockerImageScan, ContainerVulnerability } from './container';

export interface UnifiedSecurityMetrics {
  securityScore: number;
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  lastScanDate: string;
  scanStatus: 'completed' | 'running' | 'failed' | 'pending';
  breakdown: {
    sast: {
      score: number;
      issues: number;
      coverage: number;
    };
    dependencies: {
      score: number;
      vulnerabilities: number;
      totalDeps: number;
    };
    container: {
      score: number;
      vulnerabilities: number;
      dockerfileIssues: number;
    };
  };
  trends: {
    scoreChange: number;
    vulnChange: number;
    period: '7d' | '30d';
  };
}

export interface SecurityAlert {
  id: string;
  type: 'critical_vulnerability' | 'security_hotspot' | 'dependency_risk' | 'container_issue';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: 'sonarqube' | 'snyk' | 'container' | 'system';
  component?: string;
  line?: number;
  createdAt: string;
  resolvedAt?: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
  assignee?: string;
  remediationAdvice?: string;
  references?: string[];
}

export interface SecurityScanRequest {
  includesSAST?: boolean;
  includesDependencies?: boolean;
  includesContainer?: boolean;
  severity?: 'all' | 'critical' | 'high' | 'medium' | 'low';
}

export class UnifiedSecurityService {
  private static instance: UnifiedSecurityService;
  private isScanning: boolean = false;
  private lastScanTime: Date | null = null;

  static getInstance(): UnifiedSecurityService {
    if (!UnifiedSecurityService.instance) {
      UnifiedSecurityService.instance = new UnifiedSecurityService();
    }
    return UnifiedSecurityService.instance;
  }

  async performComprehensiveScan(options: SecurityScanRequest = {}): Promise<UnifiedSecurityMetrics> {
    if (this.isScanning) {
      throw new Error('Security scan already in progress');
    }

    this.isScanning = true;
    const scanStartTime = new Date();

    try {
      const promises: Promise<any>[] = [];

      // SAST Analysis (SonarQube)
      if (options.includesSAST !== false) {
        promises.push(sonarQubeService.getProjectMetrics());
        promises.push(sonarQubeService.getIssues());
      }

      // Dependency Analysis (Snyk)
      if (options.includesDependencies !== false) {
        promises.push(snykService.testProject());
      }

      // Container Security Analysis
      if (options.includesContainer !== false) {
        // Container security analysis
        promises.push(containerSecurityService.getComprehensiveAnalysis());
      }

      const results = await Promise.allSettled(promises);
      
      // Process results
      const sonarMetrics = results[0]?.status === 'fulfilled' ? results[0].value : null;
      const sonarIssues = results[1]?.status === 'fulfilled' ? results[1].value : [];
      const snykResults = results[2]?.status === 'fulfilled' ? results[2].value : null;
      const containerResults = results[3]?.status === 'fulfilled' ? results[3].value : null;

      const metrics = this.calculateUnifiedMetrics(
        sonarMetrics,
        sonarIssues,
        snykResults,
        containerResults
      );

      this.lastScanTime = scanStartTime;
      return metrics;

    } catch (error) {
      console.error('Comprehensive security scan failed:', error);
      throw error;
    } finally {
      this.isScanning = false;
    }
  }

  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];

    try {
      // Get SonarQube critical issues
      const sonarIssues = await sonarQubeService.getIssues('CRITICAL,BLOCKER');
      sonarIssues.forEach(issue => {
        if (issue.status === 'OPEN' || issue.status === 'REOPENED') {
          alerts.push(this.convertSonarIssueToAlert(issue));
        }
      });

      // Get Snyk critical vulnerabilities
      const snykVulns = await snykService.getVulnerabilities('critical');
      snykVulns.forEach(vuln => {
        alerts.push(this.convertSnykVulnToAlert(vuln));
      });

      // Get container critical vulnerabilities
      const containerScan = await containerSecurityService.scanImage('secure-flow-automaton');
      containerScan.vulnerabilities.forEach(vuln => {
        if (vuln.severity === 'HIGH' || vuln.severity === 'CRITICAL') {
          alerts.push(this.convertContainerVulnToAlert(vuln, containerScan.image));
        }
      });

      // Sort by severity and creation date
      return alerts.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    } catch (error) {
      console.error('Failed to fetch security alerts:', error);
      return [];
    }
  }

  async getSecurityTrends(period: '7d' | '30d' = '7d'): Promise<any> {
    // This would typically fetch historical data from a database
    // For now, return mock trend data
    return {
      period,
      scoreHistory: this.generateMockScoreHistory(period),
      vulnerabilityHistory: this.generateMockVulnHistory(period),
      alerts: await this.getSecurityAlerts(),
    };
  }

  async generateSecurityReport(): Promise<any> {
    const [metrics, alerts, trends] = await Promise.all([
      this.performComprehensiveScan(),
      this.getSecurityAlerts(),
      this.getSecurityTrends('30d'),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      summary: metrics,
      criticalAlerts: alerts.filter(a => a.severity === 'critical'),
      trends,
      recommendations: this.generateRecommendations(metrics, alerts),
      compliance: this.assessCompliance(metrics),
    };
  }

  private calculateUnifiedMetrics(
    sonarMetrics: SonarQubeMetrics | null,
    sonarIssues: SonarQubeIssue[],
    snykResults: SnykTestResult | null,
    containerResults: any
  ): UnifiedSecurityMetrics {
    // Calculate individual scores
    const sastScore = sonarMetrics ? sonarQubeService.calculateSecurityScore(sonarMetrics) : 50;
    const depScore = snykResults ? snykService.calculateRiskScore(snykResults) : 50;
    const containerScore = containerResults ? 
      containerResults.overallScore || 50 : 50;

    // Calculate weighted overall score
    const overallScore = Math.round((sastScore * 0.4) + (depScore * 0.35) + (containerScore * 0.25));

    // Aggregate vulnerability counts
    const sonarVulns = sonarIssues.filter(i => i.type === 'VULNERABILITY' || i.type === 'SECURITY_HOTSPOT');
    const snykVulns = snykResults?.vulnerabilities || [];
    const containerVulns = containerResults?.summary || { critical: 0, high: 0, medium: 0, low: 0 };

    const totalVulns = sonarVulns.length + snykVulns.length + containerVulns.total;
    const criticalCount = 
      sonarVulns.filter(i => i.severity === 'CRITICAL' || i.severity === 'BLOCKER').length +
      snykVulns.filter(v => v.severity === 'critical').length +
      containerVulns.critical;

    const highCount = 
      sonarVulns.filter(i => i.severity === 'MAJOR').length +
      snykVulns.filter(v => v.severity === 'high').length +
      containerVulns.high;

    const mediumCount = 
      sonarVulns.filter(i => i.severity === 'MINOR').length +
      snykVulns.filter(v => v.severity === 'medium').length +
      containerVulns.medium;

    const lowCount = 
      sonarVulns.filter(i => i.severity === 'INFO').length +
      snykVulns.filter(v => v.severity === 'low').length +
      containerVulns.low;

    return {
      securityScore: overallScore,
      totalVulnerabilities: totalVulns,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      lastScanDate: new Date().toISOString(),
      scanStatus: 'completed',
      breakdown: {
        sast: {
          score: sastScore,
          issues: sonarIssues.length,
          coverage: parseFloat(sonarMetrics?.metrics.coverage || '0'),
        },
        dependencies: {
          score: depScore,
          vulnerabilities: snykVulns.length,
          totalDeps: snykResults?.dependencyCount || 0,
        },
        container: {
          score: containerScore,
          vulnerabilities: containerVulns.total || 0,
          dockerfileIssues: containerResults?.dockerfileIssues || 0,
        },
      },
      trends: {
        scoreChange: this.calculateScoreChange(overallScore),
        vulnChange: this.calculateVulnChange(totalVulns),
        period: '7d',
      },
    };
  }

  private convertSonarIssueToAlert(issue: SonarQubeIssue): SecurityAlert {
    return {
      id: issue.key,
      type: issue.type === 'SECURITY_HOTSPOT' ? 'security_hotspot' : 'critical_vulnerability',
      severity: this.mapSonarSeverity(issue.severity),
      title: issue.message,
      description: `${issue.rule}: ${issue.message}`,
      source: 'sonarqube',
      component: issue.component,
      line: issue.line,
      createdAt: issue.creationDate,
      status: this.mapSonarStatus(issue.status),
      remediationAdvice: `Effort: ${issue.effort || 'Unknown'}`,
      references: [`https://rules.sonarsource.com/typescript/RSPEC-${issue.rule.split(':')[1]}`],
    };
  }

  private convertSnykVulnToAlert(vuln: SnykVulnerability): SecurityAlert {
    return {
      id: vuln.id,
      type: 'dependency_risk',
      severity: vuln.severity as any,
      title: vuln.title,
      description: `${vuln.package}@${vuln.version}: ${vuln.description}`,
      source: 'snyk',
      component: vuln.package,
      createdAt: vuln.publicationTime || new Date().toISOString(),
      status: 'open',
      remediationAdvice: vuln.fixedIn?.length ? 
        `Upgrade to ${vuln.fixedIn.join(' or ')}` : 
        'No fix available',
      references: vuln.references.map(r => r.url),
    };
  }

  private convertContainerVulnToAlert(vuln: ContainerVulnerability, target: string): SecurityAlert {
    return {
      id: vuln.id,
      type: 'container_issue',
      severity: vuln.severity.toLowerCase() as any,
      title: vuln.title,
      description: `${target} - ${vuln.pkgName}@${vuln.installedVersion}: ${vuln.description}`,
      source: 'container',
      component: vuln.pkgName,
      createdAt: vuln.publishedDate || new Date().toISOString(),
      status: 'open',
      remediationAdvice: vuln.fixedVersion ? 
        `Update to version ${vuln.fixedVersion}` : 
        'No fix available',
      references: vuln.references,
    };
  }

  private mapSonarSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (severity) {
      case 'BLOCKER': return 'critical';
      case 'CRITICAL': return 'critical';
      case 'MAJOR': return 'high';
      case 'MINOR': return 'medium';
      case 'INFO': return 'low';
      default: return 'medium';
    }
  }

  private mapSonarStatus(status: string): 'open' | 'acknowledged' | 'resolved' | 'false_positive' {
    switch (status) {
      case 'OPEN': return 'open';
      case 'CONFIRMED': return 'acknowledged';
      case 'REOPENED': return 'open';
      case 'RESOLVED': return 'resolved';
      case 'CLOSED': return 'resolved';
      default: return 'open';
    }
  }

  private calculateScoreChange(currentScore: number): number {
    // Mock calculation - in real app, this would compare with historical data
    const lastScore = currentScore + Math.floor(Math.random() * 10) - 5;
    return currentScore - lastScore;
  }

  private calculateVulnChange(currentVulns: number): number {
    // Mock calculation - in real app, this would compare with historical data
    const lastVulns = currentVulns + Math.floor(Math.random() * 5) - 2;
    return currentVulns - lastVulns;
  }

  private generateMockScoreHistory(period: '7d' | '30d'): any[] {
    const days = period === '7d' ? 7 : 30;
    const history = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        score: 70 + Math.floor(Math.random() * 30),
      });
    }
    
    return history;
  }

  private generateMockVulnHistory(period: '7d' | '30d'): any[] {
    const days = period === '7d' ? 7 : 30;
    const history = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        critical: Math.floor(Math.random() * 3),
        high: Math.floor(Math.random() * 8),
        medium: Math.floor(Math.random() * 15),
        low: Math.floor(Math.random() * 25),
      });
    }
    
    return history;
  }

  private generateRecommendations(metrics: UnifiedSecurityMetrics, alerts: SecurityAlert[]): string[] {
    const recommendations = [];

    if (metrics.criticalCount > 0) {
      recommendations.push(`Address ${metrics.criticalCount} critical vulnerabilities immediately`);
    }

    if (metrics.breakdown.sast.coverage < 80) {
      recommendations.push('Increase test coverage to improve security analysis');
    }

    if (metrics.breakdown.dependencies.vulnerabilities > 10) {
      recommendations.push('Update dependencies to reduce vulnerability exposure');
    }

    if (metrics.breakdown.container.dockerfileIssues > 0) {
      recommendations.push('Fix Dockerfile security issues to harden container deployment');
    }

    if (metrics.securityScore < 70) {
      recommendations.push('Implement comprehensive security improvements to reach acceptable score');
    }

    return recommendations;
  }

  private assessCompliance(metrics: UnifiedSecurityMetrics): any {
    return {
      overall: metrics.securityScore >= 80 ? 'compliant' : 'non-compliant',
      frameworks: {
        'OWASP Top 10': metrics.criticalCount === 0 && metrics.highCount < 5,
        'NIST': metrics.securityScore >= 75,
        'ISO 27001': metrics.breakdown.sast.coverage >= 80,
      },
      lastAssessed: new Date().toISOString(),
    };
  }

  // Public getters
  get isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  get lastScanTimestamp(): Date | null {
    return this.lastScanTime;
  }
}

export const unifiedSecurityService = UnifiedSecurityService.getInstance();
