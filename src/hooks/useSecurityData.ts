
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
      // @ts-ignore
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
      // @ts-ignore
      const { data, error } = await supabase
        .from('vulnerabilities')
        .select(`
          *,
          security_scans (
            project_name,
            scan_type
          )
        `)
        .eq('user_id', user.id)
        .order('first_detected', { ascending: false });
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
  const { user } = useAuth();
  return useQuery({
    queryKey: ['security-metrics', user?.id],
    queryFn: async () => {
      if (!user) return {};
      console.log('Calculating security metrics for user:', user.id);
      // @ts-ignore
      const { data: vulnCounts, error: vulnError } = await supabase
        .from('vulnerabilities')
        .select('severity, status')
        .eq('status', 'open')
        .eq('user_id', user.id);

      if (vulnError) {
        console.error('Error fetching vulnerability counts:', vulnError);
        throw vulnError;
      }

      // @ts-ignore
      const { data: recentFixes, error: fixError } = await supabase
        .from('vulnerabilities')
        .select('*')
        .eq('status', 'fixed')
        .eq('user_id', user.id)
        .gte('fixed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (fixError) {
        console.error('Error fetching recent fixes:', fixError);
        throw fixError;
      }

      // @ts-ignore
      const { data: scans, error: scanError } = await supabase
        .from('security_scans')
        .select('started_at, completed_at')
        .eq('user_id', user.id)
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

      // Calculate average scan duration in minutes with proper validation
      let avgDuration = 4.2; // Default fallback value
      if (scans?.length > 0) {
        const validDurations = scans
          .map(scan => {
            const startTime = new Date(scan.started_at).getTime();
            const endTime = new Date(scan.completed_at!).getTime();
            const duration = endTime - startTime;
            // Only include positive durations (valid scans)
            return duration > 0 ? duration : null;
          })
          .filter(duration => duration !== null) as number[];
        if (validDurations.length > 0) {
          const totalDuration = validDurations.reduce((acc, duration) => acc + duration, 0);
          avgDuration = totalDuration / validDurations.length / (1000 * 60); // Convert to minutes
        }
      }

      const metrics = {
        securityScore,
        activeVulnerabilities: activeVulns,
        recentFixes: recentFixes?.length || 0,
        avgScanDuration: Math.round(avgDuration * 10) / 10,
      };
      console.log('Calculated metrics:', metrics);
      return metrics;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};
