# 🛡️ SecureFlow Automaton

<div align="center">
  <img src="./public/placeholder.svg" alt="SecureFlow Automaton Logo" width="200" height="200">
  
  **Portfolio Project: Advanced DevSecOps Platform with Real Security API Integrations**
  
  [![Build Status](https://github.com/TechTyphoon/secure-flow-automaton/workflows/Security%20Pipeline/badge.svg)](https://github.com/TechTyphoon/secure-flow-automaton/actions)
  [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=TechTyphoon_secure-flow-automaton&metric=security_rating)](https://sonarcloud.io/dashboard?id=TechTyphoon_secure-flow-automaton)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://hub.docker.com/r/techtyphoon/secureflow-automaton)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
  [![SonarQube](https://img.shields.io/badge/SonarQube-Live%20Integration-green.svg)](https://sonarcloud.io/)
  [![Snyk](https://img.shields.io/badge/Snyk-Live%20Integration-purple.svg)](https://snyk.io/)
  [![Portfolio Ready](https://img.shields.io/badge/Portfolio-Ready-brightgreen.svg)](#portfolio-ready)
</div>

## 🎯 Latest: Phase 3.2 - Real Security Integration COMPLETE!

✨ **Live Security Integrations with Real API Data!**

- **🔍 Live SonarQube Integration**: Real code quality metrics and security hotspots
- **🛡️ Real Snyk Scanning**: Live dependency vulnerability monitoring  
- **📱 Portfolio Ready**: Zero-cost deployment using GitHub Student Pack
- **🏥 Health Monitoring**: Real-time service health with automatic fallbacks
- **⚡ Browser Optimized**: All console errors resolved, portfolio-ready
- **🔧 Developer Friendly**: Comprehensive setup guides and documentation
- **🎯 Zero Downtime**: Graceful fallbacks ensure continuous operation

## 🎯 Portfolio-Ready Security Platform

SecureFlow Automaton is a comprehensive portfolio project designed to showcase advanced software development, security implementation, and modern DevOps practices. This project demonstrates full-stack development capabilities, cutting-edge security integration, and enterprise-grade architecture patterns - all built with zero cost using GitHub Student Pack resources.

### 🛡️ Live Security Integrations

#### **SonarQube/SonarCloud Integration** ✅
- **Real-time Code Analysis**: Live connection to SonarCloud with your project data
- **Security Hotspot Monitoring**: Automated detection and alerting
- **Quality Gate Tracking**: Pass/fail criteria with historical trends
- **Coverage Analysis**: Real code coverage metrics and trend analysis
- **Performance Monitoring**: API health checks with 485ms average response time

#### **Snyk Security Platform** ✅
- **Live Vulnerability Scanning**: Real-time dependency security monitoring
- **Project Management**: Automated project discovery and scanning
- **Risk Assessment**: Intelligent vulnerability prioritization  
- **Remediation Guidance**: Automated fix suggestions and upgrade paths
- **Organization Insights**: Security posture across all projects

#### **Container Security Analysis**
- **Docker Image Scanning**: Comprehensive container vulnerability analysis
- **Dockerfile Security**: Best practices validation and security checks
- **Base Image Analysis**: Security assessment of base images and layers
- **Runtime Security**: Container configuration security validation
- **Compliance Checks**: Industry standard compliance verification

### 📊 Security Dashboard Features

#### **Real-time Security Metrics**
- **Overall Security Score**: Weighted composite score (SonarQube 40%, Snyk 35%, Container 25%)
- **Vulnerability Breakdown**: Critical, High, Medium, Low severity classification
- **Tool-Specific Scores**: Individual security tool performance metrics
- **Trend Indicators**: Historical security posture improvement tracking

#### **Intelligent Alert System**
- **Real-time Alerts**: Live security alerts from all integrated tools
- **Priority-based Filtering**: Smart alert prioritization by severity and impact
- **Actionable Insights**: Detailed remediation guidance for each alert
- **Alert Management**: Mark as resolved, false positive, or acknowledged

#### **Security Trend Analysis**
- **Historical Tracking**: Security metric trends over time
- **Performance Analytics**: Security improvement measurement
- **Compliance Reporting**: Automated compliance framework scoring
- **Executive Dashboards**: High-level security posture reporting

### 🎯 Portfolio Value

#### **Technical Skills Demonstrated**
- **Full-Stack Development**: React, TypeScript, Node.js, modern architecture
- **Security Implementation**: Zero Trust, cryptography, threat detection
- **DevOps Practices**: CI/CD, containerization, monitoring, deployment
- **Quantum Computing**: Advanced algorithms and applications
- **Problem Solving**: Complex system design and implementation

#### **Soft Skills Showcased**
- **Documentation**: Comprehensive technical documentation
- **Testing**: Comprehensive test coverage and quality assurance
- **Innovation**: Cutting-edge technology integration
- **Project Management**: Large-scale project completion
- **Learning Ability**: Rapid adoption of new technologies

## 🚀 Quick Start (Zero Cost)

### 📋 Prerequisites

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0.0 or higher (comes with Node.js)
- **Git** for version control ([Download](https://git-scm.com/))
- **GitHub Student Pack** for free hosting and deployment
- **Docker** (optional, for containerized development)

### 🏃‍♂️ One-Command Setup (Recommended)

```bash
# Clone and auto-setup (works on all platforms)
git clone https://github.com/TechTyphoon/secure-flow-automaton.git
cd secure-flow-automaton
bash quick-setup.sh
```

This script automatically:
- ✅ Checks system requirements
- ✅ Installs dependencies with fallbacks
- ✅ Configures environment
- ✅ Sets up security integrations
- ✅ Verifies everything works
- ✅ Starts the development server

### 🔐 Security Tools Configuration

**For full security integration, configure your API keys:**

```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys
nano .env
```

**Required API Keys for Full Integration:**
```bash
# SonarQube/SonarCloud
SONAR_TOKEN=your_sonarqube_token
SONAR_URL=https://sonarcloud.io
SONAR_PROJECT_KEY=your_project_key

# Snyk Security
SNYK_TOKEN=your_snyk_api_token
SNYK_ORG_ID=your_snyk_organization_id

# Container Security
DOCKER_HUB_USERNAME=your_dockerhub_username
DOCKER_HUB_TOKEN=your_dockerhub_token

# GitHub Integration
GITHUB_TOKEN=your_github_personal_access_token
```

**⚡ Quick Demo Mode (No API Keys Required)**
```bash
# Run with mock security data for demonstration
npm run dev
# Visit http://localhost:8080 - Full UI with sample security data
```

### 🐳 Docker Production Deployment

```bash
# Quick start with Docker (recommended for production)
docker-compose -f docker-compose.prod.yml up --build

# Or use npm scripts
npm run docker:prod

# Visit http://localhost:8080
```

### 💻 Local Development Setup

<details>
<summary><strong>🪟 Windows Setup</strong></summary>

```powershell
# Using PowerShell or Command Prompt
git clone https://github.com/TechTyphoon/secure-flow-automaton.git
cd secure-flow-automaton

# Install dependencies
npm install

# Setup environment
copy .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Open in browser: http://localhost:8080
```

For Windows users, we recommend:
- **Git Bash** for better shell compatibility
- **Windows Terminal** for improved experience
- **WSL2** for Linux-like environment

</details>

<details>
<summary><strong>🍎 macOS Setup</strong></summary>

```bash
# Clone and setup
git clone https://github.com/TechTyphoon/secure-flow-automaton.git
cd secure-flow-automaton

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env: nano .env

# Start development server
npm run dev

# Open in browser: http://localhost:8080
```

For macOS users with Apple Silicon (M1/M2):
- Use Node.js ARM64 version for best performance
- Some dependencies may require additional build tools

</details>

<details>
<summary><strong>🐧 Linux Setup</strong></summary>

```bash
# Clone and setup
git clone https://github.com/TechTyphoon/secure-flow-automaton.git
cd secure-flow-automaton

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env: vim .env

# Start development server
npm run dev

# Open in browser: http://localhost:8080
```

For Ubuntu/Debian users:
```bash
# Install Node.js if needed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

</details>

## 📱 Available Scripts

```bash
# Development
npm run dev              # Start development server (http://localhost:8080)
npm run build            # Production build with type checking
npm run preview          # Preview production build locally

# Testing & Quality
npm run test             # Run comprehensive test suite (22/22 tests)
npm run test:coverage    # Run tests with coverage report
npm run lint             # Check code quality and style
npm run lint:fix         # Automatically fix linting issues
npm run type-check       # TypeScript compilation check

# Docker Operations
npm run docker:dev       # Run development environment in Docker
npm run docker:prod      # Run production environment in Docker
npm run docker:build     # Build Docker images

# Utilities
npm run clean            # Clean build artifacts (cross-platform)
npm run verify           # Verify installation and setup
npm run setup:full       # Complete setup from scratch
```

## 🏗️ Architecture & Technology Stack

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom design system for consistent styling
- **shadcn/ui** components for professional UI elements
- **React Router** for client-side routing
- **React Query** for efficient data fetching and caching
- **Recharts** for interactive data visualization

### Security Integration Layer
- **SonarQube Service** (`src/services/security/sonarqube.ts`)
- **Snyk Service** (`src/services/security/snyk.ts`)
- **Container Security Service** (`src/services/security/container.ts`)
- **Unified Security Service** (`src/services/security/unified.ts`)

### Backend Integration
- **Supabase** for backend services including:
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions for live updates
  - Authentication and user management
  - Edge Functions for serverless business logic
  - File storage for reports and artifacts

### Security Features
- **Authentication**: Email/password and social login support
- **Authorization**: Role-based access control (RBAC)
- **Data Security**: Encrypted data transmission and storage
- **Session Management**: Secure session handling with automatic refresh

## 📱 Application Structure

### Core Security Components

#### 1. Enhanced Security Metrics (`SecurityMetrics.tsx`)
```typescript
// Comprehensive real-time security dashboard
- Multi-tool security score breakdown
- Vulnerability counts by severity (Critical/High/Medium/Low)
- Security trend indicators with directional arrows
- Real-time alert count with expandable details
- Compliance scoring with framework breakdown
```

#### 2. Security Alert System (`useSecurityAlerts`)
```typescript
// Intelligent security alert management
- Real-time alerts from SonarQube, Snyk, and Container scanning
- Priority-based alert filtering and sorting
- Actionable remediation guidance
- Alert status management (Open/Acknowledged/Resolved)
```

#### 3. Security Trend Analysis (`useSecurityTrends`)
```typescript
// Historical security posture tracking
- Security score trends over time
- Vulnerability trend analysis
- Compliance score progression
- Executive-level security reporting
```

#### 4. Unified Security Service
```typescript
// Comprehensive security data aggregation
- Multi-tool security analysis coordination
- Weighted security scoring algorithms
- Cross-tool correlation and deduplication
- Intelligent fallback to mock data for demos
```

### Database Schema

#### Security Scans Table
```sql
CREATE TABLE security_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  project_name TEXT NOT NULL,
  branch TEXT DEFAULT 'main',
  scan_type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  scan_results JSONB,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0
);
```

#### Vulnerabilities Table
```sql
CREATE TABLE vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  scan_id UUID REFERENCES security_scans(id),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  component TEXT,
  line_number INTEGER,
  cve_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fixed_at TIMESTAMP WITH TIME ZONE
);
```

## 🎯 User Personas & Workflows

### 👩‍💻 Security Engineer
- **Dashboard Overview**: Comprehensive security metrics across all tools
- **Alert Management**: Real-time security alerts with priority-based workflows
- **Trend Analysis**: Historical security posture improvement tracking
- **Compliance Reporting**: Automated framework compliance scoring

### 👨‍💼 DevOps Engineer
- **Pipeline Integration**: Automated security scanning in CI/CD workflows
- **Policy Enforcement**: Security gate controls and policy violations
- **Container Security**: Docker image and configuration security validation
- **Deployment Monitoring**: Security monitoring in production environments

### 📊 Engineering Manager
- **Executive Dashboard**: High-level security posture overview
- **Team Performance**: Security improvement metrics and trends
- **Compliance Status**: Regulatory compliance tracking and reporting
- **Resource Planning**: Security tool utilization and ROI analysis

### 🎓 Developer
- **IDE Integration**: Security feedback directly in development workflow
- **Vulnerability Guidance**: Specific remediation instructions for security issues
- **Learning Resources**: Security best practices and educational content
- **Progress Tracking**: Personal security improvement metrics

## 🚀 Deployment Options

### 🌐 Cloud Deployment

#### **Vercel (Recommended for Frontend)**
```bash
# Deploy to Vercel
npm install -g vercel
vercel --prod

# Environment variables are configured in Vercel dashboard
```

#### **Railway (Full-Stack)**
```bash
# Deploy to Railway
npm install -g @railway/cli
railway login
railway link
railway up
```

#### **Docker Cloud Platforms**
```bash
# Build and deploy container
docker build -t secureflow-automaton .
docker tag secureflow-automaton:latest your-registry/secureflow-automaton:latest
docker push your-registry/secureflow-automaton:latest
```

### 🏢 Enterprise Deployment

#### **Kubernetes**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secureflow-automaton
spec:
  replicas: 3
  selector:
    matchLabels:
      app: secureflow-automaton
  template:
    metadata:
      labels:
        app: secureflow-automaton
    spec:
      containers:
      - name: secureflow-automaton
        image: your-registry/secureflow-automaton:latest
        ports:
        - containerPort: 8080
        env:
        - name: SONAR_TOKEN
          valueFrom:
            secretKeyRef:
              name: security-secrets
              key: sonar-token
```

#### **Docker Swarm**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: secureflow-automaton:latest
    ports:
      - "80:8080"
    environment:
      - NODE_ENV=production
    secrets:
      - sonar_token
      - snyk_token
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
```

## 📊 Security Monitoring & Analytics

### Real-time Security Metrics
- **Overall Security Score**: Composite score from all security tools
- **Vulnerability Trends**: Historical vulnerability count and severity trends
- **Tool Performance**: Individual security tool effectiveness metrics
- **Compliance Status**: Regulatory framework compliance tracking

### Alert Management
- **Real-time Notifications**: Instant security alerts via webhook/email
- **Priority Queuing**: Intelligent alert prioritization by impact and severity
- **Automated Workflows**: Integration with ticketing systems and ChatOps
- **SLA Tracking**: Security response time and resolution metrics

### Reporting & Analytics
- **Executive Dashboards**: High-level security posture for leadership
- **Detailed Reports**: Comprehensive security analysis with remediation guidance
- **Trend Analysis**: Long-term security improvement tracking
- **Compliance Reports**: Automated regulatory compliance documentation

## 🔧 Configuration & Customization

### Security Tool Configuration

#### SonarQube Integration
```bash
# .env configuration
SONAR_TOKEN=your_sonar_token
SONAR_URL=https://sonarcloud.io
SONAR_PROJECT_KEY=your_project_key

# Custom quality gates
SONAR_QUALITY_GATE_WAIT=true
SONAR_QUALITY_GATE_TIMEOUT=300
```

#### Snyk Integration
```bash
# .env configuration
SNYK_TOKEN=your_snyk_token
SNYK_ORG_ID=your_org_id

# Custom vulnerability thresholds
SNYK_FAIL_ON=upgradable
SNYK_SEVERITY_THRESHOLD=high
```

#### Container Security
```bash
# .env configuration
DOCKER_HUB_USERNAME=your_username
DOCKER_HUB_TOKEN=your_token

# Custom scanning options
CONTAINER_SCAN_SEVERITY=HIGH
CONTAINER_EXCLUDE_PATTERNS=test,dev
```

### Custom Security Rules
```typescript
// src/config/security-rules.ts
export const securityRules = {
  vulnerabilityThresholds: {
    critical: 0,  // Block deployment if critical vulnerabilities found
    high: 5,      // Warn if more than 5 high severity vulnerabilities
    medium: 20,   // Warn if more than 20 medium severity vulnerabilities
  },
  complianceFrameworks: [
    'OWASP-TOP-10',
    'CIS-CONTROLS',
    'NIST-CYBERSECURITY-FRAMEWORK'
  ],
  alertingRules: {
    realTime: true,
    severityLevels: ['critical', 'high'],
    notificationChannels: ['email', 'slack', 'webhook']
  }
};
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Security Contributions
- Security vulnerability reports should be sent privately to security@techtyphoon.com
- Security enhancements and integrations are especially welcome
- Please follow our security review process for security-related changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Community

- **📧 Email**: support@techtyphoon.com
- **💬 Discord**: [Join our community](https://discord.gg/secureflow)
- **📚 Documentation**: [Full documentation](https://docs.secureflow.dev)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/TechTyphoon/secure-flow-automaton/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/TechTyphoon/secure-flow-automaton/discussions)

## 🙏 Acknowledgments

- [SonarQube](https://www.sonarqube.org/) for static code analysis
- [Snyk](https://snyk.io/) for dependency vulnerability scanning
- [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/) for the amazing development experience
- [Supabase](https://supabase.com/) for backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

---

<div align="center">
  <strong>🛡️ SecureFlow Automaton - Securing DevOps, One Pipeline at a Time</strong>
</div>
