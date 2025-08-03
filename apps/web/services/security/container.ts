// Browser-compatible container security service
// In production, this would call a backend API that performs the actual container scanning

export interface ContainerVulnerability {
  id: string;
  pkgName: string;
  installedVersion: string;
  fixedVersion?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  references: string[];
  publishedDate?: string;
  lastModifiedDate?: string;
}

export interface ContainerScanResult {
  target: string;
  vulnerabilities: ContainerVulnerability[];
  totalCount: number;
  severityCounts: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}

export interface DockerImageScan {
  image: string;
  tag: string;
  vulnerabilities: ContainerVulnerability[];
  totalVulns: number;
  criticalVulns: number;
  highVulns: number;
  mediumVulns: number;
  lowVulns: number;
  securityScore: number;
  lastScanned: string;
}

export interface DockerfileAnalysis {
  file: string;
  issues: DockerfileSecurity[];
  score: number;
  recommendations: string[];
}

export interface DockerfileSecurity {
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  line?: number;
  fix?: string;
}

class ContainerSecurityService {
  private readonly API_BASE = process.env.CONTAINER_SECURITY_API || 'https://api.containersecurity.example.com';
  private readonly apiKey = process.env.CONTAINER_SECURITY_KEY || '';

  /**
   * Scan Dockerfile for security issues (browser-compatible mock)
   */
  async scanDockerfile(dockerfilePath?: string): Promise<DockerfileAnalysis> {
    try {
      // In production, this would make an API call to a backend service
      // For now, return comprehensive mock data
      return this.getMockDockerfileAnalysis();
    } catch (error) {
      console.warn('Dockerfile scan unavailable, using mock data:', error);
      return this.getMockDockerfileAnalysis();
    }
  }

  /**
   * Scan Docker image for vulnerabilities (browser-compatible mock)
   */
  async scanImage(imageName: string, tag: string = 'latest'): Promise<DockerImageScan> {
    try {
      // In production, this would make an API call to a backend service
      // For now, return comprehensive mock data
      return this.getMockImageScan(imageName, tag);
    } catch (error) {
      console.warn('Image scan unavailable, using mock data:', error);
      return this.getMockImageScan(imageName, tag);
    }
  }

  /**
   * Scan local dependencies for container vulnerabilities (browser-compatible)
   */
  async scanLocalDependencies(): Promise<ContainerScanResult> {
    try {
      // In production, this would analyze package.json and other dependency files
      // via a backend API service
      return this.getMockDependencyScan();
    } catch (error) {
      console.warn('Dependency scan unavailable, using mock data:', error);
      return this.getMockDependencyScan();
    }
  }

  /**
   * Get comprehensive container security analysis
   */
  async getComprehensiveAnalysis(): Promise<{
    dockerfile: DockerfileAnalysis;
    image: DockerImageScan;
    dependencies: ContainerScanResult;
    overallScore: number;
  }> {
    const [dockerfile, image, dependencies] = await Promise.all([
      this.scanDockerfile(),
      this.scanImage('secure-flow-automaton'),
      this.scanLocalDependencies()
    ]);

    // Calculate overall security score
    const overallScore = Math.round(
      (dockerfile.score + image.securityScore + this.calculateDependencyScore(dependencies)) / 3
    );

    return {
      dockerfile,
      image,
      dependencies,
      overallScore
    };
  }

  private calculateDependencyScore(result: ContainerScanResult): number {
    const { severityCounts } = result;
    const totalVulns = Object.values(severityCounts).reduce((sum, count) => sum + count, 0);
    
    if (totalVulns === 0) return 100;
    
    const weightedScore = 100 - (
      severityCounts.CRITICAL * 25 +
      severityCounts.HIGH * 15 +
      severityCounts.MEDIUM * 8 +
      severityCounts.LOW * 2
    );
    
    return Math.max(0, Math.min(100, weightedScore));
  }

  private getMockDockerfileAnalysis(): DockerfileAnalysis {
    return {
      file: 'Dockerfile',
      score: 85,
      issues: [
        {
          rule: 'DL3008',
          severity: 'medium',
          message: 'Pin versions in apt get install',
          line: 15,
          fix: 'Use specific package versions: apt-get install package=version'
        },
        {
          rule: 'DL3009',
          severity: 'low',
          message: 'Delete apt-get lists after installing something',
          line: 16,
          fix: 'Add: && rm -rf /var/lib/apt/lists/*'
        },
        {
          rule: 'DL3025',
          severity: 'high',
          message: 'Use COPY instead of ADD for files and folders',
          line: 22,
          fix: 'Replace ADD with COPY for better security'
        }
      ],
      recommendations: [
        'Use multi-stage builds to reduce attack surface',
        'Run containers as non-root user',
        'Use specific base image tags instead of latest',
        'Minimize installed packages',
        'Use .dockerignore to exclude sensitive files'
      ]
    };
  }

  private getMockImageScan(imageName: string, tag: string): DockerImageScan {
    return {
      image: imageName,
      tag,
      lastScanned: new Date().toISOString(),
      totalVulns: 23,
      criticalVulns: 1,
      highVulns: 4,
      mediumVulns: 12,
      lowVulns: 6,
      securityScore: 78,
      vulnerabilities: [
        {
          id: 'CVE-2023-5678',
          pkgName: 'openssl',
          installedVersion: '1.1.1f',
          fixedVersion: '1.1.1t',
          severity: 'CRITICAL',
          title: 'OpenSSL Buffer Overflow',
          description: 'A buffer overflow vulnerability in OpenSSL could allow remote code execution.',
          references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-5678'],
          publishedDate: '2023-10-15',
          lastModifiedDate: '2023-11-01'
        },
        {
          id: 'CVE-2023-4567',
          pkgName: 'curl',
          installedVersion: '7.68.0',
          fixedVersion: '7.88.1',
          severity: 'HIGH',
          title: 'cURL Certificate Validation Bypass',
          description: 'Improper certificate validation in cURL could lead to man-in-the-middle attacks.',
          references: ['https://curl.se/docs/CVE-2023-4567.html'],
          publishedDate: '2023-09-20',
          lastModifiedDate: '2023-10-05'
        },
        {
          id: 'CVE-2023-3456',
          pkgName: 'zlib',
          installedVersion: '1.2.11',
          fixedVersion: '1.2.13',
          severity: 'MEDIUM',
          title: 'zlib Memory Corruption',
          description: 'Memory corruption vulnerability in zlib compression library.',
          references: ['https://github.com/madler/zlib/security/advisories'],
          publishedDate: '2023-08-10',
          lastModifiedDate: '2023-09-15'
        }
      ]
    };
  }

  private getMockDependencyScan(): ContainerScanResult {
    return {
      target: 'package.json',
      totalCount: 15,
      severityCounts: {
        LOW: 8,
        MEDIUM: 5,
        HIGH: 2,
        CRITICAL: 0
      },
      vulnerabilities: [
        {
          id: 'npm-audit-1234',
          pkgName: 'lodash',
          installedVersion: '4.17.20',
          fixedVersion: '4.17.21',
          severity: 'HIGH',
          title: 'Prototype Pollution in lodash',
          description: 'lodash versions prior to 4.17.21 are vulnerable to prototype pollution.',
          references: ['https://github.com/advisories/GHSA-35jh-r3h4-6jhm'],
          publishedDate: '2023-07-01',
          lastModifiedDate: '2023-08-15'
        },
        {
          id: 'npm-audit-5678',
          pkgName: 'axios',
          installedVersion: '0.21.1',
          fixedVersion: '0.21.4',
          severity: 'MEDIUM',
          title: 'Regular Expression Denial of Service',
          description: 'axios is vulnerable to ReDoS attacks via malicious Content-Type headers.',
          references: ['https://github.com/axios/axios/security/advisories/GHSA-42xw-2xvc-qx8m'],
          publishedDate: '2023-06-20',
          lastModifiedDate: '2023-07-10'
        }
      ]
    };
  }
}

// Export singleton instance
export const containerSecurityService = new ContainerSecurityService();
