import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Clock, 
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Lock,
  Unlock,
  Bell,
  BellOff
} from 'lucide-react';

interface SecurityAlert {
  id: string;
  type: 'vulnerability' | 'breach-attempt' | 'suspicious-activity' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved';
  source: string;
}

interface SecurityMetrics {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeScanners: number;
  vulnerabilitiesDetected: number;
  threatsPrevented: number;
  lastScanTime: Date;
  complianceScore: number;
  incidentCount: number;
}

const SecurityMonitor: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    threatLevel: 'low',
    activeScanners: 3,
    vulnerabilitiesDetected: 2,
    threatsPrevented: 15,
    lastScanTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    complianceScore: 94,
    incidentCount: 0,
  });
  
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // Simulate real-time security monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const generateAlert = (): SecurityAlert => {
      const alertTypes = [
        {
          type: 'vulnerability' as const,
          title: 'New CVE Detected',
          description: 'High severity vulnerability found in dependency package',
          severity: 'high' as const,
          source: 'OWASP Scanner'
        },
        {
          type: 'suspicious-activity' as const,
          title: 'Unusual API Access Pattern',
          description: 'Multiple failed authentication attempts detected',
          severity: 'medium' as const,
          source: 'Auth Monitor'
        },
        {
          type: 'compliance' as const,
          title: 'Security Policy Violation',
          description: 'Unencrypted data transmission detected',
          severity: 'high' as const,
          source: 'Compliance Scanner'
        },
        {
          type: 'breach-attempt' as const,
          title: 'Potential SQL Injection',
          description: 'Malicious input patterns in API requests',
          severity: 'critical' as const,
          source: 'WAF Monitor'
        }
      ];

      const template = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...template,
        timestamp: new Date(),
        status: 'active',
      };
    };

    // Simulate periodic security alerts (every 30 seconds for demo)
    const alertInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of new alert
        const newAlert = generateAlert();
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
        
        // Update metrics
        setMetrics(prev => ({
          ...prev,
          vulnerabilitiesDetected: prev.vulnerabilitiesDetected + (newAlert.type === 'vulnerability' ? 1 : 0),
          incidentCount: prev.incidentCount + 1,
          threatLevel: newAlert.severity === 'critical' ? 'critical' : 
                      newAlert.severity === 'high' ? 'high' : prev.threatLevel,
        }));

        // Show notification if enabled
        if (notifications && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`Security Alert: ${newAlert.title}`, {
            body: newAlert.description,
            icon: '/favicon.ico',
          });
        }
      }
    }, 30000);

    // Update scan time every minute
    const scanInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        lastScanTime: new Date(),
        threatsPrevented: prev.threatsPrevented + Math.floor(Math.random() * 3),
      }));
    }, 60000);

    return () => {
      clearInterval(alertInterval);
      clearInterval(scanInterval);
    };
  }, [isMonitoring, notifications]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' }
          : alert
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span>Security Monitor</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleNotifications}
                className="flex items-center space-x-1"
              >
                {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                <span>{notifications ? 'On' : 'Off'}</span>
              </Button>
              <Button
                size="sm"
                variant={isMonitoring ? "default" : "outline"}
                onClick={toggleMonitoring}
                className="flex items-center space-x-1"
              >
                <Activity className="h-4 w-4" />
                <span>{isMonitoring ? 'Active' : 'Paused'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Threat Level */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Threat Level</span>
              </div>
              <div className={`text-lg font-bold capitalize ${getThreatLevelColor(metrics.threatLevel)}`}>
                {metrics.threatLevel}
              </div>
            </div>

            {/* Active Alerts */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Active Alerts</span>
              </div>
              <div className="text-lg font-bold">
                {activeAlerts.length}
                {criticalAlerts.length > 0 && (
                  <span className="text-red-600 ml-1">({criticalAlerts.length} critical)</span>
                )}
              </div>
            </div>

            {/* Compliance Score */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Compliance</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{metrics.complianceScore}%</span>
                {metrics.complianceScore >= 90 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <Progress value={metrics.complianceScore} className="h-1" />
            </div>

            {/* Threats Prevented */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Threats Prevented</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {metrics.threatsPrevented}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Security Alert:</strong> {criticalAlerts.length} critical issue(s) require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Recent Security Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${
                    alert.status === 'resolved' ? 'bg-gray-50 opacity-75' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                        <Badge variant="outline" className="text-xs">
                          {alert.type.replace('-', ' ')}
                        </Badge>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                        {alert.status === 'resolved' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <h4 className="font-semibold">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{alert.timestamp.toLocaleTimeString()}</span>
                        </span>
                        <span>Source: {alert.source}</span>
                      </div>
                    </div>
                    {alert.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                        className="ml-4"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No security alerts</p>
              <p className="text-sm">All systems are secure</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Scanners Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Security Scanners</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">OWASP Scanner</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Last scan: {metrics.lastScanTime.toLocaleTimeString()}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Dependency Check</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Monitoring {metrics.vulnerabilitiesDetected} vulnerabilities</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Compliance Monitor</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Score: {metrics.complianceScore}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;
