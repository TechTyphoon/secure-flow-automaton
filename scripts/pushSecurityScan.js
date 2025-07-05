// scripts/pushSecurityScan.js
// Usage: node scripts/pushSecurityScan.js <scan-results.json>
// This script uploads a security scan and its vulnerabilities to Supabase.


import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://znubqwefuxqkzjgtrdcf.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudWJxd2VmdXhxa3pqZ3RyZGNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTgyMzI2MCwiZXhwIjoyMDY1Mzk5MjYwfQ.O05oilmlVAu9_jjIRTFnj5rCvZjybxt6PiBY4OTtKUo';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY. Set them in your .env file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);


async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error('Usage: node scripts/pushSecurityScan.js <scan-results.json>');
    process.exit(1);
  }

  const scanData = JSON.parse(fs.readFileSync(path.resolve(inputFile), 'utf-8'));

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
        critical_count: scanData.vulnerabilities.filter(v => v.severity === 'critical').length,
        high_count: scanData.vulnerabilities.filter(v => v.severity === 'high').length,
        medium_count: scanData.vulnerabilities.filter(v => v.severity === 'medium').length,
        low_count: scanData.vulnerabilities.filter(v => v.severity === 'low').length,
        scan_results: scanData,
      },
    ])
    .select()
    .single();

  if (scanError) {
    console.error('Error inserting scan:', scanError);
    process.exit(1);
  }

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
      process.exit(1);
    }
  }

  console.log('Scan and vulnerabilities uploaded successfully!');
}

main();
