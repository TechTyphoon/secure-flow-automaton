
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSecurityScans = () => {
  return useQuery({
    queryKey: ['security-scans'],
    queryFn: async () => {
      console.log('Fetching security scans...');
      const { data, error } = await supabase
        .from('security_scans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching security scans:', error);
        throw error;
      }
      
      console.log('Security scans data:', data);
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

export const useVulnerabilities = () => {
  return useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: async () => {
      console.log('Fetching vulnerabilities...');
      const { data, error } = await supabase
        .from('vulnerabilities')
        .select(`
          *,
          security_scans (
            project_name,
            scan_type
          )
        `)
        .order('first_detected', { ascending: false });
      
      if (error) {
        console.error('Error fetching vulnerabilities:', error);
        throw error;
      }
      
      console.log('Vulnerabilities data:', data);
      return data;
    },
    refetchInterval: 30000,
  });
};

export const usePipelineMetrics = () => {
  return useQuery({
    queryKey: ['pipeline-metrics'],
    queryFn: async () => {
      console.log('Fetching pipeline metrics...');
      const { data, error } = await supabase
        .from('pipeline_metrics')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching pipeline metrics:', error);
        throw error;
      }
      
      console.log('Pipeline metrics data:', data);
      return data;
    },
    refetchInterval: 30000,
  });
};

export const useSecurityMetrics = () => {
  return useQuery({
    queryKey: ['security-metrics'],
    queryFn: async () => {
      console.log('Calculating security metrics...');
      
      // Get vulnerability counts by severity
      const { data: vulnCounts, error: vulnError } = await supabase
        .from('vulnerabilities')
        .select('severity, status')
        .eq('status', 'open');

      if (vulnError) {
        console.error('Error fetching vulnerability counts:', vulnError);
        throw vulnError;
      }

      // Get recent fixes
      const { data: recentFixes, error: fixError } = await supabase
        .from('vulnerabilities')
        .select('*')
        .eq('status', 'fixed')
        .gte('fixed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (fixError) {
        console.error('Error fetching recent fixes:', fixError);
        throw fixError;
      }

      // Get average scan duration
      const { data: scans, error: scanError } = await supabase
        .from('security_scans')
        .select('started_at, completed_at')
        .not('completed_at', 'is', null)
        .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (scanError) {
        console.error('Error fetching scan durations:', scanError);
        throw scanError;
      }

      const activeVulns = vulnCounts?.length || 0;
      const criticalCount = vulnCounts?.filter(v => v.severity === 'critical').length || 0;
      const highCount = vulnCounts?.filter(v => v.severity === 'high').length || 0;
      
      // Calculate security score (simplified algorithm)
      const maxScore = 100;
      const penalty = criticalCount * 20 + highCount * 10;
      const securityScore = Math.max(0, maxScore - penalty);

      // Calculate average scan duration in minutes
      const avgDuration = scans?.length > 0 
        ? scans.reduce((acc, scan) => {
            const duration = new Date(scan.completed_at!).getTime() - new Date(scan.started_at).getTime();
            return acc + duration;
          }, 0) / scans.length / (1000 * 60)
        : 4.2;

      const metrics = {
        securityScore,
        activeVulnerabilities: activeVulns,
        recentFixes: recentFixes?.length || 0,
        avgScanDuration: Math.round(avgDuration * 10) / 10,
      };

      console.log('Calculated metrics:', metrics);
      return metrics;
    },
    refetchInterval: 30000,
  });
};
