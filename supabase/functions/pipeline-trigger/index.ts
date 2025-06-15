
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PipelineTriggerRequest {
  projectName: string;
  branch?: string;
  scanTypes?: string[];
  triggeredBy: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { projectName, branch = 'main', scanTypes = ['sast', 'sca', 'secrets'], triggeredBy }: PipelineTriggerRequest = await req.json();
    
    console.log(`Triggering pipeline for project: ${projectName}, branch: ${branch}`);

    // Create pipeline metrics record
    const pipelineId = `pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: pipelineMetric, error: pipelineError } = await supabaseClient
      .from('pipeline_metrics')
      .insert({
        pipeline_id: pipelineId,
        project_name: projectName,
        branch: branch,
        status: 'running',
        triggered_by: triggeredBy,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (pipelineError) {
      throw new Error(`Failed to create pipeline record: ${pipelineError.message}`);
    }

    // Simulate pipeline execution
    simulatePipelineExecution(supabaseClient, pipelineId, projectName, branch, scanTypes);

    return new Response(JSON.stringify({
      success: true,
      pipelineId,
      status: 'running',
      estimatedDuration: '4-6 minutes',
      scanTypes,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pipeline-trigger function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function simulatePipelineExecution(supabaseClient: any, pipelineId: string, projectName: string, branch: string, scanTypes: string[]) {
  // Simulate pipeline stages
  const stages = [
    { name: 'checkout', duration: 30000 },
    { name: 'build', duration: 60000 },
    { name: 'security-scan', duration: 180000 },
    { name: 'report', duration: 30000 },
  ];

  let currentTime = Date.now();
  
  for (const stage of stages) {
    console.log(`Pipeline ${pipelineId}: Starting stage ${stage.name}`);
    
    // Wait for stage duration
    await new Promise(resolve => setTimeout(resolve, Math.min(stage.duration, 10000))); // Shortened for demo
    
    currentTime += stage.duration;
    
    if (stage.name === 'security-scan') {
      // Create security scans for each scan type
      for (const scanType of scanTypes) {
        const scanId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await supabaseClient
          .from('security_scans')
          .insert({
            id: scanId,
            project_name: projectName,
            branch: branch,
            scan_type: scanType,
            status: 'completed',
            started_at: new Date(currentTime - stage.duration).toISOString(),
            completed_at: new Date(currentTime).toISOString(),
            critical_count: Math.floor(Math.random() * 3),
            high_count: Math.floor(Math.random() * 5),
            medium_count: Math.floor(Math.random() * 10),
            low_count: Math.floor(Math.random() * 15),
          });
      }
    }
  }

  // Complete pipeline
  const completedAt = new Date().toISOString();
  const duration = Math.floor((Date.now() - new Date(currentTime - stages.reduce((sum, stage) => sum + stage.duration, 0)).getTime()) / 1000);
  
  await supabaseClient
    .from('pipeline_metrics')
    .update({
      status: 'completed',
      completed_at: completedAt,
      duration_seconds: duration,
      security_gate_passed: Math.random() > 0.2, // 80% pass rate
      metrics: {
        stages_completed: stages.length,
        scan_types_executed: scanTypes,
        total_duration: duration,
      }
    })
    .eq('pipeline_id', pipelineId);

  console.log(`Pipeline ${pipelineId} completed successfully`);
}
