import React, { useState } from "react";
import Header from "@/components/layout/Header";
import HealthDashboard from "@/components/features/HealthDashboard";
import SecurityMonitor from "@/components/security/SecurityMonitor";
import PerformanceMonitor from "@/components/dashboard/PerformanceMonitor";
import ThreatDetection from "@/components/features/ThreatDetection";
import SecurityAnalytics from "@/components/security/SecurityAnalytics";
import SecurityResponse from "@/components/security/SecurityResponse";
import RealUserMonitoring from "@/components/features/RealUserMonitoring";
import RUMDashboard from "@/components/dashboard/RUMDashboard";
import PerformanceOptimizer from "@/components/dashboard/PerformanceOptimizer";
import PerformanceAnalytics from "@/components/dashboard/PerformanceAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Shield, BarChart3, Settings, RefreshCw, Zap, Eye, Bot, Brain } from "lucide-react";

const Monitoring = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refreshData = () => {
    setLastRefresh(new Date());
    // Trigger data refresh in child components
    window.dispatchEvent(new CustomEvent('monitoring-refresh'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-600 mt-2">
              Real-time monitoring and observability dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98.7%</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Excellent
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">94%</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Secure
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">247</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Last 24h
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">15s</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Avg auto-response
                </Badge>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Monitoring Tabs */}
        <Tabs defaultValue="enhanced-rum" className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="enhanced-rum" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Enhanced RUM
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="rum" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Legacy RUM
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Optimization
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="threats" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Threats
            </TabsTrigger>
            <TabsTrigger value="response" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Auto Response
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enhanced-rum" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Monitoring</CardTitle>
                <CardDescription>
Real user monitoring with predictive analytics, anomaly detection, and comprehensive performance insights
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <RUMDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Health Dashboard</CardTitle>
                <CardDescription>
                  Monitor application performance, errors, and user experience metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HealthDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Monitoring</CardTitle>
                <CardDescription>
                  Core Web Vitals, navigation timing, and real user monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceMonitor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <PerformanceAnalytics />
          </TabsContent>

          <TabsContent value="rum" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Real User Monitoring</CardTitle>
                <CardDescription>
                  Comprehensive user experience monitoring and session analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RealUserMonitoring />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Optimizer</CardTitle>
                <CardDescription>
  Performance optimization with automated improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceOptimizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Monitoring</CardTitle>
                <CardDescription>
                  Real-time security alerts, threat detection, and compliance monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityMonitor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Threat Detection</CardTitle>
                <CardDescription>
                  Real-time threat intelligence and automated security responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThreatDetection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics-legacy" className="space-y-4">
            <SecurityAnalytics />
          </TabsContent>

          <TabsContent value="response" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automated Security Response</CardTitle>
                <CardDescription>
                  Configure and monitor automated security incident response
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityResponse />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Application and environment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Application</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Version: 1.0.0</div>
                  <div>Build: {import.meta.env.MODE}</div>
                  <div>Environment: {import.meta.env.MODE === 'production' ? 'Production' : 'Development'}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Runtime</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>React: {React.version}</div>
                  <div>Browser: {navigator.userAgent.split(' ')[0]}</div>
                  <div>Platform: {navigator.platform}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Session</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Started: {new Date().toLocaleString()}</div>
                  <div>Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
                  <div>Language: {navigator.language}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Monitoring;
