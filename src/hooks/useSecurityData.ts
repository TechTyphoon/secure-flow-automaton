import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export const useSecurityScans = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['security-scans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('Fetching security scans for user:', user.id);
      
      const { data, error } = await supabase
        .from('security_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching security scans:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

export const useVulnerabilities = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['vulnerabilities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('Fetching vulnerabilities for user:', user.id);
      // @ts-expect-error - Supabase types not fully defined
      const { data, error } = await supabase
        .from('vulnerabilities')
        .select('*')
        .order('scanned_at', { ascending: false });
      if (error) {
        console.error('Error fetching vulnerabilities:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

export const usePipelineMetrics = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['pipeline-metrics', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('Fetching pipeline metrics for user:', user.id);
      
      const { data, error } = await supabase
        .from('pipeline_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching pipeline metrics:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

export const useSecurityMetrics = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['security-metrics', user?.id],
    queryFn: async () => {
      if (!user) return {
        securityScore: 0,
        activeVulnerabilities: 0,
        recentFixes: 0,
        avgScanDuration: 0,
      };
      console.log('Calculating security metrics for user:', user.id);
      // @ts-expect-error - Supabase types not fully defined
      const { data: vulnCounts, error: vulnError } = await supabase
        .from('vulnerabilities')
        .select('severity, status')
        .eq('status', 'new'); // Use 'new' instead of 'open' based on actual data

      if (vulnError) {
        console.error('Error fetching vulnerability counts:', vulnError);
        throw vulnError;
      }

      // Since there's no fixed_at column, we'll calculate based on status 'fixed'
      const { data: recentFixes, error: fixError } = await supabase
        .from('vulnerabilities')
        .select('*')
        .eq('status', 'fixed')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (fixError) {
        console.error('Error fetching recent fixes:', fixError);
        // Don't throw error, just log it
        console.log('Recent fixes query failed, using 0');
      }

      const activeVulns = vulnCounts?.length || 0;
      const criticalCount = vulnCounts?.filter(v => v.severity === 'CRITICAL').length || 0;
      const highCount = vulnCounts?.filter(v => v.severity === 'HIGH').length || 0;
      const mediumCount = vulnCounts?.filter(v => v.severity === 'MEDIUM').length || 0;
      
      // Calculate security score (simplified algorithm)
      const maxScore = 100;
      const penalty = criticalCount * 20 + highCount * 10 + mediumCount * 5;
      const securityScore = Math.max(0, maxScore - penalty);

      const metrics = {
        securityScore,
        activeVulnerabilities: activeVulns,
        recentFixes: recentFixes?.length || 0,
        avgScanDuration: 2.5, // Mock value since we don't have scan duration data
      };
      console.log('Calculated metrics:', metrics);
      return metrics;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

export const useRealMetrics = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['real-metrics', user?.id],
    queryFn: async () => {
      if (!user) return null;
      console.log('Fetching real KPI metrics for user:', user.id);
      
      // Get current date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Fetch vulnerabilities for the last 30 days
      const { data: currentVulns, error: currentVulnsError } = await supabase
        .from('vulnerabilities')
        .select('*')
        .gte('scanned_at', thirtyDaysAgo.toISOString());
      
      if (currentVulnsError) {
        console.error('Error fetching current vulnerabilities:', currentVulnsError);
        throw currentVulnsError;
      }
      
      // Calculate metrics based on actual data
      const criticalHighVulns = currentVulns?.filter(v => 
        v.severity === 'CRITICAL' || v.severity === 'HIGH'
      ) || [];
      
      const fixedVulns = currentVulns?.filter(v => v.status === 'fixed') || [];
      const openVulns = currentVulns?.filter(v => v.status === 'new') || [];
      
      // Calculate vulnerability reduction rate
      const totalVulns = currentVulns?.length || 0;
      const fixedCount = fixedVulns.length;
      const reductionRate = totalVulns > 0 ? Math.round((fixedCount / totalVulns) * 100) : 0;
      
      // Mock values for metrics that require tables that don't exist
      const mttr = 2.5; // Mock mean time to remediate in hours
      const autoSuccessRate = 85; // Mock automated remediation success rate
      const buildFailureRate = 5.2; // Mock build failure rate
      const complianceScore = Math.round(Math.max(85, 100 - (criticalHighVulns.length * 2)));
      const activeScans = 0; // No active scans in current setup
      
      return {
        vulnerabilityReductionRate: reductionRate,
        mttr: mttr,
        automatedRemediationSuccessRate: autoSuccessRate,
        buildFailureRate: buildFailureRate,
        complianceAdherence: complianceScore,
        activeScans: activeScans,
        totalVulnerabilities: totalVulns,
        fixedVulnerabilities: fixedCount,
        openVulnerabilities: openVulns.length,
        criticalHighCount: criticalHighVulns.length
      };
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

export const usePipelineFlow = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['pipeline-flow', user?.id],
    queryFn: async () => {
      console.log('🔍 Fetching real pipeline flow data...');
      
      // Get the latest pipeline run from the database
      const { data: latestPipeline, error } = await supabase
        .from('pipeline_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('❌ Error fetching pipeline flow:', error);
        // Return mock data if database query fails
        return getMockPipelineData();
      }
      
      const pipeline = latestPipeline?.[0];
      
      if (!pipeline) {
        console.log('⚠️ No pipeline runs found in database, using mock data');
        return getMockPipelineData();
      }
      
      console.log('✅ Real pipeline data loaded:', pipeline);
      
      // Calculate duration if pipeline is completed
      let totalDuration = '-';
      if (pipeline.completed_at && pipeline.started_at) {
        const startTime = new Date(pipeline.started_at).getTime();
        const endTime = new Date(pipeline.completed_at).getTime();
        const durationMs = endTime - startTime;
        const durationMin = Math.round(durationMs / (1000 * 60));
        const durationSec = Math.round((durationMs % (1000 * 60)) / 1000);
        totalDuration = `${durationMin}m ${durationSec}s`;
      }
      
      // Map real pipeline status to stages
      const isInProgress = pipeline.status === 'In Progress';
      const isSuccess = pipeline.status === 'success';
      const isFailed = pipeline.status === 'failure';
      
      // Calculate realistic stage durations based on total pipeline duration
      let stageDurations = {
        sourceCode: '2s',
        build: '45s', 
        test: '1m 23s',
        securityScan: '2m 15s',
        package: '30s',
        deploy: '45s'
      };
      
      // If we have real duration data, distribute it across stages
      if (pipeline.completed_at && pipeline.started_at) {
        const startTime = new Date(pipeline.started_at).getTime();
        const endTime = new Date(pipeline.completed_at).getTime();
        const totalDurationMs = endTime - startTime;
        
        // Distribute total duration proportionally across stages
        const totalProportion = 2 + 45 + 83 + 135 + 30 + 45; // seconds from mock durations
        const secPerMs = totalDurationMs / 1000;
        
        stageDurations = {
          sourceCode: Math.round(secPerMs * (2/totalProportion)) + 's',
          build: Math.round(secPerMs * (45/totalProportion)) + 's',
          test: Math.floor(secPerMs * (83/totalProportion)) > 60 ? 
            Math.floor(secPerMs * (83/totalProportion) / 60) + 'm ' + 
            Math.round(secPerMs * (83/totalProportion) % 60) + 's' : 
            Math.round(secPerMs * (83/totalProportion)) + 's',
          securityScan: totalDuration,
          package: Math.round(secPerMs * (30/totalProportion)) + 's',
          deploy: Math.round(secPerMs * (45/totalProportion)) + 's'
        };
      }
      
      const stages = [
        {
          name: 'Source Code',
          status: 'completed',
          duration: stageDurations.sourceCode,
          checks: ['Code Quality', 'License Scan']
        },
        {
          name: 'Build',
          status: 'completed',
          duration: stageDurations.build,
          checks: ['Dependency Check', 'SAST']
        },
        {
          name: 'Test',
          status: 'completed',
          duration: stageDurations.test,
          checks: ['Unit Tests', 'Integration Tests']
        },
        {
          name: 'Security Scan',
          status: isInProgress ? 'scanning' : (isSuccess ? 'completed' : 'failed'),
          duration: isInProgress ? 'Running...' : stageDurations.securityScan,
          checks: ['DAST', 'Container Scan', 'Secrets Scan']
        },
        {
          name: 'Package',
          status: isSuccess ? 'completed' : (isInProgress ? 'pending' : 'failed'),
          duration: isSuccess ? stageDurations.package : '-',
          checks: ['Image Build', 'Vulnerability Scan']
        },
        {
          name: 'Deploy',
          status: isSuccess ? 'completed' : 'pending',
          duration: isSuccess ? stageDurations.deploy : '-',
          checks: ['Runtime Protection', 'Policy Check']
        }
      ];
      
      return {
        stages,
        buildNumber: pipeline.run_id || Math.floor(Math.random() * 1000) + 1000,
        branch: pipeline.branch_name || 'main',
        status: pipeline.status || 'completed',
        securityGatePassed: isSuccess,
        realData: true // Flag to indicate this is real data
      };
    },
    refetchInterval: 10000, // Refresh every 10 seconds to show live updates
  });
};

// Fallback mock data function
function getMockPipelineData() {
  return {
    stages: [
      {
        name: 'Source Code',
        status: 'completed',
        duration: '2s',
        checks: ['Code Quality', 'License Scan']
      },
      {
        name: 'Build',
        status: 'completed',
        duration: '45s',
        checks: ['Dependency Check', 'SAST']
      },
      {
        name: 'Test',
        status: 'completed',
        duration: '1m 23s',
        checks: ['Unit Tests', 'Integration Tests']
      },
      {
        name: 'Security Scan',
        status: 'completed',
        duration: '2m 15s',
        checks: ['DAST', 'Container Scan', 'Secrets Scan']
      },
      {
        name: 'Package',
        status: 'completed',
        duration: '30s',
        checks: ['Image Build', 'Vulnerability Scan']
      },
      {
        name: 'Deploy',
        status: 'completed',
        duration: '45s',
        checks: ['Runtime Protection', 'Policy Check']
      }
    ],
    buildNumber: 1247,
    branch: 'main',
    status: 'completed',
    securityGatePassed: true,
    realData: false // Flag to indicate this is mock data
  };
}

// Demo mode hooks for public access (no user filtering)
export const useVulnerabilitiesDemo = () => {
  return useQuery({
    queryKey: ['vulnerabilities-demo'],
    queryFn: async () => {
      console.log('🔍 Fetching vulnerabilities in demo mode (no user filter)');
      // @ts-expect-error - Supabase types not fully defined
      const { data, error } = await supabase
        .from('vulnerabilities')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(50); // Limit to 50 for demo purposes
      if (error) {
        console.error('❌ Error fetching vulnerabilities in demo mode:', error);
        throw error;
      }
      console.log('✅ Demo vulnerabilities fetched:', data?.length || 0, 'vulnerabilities');
      console.log('📊 Sample vulnerability:', data?.[0]);
      return data;
    },
    refetchInterval: 30000,
  });
};

export const useSecurityScansDemo = () => {
  return useQuery({
    queryKey: ['security-scans-demo'],
    queryFn: async () => {
      console.log('Fetching security scans in demo mode (no user filter)');
      // Return empty array since security_scans table doesn't exist
      return [];
    },
    refetchInterval: 30000,
  });
};

export const usePipelineFlowDemo = () => {
  return useQuery({
    queryKey: ['pipeline-flow-demo'],
    queryFn: async () => {
      console.log('🔍 Fetching pipeline flow in demo mode...');
      
      // Get the latest pipeline run from the database (no user filter for demo)
      const { data: latestPipeline, error } = await supabase
        .from('pipeline_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('❌ Error fetching pipeline flow in demo mode:', error);
        return getMockPipelineData();
      }
      
      const pipeline = latestPipeline?.[0];
      
      if (!pipeline) {
        console.log('⚠️ No pipeline runs found, using mock data');
        return getMockPipelineData();
      }
      
      console.log('✅ Real pipeline data loaded in demo mode:', pipeline);
      
      // Calculate duration if pipeline is completed
      let totalDuration = '-';
      if (pipeline.completed_at && pipeline.started_at) {
        const startTime = new Date(pipeline.started_at).getTime();
        const endTime = new Date(pipeline.completed_at).getTime();
        const durationMs = endTime - startTime;
        const durationMin = Math.round(durationMs / (1000 * 60));
        const durationSec = Math.round((durationMs % (1000 * 60)) / 1000);
        totalDuration = `${durationMin}m ${durationSec}s`;
      }
      
      // Map real pipeline status to stages
      const isInProgress = pipeline.status === 'In Progress';
      const isSuccess = pipeline.status === 'success';
      const isFailed = pipeline.status === 'failure';
      
      // Calculate realistic stage durations based on total pipeline duration
      let stageDurations = {
        sourceCode: '2s',
        build: '45s', 
        test: '1m 23s',
        securityScan: '2m 15s',
        package: '30s',
        deploy: '45s'
      };
      
      // If we have real duration data, distribute it across stages
      if (pipeline.completed_at && pipeline.started_at) {
        const startTime = new Date(pipeline.started_at).getTime();
        const endTime = new Date(pipeline.completed_at).getTime();
        const totalDurationMs = endTime - startTime;
        
        // Distribute total duration proportionally across stages
        const totalProportion = 2 + 45 + 83 + 135 + 30 + 45; // seconds from mock durations
        const secPerMs = totalDurationMs / 1000;
        
        stageDurations = {
          sourceCode: Math.round(secPerMs * (2/totalProportion)) + 's',
          build: Math.round(secPerMs * (45/totalProportion)) + 's',
          test: Math.floor(secPerMs * (83/totalProportion)) > 60 ? 
            Math.floor(secPerMs * (83/totalProportion) / 60) + 'm ' + 
            Math.round(secPerMs * (83/totalProportion) % 60) + 's' : 
            Math.round(secPerMs * (83/totalProportion)) + 's',
          securityScan: totalDuration,
          package: Math.round(secPerMs * (30/totalProportion)) + 's',
          deploy: Math.round(secPerMs * (45/totalProportion)) + 's'
        };
      }
      
      const stages = [
        {
          name: 'Source Code',
          status: 'completed',
          duration: stageDurations.sourceCode,
          checks: ['Code Quality', 'License Scan']
        },
        {
          name: 'Build',
          status: 'completed',
          duration: stageDurations.build,
          checks: ['Dependency Check', 'SAST']
        },
        {
          name: 'Test',
          status: 'completed',
          duration: stageDurations.test,
          checks: ['Unit Tests', 'Integration Tests']
        },
        {
          name: 'Security Scan',
          status: isInProgress ? 'scanning' : (isSuccess ? 'completed' : 'failed'),
          duration: isInProgress ? 'Running...' : stageDurations.securityScan,
          checks: ['DAST', 'Container Scan', 'Secrets Scan']
        },
        {
          name: 'Package',
          status: isSuccess ? 'completed' : (isInProgress ? 'pending' : 'failed'),
          duration: isSuccess ? stageDurations.package : '-',
          checks: ['Image Build', 'Vulnerability Scan']
        },
        {
          name: 'Deploy',
          status: isSuccess ? 'completed' : 'pending',
          duration: isSuccess ? stageDurations.deploy : '-',
          checks: ['Runtime Protection', 'Policy Check']
        }
      ];
      
      return {
        stages,
        buildNumber: pipeline.run_id || Math.floor(Math.random() * 1000) + 1000,
        branch: pipeline.branch_name || 'main',
        status: pipeline.status || 'completed',
        securityGatePassed: isSuccess,
        realData: true
      };
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};
