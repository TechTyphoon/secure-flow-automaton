import axios from 'axios';
import { BaseSecurityService } from './apiClient';
import { SecurityNotificationService } from './notifications';

export interface SonarQubeMetrics {
  component: string;
  metrics: {
    coverage?: string;
    duplicated_lines_density?: string;
    ncloc?: string;
    bugs?: string;
    vulnerabilities?: string;
    code_smells?: string;
    security_hotspots?: string;
    reliability_rating?: string;
    security_rating?: string;
    maintainability_rating?: string;
  };
}

export interface SonarQubeIssue {
  key: string;
  rule: string;
  severity: 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
  component: string;
  project: string;
  line?: number;
  hash?: string;
  textRange?: {
    startLine: number;
    endLine: number;
    startOffset: number;
    endOffset: number;
  };
  flows: any[];
  status: 'OPEN' | 'CONFIRMED' | 'REOPENED' | 'RESOLVED' | 'CLOSED';
  message: string;
  effort?: string;
  debt?: string;
  assignee?: string;
  author?: string;
  tags: string[];
  transitions: string[];
  actions: string[];
  comments: any[];
  creationDate: string;
  updateDate: string;
  type: 'CODE_SMELL' | 'BUG' | 'VULNERABILITY' | 'SECURITY_HOTSPOT';
}

export class SonarQubeService extends BaseSecurityService {
  private baseUrl: string;
  private token: string;
  private projectKey: string;
  private notifications = new SecurityNotificationService();

  constructor(baseUrl?: string, token?: string, projectKey?: string) {
    super('SonarQube');
    this.baseUrl = baseUrl || import.meta.env.VITE_SONAR_URL || import.meta.env.SONAR_URL || 'https://sonarcloud.io';
    this.token = token || import.meta.env.VITE_SONAR_TOKEN || import.meta.env.SONAR_TOKEN || '';
    this.projectKey = projectKey || import.meta.env.VITE_SONAR_PROJECT_KEY || import.meta.env.SONAR_PROJECT_KEY || 'TechTyphoon_secure-flow-automaton';
  }

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async getProjectMetrics(): Promise<SonarQubeMetrics | null> {
    return this.withFallback(
      async () => {
        if (!this.token) return null;

        const response = await this.apiClient.makeSecureRequest<any>(
          `${this.baseUrl}/api/measures/component`,
          {
            method: 'GET',
            params: {
              component: this.projectKey,
              metricKeys: [
                'coverage',
                'duplicated_lines_density',
                'ncloc',
                'bugs',
                'vulnerabilities',
                'code_smells',
                'security_hotspots',
                'reliability_rating',
                'security_rating',
                'maintainability_rating'
              ].join(',')
            },
            headers: this.getAuthHeaders(),
          },
          'sonarqube',
          `metrics-${this.projectKey}`
        );

        if (!response?.component?.measures) return null;

        const metrics: Record<string, string> = {};
        response.component.measures.forEach((measure: any) => {
          metrics[measure.metric] = measure.value;
        });

        // Send alert for critical vulnerabilities
        const vulnCount = parseInt(metrics.vulnerabilities || '0');
        const securityRating = parseInt(metrics.security_rating || '1');
        
        if (vulnCount > 5 || securityRating > 2) {
          await this.notifications.sendAlert({
            id: `sonar-${Date.now()}`,
            type: 'security_hotspot',
            severity: securityRating > 3 ? 'critical' : 'high',
            title: 'SonarQube Security Issues Detected',
            description: `Found ${vulnCount} vulnerabilities with security rating ${securityRating}/5`,
            source: 'sonarqube',
            component: this.projectKey,
            createdAt: new Date().toISOString(),
          });
        }

        return {
          component: response.component.key,
          metrics,
        };
      },
      () => this.getMockMetrics(),
      'getProjectMetrics'
    );
  }

  async getIssues(severity?: string, type?: string): Promise<SonarQubeIssue[]> {
    return this.withFallback(
      async () => {
        if (!this.token) return null;

        const params: any = {
          componentKeys: this.projectKey,
          ps: 500, // page size
        };

        if (severity) params.severities = severity;
        if (type) params.types = type;

        const response = await this.apiClient.makeSecureRequest<any>(
          `${this.baseUrl}/api/issues/search`,
          {
            method: 'GET',
            params,
            headers: this.getAuthHeaders(),
          },
          'sonarqube',
          `issues-${this.projectKey}-${severity || 'all'}-${type || 'all'}`
        );

        return response?.issues || null;
      },
      () => this.getMockIssues(),
      'getIssues'
    );
  }

  async getHealthStatus() {
    const startTime = Date.now();
    
    try {
      if (!this.token) {
        return {
          service: 'sonarqube',
          status: 'degraded' as const,
          responseTime: -1,
          lastCheck: new Date().toISOString(),
          message: 'No API token configured - using mock data'
        };
      }

      const response = await this.apiClient.makeSecureRequest<string>(
        `${this.baseUrl}/api/system/ping`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        },
        'sonarqube',
        'health-check'
      );

      const responseTime = Date.now() - startTime;
      const isHealthy = response?.includes('pong');

      return {
        service: 'sonarqube',
        status: isHealthy ? 'healthy' as const : 'unhealthy' as const,
        responseTime,
        lastCheck: new Date().toISOString(),
        message: isHealthy ? 'Service operational' : 'Health check failed'
      };
    } catch (error: any) {
      return {
        service: 'sonarqube',
        status: 'unhealthy' as const,
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        message: `Health check failed: ${error.message}`
      };
    }
  }

  async getSecurityHotspots(): Promise<any[]> {
    if (!this.token) {
      return this.getMockSecurityHotspots();
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/api/hotspots/search`,
        {
          params: {
            projectKey: this.projectKey,
            ps: 500,
          },
          headers: this.getAuthHeaders(),
          timeout: 15000,
        }
      );

      return response.data.hotspots || [];
    } catch (error) {
      console.error('SonarQube Security Hotspots API error:', error);
      return this.getMockSecurityHotspots();
    }
  }

  // Mock data for development/demo purposes
  private getMockMetrics(): SonarQubeMetrics {
    return {
      component: this.projectKey,
      metrics: {
        coverage: '78.5',
        duplicated_lines_density: '2.1',
        ncloc: '15420',
        bugs: '3',
        vulnerabilities: '5',
        code_smells: '28',
        security_hotspots: '2',
        reliability_rating: '2.0',
        security_rating: '3.0',
        maintainability_rating: '1.0',
      },
    };
  }

  private getMockIssues(): SonarQubeIssue[] {
    return [
      {
        key: 'AWX9p2sUqFp-rCvMpjVl',
        rule: 'typescript:S1481',
        severity: 'MINOR',
        component: 'secure-flow-automaton:src/components/SecurityMetrics.tsx',
        project: this.projectKey,
        line: 45,
        hash: 'e8f3d4c2a1b9f6e5d8c7',
        textRange: {
          startLine: 45,
          endLine: 45,
          startOffset: 8,
          endOffset: 20,
        },
        flows: [],
        status: 'OPEN',
        message: 'Remove this unused import.',
        effort: '2min',
        debt: '2min',
        tags: ['unused'],
        transitions: ['confirm', 'resolve', 'falsepositive'],
        actions: ['comment', 'assign', 'set_tags', 'set_type'],
        comments: [],
        creationDate: '2025-07-27T10:30:00+0000',
        updateDate: '2025-07-27T10:30:00+0000',
        type: 'CODE_SMELL',
      },
      {
        key: 'BWX9p3sUqFp-rCvMpjVm',
        rule: 'typescript:S2259',
        severity: 'CRITICAL',
        component: 'secure-flow-automaton:src/hooks/useRealSecurityData.tsx',
        project: this.projectKey,
        line: 67,
        hash: 'f9e4d5c3b2a0f7e6d9c8',
        textRange: {
          startLine: 67,
          endLine: 67,
          startOffset: 12,
          endOffset: 25,
        },
        flows: [],
        status: 'OPEN',
        message: 'A "NullPointerException" could be thrown; "data" is nullable here.',
        effort: '10min',
        debt: '10min',
        tags: ['bug-prone'],
        transitions: ['confirm', 'resolve', 'falsepositive'],
        actions: ['comment', 'assign', 'set_tags', 'set_type'],
        comments: [],
        creationDate: '2025-07-27T09:15:00+0000',
        updateDate: '2025-07-27T09:15:00+0000',
        type: 'BUG',
      },
      {
        key: 'CWX9p4sUqFp-rCvMpjVn',
        rule: 'typescript:S4426',
        severity: 'MAJOR',
        component: 'secure-flow-automaton:src/components/AuthContext.tsx',
        project: this.projectKey,
        line: 89,
        hash: 'a0f5d6c4b3a1f8e7d0c9',
        textRange: {
          startLine: 89,
          endLine: 89,
          startOffset: 15,
          endOffset: 28,
        },
        flows: [],
        status: 'CONFIRMED',
        message: 'Use a secure cipher algorithm instead of this insecure one.',
        effort: '30min',
        debt: '30min',
        tags: ['cwe', 'owasp-top10', 'security'],
        transitions: ['resolve', 'falsepositive'],
        actions: ['comment', 'assign', 'set_tags', 'set_type'],
        comments: [],
        creationDate: '2025-07-26T14:20:00+0000',
        updateDate: '2025-07-27T08:45:00+0000',
        type: 'VULNERABILITY',
      },
    ];
  }

  private getMockSecurityHotspots(): any[] {
    return [
      {
        key: 'DWX9p5sUqFp-rCvMpjVo',
        component: 'secure-flow-automaton:src/lib/security.ts',
        project: this.projectKey,
        securityCategory: 'weak-cryptography',
        vulnerabilityProbability: 'HIGH',
        status: 'TO_REVIEW',
        line: 123,
        message: 'Make sure this weak hash algorithm is not used in a security context.',
        author: 'security-scanner',
        creationDate: '2025-07-27T11:00:00+0000',
        updateDate: '2025-07-27T11:00:00+0000',
      },
      {
        key: 'EWX9p6sUqFp-rCvMpjVp',
        component: 'secure-flow-automaton:src/integrations/supabase/client.ts',
        project: this.projectKey,
        securityCategory: 'sql-injection',
        vulnerabilityProbability: 'MEDIUM',
        status: 'REVIEWED',
        line: 45,
        message: 'Make sure that executing SQL queries is safe here.',
        author: 'dev-team',
        creationDate: '2025-07-26T16:30:00+0000',
        updateDate: '2025-07-27T09:15:00+0000',
      },
    ];
  }

  // Calculate security score based on metrics
  calculateSecurityScore(metrics: SonarQubeMetrics): number {
    const { metrics: m } = metrics;
    
    const bugs = parseInt(m.bugs || '0');
    const vulnerabilities = parseInt(m.vulnerabilities || '0');
    const securityHotspots = parseInt(m.security_hotspots || '0');
    const securityRating = parseFloat(m.security_rating || '1.0');
    const reliabilityRating = parseFloat(m.reliability_rating || '1.0');
    
    // Base score starts at 100
    let score = 100;
    
    // Deduct points for issues
    score -= bugs * 5;                    // 5 points per bug
    score -= vulnerabilities * 10;        // 10 points per vulnerability  
    score -= securityHotspots * 3;        // 3 points per security hotspot
    score -= (securityRating - 1) * 15;   // 15 points per security rating level
    score -= (reliabilityRating - 1) * 10; // 10 points per reliability rating level
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

export const sonarQubeService = new SonarQubeService();
