# 🛡️ SecureFlow Automaton

<div align="center">
  <img src="./public/placeholder.svg" alt="SecureFlow Automaton Logo" width="200" height="200">
  
  **Enterprise-grade DevSecOps Pipeline Automation Platform**
  
  [![Build Status](https://github.com/TechTyphoon/secure-flow-automaton/workflows/Security%20Pipeline/badge.svg)](https://github.com/TechTyphoon/secure-flow-automaton/actions)
  [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=TechTyphoon_secure-flow-automaton&metric=security_rating)](https://sonarcloud.io/dashboard?id=TechTyphoon_secure-flow-automaton)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5+-purple.svg)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Ready-green.svg)](https://supabase.com/)
</div>

---

## 🚀 Quick Start

### 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/TechTyphoon/secure-flow-automaton.git
cd secure-flow-automaton

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev

# Open http://localhost:8080
```

### 🐳 Docker Deployment

```bash
# Build and run with Docker
docker-compose up --build

# Or use production setup
docker-compose -f docker-compose.prod.yml up --build
```

### 🔧 Jenkins CI/CD Setup

```bash
# Setup Jenkins with complete CI/CD pipeline
cd jenkins
./setup.sh

# Access Jenkins at http://localhost:8080
# Get initial admin password:
docker exec secureflow-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

---

## 📋 Overview

SecureFlow Automaton is a comprehensive DevSecOps platform designed to streamline security integration throughout the software development lifecycle. It provides real-time security monitoring, automated vulnerability management, and compliance tracking for modern development teams.

### ✨ Key Features

- **🔍 Real-time Security Monitoring**: Live vulnerability scanning and threat detection
- **🤖 Automated Remediation**: AI-powered vulnerability fixing and security patching
- **📊 Compliance Management**: SOC 2, ISO 27001, PCI DSS, and GDPR compliance tracking
- **🚀 Pipeline Integration**: GitHub Actions and Jenkins CI/CD integration
- **📈 Security Analytics**: Advanced reporting and trend analysis
- **🔐 Enterprise Authentication**: Secure user management with role-based access control
- **🎯 Project Timeline**: Structured DevSecOps implementation roadmap

### 🎯 Target Personas

- **🧑‍💻 Developers**: Security-first development workflows and IDE integration
- **🔒 Security Engineers**: Advanced threat analysis and incident response workflows  
- **⚙️ DevOps Teams**: CI/CD pipeline security automation and monitoring
- **📊 Management**: Executive dashboards and compliance reporting

---

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom design system for consistent styling
- **shadcn/ui** components for professional UI elements
- **React Router** for client-side routing
- **React Query** for efficient data fetching and caching
- **Recharts** for interactive data visualization

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

---

## 📱 Application Structure

### Core Components

#### 1. Security Metrics Dashboard
- Real-time vulnerability counts by severity
- Security score calculations and trends
- Compliance status indicators
- Pipeline health monitoring

#### 2. Pipeline Flow Visualization
- Visual representation of DevSecOps pipeline stages
- Code analysis and scanning stages
- Security gate controls
- Deployment automation status

#### 3. Vulnerability Management
- Comprehensive vulnerability listing and filtering
- Automated remediation triggers
- Manual review workflows
- Progress tracking and reporting

#### 4. Compliance Overview
- Regulatory compliance tracking (SOC 2, ISO 27001, PCI DSS, GDPR)
- Industry standards monitoring
- Audit trail maintenance
- Automated report generation

### Database Schema

#### Security Scans Table
```sql
CREATE TABLE security_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    scan_type TEXT NOT NULL,
    status TEXT DEFAULT 'running',
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    total_vulnerabilities INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    scan_results JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🛠️ Development

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/TechTyphoon/secure-flow-automaton.git
cd secure-flow-automaton
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env.local
```

Required environment variables:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub Integration
VITE_GITHUB_TOKEN=your_github_token
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=your_repository_name

# Application Settings
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

### Available Scripts

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview               # Preview production build

# Code Quality
npm run lint                  # Run ESLint
npm run lint:fix             # Fix ESLint issues
npm run type-check           # TypeScript type checking

# Testing
npm run test                 # Run tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage

# Security
npm run security:scan        # Run security audit
npm run security:pipeline    # Run complete security pipeline

# Database
npm run db:generate          # Generate Supabase types
npm run db:reset             # Reset local database
npm run db:migrate           # Run database migrations
```

---

## 🔧 Configuration

### Jenkins Pipeline Configuration

The project includes a comprehensive Jenkins pipeline with:

- **150+ Security Plugins**: Complete security toolchain integration
- **Multi-environment Support**: Development, staging, and production pipelines
- **Automated Testing**: Unit, integration, and security tests
- **Security Scanning**: SAST, DAST, and dependency scanning
- **Compliance Reporting**: Automated compliance report generation

### Docker Configuration

**Development Environment**
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
```

**Production Environment**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
```

---

## 🚀 Deployment

### GitHub Actions CI/CD

The project includes automated CI/CD workflows:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Security audit
        run: npm run security:scan
```

### Production Deployment

1. **Build the application**
```bash
npm run build
```

2. **Deploy with Docker**
```bash
docker build -t secureflow-automaton .
docker run -p 8080:8080 secureflow-automaton
```

3. **Deploy to cloud platforms**
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **AWS**: Use provided CloudFormation templates
- **Azure**: Use provided ARM templates

---

## 📊 Security & Compliance

### Security Features

- **🔐 Authentication**: Multi-factor authentication support
- **🛡️ Authorization**: Role-based access control (RBAC)
- **🔍 Vulnerability Scanning**: Real-time SAST and DAST scanning
- **📝 Audit Logging**: Comprehensive security event logging
- **🔄 Automated Remediation**: AI-powered vulnerability fixing

### Compliance Standards

- **SOC 2 Type II**: System and organization controls
- **ISO 27001**: Information security management
- **PCI DSS**: Payment card industry data security
- **GDPR**: General data protection regulation

### Security Scanning

```bash
# Run security audit
npm run security:scan

# Run dependency check
npm run security:dependency-check

# Run container security scan
npm run security:container-scan
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
4. **Run tests and linting**
```bash
npm test
npm run lint
```

5. **Commit your changes**
```bash
git commit -m 'Add some amazing feature'
```

6. **Push to the branch**
```bash
git push origin feature/amazing-feature
```

7. **Open a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** for the amazing React framework
- **Supabase** for the excellent backend-as-a-service platform
- **Vite** for the fast build tool
- **shadcn/ui** for the beautiful UI components
- **Tailwind CSS** for the utility-first CSS framework

---

## 📞 Support

For support, please contact:
- **Email**: support@techtyphoon.dev
- **GitHub Issues**: [Create an issue](https://github.com/TechTyphoon/secure-flow-automaton/issues)
- **Documentation**: [Wiki](https://github.com/TechTyphoon/secure-flow-automaton/wiki)

---

<div align="center">
  <strong>Built with ❤️ by TechTyphoon</strong>
</div>