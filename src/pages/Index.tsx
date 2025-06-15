
import React from 'react';
import Header from '@/components/Header';
import SecurityMetrics from '@/components/SecurityMetrics';
import PipelineFlow from '@/components/PipelineFlow';
import VulnerabilityDashboard from '@/components/VulnerabilityDashboard';
import ComplianceOverview from '@/components/ComplianceOverview';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
          
          <SecurityMetrics />
          
          <div className="space-y-8">
            <PipelineFlow />
            <VulnerabilityDashboard />
            <ComplianceOverview />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
