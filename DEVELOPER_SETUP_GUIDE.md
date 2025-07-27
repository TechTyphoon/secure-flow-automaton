# 🚀 SecureFlow Automaton - Developer Setup Guide

**Version**: 3.2.0  
**Last Updated**: July 28, 2025  
**Target Audience**: Developers, DevSecOps Engineers, Security Teams  

## 📋 Quick Start

### Prerequisites
- **Node.js**: v18+ recommended
- **npm**: v8+ or **bun**: v1.0+
- **Git**: Latest version
- **API Keys**: SonarQube, Snyk, Slack webhook (optional)

### 1-Minute Setup
```bash
# Clone repository
git clone https://github.com/TechTyphoon/secure-flow-automaton.git
cd secure-flow-automaton

# Install dependencies
npm install

# Copy environment template
cp .env.local.template .env.local

# Start development server
npm run dev

# Open browser
open http://localhost:8080
```

## 🔧 Environment Configuration

### Required Environment Variables

Create `.env.local` with your API keys:

```bash
# Application Configuration
VITE_APP_NAME="SecureFlow Automaton"
VITE_APP_VERSION="3.2.0"
VITE_APP_ENV="development"
VITE_APP_URL="http://localhost:5173"

# Supabase Configuration (Required)
VITE_SUPABASE_URL="https://kzkbrldwxvpvgvtklqis.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6a2JybGR3eHZwdmd2dGtscWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NDE3MzIsImV4cCI6MjA1MTUxNzczMn0.eJYCfYKhDnhErlKdHFpkLLJNhEQdF4R7tgM3m9xOjqw"

# SonarQube Integration (Optional - will use mock data if not provided)
VITE_SONAR_TOKEN=your_sonarqube_token_here
VITE_SONAR_URL=https://sonarcloud.io
VITE_SONAR_PROJECT_KEY=your_project_key

# Snyk Integration (Optional - will use mock data if not provided)
VITE_SNYK_TOKEN=your_snyk_token_here
VITE_SNYK_ORG_ID=your_organization_id

# Slack Notifications (Optional - will log to console if not provided)
VITE_SLACK_WEBHOOK_URL=your_slack_webhook_url
VITE_SLACK_CHANNEL=#security-alerts

# Security Configuration
VITE_SECURITY_SCAN_ENABLED=true
VITE_SECURITY_SCAN_INTERVAL=300000
VITE_VULNERABILITY_THRESHOLD=high
```

### API Key Setup Instructions

#### 🔍 SonarQube/SonarCloud Token
1. Visit [SonarCloud](https://sonarcloud.io) or your SonarQube instance
2. Go to **My Account** → **Security** → **Generate Tokens**
3. Create a token with appropriate permissions
4. Add to `.env.local` as `VITE_SONAR_TOKEN`

#### 🛡️ Snyk API Token
1. Visit [Snyk Account Settings](https://app.snyk.io/account)
2. Go to **General Account Settings** → **API Token**
3. Copy your token
4. Add to `.env.local` as `VITE_SNYK_TOKEN`

#### 📢 Slack Webhook URL
1. Visit [Slack Apps](https://api.slack.com/apps)
2. Create a new app → **Incoming Webhooks**
3. Activate webhooks and add to workspace
4. Copy webhook URL
5. Add to `.env.local` as `VITE_SLACK_WEBHOOK_URL`

## 🏗️ Project Structure

```
secure-flow-automaton/
├── src/
│   ├── components/               # React components
│   │   ├── SecurityServiceDashboard.tsx    # Service management UI
│   │   └── ...
│   ├── services/                # Service layer
│   │   ├── security/           # Security integrations
│   │   │   ├── apiClient.ts    # HTTP client with retry logic
│   │   │   ├── config.ts       # Configuration management
│   │   │   ├── healthMonitor.ts # Service health monitoring
│   │   │   ├── notifications.ts # Alert delivery
│   │   │   ├── sonarqube.ts    # SonarQube integration
│   │   │   └── snyk.ts         # Snyk integration
│   │   ├── governance/         # Compliance & policy
│   │   │   ├── complianceEngine.ts # SOC2, ISO27001, PCI-DSS
│   │   │   └── policyEngine.ts     # Policy-as-code
│   │   ├── intelligence/       # Threat intelligence
│   │   │   └── threatIntelligence.ts # Behavioral analysis
│   │   └── cicd/              # CI/CD integrations
│   │       ├── pipelineOrchestrator.ts
│   │       └── securityGates.ts
│   └── pages/                  # Application pages
├── docs/                       # Documentation
├── tests/                      # Test files
└── public/                     # Static assets
```

## 🚀 Development Workflow

### Available Scripts

```bash
# Development
npm run dev          # Start development server with HMR
npm run dev:host     # Start with network access (0.0.0.0)

# Building
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm run test         # Run test suite
npm run test:integration # Run integration tests
node test-integrations.js # Test API integrations

# Linting & Formatting
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix linting issues
npm run format       # Prettier formatting

# Docker
npm run docker:build # Build Docker image
npm run docker:run   # Run in container
docker-compose up    # Full stack with dependencies
```

### Development Server Options

| Command | Host | Port | Network Access |
|---------|------|------|----------------|
| `npm run dev` | localhost | 8080 | Local only |
| `npm run dev:host` | 0.0.0.0 | 8080 | Network accessible |
| `npm run preview` | localhost | 4173 | Production preview |

## 🧪 Testing & Validation

### Health Check Verification
```bash
# Quick environment test
node test-env.js

# Comprehensive integration test
node test-integrations.js

# Browser compatibility test
node browser-test.js
```

### Manual Testing Checklist

#### ✅ Environment Setup
- [ ] All environment variables loaded
- [ ] Development server starts without errors
- [ ] No console errors in browser developer tools
- [ ] Services tab loads successfully

#### ✅ API Integrations
- [ ] SonarQube health check passes
- [ ] Snyk projects load correctly
- [ ] Slack test notification delivered
- [ ] Service dashboard shows real data

#### ✅ Error Handling
- [ ] Invalid API keys show appropriate fallback
- [ ] Network issues gracefully handled
- [ ] Service degradation alerts working

### Browser Testing
1. Open **Developer Tools** (F12)
2. Navigate to **Console** tab
3. Verify no error messages
4. Check **Network** tab for successful API calls
5. Test **Services** tab functionality

## 🔧 Troubleshooting

### Common Issues & Solutions

#### ❌ "process is not defined" Error
**Cause**: Using Node.js process.env in browser  
**Solution**: Use import.meta.env instead
```typescript
// ❌ Wrong
const token = process.env.SONAR_TOKEN;

// ✅ Correct  
const token = import.meta.env.VITE_SONAR_TOKEN;
```

#### ❌ Environment Variables Not Loading
**Cause**: Missing VITE_ prefix or incorrect file location  
**Solution**: 
1. Ensure variables start with `VITE_`
2. Place `.env.local` in project root
3. Restart development server

#### ❌ API Authentication Failures
**Cause**: Invalid or expired API tokens  
**Solution**:
1. Verify tokens in respective service dashboards
2. Check token permissions and scopes
3. Regenerate tokens if necessary

#### ❌ Slack Notifications Not Working
**Cause**: Invalid webhook URL or channel permissions  
**Solution**:
1. Test webhook with curl
2. Verify channel exists and bot has access
3. Check webhook URL format

#### ❌ Services Showing "Degraded" Status
**Cause**: Network connectivity or API rate limiting  
**Solution**:
1. Check internet connection
2. Verify service status pages
3. Monitor API rate limits

### Debug Mode

Enable verbose logging:
```bash
# Enable debug logging
VITE_DEBUG_SECURITY=true npm run dev

# Check specific service
VITE_DEBUG_SONARQUBE=true npm run dev
```

### Performance Issues

#### Slow API Responses
1. Check service status pages
2. Monitor network tab in browser
3. Enable caching for frequently accessed data
4. Consider API rate limiting

#### High Memory Usage
1. Clear browser cache
2. Restart development server
3. Check for memory leaks in console
4. Reduce concurrent API calls

## 🚀 Deployment Options

### Local Development
```bash
npm run dev
# Access: http://localhost:8080
```

### Docker Development
```bash
docker-compose up -d
# Access: http://localhost:8080
```

### Production Build
```bash
npm run build
npm run preview
# Access: http://localhost:4173
```

### Cloud Deployment
- **Vercel**: Connect GitHub repo for automatic deployments
- **Netlify**: Deploy from build directory
- **AWS S3/CloudFront**: Static site hosting
- **Railway**: Full-stack deployment

## 🔐 Security Best Practices

### API Key Management
- ✅ Never commit API keys to version control
- ✅ Use `.env.local` for sensitive configuration
- ✅ Rotate API keys regularly
- ✅ Use least-privilege API scopes
- ✅ Monitor API key usage and alerts

### Development Security
- ✅ Keep dependencies updated
- ✅ Use HTTPS in production
- ✅ Validate environment variables
- ✅ Implement proper error handling
- ✅ Log security events appropriately

## 📊 Monitoring & Observability

### Built-in Monitoring
- **Service Health Dashboard**: Real-time status monitoring
- **Performance Metrics**: Response time tracking
- **Error Tracking**: Comprehensive error logging
- **Alert System**: Automated notifications

### External Monitoring Setup
1. **Application Performance Monitoring (APM)**
   - Integrate with DataDog, New Relic, or similar
   - Monitor API response times and error rates

2. **Log Aggregation**
   - Set up centralized logging with ELK stack
   - Track security events and user activities

3. **Uptime Monitoring**
   - Use services like Pingdom or UptimeRobot
   - Monitor service availability and response times

## 🤝 Contributing

### Development Guidelines
1. **Branch Naming**: `feature/description` or `fix/issue-name`
2. **Commit Messages**: Follow conventional commits format
3. **Code Style**: Use Prettier and ESLint configurations
4. **Testing**: Add tests for new features and bug fixes
5. **Documentation**: Update relevant documentation

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request with clear description

## 📚 Additional Resources

### Documentation
- [API Integration Documentation](./API_INTEGRATION_DOCUMENTATION.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Phase Implementation Plans](./PHASE_*.md)

### External Documentation
- [SonarQube Web API](https://docs.sonarqube.org/latest/extend/web-api/)
- [Snyk API Documentation](https://snyk.docs.apiary.io/)
- [Slack Webhook Guide](https://api.slack.com/messaging/webhooks)
- [Vite Configuration](https://vitejs.dev/config/)

### Community
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Wiki**: Community-maintained documentation

---

## 🎯 Next Steps

After successful setup:

1. **Explore the Dashboard**: Navigate through all application tabs
2. **Test Integrations**: Use the Services tab to test API connections
3. **Configure Alerts**: Set up Slack notifications for your team
4. **Customize Settings**: Adjust security thresholds and scan intervals
5. **Deploy to Production**: Follow deployment guide for your platform

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.2.0 | 2025-07-28 | Real API integrations, browser compatibility fixes |
| 3.1.0 | 2025-07-27 | Enhanced monitoring and governance features |
| 3.0.0 | 2025-07-26 | Major architecture overhaul with microservices |

---

**Happy Coding! 🚀**

For support and questions, please check our [GitHub Discussions](https://github.com/TechTyphoon/secure-flow-automaton/discussions) or create an [issue](https://github.com/TechTyphoon/secure-flow-automaton/issues).
