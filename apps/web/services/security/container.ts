import axios from 'axios';

export interface DockerfileAnalysis {
  issues: DockerfileIssue[];
  score: number;
  recommendations: string[];
}

export interface DockerfileIssue {
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  rule: string;
  fix?: string;
}

export interface DockerImageScan {
  imageName: string;
  tag: string;
  scanDate: string;
  vulnerabilities: ImageVulnerability[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  baseImageVulnerabilities?: number;
  layerAnalysis?: LayerAnalysis[];
}

export interface ImageVulnerability {
  id: string;
  package: string;
  version: string;
  fixedVersion?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  cvss?: number;
  cve?: string;
}

export interface LayerAnalysis {
  layerId: string;
  size: number;
  vulnerabilityCount: number;
  addedPackages: number;
}

export interface ContainerScanResult {
  type: 'dockerfile' | 'image' | 'runtime' | 'dependencies';
  timestamp: string;
  findings: any[];
  score?: number;
  passed: boolean;
}

export class ContainerSecurityService {
  private dockerHubUrl = 'https://hub.docker.com/v2';
  private trivyApiUrl = process.env.VITE_TRIVY_API_URL || 'http://localhost:8081';
  private dockerApiUrl = process.env.VITE_DOCKER_API_URL || '/var/run/docker.sock';

  /**
   * Scan Dockerfile for security issues using Trivy API
   */
  async scanDockerfile(dockerfilePath: string): Promise<DockerfileAnalysis> {
    try {
      const response = await axios.post(`${this.trivyApiUrl}/scan/dockerfile`, {
        path: dockerfilePath,
        severity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const issues = this.parseDockerfileIssues(response.data);
      const score = this.calculateDockerfileScore(issues);
      const recommendations = this.generateDockerfileRecommendations(issues);

      return { issues, score, recommendations };
    } catch (error) {
      console.error('Dockerfile scan failed:', error);
      throw new Error('Failed to scan Dockerfile. Please ensure Trivy server is running.');
    }
  }

  /**
   * Scan Docker image for vulnerabilities using Trivy API
   */
  async scanImage(imageName: string, tag: string = 'latest'): Promise<DockerImageScan> {
    try {
      const fullImageName = `${imageName}:${tag}`;
      
      const response = await axios.post(`${this.trivyApiUrl}/scan/image`, {
        image: fullImageName,
        scanners: ['vuln', 'secret', 'config'],
        severity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      return this.parseImageScanResults(response.data, imageName, tag);
    } catch (error) {
      console.error('Image scan failed:', error);
      throw new Error('Failed to scan Docker image. Please ensure the image exists and Trivy server is running.');
    }
  }

  /**
   * Scan dependencies in container using package managers
   */
  async scanDependencies(containerId?: string): Promise<ContainerScanResult> {
    try {
      const endpoint = containerId 
        ? `${this.trivyApiUrl}/scan/container/${containerId}/deps`
        : `${this.trivyApiUrl}/scan/deps`;

      const response = await axios.post(endpoint, {
        scanners: ['vuln', 'license'],
        packageManagers: ['npm', 'yarn', 'pip', 'gem', 'gomod']
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 45000
      });

      return this.parseDependencyScanResults(response.data);
    } catch (error) {
      console.error('Dependency scan failed:', error);
      throw new Error('Failed to scan dependencies. Please ensure Trivy server is running.');
    }
  }

  /**
   * Get runtime security information for running containers
   */
  async getRuntimeSecurity(containerId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.dockerApiUrl}/containers/${containerId}/json`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return this.analyzeRuntimeSecurity(response.data);
    } catch (error) {
      console.error('Runtime security check failed:', error);
      throw new Error('Failed to get runtime security information.');
    }
  }

  /**
   * Scan container registry for vulnerable images
   */
  async scanRegistry(registryUrl: string, namespace?: string): Promise<any[]> {
    try {
      const response = await axios.post(`${this.trivyApiUrl}/scan/registry`, {
        registry: registryUrl,
        namespace: namespace,
        includeVulnerabilities: true
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 120000
      });

      return response.data.images || [];
    } catch (error) {
      console.error('Registry scan failed:', error);
      throw new Error('Failed to scan container registry.');
    }
  }

  /**
   * Get security best practices compliance
   */
  async checkCompliance(imageName: string): Promise<any> {
    try {
      const response = await axios.post(`${this.trivyApiUrl}/compliance/check`, {
        image: imageName,
        frameworks: ['CIS', 'NIST', 'PCI-DSS']
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('Compliance check failed:', error);
      throw new Error('Failed to check compliance.');
    }
  }

  /**
   * Parse Dockerfile issues from scan results
   */
  private parseDockerfileIssues(scanData: any): DockerfileIssue[] {
    const issues: DockerfileIssue[] = [];
    
    if (scanData.Results) {
      for (const result of scanData.Results) {
        if (result.Misconfigurations) {
          for (const misconfig of result.Misconfigurations) {
            issues.push({
              line: misconfig.CauseMetadata?.StartLine || 0,
              severity: this.mapSeverity(misconfig.Severity),
              message: misconfig.Message,
              rule: misconfig.ID,
              fix: misconfig.Resolution
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Parse image scan results
   */
  private parseImageScanResults(scanData: any, imageName: string, tag: string): DockerImageScan {
    const vulnerabilities: ImageVulnerability[] = [];
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0
    };

    if (scanData.Results) {
      for (const result of scanData.Results) {
        if (result.Vulnerabilities) {
          for (const vuln of result.Vulnerabilities) {
            const severity = this.mapSeverity(vuln.Severity);
            summary[severity]++;
            summary.total++;

            vulnerabilities.push({
              id: vuln.VulnerabilityID,
              package: vuln.PkgName,
              version: vuln.InstalledVersion,
              fixedVersion: vuln.FixedVersion,
              severity: severity,
              description: vuln.Description || vuln.Title,
              cvss: vuln.CVSS?.nvd?.V3Score,
              cve: vuln.VulnerabilityID
            });
          }
        }
      }
    }

    return {
      imageName,
      tag,
      scanDate: new Date().toISOString(),
      vulnerabilities,
      summary,
      layerAnalysis: this.parseLayerAnalysis(scanData)
    };
  }

  /**
   * Parse dependency scan results
   */
  private parseDependencyScanResults(scanData: any): ContainerScanResult {
    const findings: any[] = [];
    let score = 100;

    if (scanData.Results) {
      for (const result of scanData.Results) {
        if (result.Vulnerabilities) {
          for (const vuln of result.Vulnerabilities) {
            findings.push({
              type: 'vulnerability',
              package: vuln.PkgName,
              version: vuln.InstalledVersion,
              severity: this.mapSeverity(vuln.Severity),
              fixedVersion: vuln.FixedVersion,
              cve: vuln.VulnerabilityID
            });
            
            // Deduct points based on severity
            score -= this.getSeverityScore(vuln.Severity);
          }
        }
      }
    }

    return {
      type: 'dependencies',
      timestamp: new Date().toISOString(),
      findings,
      score: Math.max(0, score),
      passed: score >= 70
    };
  }

  /**
   * Analyze runtime security configuration
   */
  private analyzeRuntimeSecurity(containerData: any): any {
    const securityIssues = [];
    const securityScore = { score: 100, grade: 'A' };

    // Check for privileged mode
    if (containerData.HostConfig?.Privileged) {
      securityIssues.push({
        severity: 'critical',
        message: 'Container is running in privileged mode',
        recommendation: 'Disable privileged mode unless absolutely necessary'
      });
      securityScore.score -= 30;
    }

    // Check for capabilities
    if (containerData.HostConfig?.CapAdd?.length > 0) {
      securityIssues.push({
        severity: 'high',
        message: `Container has additional capabilities: ${containerData.HostConfig.CapAdd.join(', ')}`,
        recommendation: 'Review and minimize capabilities'
      });
      securityScore.score -= 20;
    }

    // Check for root user
    if (!containerData.Config?.User || containerData.Config.User === 'root') {
      securityIssues.push({
        severity: 'high',
        message: 'Container is running as root user',
        recommendation: 'Use a non-root user'
      });
      securityScore.score -= 20;
    }

    // Check for read-only root filesystem
    if (!containerData.HostConfig?.ReadonlyRootfs) {
      securityIssues.push({
        severity: 'medium',
        message: 'Root filesystem is not read-only',
        recommendation: 'Enable read-only root filesystem'
      });
      securityScore.score -= 10;
    }

    // Calculate grade
    if (securityScore.score >= 90) securityScore.grade = 'A';
    else if (securityScore.score >= 80) securityScore.grade = 'B';
    else if (securityScore.score >= 70) securityScore.grade = 'C';
    else if (securityScore.score >= 60) securityScore.grade = 'D';
    else securityScore.grade = 'F';

    return {
      containerId: containerData.Id,
      name: containerData.Name,
      securityScore,
      securityIssues,
      config: {
        user: containerData.Config?.User || 'root',
        privileged: containerData.HostConfig?.Privileged || false,
        capabilities: containerData.HostConfig?.CapAdd || [],
        readOnlyRootFs: containerData.HostConfig?.ReadonlyRootfs || false,
        networkMode: containerData.HostConfig?.NetworkMode
      }
    };
  }

  /**
   * Parse layer analysis from scan data
   */
  private parseLayerAnalysis(scanData: any): LayerAnalysis[] {
    const layers: LayerAnalysis[] = [];
    
    if (scanData.Metadata?.ImageConfig?.history) {
      for (const layer of scanData.Metadata.ImageConfig.history) {
        if (!layer.empty_layer) {
          layers.push({
            layerId: layer.created_by?.substring(0, 12) || 'unknown',
            size: layer.Size || 0,
            vulnerabilityCount: 0,
            addedPackages: 0
          });
        }
      }
    }

    return layers;
  }

  /**
   * Calculate Dockerfile security score
   */
  private calculateDockerfileScore(issues: DockerfileIssue[]): number {
    let score = 100;
    
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Generate Dockerfile recommendations
   */
  private generateDockerfileRecommendations(issues: DockerfileIssue[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(i => i.message.includes('root'))) {
      recommendations.push('Use a non-root user to run the application');
    }
    
    if (issues.some(i => i.message.includes('latest'))) {
      recommendations.push('Pin base image versions instead of using "latest" tag');
    }
    
    if (issues.some(i => i.message.includes('COPY'))) {
      recommendations.push('Use specific COPY instructions instead of ADD when possible');
    }

    if (issues.length === 0) {
      recommendations.push('Dockerfile follows security best practices');
    }

    return recommendations;
  }

  /**
   * Map severity string to normalized format
   */
  private mapSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'critical';
      case 'HIGH': return 'high';
      case 'MEDIUM': return 'medium';
      case 'LOW': return 'low';
      default: return 'low';
    }
  }

  /**
   * Get severity score for calculation
   */
  private getSeverityScore(severity: string): number {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 20;
      case 'HIGH': return 10;
      case 'MEDIUM': return 5;
      case 'LOW': return 2;
      default: return 1;
    }
  }
}