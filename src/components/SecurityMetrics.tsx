
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, Activity, Database, Container } from 'lucide-react';
import { useSecurityMetrics, useSecurityAlerts } from '@/hooks/useRealSecurityData';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthContext';
import { Badge } from '@/components/ui/badge';

const SecurityMetrics = () => {
  const { user } = useAuth();
  const { data: metrics, isLoading, error } = useSecurityMetrics();
  const { data: alerts, isLoading: alertsLoading } = useSecurityAlerts();
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
        
        {/* Comprehensive Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={`overview-${i}`}>
              <CardHeader>
                <Skeleton className="h-5 w-32" data-testid="skeleton" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" data-testid="skeleton" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Please sign in to view metrics
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vulnerabilities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Sign in to view vulnerabilities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Fixes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              No data available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scan Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              No recent scans
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              No security scans yet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vulnerabilities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Run your first scan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Fixes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No fixes tracked yet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scan Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-muted-foreground">
              Start your first scan
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get security score color
  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get vulnerability count color
  const getVulnCountColor = (count: number) => {
    if (count === 0) return 'text-green-600';
    if (count <= 5) return 'text-yellow-600';
    if (count <= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get trend direction indicator
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(metrics.securityScore)}`}>
              {metrics.securityScore}
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(metrics.trendDirection || 'stable')}
              <p className="text-xs text-muted-foreground">
                {metrics.securityScore >= 90 ? 'Excellent security posture' : 
                 metrics.securityScore >= 70 ? 'Good security practices' : 
                 metrics.securityScore >= 50 ? 'Needs improvement' : 'Critical issues present'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vulnerabilities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getVulnCountColor(metrics.totalVulnerabilities)}`}>
              {metrics.totalVulnerabilities}
            </div>
            <div className="flex space-x-2 mt-1">
              {metrics.criticalCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {metrics.criticalCount} Critical
                </Badge>
              )}
              {metrics.highCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {metrics.highCount} High
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alertsLoading ? '...' : alerts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {alerts?.filter(a => a.severity === 'critical').length || 0} critical alerts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scan Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {metrics.scanStatus}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.lastScanDate ? 
                `Last scan: ${new Date(metrics.lastScanDate).toLocaleDateString()}` : 
                'No scans yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Security Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SonarQube SAST</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(metrics.sonarQubeScore || 80)}`}>
              {metrics.sonarQubeScore || 80}
            </div>
            <p className="text-xs text-muted-foreground">
              Static Application Security Testing
            </p>
            <div className="mt-2">
              <Badge variant={metrics.sonarQubeScore >= 85 ? "default" : "secondary"} className="text-xs">
                {metrics.sonarQubeScore >= 85 ? "Quality Gate: OK" : "Quality Gate: Warning"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Snyk Dependencies</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(metrics.snykScore || 85)}`}>
              {metrics.snykScore || 85}
            </div>
            <p className="text-xs text-muted-foreground">
              Dependency vulnerability scanning
            </p>
            <div className="mt-2">
              <Badge variant={metrics.snykScore >= 90 ? "default" : "secondary"} className="text-xs">
                {metrics.snykScore >= 90 ? "No High Vulns" : "Vulnerabilities Found"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Container Security</CardTitle>
            <Container className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(metrics.containerScore || 80)}`}>
              {metrics.containerScore || 80}
            </div>
            <p className="text-xs text-muted-foreground">
              Docker image & configuration analysis
            </p>
            <div className="mt-2">
              <Badge variant={metrics.containerScore >= 85 ? "default" : "secondary"} className="text-xs">
                {metrics.containerScore >= 85 ? "Secure Config" : "Issues Found"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts Section */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Recent Security Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'high' ? 'bg-orange-500' :
                    alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium">{alert.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {alert.source}
                      </Badge>
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'high' ? 'secondary' : 'outline'
                      } className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.description}
                    </p>
                    {alert.component && (
                      <p className="text-xs text-blue-600 mt-1">
                        Component: {alert.component}
                      </p>
                    )}
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

export default SecurityMetrics;
