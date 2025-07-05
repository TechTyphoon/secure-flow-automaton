// scripts/load-data-to-supabase.js
// Usage: node scripts/load-data-to-supabase.js <scan-report.json>
// This script uploads a security scan and its vulnerabilities to Supabase.

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';


// Use environment variables for credentials (works for Netlify, GitHub Actions, and local .env)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY. Set them as environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function countBySeverity(vulnerabilities, severity) {
  return vulnerabilities.filter(v => v.severity === severity).length;
}

async function uploadScan(scanData) {
  try {
    // Insert into security_scans
    const { data: scan, error: scanError } = await supabase
      .from('security_scans')
      .insert([
        {
          project_name: scanData.project_name,
          branch: scanData.branch || 'main',
          scan_type: scanData.scan_type || 'manual',
          status: scanData.status || 'completed',
          started_at: scanData.started_at || new Date().toISOString(),
          completed_at: scanData.completed_at || new Date().toISOString(),
          total_vulnerabilities: scanData.vulnerabilities.length,
          critical_count: countBySeverity(scanData.vulnerabilities, 'critical'),
          high_count: countBySeverity(scanData.vulnerabilities, 'high'),
          medium_count: countBySeverity(scanData.vulnerabilities, 'medium'),
          low_count: countBySeverity(scanData.vulnerabilities, 'low'),
          scan_results: scanData,
        },
      ])
      .select()
      .single();

    if (scanError) {
      console.error('Error inserting scan:', scanError);
      return;
    }
    console.log(`Inserted scan with id: ${scan.id}`);

    // Insert vulnerabilities
    const vulnerabilities = scanData.vulnerabilities.map(v => ({
      scan_id: scan.id,
      title: v.title,
      description: v.description,
      severity: v.severity,
      cve_id: v.cve_id,
      component: v.component,
      file_path: v.file_path,
      line_number: v.line_number,
      status: v.status || 'open',
      auto_fixable: v.auto_fixable || false,
      confidence_score: v.confidence_score || 0,
      remediation_advice: v.remediation_advice,
      first_detected: v.first_detected || new Date().toISOString(),
      last_seen: v.last_seen || new Date().toISOString(),
    }));

    if (vulnerabilities.length > 0) {
      const { error: vulnError } = await supabase
        .from('vulnerabilities')
        .insert(vulnerabilities);
      if (vulnError) {
        console.error('Error inserting vulnerabilities:', vulnError);
        return;
      }
      console.log(`Inserted ${vulnerabilities.length} vulnerabilities.`);
    } else {
      console.log('No vulnerabilities to insert.');
    }
    console.log('Scan and vulnerabilities uploaded successfully!');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// If run directly, load JSON file and upload
if (process.argv[1] && process.argv[1].endsWith('load-data-to-supabase.js')) {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error('Usage: node scripts/load-data-to-supabase.js <scan-report.json>');
    process.exit(1);
  }
  const scanData = JSON.parse(fs.readFileSync(path.resolve(inputFile), 'utf-8'));
  uploadScan(scanData);
}

// Export for programmatic use
export { uploadScan };
