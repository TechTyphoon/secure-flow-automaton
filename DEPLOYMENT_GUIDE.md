# 🚀 SecureFlow Automaton - Complete Deployment Guide

This guide provides comprehensive instructions for deploying the SecureFlow Automaton application with integrated monitoring and CI/CD automation.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [CI/CD Deployment](#cicd-deployment)
- [Manual Deployment](#manual-deployment)
- [Monitoring Setup](#monitoring-setup)
- [Backup & Recovery](#backup--recovery)
- [Health Monitoring](#health-monitoring)
- [Troubleshooting](#troubleshooting)
- [Production Checklist](#production-checklist)

## 🚀 Quick Start

### One-Command Deployment (CI/CD)

```bash
# Trigger automated deployment with monitoring
git push origin main

# Or use GitHub Actions dispatch
# Go to Actions → "CI/CD with Monitoring" → "Run workflow"
```

### Manual Deployment

```bash
# 1. Clone and setup
git clone <repository>
cd secureflow-automaton
npm install

# 2. Deploy with monitoring
npm run deploy:with-monitoring

# 3. Access services
# Application: http://localhost:8080
# Monitoring: http://localhost:3002
# Grafana: http://localhost:3000
```

## 📋 Prerequisites

### System Requirements

- **Docker & Docker Compose** (v20.10+)
- **Node.js** (v18+)
- **Git** (v2.30+)
- **4GB RAM minimum** (8GB recommended)
- **10GB disk space**

### Environment Setup

```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### Network Configuration

Ensure these ports are available:
- `3000` - Grafana
- `3002` - Monitoring Dashboard
- `8080` - Application/API
- `9090` - Prometheus
- `9093` - Alertmanager
- `9100` - Node Exporter

## 🔄 CI/CD Deployment

### GitHub Actions Workflow

The `ci-cd-with-monitoring.yml` workflow provides complete automation:

```yaml
# Triggers
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch

# Jobs
├── quality-gate          # Code quality & testing
├── security-scan          # Security validation
├── monitoring-validation  # Monitoring config validation
├── build-application      # Build application & monitoring image
├── deploy-monitoring      # Deploy monitoring infrastructure
├── deploy-application     # Deploy main application
├── post-deployment-validation # Final health checks
└── deployment-summary     # Results summary
```

### Workflow Configuration

#### Required Secrets (GitHub Repository)

```bash
# Repository Settings → Secrets and variables → Actions

# Docker Registry
DOCKER_USERNAME: your-dockerhub-username
DOCKER_PASSWORD: your-dockerhub-password

# Monitoring Configuration
GRAFANA_ADMIN_PASSWORD: your-secure-grafana-password
SMTP_PASSWORD: your-smtp-password
SLACK_WEBHOOK_URL: https://hooks.slack.com/services/YOUR/WEBHOOK

# Security Scanning
SONARQUBE_TOKEN: your-sonarqube-token
SNYK_TOKEN: your-snyk-token
```

#### Environment Variables

```bash
# .env.monitoring (create this file)
GRAFANA_ADMIN_PASSWORD=your_secure_password
SMTP_PASSWORD=your_smtp_password
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
NODE_ENV=production
API_BASE_URL=http://api-server:8080/api/v1
```

### Deployment Steps

1. **Push to Main Branch**
   ```bash
   git add .
   git commit -m "Deploy with monitoring"
   git push origin main
   ```

2. **Monitor Deployment**
   - Go to GitHub Actions tab
   - Select "CI/CD with Monitoring" workflow
   - Watch real-time deployment progress

3. **Access Deployed Services**
   ```
   📱 Application:     https://yourdomain.com
   📊 Monitoring:      https://monitoring.yourdomain.com
   📈 Grafana:         https://grafana.yourdomain.com
   📋 Prometheus:      https://prometheus.yourdomain.com
   ```

## 🔧 Manual Deployment

### Step 1: Environment Setup

```bash
# Clone repository
git clone <repository>
cd secureflow-automaton

# Install dependencies
npm install

# Setup monitoring dependencies
npm run monitoring:setup

# Validate configurations
npm run monitoring:validate
```

### Step 2: Configuration

```bash
# Create monitoring environment file
cp docs/api/test-env-config.md .env.monitoring
# Edit .env.monitoring with your actual values

# Validate configuration
./scripts/deployment/deploy-monitoring.sh check
```

### Step 3: Deploy Monitoring Infrastructure

```bash
# Deploy monitoring stack
npm run monitoring:deploy

# Or use the deployment script directly
./scripts/deployment/deploy-monitoring.sh

# Wait for services to be healthy
sleep 60

# Verify deployment
npm run monitoring:health
```

### Step 4: Deploy Application

```bash
# Build application
npm run build

# Deploy application (GitHub Pages example)
npm run preview &
# Or deploy to your preferred hosting platform
```

### Step 5: Integration Testing

```bash
# Test monitoring functionality
npm run monitoring:test

# Test API integration
npm run test:api http://localhost:8080/api/v1

# Run full integration test
npm run test:integration
```

## 📊 Monitoring Setup

### Automated Setup

```bash
# One-command monitoring deployment
npm run monitoring:deploy

# Check monitoring status
npm run monitoring:status

# View monitoring logs
npm run monitoring:logs api-monitoring
```

### Manual Setup

```bash
# Start individual services
docker-compose -f docker-compose.monitoring.yml up -d prometheus
docker-compose -f docker-compose.monitoring.yml up -d grafana
docker-compose -f docker-compose.monitoring.yml up -d api-monitoring

# Initialize Grafana
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{"name":"admin","password":"admin_password"}'
```

### Grafana Configuration

1. **Access Grafana**: http://localhost:3000
2. **Login**: admin / your-configured-password
3. **Import Dashboard**:
   - Go to Dashboards → Import
   - Upload `docs/monitoring/grafana-dashboard.json`
   - Select Prometheus as data source

### Alert Configuration

```yaml
# Configure alerts in Alertmanager
# File: docs/monitoring/alertmanager.yml

# Email notifications
receivers:
  - name: 'team'
    email_configs:
      - to: 'team@yourdomain.com'

# Slack notifications
slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#alerts'
```

## 💾 Backup & Recovery

### Automated Backup

```bash
# Create backup
npm run backup:monitoring

# List available backups
./scripts/deployment/monitoring-backup.sh list

# Schedule automated backups (add to crontab)
# 0 2 * * * /path/to/project/npm run backup:monitoring
```

### Manual Backup

```bash
# Full backup with timestamp
./scripts/deployment/monitoring-backup.sh backup

# Backup specific components
docker run --rm -v secureflow-prometheus-data:/data -v $(pwd)/backup:/backup alpine tar czf /backup/prometheus-$(date +%Y%m%d).tar.gz -C /data .
```

### Recovery

```bash
# List available backups
./scripts/deployment/monitoring-backup.sh list

# Restore from backup
./scripts/deployment/monitoring-backup.sh restore monitoring_backup_20240101_120000

# Restore specific components
docker run --rm -v secureflow-prometheus-data:/data -v $(pwd)/backup:/backup alpine tar xzf /backup/prometheus-20240101.tar.gz -C /data
```

### Backup Strategy

- **Daily**: Automated volume backups
- **Weekly**: Full configuration backups
- **Monthly**: Offsite backup storage
- **Retention**: 30 days for daily, 1 year for monthly

## ❤️ Health Monitoring

### Health Check Commands

```bash
# Quick health check
npm run health:check

# Detailed monitoring health
./scripts/deployment/monitoring-health-check.sh

# Service-specific health
curl http://localhost:3002/health  # Monitoring dashboard
curl http://localhost:3000/api/health  # Grafana
curl http://localhost:9090/-/healthy  # Prometheus
```

### Health Check Results

```
📊 Monitoring Health Check Summary
==================================
✅ Overall Status: HEALTHY

📋 Detailed Results:
  ✅ Service api-monitoring is running
  ✅ Service prometheus is running
  ✅ Service grafana is running
  ✅ Monitoring dashboard is accessible
  ✅ Prometheus is accessible
  ✅ Grafana is accessible
```

### Monitoring Metrics

- **System Health**: API availability, response times
- **Performance**: Throughput, error rates, latency
- **Resources**: CPU, memory, disk usage
- **Security**: Authentication failures, suspicious activity
- **Business**: User sessions, data processing rates

## 🔧 Troubleshooting

### Common Issues

#### Monitoring Services Not Starting

```bash
# Check Docker status
docker ps -a | grep monitoring

# View service logs
npm run monitoring:logs

# Restart services
docker-compose -f docker-compose.monitoring.yml restart

# Check port conflicts
netstat -tlnp | grep -E ':(3000|3002|9090|9093)'
```

#### Application Not Connecting to Monitoring

```bash
# Verify API server is running
curl http://localhost:8080/health

# Check monitoring configuration
cat .env.monitoring

# Test connectivity
docker exec api-monitoring curl http://api-server:8080/health
```

#### Grafana Dashboard Not Loading

```bash
# Check Grafana status
curl http://localhost:3000/api/health

# Verify Prometheus connection
curl http://localhost:9090/api/v1/query?query=up

# Re-import dashboard
curl -X POST http://localhost:3000/api/dashboards/import \
  -H "Content-Type: application/json" \
  -d @docs/monitoring/grafana-dashboard.json
```

#### High Memory Usage

```bash
# Monitor container resources
docker stats

# Check Prometheus configuration
cat docs/monitoring/prometheus.yml

# Adjust memory limits
docker-compose -f docker-compose.monitoring.yml up -d --scale prometheus=2
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=monitoring:*

# Start services in debug mode
docker-compose -f docker-compose.monitoring.yml up --scale api-monitoring=1

# View detailed logs
docker-compose -f docker-compose.monitoring.yml logs -f --tail=100
```

### Performance Optimization

```bash
# Adjust collection intervals
# Edit docs/monitoring/metrics-collector.js
collectionInterval: 60000  # Increase from 30s to 60s

# Reduce retention period
retentionPeriod: 1800000  # Reduce from 1h to 30min

# Limit concurrent connections
# Edit docker-compose.monitoring.yml
environment:
  - MAX_CONNECTIONS=100
```

## 📋 Production Checklist

### Pre-Deployment

- [ ] **Environment Setup**
  - [ ] Docker and Docker Compose installed
  - [ ] Required ports available
  - [ ] Sufficient disk space (10GB+)
  - [ ] Network connectivity configured

- [ ] **Configuration**
  - [ ] `.env.monitoring` file created with secure passwords
  - [ ] Domain names configured
  - [ ] SSL certificates obtained
  - [ ] SMTP configuration tested

- [ ] **Security**
  - [ ] Grafana admin password set
  - [ ] Alertmanager notifications configured
  - [ ] Firewall rules applied
  - [ ] Access controls implemented

### Deployment

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions secrets configured
  - [ ] Workflow files committed
  - [ ] Branch protection rules set

- [ ] **Monitoring Stack**
  - [ ] Docker images built successfully
  - [ ] Services start without errors
  - [ ] Health checks pass
  - [ ] Grafana dashboard imported

- [ ] **Integration Testing**
  - [ ] API endpoints accessible
  - [ ] Monitoring data collection working
  - [ ] Alerts configured and tested
  - [ ] Backup system operational

### Post-Deployment

- [ ] **Monitoring**
  - [ ] Grafana dashboards accessible
  - [ ] Prometheus metrics collecting
  - [ ] Alert notifications working
  - [ ] Log aggregation configured

- [ ] **Documentation**
  - [ ] Runbooks created
  - [ ] Team access configured
  - [ ] Monitoring training completed
  - [ ] Incident response procedures documented

- [ ] **Maintenance**
  - [ ] Backup schedule configured
  - [ ] Update procedures documented
  - [ ] Monitoring of monitoring system
  - [ ] Performance baselines established

## 🎯 Next Steps

### Immediate Actions
1. **Deploy monitoring infrastructure**: `npm run monitoring:deploy`
2. **Configure alerts**: Update `docs/monitoring/alertmanager.yml`
3. **Set up backups**: `npm run backup:monitoring`
4. **Test integration**: `npm run test:integration`

### Medium-term Goals
1. **SSL Configuration**: Set up HTTPS certificates
2. **Domain Setup**: Configure custom domain names
3. **Team Training**: Train team on monitoring usage
4. **Alert Tuning**: Fine-tune alert thresholds

### Long-term Optimization
1. **Scalability**: Implement horizontal scaling
2. **High Availability**: Set up multi-node deployment
3. **Advanced Analytics**: Implement custom dashboards
4. **Integration**: Connect with existing infrastructure

## 📞 Support

### Documentation Links
- [Monitoring Setup Guide](docs/monitoring/README.md)
- [API Documentation](docs/api/README.md)
- [Deployment Scripts](scripts/deployment/)
- [GitHub Actions](.github/workflows/)

### Useful Commands
```bash
# Quick status check
npm run monitoring:status

# Health verification
npm run health:check

# View logs
npm run monitoring:logs

# Create backup
npm run backup:monitoring

# Emergency restart
docker-compose -f docker-compose.monitoring.yml restart
```

---

## 🎉 Ready for Production!

Your SecureFlow Automaton is now equipped with comprehensive monitoring and automated deployment capabilities. The system will automatically:

- ✅ **Monitor API performance** in real-time
- ✅ **Alert on issues** before they impact users
- ✅ **Collect metrics** for analysis and optimization
- ✅ **Deploy automatically** with full CI/CD integration
- ✅ **Backup critical data** for disaster recovery
- ✅ **Scale with demand** through container orchestration

**🚀 Happy monitoring and deploying!**
