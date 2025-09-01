/**
 * Real-Time API Monitoring Dashboard Server
 * WebSocket-based dashboard for real-time API metrics visualization
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import APIMetricsCollector from './metrics-collector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class APIMonitoringDashboard {
  constructor(options = {}) {
    this.port = options.port || 3002;
    this.apiBaseURL = options.apiBaseURL || 'http://localhost:8080/api/v1';
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.metricsCollector = new APIMetricsCollector({
      baseURL: this.apiBaseURL,
      collectionInterval: 30000 // 30 seconds
    });

    this.connectedClients = new Set();
    this.dashboardData = {
      metrics: null,
      alerts: [],
      uptime: 0,
      lastUpdate: null
    };

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupMetricsCollection();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));

    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'API Monitoring Dashboard',
        version: '1.0.0',
        uptime: this.dashboardData.uptime,
        clients: this.connectedClients.size,
        lastUpdate: this.dashboardData.lastUpdate,
        timestamp: new Date().toISOString()
      });
    });

    // Get current metrics
    this.app.get('/api/metrics', (req, res) => {
      res.json(this.dashboardData.metrics || {});
    });

    // Get metrics history
    this.app.get('/api/metrics/history', (req, res) => {
      const hours = parseInt(req.query.hours) || 1;
      const timeRange = hours * 60 * 60 * 1000; // Convert hours to milliseconds
      const history = this.metricsCollector.getMetricsInRange(Date.now() - timeRange);
      res.json(history);
    });

    // Get performance statistics
    this.app.get('/api/performance', (req, res) => {
      const timeRange = parseInt(req.query.range) || 300000; // 5 minutes default
      const stats = this.metricsCollector.calculatePerformanceStats(timeRange);
      res.json(stats);
    });

    // Get alerts
    this.app.get('/api/alerts', (req, res) => {
      res.json(this.dashboardData.alerts);
    });

    // Dashboard HTML
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  /**
   * Setup WebSocket connections
   */
  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log('🔗 Client connected to dashboard:', socket.id);
      this.connectedClients.add(socket.id);

      // Send initial data
      socket.emit('dashboard-init', {
        metrics: this.dashboardData.metrics,
        alerts: this.dashboardData.alerts,
        uptime: this.dashboardData.uptime
      });

      // Handle client requests
      socket.on('request-metrics', () => {
        socket.emit('metrics-update', this.dashboardData.metrics);
      });

      socket.on('request-performance', (timeRange) => {
        const stats = this.metricsCollector.calculatePerformanceStats(timeRange || 300000);
        socket.emit('performance-stats', stats);
      });

      socket.on('request-history', (hours) => {
        const timeRange = (hours || 1) * 60 * 60 * 1000;
        const history = this.metricsCollector.getMetricsInRange(Date.now() - timeRange);
        socket.emit('metrics-history', history);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('📴 Client disconnected:', socket.id);
        this.connectedClients.delete(socket.id);
      });
    });
  }

  /**
   * Setup metrics collection
   */
  setupMetricsCollection() {
    // Start metrics collection
    this.metricsCollector.startCollection();

    // Listen for metrics updates
    this.metricsCollector.on('metrics-updated', (metrics) => {
      this.dashboardData.metrics = metrics;
      this.dashboardData.lastUpdate = new Date().toISOString();

      // Broadcast to all connected clients
      this.io.emit('metrics-update', metrics);

      // Check for alerts
      this.checkAlerts(metrics);
    });

    // Listen for collection errors
    this.metricsCollector.on('collection-error', (error) => {
      console.error('📊 Metrics collection error:', error);
      this.io.emit('collection-error', {
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });

    // Update uptime
    setInterval(() => {
      this.dashboardData.uptime = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);
  }

  /**
   * Check for alerts based on metrics
   */
  checkAlerts(metrics) {
    const alerts = [];

    if (metrics && metrics.system) {
      const systemHealth = metrics.system.health;
      if (systemHealth.length > 0) {
        const latestHealth = systemHealth[systemHealth.length - 1];

        // Health status alert
        if (latestHealth.status !== 'healthy') {
          alerts.push({
            id: `health-${Date.now()}`,
            type: 'system',
            severity: latestHealth.status === 'unhealthy' ? 'critical' : 'warning',
            title: 'System Health Issue',
            message: `System status is ${latestHealth.status}`,
            timestamp: new Date().toISOString(),
            data: latestHealth
          });
        }

        // Response time alert
        if (latestHealth.responseTime > 1000) {
          alerts.push({
            id: `response-time-${Date.now()}`,
            type: 'performance',
            severity: 'warning',
            title: 'High Response Time',
            message: `API response time is ${latestHealth.responseTime}ms`,
            timestamp: new Date().toISOString(),
            data: { responseTime: latestHealth.responseTime }
          });
        }
      }
    }

    // Check endpoint metrics for failures
    if (metrics.endpoints) {
      for (const [endpoint, endpointMetrics] of Object.entries(metrics.endpoints)) {
        if (endpointMetrics.length > 0) {
          const recentMetrics = endpointMetrics.slice(-5); // Last 5 metrics
          const failedRequests = recentMetrics.filter(m => !m.success).length;

          if (failedRequests > 2) { // More than 2 failures in last 5 requests
            alerts.push({
              id: `endpoint-failure-${endpoint}-${Date.now()}`,
              type: 'endpoint',
              severity: 'error',
              title: 'Endpoint Failure',
              message: `${endpoint} has ${failedRequests}/5 failed requests`,
              timestamp: new Date().toISOString(),
              data: { endpoint, failedRequests, totalRequests: recentMetrics.length }
            });
          }
        }
      }
    }

    // Update alerts
    this.dashboardData.alerts = alerts.slice(-10); // Keep last 10 alerts

    // Broadcast alerts to clients
    if (alerts.length > 0) {
      this.io.emit('alerts-update', this.dashboardData.alerts);
    }
  }

  /**
   * Start the dashboard server
   */
  start() {
    this.startTime = Date.now();

    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log('🚀 API Monitoring Dashboard Server');
        console.log(`📊 Dashboard: http://localhost:${this.port}`);
        console.log(`🔌 WebSocket: ws://localhost:${this.port}`);
        console.log(`❤️ Health Check: http://localhost:${this.port}/health`);
        console.log('📈 Ready for real-time monitoring!');

        resolve(this);
      });
    });
  }

  /**
   * Stop the dashboard server
   */
  stop() {
    console.log('🛑 Stopping API Monitoring Dashboard...');

    this.metricsCollector.stopCollection();
    this.io.close();
    this.server.close();

    return new Promise((resolve) => {
      this.server.on('close', () => {
        console.log('✅ Dashboard server stopped');
        resolve();
      });
    });
  }

  /**
   * Get dashboard statistics
   */
  getStats() {
    return {
      uptime: this.dashboardData.uptime,
      connectedClients: this.connectedClients.size,
      lastMetricsUpdate: this.dashboardData.lastUpdate,
      activeAlerts: this.dashboardData.alerts.length,
      collectionRunning: this.metricsCollector.isCollecting,
      serverPort: this.port
    };
  }
}

export default APIMonitoringDashboard;
