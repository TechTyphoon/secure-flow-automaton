import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  Settings,
  Activity,
  Database
} from 'lucide-react';
import { SecurityHealthMonitor, ServiceHealthStatus } from '@/services/security/healthMonitor';
import { SecurityNotificationService } from '@/services/security/notifications';
import { sonarQubeService } from '@/services/security/sonarqube';
import { snykService } from '@/services/security/snyk';

const SecurityServiceDashboard = () => {
  const [healthStatuses, setHealthStatuses] = useState<ServiceHealthStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [testResults, setTestResults] = useState<any>({});

  const healthMonitor = new SecurityHealthMonitor();
  const notifications = new SecurityNotificationService();

  useEffect(() => {
    checkServiceHealth();
    // Auto-refresh every 5 minutes
    const interval = setInterval(checkServiceHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkServiceHealth = async () => {
    setIsLoading(true);
    try {
      const statuses = await healthMonitor.checkAllServices();
      setHealthStatuses(statuses);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to check service health:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testSonarQubeIntegration = async () => {
    try {
      console.log('🔍 Testing SonarQube integration...');
      const metrics = await sonarQubeService.getProjectMetrics();
      const issues = await sonarQubeService.getIssues();
      
      setTestResults(prev => ({
        ...prev,
        sonarqube: {
          success: true,
          metrics,
          issuesCount: issues?.length || 0,
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log('✅ SonarQube test completed:', { metrics, issuesCount: issues?.length });
    } catch (error) {
      console.error('❌ SonarQube test failed:', error);
      setTestResults(prev => ({
        ...prev,
        sonarqube: { success: false, error: error.message, timestamp: new Date().toISOString() }
      }));
    }
  };

  const testSnykIntegration = async () => {
    try {
      console.log('🔍 Testing Snyk integration...');
      const projects = await snykService.getProjects();
      const testResult = await snykService.testDependencies();
      
      setTestResults(prev => ({
        ...prev,
        snyk: {
          success: true,
          projectsCount: projects?.length || 0,
          vulnerabilities: testResult?.summary || {},
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log('✅ Snyk test completed:', { projectsCount: projects?.length, vulnerabilities: testResult?.summary });
    } catch (error) {
      console.error('❌ Snyk test failed:', error);
      setTestResults(prev => ({
        ...prev,
        snyk: { success: false, error: error.message, timestamp: new Date().toISOString() }
      }));
    }
  };

  const testSlackNotification = async () => {
    try {
      console.log('🔍 Testing Slack notification...');
      const success = await notifications.sendAlert({
        id: `test-${Date.now()}`,
        type: 'security_hotspot',
        severity: 'medium',
        title: 'Test Security Alert',
        description: 'This is a test alert from SecureFlow Automaton to verify Slack integration is working properly.',
        source: 'system',
        component: 'dashboard',
        createdAt: new Date().toISOString(),
      });
      
      setTestResults(prev => ({
        ...prev,
        slack: {
          success,
          timestamp: new Date().toISOString(),
          message: success ? 'Test alert sent successfully' : 'Failed to send test alert'
        }
      }));
      
      console.log(success ? '✅ Slack test completed' : '❌ Slack test failed');
    } catch (error) {
      console.error('❌ Slack test failed:', error);
      setTestResults(prev => ({
        ...prev,
        slack: { success: false, error: error.message, timestamp: new Date().toISOString() }
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      healthy: 'default',
      degraded: 'secondary', 
      unhealthy: 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const overallHealth = healthMonitor.getOverallSystemHealth();

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Services Status</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkServiceHealth}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Last updated: {lastUpdate.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(overallHealth.status)}
              <span className="font-medium">Overall System Health</span>
            </div>
            {getStatusBadge(overallHealth.status)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {overallHealth.message} ({overallHealth.healthyServices}/{overallHealth.totalServices} services operational)
          </p>
          
          {overallHealth.status === 'degraded' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Some services are running in fallback mode. Check individual service configurations below.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Service Status</TabsTrigger>
          <TabsTrigger value="integration">Integration Tests</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          {healthStatuses.map((status) => (
            <Card key={status.service}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <CardTitle className="text-lg capitalize">{status.service}</CardTitle>
                  </div>
                  {getStatusBadge(status.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      {getStatusIcon(status.status)}
                      <span className="capitalize">{status.status}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Response Time:</span>
                    <p className="mt-1">{status.responseTime > 0 ? `${status.responseTime}ms` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Configuration:</span>
                    <p className="mt-1">
                      {status.configuration?.enabled ? '✅ Enabled' : '❌ Disabled'} | 
                      {status.configuration?.hasCredentials ? ' 🔑 Credentials' : ' ❌ No Credentials'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Endpoint:</span>
                    <p className="mt-1 truncate">{status.configuration?.endpoint}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-muted-foreground">Message:</span>
                  <p className="mt-1 text-sm">{status.message}</p>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Last checked: {new Date(status.lastCheck).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>SonarQube Integration</CardTitle>
                <CardDescription>Test real API connection</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={testSonarQubeIntegration} className="w-full mb-3">
                  <Activity className="h-4 w-4 mr-2" />
                  Test SonarQube API
                </Button>
                {testResults.sonarqube && (
                  <div className="text-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      {testResults.sonarqube.success ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span>{testResults.sonarqube.success ? 'Success' : 'Failed'}</span>
                    </div>
                    {testResults.sonarqube.success ? (
                      <p>Issues found: {testResults.sonarqube.issuesCount}</p>
                    ) : (
                      <p className="text-red-500">{testResults.sonarqube.error}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Snyk Integration</CardTitle>
                <CardDescription>Test dependency scanning</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={testSnykIntegration} className="w-full mb-3">
                  <Shield className="h-4 w-4 mr-2" />
                  Test Snyk API
                </Button>
                {testResults.snyk && (
                  <div className="text-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      {testResults.snyk.success ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span>{testResults.snyk.success ? 'Success' : 'Failed'}</span>
                    </div>
                    {testResults.snyk.success ? (
                      <div>
                        <p>Projects: {testResults.snyk.projectsCount}</p>
                        <p>Vulnerabilities: {testResults.snyk.vulnerabilities?.total || 0}</p>
                      </div>
                    ) : (
                      <p className="text-red-500">{testResults.snyk.error}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slack Notifications</CardTitle>
                <CardDescription>Test alert delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={testSlackNotification} className="w-full mb-3">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Send Test Alert
                </Button>
                {testResults.slack && (
                  <div className="text-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      {testResults.slack.success ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      <span>{testResults.slack.success ? 'Success' : 'Failed'}</span>
                    </div>
                    <p>{testResults.slack.message || testResults.slack.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environment Configuration</CardTitle>
              <CardDescription>Current API configuration status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Security APIs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>SonarQube Token:</span>
                      <span>{(import.meta.env.VITE_SONAR_TOKEN || import.meta.env.SONAR_TOKEN) ? '✅ Configured' : '❌ Missing'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Snyk Token:</span>
                      <span>{(import.meta.env.VITE_SNYK_TOKEN || import.meta.env.SNYK_TOKEN) ? '✅ Configured' : '❌ Missing'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GitHub Token:</span>
                      <span>{(import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.GITHUB_TOKEN) ? '✅ Configured' : '❌ Missing'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Notifications</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Slack Webhook:</span>
                      <span>{(import.meta.env.VITE_SLACK_WEBHOOK_URL || import.meta.env.SLACK_WEBHOOK_URL) ? '✅ Configured' : '❌ Missing'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slack Channel:</span>
                      <span>{import.meta.env.VITE_SLACK_CHANNEL || import.meta.env.SLACK_CHANNEL || '#security-alerts'}</span>
                    </div>
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

export default SecurityServiceDashboard;
