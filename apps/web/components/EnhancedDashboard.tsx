import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Sparkles, Smartphone, Zap } from 'lucide-react';

// Import existing components
import EnhancedSecurityMetrics from '@/components/EnhancedSecurityMetrics';
import QuantumVisualization from '@/components/QuantumVisualization';
import MobileOptimization from '@/components/MobileOptimization';

// Lazy load heavy components for performance
const SecurityMetrics = React.lazy(() => import('@/components/SecurityMetrics'));
const PipelineFlow = React.lazy(() => import('@/components/PipelineFlow'));
const VulnerabilityDashboard = React.lazy(() => import('@/components/VulnerabilityDashboard'));
const ComplianceOverview = React.lazy(() => import('@/components/ComplianceOverview'));
const ToolSelection = React.lazy(() => import('@/components/ToolSelection'));
const UserPersonas = React.lazy(() => import('@/components/UserPersonas'));
const ProjectTimeline = React.lazy(() => import('@/components/ProjectTimeline'));
const HowItWorksModal = React.lazy(() => import('@/components/HowItWorksModal'));
const SecurityServiceDashboard = React.lazy(() => import('@/components/SecurityServiceDashboard'));

// Loading component
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const EnhancedDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [showQuantumDemo, setShowQuantumDemo] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  return (
    <>
      <main className="p-6 space-y-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-blue-500" />
                  DevSecOps Pipeline Dashboard
                  <Badge variant="secondary" className="ml-2">
                    Enhanced
                  </Badge>
                </h1>
                <p className="text-muted-foreground">
                  Real-time security monitoring and automated vulnerability remediation
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-green-600">
                    <Zap className="h-3 w-3 mr-1" />
                    Live Updates
                  </Badge>
                  <Badge variant="outline" className="text-blue-600">
                    <Smartphone className="h-3 w-3 mr-1" />
                    Mobile Optimized
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuantumDemo(!showQuantumDemo)}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Quantum Demo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobilePreview(!showMobilePreview)}
                  className="flex items-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile Preview
                </Button>
                <Button
                  onClick={() => setHowItWorksOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  How It Works
                </Button>
              </div>
            </div>
          </div>

          {/* Quantum Visualization Demo */}
          {showQuantumDemo && (
            <div className="mb-8">
              <QuantumVisualization
                width={800}
                height={400}
                particleCount={30}
                showEntanglement={true}
              />
            </div>
          )}

          {/* Mobile Preview */}
          {showMobilePreview && (
            <div className="mb-8">
              <MobileOptimization title="Dashboard Mobile Preview">
                <div className="p-4 space-y-4">
                  <h2 className="text-xl font-bold">SecureFlow Dashboard</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">95%</div>
                      <div className="text-sm text-blue-800">Security Score</div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">3</div>
                      <div className="text-sm text-green-800">Active Alerts</div>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-sm">Real-time security monitoring active</div>
                  </div>
                </div>
              </MobileOptimization>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full max-w-3xl">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Enhanced Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Services</span>
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Research</span>
              </TabsTrigger>
              <TabsTrigger value="personas" className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Personas</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Timeline</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-8 mt-6">
              {/* Enhanced Security Metrics with Realtime */}
              <React.Suspense fallback={<ComponentLoader />}>
                <EnhancedSecurityMetrics />
              </React.Suspense>

              <div className="space-y-8">
                <React.Suspense fallback={<ComponentLoader />}>
                  <PipelineFlow />
                </React.Suspense>

                <React.Suspense fallback={<ComponentLoader />}>
                  <VulnerabilityDashboard />
                </React.Suspense>

                <React.Suspense fallback={<ComponentLoader />}>
                  <ComplianceOverview />
                </React.Suspense>

                {/* New Interactive Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      Interactive Security Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center gap-2"
                        onClick={() => setShowQuantumDemo(!showQuantumDemo)}
                      >
                        <Zap className="h-6 w-6" />
                        <span>Quantum Demo</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center gap-2"
                        onClick={() => setShowMobilePreview(!showMobilePreview)}
                      >
                        <Smartphone className="h-6 w-6" />
                        <span>Mobile Test</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center gap-2"
                        onClick={() => window.open('/monitoring', '_blank')}
                      >
                        <Sparkles className="h-6 w-6" />
                        <span>Live Monitor</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-8 mt-6">
              <React.Suspense fallback={<ComponentLoader />}>
                <SecurityServiceDashboard />
              </React.Suspense>
            </TabsContent>

            <TabsContent value="research" className="space-y-8 mt-6">
              <React.Suspense fallback={<ComponentLoader />}>
                <ToolSelection />
              </React.Suspense>
            </TabsContent>

            <TabsContent value="personas" className="space-y-8 mt-6">
              <React.Suspense fallback={<ComponentLoader />}>
                <UserPersonas />
              </React.Suspense>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-8 mt-6">
              <React.Suspense fallback={<ComponentLoader />}>
                <ProjectTimeline />
              </React.Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <React.Suspense fallback={<ComponentLoader />}>
        <HowItWorksModal open={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
      </React.Suspense>
    </>
  );
};

export default EnhancedDashboard;
