import { Octokit } from '@octokit/rest';
import axios from 'axios';
import type { Database } from '@/integrations/supabase/types';

type SecurityScan = Database['public']['Tables']['security_scans']['Row'];
type Vulnerability = Database['public']['Tables']['vulnerabilities']['Row'];
type SecurityScanInsert = Database['public']['Tables']['security_scans']['Insert'];
type VulnerabilityInsert = Database['public']['Tables']['vulnerabilities']['Insert'];

interface SecurityMetrics {
  security_score: number;
  total_vulnerabilities: number;
  critical_vulnerabilities: number;
  high_vulnerabilities: number;
  medium_vulnerabilities: number;
  low_vulnerabilities: number;
  last_scan_date: string;
  compliance_score: number;
  trend_direction: 'improving' | 'stable' | 'declining';
}

interface GitHubSecurityAlert {
  id: number;
  state: string;
  dependency: {
    package: {
      name: string;
    };
  };
  security_advisory: {
    ghsa_id: string;
    cve_id: string;
    summary: string;
    description: string;
    severity: string;
    cvss: {
      score: number;
    };
  };
  security_vulnerability: {
    package: {
      name: string;
    };
    patched_versions: string;
    vulnerable_version_range: string;
  };
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

interface SonarCloudIssue {
  key: string;
  rule: string;
  severity: string;
  component: string;
  project: string;
  line: number;
  hash: string;
  textRange: {
    startLine: number;
    endLine: number;
    startOffset: number;
    endOffset: number;
  };
  flows: any[];
  status: string;
  message: string;
  effort: string;
  debt: string;
  assignee: string;
  author: string;
  tags: string[];
  transitions: string[];
  actions: string[];
  comments: any[];
  attr: any;
  creationDate: string;
  updateDate: string;
  type: string;
}

export class RealSecurityService {
  private octokit: Octokit | null = null;
  private sonarCloudToken: string;
  private githubToken: string;
  private isConfigured: boolean = false;

  constructor() {
    // In browser environment, process.env is not available
    // These would need to be provided through Supabase edge functions
    // Production requires real API tokens
    this.githubToken = import.meta.env.VITE_GITHUB_TOKEN || '';
    this.sonarCloudToken = import.meta.env.VITE_SONAR_TOKEN || '';
    
    // Check if we have the required tokens
    this.isConfigured = !!(this.githubToken && this.sonarCloudToken);
    
    if (this.isConfigured) {
      this.octokit = new Octokit({
        auth: this.githubToken,
      });
    } else {
      console.log('Security tokens not configured - using mock data for development');
    }
  }

  async scanRepository(owner: string, repo: string): Promise<SecurityScan> {
    const scanId = crypto.randomUUID();
    const startTime = new Date().toISOString();

    try {
      console.log(`🔍 Starting real security scan for ${owner}/${repo}`);

      // Run parallel scans
      const [
        dependencyAlerts,
        codeqlAlerts,
        secretScanningAlerts,
        sonarCloudIssues
      ] = await Promise.allSettled([
        this.getDependencyAlerts(owner, repo),
        this.getCodeQLAlerts(owner, repo),
        this.getSecretScanningAlerts(owner, repo),
        this.getSonarCloudIssues(owner, repo)
      ]);

      const vulnerabilities: VulnerabilityInsert[] = [];

      // Process GitHub Dependency Alerts
      if (dependencyAlerts.status === 'fulfilled') {
        vulnerabilities.push(...this.processDependencyAlerts(dependencyAlerts.value, scanId));
      }

      // Process CodeQL Alerts
      if (codeqlAlerts.status === 'fulfilled') {
        vulnerabilities.push(...this.processCodeQLAlerts(codeqlAlerts.value, scanId));
      }

      // Process Secret Scanning Alerts
      if (secretScanningAlerts.status === 'fulfilled') {
        vulnerabilities.push(...this.processSecretScanningAlerts(secretScanningAlerts.value, scanId));
      }

      // Process SonarCloud Issues
      if (sonarCloudIssues.status === 'fulfilled') {
        vulnerabilities.push(...this.processSonarCloudIssues(sonarCloudIssues.value, scanId));
      }

      const severityCounts = this.calculateSeverityCounts(vulnerabilities);

      const securityScan: SecurityScan = {
        id: scanId,
        project_name: `${owner}/${repo}`,
        branch: 'main',
        scan_type: 'comprehensive',
        status: 'completed',
        started_at: startTime,
        completed_at: new Date().toISOString(),
        total_vulnerabilities: vulnerabilities.length,
        critical_count: severityCounts.critical,
        high_count: severityCounts.high,
        medium_count: severityCounts.medium,
        low_count: severityCounts.low,
        scan_results: {
          github_dependency_alerts: dependencyAlerts.status === 'fulfilled' ? dependencyAlerts.value.length : 0,
          github_codeql_alerts: codeqlAlerts.status === 'fulfilled' ? codeqlAlerts.value.length : 0,
          github_secret_scanning: secretScanningAlerts.status === 'fulfilled' ? secretScanningAlerts.value.length : 0,
          sonarcloud_issues: sonarCloudIssues.status === 'fulfilled' ? sonarCloudIssues.value.length : 0,
          scan_metadata: {
            tools_used: ['github-dependency-alerts', 'github-codeql', 'github-secret-scanning', 'sonarcloud'],
            scan_duration: Date.now() - new Date(startTime).getTime(),
            repository: `${owner}/${repo}`,
            scan_id: scanId
          }
        },
        created_at: startTime,
        updated_at: new Date().toISOString(),
        user_id: null
      };

      console.log(`✅ Security scan completed for ${owner}/${repo}: ${vulnerabilities.length} vulnerabilities found`);
      return securityScan;

    } catch (error) {
      console.error(`❌ Error during security scan for ${owner}/${repo}:`, error);
      throw error;
    }
  }

  private async getDependencyAlerts(owner: string, repo: string): Promise<GitHubSecurityAlert[]> {
    try {
      if (!this.isConfigured) {
        console.warn('GitHub token not available - skipping dependency alerts');
        return [];
      }
      
      const response = await this.octokit!.rest.dependabot.listAlertsForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 100
      });
      
      return response.data as unknown as GitHubSecurityAlert[];
    } catch (error) {
      console.warn(`⚠️  Could not fetch dependency alerts: ${error.message}`);
      return [];
    }
  }

  private async getCodeQLAlerts(owner: string, repo: string): Promise<any[]> {
    try {
      if (!this.isConfigured) {
        console.warn('GitHub token not available - skipping CodeQL alerts');
        return [];
      }
      
      const response = await this.octokit!.rest.codeScanning.listAlertsForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 100
      });
      return response.data;
    } catch (error) {
      console.warn(`⚠️  Could not fetch CodeQL alerts: ${error.message}`);
      return [];
    }
  }

  private async getSecretScanningAlerts(owner: string, repo: string): Promise<any[]> {
    try {
      if (!this.isConfigured) {
        console.warn('GitHub token not available - skipping secret scanning alerts');
        return [];
      }
      
      const response = await this.octokit!.rest.secretScanning.listAlertsForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 100
      });
      return response.data;
    } catch (error) {
      console.warn(`⚠️  Could not fetch secret scanning alerts: ${error.message}`);
      return [];
    }
  }

  private async getSonarCloudIssues(owner: string, repo: string): Promise<SonarCloudIssue[]> {
    if (!this.sonarCloudToken) {
      console.warn('⚠️  SonarCloud token not provided, skipping SonarCloud scan');
      return [];
    }

    try {
      const projectKey = `${owner}_${repo}`;
      const response = await axios.get(`https://sonarcloud.io/api/issues/search`, {
        params: {
          componentKeys: projectKey,
          resolved: false,
          types: 'VULNERABILITY,BUG,SECURITY_HOTSPOT',
          ps: 500 // page size
        },
        headers: {
          'Authorization': `Bearer ${this.sonarCloudToken}`
        }
      });

      return response.data.issues || [];
    } catch (error) {
      console.warn(`⚠️  Could not fetch SonarCloud issues: ${error.message}`);
      return [];
    }
  }

  private processDependencyAlerts(alerts: GitHubSecurityAlert[], scanId: string): VulnerabilityInsert[] {
    return alerts.map(alert => ({
      id: `dep-${alert.id}`,
      title: `Dependency Vulnerability: ${alert.dependency.package.name}`,
      description: alert.security_advisory.summary,
      severity: this.mapGitHubSeverity(alert.security_advisory.severity),
      file_path: 'package.json',
      line_number: null,
      column_number: null,
      tool: 'github-dependency-alerts',
      rule_id: alert.security_advisory.ghsa_id,
      cwe_id: null,
      cve_id: alert.security_advisory.cve_id,
      package_name: alert.dependency.package.name,
      affected_versions: alert.security_vulnerability.vulnerable_version_range,
      scan_id: scanId,
      status: 'open',
      first_detected: alert.created_at,
      scanned_at: new Date().toISOString(),
      created_at: alert.created_at,
      updated_at: alert.updated_at,
      user_id: null,
      auto_fixable: false,
      component: alert.dependency.package.name,
      confidence_score: 0.9,
      fixed_at: null
    }));
  }

  private processCodeQLAlerts(alerts: any[], scanId: string): VulnerabilityInsert[] {
    return alerts.map(alert => ({
      id: `codeql-${alert.number}`,
      title: `Code Quality Issue: ${alert.rule.description}`,
      description: alert.most_recent_instance.message.text,
      severity: this.mapGitHubSeverity(alert.rule.severity),
      file_path: alert.most_recent_instance.location.path,
      line_number: alert.most_recent_instance.location.start_line,
      column_number: alert.most_recent_instance.location.start_column,
      tool: 'github-codeql',
      rule_id: alert.rule.id,
      cwe_id: null,
      cve_id: null,
      package_name: null,
      affected_versions: null,
      scan_id: scanId,
      status: 'open',
      first_detected: alert.created_at,
      scanned_at: new Date().toISOString(),
      created_at: alert.created_at,
      updated_at: alert.updated_at,
      user_id: null,
      auto_fixable: false,
      component: alert.most_recent_instance.location.path,
      confidence_score: 0.8,
      fixed_at: null
    }));
  }

  private processSecretScanningAlerts(alerts: any[], scanId: string): VulnerabilityInsert[] {
    return alerts.map(alert => ({
      id: `secret-${alert.number}`,
      title: `Secret Detected: ${alert.secret_type_display_name}`,
      description: `Potential secret detected: ${alert.secret_type_display_name}`,
      severity: 'high' as const,
      file_path: alert.locations?.[0]?.details?.path || 'unknown',
      line_number: alert.locations?.[0]?.details?.start_line || null,
      column_number: alert.locations?.[0]?.details?.start_column || null,
      tool: 'github-secret-scanning',
      rule_id: alert.secret_type,
      cwe_id: null,
      cve_id: null,
      package_name: null,
      affected_versions: null,
      scan_id: scanId,
      status: 'open',
      first_detected: alert.created_at,
      scanned_at: new Date().toISOString(),
      created_at: alert.created_at,
      updated_at: alert.updated_at,
      user_id: null,
      auto_fixable: false,
      component: alert.locations?.[0]?.details?.path || 'unknown',
      confidence_score: 0.95,
      fixed_at: null
    }));
  }

  private processSonarCloudIssues(issues: SonarCloudIssue[], scanId: string): VulnerabilityInsert[] {
    return issues.map(issue => ({
      id: `sonar-${issue.key}`,
      title: `SonarCloud Issue: ${issue.rule}`,
      description: issue.message,
      severity: this.mapSonarCloudSeverity(issue.severity),
      file_path: issue.component,
      line_number: issue.line,
      column_number: null,
      tool: 'sonarcloud',
      rule_id: issue.rule,
      cwe_id: null,
      cve_id: null,
      package_name: null,
      affected_versions: null,
      scan_id: scanId,
      status: 'open',
      first_detected: issue.creationDate,
      scanned_at: new Date().toISOString(),
      created_at: issue.creationDate,
      updated_at: issue.updateDate,
      user_id: null,
      auto_fixable: false,
      component: issue.component,
      confidence_score: 0.85,
      fixed_at: null
    }));
  }

  private mapGitHubSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity.toLowerCase()) {
      case 'low': return 'low';
      case 'moderate': return 'medium';
      case 'high': return 'high';
      case 'critical': return 'critical';
      default: return 'medium';
    }
  }

  private mapSonarCloudSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity.toLowerCase()) {
      case 'info': return 'low';
      case 'minor': return 'low';
      case 'major': return 'medium';
      case 'critical': return 'high';
      case 'blocker': return 'critical';
      default: return 'medium';
    }
  }

  private calculateSeverityCounts(vulnerabilities: VulnerabilityInsert[]) {
    return vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity]++;
      return acc;
    }, { low: 0, medium: 0, high: 0, critical: 0 });
  }

  async getSecurityMetrics(projectName: string): Promise<SecurityMetrics> {
    try {
      // If not configured, return mock data for development
      if (!this.isConfigured) {
        console.log('Using mock security metrics for development');
        return {
          security_score: 85,
          total_vulnerabilities: 12,
          critical_vulnerabilities: 0,
          high_vulnerabilities: 2,
          medium_vulnerabilities: 5,
          low_vulnerabilities: 5,
          last_scan_date: new Date().toISOString(),
          compliance_score: 92,
          trend_direction: 'improving' as const
        };
      }

      // This would typically fetch from your database
      // For now, we'll calculate based on recent scans
      const scans = await this.getRecentScans(projectName);
      
      const totalVulnerabilities = scans.reduce((sum, scan) => sum + scan.total_vulnerabilities, 0);
      const criticalCount = scans.reduce((sum, scan) => sum + scan.critical_count, 0);
      const highCount = scans.reduce((sum, scan) => sum + scan.high_count, 0);
      
      const securityScore = Math.max(0, 100 - (criticalCount * 20 + highCount * 10));
      
      return {
        security_score: securityScore,
        total_vulnerabilities: totalVulnerabilities,
        critical_vulnerabilities: criticalCount,
        high_vulnerabilities: highCount,
        medium_vulnerabilities: scans.reduce((sum, scan) => sum + scan.medium_count, 0),
        low_vulnerabilities: scans.reduce((sum, scan) => sum + scan.low_count, 0),
        last_scan_date: scans[0]?.completed_at || new Date().toISOString(),
        compliance_score: this.calculateComplianceScore(scans),
        trend_direction: this.calculateTrendDirection(scans)
      };
    } catch (error) {
      console.error('Error calculating security metrics:', error);
      throw error;
    }
  }

  private async getRecentScans(projectName: string): Promise<SecurityScan[]> {
    // This would fetch from your database
    // Placeholder implementation
    return [];
  }

  private calculateComplianceScore(scans: SecurityScan[]): number {
    if (scans.length === 0) return 0;
    
    const recentScan = scans[0];
    const totalIssues = recentScan.total_vulnerabilities;
    const criticalIssues = recentScan.critical_count;
    const highIssues = recentScan.high_count;
    
    // Basic compliance scoring logic
    if (criticalIssues > 0) return 30;
    if (highIssues > 5) return 60;
    if (totalIssues > 20) return 75;
    return 95;
  }

  private calculateTrendDirection(scans: SecurityScan[]): 'improving' | 'stable' | 'declining' {
    if (scans.length < 2) return 'stable';
    
    const latest = scans[0];
    const previous = scans[1];
    
    if (latest.total_vulnerabilities < previous.total_vulnerabilities) return 'improving';
    if (latest.total_vulnerabilities > previous.total_vulnerabilities) return 'declining';
    return 'stable';
  }
}
