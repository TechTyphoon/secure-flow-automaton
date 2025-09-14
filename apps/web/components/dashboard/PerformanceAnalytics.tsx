import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  ComposedChart
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Globe, 
  Smartphone,
  Monitor,
  Clock,
  Zap,
  Activity,
  Target,
  Eye,
  MousePointer,
  Gauge,
  Wifi,
  Server,
  Database
} from 'lucide-react';

interface PerformanceMetric {
  timestamp: Date;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
  tti: number;
  speedIndex: number;
  totalBlockingTime: number;
  pageViews: number;
  userSatisfactionScore: number;
}

interface UserExperienceData {
  device: string;
  connection: string;
  avgLcp: number;
  avgFid: number;
  avgCls: number;
  userCount: number;
  satisfactionScore: number;
}

interface PerformanceCorrelation {
  metric1: string;
  metric2: string;
  correlation: number;
  description: string;
}

interface BusinessImpactMetric {
  metric: string;
  performanceThreshold: number;
  conversionRate: number;
  bounceRate: number;
  revenueImpact: number;
  userSatisfaction: number;
}

interface CompetitorBenchmark {
  competitor: string;
  lcp: number;
  fid: number;
  cls: number;
  speedIndex: number;
  overallScore: number;
  industry: string;
}

const PerformanceAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [userExperienceData, setUserExperienceData] = useState<UserExperienceData[]>([]);
  const [performanceCorrelations, setPerformanceCorrelations] = useState<PerformanceCorrelation[]>([]);
  const [businessImpactMetrics, setBusinessImpactMetrics] = useState<BusinessImpactMetric[]>([]);
  const [competitorBenchmarks, setCompetitorBenchmarks] = useState<CompetitorBenchmark[]>([]);

  const generatePerformanceMetrics = (hours: number): PerformanceMetric[] => {
    const metrics: PerformanceMetric[] = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      const basePerformance = {
        lcp: 2500 + Math.sin(i / 6) * 500 + Math.random() * 800,
        fid: 100 + Math.sin(i / 4) * 30 + Math.random() * 50,
        cls: 0.1 + Math.sin(i / 8) * 0.05 + Math.random() * 0.1,
        ttfb: 400 + Math.sin(i / 12) * 200 + Math.random() * 300,
        fcp: 1800 + Math.sin(i / 10) * 400 + Math.random() * 600,
        tti: 3500 + Math.sin(i / 14) * 800 + Math.random() * 1000,
        speedIndex: 2800 + Math.sin(i / 16) * 600 + Math.random() * 800,
        totalBlockingTime: 300 + Math.sin(i / 5) * 100 + Math.random() * 200
      };

      const lcpScore = basePerformance.lcp <= 2500 ? 100 : basePerformance.lcp <= 4000 ? 60 : 30;
      const fidScore = basePerformance.fid <= 100 ? 100 : basePerformance.fid <= 300 ? 60 : 30;
      const clsScore = basePerformance.cls <= 0.1 ? 100 : basePerformance.cls <= 0.25 ? 60 : 30;
      const userSatisfactionScore = (lcpScore + fidScore + clsScore) / 3;
      
      metrics.push({
        timestamp,
        ...basePerformance,
        pageViews: Math.floor(Math.random() * 100) + 50,
        userSatisfactionScore
      });
    }
    
    return metrics;
  };

  const generateUserExperienceData = (): UserExperienceData[] => {
    const devices = ['Desktop', 'Mobile', 'Tablet'];
    const connections = ['4G', '3G', 'WiFi', '5G'];
    const data: UserExperienceData[] = [];
    
    devices.forEach(device => {
      connections.forEach(connection => {
        // Mobile and 3G typically have worse performance
        const deviceMultiplier = device === 'Mobile' ? 1.5 : device === 'Tablet' ? 1.2 : 1.0;
        const connectionMultiplier = connection === '3G' ? 2.0 : connection === '4G' ? 1.3 : connection === '5G' ? 0.8 : 1.0;
        const multiplier = deviceMultiplier * connectionMultiplier;
        
        const avgLcp = (2000 + Math.random() * 1000) * multiplier;
        const avgFid = (80 + Math.random() * 40) * multiplier;
        const avgCls = (0.08 + Math.random() * 0.12) * multiplier;
        
        // Calculate satisfaction score
        const lcpScore = avgLcp <= 2500 ? 100 : avgLcp <= 4000 ? 60 : 30;
        const fidScore = avgFid <= 100 ? 100 : avgFid <= 300 ? 60 : 30;
        const clsScore = avgCls <= 0.1 ? 100 : avgCls <= 0.25 ? 60 : 30;
        const satisfactionScore = (lcpScore + fidScore + clsScore) / 3;
        
        data.push({
          device,
          connection,
          avgLcp,
          avgFid,
          avgCls,
          userCount: Math.floor(Math.random() * 1000) + 100,
          satisfactionScore
        });
      });
    });
    
    return data;
  };

  const generatePerformanceCorrelations = (): PerformanceCorrelation[] => {
    return [
      {
        metric1: 'Largest Contentful Paint',
        metric2: 'Bounce Rate',
        correlation: 0.85,
        description: 'Strong positive correlation: slower LCP significantly increases bounce rate'
      },
      {
        metric1: 'First Input Delay',
        metric2: 'User Engagement',
        correlation: -0.72,
        description: 'Strong negative correlation: higher FID reduces user engagement'
      },
      {
        metric1: 'Cumulative Layout Shift',
        metric2: 'Conversion Rate',
        correlation: -0.68,
        description: 'Moderate negative correlation: layout shifts harm conversions'
      },
      {
        metric1: 'Speed Index',
        metric2: 'Page Views per Session',
        correlation: -0.61,
        description: 'Moderate negative correlation: faster loading increases page views'
      },
      {
        metric1: 'Total Blocking Time',
        metric2: 'User Satisfaction',
        correlation: -0.79,
        description: 'Strong negative correlation: blocking time hurts user satisfaction'
      },
      {
        metric1: 'Time to Interactive',
        metric2: 'Form Completion Rate',
        correlation: -0.65,
        description: 'Moderate negative correlation: delayed interactivity reduces form completions'
      }
    ];
  };

  const generateBusinessImpactMetrics = (): BusinessImpactMetric[] => {
    return [
      {
        metric: 'Excellent Performance (LCP < 2.5s)',
        performanceThreshold: 2.5,
        conversionRate: 3.8,
        bounceRate: 28,
        revenueImpact: 100,
        userSatisfaction: 92
      },
      {
        metric: 'Good Performance (LCP 2.5-4s)',
        performanceThreshold: 4.0,
        conversionRate: 2.9,
        bounceRate: 42,
        revenueImpact: 76,
        userSatisfaction: 74
      },
      {
        metric: 'Poor Performance (LCP > 4s)',
        performanceThreshold: 6.0,
        conversionRate: 1.8,
        bounceRate: 58,
        revenueImpact: 45,
        userSatisfaction: 51
      }
    ];
  };

  const generateCompetitorBenchmarks = (): CompetitorBenchmark[] => {
    return [
      {
        competitor: 'Our Application',
        lcp: 3.2,
        fid: 85,
        cls: 0.15,
        speedIndex: 2.8,
        overallScore: 78,
        industry: 'DevSecOps'
      },
      {
        competitor: 'GitLab Security',
        lcp: 2.9,
        fid: 92,
        cls: 0.12,
        speedIndex: 2.6,
        overallScore: 82,
        industry: 'DevSecOps'
      },
      {
        competitor: 'GitHub Advanced Security',
        lcp: 2.4,
        fid: 78,
        cls: 0.08,
        speedIndex: 2.2,
        overallScore: 89,
        industry: 'DevSecOps'
      },
      {
        competitor: 'Snyk Platform',
        lcp: 3.8,
        fid: 105,
        cls: 0.18,
        speedIndex: 3.1,
        overallScore: 71,
        industry: 'DevSecOps'
      },
      {
        competitor: 'Checkmarx One',
        lcp: 4.1,
        fid: 125,
        cls: 0.22,
        speedIndex: 3.4,
        overallScore: 65,
        industry: 'DevSecOps'
      }
    ];
  };

  const trendAnalysis = useMemo(() => {
    if (performanceMetrics.length < 2) return null;
    
    const recent = performanceMetrics.slice(-10);
    const older = performanceMetrics.slice(-20, -10);
    
    const avgRecent = {
      lcp: recent.reduce((sum, m) => sum + m.lcp, 0) / recent.length,
      fid: recent.reduce((sum, m) => sum + m.fid, 0) / recent.length,
      cls: recent.reduce((sum, m) => sum + m.cls, 0) / recent.length,
      tti: recent.reduce((sum, m) => sum + m.tti, 0) / recent.length,
      userSatisfactionScore: recent.reduce((sum, m) => sum + m.userSatisfactionScore, 0) / recent.length
    };
    
    const avgOlder = {
      lcp: older.reduce((sum, m) => sum + m.lcp, 0) / older.length,
      fid: older.reduce((sum, m) => sum + m.fid, 0) / older.length,
      cls: older.reduce((sum, m) => sum + m.cls, 0) / older.length,
      tti: older.reduce((sum, m) => sum + m.tti, 0) / older.length,
      userSatisfactionScore: older.reduce((sum, m) => sum + m.userSatisfactionScore, 0) / older.length
    };
    
    return {
      lcpTrend: ((avgRecent.lcp - avgOlder.lcp) / avgOlder.lcp) * 100,
      fidTrend: ((avgRecent.fid - avgOlder.fid) / avgOlder.fid) * 100,
      clsTrend: ((avgRecent.cls - avgOlder.cls) / avgOlder.cls) * 100,
      ttiTrend: ((avgRecent.tti - avgOlder.tti) / avgOlder.tti) * 100,
      satisfactionTrend: ((avgRecent.userSatisfactionScore - avgOlder.userSatisfactionScore) / avgOlder.userSatisfactionScore) * 100
    };
  }, [performanceMetrics]);

  useEffect(() => {
    const hours = {
      '1h': 1,
      '24h': 24,
      '7d': 168,
      '30d': 720
    }[timeRange];
    
    setPerformanceMetrics(generatePerformanceMetrics(hours));
    setUserExperienceData(generateUserExperienceData());
    setPerformanceCorrelations(generatePerformanceCorrelations());
    setBusinessImpactMetrics(generateBusinessImpactMetrics());
    setCompetitorBenchmarks(generateCompetitorBenchmarks());
  }, [timeRange]);

  const getTrendIcon = (trend: number) => {
    if (Math.abs(trend) < 1) return <Activity className="h-4 w-4 text-gray-400" />;
    return trend > 0 ? 
      <TrendingUp className="h-4 w-4 text-red-600" /> : 
      <TrendingDown className="h-4 w-4 text-green-600" />;
  };

  const getTrendColor = (trend: number, isGoodWhenLower = true) => {
    if (Math.abs(trend) < 1) return 'text-gray-500';
    const isGoodTrend = isGoodWhenLower ? trend < 0 : trend > 0;
    return isGoodTrend ? 'text-green-600' : 'text-red-600';
  };

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'Strong';
    if (abs >= 0.5) return 'Moderate';
    if (abs >= 0.3) return 'Weak';
    return 'Very Weak';
  };

  const devicePerformanceData = userExperienceData.reduce((acc, item) => {
    const existing = acc.find(d => d.device === item.device);
    if (existing) {
      existing.avgLcp = (existing.avgLcp + item.avgLcp) / 2;
      existing.avgFid = (existing.avgFid + item.avgFid) / 2;
      existing.userCount += item.userCount;
    } else {
      acc.push({
        device: item.device,
        avgLcp: item.avgLcp,
        avgFid: item.avgFid,
        userCount: item.userCount
      });
    }
    return acc;
  }, [] as { device: string; avgLcp: number; avgFid: number; userCount: number }[]);

  const satisfactionDistribution = userExperienceData.map(item => ({
    segment: `${item.device} - ${item.connection}`,
    satisfaction: item.satisfactionScore,
    users: item.userCount,
    color: item.satisfactionScore >= 80 ? '#22c55e' : item.satisfactionScore >= 60 ? '#eab308' : '#ef4444'
  }));

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Performance Analytics</h2>
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

      {/* Trend Summary */}
      {trendAnalysis && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">LCP Trend</CardTitle>
              {getTrendIcon(trendAnalysis.lcpTrend)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrendColor(trendAnalysis.lcpTrend, true)}`}>
                {trendAnalysis.lcpTrend > 0 ? '+' : ''}{trendAnalysis.lcpTrend.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">FID Trend</CardTitle>
              {getTrendIcon(trendAnalysis.fidTrend)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrendColor(trendAnalysis.fidTrend, true)}`}>
                {trendAnalysis.fidTrend > 0 ? '+' : ''}{trendAnalysis.fidTrend.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CLS Trend</CardTitle>
              {getTrendIcon(trendAnalysis.clsTrend)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrendColor(trendAnalysis.clsTrend, true)}`}>
                {trendAnalysis.clsTrend > 0 ? '+' : ''}{trendAnalysis.clsTrend.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TTI Trend</CardTitle>
              {getTrendIcon(trendAnalysis.ttiTrend)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrendColor(trendAnalysis.ttiTrend, true)}`}>
                {trendAnalysis.ttiTrend > 0 ? '+' : ''}{trendAnalysis.ttiTrend.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              {getTrendIcon(trendAnalysis.satisfactionTrend)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrendColor(trendAnalysis.satisfactionTrend, false)}`}>
                {trendAnalysis.satisfactionTrend > 0 ? '+' : ''}{trendAnalysis.satisfactionTrend.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">vs previous period</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="business">Business Impact</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Web Vitals Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals Over Time</CardTitle>
                <CardDescription>Track performance metrics evolution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={performanceMetrics.slice(-50)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(time) => new Date(time).toLocaleString()}
                      formatter={(value: number, name: string) => [
                        name === 'cls' ? value.toFixed(3) : `${Math.round(value)}${name === 'userSatisfactionScore' ? '%' : 'ms'}`,
                        name.toUpperCase()
                      ]}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="lcp" stroke="#8884d8" name="LCP" />
                    <Line yAxisId="left" type="monotone" dataKey="fid" stroke="#82ca9d" name="FID" />
                    <Line yAxisId="right" type="monotone" dataKey="userSatisfactionScore" stroke="#ff7300" name="Satisfaction" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Score Distribution</CardTitle>
                <CardDescription>User satisfaction breakdown over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceMetrics.slice(-20)}>
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
                      dataKey="userSatisfactionScore" 
                      stroke="#8884d8" 
                      fill="#8884d8"
                      fillOpacity={0.6}
                      name="User Satisfaction %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Loading Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Loading Performance Metrics</CardTitle>
                <CardDescription>TTFB, FCP, and TTI trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceMetrics.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(time) => new Date(time).toLocaleString()}
                      formatter={(value: number, name: string) => [`${Math.round(value)}ms`, name.toUpperCase()]}
                    />
                    <Line type="monotone" dataKey="ttfb" stroke="#8884d8" name="TTFB" />
                    <Line type="monotone" dataKey="fcp" stroke="#82ca9d" name="FCP" />
                    <Line type="monotone" dataKey="tti" stroke="#ffc658" name="TTI" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Interactivity Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Interactivity Performance</CardTitle>
                <CardDescription>FID and Total Blocking Time analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceMetrics.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(time) => new Date(time).toLocaleString()}
                      formatter={(value: number, name: string) => [`${Math.round(value)}ms`, name.toUpperCase()]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="fid" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8"
                      name="FID"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalBlockingTime" 
                      stackId="1"
                      stroke="#ff7300" 
                      fill="#ff7300"
                      name="Total Blocking Time"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Device Type</CardTitle>
                <CardDescription>LCP and FID comparison across devices</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={devicePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}${name.includes('Lcp') ? 'ms' : 'ms'}`,
                        name.includes('Lcp') ? 'LCP' : 'FID'
                      ]}
                    />
                    <Bar dataKey="avgLcp" fill="#8884d8" name="avgLcp" />
                    <Bar dataKey="avgFid" fill="#82ca9d" name="avgFid" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Satisfaction by Segment */}
            <Card>
              <CardHeader>
                <CardTitle>User Satisfaction Distribution</CardTitle>
                <CardDescription>Satisfaction scores across user segments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={satisfactionDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="users" name="Users" />
                    <YAxis dataKey="satisfaction" name="Satisfaction" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 border rounded shadow">
                              <p>{data.segment}</p>
                              <p>Users: {data.users}</p>
                              <p>Satisfaction: {data.satisfaction.toFixed(1)}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter dataKey="satisfaction" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Connection Type Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Connection Type</CardTitle>
                <CardDescription>Network impact on user experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['WiFi', '5G', '4G', '3G'].map(connection => {
                    const data = userExperienceData.filter(item => item.connection === connection);
                    const avgSatisfaction = data.reduce((sum, item) => sum + item.satisfactionScore, 0) / data.length;
                    const totalUsers = data.reduce((sum, item) => sum + item.userCount, 0);
                    
                    return (
                      <div key={connection} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          <Wifi className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{connection}</h4>
                            <p className="text-sm text-muted-foreground">{totalUsers} users</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{avgSatisfaction.toFixed(1)}%</div>
                          <Badge variant={avgSatisfaction >= 80 ? 'default' : avgSatisfaction >= 60 ? 'secondary' : 'destructive'}>
                            {avgSatisfaction >= 80 ? 'Excellent' : avgSatisfaction >= 60 ? 'Good' : 'Poor'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Performance */}
            <Card>
              <CardHeader>
                <CardTitle>User Experience Heatmap</CardTitle>
                <CardDescription>Performance visualization by user segments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {userExperienceData.map((item, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded text-center text-xs ${
                        item.satisfactionScore >= 80 ? 'bg-green-100 text-green-800' :
                        item.satisfactionScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <div className="font-medium">{item.device}</div>
                      <div>{item.connection}</div>
                      <div className="text-xs">{item.satisfactionScore.toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Correlation Analysis</CardTitle>
              <CardDescription>
                Statistical relationships between performance metrics and business outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceCorrelations.map((correlation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {correlation.metric1} ↔ {correlation.metric2}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={Math.abs(correlation.correlation) >= 0.7 ? 'default' : Math.abs(correlation.correlation) >= 0.5 ? 'secondary' : 'outline'}>
                          {getCorrelationStrength(correlation.correlation)}
                        </Badge>
                        <span className={`font-bold ${correlation.correlation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          r = {correlation.correlation.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{correlation.description}</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${Math.abs(correlation.correlation) >= 0.7 ? 'bg-red-600' : Math.abs(correlation.correlation) >= 0.5 ? 'bg-yellow-600' : 'bg-blue-600'}`}
                        style={{ width: `${Math.abs(correlation.correlation) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Impact Analysis</CardTitle>
              <CardDescription>
                How performance directly affects business metrics and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {businessImpactMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{metric.metric}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {metric.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {metric.bounceRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">Bounce Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {metric.revenueImpact}%
                        </div>
                        <div className="text-sm text-muted-foreground">Revenue Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {metric.userSatisfaction}%
                        </div>
                        <div className="text-sm text-muted-foreground">User Satisfaction</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Performance Benchmarks</CardTitle>
              <CardDescription>
                Compare your performance against industry competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitorBenchmarks.map((competitor, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${competitor.competitor === 'Our Application' ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{competitor.competitor}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{competitor.overallScore}</span>
                        <Badge variant={competitor.overallScore >= 85 ? 'default' : competitor.overallScore >= 70 ? 'secondary' : 'destructive'}>
                          {competitor.overallScore >= 85 ? 'Excellent' : competitor.overallScore >= 70 ? 'Good' : 'Poor'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{competitor.lcp.toFixed(1)}s</div>
                        <div className="text-muted-foreground">LCP</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{competitor.fid}ms</div>
                        <div className="text-muted-foreground">FID</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{competitor.cls.toFixed(3)}</div>
                        <div className="text-muted-foreground">CLS</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{competitor.speedIndex.toFixed(1)}s</div>
                        <div className="text-muted-foreground">Speed Index</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceAnalytics;
