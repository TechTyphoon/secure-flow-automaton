# Jenkins Configuration for SecureFlow Automaton

## Overview
This directory contains Jenkins configuration files for setting up comprehensive CI/CD pipeline for SecureFlow Automaton.

## Files Structure
```
jenkins/
├── README.md                      # This file
├── jenkins.yaml                   # Jenkins as Code (JCasC) configuration
├── plugins.txt                    # Required Jenkins plugins
├── seed-job.groovy               # Job DSL seed job
├── shared-library/               # Shared pipeline library
│   ├── vars/
│   │   ├── secureFlowPipeline.groovy
│   │   ├── deployToK8s.groovy
│   │   └── notifySlack.groovy
│   └── src/
└── multibranch-pipeline.xml      # Multibranch pipeline configuration

## Setup Instructions

### 1. Install Required Plugins
```bash
# Install plugins from plugins.txt
jenkins-plugin-cli --plugin-file jenkins/plugins.txt
```

### 2. Configure Jenkins as Code (JCasC)
```bash
# Set CASC_JENKINS_CONFIG environment variable
export CASC_JENKINS_CONFIG=/var/jenkins_home/casc_configs/jenkins.yaml

# Copy configuration file
cp jenkins/jenkins.yaml /var/jenkins_home/casc_configs/
```

### 3. Setup Credentials
Add the following credentials in Jenkins:
- `github-token`: GitHub Personal Access Token
- `docker-hub-credentials`: Docker Hub username/password
- `sonarcloud-token`: SonarCloud authentication token
- `snyk-token`: Snyk authentication token
- `slack-webhook`: Slack webhook URL for notifications
- `staging-server`: Staging server SSH credentials
- `production-server`: Production server SSH credentials

### 4. Create Multibranch Pipeline
1. Go to Jenkins → New Item
2. Select "Multibranch Pipeline"
3. Name it "SecureFlow-Automaton"
4. Configure Branch Sources:
   - GitHub repository: `https://github.com/TechTyphoon/secure-flow-automaton`
   - Credentials: Select your GitHub credentials
   - Behaviors: Add "Discover branches" and "Discover pull requests"

### 5. Configure Webhooks
Add webhook in GitHub repository settings:
- URL: `https://your-jenkins-url/github-webhook/`
- Content type: `application/json`
- Events: Push, Pull requests

## Pipeline Features

### 🔒 Security Features
- **Dependency Scanning**: npm audit, audit-ci, Snyk
- **Container Security**: Trivy image scanning
- **Code Quality**: SonarCloud analysis
- **Security Linting**: ESLint security rules
- **Vulnerability Thresholds**: Configurable security gates

### 🚀 Deployment Features
- **Multi-Environment**: Staging and Production deployments
- **Manual Approval**: Production deployment requires approval
- **Blue-Green Deployment**: Zero-downtime deployments
- **Health Checks**: Automated post-deployment verification
- **Rollback Capability**: Automated rollback on failure

### 📊 Quality Gates
- **Code Coverage**: Minimum 80% coverage requirement
- **Type Safety**: TypeScript compilation checks
- **Linting**: ESLint with security rules
- **Testing**: Unit and integration tests
- **Performance**: Performance testing validation

### 📢 Notifications
- **Slack Integration**: Real-time notifications
- **Email Alerts**: Failure and success notifications
- **Build Status**: GitHub commit status updates
- **Metrics**: Build duration and success rate tracking

## Environment Variables

### Required Environment Variables
```bash
# GitHub Configuration
GITHUB_TOKEN=your_github_token

# Docker Configuration
DOCKER_REGISTRY=docker.io
DOCKER_IMAGE=secureflow-automaton

# Security Tools
SONARCLOUD_TOKEN=your_sonarcloud_token
SNYK_TOKEN=your_snyk_token

# Deployment
STAGING_SERVER=staging.secureflow.com
PRODUCTION_SERVER=secureflow.com

# Notifications
SLACK_WEBHOOK=your_slack_webhook_url
EMAIL_RECIPIENTS=dev-team@secureflow.com
```

### Optional Environment Variables
```bash
# Quality Gates
COVERAGE_THRESHOLD=80
VULNERABILITY_THRESHOLD=high

# Build Configuration
NODE_VERSION=18
DOCKER_TAG_PREFIX=v

# Deployment Strategy
DEPLOYMENT_TYPE=blue-green
HEALTH_CHECK_TIMEOUT=300
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Ensure Jenkins user has Docker permissions
   - Check file permissions on workspace

2. **Plugin Missing Errors**
   - Verify all plugins are installed from plugins.txt
   - Restart Jenkins after plugin installation

3. **Credential Issues**
   - Verify all credentials are properly configured
   - Test credential access in Jenkins

4. **Network Issues**
   - Check firewall settings for external API calls
   - Verify webhook URLs are accessible

### Debug Commands
```bash
# Check Jenkins logs
tail -f /var/jenkins_home/jenkins.log

# Test Docker connection
docker ps

# Test GitHub API access
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Test SonarCloud connection
curl -H "Authorization: Bearer $SONARCLOUD_TOKEN" https://sonarcloud.io/api/projects/search
```

## Performance Optimization

### Build Performance
- **Node.js Cache**: Cache node_modules between builds
- **Docker Layer Cache**: Use multi-stage builds
- **Parallel Execution**: Run tests and scans in parallel
- **Incremental Builds**: Only rebuild changed components

### Resource Management
- **Build Agents**: Use dedicated agents for different stages
- **Memory Limits**: Set appropriate memory limits
- **Cleanup**: Regular cleanup of old builds and artifacts
- **Monitoring**: Monitor resource usage and build times

## Security Best Practices

### Credential Management
- Use Jenkins credential store
- Rotate credentials regularly
- Use least privilege principle
- Audit credential access

### Pipeline Security
- Scan all dependencies
- Use approved base images
- Implement security gates
- Regular security updates

### Access Control
- Role-based access control
- Multi-factor authentication
- Audit logging
- Regular access reviews

## Maintenance

### Regular Tasks
- Update plugins monthly
- Review and update security policies
- Monitor build performance
- Clean up old builds and artifacts

### Backup Strategy
- Backup Jenkins configuration
- Backup job configurations
- Backup credentials (encrypted)
- Test restore procedures

## Support

For issues and questions:
1. Check Jenkins logs
2. Review pipeline console output
3. Consult troubleshooting section
4. Contact DevOps team

## References
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins as Code](https://github.com/jenkinsci/configuration-as-code-plugin)
- [Job DSL Plugin](https://github.com/jenkinsci/job-dsl-plugin)
- [Docker Pipeline Plugin](https://github.com/jenkinsci/docker-workflow-plugin)
