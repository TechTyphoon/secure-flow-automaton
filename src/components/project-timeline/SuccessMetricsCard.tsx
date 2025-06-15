
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, TrendingUp, Target, Clock, Shield, Users, AlertTriangle, CheckCircle } from 'lucide-react';

const SuccessMetricsCard = () => {
  const metrics = [
    {
      title: 'Vulnerability Reduction Rate',
      value: '87%',
      change: '+12%',
      trend: 'up',
      description: 'Critical/High vulnerabilities reduced over 30 days',
      target: '85%',
      status: 'exceeding'
    },
    {
      title: 'Mean Time To Remediate (MTTR)',
      value: '2.4 hrs',
      change: '-45%',
      trend: 'down',
      description: 'Average time to fix identified vulnerabilities',
      target: '< 4 hrs',
      status: 'on-track'
    },
    {
      title: 'Automated Remediation Success Rate',
      value: '94%',
      change: '+8%',
      trend: 'up',
      description: 'Vulnerabilities auto-fixed or with PRs created',
      target: '90%',
      status: 'exceeding'
    },
    {
      title: 'Build Failure Rate (Security)',
      value: '3.2%',
      change: '+1.1%',
      trend: 'up',
      description: 'Builds failing due to security policy violations',
      target: '2-5%',
      status: 'on-track'
    },
    {
      title: 'Developer Satisfaction Score',
      value: '4.6/5',
      change: '+0.3',
      trend: 'up',
      description: 'Survey results on security tool usability & value',
      target: '> 4.0',
      status: 'exceeding'
    },
    {
      title: 'Compliance Adherence',
      value: '98%',
      change: '+2%',
      trend: 'up',
      description: 'OWASP Top 10 & internal policy compliance',
      target: '95%',
      status: 'exceeding'
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
              <span className="text-sm font-medium text-indigo-900">3 running</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">Pipeline Uptime</span>
              <span className="text-sm font-medium text-indigo-900">99.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">Weekly Reports</span>
              <span className="text-sm font-medium text-indigo-900">Auto-generated</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-700">Team Alerts</span>
              <span className="text-sm font-medium text-indigo-900">Real-time</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuccessMetricsCard;
