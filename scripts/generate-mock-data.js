// scripts/generate-mock-data.js
// Usage: node scripts/generate-mock-data.js [output-file.json]
// Generates a realistic fake security scan report for testing.


import fs from 'fs';
import { faker } from '@faker-js/faker';

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function generateVulnerability() {
  const severities = ['critical', 'high', 'medium', 'low'];
  const severity = randomFromArray(severities);
  return {
    title: faker.hacker.phrase(),
    description: faker.lorem.sentence(),
    severity,
    cve_id: `CVE-2025-${randomInt(1000, 9999)}`,
    component: faker.commerce.productName(),
    file_path: faker.system.filePath(),
    line_number: randomInt(10, 200),
    status: 'open',
    auto_fixable: faker.datatype.boolean(),
    confidence_score: randomInt(60, 100),
    remediation_advice: faker.hacker.verb() + ' ' + faker.hacker.noun(),
    first_detected: new Date().toISOString(),
    last_seen: new Date().toISOString(),
  };
}

export function generateScan({
  project_name = 'demo-app',
  branch = 'main',
  scan_type = 'sast',
  numVulns = 5,
} = {}) {
  const now = new Date();
  const started_at = new Date(now.getTime() - 60000).toISOString();
  const completed_at = now.toISOString();
  const vulnerabilities = Array.from({ length: numVulns }, generateVulnerability);
  return {
    project_name,
    branch,
    scan_type,
    status: 'completed',
    started_at,
    completed_at,
    vulnerabilities,
  };
}

// If run directly, write to file or stdout
if (import.meta.url === `file://${process.argv[1]}`) {
  const outputFile = process.argv[2] || 'scripts/mock-scan-results.json';
  const scan = generateScan({ numVulns: randomInt(3, 8) });
  fs.writeFileSync(outputFile, JSON.stringify(scan, null, 2));
  console.log(`Mock scan data written to ${outputFile}`);
}
