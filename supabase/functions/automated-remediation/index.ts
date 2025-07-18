
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RemediationRequest {
  vulnerabilityIds: string[];
  action: 'fix-all' | 'fix-single';
  projectName?: string;
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

    const { vulnerabilityIds, action, projectName }: RemediationRequest = await req.json();
    
    console.log(`Starting ${action} for vulnerabilities:`, vulnerabilityIds);

    // Fetch vulnerabilities to be remediated
    const { data: vulnerabilities, error: fetchError } = await supabaseClient
      .from('vulnerabilities')
      .select('*')
      .in('id', vulnerabilityIds)
      .eq('status', 'open')
      .eq('auto_fixable', true);

    if (fetchError) {
      throw new Error(`Failed to fetch vulnerabilities: ${fetchError.message}`);
    }

    const remediationResults = [];
    
    for (const vuln of vulnerabilities || []) {
      console.log(`Processing vulnerability: ${vuln.title}`);
      
      // Create remediation activity record
      const { data: remediationActivity, error: activityError } = await supabaseClient
        .from('remediation_activities')
        .insert({
          vulnerability_id: vuln.id,
          action_type: 'automated_fix',
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (activityError) {
        console.error(`Failed to create remediation activity for ${vuln.id}:`, activityError);
        continue;
      }

      try {
        // Simulate automated remediation process
        const fixResult = await performAutomatedFix(vuln);
        
        // Update remediation activity
        await supabaseClient
          .from('remediation_activities')
          .update({
            status: fixResult.success ? 'completed' : 'failed',
            completed_at: new Date().toISOString(),
            pr_url: fixResult.prUrl,
            fix_description: fixResult.description,
          })
          .eq('id', remediationActivity.id);

        // Update vulnerability status if fix was successful
        if (fixResult.success) {
          await supabaseClient
            .from('vulnerabilities')
            .update({
              status: 'fixed',
              fixed_at: new Date().toISOString(),
            })
            .eq('id', vuln.id);
        }

        remediationResults.push({
          vulnerabilityId: vuln.id,
          success: fixResult.success,
          prUrl: fixResult.prUrl,
          description: fixResult.description,
        });

      } catch (error) {
        console.error(`Failed to remediate vulnerability ${vuln.id}:`, error);
        
        await supabaseClient
          .from('remediation_activities')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            fix_description: `Remediation failed: ${error.message}`,
          })
          .eq('id', remediationActivity.id);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results: remediationResults,
      summary: {
        total: vulnerabilityIds.length,
        fixed: remediationResults.filter(r => r.success).length,
        failed: remediationResults.filter(r => !r.success).length,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in automated-remediation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performAutomatedFix(vulnerability: { vulnerability_type: string; severity: string; cve_id: string; [key: string]: unknown }) {
  // Simulate different types of fixes based on vulnerability type
  const fixStrategies = {
    'dependency': async () => {
      // Simulate dependency update
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: Math.random() > 0.1, // 90% success rate
        prUrl: `https://github.com/example/repo/pull/${Math.floor(Math.random() * 1000)}`,
        description: `Updated ${vulnerability.component} to latest secure version`,
      };
    },
    'configuration': async () => {
      // Simulate configuration fix
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        success: Math.random() > 0.05, // 95% success rate
        prUrl: `https://github.com/example/repo/pull/${Math.floor(Math.random() * 1000)}`,
        description: `Fixed security configuration in ${vulnerability.file_path}`,
      };
    },
    'default': async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: Math.random() > 0.2, // 80% success rate
        prUrl: `https://github.com/example/repo/pull/${Math.floor(Math.random() * 1000)}`,
        description: `Applied automated fix for ${vulnerability.title}`,
      };
    }
  };

  const strategy = vulnerability.component ? 'dependency' : 'default';
  return await fixStrategies[strategy]();
}
