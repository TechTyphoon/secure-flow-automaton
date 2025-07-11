
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useSecurityMetrics, useVulnerabilitiesDemo } from '@/hooks/useSecurityData';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthContext';

const SecurityMetrics = () => {
  const { user } = useAuth();
  const { data: metrics, isLoading, error } = useSecurityMetrics();
  const { data: demoVulnerabilities } = useVulnerabilitiesDemo();
  const { toast } = useToast();

  // Calculate demo metrics if no user is logged in
  const demoMetrics = React.useMemo(() => {
    if (!user && demoVulnerabilities) {
      const activeVulns = demoVulnerabilities.filter(v => v.status === 'new').length;
      const criticalCount = demoVulnerabilities.filter(v => v.severity === 'CRITICAL').length;
      const highCount = demoVulnerabilities.filter(v => v.severity === 'HIGH').length;
      const mediumCount = demoVulnerabilities.filter(v => v.severity === 'MEDIUM').length;
      
      const securityScore = Math.max(0, 100 - (criticalCount * 20 + highCount * 10 + mediumCount * 5));
      
      return {
        securityScore,
        activeVulnerabilities: activeVulns,
        recentFixes: 0,
        avgScanDuration: 2.5,
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
