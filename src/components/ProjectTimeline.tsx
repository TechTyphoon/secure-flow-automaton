import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, Calendar, Target, FileText, Shield, LockKeyhole, Zap, GitPullRequest, TestTube } from 'lucide-react';
import TimelinePhases from './project-timeline/TimelinePhases';
import SecureCodingStandardsCard from './project-timeline/SecureCodingStandardsCard';
import AutomatedRemediationCard from './project-timeline/AutomatedRemediationCard';
import SecretsManagementCard from './project-timeline/SecretsManagementCard';
import VulnReportInfoCard from './project-timeline/VulnReportInfoCard';
import PolicyAsCodeCard from './project-timeline/PolicyAsCodeCard';
import TestingStrategyCard from './project-timeline/TestingStrategyCard';
import SecurityTestCasesCard from './project-timeline/SecurityTestCasesCard';
import TestReportExampleCard from './project-timeline/TestReportExampleCard';
import RemediationPOCCard from './project-timeline/RemediationPOCCard';
import PhaseFiveDeploymentCard from './project-timeline/PhaseFiveDeploymentCard';
import FeedbackLoopCard from './project-timeline/FeedbackLoopCard';
import ContinuousImprovementCard from './project-timeline/ContinuousImprovementCard';
import VulnerabilityManagementCard from './project-timeline/VulnerabilityManagementCard';
import DocumentationCard from './project-timeline/DocumentationCard';

const codeBlockClass =
  "font-mono bg-gray-900 text-green-300 rounded-md p-4 text-xs overflow-x-auto border border-gray-800 my-4";

const ProjectTimeline = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calendar className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Project Timeline & Milestones</h2>
      </div>

      <TimelinePhases />

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

      {/* -- SPECIAL CARDS & PHASES -- */}
      <SecureCodingStandardsCard />
      {/* Pipeline YAML, Policy as Code, Remediation Card, Secrets Card, etc */}
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
      <TestingStrategyCard />
      <SecurityTestCasesCard />
      <TestReportExampleCard />
      <RemediationPOCCard />
      <PhaseFiveDeploymentCard />

      {/* Phase 6 - Maintenance & Iteration */}
      <h2 className="text-2xl font-bold mt-8 mb-2 flex items-center gap-2">
        <Circle className="h-6 w-6 text-emerald-600" />
        Phase 6: Maintenance & Iteration
      </h2>
      <FeedbackLoopCard />
      <ContinuousImprovementCard />
      <VulnerabilityManagementCard />
      <DocumentationCard />
    </div>
  );
};

export default ProjectTimeline;
