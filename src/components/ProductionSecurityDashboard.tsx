import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  TestTube,
  Bell,
  Database,
  Code,
  Package,
  GitBranch
} from 'lucide-react';
import { useSecurityScansReal } from '../hooks/useSecurityData';
import { RealNotificationService } from '../services/notifications/realNotificationService';
import { RealMonitoringService } from '../services/monitoring/realMonitoringService';

interface SecurityMetrics {
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  resolvedIssues: number;
  openIssues: number;
  lastScan: string;
  scanStatus: 'completed' | 'in_progress' | 'failed' | 'not_started';
}

const ProductionSecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalIssues: 0,
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 0,
    lowIssues: 0,
    resolvedIssues: 0,
    openIssues: 0,
    lastScan: new Date().toISOString(),
    scanStatus: 'not_started'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [notifications, setNotifications] = useState<string[]>([]);

  const { data: securityScans, isLoading: scansLoading, refetch } = useSecurityScansReal();
  const notificationService = new RealNotificationService();
  const monitoringService = new RealMonitoringService();

  useEffect(() => {
    if (securityScans) {
      updateMetrics();
    }
  }, [securityScans]);

  const updateMetrics = () => {
    if (!securityScans) return;

    const sonarQube = securityScans.sonarQube;
    const snyk = securityScans.snyk;
    const github = securityScans.github;
    const docker = securityScans.docker;

    const newMetrics: SecurityMetrics = {
      totalIssues: (sonarQube?.totalIssues || 0) + 
                   (snyk?.totalVulnerabilities || 0) + 
                   (github?.totalAlerts || 0) + 
                   (docker?.totalVulnerabilities || 0),
      criticalIssues: (sonarQube?.criticalIssues?.length || 0) + 
                      (snyk?.criticalVulnerabilities?.length || 0) + 
                      (github?.criticalAlerts?.length || 0) + 
                      (docker?.criticalVulnerabilities || 0),
      highIssues: (sonarQube?.highIssues?.length || 0) + 
                  (snyk?.highVulnerabilities?.length || 0) + 
                  (github?.highAlerts?.length || 0) + 
                  (docker?.highVulnerabilities || 0),
      mediumIssues: (sonarQube?.mediumIssues?.length || 0) + 
                    (snyk?.mediumVulnerabilities?.length || 0) + 
                    (github?.mediumAlerts?.length || 0) + 
                    (docker?.mediumVulnerabilities || 0),
      lowIssues: (sonarQube?.lowIssues?.length || 0) + 
                 (snyk?.lowVulnerabilities?.length || 0) + 
                 (github?.lowAlerts?.length || 0) + 
                 (docker?.lowVulnerabilities || 0),
      resolvedIssues: 0, // Would come from historical data
      openIssues: 0, // Would be calculated from total - resolved
      lastScan: new Date().toISOString(),
      scanStatus: 'completed'
    };

    newMetrics.openIssues = newMetrics.totalIssues - newMetrics.resolvedIssues;

    setMetrics(newMetrics);
    setLastUpdate(new Date());
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refetch();
      addNotification('Security scan refreshed successfully');
    } catch (error) {
      addNotification('Failed to refresh security scan');
      console.error('Refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await notificationService.testNotifications();
      if (result.overall) {
        addNotification('Notification test completed successfully');
      } else {
        addNotification('Notification test failed');
      }
    } catch (error) {
      addNotification('Notification test failed');
      console.error('Notification test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestMonitoring = async () => {
    setIsLoading(true);
    try {
      const result = await monitoringService.testMonitoring();
      if (result.overall) {
        addNotification('Monitoring test completed successfully');
      } else {
        addNotification('Monitoring test failed');
      }
    } catch (error) {
      addNotification('Monitoring test failed');
      console.error('Monitoring test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    // Keep only last 5 notifications
    if (notifications.length >= 5) {
      setNotifications(prev => prev.slice(-4));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🛡️ Production Security Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time security monitoring with live integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleTestNotifications}
            disabled={isLoading}
            variant="outline"
          >
            <Bell className="h-4 w-4 mr-2" />
            Test Notifications
          </Button>
          <Button
            onClick={handleTestMonitoring}
            disabled={isLoading}
            variant="outline"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test Monitoring
          </Button>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleString()}
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              Across all security tools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              Immediate attention required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.highIssues}</div>
            <p className="text-xs text-muted-foreground">
              High priority fixes needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.openIssues}</div>
            <p className="text-xs text-muted-foreground">
              Issues requiring resolution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Tools Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Security Tools Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="font-medium">SonarQube</span>
              </div>
              <Badge variant={securityScans?.sonarQube ? 'default' : 'secondary'}>
                {securityScans?.sonarQube ? 'Connected' : 'Not Configured'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="font-medium">Snyk</span>
              </div>
              <Badge variant={securityScans?.snyk ? 'default' : 'secondary'}>
                {securityScans?.snyk ? 'Connected' : 'Not Configured'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                <span className="font-medium">GitHub</span>
              </div>
              <Badge variant={securityScans?.github ? 'default' : 'secondary'}>
                {securityScans?.github ? 'Connected' : 'Not Configured'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="font-medium">Docker</span>
              </div>
              <Badge variant={securityScans?.docker ? 'default' : 'secondary'}>
                {securityScans?.docker ? 'Connected' : 'Not Configured'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Issue Severity Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Critical', count: metrics.criticalIssues, severity: 'critical' },
              { label: 'High', count: metrics.highIssues, severity: 'high' },
              { label: 'Medium', count: metrics.mediumIssues, severity: 'medium' },
              { label: 'Low', count: metrics.lowIssues, severity: 'low' }
            ].map((item) => (
              <div key={item.severity} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-20">
                  {getSeverityIcon(item.severity)}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex-1">
                  <Progress 
                    value={metrics.totalIssues > 0 ? (item.count / metrics.totalIssues) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <Alert key={index}>
                  <AlertDescription>{notification}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {scansLoading && (
        <Alert>
          <Activity className="h-4 w-4 animate-spin" />
          <AlertTitle>Loading Security Data</AlertTitle>
          <AlertDescription>
            Fetching real-time security information from configured tools...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProductionSecurityDashboard; 