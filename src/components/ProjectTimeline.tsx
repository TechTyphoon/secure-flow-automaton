import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, Calendar, Target, FileText, Shield, LockKeyhole, Zap, GitPullRequest } from 'lucide-react';

const codeBlockClass =
  "font-mono bg-gray-900 text-green-300 rounded-md p-4 text-xs overflow-x-auto border border-gray-800 my-4";

const SecureCodingStandardsCard = () => (
  <Card className="border-primary border-2">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-primary" />
        <span>Secure Coding Standards</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="mb-2 text-muted-foreground">
        Ensuring secure coding practices throughout development helps prevent vulnerabilities at the source. The standards below are enforced through SAST tools in our pipeline.
      </p>
      <ul className="list-disc pl-6 space-y-1 mb-2">
        <li>Follow <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer" className="underline text-primary">OWASP Top 10</a> security categories (e.g., Injection, XSS, Broken Authentication)</li>
        <li>Validate and sanitize all inputs</li>
        <li>Apply output encoding and escaping</li>
        <li>Avoid secrets/hardcoded credentials in code</li>
        <li>Use least-privilege for all resources and APIs</li>
        <li>Implement comprehensive error handling & logging</li>
        <li>Keep dependencies up to date and monitored</li>
        <li>Enforce code reviews for all pull requests</li>
      </ul>
      <div className="text-xs text-green-500">
        <span className="font-semibold">SAST Enforcement:</span> SAST tools like SonarQube and Semgrep are integrated into our pipeline and scan source code on every push/PR, blocking insecure code according to configured policies.
      </div>
    </CardContent>
  </Card>
);

const AutomatedRemediationCard = () => (
  <Card className="border-2 border-yellow-500">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Zap className="h-5 w-5 text-yellow-500" />
        <span>Automated Remediation</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="mb-2 text-muted-foreground">
        Automated remediation enhances security by fixing certain classes of vulnerabilities as soon as they're detected, reducing mean time to resolution.
      </p>
      <ol className="list-decimal pl-6 mb-2 text-xs">
        <li><b>Automated Dependency PRs:</b> For outdated or vulnerable dependencies, a bot (like Dependabot or a custom action) can open a Pull Request to update to a safe version automatically.</li>
        <li><b>Suggested Fixes:</b> For misconfigurations or code weaknesses, the bot can suggest code changes, shown as review comments or PR suggestions.</li>
        <li><b>Configurable Actions:</b> Optionally, policies can allow auto-merging trusted dependency updates or reverting changes that introduce vulnerabilities.</li>
      </ol>
      <div className="text-xs text-yellow-600">
        The auto-remediation logic is implemented via GitHub Actions and custom scripts, integrated directly into the security workflow.
      </div>
    </CardContent>
  </Card>
);

const SecretsManagementCard = () => (
  <Card className="border-2 border-blue-600">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <LockKeyhole className="h-5 w-5 text-blue-600" />
        <span>Secrets Management</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="mb-2 text-muted-foreground">
        Secrets such as API keys and passwords are never stored in code or VCS. They are securely injected at runtime using best practices.
      </p>
      <ul className="pl-6 list-disc space-y-1 text-xs mb-2">
        <li><b>Environment Variables:</b> Secrets are referenced via pipeline or GitHub Actions secrets; not embedded in code.</li>
        <li><b>Secret Stores:</b> Integration with tools like HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault is possible via pipeline steps.</li>
        <li><b>Runtime Access:</b> Jobs fetch secrets at build/deploy time, for single-use, ephemeral access.</li>
      </ul>
      <div className="text-xs text-blue-500">
        <b>Example Flow:</b> The pipeline requests required secrets from a secret manager or pipeline environment at runtime, ensuring they are never exposed or stored within repository files or logs.
      </div>
    </CardContent>
  </Card>
);

const VulnReportInfoCard = () => (
  <Card className="border-2 border-red-600">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <FileText className="h-5 w-5 text-red-600" />
        <span>Vulnerability Reporting</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="mb-2 text-muted-foreground">
        Security tools output findings in machine-readable formats (e.g., SARIF, JSON) for easy aggregation, dashboarding, and triage.
      </p>
      <div className="mb-2 text-xs">
        Aggregated findings can be integrated into dashboards or sent to centralized vulnerability management systems.
      </div>
      <pre className={codeBlockClass}>
        {
          `{
            "runs": [{
              "tool": { "driver": { "name": "Snyk" }},
              "results": [
                {
                  "ruleId": "npm:lodash",
                  "level": "error",
                  "message": { "text": "Prototype Pollution in lodash" },
                  "locations": [{ "physicalLocation": { "artifactLocation": { "uri": "src/index.js" }, "region": { "startLine": 10 } }}],
                  "severity": "critical",
                  "fix": { "suggestedVersion": ">=4.17.21" }
                }
              ]
            }]
          }`
        }
      </pre>
    </CardContent>
  </Card>
);

const PolicyAsCodeCard = () => (
  <Card className="border-2 border-pink-600">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Target className="h-5 w-5 text-pink-600" />
        <span>Policy-as-Code Example</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-xs mb-2">
        Example Open Policy Agent (OPA) policy for enforcing security gates: <br />
        <pre className={codeBlockClass}>
          {
            `# Example: Policy-as-Code with OPA (Open Policy Agent) - allow build only if critical vulns = 0

package pipeline.security

allow = input.sast.critical == 0
deny[msg] {
  input.sast.critical > 0
  msg = "Critical SAST vulnerabilities found!"
}`
          }
        </pre>
      </div>
    </CardContent>
  </Card>
);

const ProjectTimeline = () => {
  const [activeWeek, setActiveWeek] = useState(1);

  const phases = [
    {
      weeks: "1-2",
      title: "Tool Research & Pipeline Setup",
      status: "in-progress",
      progress: 75,
      deliverables: [
        { name: "Tool Selection Matrix", status: "completed", type: "research" },
        { name: "Architecture Diagram", status: "completed", type: "design" },
        { name: "Basic CI/CD Pipeline", status: "in-progress", type: "implementation" },
        { name: "Environment Setup", status: "in-progress", type: "infrastructure" }
      ],
      tasks: [
        "Research SAST tools (SonarQube, Semgrep, Checkmarx)",
        "Evaluate SCA solutions (Snyk, Dependabot, OWASP)",
        "Compare container scanning tools (Trivy, Aqua, Clair)",
        "Analyze secrets management options (Vault, AWS, Azure)",
        "Setup basic CI/CD pipeline structure",
        "Configure development environment"
      ],
      keyMilestones: [
        "Tool selection finalized",
        "Basic pipeline operational",
        "Development environment ready"
      ]
    },
    {
      weeks: "3-4",
      title: "SAST & SCA Integration",
      status: "pending",
      progress: 0,
      deliverables: [
        { name: "SAST Integration", status: "pending", type: "implementation" },
        { name: "SCA Implementation", status: "pending", type: "implementation" },
        { name: "Security Gates Definition", status: "pending", type: "policy" },
        { name: "Quality Metrics Dashboard", status: "pending", type: "monitoring" }
      ],
      tasks: [
        "Integrate SonarQube with CI/CD pipeline",
        "Configure Semgrep for custom security rules",
        "Setup Snyk for dependency scanning",
        "Implement Dependabot for automated updates",
        "Define security gate criteria (fail on critical/high)",
        "Create vulnerability reporting mechanisms"
      ],
      keyMilestones: [
        "SAST tools operational",
        "Dependency scanning active",
        "Security gates enforced"
      ]
    },
    {
      weeks: "5-6",
      title: "Container Scanning & Auto-Remediation",
      status: "pending",
      progress: 0,
      deliverables: [
        { name: "Container Image Scanning", status: "pending", type: "implementation" },
        { name: "Automated Remediation Engine", status: "pending", type: "automation" },
        { name: "PR Generation System", status: "pending", type: "automation" },
        { name: "Vulnerability Tracking", status: "pending", type: "monitoring" }
      ],
      tasks: [
        "Integrate Trivy for container vulnerability scanning",
        "Setup Docker image security policies",
        "Implement automated dependency update PRs",
        "Create code fix suggestion system",
        "Build vulnerability tracking dashboard",
        "Setup automated testing for remediation"
      ],
      keyMilestones: [
        "Container scanning operational",
        "Auto-remediation working",
        "PR automation functional"
      ]
    },
    {
      weeks: "7-8",
      title: "Secrets Management & Advanced Features",
      status: "pending",
      progress: 0,
      deliverables: [
        { name: "HashiCorp Vault Integration", status: "pending", type: "infrastructure" },
        { name: "Secrets Scanning", status: "pending", type: "security" },
        { name: "Advanced Reporting", status: "pending", type: "monitoring" },
        { name: "Compliance Framework", status: "pending", type: "governance" }
      ],
      tasks: [
        "Deploy and configure HashiCorp Vault",
        "Implement secrets rotation policies",
        "Setup secrets scanning in code repositories",
        "Create advanced security dashboards",
        "Implement compliance reporting (SOC2, PCI-DSS)",
        "Setup security event alerting"
      ],
      keyMilestones: [
        "Vault operational",
        "Secrets management complete",
        "Compliance reporting ready"
      ]
    },
    {
      weeks: "9-10",
      title: "Testing, Documentation & Demo Prep",
      status: "pending",
      progress: 0,
      deliverables: [
        { name: "Comprehensive Testing", status: "pending", type: "testing" },
        { name: "Documentation Suite", status: "pending", type: "documentation" },
        { name: "Demo Environment", status: "pending", type: "demo" },
        { name: "Training Materials", status: "pending", type: "training" }
      ],
      tasks: [
        "End-to-end pipeline testing",
        "Security tool effectiveness validation",
        "Performance benchmarking",
        "User documentation creation",
        "Demo environment setup",
        "Training material development"
      ],
      keyMilestones: [
        "All tests passing",
        "Documentation complete",
        "Demo ready for presentation"
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeliverableIcon = (type) => {
    switch (type) {
      case 'research': return <FileText className="h-4 w-4" />;
      case 'design': return <Target className="h-4 w-4" />;
      case 'implementation': return <CheckCircle className="h-4 w-4" />;
      case 'infrastructure': return <Circle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calendar className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Project Timeline & Milestones</h2>
      </div>

      <div className="grid gap-6">
        {phases.map((phase, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-all duration-200 ${activeWeek === index + 1 ? 'ring-2 ring-primary shadow-lg' : ''}`}
            onClick={() => setActiveWeek(index + 1)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="font-mono">
                    Week {phase.weeks}
                  </Badge>
                  <CardTitle className="text-lg">{phase.title}</CardTitle>
                  <Badge className={getStatusColor(phase.status)}>{phase.status.replace('-', ' ')}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{phase.progress}% Complete</div>
              </div>
              <Progress value={phase.progress} className="w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Key Tasks</span>
                  </h4>
                  <ul className="text-sm space-y-1">
                    {phase.tasks.map((task, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Deliverables</span>
                  </h4>
                  <div className="space-y-2">
                    {phase.deliverables.map((deliverable, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex items-center space-x-2">
                          {getDeliverableIcon(deliverable.type)}
                          <span className="text-sm">{deliverable.name}</span>
                        </div>
                        <Badge className={getStatusColor(deliverable.status)}>
                          {deliverable.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Key Milestones</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {phase.keyMilestones.map((milestone, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {milestone}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* -- OVERALL STATUS -- */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Project Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">15%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2</div>
              <div className="text-sm text-muted-foreground">Active Phases</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">18</div>
              <div className="text-sm text-muted-foreground">Total Deliverables</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">10</div>
              <div className="text-sm text-muted-foreground">Weeks Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* -- PHASE 3 and OUTPUTS -- */}
      <div className="space-y-8">
        <SecureCodingStandardsCard />
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mt-4 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            Comprehensive CI/CD Pipeline Example (.github/workflows/devsecops.yml)
          </h2>
          <pre className={codeBlockClass}>
{`# .github/workflows/devsecops.yml
name: DevSecOps CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_ENV: production

jobs:
  build-test:
    runs-on: ubuntu-latest
    outputs:
      build_path: \${{ steps.set_build_path.outputs.BUILD_PATH }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run Lint & Prettier
        run: npm run lint && npm run format:check

      - name: Run unit tests
        run: npm test

      - name: Set build path
        id: set_build_path
        run: echo "BUILD_PATH=./build" >> $GITHUB_OUTPUT

  sast:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Run SAST (Semgrep)
        uses: returntocorp/semgrep-action@v1
        with:
          config: "p/owasp-top-ten"
        continue-on-error: false # Fail pipeline on critical findings

  sca:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Dependency Scan (Snyk)
        uses: snyk/actions/node@v3
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        continue-on-error: false
      - name: Upload Snyk results (SARIF)
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: snyk.sarif

  containerscan:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t myapp:\${{ github.sha }} .
      - name: Scan Docker image (Trivy)
        uses: aquasecurity/trivy-action@v0.17.0
        with:
          image-ref: myapp:\${{ github.sha }}
          format: 'table'
        continue-on-error: false # Fail on critical vulns

  security-gates:
    needs: [sast, sca, containerscan]
    runs-on: ubuntu-latest
    steps:
      - name: Assess vulnerability scan results
        run: |
          # Placeholder logic - replace with parsing tool outputs
          export CRITICAL_VULNS=0
          export HIGH_VULNS=0
          if [ "$CRITICAL_VULNS" -gt 0 ] || [ "$HIGH_VULNS" -gt 5 ]; then
            echo "Security gate triggered - pipeline failed."
            exit 1
          fi
        shell: bash

  remediation:
    needs: [security-gates]
    runs-on: ubuntu-latest
    if: failure() # Only runs if gates failed
    steps:
      - name: Open auto-remediation PR
        uses: actions/github-script@v6
        with:
          script: |
            // This would open automated PRs to address detected issues
            // See dedicated remediation job sample below

  deploy:
    needs: [security-gates]
    if: success()
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy (dummy step)
        run: echo "Deploying app..." # Place deployment tool/script here

# Secrets are injected using GitHub Actions secrets or called from external vault (see below info card)
`}
          </pre>
        </div>
        <PolicyAsCodeCard />
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 mt-8 mb-1">
            <GitPullRequest className="h-5 w-5 text-yellow-500" />
            Sample Automated Remediation GitHub Action
          </h2>
          <pre className={codeBlockClass}>
{`# .github/workflows/auto-remediation.yml

name: Automated Dependency Remediation

on:
  schedule:
    - cron: '0 6 * * 1' # Every Monday
  workflow_dispatch:

jobs:
  dep-upgrade:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
      - name: Update dependencies
        run: npm update
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          commit-message: "chore: automated dependency update"
          title: "Automated Dependency Update"
          body: "This PR updates dependencies with available security patches."
`}
          </pre>
          <AutomatedRemediationCard />
        </div>
        <SecretsManagementCard />
        <VulnReportInfoCard />
      </div>{/* Closes .space-y-8 */}
    </div>
  );
};

export default ProjectTimeline;
