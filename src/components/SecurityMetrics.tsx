
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useSecurityMetrics } from '@/hooks/useRealSecurityData';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthContext';

const SecurityMetrics = () => {
  const { user } = useAuth();
  const { data: metrics, isLoading, error } = useSecurityMetrics();
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getSecurityScoreColor(metrics.securityScore)}`}>
            {metrics.securityScore}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.securityScore >= 90 ? 'Excellent' : 
             metrics.securityScore >= 70 ? 'Good' : 
             metrics.securityScore >= 50 ? 'Needs Improvement' : 'Critical'}
          </p>
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
          <p className="text-xs text-muted-foreground">
            {metrics.criticalCount > 0 ? `${metrics.criticalCount} critical` : 
             metrics.highCount > 0 ? `${metrics.highCount} high` : 
             'No critical issues'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.criticalCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.criticalCount}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.criticalCount === 0 ? 'No critical issues' : 'Requires immediate attention'}
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
  );
};

export default SecurityMetrics;
      };
    }
    return null;
  }, [user, demoVulnerabilities]);

  const actualMetrics = user ? metrics : demoMetrics;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-morphism">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading security metrics:', error);
  }

  const handleMetricClick = (metricType: string, value: string) => {
    const messages = {
      'Security Score': `Current security score is ${value}/100. Click to view detailed breakdown.`,
      'Active Vulnerabilities': `${value} vulnerabilities need attention. Click to prioritize remediation.`,
      'Remediated Today': `${value} vulnerabilities fixed today. Great progress!`,
      'Scan Duration': `Average scan time is ${value} minutes. System performance is optimal.`
    };

    toast({
      title: metricType,
      description: messages[metricType as keyof typeof messages] || `${metricType}: ${value}`,
    });

    console.log(`Metric clicked: ${metricType} - ${value}`);
  };

  const metricsData = [
    {
      title: 'Security Score',
      value: actualMetrics?.securityScore?.toString() || '0',
      unit: '/100',
      icon: Shield,
      color: 'text-security-secure',
      bgColor: 'bg-security-secure/10',
      trend: '+2%'
    },
    {
      title: 'Active Vulnerabilities',
      value: actualMetrics?.activeVulnerabilities?.toString() || '0',
      unit: ' issues',
      icon: AlertTriangle,
      color: 'text-security-medium',
      bgColor: 'bg-security-medium/10',
      trend: '-12%'
    },
    {
      title: 'Remediated Today',
      value: actualMetrics?.recentFixes?.toString() || '0',
      unit: ' fixes',
      icon: CheckCircle,
      color: 'text-security-secure',
      bgColor: 'bg-security-secure/10',
      trend: '+45%'
    },
    {
      title: 'Scan Duration',
      value: actualMetrics?.avgScanDuration?.toString() || '0',
      unit: ' min',
      icon: Clock,
      color: 'text-security-scanning',
      bgColor: 'bg-security-scanning/10',
      trend: '-8%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricsData.map((metric, index) => (
        <Card 
          key={index} 
          className="glass-morphism hover:bg-white/10 transition-all duration-300 cursor-pointer"
          onClick={() => handleMetricClick(metric.title, metric.value + metric.unit)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-foreground">{metric.value}</span>
              <span className="text-sm text-muted-foreground">{metric.unit}</span>
            </div>
            <div className="flex items-center mt-2 text-xs">
              <TrendingUp className="h-3 w-3 text-security-secure mr-1" />
              <span className="text-security-secure">{metric.trend}</span>
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SecurityMetrics;
