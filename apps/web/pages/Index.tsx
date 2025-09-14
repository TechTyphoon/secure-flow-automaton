import React, { useState, Suspense, lazy } from 'react';
import Header from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, Users, Calendar, BarChart3, HelpCircle } from 'lucide-react';
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";

// Lazy load heavy components for better performance
const SecurityMonitor = lazy(() => import('@/components/security/SecurityMonitor'));
const PipelineFlow = lazy(() => import('@/components/features/PipelineFlow'));
const VulnerabilityDashboard = lazy(() => import('@/components/features/VulnerabilityDashboard'));
const ComplianceOverview = lazy(() => import('@/components/features/ComplianceOverview'));
const ToolSelection = lazy(() => import('@/components/features/ToolSelection'));
const UserPersonas = lazy(() => import('@/components/features/UserPersonas'));
const ProjectTimeline = lazy(() => import('@/components/features/ProjectTimeline'));
const HowItWorksModal = lazy(() => import('@/components/modals/HowItWorksModal'));
const SecurityServiceDashboard = lazy(() => import('@/components/security/SecurityServiceDashboard'));

// Loading component for better UX
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Header />
      <main className="p-6 space-y-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  DevSecOps Pipeline Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Real-time security monitoring and automated vulnerability remediation
                </p>
                {!user && (
                  <div className="mt-3">
                    <Link to="/auth" className="text-blue-600 underline text-sm">Login / Register</Link>
                  </div>
                )}
              </div>
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full max-w-3xl">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Services</span>
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Research</span>
              </TabsTrigger>
              <TabsTrigger value="personas" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Personas</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Timeline</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-8 mt-6">
              <Suspense fallback={<ComponentLoader />}>
                <SecurityMonitor />
              </Suspense>
              <div className="space-y-8">
                <Suspense fallback={<ComponentLoader />}>
                  <PipelineFlow />
                </Suspense>
                <Suspense fallback={<ComponentLoader />}>
                  <VulnerabilityDashboard />
                </Suspense>
                <Suspense fallback={<ComponentLoader />}>
                  <ComplianceOverview />
                </Suspense>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-8 mt-6">
              <Suspense fallback={<ComponentLoader />}>
                <SecurityServiceDashboard />
              </Suspense>
            </TabsContent>

            <TabsContent value="research" className="space-y-8 mt-6">
              <Suspense fallback={<ComponentLoader />}>
                <ToolSelection />
              </Suspense>
            </TabsContent>

            <TabsContent value="personas" className="space-y-8 mt-6">
              <Suspense fallback={<ComponentLoader />}>
                <UserPersonas />
              </Suspense>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-8 mt-6">
              <Suspense fallback={<ComponentLoader />}>
                <ProjectTimeline />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Suspense fallback={<ComponentLoader />}>
        <HowItWorksModal open={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
      </Suspense>
    </>
  );
};

export default Index;
