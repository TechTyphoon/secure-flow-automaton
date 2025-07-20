import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Cell,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { 
  Users, 
  Globe, 
  Smartphone, 
  Monitor, 
  Wifi, 
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Eye,
  MousePointer,
  Navigation,
  Gauge,
  Shield,
  Download,
  RefreshCw,
  Server,
  Database,
  Network,
  BarChart3,
  Target,
  Settings
} from 'lucide-react';

interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  pageViews: number;
  bounced: boolean;
  country: string;
  city: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  connectionType: string;
  performanceMetrics: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    fcp: number;
    si: number; // Speed Index
    tbt: number; // Total Blocking Time
  };
  userExperience: 'good' | 'needs-improvement' | 'poor';
  securityEvents: {
    cspViolations: number;
    xssAttempts: number;
    authFailures: number;
    suspiciousRequests: number;
  };
  businessMetrics: {
    conversionEvents: number;
    revenueGenerated: number;
    goalCompletions: string[];
  };
}

interface PagePerformance {
  path: string;
  visits: number;
  avgLoadTime: number;
  bounceRate: number;
  conversionRate: number;
  performanceScore: number;
  securityScore: number;
  accessibilityScore: number;
  seoScore: number;
  coreWebVitals: {
    lcp: { value: number; rating: string; percentile: number };
    fid: { value: number; rating: string; percentile: number };
    cls: { value: number; rating: string; percentile: number };
    ttfb: { value: number; rating: string; percentile: number };
  };
  errors: {
    jsErrors: number;
    networkErrors: number;
    renderErrors: number;
  };
}

interface UserJourney {
  sessionId: string;
  steps: {
    page: string;
    timestamp: Date;
    timeSpent: number;
    interactions: number;
    exitPoint?: boolean;
    errorOccurred?: boolean;
    securityEvent?: string;
  }[];
  conversionFunnel: string[];
  dropOffPoint?: string;
  satisfactionScore: number;
}

interface PerformanceTrend {
  timestamp: Date;
  lcp: number;
  fid: number;
  cls: number;
  tti: number;
  activeUsers: number;
  pageLoadTime: number;
  errorRate: number;
  satisfactionScore: number;
  securityThreats: number;
  serverResponseTime: number;
  cacheHitRate: number;
  bandwidthUsage: number;
}

const RealUserMonitoring: React.FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [pagePerformance, setPagePerformance] = useState<PagePerformance[]>([]);
  const [userJourneys, setUserJourneys] = useState<UserJourney[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    pageLoadTime: 0,
    errorRate: 0,
    satisfactionScore: 0,
    securityThreats: 0,
    serverUptime: 99.9,
    cacheEfficiency: 85.2,
    conversionRate: 3.4
  });
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'performance' | 'security' | 'error' | 'business';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>>([]);

  const generateMockSessions = useCallback((): UserSession[] => {
    const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia'];
    const cities = ['New York', 'London', 'Berlin', 'Paris', 'Tokyo', 'Sydney'];
    const devices = ['desktop', 'mobile', 'tablet'] as const;
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const oses = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
    const connections = ['4g', '3g', 'wifi', '5g'];

    const sessions: UserSession[] = [];
    
    for (let i = 0; i < 50; i++) {
      const startTime = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      const duration = Math.random() * 1800 + 30; // 30 seconds to 30 minutes
      const pageViews = Math.floor(Math.random() * 10) + 1;
      const lcp = Math.random() * 4000 + 1000;
      const fid = Math.random() * 300 + 50;
      const cls = Math.random() * 0.5;
      const ttfb = Math.random() * 1000 + 200;
      const fcp = Math.random() * 2000 + 800;
      const si = Math.random() * 3000 + 1500;
      const tbt = Math.random() * 600 + 100;
      
      let userExperience: 'good' | 'needs-improvement' | 'poor' = 'good';
      if (lcp > 2500 || fid > 100 || cls > 0.1) {
        userExperience = lcp > 4000 || fid > 300 || cls > 0.25 ? 'poor' : 'needs-improvement';
      }

      sessions.push({
        id: `session-${i}`,
        userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
        startTime,
        endTime: new Date(startTime.getTime() + duration * 1000),
        duration,
        pageViews,
        bounced: pageViews === 1 && duration < 30,
        country: countries[Math.floor(Math.random() * countries.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: oses[Math.floor(Math.random() * oses.length)],
        connectionType: connections[Math.floor(Math.random() * connections.length)],
        performanceMetrics: {
          lcp,
          fid,
          cls,
          ttfb,
          fcp,
          si,
          tbt
        },
        userExperience,
        securityEvents: {
          cspViolations: Math.floor(Math.random() * 3),
          xssAttempts: Math.floor(Math.random() * 2),
          authFailures: Math.floor(Math.random() * 2),
          suspiciousRequests: Math.floor(Math.random() * 5)
        },
        businessMetrics: {
          conversionEvents: Math.floor(Math.random() * 3),
          revenueGenerated: Math.random() * 500,
          goalCompletions: Math.random() > 0.7 ? ['newsletter_signup', 'demo_request'] : []
        }
      });
    }
    
    return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, []);

  const generatePagePerformance = useCallback((): PagePerformance[] => {
    const pages = [
      { path: '/', name: 'Home' },
      { path: '/auth', name: 'Authentication' },
      { path: '/profile', name: 'Profile' },
      { path: '/settings', name: 'Settings' },
      { path: '/monitoring', name: 'Monitoring' },
      { path: '/security-report', name: 'Security Report' },
      { path: '/vulnerabilities', name: 'Vulnerabilities' }
    ];

    return pages.map(page => {
      const lcp = Math.random() * 3000 + 1000;
      const fid = Math.random() * 200 + 50;
      const cls = Math.random() * 0.3;
      const ttfb = Math.random() * 800 + 200;
      
      const getRating = (metric: string, value: number) => {
        switch (metric) {
          case 'lcp': return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
          case 'fid': return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
          case 'cls': return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
          case 'ttfb': return value <= 600 ? 'good' : value <= 1500 ? 'needs-improvement' : 'poor';
          default: return 'good';
        }
      };

      const getPercentile = (metric: string, value: number) => {
        // Simulate percentile ranking
        switch (metric) {
          case 'lcp': return Math.max(10, Math.min(90, 100 - (value / 50)));
          case 'fid': return Math.max(10, Math.min(90, 100 - (value / 5)));
          case 'cls': return Math.max(10, Math.min(90, 100 - (value * 200)));
          case 'ttfb': return Math.max(10, Math.min(90, 100 - (value / 20)));
          default: return 75;
        }
      };

      const performanceScore = Math.round((
        (getRating('lcp', lcp) === 'good' ? 100 : getRating('lcp', lcp) === 'needs-improvement' ? 60 : 30) +
        (getRating('fid', fid) === 'good' ? 100 : getRating('fid', fid) === 'needs-improvement' ? 60 : 30) +
        (getRating('cls', cls) === 'good' ? 100 : getRating('cls', cls) === 'needs-improvement' ? 60 : 30)
      ) / 3);

      return {
        path: page.path,
        visits: Math.floor(Math.random() * 1000) + 100,
        avgLoadTime: Math.random() * 3000 + 1000,
        bounceRate: Math.random() * 50 + 20,
        conversionRate: Math.random() * 15 + 5,
        performanceScore,
        securityScore: Math.floor(Math.random() * 30) + 70,
        accessibilityScore: Math.floor(Math.random() * 20) + 80,
        seoScore: Math.floor(Math.random() * 25) + 75,
        coreWebVitals: {
          lcp: { value: lcp, rating: getRating('lcp', lcp), percentile: Math.round(getPercentile('lcp', lcp)) },
          fid: { value: fid, rating: getRating('fid', fid), percentile: Math.round(getPercentile('fid', fid)) },
          cls: { value: cls, rating: getRating('cls', cls), percentile: Math.round(getPercentile('cls', cls)) },
          ttfb: { value: ttfb, rating: getRating('ttfb', ttfb), percentile: Math.round(getPercentile('ttfb', ttfb)) }
        },
        errors: {
          jsErrors: Math.floor(Math.random() * 10),
          networkErrors: Math.floor(Math.random() * 5),
          renderErrors: Math.floor(Math.random() * 3)
        }
      };
    });
  }, []);

  const generatePerformanceTrends = useCallback((): PerformanceTrend[] => {
    const trends: PerformanceTrend[] = [];
    const hoursBack = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    
    for (let i = hoursBack; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
      
      trends.push({
        timestamp,
        lcp: Math.random() * 1000 + 1500 + Math.sin(i / 12) * 200,
        fid: Math.random() * 50 + 75 + Math.sin(i / 8) * 15,
        cls: Math.random() * 0.1 + 0.05 + Math.sin(i / 6) * 0.02,
        tti: Math.random() * 1500 + 2000 + Math.sin(i / 10) * 300,
        activeUsers: Math.floor(Math.random() * 500 + 200 + Math.sin(i / 4) * 100),
        pageLoadTime: Math.random() * 1000 + 1200 + Math.sin(i / 14) * 200,
        errorRate: Math.random() * 2 + 0.5,
        satisfactionScore: Math.random() * 20 + 75 + Math.sin(i / 16) * 5,
        securityThreats: Math.floor(Math.random() * 10 + Math.sin(i / 20) * 3),
        serverResponseTime: Math.random() * 300 + 150 + Math.sin(i / 18) * 50,
        cacheHitRate: Math.random() * 20 + 75 + Math.sin(i / 22) * 5,
        bandwidthUsage: Math.random() * 100 + 200 + Math.sin(i / 24) * 30
      });
    }
    
    return trends;
  }, [timeRange]);

  const calculateRealTimeMetrics = useCallback((sessions: UserSession[]) => {
    const recentSessions = sessions.filter(s => 
      Date.now() - s.startTime.getTime() < 60 * 60 * 1000 // Last hour
    );
    
    const activeUsers = recentSessions.filter(s => !s.endTime || 
      Date.now() - s.endTime.getTime() < 5 * 60 * 1000 // Active in last 5 minutes
    ).length;
    
    const avgSessionDuration = recentSessions.length > 0 
      ? recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length 
      : 0;
    
    const bounceRate = recentSessions.length > 0 
      ? (recentSessions.filter(s => s.bounced).length / recentSessions.length) * 100 
      : 0;
    
    const avgPageLoadTime = recentSessions.length > 0 
      ? recentSessions.reduce((sum, s) => sum + s.performanceMetrics.lcp, 0) / recentSessions.length 
      : 0;
    
    const errorRate = Math.random() * 2 + 0.5; // Simulated
    const securityThreats = recentSessions.reduce((sum, s) => 
      sum + s.securityEvents.cspViolations + s.securityEvents.xssAttempts + 
      s.securityEvents.authFailures + s.securityEvents.suspiciousRequests, 0
    );
    
    const goodExperiences = recentSessions.filter(s => s.userExperience === 'good').length;
    const satisfactionScore = recentSessions.length > 0 
      ? (goodExperiences / recentSessions.length) * 100 
      : 0;
    
    const conversionRate = recentSessions.length > 0
      ? (recentSessions.reduce((sum, s) => sum + s.businessMetrics.conversionEvents, 0) / recentSessions.length) * 100
      : 0;
    
    return {
      activeUsers,
      avgSessionDuration: Math.round(avgSessionDuration),
      bounceRate: Math.round(bounceRate * 10) / 10,
      pageLoadTime: Math.round(avgPageLoadTime),
      errorRate: Math.round(errorRate * 10) / 10,
      satisfactionScore: Math.round(satisfactionScore),
      securityThreats,
      serverUptime: 99.5 + Math.random() * 0.4,
      cacheEfficiency: 80 + Math.random() * 15,
      conversionRate: Math.round(conversionRate * 10) / 10
    };
  }, []);

  useEffect(() => {
    const sessions = generateMockSessions();
    setSessions(sessions);
    setPagePerformance(generatePagePerformance());
    setPerformanceTrends(generatePerformanceTrends());
    setRealTimeMetrics(calculateRealTimeMetrics(sessions));

    // Generate alerts
    const newAlerts = [
      {
        id: 'alert-1',
        type: 'performance' as const,
        severity: 'medium' as const,
        message: 'Page load time increased by 15% in the last hour',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        resolved: false
      },
      {
        id: 'alert-2',
        type: 'security' as const,
        severity: 'high' as const,
        message: 'Unusual number of authentication failures detected',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        resolved: false
      },
      {
        id: 'alert-3',
        type: 'business' as const,
        severity: 'low' as const,
        message: 'Conversion rate dropped below threshold on /auth page',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolved: true
      }
    ];
    setAlerts(newAlerts);

    // Update real-time metrics every 30 seconds
    const interval = setInterval(() => {
      const updatedSessions = generateMockSessions();
      setSessions(updatedSessions);
      setRealTimeMetrics(calculateRealTimeMetrics(updatedSessions));
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange, generateMockSessions, generatePagePerformance, generatePerformanceTrends, calculateRealTimeMetrics]);

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'good': return <Badge className="bg-green-100 text-green-800">Good</Badge>;
      case 'needs-improvement': return <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>;
      case 'poor': return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const deviceStats = sessions.reduce((acc, session) => {
    acc[session.device] = (acc[session.device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceChartData = Object.entries(deviceStats).map(([device, count]) => ({
    device: device.charAt(0).toUpperCase() + device.slice(1),
    count,
    percentage: Math.round((count / sessions.length) * 100)
  }));

  const experienceDistribution = sessions.reduce((acc, session) => {
    acc[session.userExperience] = (acc[session.userExperience] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const exportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      summary: realTimeMetrics,
      performanceTrends: performanceTrends.slice(-10),
      pagePerformance,
      sessionSample: sessions.slice(0, 5),
      alerts: alerts.filter(a => !a.resolved)
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rum-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const experienceChartData = Object.entries(experienceDistribution).map(([experience, count]) => ({
    experience: experience.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count,
    percentage: Math.round((count / sessions.length) * 100),
    color: experience === 'good' ? '#22c55e' : experience === 'needs-improvement' ? '#eab308' : '#ef4444'
  }));

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Active Alerts</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              {alerts.filter(a => !a.resolved).map(alert => (
                <div key={alert.id} className="flex items-center justify-between text-sm">
                  <span>{alert.message}</span>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Time Range Selector and Export */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Real User Monitoring</h2>
        <div className="flex space-x-2">
          <Button onClick={exportReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
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

      {/* Real-time Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{realTimeMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(realTimeMetrics.avgSessionDuration / 60)}m</div>
            <p className="text-xs text-muted-foreground">{realTimeMetrics.avgSessionDuration % 60}s</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(realTimeMetrics.pageLoadTime / 1000).toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">Average LCP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Threats</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{realTimeMetrics.securityThreats}</div>
            <p className="text-xs text-muted-foreground">Past hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{realTimeMetrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Goal completions</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{realTimeMetrics.serverUptime.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Efficiency</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeMetrics.cacheEfficiency.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Hit rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{realTimeMetrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">Client errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{realTimeMetrics.satisfactionScore}%</div>
            <p className="text-xs text-muted-foreground">Good experiences</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="pages">Page Analytics</TabsTrigger>
          <TabsTrigger value="users">User Insights</TabsTrigger>
          <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
          <TabsTrigger value="security">Security Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Web Vitals Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals Trends</CardTitle>
                <CardDescription>Real user performance metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(time) => new Date(time).toLocaleString()}
                      formatter={(value: number, name: string) => [
                        name === 'cls' ? value.toFixed(3) : `${Math.round(value)}${name === 'cls' ? '' : 'ms'}`,
                        name.toUpperCase()
                      ]}
                    />
                    <Line type="monotone" dataKey="lcp" stroke="#8884d8" name="LCP" />
                    <Line type="monotone" dataKey="fid" stroke="#82ca9d" name="FID" />
                    <Line type="monotone" dataKey="tti" stroke="#ffc658" name="TTI" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Experience Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Experience Distribution</CardTitle>
                <CardDescription>Current user satisfaction breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={experienceChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ experience, percentage }) => `${experience}: ${percentage}%`}
                    >
                      {experienceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Active Users Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>User activity and engagement trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceTrends}>
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
                      dataKey="activeUsers" 
                      stroke="#8884d8" 
                      fill="#8884d8"
                      fillOpacity={0.6}
                      name="Active Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>User sessions by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deviceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'count' ? `${value} sessions` : `${value}%`,
                        name === 'count' ? 'Sessions' : 'Percentage'
                      ]}
                    />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance Analytics</CardTitle>
              <CardDescription>Performance breakdown by page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pagePerformance.map((page) => (
                  <div key={page.path} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{page.path}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{page.visits} visits</span>
                          <span>{(page.avgLoadTime / 1000).toFixed(1)}s avg load</span>
                          <span>{page.bounceRate.toFixed(1)}% bounce rate</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{page.performanceScore}</div>
                        <p className="text-xs text-muted-foreground">Performance Score</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {(page.coreWebVitals.lcp.value / 1000).toFixed(2)}s
                        </div>
                        <div className="text-sm text-muted-foreground">LCP</div>
                        {getRatingBadge(page.coreWebVitals.lcp.rating)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {page.coreWebVitals.lcp.percentile}th percentile
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {page.coreWebVitals.fid.value.toFixed(0)}ms
                        </div>
                        <div className="text-sm text-muted-foreground">FID</div>
                        {getRatingBadge(page.coreWebVitals.fid.rating)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {page.coreWebVitals.fid.percentile}th percentile
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {page.coreWebVitals.cls.value.toFixed(3)}
                        </div>
                        <div className="text-sm text-muted-foreground">CLS</div>
                        {getRatingBadge(page.coreWebVitals.cls.rating)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {page.coreWebVitals.cls.percentile}th percentile
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {page.coreWebVitals.ttfb.value.toFixed(0)}ms
                        </div>
                        <div className="text-sm text-muted-foreground">TTFB</div>
                        {getRatingBadge(page.coreWebVitals.ttfb.rating)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {page.coreWebVitals.ttfb.percentile}th percentile
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Scores */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-sm font-medium">Security</div>
                        <div className="text-2xl font-bold text-green-600">{page.securityScore}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Accessibility</div>
                        <div className="text-2xl font-bold text-blue-600">{page.accessibilityScore}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">SEO</div>
                        <div className="text-2xl font-bold text-purple-600">{page.seoScore}</div>
                      </div>
                    </div>

                    {/* Error Summary */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm font-medium mb-2">Error Summary</div>
                      <div className="flex space-x-4 text-sm text-muted-foreground">
                        <span>JS Errors: {page.errors.jsErrors}</span>
                        <span>Network Errors: {page.errors.networkErrors}</span>
                        <span>Render Errors: {page.errors.renderErrors}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>User sessions by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    sessions.reduce((acc, session) => {
                      const key = `${session.country}, ${session.city}`;
                      acc[key] = (acc[key] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).slice(0, 8).map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{count}</span>
                        <Progress value={(count / sessions.length) * 100} className="w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
                <CardDescription>Browser and OS distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Browsers</h5>
                    {Object.entries(
                      sessions.reduce((acc, session) => {
                        acc[session.browser] = (acc[session.browser] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([browser, count]) => (
                      <div key={browser} className="flex items-center justify-between mb-1">
                        <span className="text-sm">{browser}</span>
                        <span className="text-sm font-medium">
                          {Math.round((count / sessions.length) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Operating Systems</h5>
                    {Object.entries(
                      sessions.reduce((acc, session) => {
                        acc[session.os] = (acc[session.os] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([os, count]) => (
                      <div key={os} className="flex items-center justify-between mb-1">
                        <span className="text-sm">{os}</span>
                        <span className="text-sm font-medium">
                          {Math.round((count / sessions.length) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live User Sessions</CardTitle>
              <CardDescription>Real-time user activity and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {session.device === 'desktop' && <Monitor className="h-4 w-4" />}
                          {session.device === 'mobile' && <Smartphone className="h-4 w-4" />}
                          {session.device === 'tablet' && <Monitor className="h-4 w-4" />}
                          <span className="font-medium capitalize">{session.device}</span>
                          <Badge className={getExperienceColor(session.userExperience)}>
                            {session.userExperience.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{session.country}, {session.city}</span>
                          <span>{session.browser} on {session.os}</span>
                          <span>{session.connectionType.toUpperCase()}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Duration: {Math.floor(session.duration / 60)}m {session.duration % 60}s</span>
                          <span>Pages: {session.pageViews}</span>
                          <span>Started: {session.startTime.toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">LCP:</span> {(session.performanceMetrics.lcp / 1000).toFixed(2)}s
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">FID:</span> {session.performanceMetrics.fid.toFixed(0)}ms
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">CLS:</span> {session.performanceMetrics.cls.toFixed(3)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">TTFB:</span> {session.performanceMetrics.ttfb.toFixed(0)}ms
                        </div>
                      </div>
                    </div>
                    
                    {/* Security Events */}
                    {(session.securityEvents.cspViolations + session.securityEvents.xssAttempts + 
                      session.securityEvents.authFailures + session.securityEvents.suspiciousRequests) > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-1">Security Events</div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {session.securityEvents.cspViolations > 0 && (
                            <Badge variant="destructive">CSP: {session.securityEvents.cspViolations}</Badge>
                          )}
                          {session.securityEvents.xssAttempts > 0 && (
                            <Badge variant="destructive">XSS: {session.securityEvents.xssAttempts}</Badge>
                          )}
                          {session.securityEvents.authFailures > 0 && (
                            <Badge variant="destructive">Auth: {session.securityEvents.authFailures}</Badge>
                          )}
                          {session.securityEvents.suspiciousRequests > 0 && (
                            <Badge variant="destructive">Suspicious: {session.securityEvents.suspiciousRequests}</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Business Metrics */}
                    {session.businessMetrics.conversionEvents > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-1">Business Impact</div>
                        <div className="text-sm text-green-600">
                          {session.businessMetrics.conversionEvents} conversions
                          {session.businessMetrics.revenueGenerated > 0 && 
                            ` • $${session.businessMetrics.revenueGenerated.toFixed(2)} revenue`
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Threat Timeline</CardTitle>
                <CardDescription>Security events and threats over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceTrends}>
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
                      dataKey="securityThreats" 
                      stroke="#ef4444" 
                      name="Security Threats"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Event Summary</CardTitle>
                <CardDescription>Breakdown of security events by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['CSP Violations', 'XSS Attempts', 'Auth Failures', 'Suspicious Requests'].map((event, index) => {
                    const count = sessions.reduce((sum, session) => {
                      switch (index) {
                        case 0: return sum + session.securityEvents.cspViolations;
                        case 1: return sum + session.securityEvents.xssAttempts;
                        case 2: return sum + session.securityEvents.authFailures;
                        case 3: return sum + session.securityEvents.suspiciousRequests;
                        default: return sum;
                      }
                    }, 0);
                    
                    return (
                      <div key={event} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count}</span>
                          <Badge variant={count > 10 ? 'destructive' : count > 5 ? 'default' : 'secondary'}>
                            {count > 10 ? 'High' : count > 5 ? 'Medium' : 'Low'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Metrics</CardTitle>
                <CardDescription>Server and network performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(time) => new Date(time).toLocaleString()}
                    />
                    <Bar yAxisId="left" dataKey="serverResponseTime" fill="#8884d8" name="Server Response Time (ms)" />
                    <Line yAxisId="right" type="monotone" dataKey="cacheHitRate" stroke="#82ca9d" name="Cache Hit Rate (%)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Impact Analysis</CardTitle>
                <CardDescription>Revenue and conversion metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${sessions.reduce((sum, s) => sum + s.businessMetrics.revenueGenerated, 0).toFixed(0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {sessions.reduce((sum, s) => sum + s.businessMetrics.conversionEvents, 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Conversions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Newsletter Signups</span>
                      <span>{sessions.filter(s => s.businessMetrics.goalCompletions.includes('newsletter_signup')).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Demo Requests</span>
                      <span>{sessions.filter(s => s.businessMetrics.goalCompletions.includes('demo_request')).length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealUserMonitoring;
