# SecureFlow Automaton - Production Deployment Guide

## Prerequisites

### System Requirements
- **Operating System**: Ubuntu 20.04+ LTS, RHEL 8+, or compatible Linux
- **Container Runtime**: Docker 20.10+, containerd 1.5+
- **Orchestration**: Kubernetes 1.21+ (production), Docker Compose (development)
- **Resources**: Minimum 16GB RAM, 8 CPU cores, 100GB SSD storage

### Required Services
- PostgreSQL 13+ (primary database)
- Redis 6.2+ (caching and sessions)
- Elasticsearch 7.10+ (logging and analytics)
- Prometheus 2.30+ (metrics)
- Grafana 8.0+ (visualization)

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/secureflow/secure-flow-automaton.git
cd secure-flow-automaton
```

### 2. Configure Environment

```bash
# Copy production configuration template
cp .env.production.example .env.production

# Edit configuration with your values
nano .env.production
```

Required environment variables:
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/secureflow
REDIS_URL=redis://host:6379/0

# Security
JWT_SECRET=<generate-secure-secret>
ENCRYPTION_KEY=<32-byte-key>

# API Keys (for integrations)
GITHUB_TOKEN=<your-github-token>
SONARQUBE_TOKEN=<your-sonarqube-token>
SNYK_TOKEN=<your-snyk-token>
```

### 3. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Verify database connection
npm run db:test
```

### 4. Build Application

```bash
# Install dependencies
npm install --production

# Build production bundle
npm run build:prod

# Verify build
ls -la dist/
```

## Deployment Options

### Option A: Kubernetes Deployment (Recommended for Production)

```bash
# Create namespace
kubectl create namespace secureflow

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Verify deployment
kubectl get pods -n secureflow
kubectl get svc -n secureflow
```

### Option B: Docker Compose (Development/Staging)

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Verify containers
docker-compose ps

# View logs
docker-compose logs -f
```

### Option C: Bare Metal Installation

```bash
# Install Node.js dependencies
npm install --production

# Build application
npm run build:prod

# Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

## Post-Deployment Configuration

### 1. Initialize Security Services

```bash
# Initialize security scanning
curl -X POST https://your-domain.com/api/security/initialize \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Configure Integrations

```bash
# Configure GitHub integration
curl -X POST https://your-domain.com/api/integrations/github \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"token":"'$GITHUB_TOKEN'","org":"your-org"}'

# Configure SonarQube
curl -X POST https://your-domain.com/api/integrations/sonarqube \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"url":"https://sonarcloud.io","token":"'$SONAR_TOKEN'"}'
```

### 3. Set Up Monitoring

```bash
# Configure Prometheus scraping
kubectl apply -f monitoring/prometheus-config.yaml

# Import Grafana dashboards
kubectl apply -f monitoring/grafana-dashboards.yaml
```

## Health Checks

### Application Health
```bash
curl https://your-domain.com/api/health
```

### Database Connection
```bash
curl https://your-domain.com/api/health/db
```

### Security Services
```bash
curl https://your-domain.com/api/health/security
```

## Security Hardening

### SSL/TLS Configuration
```bash
# Generate certificates (production should use proper CA)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Configure in nginx/ingress
kubectl create secret tls secureflow-tls --cert=cert.pem --key=key.pem -n secureflow
```

### Network Policies
```bash
# Apply network segmentation
kubectl apply -f k8s/network-policies/
```

### Security Headers
Ensure these headers are configured in your reverse proxy:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Backup and Recovery

### Database Backup
```bash
# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup (cron)
0 2 * * * /usr/local/bin/backup-database.sh
```

### Application Backup
```bash
# Backup configuration and data
tar -czf backup_$(date +%Y%m%d).tar.gz config/ data/ .env.production
```

### Recovery Procedure
```bash
# Restore database
psql $DATABASE_URL < backup.sql

# Restore application
tar -xzf backup.tar.gz
docker-compose restart
```

## Monitoring and Maintenance

### Log Management
```bash
# View application logs
kubectl logs -f deployment/secureflow-api -n secureflow

# View aggregated logs in Elasticsearch
curl -X GET "localhost:9200/secureflow-*/_search?pretty"
```

### Performance Monitoring
- CPU/Memory: Monitor via Prometheus/Grafana
- Database: Use pg_stat_statements
- API Response Times: Track p50, p95, p99 latencies

### Updates and Patches
```bash
# Update application
git pull origin main
npm install --production
npm run build:prod
kubectl rollout restart deployment/secureflow-api -n secureflow

# Update dependencies
npm audit fix --production
npm update --production
```

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check database status
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1"

# Check connection string
echo $DATABASE_URL
```

#### High Memory Usage
```bash
# Check memory usage
kubectl top pods -n secureflow

# Increase memory limits
kubectl edit deployment secureflow-api -n secureflow
```

#### Service Unavailable
```bash
# Check pod status
kubectl describe pod <pod-name> -n secureflow

# Check service endpoints
kubectl get endpoints -n secureflow
```

## Support

- Documentation: https://docs.secureflow.com
- Support Email: support@secureflow.com
- Emergency: security@secureflow.com
- Status Page: https://status.secureflow.com

---

© 2025 SecureFlow Automaton. Production deployment guide.