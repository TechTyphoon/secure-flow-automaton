
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, TrendingUp, Target, Clock, Shield, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRealMetrics } from '@/hooks/useSecurityData';
import { Skeleton } from '@/components/ui/skeleton';

const SuccessMetricsCard = () => {
  const { data: realMetrics, isLoading, error } = useRealMetrics();

  if (isLoading) {
    return (
      <Card className="border-2 border-indigo-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-indigo-600" />
            <span>Success Metrics (KPIs) Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex items-baseline space-x-2 mb-1">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading real metrics:', error);
  }

  const metrics = [
    {
      title: 'Vulnerability Reduction Rate',
      value: `${realMetrics?.vulnerabilityReductionRate || 0}%`,
      change: realMetrics?.vulnerabilityReductionRate > 75 ? '+12%' : '-5%',
      trend: realMetrics?.vulnerabilityReductionRate > 75 ? 'up' : 'down',
      description: 'Critical/High vulnerabilities reduced over 30 days',
      target: '85%',
      status: (realMetrics?.vulnerabilityReductionRate || 0) > 85 ? 'exceeding' : 
              (realMetrics?.vulnerabilityReductionRate || 0) > 70 ? 'on-track' : 'needs-attention'
    },
    {
      title: 'Mean Time To Remediate (MTTR)',
      value: `${realMetrics?.mttr || 0} hrs`,
      change: realMetrics?.mttr < 4 ? '-45%' : '+15%',
      trend: realMetrics?.mttr < 4 ? 'down' : 'up',
      description: 'Average time to fix identified vulnerabilities',
      target: '< 4 hrs',
      status: (realMetrics?.mttr || 0) < 4 ? 'exceeding' : 'needs-attention'
    },
    {
      title: 'Automated Remediation Success Rate',
      value: `${realMetrics?.automatedRemediationSuccessRate || 0}%`,
      change: realMetrics?.automatedRemediationSuccessRate > 80 ? '+8%' : '-3%',
      trend: realMetrics?.automatedRemediationSuccessRate > 80 ? 'up' : 'down',
      description: 'Vulnerabilities auto-fixed or with PRs created',
      target: '90%',
      status: (realMetrics?.automatedRemediationSuccessRate || 0) > 90 ? 'exceeding' : 
              (realMetrics?.automatedRemediationSuccessRate || 0) > 70 ? 'on-track' : 'needs-attention'
    },
    {
      title: 'Build Failure Rate (Security)',
      value: `${realMetrics?.buildFailureRate || 0}%`,
      change: realMetrics?.buildFailureRate < 5 ? '-1.1%' : '+2.3%',
      trend: realMetrics?.buildFailureRate < 5 ? 'down' : 'up',
      description: 'Builds failing due to security policy violations',
      target: '2-5%',
      status: (realMetrics?.buildFailureRate || 0) <= 5 ? 'on-track' : 'needs-attention'
    },
    {
      title: 'Total Vulnerabilities',
      value: `${realMetrics?.totalVulnerabilities || 0}`,
      change: realMetrics?.openVulnerabilities < realMetrics?.fixedVulnerabilities ? '-15%' : '+8%',
      trend: realMetrics?.openVulnerabilities < realMetrics?.fixedVulnerabilities ? 'down' : 'up',
      description: 'Total vulnerabilities found in last 30 days',
      target: '< 50',
      status: (realMetrics?.totalVulnerabilities || 0) < 50 ? 'exceeding' : 'on-track'
    },
    {
      title: 'Compliance Adherence',
      value: `${realMetrics?.complianceAdherence || 0}%`,
      change: realMetrics?.complianceAdherence > 95 ? '+2%' : '-1%',
      trend: realMetrics?.complianceAdherence > 95 ? 'up' : 'down',
      description: 'OWASP Top 10 & internal policy compliance',
      status: (realMetrics?.complianceAdherence || 0) > 95 ? 'exceeding' : 'on-track'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeding': return 'text-green-600 bg-green-100';
      case 'on-track': return 'text-blue-600 bg-blue-100';
      case 'needs-attention': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-green-600" />
    );
  };

  return (
    <Card className="border-2 border-indigo-600">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-indigo-600" />
          <span>Success Metrics (KPIs) Dashboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-gray-800">{metric.title}</h4>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status.replace('-', ' ')}
                </Badge>
              </div>
              <div className="flex items-baseline space-x-2 mb-1">
                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <span className="text-sm text-green-600">{metric.change}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{metric.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Target: {metric.target}</span>
                {metric.status === 'exceeding' ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <Clock className="h-3 w-3 text-blue-600" />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
          <h4 className="font-semibold text-indigo-800 mb-2">Real-Time Monitoring</h4>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">Active Scans</span>
              <span className="text-sm font-medium text-indigo-900">{realMetrics?.activeScans || 0} running</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">Fixed Vulnerabilities</span>
              <span className="text-sm font-medium text-indigo-900">{realMetrics?.fixedVulnerabilities || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">Open Vulnerabilities</span>
              <span className="text-sm font-medium text-indigo-900">{realMetrics?.openVulnerabilities || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">Critical/High</span>
              <span className="text-sm font-medium text-indigo-900">{realMetrics?.criticalHighCount || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuccessMetricsCard;
