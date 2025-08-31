import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Zap, 
  Ban, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Activity,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Bell,
  Mail,
  Smartphone,
  Users,
  Server,
  Database,
  Globe
} from 'lucide-react';

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'network' | 'application' | 'data';
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  autoResponse: boolean;
  triggerCondition: string;
  responseAction: string;
  cooldownPeriod: number; // minutes
  executionCount: number;
  lastExecuted?: Date;
}

interface SecurityResponse {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: Date;
  action: string;
  status: 'success' | 'failed' | 'in-progress';
  details: string;
  affectedSystems: string[];
  duration: number; // seconds
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'slack' | 'webhook';
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  lastUsed?: Date;
}

const AutomatedSecurityResponse: React.FC = () => {
  const [securityRules, setSecurityRules] = useState<SecurityRule[]>([]);
  const [responses, setResponses] = useState<SecurityResponse[]>([]);
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    enabled: true,
    rulesActive: 0,
    responsesExecuted: 0,
    averageResponseTime: 0,
    successRate: 0
  });
  const [activeIncidents, setActiveIncidents] = useState(0);

  const generateMockRules = useCallback((): SecurityRule[] => {
    return [
      {
        id: 'rule-1',
        name: 'Brute Force Protection',
        description: 'Block IP addresses after 5 failed login attempts within 10 minutes',
        category: 'authentication',
        severity: 'high',
        enabled: true,
        autoResponse: true,
        triggerCondition: 'Failed logins >= 5 in 10 minutes',
        responseAction: 'Block IP for 1 hour',
        cooldownPeriod: 60,
        executionCount: 23,
        lastExecuted: new Date(Date.now() - Math.random() * 3600000)
      },
      {
        id: 'rule-2',
        name: 'SQL Injection Detection',
        description: 'Detect and block SQL injection attempts in real-time',
        category: 'application',
        severity: 'critical',
        enabled: true,
        autoResponse: true,
        triggerCondition: 'SQL injection pattern detected',
        responseAction: 'Block request + sanitize input',
        cooldownPeriod: 5,
        executionCount: 12,
        lastExecuted: new Date(Date.now() - Math.random() * 1800000)
      },
      {
        id: 'rule-3',
        name: 'DDoS Mitigation',
        description: 'Automatically enable rate limiting during traffic spikes',
        category: 'network',
        severity: 'critical',
        enabled: true,
        autoResponse: true,
        triggerCondition: 'Requests > 1000/sec from single IP',
        responseAction: 'Enable rate limiting + CDN protection',
        cooldownPeriod: 30,
        executionCount: 7,
        lastExecuted: new Date(Date.now() - Math.random() * 7200000)
      },
      {
        id: 'rule-4',
        name: 'Suspicious File Upload',
        description: 'Quarantine files with malicious signatures',
        category: 'application',
        severity: 'high',
        enabled: true,
        autoResponse: true,
        triggerCondition: 'Malware signature match',
        responseAction: 'Quarantine file + scan system',
        cooldownPeriod: 0,
        executionCount: 15,
        lastExecuted: new Date(Date.now() - Math.random() * 5400000)
      },
      {
        id: 'rule-5',
        name: 'Data Exfiltration Prevention',
        description: 'Monitor and block unusual data access patterns',
        category: 'data',
        severity: 'critical',
        enabled: true,
        autoResponse: false, // Manual approval required
        triggerCondition: 'Large data download outside business hours',
        responseAction: 'Alert admin + require approval',
        cooldownPeriod: 15,
        executionCount: 3,
        lastExecuted: new Date(Date.now() - Math.random() * 10800000)
      },
      {
        id: 'rule-6',
        name: 'Privileged Account Monitoring',
        description: 'Monitor admin account activities for anomalies',
        category: 'authentication',
        severity: 'high',
        enabled: true,
        autoResponse: false,
        triggerCondition: 'Admin login from new location',
        responseAction: 'Multi-factor verification + admin alert',
        cooldownPeriod: 0,
        executionCount: 8,
        lastExecuted: new Date(Date.now() - Math.random() * 3600000)
      }
    ];
  }, []);

  const generateMockResponses = useCallback((): SecurityResponse[] => {
    const rules = generateMockRules();
    const responses: SecurityResponse[] = [];
    
    for (let i = 0; i < 10; i++) {
      const rule = rules[Math.floor(Math.random() * rules.length)];
      const timestamp = new Date(Date.now() - Math.random() * 86400000); // Last 24 hours
      
      responses.push({
        id: `response-${i}`,
        ruleId: rule.id,
        ruleName: rule.name,
        timestamp,
        action: rule.responseAction,
        status: Math.random() > 0.1 ? 'success' : Math.random() > 0.5 ? 'failed' : 'in-progress',
        details: `Automated response executed for ${rule.triggerCondition.toLowerCase()}`,
        affectedSystems: ['Web Server', 'Database', 'Load Balancer', 'CDN'].slice(0, Math.floor(Math.random() * 3) + 1),
        duration: Math.floor(Math.random() * 300) + 10 // 10-310 seconds
      });
    }
    
    return responses.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [generateMockRules]);

  const generateNotificationChannels = useCallback((): NotificationChannel[] => {
    return [
      {
        id: 'email-1',
        type: 'email',
        name: 'Security Team Email',
        enabled: true,
        config: { email: 'security@company.com' },
        lastUsed: new Date(Date.now() - Math.random() * 3600000)
      },
      {
        id: 'slack-1',
        type: 'slack',
        name: 'Security Alerts Channel',
        enabled: true,
        config: { channel: '#security-alerts', webhook: 'https://hooks.slack.com/...' },
        lastUsed: new Date(Date.now() - Math.random() * 1800000)
      },
      {
        id: 'sms-1',
        type: 'sms',
        name: 'On-Call Engineer',
        enabled: true,
        config: { phone: '+1-555-0123' },
        lastUsed: new Date(Date.now() - Math.random() * 7200000)
      },
      {
        id: 'webhook-1',
        type: 'webhook',
        name: 'SIEM Integration',
        enabled: true,
        config: { url: 'https://siem.company.com/api/alerts' },
        lastUsed: new Date(Date.now() - Math.random() * 900000)
      }
    ];
  }, []);

  const toggleRule = useCallback((ruleId: string) => {
    setSecurityRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  }, []);

  const toggleAutoResponse = useCallback((ruleId: string) => {
    setSecurityRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, autoResponse: !rule.autoResponse }
          : rule
      )
    );
  }, []);

  const toggleNotificationChannel = useCallback((channelId: string) => {
    setNotificationChannels(prev => 
      prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, enabled: !channel.enabled }
          : channel
      )
    );
  }, []);

  const executeManualResponse = useCallback((ruleId: string) => {
    const rule = securityRules.find(r => r.id === ruleId);
    if (!rule) return;

    const newResponse: SecurityResponse = {
      id: `manual-${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      timestamp: new Date(),
      action: rule.responseAction,
      status: 'in-progress',
      details: `Manual execution of ${rule.name}`,
      affectedSystems: ['Web Server'],
      duration: 0
    };

    setResponses(prev => [newResponse, ...prev.slice(0, 9)]);

    // Simulate response execution
    setTimeout(() => {
      setResponses(prev => 
        prev.map(response => 
          response.id === newResponse.id 
            ? { ...response, status: 'success' as const, duration: Math.floor(Math.random() * 60) + 5 }
            : response
        )
      );
    }, 2000);
  }, [securityRules]);

  const resetRule = useCallback((ruleId: string) => {
    setSecurityRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, executionCount: 0, lastExecuted: undefined }
          : rule
      )
    );
  }, []);

  useEffect(() => {
    setSecurityRules(generateMockRules());
    setResponses(generateMockResponses());
    setNotificationChannels(generateNotificationChannels());
    setActiveIncidents(Math.floor(Math.random() * 5));

    // Update system status
    const activeRules = generateMockRules().filter(r => r.enabled).length;
    const totalExecutions = generateMockResponses().length;
    const successfulExecutions = generateMockResponses().filter(r => r.status === 'success').length;
    
    setSystemStatus({
      enabled: true,
      rulesActive: activeRules,
      responsesExecuted: totalExecutions,
      averageResponseTime: Math.floor(Math.random() * 30) + 15,
      successRate: Math.round((successfulExecutions / totalExecutions) * 100)
    });
  }, [generateMockRules, generateMockResponses, generateNotificationChannels]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'slack': return <Users className="h-4 w-4" />;
      case 'webhook': return <Globe className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {systemStatus.enabled ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium">
                {systemStatus.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.rulesActive}</div>
            <p className="text-xs text-muted-foreground">
              {securityRules.length} total rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStatus.successRate}%</div>
            <Progress value={systemStatus.successRate} className="mt-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.averageResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              Response execution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Security Rules</TabsTrigger>
          <TabsTrigger value="responses">Response History</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Security Rules</CardTitle>
              <CardDescription>
                Configure automated responses to security threats and incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{rule.name}</h4>
                          <Badge className={getSeverityColor(rule.severity)}>
                            {rule.severity.toUpperCase()}
                          </Badge>
                          <Badge variant={rule.category === 'authentication' ? 'default' : 'secondary'}>
                            {rule.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Trigger:</span>
                            <p className="text-muted-foreground">{rule.triggerCondition}</p>
                          </div>
                          <div>
                            <span className="font-medium">Response:</span>
                            <p className="text-muted-foreground">{rule.responseAction}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Executions: {rule.executionCount}</span>
                          {rule.lastExecuted && (
                            <span>Last: {rule.lastExecuted.toLocaleString()}</span>
                          )}
                          <span>Cooldown: {rule.cooldownPeriod}m</span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={rule.enabled}
                            onCheckedChange={() => toggleRule(rule.id)}
                          />
                          <span className="text-sm">Enabled</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={rule.autoResponse}
                            onCheckedChange={() => toggleAutoResponse(rule.id)}
                            disabled={!rule.enabled}
                          />
                          <span className="text-sm">Auto Response</span>
                        </div>

                        <div className="flex space-x-1">
                          {!rule.autoResponse && rule.enabled && (
                            <Button 
                              onClick={() => executeManualResponse(rule.id)}
                              variant="outline" 
                              size="sm"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Execute
                            </Button>
                          )}
                          
                          <Button 
                            onClick={() => resetRule(rule.id)}
                            variant="outline" 
                            size="sm"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Execution History</CardTitle>
              <CardDescription>
                Recent automated security response actions and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {responses.map((response) => (
                  <div key={response.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(response.status)}
                          <h4 className="font-medium">{response.ruleName}</h4>
                          <Badge variant={response.status === 'success' ? 'default' : response.status === 'failed' ? 'destructive' : 'secondary'}>
                            {response.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{response.details}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{response.timestamp.toLocaleString()}</span>
                          <span>Duration: {response.duration}s</span>
                          <span>Systems: {response.affectedSystems.join(', ')}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">{response.action}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Configure how security alerts and responses are communicated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationChannels.map((channel) => (
                  <div key={channel.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getChannelIcon(channel.type)}
                        <div>
                          <h4 className="font-medium">{channel.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {channel.type} notifications
                          </p>
                          {channel.lastUsed && (
                            <p className="text-xs text-muted-foreground">
                              Last used: {channel.lastUsed.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={channel.enabled}
                          onCheckedChange={() => toggleNotificationChannel(channel.id)}
                        />
                        <span className="text-sm">
                          {channel.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertTitle>Notification Settings</AlertTitle>
                <AlertDescription>
                  Critical security events will trigger notifications across all enabled channels. 
                  Medium and low severity events will only use email notifications to avoid alert fatigue.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedSecurityResponse;
