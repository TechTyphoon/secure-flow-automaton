
import React, { useState } from 'react';
import Header from '@/components/Header';
import SecurityMetrics from '@/components/SecurityMetrics';
import PipelineFlow from '@/components/PipelineFlow';
import VulnerabilityDashboard from '@/components/VulnerabilityDashboard';
import ComplianceOverview from '@/components/ComplianceOverview';
import ToolSelection from '@/components/ToolSelection';
import UserPersonas from '@/components/UserPersonas';
import ProjectTimeline from '@/components/ProjectTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Calendar, BarChart3 } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SecurityReport from './SecurityReport';
import VulnerabilityDetail from './VulnerabilityDetail';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/security-report" element={<SecurityReport />} />
        <Route path="/vulnerability/:cveId" element={<VulnerabilityDetail />} />
        <Route
          path="*"
          element={
            <main className="p-6 space-y-8">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    DevSecOps Pipeline Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Real-time security monitoring and automated vulnerability remediation
                  </p>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                    <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
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
                    <SecurityMetrics />
                    <div className="space-y-8">
                      <PipelineFlow />
                      <VulnerabilityDashboard />
                      <ComplianceOverview />
                    </div>
                  </TabsContent>

                  <TabsContent value="research" className="mt-6">
                    <ToolSelection />
                  </TabsContent>

                  <TabsContent value="personas" className="mt-6">
                    <UserPersonas />
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-6">
                    <ProjectTimeline />
                  </TabsContent>
                </Tabs>
              </div>
            </main>
          }
        />
      </Routes>
    </Router>
  );
};

export default Index;
