
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield,
  FileText,
  Award
} from 'lucide-react';
import { useComplianceData } from '@/hooks/useComplianceData';

const ComplianceOverview = () => {
  const { data: complianceFrameworks, isLoading, error } = useComplianceData();

  if (isLoading) {
    return (
      <Card className="border-2 border-security-secure">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-security-secure" />
            <span>Compliance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Error loading compliance data:', error);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return <CheckCircle className="h-4 w-4 text-security-secure" />;
      case 'PARTIAL': return <Clock className="h-4 w-4 text-security-medium" />;
      case 'REVIEW': return <XCircle className="h-4 w-4 text-security-critical" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'bg-security-secure/10 text-security-secure border-security-secure/20';
      case 'PARTIAL': return 'bg-security-medium/10 text-security-medium border-security-medium/20';
      case 'REVIEW': return 'bg-security-critical/10 text-security-critical border-security-critical/20';
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
          {complianceFrameworks?.map((framework, index) => (
            <div key={index} className="p-4 rounded-lg border border-border hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(framework.status)}
                  <h4 className="font-medium text-foreground">{framework.name}</h4>
                </div>
                <Badge className={getStatusColor(framework.status)}>
                  {framework.status}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Compliance Score</span>
                  <span className="font-medium text-foreground">{framework.score}%</span>
                </div>
                <Progress value={framework.score} className="h-2" />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Controls: {framework.controls}</span>
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
