import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Zap, 
  Globe,
  Activity,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileWarning,
  Wifi
} from 'lucide-react';

interface ThreatEvent {
  id: string;
  type: 'malware' | 'phishing' | 'brute-force' | 'injection' | 'xss' | 'csrf' | 'ddos' | 'data-breach';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  status: 'active' | 'mitigated' | 'investigating' | 'resolved';
  affectedAssets: string[];
  mitigationActions: string[];
}

interface SecurityScore {
  overall: number;
  authentication: number;
  dataProtection: number;
  networkSecurity: number;
  applicationSecurity: number;
}

interface ThreatIntelligence {
  knownThreats: number;
  blockedAttempts: number;
  vulnerabilitiesPatched: number;
  securityUpdates: number;
  lastScanTime: Date;
}

const ThreatDetection: React.FC = () => {
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [securityScore, setSecurityScore] = useState<SecurityScore>({
    overall: 0,
    authentication: 0,
    dataProtection: 0,
    networkSecurity: 0,
    applicationSecurity: 0
  });
  const [threatIntelligence, setThreatIntelligence] = useState<ThreatIntelligence>({
    knownThreats: 0,
    blockedAttempts: 0,
    vulnerabilitiesPatched: 0,
    securityUpdates: 0,
    lastScanTime: new Date()
  });
  const [isScanning, setIsScanning] = useState(false);
  const [autoMitigationEnabled, setAutoMitigationEnabled] = useState(true);

  const getThreatSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getThreatStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'investigating': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'mitigated': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const generateMockThreats = useCallback((): ThreatEvent[] => {
    const threatTypes = [
      {
        type: 'brute-force' as const,
        title: 'Brute Force Attack Detected',
        description: 'Multiple failed login attempts from suspicious IP addresses',
        source: '192.168.1.100',
        severity: 'high' as const
      },
      {
        type: 'injection' as const,
        title: 'SQL Injection Attempt',
        description: 'Malicious SQL query detected in user input parameters',
        source: 'API Endpoint /api/users',
        severity: 'critical' as const
      },
      {
        type: 'xss' as const,
        title: 'Cross-Site Scripting Attempt',
        description: 'Potentially malicious script injection in user content',
        source: 'Contact Form',
        severity: 'medium' as const
      },
      {
        type: 'ddos' as const,
        title: 'DDoS Attack Pattern',
        description: 'Unusual traffic spike from multiple IP addresses',
        source: 'Multiple IPs',
        severity: 'high' as const
      },
      {
        type: 'malware' as const,
        title: 'Malware Signature Detected',
        description: 'Known malware pattern identified in uploaded file',
        source: 'File Upload System',
        severity: 'critical' as const
      }
    ];

    return threatTypes.slice(0, Math.floor(Math.random() * 4) + 1).map((threat, index) => ({
      id: `threat-${Date.now()}-${index}`,
      ...threat,
      timestamp: new Date(Date.now() - Math.random() * 86400000), // Last 24 hours
      status: Math.random() > 0.7 ? 'active' : ['investigating', 'mitigated', 'resolved'][Math.floor(Math.random() * 3)] as any,
      affectedAssets: ['Web Application', 'Database', 'API Gateway'].slice(0, Math.floor(Math.random() * 3) + 1),
      mitigationActions: [
        'IP blocking implemented',
        'Input validation enhanced',
        'Rate limiting applied',
        'Security headers updated',
        'WAF rules updated'
      ].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  }, []);

  const calculateSecurityScore = useCallback((): SecurityScore => {
    const activeThreats = threats.filter(t => t.status === 'active').length;
    const totalThreats = threats.length;
    
    // Base scores with some randomization for realism
    const base = {
      authentication: 85 + Math.random() * 10,
      dataProtection: 90 + Math.random() * 8,
      networkSecurity: 88 + Math.random() * 10,
      applicationSecurity: 82 + Math.random() * 12
    };

    // Reduce scores based on active threats
    const threatPenalty = activeThreats * 15;
    const adjustedScores = {
      authentication: Math.max(base.authentication - (threatPenalty * 0.3), 0),
      dataProtection: Math.max(base.dataProtection - (threatPenalty * 0.2), 0),
      networkSecurity: Math.max(base.networkSecurity - (threatPenalty * 0.4), 0),
      applicationSecurity: Math.max(base.applicationSecurity - (threatPenalty * 0.3), 0)
    };

    const overall = Object.values(adjustedScores).reduce((a, b) => a + b, 0) / 4;

    return {
      ...adjustedScores,
      overall: Math.round(overall)
    };
  }, [threats]);

  const runSecurityScan = useCallback(async () => {
    setIsScanning(true);
    
    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newThreats = generateMockThreats();
    setThreats(prev => [...newThreats, ...prev.slice(0, 10)]); // Keep latest 10 + new threats
    
    setThreatIntelligence(prev => ({
      ...prev,
      knownThreats: prev.knownThreats + Math.floor(Math.random() * 5),
      blockedAttempts: prev.blockedAttempts + Math.floor(Math.random() * 20) + 10,
      vulnerabilitiesPatched: prev.vulnerabilitiesPatched + Math.floor(Math.random() * 3),
      securityUpdates: prev.securityUpdates + Math.floor(Math.random() * 2),
      lastScanTime: new Date()
    }));
    
    setIsScanning(false);
  }, [generateMockThreats]);

  const mitigateThreat = useCallback((threatId: string) => {
    setThreats(prev => 
      prev.map(threat => 
        threat.id === threatId 
          ? { ...threat, status: 'mitigated' as const }
          : threat
      )
    );
  }, []);

  const resolveThreat = useCallback((threatId: string) => {
    setThreats(prev => 
      prev.map(threat => 
        threat.id === threatId 
          ? { ...threat, status: 'resolved' as const }
          : threat
      )
    );
  }, []);

  useEffect(() => {
    // Initial threat data
    setThreats(generateMockThreats());
    
    // Initialize threat intelligence
    setThreatIntelligence({
      knownThreats: Math.floor(Math.random() * 100) + 50,
      blockedAttempts: Math.floor(Math.random() * 500) + 200,
      vulnerabilitiesPatched: Math.floor(Math.random() * 20) + 10,
      securityUpdates: Math.floor(Math.random() * 10) + 5,
      lastScanTime: new Date(Date.now() - Math.random() * 3600000) // Last hour
    });

    // Auto-scan every 5 minutes
    const scanInterval = setInterval(runSecurityScan, 300000);
    
    return () => clearInterval(scanInterval);
  }, [generateMockThreats, runSecurityScan]);

  useEffect(() => {
    setSecurityScore(calculateSecurityScore());
  }, [threats, calculateSecurityScore]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const activeThreats = threats.filter(t => t.status === 'active');
  const criticalThreats = threats.filter(t => t.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(securityScore.overall)}`}>
              {securityScore.overall}%
            </div>
            <Progress value={securityScore.overall} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeThreats.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalThreats.length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{threatIntelligence.blockedAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {threatIntelligence.lastScanTime.toLocaleTimeString()}
            </div>
            <Button 
              onClick={runSecurityScan} 
              disabled={isScanning}
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
            >
              {isScanning ? 'Scanning...' : 'Scan Now'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {activeThreats.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Active Security Threats Detected</AlertTitle>
          <AlertDescription>
            {activeThreats.length} active threats require immediate attention. 
            {criticalThreats.length > 0 && ` ${criticalThreats.length} are critical severity.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Security Tabs */}
      <Tabs defaultValue="threats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="threats">Threat Feed</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          <TabsTrigger value="scores">Security Scores</TabsTrigger>
          <TabsTrigger value="response">Auto Response</TabsTrigger>
        </TabsList>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Threat Detection</CardTitle>
              <CardDescription>
                Live feed of detected security threats and incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {threats.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-muted-foreground">No threats detected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {threats.map((threat) => (
                    <div key={threat.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getThreatStatusIcon(threat.status)}
                            <h4 className="font-semibold">{threat.title}</h4>
                            <Badge className={getThreatSeverityColor(threat.severity)}>
                              {threat.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{threat.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Source: {threat.source}</span>
                            <span>{threat.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {threat.status === 'active' && (
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => mitigateThreat(threat.id)}
                              variant="outline" 
                              size="sm"
                            >
                              Mitigate
                            </Button>
                            <Button 
                              onClick={() => resolveThreat(threat.id)}
                              variant="default" 
                              size="sm"
                            >
                              Resolve
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Affected Assets:</span>
                          <ul className="list-disc list-inside ml-2 text-muted-foreground">
                            {threat.affectedAssets.map((asset, i) => (
                              <li key={i}>{asset}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium">Mitigation Actions:</span>
                          <ul className="list-disc list-inside ml-2 text-muted-foreground">
                            {threat.mitigationActions.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Known Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{threatIntelligence.knownThreats}</div>
                <p className="text-xs text-muted-foreground">In database</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Vulnerabilities Patched</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{threatIntelligence.vulnerabilitiesPatched}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Security Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{threatIntelligence.securityUpdates}</div>
                <p className="text-xs text-muted-foreground">Applied</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Scan Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {isScanning ? 'Scanning...' : 'Complete'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {threatIntelligence.lastScanTime.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(securityScore).map(([key, score]) => (
              key !== 'overall' && (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Score</span>
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {Math.round(score)}%
                        </span>
                      </div>
                      <Progress value={score} />
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        </TabsContent>

        <TabsContent value="response" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Response Configuration</CardTitle>
              <CardDescription>
                Configure automatic threat mitigation and response actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-Mitigation</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically respond to known threat patterns
                  </p>
                </div>
                <Button 
                  onClick={() => setAutoMitigationEnabled(!autoMitigationEnabled)}
                  variant={autoMitigationEnabled ? "default" : "outline"}
                >
                  {autoMitigationEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium">Response Actions</h5>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>IP blocking for brute force attacks</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Rate limiting for DDoS protection</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Input sanitization for injection attempts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Content Security Policy enforcement</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">Alert Notifications</h5>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Email alerts for critical threats</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Slack integration for team notifications</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>SMS alerts for high severity events</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Dashboard push notifications</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThreatDetection;
