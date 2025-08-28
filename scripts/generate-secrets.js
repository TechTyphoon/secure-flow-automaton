#!/usr/bin/env node

/**
 * Generate secure secrets for production environment
 */

import crypto from 'crypto';

console.log('🔐 Generating secure secrets for production...\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('base64');
console.log('JWT_SECRET=' + jwtSecret);

// Generate Encryption Key (32 bytes for AES-256)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY=' + encryptionKey);

// Generate Session Secret
const sessionSecret = crypto.randomBytes(32).toString('base64');
console.log('SESSION_SECRET=' + sessionSecret);

// Generate API Key
const apiKey = crypto.randomBytes(24).toString('hex');
console.log('API_KEY=' + apiKey);

console.log('\n✅ Secrets generated successfully!');
console.log('⚠️  Copy these values to your .env.production file');
console.log('⚠️  IMPORTANT: Never commit these values to version control');