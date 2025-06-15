
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const SecurityMetrics = () => {
  const metrics = [
    {
      title: 'Security Score',
      value: '94',
      unit: '/100',
      icon: Shield,
      color: 'text-security-secure',
      bgColor: 'bg-security-secure/10',
      trend: '+2%'
    },
    {
      title: 'Active Vulnerabilities',
      value: '7',
      unit: ' issues',
      icon: AlertTriangle,
      color: 'text-security-medium',
      bgColor: 'bg-security-medium/10',
      trend: '-12%'
    },
    {
      title: 'Remediated Today',
      value: '23',
      unit: ' fixes',
      icon: CheckCircle,
      color: 'text-security-secure',
      bgColor: 'bg-security-secure/10',
      trend: '+45%'
    },
    {
      title: 'Scan Duration',
      value: '4.2',
      unit: ' min',
      icon: Clock,
      color: 'text-security-scanning',
      bgColor: 'bg-security-scanning/10',
      trend: '-8%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <Card key={index} className="glass-morphism hover:bg-white/10 transition-all duration-300">
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
