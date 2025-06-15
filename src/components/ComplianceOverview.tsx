
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield,
  FileText,
  Award
} from 'lucide-react';

const ComplianceOverview = () => {
  const complianceFrameworks = [
    {
      name: 'SOC 2 Type II',
      status: 'compliant',
      score: 98,
      controls: { passed: 47, total: 48 },
      lastAudit: '2024-01-15'
    },
    {
      name: 'ISO 27001',
      status: 'compliant',
      score: 96,
      controls: { passed: 114, total: 114 },
      lastAudit: '2024-02-01'
    },
    {
      name: 'PCI DSS',
      status: 'partial',
      score: 89,
      controls: { passed: 267, total: 300 },
      lastAudit: '2024-01-28'
    },
    {
      name: 'GDPR',
      status: 'review',
      score: 94,
      controls: { passed: 28, total: 30 },
      lastAudit: '2024-02-10'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-security-secure" />;
      case 'partial': return <Clock className="h-4 w-4 text-security-medium" />;
      case 'review': return <XCircle className="h-4 w-4 text-security-critical" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-security-secure/10 text-security-secure border-security-secure/20';
      case 'partial': return 'bg-security-medium/10 text-security-medium border-security-medium/20';
      case 'review': return 'bg-security-critical/10 text-security-critical border-security-critical/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-primary" />
          <span>Compliance Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complianceFrameworks.map((framework, index) => (
            <div key={index} className="p-4 rounded-lg border border-border hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(framework.status)}
                  <h4 className="font-medium text-foreground">{framework.name}</h4>
                </div>
                <Badge className={getStatusColor(framework.status)}>
                  {framework.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Compliance Score</span>
                  <span className="font-medium text-foreground">{framework.score}%</span>
                </div>
                <Progress value={framework.score} className="h-2" />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Controls: {framework.controls.passed}/{framework.controls.total}</span>
                  <span>Last Audit: {framework.lastAudit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Next Compliance Audit</span>
            </div>
            <span className="text-sm text-muted-foreground">March 15, 2024</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceOverview;
