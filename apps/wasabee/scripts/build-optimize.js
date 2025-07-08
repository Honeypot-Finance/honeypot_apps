#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

console.log('🚀 Starting build optimization...');

// Define cache directories
const cacheDirectories = [
  path.join(__dirname, '../.next/cache'),
  path.join(__dirname, '../node_modules/.cache'),
  path.join(__dirname, '../../../.next/cache'),
];

// Clean cache function
function cleanCache() {
  console.log('🧹 Cleaning cache directories...');

  cacheDirectories.forEach((dir) => {
    try {
      if (fs.existsSync(dir)) {
        console.log(`Cleaning ${dir}...`);
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Cleaned ${dir}`);
      }
    } catch (error) {
      console.warn(`⚠️ Could not clean ${dir}:`, error.message);
    }
  });
}

// Memory optimization function
function optimizeMemory() {
  console.log('🎯 Setting memory optimization flags...');

  // Set Node.js memory flags
  const nodeOptions = [
    '--max-old-space-size=2048',
    '--max-semi-space-size=128',
  ].join(' ');

  process.env.NODE_OPTIONS = nodeOptions;
  console.log('📊 Node.js memory flags set:', nodeOptions);
}

// Main optimization function
function optimize() {
  if (isVercel && isProduction) {
    console.log('🔧 Running Vercel production optimizations...');

    // Clean cache first
    cleanCache();

    // Set memory optimizations
    optimizeMemory();

    // Set environment variables for build optimization
    process.env.NEXT_TELEMETRY_DISABLED = '1';
    process.env.DISABLE_SENTRY = 'true';

    console.log('✅ Optimizations complete!');
  } else {
    console.log('🏠 Running local development optimizations...');
    optimizeMemory();
  }
}

// Run optimization
optimize();

// If this script is run directly, execute the build
if (require.main === module) {
  try {
    console.log('🏗️ Starting Next.js build...');
    execSync('npx next build', {
      stdio: 'inherit',
      env: { ...process.env },
    });
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}
