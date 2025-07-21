import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function postSecurityResults() {
  try {
    console.log('📊 Processing security scan results...');
    
    // Read scan results
    const eslintResults = await readJsonFile('eslint-results.json');
    const auditResults = await readJsonFile('npm-audit-results.json');
    
    // Get GitHub context
    const githubContext = {
      owner: process.env.GITHUB_REPOSITORY_OWNER || 'TechTyphoon',
      repo: process.env.GITHUB_REPOSITORY?.split('/')[1] || 'secure-flow-automaton',
      sha: process.env.GITHUB_SHA || 'unknown',
      ref: process.env.GITHUB_REF || 'refs/heads/main',
      runId: process.env.GITHUB_RUN_ID || Math.floor(Math.random() * 1000000)
    };
    
    // Create security scan record
    const scanResult = await createSecurityScan(githubContext, eslintResults, auditResults);
    console.log('✅ Security scan results posted successfully:', scanResult.id);
    
    // Create pipeline run record
    const pipelineResult = await createPipelineRun(githubContext, scanResult);
    console.log('✅ Pipeline run recorded successfully:', pipelineResult.id);
    
  } catch (error) {
    console.error('❌ Error posting security results:', error);
    process.exit(1);
  }
}

async function readJsonFile(filename) {
  try {
    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename, 'utf8');
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.warn(`⚠️  Could not read ${filename}:`, error.message);
    return null;
  }
}

async function createSecurityScan(context, eslintResults, auditResults) {
  const vulnerabilities = [];
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  
  // Process ESLint security results
  if (eslintResults) {
    eslintResults.forEach(file => {
      file.messages.forEach(message => {
        if (message.ruleId && message.ruleId.includes('security/')) {
          const severity = getSeverityFromESLint(message.severity);
          const vulnerability = {
            id: `eslint-${file.filePath}-${message.line}-${message.column}`,
            title: message.message,
            description: `Security issue found by ESLint rule: ${message.ruleId}`,
            severity: severity,
            file_path: file.filePath,
            line_number: message.line,
            column_number: message.column,
            tool: 'ESLint Security',
            rule_id: message.ruleId,
            first_detected: new Date().toISOString()
          };
          
          vulnerabilities.push(vulnerability);
          updateSeverityCount(severity);
        }
      });
    });
  }
  
  // Process npm audit results
  if (auditResults && auditResults.vulnerabilities) {
    Object.entries(auditResults.vulnerabilities).forEach(([packageName, vuln]) => {
      const severity = mapNpmSeverity(vuln.severity);
      const vulnerability = {
        id: `npm-${packageName}-${vuln.range}`,
        title: `${packageName}: ${vuln.title || 'Dependency vulnerability'}`,
        description: vuln.overview || 'Vulnerability found in npm dependency',
        severity: severity,
        file_path: 'package.json',
        tool: 'npm audit',
        cve_id: vuln.cves?.[0] || null,
        package_name: packageName,
        affected_versions: vuln.range,
        first_detected: new Date().toISOString()
      };
      
      vulnerabilities.push(vulnerability);
      updateSeverityCount(severity);
    });
  }
  
  function updateSeverityCount(severity) {
    switch (severity) {
      case 'critical': criticalCount++; break;
      case 'high': highCount++; break;
      case 'medium': mediumCount++; break;
      case 'low': lowCount++; break;
    }
  }
  
  // Create security scan record
  const { data: scanData, error: scanError } = await supabase
    .from('security_scans')
    .insert({
      project_name: context.repo,
      branch: context.ref.replace('refs/heads/', ''),
      scan_type: 'automated',
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      total_vulnerabilities: vulnerabilities.length,
      critical_count: criticalCount,
      high_count: highCount,
      medium_count: mediumCount,
      low_count: lowCount,
      scan_results: {
        eslint_results: eslintResults,
        audit_results: auditResults,
        vulnerabilities: vulnerabilities,
        github_context: context
      }
    })
    .select()
    .single();
  
  if (scanError) {
    throw new Error(`Failed to create security scan: ${scanError.message}`);
  }
  
  // Insert vulnerabilities if any were found
  if (vulnerabilities.length > 0) {
    const vulnerabilityRecords = vulnerabilities.map(vuln => ({
      ...vuln,
      scan_id: scanData.id,
      status: 'open',
      scanned_at: new Date().toISOString()
    }));
    
    const { error: vulnError } = await supabase
      .from('vulnerabilities')
      .insert(vulnerabilityRecords);
    
    if (vulnError) {
      console.warn('⚠️  Failed to insert vulnerabilities:', vulnError.message);
    }
  }
  
  return scanData;
}

async function createPipelineRun(context, scanResult) {
  const { data, error } = await supabase
    .from('pipeline_runs')
    .insert({
      run_id: parseInt(context.runId),
      branch_name: context.ref.replace('refs/heads/', ''),
      status: scanResult.total_vulnerabilities > 0 ? 'completed_with_issues' : 'success',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create pipeline run: ${error.message}`);
  }
  
  return data;
}

function getSeverityFromESLint(severity) {
  switch (severity) {
    case 2: return 'high';
    case 1: return 'medium';
    default: return 'low';
  }
}

function mapNpmSeverity(severity) {
  switch (severity) {
    case 'critical': return 'critical';
    case 'high': return 'high';
    case 'moderate': return 'medium';
    case 'low': return 'low';
    default: return 'low';
  }
}

// Run the script
postSecurityResults();
