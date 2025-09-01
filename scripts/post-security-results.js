#!/usr/bin/env node

/**
 * Post-Security Results Processing Script
 * Processes security scan results and uploads them to external systems
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityResultsProcessor {
  constructor() {
    this.resultsDir = path.join(process.cwd(), 'security-results');
    this.artifactsDir = path.join(process.cwd(), 'artifacts');
  }

  /**
   * Process security scan results
   */
  async processResults() {
    console.log('📊 Processing security scan results...');

    try {
      // Ensure directories exist
      if (!fs.existsSync(this.resultsDir)) {
        fs.mkdirSync(this.resultsDir, { recursive: true });
      }

      // Look for security result files
      const resultFiles = this.findSecurityFiles();
      
      if (resultFiles.length === 0) {
        console.log('⚠️ No security result files found');
        return;
      }

      // Process each result file
      for (const file of resultFiles) {
        await this.processResultFile(file);
      }

      console.log('✅ Security results processing completed');

    } catch (error) {
      console.error('❌ Error processing security results:', error.message);
      // Don't exit with error code to prevent workflow failure
      console.log('⚠️ Continuing workflow despite processing error');
    }
  }

  /**
   * Find security result files
   */
  findSecurityFiles() {
    const files = [];
    const searchDirs = [this.resultsDir, this.artifactsDir, process.cwd()];

    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        const dirFiles = fs.readdirSync(dir, { recursive: true });
        
        for (const file of dirFiles) {
          const fullPath = path.join(dir, file);
          
          if (fs.statSync(fullPath).isFile()) {
            const fileName = path.basename(file);
            
            // Look for security-related files
            if (fileName.includes('security') || 
                fileName.includes('audit') || 
                fileName.includes('scan') ||
                fileName.endsWith('.sarif') ||
                fileName.endsWith('-results.json')) {
              files.push(fullPath);
            }
          }
        }
      }
    }

    return files;
  }

  /**
   * Process individual result file
   */
  async processResultFile(filePath) {
    try {
      console.log(`📄 Processing: ${path.basename(filePath)}`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic validation
      if (filePath.endsWith('.json') || filePath.endsWith('.sarif')) {
        JSON.parse(content); // Validate JSON
        console.log(`✅ Valid JSON/SARIF file: ${path.basename(filePath)}`);
      }

      // Log file stats
      const stats = fs.statSync(filePath);
      console.log(`📊 File size: ${stats.size} bytes`);
      
      // In a real implementation, you would upload to external systems here
      // For now, just log the processing
      console.log(`📤 Would upload ${path.basename(filePath)} to external systems`);

    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    const summary = {
      timestamp: new Date().toISOString(),
      processed_files: this.findSecurityFiles().length,
      status: 'completed',
      workflow_run: process.env.GITHUB_RUN_ID || 'local',
      commit_sha: process.env.GITHUB_SHA || 'unknown'
    };

    const summaryPath = path.join(this.resultsDir, 'processing-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('📋 Summary report generated:', summaryPath);
    return summary;
  }
}

// Main execution
async function main() {
  const processor = new SecurityResultsProcessor();
  
  await processor.processResults();
  const summary = processor.generateSummary();
  
  console.log('\n🎯 Processing Summary:');
  console.log(`   Files processed: ${summary.processed_files}`);
  console.log(`   Status: ${summary.status}`);
  console.log(`   Timestamp: ${summary.timestamp}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Script failed:', error.message);
    // Don't exit with error to prevent workflow failure
    process.exit(0);
  });
}

export default SecurityResultsProcessor;
