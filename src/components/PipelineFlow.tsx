
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  GitBranch, 
  Code, 
  TestTube, 
  Shield, 
  Package, 
  Rocket,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

const PipelineFlow = () => {
  const stages = [
    {
      name: 'Source Code',
      icon: GitBranch,
      status: 'completed',
      duration: '2s',
      checks: ['Code Quality', 'License Scan']
    },
    {
      name: 'Build',
      icon: Code,
      status: 'completed',
      duration: '45s',
      checks: ['Dependency Check', 'SAST']
    },
    {
      name: 'Test',
      icon: TestTube,
      status: 'completed',
      duration: '1m 23s',
      checks: ['Unit Tests', 'Integration Tests']
    },
    {
      name: 'Security Scan',
      icon: Shield,
      status: 'scanning',
      duration: '2m 15s',
      checks: ['DAST', 'Container Scan', 'Secrets Scan']
    },
    {
      name: 'Package',
      icon: Package,
      status: 'pending',
      duration: '-',
      checks: ['Image Build', 'Vulnerability Scan']
    },
    {
      name: 'Deploy',
      icon: Rocket,
      status: 'pending',
      duration: '-',
      checks: ['Runtime Protection', 'Policy Check']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-security-secure" />;
      case 'scanning':
        return <Clock className="h-5 w-5 text-security-scanning animate-pulse-security" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-security-critical" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-security-secure bg-security-secure/5';
      case 'scanning':
        return 'border-security-scanning bg-security-scanning/5';
      case 'failed':
        return 'border-security-critical bg-security-critical/5';
      default:
        return 'border-muted bg-muted/5';
    }
  };

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <span>Pipeline Flow - main branch</span>
          <span className="text-sm text-muted-foreground">(Build #1247)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {stages.map((stage, index) => (
            <div key={index} className="relative">
              <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${getStatusColor(stage.status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <stage.icon className={`h-6 w-6 ${stage.status === 'completed' ? 'text-security-secure' : stage.status === 'scanning' ? 'text-security-scanning' : 'text-muted-foreground'}`} />
                  {getStatusIcon(stage.status)}
                </div>
                
                <h4 className="font-medium text-foreground mb-1">{stage.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">Duration: {stage.duration}</p>
                
                <div className="space-y-1">
                  {stage.checks.map((check, checkIndex) => (
                    <div key={checkIndex} className="flex items-center text-xs">
                      <div className={`h-1.5 w-1.5 rounded-full mr-2 ${stage.status === 'completed' ? 'bg-security-secure' : stage.status === 'scanning' ? 'bg-security-scanning' : 'bg-muted-foreground'}`} />
                      <span className="text-muted-foreground">{check}</span>
                    </div>
                  ))}
                </div>
                
                {stage.status === 'scanning' && (
                  <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-security-scanning rounded-full animate-scan-line w-1/3"></div>
                  </div>
                )}
              </div>
              
              {index < stages.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <div className="w-4 h-0.5 bg-border"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineFlow;
