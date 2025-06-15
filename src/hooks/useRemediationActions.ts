
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RemediationRequest {
  vulnerabilityIds: string[];
  action: 'fix-all' | 'fix-single';
  projectName?: string;
}

export const useRemediationActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const remediationMutation = useMutation({
    mutationFn: async (request: RemediationRequest) => {
      console.log('Triggering remediation:', request);
      
      const { data, error } = await supabase.functions.invoke('automated-remediation', {
        body: request,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Remediation completed:', data);
      
      toast({
        title: "Remediation Completed",
        description: `Successfully fixed ${data.summary?.fixed || 0} out of ${data.summary?.total || 0} vulnerabilities`,
      });

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
      queryClient.invalidateQueries({ queryKey: ['security-metrics'] });
    },
    onError: (error) => {
      console.error('Remediation failed:', error);
      
      toast({
        title: "Remediation Failed",
        description: error.message || "Failed to complete automated remediation",
        variant: "destructive",
      });
    },
  });

  const pipelineTriggerMutation = useMutation({
    mutationFn: async (request: { projectName: string; branch?: string; triggeredBy: string }) => {
      console.log('Triggering pipeline:', request);
      
      const { data, error } = await supabase.functions.invoke('pipeline-trigger', {
        body: request,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Pipeline triggered:', data);
      
      toast({
        title: "Pipeline Triggered",
        description: `Security scan pipeline started. Estimated duration: ${data.estimatedDuration}`,
      });

      // Invalidate queries to show updated pipeline status
      queryClient.invalidateQueries({ queryKey: ['pipeline-metrics'] });
    },
    onError: (error) => {
      console.error('Pipeline trigger failed:', error);
      
      toast({
        title: "Pipeline Trigger Failed",
        description: error.message || "Failed to trigger security pipeline",
        variant: "destructive",
      });
    },
  });

  return {
    triggerRemediation: remediationMutation.mutate,
    triggerPipeline: pipelineTriggerMutation.mutate,
    isRemediating: remediationMutation.isPending,
    isTriggeringPipeline: pipelineTriggerMutation.isPending,
  };
};
