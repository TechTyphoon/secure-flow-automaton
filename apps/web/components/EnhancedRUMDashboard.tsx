import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell,
  ScatterChart, Scatter, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Activity, AlertTriangle, TrendingUp, TrendingDown, 
  Globe, Smartphone, Wifi, Cpu, Memory, Database,
  Users, DollarSign, Clock, Target, Zap, Shield,
  Eye, BarChart3, Brain, Lightbulb
} from 'lucide-react';
import { 
  productionMonitoringService, 
  ProductionRUMMetrics, 
  ApplicationHealth,
  AnomalyAlert
} from '@/services/productionMonitoring';

interface EnhancedRUMDashboardProps {
  className?: string;
}

const SEVERITY_COLORS = {
  low: '#10B981',      // Green
  medium: '#F59E0B',   // Yellow  
  high: '#EF4444',     // Red
  critical: '#DC2626'  // Dark Red
};

const STATUS_COLORS = {
  healthy: '#10B981',
  degraded: '#F59E0B', 
  critical: '#EF4444',
  maintenance: '#6B7280'
};

export const EnhancedRUMDashboard: React.FC<EnhancedRUMDashboardProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<ProductionRUMMetrics | null>(null);
  const [health, setHealth] = useState<ApplicationHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [realTimeAlerts, setRealTimeAlerts] = useState<AnomalyAlert[]>([]);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time monitoring
    const metricsInterval = setInterval(loadDashboardData, 30000); // 30 seconds
    const alertsInterval = setInterval(loadAlerts, 10000); // 10 seconds
    
    // Subscribe to real-time alerts
    const unsubscribe = productionMonitoringService.subscribeToAlerts((alert) => {
      setRealTimeAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    });

    return () => {
      clearInterval(metricsInterval);
      clearInterval(alertsInterval);
      unsubscribe();
    };
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, healthData] = await Promise.all([
        productionMonitoringService.getProductionMetrics(),
        productionMonitoringService.getApplicationHealth()
      ]);
      
      setMetrics(metricsData);
      setHealth(healthData);
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const healthData = await productionMonitoringService.getApplicationHealth();
      setRealTimeAlerts(prev => [...healthData.alerts, ...prev].slice(0, 10));
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  };

  const formatMetric = (value: number, unit?: string, decimals = 1): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(decimals)}M${unit || ''}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(decimals)}K${unit || ''}`;
    }
    return `${value.toFixed(decimals)}${unit || ''}`;
  };

  const getPerformanceGrade = (score: number): { grade: string; color: string } => {
    if (score >= 90) return { grade: 'A', color: '#10B981' };
    if (score >= 80) return { grade: 'B', color: '#F59E0B' };
    if (score >= 70) return { grade: 'C', color: '#EF4444' };
    return { grade: 'D', color: '#DC2626' };
  };

  const getCoreWebVitalsStatus = (metric: string, value: number): { status: string; color: string } => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return { status: 'Unknown', color: '#6B7280' };

    if (value <= threshold.good) return { status: 'Good', color: '#10B981' };
    if (value <= threshold.poor) return { status: 'Needs Improvement', color: '#F59E0B' };
    return { status: 'Poor', color: '#EF4444' };
  };

  if (loading && !metrics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-lg">Loading enhanced monitoring dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mx-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!metrics || !health) {
    return (
      <Alert className="mx-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No monitoring data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Real-time Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Production Monitoring Dashboard</h2>
          <p className="text-gray-600">Real-time performance analytics and system health</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${STATUS_COLORS[health.status]} animate-pulse`} />
            <span className="font-medium capitalize">{health.status}</span>
          </div>
          
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value as '1h' | '24h' | '7d' | '30d')}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Real-time Alerts Banner */}
      {realTimeAlerts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="font-medium text-orange-800">
                {realTimeAlerts.length} active alert{realTimeAlerts.length !== 1 ? 's' : ''}
              </span>
              <span className="text-sm text-orange-600">
                Latest: {realTimeAlerts[0]?.description}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Score</p>
                <p className="text-3xl font-bold">
                  {health.healthScore}
                  <span className="text-lg ml-1 text-gray-500">/ 100</span>
                </p>
                <Badge 
                  variant="secondary"
                  className={`mt-2 text-white`}
                  style={{ backgroundColor: getPerformanceGrade(health.healthScore).color }}
                >
                  Grade {getPerformanceGrade(health.healthScore).grade}
                </Badge>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold">{formatMetric(metrics.pageViews / 24)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                <p className="text-3xl font-bold">${formatMetric(metrics.revenueImpact)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+8.3%</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-3xl font-bold">{health.uptime.toFixed(2)}%</p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-gray-600">Last 30 days</span>
                </div>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Dashboard Content */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Core Web Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { name: 'LCP', value: metrics.lcp, unit: 'ms', key: 'lcp' },
                  { name: 'FID', value: metrics.fid, unit: 'ms', key: 'fid' },
                  { name: 'CLS', value: metrics.cls, unit: '', key: 'cls' },
                  { name: 'FCP', value: metrics.fcp, unit: 'ms', key: 'fcp' },
                  { name: 'TTFB', value: metrics.ttfb, unit: 'ms', key: 'ttfb' }
                ].map((metric) => {
                  const status = getCoreWebVitalsStatus(metric.key, metric.value);
                  return (
                    <div key={metric.name} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{metric.value.toFixed(metric.key === 'cls' ? 3 : 0)}{metric.unit}</div>
                      <div className="text-sm text-gray-600 mb-2">{metric.name}</div>
                      <Badge 
                        variant="secondary"
                        className="text-white text-xs"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.performanceForecast.forecast.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: number) => [value.toFixed(1), 'Performance Score']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predictedPerformance" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Predicted Performance"
                  />
                  <Area
                    type="monotone"
                    dataKey="confidenceInterval"
                    stroke="none"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    name="Confidence Range"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Business Impact Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-lg font-bold">{metrics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className="text-lg font-bold">{metrics.bounceRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Session Duration</span>
                    <span className="text-lg font-bold">{Math.floor(metrics.sessionDuration / 60)}m {Math.floor(metrics.sessionDuration % 60)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Page Views (24h)</span>
                    <span className="text-lg font-bold">{formatMetric(metrics.pageViews)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-lg font-bold">{metrics.errorRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Availability</span>
                    <span className="text-lg font-bold">{metrics.availability.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Time</span>
                    <span className="text-lg font-bold">{metrics.responseTime.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Throughput</span>
                    <span className="text-lg font-bold">{formatMetric(metrics.throughput)} req/min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-6">
          {/* Service Health Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Service Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {health.services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          service.status === 'up' ? 'bg-green-500' : 
                          service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                      />
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">
                          Response: {service.responseTime}ms | Error Rate: {service.errorRate}%
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={service.status === 'up' ? 'default' : 'destructive'}
                      className="capitalize"
                    >
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm">{health.metrics.cpu.current}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${health.metrics.cpu.current}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm">{health.metrics.memory.current}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${health.metrics.memory.current}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm">{health.metrics.disk.usage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${health.metrics.disk.usage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database & Cache
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">DB Connections</span>
                    <span className="text-lg font-bold">
                      {health.metrics.database.connections}/{health.metrics.database.poolSize}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Query Time</span>
                    <span className="text-lg font-bold">{health.metrics.database.queryTime}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cache Hit Rate</span>
                    <span className="text-lg font-bold">{health.metrics.cache.hitRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cache Size</span>
                    <span className="text-lg font-bold">{health.metrics.cache.size.toFixed(1)}GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Predictive Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Performance Trend</h4>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="capitalize font-medium">{metrics.trendPrediction.performanceTrend}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Confidence: {metrics.trendPrediction.confidence}%
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Risk Factors</h4>
                  <div className="space-y-1">
                    {metrics.trendPrediction.riskFactors.slice(0, 2).map((risk, index) => (
                      <p key={index} className="text-sm text-gray-700">{risk}</p>
                    ))}
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <div className="space-y-1">
                    {metrics.trendPrediction.recommendations.slice(0, 2).map((rec, index) => (
                      <p key={index} className="text-sm text-gray-700">{rec}</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anomaly Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Anomaly Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.anomalyDetection.length > 0 ? (
                <div className="space-y-4">
                  {metrics.anomalyDetection.map((anomaly) => (
                    <div key={anomaly.id} className="border-l-4 border-orange-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{anomaly.metric.replace('_', ' ').toUpperCase()}</span>
                        <Badge 
                          variant="secondary"
                          className="text-white"
                          style={{ backgroundColor: SEVERITY_COLORS[anomaly.severity] }}
                        >
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{anomaly.description}</p>
                      <div className="text-xs text-gray-500">
                        Current: {anomaly.currentValue} | Expected: {anomaly.expectedValue} | 
                        Deviation: {anomaly.deviation.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No anomalies detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geographic Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Regional Breakdown</h4>
                  <div className="space-y-3">
                    {metrics.geographic.regions.map((region) => (
                      <div key={`${region.country}-${region.city}`} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{region.city}, {region.country}</div>
                          <div className="text-sm text-gray-600">{formatMetric(region.userCount)} users</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{region.avgPerformance}</div>
                          <div className="text-sm text-gray-600">{region.latency}ms</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Global Averages</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Performance</span>
                      <span className="text-lg font-bold">{metrics.geographic.globalAverages.performance}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Availability</span>
                      <span className="text-lg font-bold">{metrics.geographic.globalAverages.availability}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">User Satisfaction</span>
                      <span className="text-lg font-bold">{metrics.geographic.globalAverages.userSatisfaction}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Device Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Mobile', value: metrics.deviceBreakdown.mobile.count, color: '#3B82F6' },
                        { name: 'Desktop', value: metrics.deviceBreakdown.desktop.count, color: '#10B981' },
                        { name: 'Tablet', value: metrics.deviceBreakdown.tablet.count, color: '#F59E0B' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {[
                        { name: 'Mobile', value: metrics.deviceBreakdown.mobile.count, color: '#3B82F6' },
                        { name: 'Desktop', value: metrics.deviceBreakdown.desktop.count, color: '#10B981' },
                        { name: 'Tablet', value: metrics.deviceBreakdown.tablet.count, color: '#F59E0B' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatMetric(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Network Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.networkConditions.connectionTypes.map((connection) => (
                    <div key={connection.type} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium uppercase">{connection.type}</div>
                        <div className="text-sm text-gray-600">{formatMetric(connection.count)} users</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{connection.avgSpeed} Mbps</div>
                        <div className="text-sm text-gray-600">Score: {connection.performance}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Browser Compatibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.deviceBreakdown.browserBreakdown.map((browser) => (
                  <div key={`${browser.browser}-${browser.version}`} className="text-center p-4 border rounded-lg">
                    <div className="font-medium">{browser.browser}</div>
                    <div className="text-sm text-gray-600 mb-2">{browser.version}</div>
                    <div className="text-lg font-bold">{formatMetric(browser.count)}</div>
                    <div className="text-sm">
                      Performance: {browser.performance} | Compatibility: {browser.compatibility}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {realTimeAlerts.length > 0 ? (
                <div className="space-y-4">
                  {realTimeAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`border-l-4 pl-4 py-3 rounded-r ${
                        alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                        alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{alert.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary"
                            className="text-white"
                            style={{ backgroundColor: SEVERITY_COLORS[alert.severity] }}
                          >
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                      <div className="text-xs text-gray-600">
                        Service: {alert.service} | Metric: {alert.metric} | 
                        Current: {alert.currentValue} | Threshold: {alert.threshold}
                      </div>
                      {alert.suggestedActions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Suggested Actions:</p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {alert.suggestedActions.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">All Systems Normal</p>
                  <p>No active alerts or issues detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedRUMDashboard;
