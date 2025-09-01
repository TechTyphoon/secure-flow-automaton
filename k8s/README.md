# Kubernetes Deployment Guide for SecureFlow Automaton

This directory contains comprehensive Kubernetes manifests for deploying SecureFlow Automaton across different environments using both Kustomize and Helm.

## 📋 Prerequisites

- Kubernetes cluster (v1.19+)
- kubectl configured to access your cluster
- Helm 3.x (for Helm deployments)
- Kustomize 3.8+ (for Kustomize deployments)

## 🚀 Quick Start

### Option 1: Helm Deployment (Recommended)

```bash
# Add the repository (if published)
helm repo add secureflow https://charts.secureflow.dev
helm repo update

# Install with default values
helm install secureflow secureflow/secureflow-automaton

# Install with custom values
helm install secureflow secureflow/secureflow-automaton -f values-production.yaml
```

### Option 2: Kustomize Deployment

```bash
# Deploy to development
kubectl apply -k k8s/overlays/dev/

# Deploy to staging
kubectl apply -k k8s/overlays/staging/

# Deploy to production
kubectl apply -k k8s/overlays/prod/
```

## 📁 Directory Structure

```
k8s/
├── base/                    # Base Kubernetes manifests
│   ├── namespace.yaml      # Namespace definition
│   ├── configmap.yaml      # Application configuration
│   ├── secret.yaml         # Sensitive configuration
│   ├── service-account.yaml # RBAC service account
│   ├── pvc.yaml           # Persistent volume claims
│   ├── deployment.yaml    # Main application deployment
│   ├── service.yaml       # Service definition
│   ├── ingress.yaml       # Ingress configuration
│   ├── hpa.yaml          # Horizontal pod autoscaler
│   ├── network-policy.yaml # Network security policies
│   └── kustomization.yaml  # Base kustomization
├── overlays/              # Environment-specific overlays
│   ├── dev/              # Development environment
│   ├── staging/          # Staging environment
│   └── prod/             # Production environment
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node.js environment | `production` |
| `PORT` | Application port | `8080` |
| `SECURITY_LEVEL` | Security level | `high` |
| `LOG_LEVEL` | Logging level | `info` |
| `MAX_WORKERS` | Maximum worker threads | `4` |
| `QUANTUM_FEATURES_ENABLED` | Enable quantum features | `true` |

### Secrets Required

Create these secrets before deployment:

```bash
# For Helm
kubectl create secret generic secureflow-secrets \
  --from-literal=sonar-token=your-sonar-token \
  --from-literal=snyk-token=your-snyk-token \
  --from-literal=jwt-secret=your-jwt-secret

# For Kustomize
kubectl apply -f k8s/overlays/prod/secrets-prod.yaml
```

## 🎯 Deployment Strategies

### Development Deployment

```bash
# Quick dev deployment
kubectl apply -k k8s/overlays/dev/

# Check deployment status
kubectl get pods -n secureflow-automaton-dev
kubectl logs -f deployment/secureflow-automaton -n secureflow-automaton-dev
```

### Production Deployment

```bash
# Apply production overlay
kubectl apply -k k8s/overlays/prod/

# Verify deployment
kubectl get all -n secureflow-automaton-prod
kubectl get ingress -n secureflow-automaton-prod
```

### Helm Production Deployment

```bash
# Create production values file
cat > production-values.yaml << EOF
replicaCount: 5
image:
  tag: v4.1.0

ingress:
  enabled: true
  hosts:
    - host: secureflow.yourcompany.com
      paths:
        - path: /
          pathType: Prefix

securityTools:
  sonar:
    token: "your-production-sonar-token"
  snyk:
    token: "your-production-snyk-token"
  jwt:
    secret: "your-production-jwt-secret"
EOF

# Deploy with production values
helm install secureflow ./helm/secureflow-automaton -f production-values.yaml
```

## 🔍 Monitoring & Troubleshooting

### Check Pod Status

```bash
# Get all pods
kubectl get pods -n secureflow-automaton

# Get detailed pod information
kubectl describe pod <pod-name> -n secureflow-automaton

# View logs
kubectl logs -f <pod-name> -n secureflow-automaton
```

### Check Services

```bash
# Get services
kubectl get services -n secureflow-automaton

# Check service endpoints
kubectl get endpoints -n secureflow-automaton
```

### Check Ingress

```bash
# Get ingress
kubectl get ingress -n secureflow-automaton

# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## 🔒 Security Features

### Network Policies
- Zero-trust networking with strict ingress/egress rules
- Pod-to-pod communication restrictions
- External access limited to ingress controller

### RBAC Configuration
- Minimal service account permissions
- Least-privilege access principles
- Secret access restricted to specific pods

### Security Contexts
- Non-root container execution
- Read-only root filesystem
- Dropped capabilities
- Resource limits and requests

## 📊 Scaling

### Horizontal Pod Autoscaling

The deployment includes HPA configuration for automatic scaling:

```yaml
# Scales based on CPU (70%) and Memory (80%) utilization
# Min: 3 replicas, Max: 20 replicas
```

### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment secureflow-automaton --replicas=10 -n secureflow-automaton

# Scale via Helm
helm upgrade secureflow ./helm/secureflow-automaton --set replicaCount=10
```

## 🔄 Updates & Rollbacks

### Rolling Updates

```bash
# Update image
kubectl set image deployment/secureflow-automaton secureflow-automaton=secureflow-automaton:v4.2.0 -n secureflow-automaton

# Check rollout status
kubectl rollout status deployment/secureflow-automaton -n secureflow-automaton
```

### Rollbacks

```bash
# Rollback to previous version
kubectl rollout undo deployment/secureflow-automaton -n secureflow-automaton

# Rollback to specific revision
kubectl rollout undo deployment/secureflow-automaton --to-revision=2 -n secureflow-automaton
```

## 📈 Monitoring & Observability

### Metrics Endpoints

The application exposes metrics at `/metrics` endpoint for Prometheus:

```bash
# Port forward to access metrics
kubectl port-forward svc/secureflow-automaton 8080:80 -n secureflow-automaton

# Access metrics
curl http://localhost:8080/metrics
```

### Health Checks

- Readiness probe: `/ready`
- Liveness probe: `/health`
- Startup probe: `/health`

## 🗂️ Backup & Recovery

### Database Backup

```bash
# Create database backup job
kubectl apply -f k8s/jobs/backup-job.yaml

# List backup jobs
kubectl get jobs -n secureflow-automaton
```

### Configuration Backup

```bash
# Backup all resources
kubectl get all -n secureflow-automaton -o yaml > backup-$(date +%Y%m%d).yaml
```

## 🆘 Troubleshooting

### Common Issues

1. **Pods not starting**
   ```bash
   kubectl describe pod <pod-name> -n secureflow-automaton
   kubectl logs <pod-name> -n secureflow-automaton
   ```

2. **Service not accessible**
   ```bash
   kubectl get endpoints -n secureflow-automaton
   kubectl describe service secureflow-automaton -n secureflow-automaton
   ```

3. **Ingress not working**
   ```bash
   kubectl get ingress -n secureflow-automaton
   kubectl describe ingress secureflow-automaton -n secureflow-automaton
   ```

### Debug Commands

```bash
# Exec into pod
kubectl exec -it <pod-name> -n secureflow-automaton -- /bin/bash

# Check environment variables
kubectl exec <pod-name> -n secureflow-automaton -- env

# Check network connectivity
kubectl exec <pod-name> -n secureflow-automaton -- curl -v secureflow-automaton:80
```

## 📞 Support

For issues and questions:
- 📧 Email: support@techtyphoon.com
- 📚 Documentation: https://docs.secureflow.dev
- 🐛 Issues: https://github.com/TechTyphoon/secure-flow-automaton/issues

---

## 🎯 Next Steps

After successful deployment:

1. ✅ **Verify Application Health**
   ```bash
   curl https://your-domain.com/health
   ```

2. ✅ **Configure External DNS**
   - Point your domain to the ingress load balancer
   - Verify SSL certificate generation

3. ✅ **Set up Monitoring**
   - Configure Prometheus scraping
   - Set up Grafana dashboards
   - Configure alerting rules

4. ✅ **Configure Backup**
   - Set up automated database backups
   - Configure log aggregation
   - Set up disaster recovery procedures

5. ✅ **Security Hardening**
   - Implement network policies
   - Configure RBAC
   - Set up security scanning
