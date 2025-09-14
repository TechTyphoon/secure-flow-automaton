import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  Eye,
  Clock,
  Globe,
  Lock,
  Activity,
  Users,
  Server,
  Database
} from 'lucide-react';

interface SecurityMetric {
  timestamp: Date;
  threatsBlocked: number;
  authAttempts: number;
  authFailures: number;
  apiCalls: number;
  suspiciousActivity: number;
  vulnerabilityScans: number;
}

interface GeographicData {
  country: string;
  threats: number;
  color: string;
}

interface ThreatTypeData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

interface ComplianceStatus {
  framework: string;
  score: number;
  status: 'compliant' | 'partial' | 'non-compliant';
  lastAudit: Date;
  nextAudit: Date;
}

const SecurityAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [threatTypeData, setThreatTypeData] = useState<ThreatTypeData[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus[]>([]);
  const [realTimeStats, setRealTimeStats] = useState({
    activeConnections: 0,
    requestsPerSecond: 0,
    blockedRequests: 0,
    responseTime: 0
  });

  // Generate mock time series data
  const generateTimeSeriesData = (hours: number): SecurityMetric[] => {
    const data: SecurityMetric[] = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp,
        threatsBlocked: Math.floor(Math.random() * 50) + 10,
        authAttempts: Math.floor(Math.random() * 200) + 100,
        authFailures: Math.floor(Math.random() * 20) + 5,
        apiCalls: Math.floor(Math.random() * 1000) + 500,
        suspiciousActivity: Math.floor(Math.random() * 30) + 5,
        vulnerabilityScans: Math.floor(Math.random() * 10) + 2
      });
    }
    
    return data;
  };

  // Generate geographic threat data
  const generateGeographicData = (): GeographicData[] => {
    const countries = [
      { country: 'United States', color: '#8884d8' },
      { country: 'China', color: '#82ca9d' },
      { country: 'Russia', color: '#ffc658' },
      { country: 'Germany', color: '#ff7300' },
      { country: 'Brazil', color: '#8dd1e1' },
      { country: 'India', color: '#d084d0' }
    ];
    
    return countries.map(country => ({
      ...country,
      threats: Math.floor(Math.random() * 100) + 20
    }));
  };

  // Generate threat type distribution
  const generateThreatTypeData = (): ThreatTypeData[] => {
    const types = [
      { type: 'Brute Force', color: '#8884d8' },
      { type: 'SQL Injection', color: '#82ca9d' },
      { type: 'XSS', color: '#ffc658' },
      { type: 'DDoS', color: '#ff7300' },
      { type: 'Malware', color: '#8dd1e1' },
      { type: 'Phishing', color: '#d084d0' }
    ];
    
    const counts = types.map(type => ({
      ...type,
      count: Math.floor(Math.random() * 50) + 10
    }));
    
    const total = counts.reduce((sum, item) => sum + item.count, 0);
    
    return counts.map(item => ({
      ...item,
      percentage: Math.round((item.count / total) * 100)
    }));
  };

  // Generate compliance status
  const generateComplianceData = (): ComplianceStatus[] => {
    const frameworks = [
      { framework: 'SOC 2 Type II', score: 95 },
      { framework: 'ISO 27001', score: 88 },
      { framework: 'GDPR', score: 92 },
      { framework: 'HIPAA', score: 85 },
      { framework: 'PCI DSS', score: 90 }
    ];
    
    return frameworks.map(f => ({
      ...f,
      status: f.score >= 90 ? 'compliant' : f.score >= 70 ? 'partial' : 'non-compliant' as any,
      lastAudit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      nextAudit: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000)
    }));
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (securityMetrics.length === 0) return null;
    
    const latest = securityMetrics[securityMetrics.length - 1];
    const previous = securityMetrics[securityMetrics.length - 2];
    
    const calculateTrend = (current: number, prev: number) => {
      if (!prev) return 0;
      return ((current - prev) / prev) * 100;
    };
    
    return {
      threatsBlocked: {
        value: latest.threatsBlocked,
        trend: calculateTrend(latest.threatsBlocked, previous?.threatsBlocked || 0)
      },
      authFailures: {
        value: latest.authFailures,
        trend: calculateTrend(latest.authFailures, previous?.authFailures || 0)
      },
      apiCalls: {
        value: latest.apiCalls,
        trend: calculateTrend(latest.apiCalls, previous?.apiCalls || 0)
      },
      suspiciousActivity: {
        value: latest.suspiciousActivity,
        trend: calculateTrend(latest.suspiciousActivity, previous?.suspiciousActivity || 0)
      }
    };
  }, [securityMetrics]);

  // Update real-time stats
  useEffect(() => {
    const updateRealTimeStats = () => {
      setRealTimeStats({
        activeConnections: Math.floor(Math.random() * 1000) + 500,
        requestsPerSecond: Math.floor(Math.random() * 100) + 50,
        blockedRequests: Math.floor(Math.random() * 20) + 5,
        responseTime: Math.floor(Math.random() * 100) + 50
      });
    };

    updateRealTimeStats();
    const interval = setInterval(updateRealTimeStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load data based on time range
  useEffect(() => {
    const hours = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    }[timeRange];
    
    setSecurityMetrics(generateTimeSeriesData(hours));
    setGeographicData(generateGeographicData());
    setThreatTypeData(generateThreatTypeData());
    setComplianceStatus(generateComplianceData());
  }, [timeRange]);

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Security Analytics Dashboard</h2>
        <div className="flex space-x-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats.activeConnections}</div>
            <p className="text-xs text-muted-foreground">Live connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests/sec</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats.requestsPerSecond}</div>
            <p className="text-xs text-muted-foreground">Current load</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{realTimeStats.blockedRequests}</div>
            <p className="text-xs text-muted-foreground">Last minute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Summary */}
      {summaryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(summaryStats).map(([key, stat]) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </CardTitle>
                {getTrendIcon(stat.trend)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.trend > 0 ? 'text-red-600' : stat.trend < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  {stat.trend > 0 ? '+' : ''}{stat.trend.toFixed(1)}% from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threats Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Threats Blocked Over Time</CardTitle>
            <CardDescription>Security incidents prevented by our systems</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={securityMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(time) => new Date(time).toLocaleString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="threatsBlocked" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Threats Blocked"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Authentication Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Activity</CardTitle>
            <CardDescription>Login attempts and failure rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={securityMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(time) => new Date(time).toLocaleString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="authAttempts" 
                  stackId="1"
                  stroke="#82ca9d" 
                  fill="#82ca9d"
                  name="Auth Attempts"
                />
                <Area 
                  type="monotone" 
                  dataKey="authFailures" 
                  stackId="1"
                  stroke="#ff7300" 
                  fill="#ff7300"
                  name="Auth Failures"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Threat Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Threat Sources</CardTitle>
            <CardDescription>Threat origins by country</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={geographicData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="threats" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Threat Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Type Distribution</CardTitle>
            <CardDescription>Breakdown of detected threat categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={threatTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                >
                  {threatTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Framework Status</CardTitle>
          <CardDescription>
            Current compliance scores across security frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceStatus.map((compliance) => (
              <div key={compliance.framework} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{compliance.framework}</h4>
                    <Badge className={getComplianceStatusColor(compliance.status)}>
                      {compliance.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Last Audit: {compliance.lastAudit.toLocaleDateString()}</span>
                    <span>Next Audit: {compliance.nextAudit.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-2xl font-bold">{compliance.score}%</div>
                  <Progress value={compliance.score} className="w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Security Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>API Security Metrics</CardTitle>
          <CardDescription>API endpoint security and usage analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={securityMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(time) => new Date(time).toLocaleString()}
              />
              <Area 
                type="monotone" 
                dataKey="apiCalls" 
                stroke="#8884d8" 
                fill="#8884d8"
                fillOpacity={0.6}
                name="API Calls"
              />
              <Area 
                type="monotone" 
                dataKey="suspiciousActivity" 
                stroke="#ff7300" 
                fill="#ff7300"
                fillOpacity={0.8}
                name="Suspicious Activity"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAnalytics;
