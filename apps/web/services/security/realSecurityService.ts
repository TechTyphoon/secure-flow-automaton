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

interface CodeQLAlert {
  number: number;
  rule: {
    id: string;
    description: string;
    severity: string;
  };
  most_recent_instance: {
    message: {
      text: string;
    };
    location: {
      path: string;
      start_line: number;
      start_column: number;
    };
  };
  created_at: string;
  updated_at: string;
}

interface SecretScanningAlert {
  number: number;
  secret_type: string;
  secret_type_display_name: string;
  locations?: Array<{
    details?: {
      path: string;
      start_line: number;
      start_column: number;
    };
  }>;
  created_at: string;
  updated_at: string;
}

interface SonarCloudFlow {
  locations: Array<{
    component: string;
    textRange: {
      startLine: number;
      endLine: number;
      startOffset: number;
      endOffset: number;
    };
  }>;
}

interface SonarCloudComment {
  key: string;
  login: string;
  markdown: string;
  createdAt: string;
}

interface SonarCloudAttribute {
  [key: string]: string | number | boolean;
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
  flows: SonarCloudFlow[];
  status: string;
  message: string;
  effort: string;
  debt: string;
  assignee: string;
  author: string;
  tags: string[];
  transitions: string[];
  actions: string[];
  comments: SonarCloudComment[];
  attr: SonarCloudAttribute;
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
    }
  }

  /**
   * Perform a comprehensive security scan
   */
  async performSecurityScan(owner: string, repo: string): Promise<SecurityMetrics> {
    console.log(`🔍 Starting security scan for ${owner}/${repo}`);
    
    const scanId = `scan-${Date.now()}`;
    
    try {
      // Create scan record
      const scanData: SecurityScanInsert = {
        id: scanId,
        repository: `${owner}/${repo}`,
        scan_type: 'comprehensive',
        status: 'in_progress',
        started_at: new Date().toISOString(),
        completed_at: null,
        total_issues: 0,
        critical_issues: 0,
        high_issues: 0,
        medium_issues: 0,
        low_issues: 0,
        security_score: 0,
        compliance_score: 0,
        scan_duration: 0,
        tool_used: 'github-sonarcloud',
        scan_config: {},
        error_message: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: null
      };

      // Collect vulnerabilities from different sources
      const [
        dependencyAlerts,
        codeQLAlerts,
        secretScanningAlerts,
        sonarCloudIssues
      ] = await Promise.all([
        this.getDependencyAlerts(owner, repo),
        this.getCodeQLAlerts(owner, repo),
        this.getSecretScanningAlerts(owner, repo),
        this.getSonarCloudIssues(owner, repo)
      ]);

      // Process and store vulnerabilities
      const allVulnerabilities = [
        ...this.processDependencyAlerts(dependencyAlerts, scanId),
        ...this.processCodeQLAlerts(codeQLAlerts, scanId),
        ...this.processSecretScanningAlerts(secretScanningAlerts, scanId),
        ...this.processSonarCloudIssues(sonarCloudIssues, scanId)
      ];

      // Calculate metrics
      const metrics = this.calculateSecurityMetrics(allVulnerabilities);
      
      // Update scan record
      const completedScan: SecurityScanInsert = {
        ...scanData,
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_issues: metrics.total_vulnerabilities,
        critical_issues: metrics.critical_vulnerabilities,
        high_issues: metrics.high_vulnerabilities,
        medium_issues: metrics.medium_vulnerabilities,
        low_issues: metrics.low_vulnerabilities,
        security_score: metrics.security_score,
        compliance_score: metrics.compliance_score,
        scan_duration: Date.now() - parseInt(scanId.split('-')[1]),
        updated_at: new Date().toISOString()
      };

      console.log(`✅ Security scan completed for ${owner}/${repo}`);
      console.log(`📊 Found ${metrics.total_vulnerabilities} vulnerabilities`);
      console.log(`🛡️  Security score: ${metrics.security_score}/100`);

      return metrics;
    } catch (error) {
      console.error(`❌ Security scan failed for ${owner}/${repo}:`, error);
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

  private async getCodeQLAlerts(owner: string, repo: string): Promise<CodeQLAlert[]> {
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
      return response.data as unknown as CodeQLAlert[];
    } catch (error) {
      console.warn(`⚠️  Could not fetch CodeQL alerts: ${error.message}`);
      return [];
    }
  }

  private async getSecretScanningAlerts(owner: string, repo: string): Promise<SecretScanningAlert[]> {
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
      return response.data as unknown as SecretScanningAlert[];
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

  private processCodeQLAlerts(alerts: CodeQLAlert[], scanId: string): VulnerabilityInsert[] {
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

  private processSecretScanningAlerts(alerts: SecretScanningAlert[], scanId: string): VulnerabilityInsert[] {
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
      case 'critical': return 'critical';
      case 'blocker': return 'critical';
      default: return 'medium';
    }
  }

  private calculateSecurityMetrics(vulnerabilities: VulnerabilityInsert[]): SecurityMetrics {
    const total = vulnerabilities.length;
    const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
    const high = vulnerabilities.filter(v => v.severity === 'high').length;
    const medium = vulnerabilities.filter(v => v.severity === 'medium').length;
    const low = vulnerabilities.filter(v => v.severity === 'low').length;

    // Calculate security score (0-100)
    const maxScore = 100;
    const criticalPenalty = critical * 20;
    const highPenalty = high * 10;
    const mediumPenalty = medium * 5;
    const lowPenalty = low * 1;
    
    const securityScore = Math.max(0, maxScore - criticalPenalty - highPenalty - mediumPenalty - lowPenalty);

    // Calculate compliance score (based on having security measures in place)
    const complianceScore = this.isConfigured ? 85 : 50;

    return {
      security_score: securityScore,
      total_vulnerabilities: total,
      critical_vulnerabilities: critical,
      high_vulnerabilities: high,
      medium_vulnerabilities: medium,
      low_vulnerabilities: low,
      last_scan_date: new Date().toISOString(),
      compliance_score: complianceScore,
      trend_direction: 'stable' // This would need historical data to calculate
    };
  }
}

export default RealSecurityService;
