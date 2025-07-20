import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  Eye, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  
  // Navigation Timing
  ttfb: number; // Time to First Byte
  fcp: number;  // First Contentful Paint
  tti: number;  // Time to Interactive
  
  // Resource Performance
  domContentLoaded: number;
  loadComplete: number;
  
  // User Experience
  bounceRate: number;
  sessionDuration: number;
  pageViews: number;
  
  // Network
  effectiveType: string;
  downlink: number;
  rtt: number;
  
  // Memory (if available)
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

interface PerformanceAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [performanceScore, setPerformanceScore] = useState(0);

  // Core Web Vitals thresholds
  const thresholds = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    ttfb: { good: 800, poor: 1800 },
    fcp: { good: 1800, poor: 3000 },
    tti: { good: 3800, poor: 7300 }
  };

  const getPerformanceRating = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics): number => {
    const weights = {
      lcp: 0.25,
      fid: 0.25,
      cls: 0.15,
      fcp: 0.15,
      ttfb: 0.10,
      tti: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([metric, weight]) => {
      const value = metrics[metric as keyof PerformanceMetrics] as number;
      const rating = getPerformanceRating(metric, value);
      
      let score = 0;
      switch (rating) {
        case 'good': score = 100; break;
        case 'needs-improvement': score = 60; break;
        case 'poor': score = 30; break;
      }
      
      totalScore += score * weight;
      totalWeight += weight;
    });

    return Math.round(totalScore / totalWeight);
  }, []);

  const collectPerformanceMetrics = useCallback((): PerformanceMetrics => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    // Simulate Core Web Vitals (in a real app, you'd use the web-vitals library)
    const lcp = navigation.loadEventEnd - navigation.navigationStart || Math.random() * 3000 + 1000;
    const fid = Math.random() * 200 + 50;
    const cls = Math.random() * 0.3;
    
    const metrics: PerformanceMetrics = {
      // Core Web Vitals
      lcp,
      fid,
      cls,
      
      // Navigation Timing
      ttfb: navigation.responseStart - navigation.requestStart || Math.random() * 1000 + 200,
      fcp: navigation.domContentLoadedEventStart - navigation.navigationStart || Math.random() * 2000 + 800,
      tti: navigation.domContentLoadedEventEnd - navigation.navigationStart || Math.random() * 4000 + 2000,
      
      // Resource Performance
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart || Math.random() * 3000 + 1500,
      loadComplete: navigation.loadEventEnd - navigation.navigationStart || Math.random() * 5000 + 2000,
      
      // User Experience (simulated)
      bounceRate: Math.random() * 50 + 20,
      sessionDuration: Math.random() * 300 + 120,
      pageViews: Math.floor(Math.random() * 10) + 1,
      
      // Network
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 100
    };

    // Memory metrics (if available)
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      metrics.usedJSHeapSize = memory.usedJSHeapSize;
      metrics.totalJSHeapSize = memory.totalJSHeapSize;
      metrics.jsHeapSizeLimit = memory.jsHeapSizeLimit;
    }

    return metrics;
  }, []);

  const checkPerformanceAlerts = useCallback((metrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];

    // Check Core Web Vitals
    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const value = metrics[metric as keyof PerformanceMetrics] as number;
      const rating = getPerformanceRating(metric, value);
      
      if (rating === 'poor') {
        newAlerts.push({
          id: `${metric}-${Date.now()}`,
          type: 'error',
          metric: metric.toUpperCase(),
          value,
          threshold: threshold.poor,
          message: `${metric.toUpperCase()} is performing poorly (${value.toFixed(0)}ms > ${threshold.poor}ms)`,
          timestamp: new Date()
        });
      } else if (rating === 'needs-improvement') {
        newAlerts.push({
          id: `${metric}-${Date.now()}`,
          type: 'warning',
          metric: metric.toUpperCase(),
          value,
          threshold: threshold.good,
          message: `${metric.toUpperCase()} needs improvement (${value.toFixed(0)}ms > ${threshold.good}ms)`,
          timestamp: new Date()
        });
      }
    });

    // Check memory usage (if available)
    if (metrics.usedJSHeapSize && metrics.jsHeapSizeLimit) {
      const memoryUsage = (metrics.usedJSHeapSize / metrics.jsHeapSizeLimit) * 100;
      if (memoryUsage > 80) {
        newAlerts.push({
          id: `memory-${Date.now()}`,
          type: memoryUsage > 90 ? 'error' : 'warning',
          metric: 'MEMORY',
          value: memoryUsage,
          threshold: 80,
          message: `High memory usage detected (${memoryUsage.toFixed(1)}%)`,
          timestamp: new Date()
        });
      }
    }

    setAlerts(prev => [...newAlerts, ...prev.slice(0, 4)]); // Keep only latest 5 alerts
  }, []);

  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics = collectPerformanceMetrics();
      setMetrics(newMetrics);
      setPerformanceScore(calculatePerformanceScore(newMetrics));
      checkPerformanceAlerts(newMetrics);
    };

    // Initial collection
    updateMetrics();

    // Set up periodic collection
    const interval = setInterval(updateMetrics, 30000); // Every 30 seconds

    // Network status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Performance observer for real-time updates
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          // Handle performance entries
          updateMetrics();
        });
        observer.observe({ entryTypes: ['navigation', 'paint', 'measure'] });
        
        return () => {
          observer.disconnect();
          clearInterval(interval);
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      } catch (e) {
        console.warn('PerformanceObserver not supported');
      }
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [collectPerformanceMetrics, calculatePerformanceScore, checkPerformanceAlerts]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Collecting performance metrics...</span>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800">Good</Badge>;
      case 'needs-improvement':
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>;
      case 'poor':
        return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
              {performanceScore}
            </div>
            <Progress value={performanceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Status</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.effectiveType.toUpperCase()} • {metrics.downlink}Mbps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.loadComplete / 1000).toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground">
              Load complete time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pageViews}</div>
            <p className="text-xs text-muted-foreground">
              Page views • {(metrics.sessionDuration / 60).toFixed(1)}m
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Performance Alerts</h3>
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.metric} Alert</AlertTitle>
              <AlertDescription>
                {alert.message}
                <span className="text-xs text-muted-foreground ml-2">
                  {alert.timestamp.toLocaleTimeString()}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>
            Essential metrics for user experience and SEO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Largest Contentful Paint</span>
                {getRatingBadge(getPerformanceRating('lcp', metrics.lcp))}
              </div>
              <div className="text-2xl font-bold">{(metrics.lcp / 1000).toFixed(2)}s</div>
              <Progress value={Math.min((metrics.lcp / 4000) * 100, 100)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">First Input Delay</span>
                {getRatingBadge(getPerformanceRating('fid', metrics.fid))}
              </div>
              <div className="text-2xl font-bold">{metrics.fid.toFixed(0)}ms</div>
              <Progress value={Math.min((metrics.fid / 300) * 100, 100)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cumulative Layout Shift</span>
                {getRatingBadge(getPerformanceRating('cls', metrics.cls))}
              </div>
              <div className="text-2xl font-bold">{metrics.cls.toFixed(3)}</div>
              <Progress value={Math.min((metrics.cls / 0.25) * 100, 100)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Timing */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Timing</CardTitle>
          <CardDescription>
            Detailed breakdown of page load performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{(metrics.ttfb / 1000).toFixed(2)}s</div>
              <div className="text-sm text-muted-foreground">Time to First Byte</div>
              {getRatingBadge(getPerformanceRating('ttfb', metrics.ttfb))}
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold">{(metrics.fcp / 1000).toFixed(2)}s</div>
              <div className="text-sm text-muted-foreground">First Contentful Paint</div>
              {getRatingBadge(getPerformanceRating('fcp', metrics.fcp))}
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold">{(metrics.tti / 1000).toFixed(2)}s</div>
              <div className="text-sm text-muted-foreground">Time to Interactive</div>
              {getRatingBadge(getPerformanceRating('tti', metrics.tti))}
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold">{(metrics.domContentLoaded / 1000).toFixed(2)}s</div>
              <div className="text-sm text-muted-foreground">DOM Content Loaded</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Usage */}
      {metrics.usedJSHeapSize && (
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
            <CardDescription>
              JavaScript heap memory consumption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Used Heap Size</span>
                <span className="font-medium">
                  {(metrics.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Total Heap Size</span>
                <span className="font-medium">
                  {((metrics.totalJSHeapSize || 0) / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Heap Size Limit</span>
                <span className="font-medium">
                  {((metrics.jsHeapSizeLimit || 0) / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              
              <Progress 
                value={(metrics.usedJSHeapSize / (metrics.jsHeapSizeLimit || 1)) * 100} 
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceMonitor;
