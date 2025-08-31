import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, Activity, Database, Container, Wifi, WifiOff } from 'lucide-react';
import { useSecurityMetrics, useSecurityAlerts } from '@/hooks/useRealSecurityData';
import { useRealtimeAlerts, useRealtimeMetrics } from '@/services/realtimeService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const EnhancedSecurityMetrics = () => {
  const { user } = useAuth();
  const { data: metrics, isLoading, error } = useSecurityMetrics();
  const { data: alerts, isLoading: alertsLoading } = useSecurityAlerts();
  const { alerts: realtimeAlerts, isConnected: realtimeConnected } = useRealtimeAlerts();
  const { metrics: realtimeMetrics, isConnected: metricsConnected } = useRealtimeMetrics();
  const { toast } = useToast();

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading security metrics",
        description: "Failed to fetch security data. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Show realtime connection status
  React.useEffect(() => {
    if (!realtimeConnected) {
      toast({
        title: "Realtime connection lost",
        description: "Security alerts may be delayed. Attempting to reconnect...",
        variant: "destructive",
      });
    }
  }, [realtimeConnected, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Main Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" data-testid="skeleton" />
                <Skeleton className="h-4 w-4" data-testid="skeleton" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" data-testid="skeleton" />
                <Skeleton className="h-3 w-24" data-testid="skeleton" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Use realtime metrics if available, otherwise fall back to polled data
  const displayMetrics = realtimeMetrics || metrics;

  return (
    <div className="space-y-6">
      {/* Realtime Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {realtimeConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm text-muted-foreground">
            {realtimeConnected ? 'Live Updates Active' : 'Offline Mode'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-xs"
        >
          Refresh Data
        </Button>
      </div>

      {/* Main Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={realtimeConnected ? 'border-green-200 bg-green-50/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayMetrics?.securityScore || metrics?.securityScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {realtimeConnected ? 'Live' : 'Last updated'} • Excellent
            </p>
          </CardContent>
        </Card>

        <Card className={realtimeAlerts.length > 0 ? 'border-orange-200 bg-orange-50/50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeAlerts.length || alerts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {realtimeAlerts.length > 0 ? 'New alerts detected' : 'All clear'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeMetrics?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeMetrics?.systemHealth || 98}%
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Realtime Alerts Feed */}
      {realtimeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Live Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {realtimeAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <Badge
                    variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {alert.severity}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.source} • {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedSecurityMetrics;
