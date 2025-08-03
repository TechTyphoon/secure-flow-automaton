import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Heart, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Monitor,
  Wifi,
  WifiOff,
  Timer
} from 'lucide-react';
import { useHealth } from './HealthProvider';

const HealthDashboard: React.FC = () => {
  const { metrics, checkHealth, isHealthy, recordPageView } = useHealth();
  const [isChecking, setIsChecking] = useState(false);

  React.useEffect(() => {
    recordPageView('health-dashboard');
  }, [recordPageView]);

  const handleManualHealthCheck = async () => {
    setIsChecking(true);
    try {
      await checkHealth();
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getConnectivityIcon = (connectivity: string) => {
    switch (connectivity) {
      case 'connected': return <Wifi className="h-4 w-4 text-green-600" />;
      case 'slow': return <Wifi className="h-4 w-4 text-yellow-600" />;
      case 'disconnected': return <WifiOff className="h-4 w-4 text-red-600" />;
      default: return <Wifi className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatMemory = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1024)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  const getHealthScore = () => {
    let score = 100;
    
    // Deduct for errors
    score -= Math.min(metrics.errorCount * 5, 30);
    
    // Deduct for connectivity issues
    if (metrics.apiConnectivity === 'disconnected') score -= 40;
    else if (metrics.apiConnectivity === 'slow') score -= 20;
    
    // Deduct for slow response times
    if (metrics.responseTime > 3000) score -= 20;
    else if (metrics.responseTime > 1000) score -= 10;
    
    // Deduct for high memory usage
    if (metrics.memoryUsage > 100) score -= 15;
    else if (metrics.memoryUsage > 50) score -= 5;
    
    return Math.max(score, 0);
  };

  const healthScore = getHealthScore();

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-red-500" />
              <span>Application Health</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isHealthy ? "default" : "destructive"}
                className="capitalize"
              >
                {getStatusIcon(metrics.appStatus)}
                <span className="ml-1">{metrics.appStatus}</span>
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleManualHealthCheck}
                disabled={isChecking}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                Check Now
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Health Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Health Score</span>
                <span className="text-2xl font-bold">{healthScore}%</span>
              </div>
              <Progress value={healthScore} className="h-2" />
            </div>

            {/* Response Time */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <span className="text-lg font-semibold">
                {formatDuration(metrics.responseTime)}
              </span>
            </div>

            {/* Memory Usage */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <span className="text-lg font-semibold">
                {formatMemory(metrics.memoryUsage)}
              </span>
            </div>

            {/* API Connectivity */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {getConnectivityIcon(metrics.apiConnectivity)}
                <span className="text-sm font-medium">API Status</span>
              </div>
              <span className="text-lg font-semibold capitalize">
                {metrics.apiConnectivity}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="session">Session</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Loading Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Bundle Load Time:</span>
                      <span className="font-mono">{formatDuration(metrics.bundleLoadTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Health Check Time:</span>
                      <span className="font-mono">{formatDuration(metrics.responseTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Resource Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Memory Usage:</span>
                      <span className="font-mono">{formatMemory(metrics.memoryUsage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Check:</span>
                      <span className="font-mono">{metrics.lastCheck.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Error Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Errors in Session:</span>
                  <Badge variant={metrics.errorCount > 0 ? "destructive" : "default"}>
                    {metrics.errorCount}
                  </Badge>
                </div>

                {metrics.userSession.errors.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recent Errors:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {metrics.userSession.errors.map((error, index) => (
                        <div
                          key={index}
                          className="p-2 bg-red-50 border border-red-200 rounded text-sm font-mono"
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-green-600">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No errors recorded in this session</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Session Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Session ID:</span>
                    <span className="font-mono text-sm">{metrics.userSession.sessionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start Time:</span>
                    <span>{metrics.userSession.startTime.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{formatDuration(Date.now() - metrics.userSession.startTime.getTime())}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Page Views:</span>
                    <span className="font-semibold">{metrics.userSession.pageViews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Errors:</span>
                    <span className="font-semibold">{metrics.userSession.errors.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthDashboard;
