#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../../public/icons');

// Create a simple SVG icon if logo doesn't exist
const createBasicIcon = () => {
  const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="64" fill="url(#grad1)"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="white">SF</text>
  <circle cx="256" cy="180" r="40" fill="white" opacity="0.9"/>
</svg>`;

  const logoPath = path.join(__dirname, '../../public/logo.svg');
  if (!fs.existsSync(logoPath)) {
    fs.writeFileSync(logoPath, svgContent);
    console.log('Created basic logo.svg');
  }
};

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create basic icons (for now, just copy the logo as PNG)
createBasicIcon();

// Copy logo to all required icon sizes
iconSizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  const logoPath = path.join(__dirname, '../../public/logo.svg');
  
  if (fs.existsSync(logoPath)) {
    // For now, just create a placeholder file
    // In a real implementation, you'd use a library like sharp to convert SVG to PNG
    fs.writeFileSync(iconPath, `# Placeholder for ${size}x${size} icon`);
    console.log(`Created placeholder for icon-${size}x${size}.png`);
  }
});

console.log('Icon generation complete!');
console.log('Note: For production, use a proper image processing library to convert SVG to PNG'); 