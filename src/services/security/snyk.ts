import axios from 'axios';

export interface SnykVulnerability {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  package: string;
  version: string;
  fixedIn?: string[];
  patchAvailable: boolean;
  exploitMaturity?: 'mature' | 'proof-of-concept' | 'no-known-exploit' | 'no-data';
  cvssScore?: number;
  cve?: string[];
  cwe?: string[];
  publicationTime?: string;
  disclosureTime?: string;
  credit?: string[];
  semver: {
    vulnerable: string[];
    unaffected?: string;
  };
  references: {
    title: string;
    url: string;
  }[];
  patches?: any[];
  upgradePath?: (string | boolean)[];
}

export interface SnykTestResult {
  vulnerabilities: SnykVulnerability[];
  dependencyCount: number;
  packageManager: string;
  projectName: string;
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    critical: number;
  };
}

export interface SnykProject {
  id: string;
  name: string;
  created: string;
  origin: string;
  type: string;
  readOnly: boolean;
  testFrequency: string;
  totalDependencies: number;
  issueCountsBySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  lastTestedDate: string;
  browseUrl: string;
}

export class SnykService {
  private baseUrl: string = 'https://api.snyk.io';
  private token: string;
  private orgId: string;

  constructor(token?: string, orgId?: string) {
    this.token = token || process.env.SNYK_TOKEN || '';
    this.orgId = orgId || process.env.SNYK_ORG_ID || '';
  }

  private getAuthHeaders() {
    return {
      'Authorization': `token ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async getProjects(): Promise<SnykProject[]> {
    if (!this.token || !this.orgId) {
      console.warn('Snyk token/orgId not configured, using mock data');
      return this.getMockProjects();
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/org/${this.orgId}/projects`,
        {
          headers: this.getAuthHeaders(),
          timeout: 15000,
        }
      );

      return response.data.projects;
    } catch (error) {
      console.error('Snyk Projects API error:', error);
      return this.getMockProjects();
    }
  }

  async testProject(projectId?: string): Promise<SnykTestResult> {
    if (!this.token || !this.orgId) {
      console.warn('Snyk token/orgId not configured, using mock data');
      return this.getMockTestResult();
    }

    try {
      const projects = await this.getProjects();
      const targetProject = projectId 
        ? projects.find(p => p.id === projectId)
        : projects[0];

      if (!targetProject) {
        throw new Error('No project found');
      }

      const response = await axios.post(
        `${this.baseUrl}/v1/org/${this.orgId}/project/${targetProject.id}/issues`,
        {},
        {
          headers: this.getAuthHeaders(),
          timeout: 20000,
        }
      );

      return this.formatTestResult(response.data);
    } catch (error) {
      console.error('Snyk Test API error:', error);
      return this.getMockTestResult();
    }
  }

  async getVulnerabilities(severity?: string): Promise<SnykVulnerability[]> {
    const testResult = await this.testProject();
    
    if (severity) {
      return testResult.vulnerabilities.filter(vuln => vuln.severity === severity);
    }
    
    return testResult.vulnerabilities;
  }

  async getDependencyCount(): Promise<number> {
    const testResult = await this.testProject();
    return testResult.dependencyCount;
  }

  private formatTestResult(data: any): SnykTestResult {
    const vulnerabilities = data.issues?.vulnerabilities || [];
    
    const summary = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter((v: any) => v.severity === 'critical').length,
      high: vulnerabilities.filter((v: any) => v.severity === 'high').length,
      medium: vulnerabilities.filter((v: any) => v.severity === 'medium').length,
      low: vulnerabilities.filter((v: any) => v.severity === 'low').length,
    };

    return {
      vulnerabilities: vulnerabilities.map((vuln: any) => ({
        id: vuln.id,
        title: vuln.title,
        description: vuln.description,
        severity: vuln.severity,
        package: vuln.package,
        version: vuln.version,
        fixedIn: vuln.fixedIn,
        patchAvailable: !!vuln.patches && vuln.patches.length > 0,
        exploitMaturity: vuln.exploitMaturity,
        cvssScore: vuln.cvssScore,
        cve: vuln.identifiers?.CVE || [],
        cwe: vuln.identifiers?.CWE || [],
        publicationTime: vuln.publicationTime,
        disclosureTime: vuln.disclosureTime,
        credit: vuln.credit,
        semver: vuln.semver,
        references: vuln.references || [],
        patches: vuln.patches,
        upgradePath: vuln.upgradePath,
      })),
      dependencyCount: data.dependencyCount || 0,
      packageManager: data.packageManager || 'npm',
      projectName: data.projectName || 'secure-flow-automaton',
      summary,
    };
  }

  // Mock data for development/demo purposes
  private getMockProjects(): SnykProject[] {
    return [
      {
        id: 'abc123-def456-ghi789',
        name: 'secure-flow-automaton',
        created: '2025-07-01T00:00:00.000Z',
        origin: 'github',
        type: 'npm',
        readOnly: false,
        testFrequency: 'daily',
        totalDependencies: 1018,
        issueCountsBySeverity: {
          low: 8,
          medium: 3,
          high: 2,
          critical: 1,
        },
        lastTestedDate: '2025-07-27T12:00:00.000Z',
        browseUrl: 'https://app.snyk.io/org/secureflow/project/abc123-def456-ghi789',
      },
    ];
  }

  private getMockTestResult(): SnykTestResult {
    return {
      vulnerabilities: [
        {
          id: 'SNYK-JS-AXIOS-6032459',
          title: 'Cross-site Request Forgery (CSRF)',
          description: 'axios package versions before 1.6.0 are vulnerable to Cross-site Request Forgery (CSRF). The vulnerability exists due to insufficient validation of the request origin.',
          severity: 'medium',
          package: 'axios',
          version: '1.5.1',
          fixedIn: ['1.6.0'],
          patchAvailable: false,
          exploitMaturity: 'proof-of-concept',
          cvssScore: 5.4,
          cve: ['CVE-2023-45857'],
          cwe: ['CWE-352'],
          publicationTime: '2023-11-08T05:15:00.000Z',
          disclosureTime: '2023-11-01T00:00:00.000Z',
          credit: ['Security Researcher'],
          semver: {
            vulnerable: ['<1.6.0'],
            unaffected: '>=1.6.0',
          },
          references: [
            {
              title: 'GitHub Advisory',
              url: 'https://github.com/advisories/GHSA-wf5p-g6vw-rhxx',
            },
            {
              title: 'CVE Details',
              url: 'https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-45857',
            },
          ],
          upgradePath: [false, 'axios@1.6.0'],
        },
        {
          id: 'SNYK-JS-LODASH-567746',
          title: 'Prototype Pollution',
          description: 'lodash versions prior to 4.17.12 are vulnerable to Prototype Pollution. The function defaultsDeep could be tricked into adding or modifying properties of Object.prototype.',
          severity: 'high',
          package: 'lodash',
          version: '4.17.11',
          fixedIn: ['4.17.12'],
          patchAvailable: true,
          exploitMaturity: 'mature',
          cvssScore: 7.0,
          cve: ['CVE-2019-10744'],
          cwe: ['CWE-1321', 'CWE-400'],
          publicationTime: '2019-07-26T00:00:00.000Z',
          disclosureTime: '2019-04-26T00:00:00.000Z',
          credit: ['Olivier Arteau'],
          semver: {
            vulnerable: ['<4.17.12'],
            unaffected: '>=4.17.12',
          },
          references: [
            {
              title: 'GitHub Issue',
              url: 'https://github.com/lodash/lodash/issues/4348',
            },
            {
              title: 'HackerOne Report',
              url: 'https://hackerone.com/reports/712065',
            },
          ],
          patches: [
            {
              id: 'patch:SNYK-JS-LODASH-567746:0',
              urls: ['https://snyk-patches.s3.amazonaws.com/npm/lodash/20190701/lodash_20190701_0_0_567746.patch'],
              version: '<4.17.12 >=4.14.2',
              comments: ['Patch for CVE-2019-10744'],
              modificationTime: '2019-07-01T00:00:00.000Z',
            },
          ],
          upgradePath: [false, 'lodash@4.17.21'],
        },
        {
          id: 'SNYK-JS-SEMVER-3247795',
          title: 'Regular Expression Denial of Service (ReDoS)',
          description: 'semver package versions from 7.0.0 and before 7.5.2 are vulnerable to Regular Expression Denial of Service (ReDoS) via the function new Range.',
          severity: 'critical',
          package: 'semver',
          version: '7.3.8',
          fixedIn: ['7.5.2'],
          patchAvailable: false,
          exploitMaturity: 'proof-of-concept',
          cvssScore: 7.5,
          cve: ['CVE-2022-25883'],
          cwe: ['CWE-1333'],
          publicationTime: '2022-06-21T00:00:00.000Z',
          disclosureTime: '2022-06-15T00:00:00.000Z',
          credit: ['Yeting Li'],
          semver: {
            vulnerable: ['>=7.0.0 <7.5.2'],
            unaffected: '>=7.5.2',
          },
          references: [
            {
              title: 'GitHub Commit',
              url: 'https://github.com/npm/semver/commit/717534ee',
            },
            {
              title: 'GitHub Security Advisory',
              url: 'https://github.com/advisories/GHSA-c2qf-rxjj-qqgw',
            },
          ],
          upgradePath: [false, 'semver@7.5.4'],
        },
      ],
      dependencyCount: 1018,
      packageManager: 'npm',
      projectName: 'secure-flow-automaton',
      summary: {
        total: 3,
        critical: 1,
        high: 1,
        medium: 1,
        low: 0,
      },
    };
  }

  // Calculate security metrics
  calculateRiskScore(testResult: SnykTestResult): number {
    const { summary } = testResult;
    
    // Weight different severities
    const score = (summary.critical * 10) + 
                  (summary.high * 7) + 
                  (summary.medium * 4) + 
                  (summary.low * 1);
    
    // Normalize to 0-100 scale (inverted - lower score is better)
    const maxPossibleScore = testResult.dependencyCount * 10; // Assume all deps have critical vulns
    return Math.max(0, Math.min(100, Math.round((1 - (score / Math.max(maxPossibleScore, 100))) * 100)));
  }

  async getSecuritySummary() {
    const testResult = await this.testProject();
    const projects = await this.getProjects();
    
    return {
      totalProjects: projects.length,
      totalDependencies: testResult.dependencyCount,
      vulnerabilities: testResult.summary,
      riskScore: this.calculateRiskScore(testResult),
      lastScan: new Date().toISOString(),
      packageManager: testResult.packageManager,
    };
  }
}

export const snykService = new SnykService();
