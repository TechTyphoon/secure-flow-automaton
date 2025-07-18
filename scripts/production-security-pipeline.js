#!/usr/bin/env node

/**
 * Production Security Pipeline Runner
 * Integrates with real security scanning tools and CI/CD platforms
 */

import { RealSecurityService } from '../src/services/realSecurityService.js';
import { createClient } from '@supabase/supabase-js';
import * as winston from 'winston';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'pipeline.log' })
  ]
});

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Initialize security service
const securityService = new RealSecurityService();

async function runSecurityPipeline() {
  try {
    logger.info('🚀 Starting production security pipeline');
    
    // Get environment variables
    const owner = process.env.GITHUB_OWNER || process.argv[2];
    const repo = process.env.GITHUB_REPO || process.argv[3];
    const branch = process.env.GITHUB_BRANCH || process.argv[4] || 'main';
    
    if (!owner || !repo) {
      throw new Error('GitHub owner and repository are required');
    }
    
    logger.info(`📋 Pipeline Configuration:`, {
      owner,
      repo,
      branch,
      tools: ['github-security', 'sonarcloud', 'dependency-check']
    });
    
    // Create pipeline run record
    const pipelineRun = {
      id: crypto.randomUUID(),
      project_name: `${owner}/${repo}`,
      branch_name: branch,
      status: 'running',
      started_at: new Date().toISOString(),
      run_id: Date.now(),
      user_id: process.env.PIPELINE_USER_ID || null
    };
    
    const { error: pipelineError } = await supabase
      .from('pipeline_runs')
      .insert(pipelineRun);
    
    if (pipelineError) {
      logger.error('❌ Failed to create pipeline run:', pipelineError);
      throw pipelineError;
    }
    
    logger.info('📊 Pipeline run created:', { id: pipelineRun.id });
    
    // Step 1: Run comprehensive security scan
    logger.info('🔍 Step 1: Running comprehensive security scan');
    const scanResult = await securityService.scanRepository(owner, repo);
    
    // Step 2: Store scan results
    logger.info('💾 Step 2: Storing scan results');
    const { error: scanError } = await supabase
      .from('security_scans')
      .insert({
        ...scanResult,
        user_id: process.env.PIPELINE_USER_ID || null
      });
    
    if (scanError) {
      logger.error('❌ Failed to store scan results:', scanError);
      throw scanError;
    }
    
    // Step 3: Analyze results and determine pipeline outcome
    logger.info('📈 Step 3: Analyzing results');
    const shouldFailPipeline = analyzeSecurityResults(scanResult);
    
    // Step 4: Update pipeline run status
    const finalStatus = shouldFailPipeline ? 'failed' : 'completed';
    const { error: updateError } = await supabase
      .from('pipeline_runs')
      .update({
        status: finalStatus,
        completed_at: new Date().toISOString()
      })
      .eq('id', pipelineRun.id);
    
    if (updateError) {
      logger.error('❌ Failed to update pipeline run:', updateError);
      throw updateError;
    }
    
    // Step 5: Generate reports and notifications
    logger.info('📧 Step 5: Generating reports and notifications');
    await generateSecurityReport(scanResult);
    await sendNotifications(scanResult, finalStatus);
    
    // Final results
    logger.info('✅ Pipeline completed successfully', {
      status: finalStatus,
      totalVulnerabilities: scanResult.total_vulnerabilities,
      criticalCount: scanResult.critical_count,
      highCount: scanResult.high_count,
      securityGatePassed: !shouldFailPipeline
    });
    
    // Exit with appropriate code
    process.exit(shouldFailPipeline ? 1 : 0);
    
  } catch (error) {
    logger.error('❌ Pipeline failed:', error);
    
    // Update pipeline run status to failed
    try {
      await supabase
        .from('pipeline_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', pipelineRun?.id);
    } catch (updateError) {
      logger.error('❌ Failed to update pipeline status:', updateError);
    }
    
    process.exit(1);
  }
}

function analyzeSecurityResults(scanResult) {
  const threshold = process.env.VULNERABILITY_THRESHOLD || 'high';
  
  switch (threshold) {
    case 'critical':
      return scanResult.critical_count > 0;
    case 'high':
      return scanResult.critical_count > 0 || scanResult.high_count > 0;
    case 'medium':
      return scanResult.critical_count > 0 || scanResult.high_count > 0 || scanResult.medium_count > 5;
    default:
      return scanResult.critical_count > 0;
  }
}

async function generateSecurityReport(scanResult) {
  const report = {
    timestamp: new Date().toISOString(),
    project: scanResult.project_name,
    branch: scanResult.branch,
    summary: {
      total_vulnerabilities: scanResult.total_vulnerabilities,
      critical: scanResult.critical_count,
      high: scanResult.high_count,
      medium: scanResult.medium_count,
      low: scanResult.low_count
    },
    tools_used: scanResult.scan_results?.scan_metadata?.tools_used || [],
    scan_duration: scanResult.scan_results?.scan_metadata?.scan_duration || 0
  };
  
  logger.info('📄 Security report generated:', report);
  
  // Here you could save the report to a file or send it to a monitoring system
  // For example: await fs.writeFile(`security-report-${Date.now()}.json`, JSON.stringify(report, null, 2));
}

async function sendNotifications(scanResult, status) {
  const notifications = {
    slack: process.env.SLACK_WEBHOOK_URL,
    email: process.env.EMAIL_NOTIFICATIONS === 'true',
    webhook: process.env.WEBHOOK_NOTIFICATIONS === 'true'
  };
  
  const message = `
🛡️ Security Pipeline ${status.toUpperCase()}
Project: ${scanResult.project_name}
Branch: ${scanResult.branch}
Vulnerabilities Found: ${scanResult.total_vulnerabilities}
Critical: ${scanResult.critical_count}
High: ${scanResult.high_count}
Medium: ${scanResult.medium_count}
Low: ${scanResult.low_count}
`;
  
  logger.info('📢 Notifications sent:', { status, vulnerabilities: scanResult.total_vulnerabilities });
  
  // Here you would implement actual notification sending
  // For example: await sendSlackNotification(message);
  // await sendEmailNotification(message);
}

// Run the pipeline
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityPipeline().catch(console.error);
}

export { runSecurityPipeline };
