// scripts/run-pipeline.js
// Simulates a CI/CD pipeline run: generates mock data and uploads it to Supabase.

import { generateScan } from './generate-mock-data.js';
import { uploadScan } from './load-data-to-supabase.js';

(async () => {
  console.log('Simulating pipeline run...');
  const mockReport = generateScan({ numVulns: Math.floor(Math.random() * 6) + 3 });
  await uploadScan(mockReport);
  console.log('Pipeline simulation finished!');
})();
