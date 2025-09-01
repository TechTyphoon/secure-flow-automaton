# 🔍 API Monitoring Dashboard

Real-time API monitoring and visualization platform for the Secure Flow Automaton with comprehensive metrics collection, alerting, and interactive dashboards.

## 🌟 Features

- **📊 Real-Time Metrics** - Live API performance monitoring with WebSocket updates
- **📈 Interactive Dashboards** - Modern web-based dashboard with charts and alerts
- **🚨 Intelligent Alerting** - Configurable alerts for performance and security issues
- **📋 Comprehensive Testing** - Automated API testing with monitoring integration
- **🔧 Grafana Integration** - Advanced visualization with Grafana dashboards
- **📚 Complete Documentation** - Auto-generated setup and usage guides

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install monitoring dependencies
npm run monitoring:setup

# Validate monitoring components
npm run monitoring:validate
```

### 2. Start the Monitoring Dashboard

```bash
# Start the real-time dashboard
npm run monitoring:start

# Access the dashboard at: http://localhost:3002
```

### 3. View Real-Time Metrics

Open your browser to `http://localhost:3002` to see:
- ✅ **System Health** - API status and uptime
- ⚡ **Response Times** - Average and percentile metrics
- 📈 **Throughput** - Requests per second
- 🚨 **Error Rates** - API error percentages
- 🔗 **Endpoint Performance** - Individual endpoint metrics
- 📢 **Active Alerts** - Real-time notifications

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Server    │───▶│ Metrics Collector │───▶│  Dashboard UI   │
│   (Port 8080)   │    │  (Real-time)     │    │  (Port 3002)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Prometheus    │    │    Alertmanager  │    │    Grafana       │
│  (Port 9090)    │    │   (Port 9093)    │    │   (Port 3000)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📊 Core Components

### 1. Metrics Collector (`metrics-collector.js`)
Real-time collection of API performance metrics:

```javascript
import APIMetricsCollector from './docs/monitoring/metrics-collector.js';

const collector = new APIMetricsCollector({
  baseURL: 'http://localhost:8080/api/v1',
  collectionInterval: 30000, // 30 seconds
  maxMetricsPerEndpoint: 1000
});

collector.startCollection();

// Listen for real-time updates
collector.on('metrics-updated', (metrics) => {
  console.log('📊 New metrics:', metrics);
});
```

**Collected Metrics:**
- System health and uptime
- API response times and throughput
- Endpoint-specific performance
- Error rates and success rates
- Memory and CPU usage
- Security events and alerts

### 2. Dashboard Server (`dashboard-server.js`)
WebSocket-based real-time dashboard server:

```javascript
import APIMonitoringDashboard from './docs/monitoring/dashboard-server.js';

const dashboard = new APIMonitoringDashboard({
  port: 3002,
  apiBaseURL: 'http://localhost:8080/api/v1'
});

await dashboard.start();
```

**Features:**
- Real-time WebSocket updates
- REST API for metrics access
- Alert broadcasting
- Performance statistics
- Historical data retrieval

### 3. Interactive Dashboard (`public/index.html`)
Modern web interface with real-time charts:

- **Live Charts** - Response times, throughput, error rates
- **System Metrics** - Health status, memory usage, uptime
- **Endpoint Monitoring** - Individual endpoint performance
- **Alert Management** - Real-time alert notifications
- **Time Range Selection** - Historical data analysis

## 📈 Grafana Integration

### Import Dashboard

1. **Start Grafana:**
   ```bash
   docker run -d -p 3000:3000 grafana/grafana
   ```

2. **Configure Prometheus Data Source:**
   - URL: `http://localhost:9090`
   - Access: `Browser`

3. **Import Dashboard:**
   - File: `docs/monitoring/grafana-dashboard.json`
   - Data Source: `Prometheus`

### Dashboard Panels

- **📊 System Health Overview** - API status and uptime
- **⚡ Response Time Distribution** - Performance histograms
- **📈 Requests by Status Code** - Error analysis
- **🔗 Endpoint Performance** - Individual endpoint metrics
- **🧠 Memory & CPU Usage** - Resource monitoring
- **🚨 Security Events** - Threat detection
- **📋 Top Slow Endpoints** - Performance bottlenecks

## 🚨 Alerting System

### Alert Categories

#### Performance Alerts
- **High Response Time** (> 1 second average)
- **Critical Response Time** (> 2 seconds average)
- **High Error Rate** (> 5% errors)
- **Critical Error Rate** (> 15% errors)
- **Slow Endpoint** (> 5 seconds 95th percentile)

#### System Alerts
- **API Unavailable** - Service down detection
- **High Memory Usage** (> 85% usage)
- **Critical Memory Usage** (> 95% usage)
- **High CPU Usage** (> 85% usage)
- **Disk Space Low** (< 10% available)

#### Security Alerts
- **Authentication Failures** (> 10 per minute)
- **Suspicious Activity** (> 5 per minute)
- **SQL Injection Attempts** - Attack detection
- **XSS Attempts** - Script injection detection
- **Brute Force Attacks** - Failed login spikes

### Alertmanager Configuration

```yaml
# Configure notification channels
global:
  smtp_smarthost: 'smtp.company.com:587'
  smtp_from: 'alerts@company.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'team-notifications'

receivers:
  - name: 'team-notifications'
    email_configs:
      - to: 'team@company.com'
```

## 🔧 Configuration

### Environment Variables

```bash
# Monitoring Configuration
MONITORING_PORT=3002
API_BASE_URL=http://localhost:8080/api/v1
COLLECTION_INTERVAL=30000
METRICS_RETENTION=3600000

# Grafana Configuration
GRAFANA_URL=http://localhost:3000
GRAFANA_API_KEY=your-api-key

# Alerting Configuration
ALERTMANAGER_URL=http://localhost:9093
SMTP_SERVER=smtp.company.com
ALERT_EMAIL=alerts@company.com
```

### Custom Metrics

Add custom metrics collection:

```javascript
// In metrics-collector.js
async collectCustomMetrics(timestamp) {
  // Business-specific metrics
  const userSessions = await this.getActiveUserSessions();
  const dataProcessed = await this.getDataProcessingStats();

  this.metrics.business = {
    activeUsers: userSessions,
    dataProcessed: dataProcessed,
    timestamp
  };
}
```

## 📋 API Endpoints

### Dashboard Server API

```bash
# Health Check
GET /health

# Current Metrics
GET /api/metrics

# Historical Metrics
GET /api/metrics/history?hours=1

# Performance Statistics
GET /api/performance?range=300000

# Active Alerts
GET /api/alerts
```

### WebSocket Events

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3002');

// Listen for metrics updates
socket.on('metrics-update', (metrics) => {
  console.log('📊 Metrics updated:', metrics);
});

// Listen for alerts
socket.on('alerts-update', (alerts) => {
  console.log('🚨 New alerts:', alerts);
});

// Request specific data
socket.emit('request-performance', 300000); // 5 minutes
socket.emit('request-history', 1); // 1 hour
```

## 🧪 Testing & Validation

### Run Monitoring Tests

```bash
# Test monitoring components
npm run monitoring:test

# Validate configurations
npm run monitoring:validate

# Profile performance
npm run monitoring:profile
```

### CI/CD Integration

```yaml
# In .github/workflows/
- name: 🔍 Test with Monitoring
  run: |
    npm run monitoring:start &
    sleep 10
    npm run test:integration
```

### Performance Testing

```bash
# Load testing with monitoring
npm run test:performance

# Monitor resource usage
npm run monitoring:profile
```

## 📊 Metrics & Analytics

### Key Performance Indicators (KPIs)

- **Availability**: API uptime percentage
- **Performance**: Average response time
- **Reliability**: Error rate percentage
- **Throughput**: Requests per second
- **Security**: Threat detection rate

### Data Retention

- **Real-time**: 1 hour (memory)
- **Short-term**: 30 days (Prometheus)
- **Long-term**: 1 year (optional storage)

### Export Options

```javascript
// JSON export
const metrics = collector.exportMetrics();

// Prometheus format
const prometheusMetrics = collector.exportPrometheus();

// CSV export
const csvData = collector.exportCSV();
```

## 🔒 Security Considerations

### Access Control
- Restrict dashboard access to authorized users
- Implement API key authentication
- Use HTTPS for all connections
- Enable CORS restrictions

### Data Protection
- Encrypt sensitive metrics data
- Implement data retention policies
- Secure WebSocket connections
- Audit dashboard access logs

### Network Security
- Use internal networks for monitoring traffic
- Implement firewall rules
- Monitor for unauthorized access attempts
- Regular security audits

## 🚀 Production Deployment

### Docker Deployment

```dockerfile
# Dockerfile.monitoring
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY docs/monitoring/ ./monitoring/
EXPOSE 3002

CMD ["npm", "run", "monitoring:start"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-monitoring
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-monitoring
  template:
    metadata:
      labels:
        app: api-monitoring
    spec:
      containers:
      - name: monitoring
        image: your-registry/api-monitoring:latest
        ports:
        - containerPort: 3002
        env:
        - name: API_BASE_URL
          value: "http://api-service:8080/api/v1"
```

### Load Balancing

```nginx
# nginx.conf
upstream monitoring_backend {
    server monitoring-1:3002;
    server monitoring-2:3002;
}

server {
    listen 80;
    server_name monitoring.yourdomain.com;

    location / {
        proxy_pass http://monitoring_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📚 Documentation

### Generated Documentation

```bash
# Generate setup guide
npm run docs:monitoring

# View documentation
cat docs/monitoring/MONITORING_SETUP.md
cat docs/monitoring/METRICS_REFERENCE.md
```

### API Documentation Integration

The monitoring system integrates with your existing API documentation:

- **OpenAPI Specification** - `openapi.yaml`
- **Interactive Docs** - `http://localhost:3001`
- **Test Results** - CI/CD artifacts
- **Performance Reports** - Automated generation

## 🐛 Troubleshooting

### Common Issues

#### Dashboard Not Loading
```bash
# Check if server is running
curl http://localhost:3002/health

# Check Node.js version
node --version

# Validate dependencies
npm run monitoring:validate
```

#### Metrics Not Updating
```bash
# Verify API server
curl http://localhost:8080/health

# Check WebSocket connection
# Browser DevTools → Network → WS tab

# Restart metrics collection
npm run monitoring:metrics
```

#### High Memory Usage
```bash
# Monitor process
ps aux | grep node

# Check for memory leaks
npm run monitoring:profile

# Adjust collection interval
# Edit metrics-collector.js: collectionInterval: 60000
```

#### WebSocket Connection Issues
```bash
# Check firewall settings
sudo ufw status

# Verify port availability
netstat -tlnp | grep 3002

# Test WebSocket manually
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3002');
socket.on('connect', () => console.log('Connected'));
"
```

### Performance Optimization

#### Reduce Collection Frequency
```javascript
const collector = new APIMetricsCollector({
  collectionInterval: 60000 // 1 minute
});
```

#### Limit Metrics Retention
```javascript
const collector = new APIMetricsCollector({
  maxMetricsPerEndpoint: 500
});
```

#### Enable Compression
```javascript
const dashboard = new APIMonitoringDashboard({
  compression: true
});
```

## 🤝 Integration Examples

### With Existing CI/CD

```yaml
# .github/workflows/deploy.yml
- name: 🚀 Deploy with Monitoring
  run: |
    # Deploy application
    kubectl apply -f k8s/

    # Start monitoring
    kubectl apply -f k8s/monitoring/

    # Wait for monitoring
    kubectl wait --for=condition=ready pod -l app=api-monitoring

    # Run post-deployment tests
    npm run test:integration
```

### With Load Testing

```bash
# Run load test with monitoring
npm run monitoring:start &
sleep 5

# Start load testing
npm run test:performance

# Generate performance report
curl http://localhost:3002/api/performance > performance-report.json
```

### With Alert Notifications

```javascript
// Custom alert handler
collector.on('alert-triggered', (alert) => {
  // Send to Slack
  slackWebhook.send({
    text: `🚨 ${alert.title}: ${alert.message}`,
    severity: alert.severity
  });

  // Send email
  emailService.send({
    to: 'team@company.com',
    subject: `API Alert: ${alert.title}`,
    body: alert.message
  });
});
```

## 📈 Scaling & High Availability

### Horizontal Scaling

```yaml
# Kubernetes HPA for monitoring
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-monitoring-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-monitoring
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Integration

```javascript
// Metrics storage in database
class MetricsStorage {
  async saveMetrics(metrics) {
    await db.collection('metrics').insertOne({
      ...metrics,
      timestamp: new Date()
    });
  }

  async getMetricsHistory(hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db.collection('metrics')
      .find({ timestamp: { $gte: cutoff } })
      .sort({ timestamp: -1 })
      .toArray();
  }
}
```

## 🎯 Best Practices

### Monitoring Strategy
- **Define KPIs** clearly for your application
- **Set appropriate thresholds** for alerts
- **Monitor business metrics** not just technical ones
- **Implement gradual alerting** (warning → critical)
- **Regular review** of alert rules and thresholds

### Alert Management
- **Avoid alert fatigue** with proper thresholds
- **Use alert grouping** to reduce noise
- **Implement escalation** policies
- **Document runbooks** for each alert type
- **Regular maintenance** of alert rules

### Performance Considerations
- **Monitor monitoring overhead** itself
- **Use sampling** for high-volume metrics
- **Implement data retention** policies
- **Regular cleanup** of old metrics
- **Optimize database queries** for metrics

### Security Best Practices
- **Secure access** to monitoring dashboards
- **Encrypt data** in transit and at rest
- **Regular audits** of monitoring access
- **Monitor the monitoring** system itself
- **Implement least privilege** access

---

## 🎉 Getting Started

1. **Clone and setup:**
   ```bash
   git clone <repository>
   cd secure-flow-automaton
   npm install
   npm run monitoring:setup
   ```

2. **Start monitoring:**
   ```bash
   npm run monitoring:start
   ```

3. **Access dashboard:**
   - Open: `http://localhost:3002`
   - View real-time metrics and alerts

4. **Set up Grafana (optional):**
   ```bash
   # Import dashboard from docs/monitoring/grafana-dashboard.json
   ```

**🚀 Your API monitoring system is now ready for production deployment!**

---

**Version**: 1.0.0
**Last Updated**: January 2024
**API Version**: v1
**Compatibility**: Node.js 18+
