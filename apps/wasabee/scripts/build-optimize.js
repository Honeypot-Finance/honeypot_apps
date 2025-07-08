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

// Clean cache function with aggressive cleanup
function cleanCache() {
  console.log('🧹 Running aggressive cache cleanup...');

  try {
    // Use the aggressive cleanup script
    const cleanupScript = path.join(__dirname, 'clean-aggressive.js');
    if (fs.existsSync(cleanupScript)) {
      execSync(`node "${cleanupScript}"`, { stdio: 'inherit' });
    } else {
      // Fallback to basic cleanup
      console.log('🔄 Using fallback cleanup...');
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
  } catch (error) {
    console.warn(
      '⚠️ Aggressive cleanup failed, continuing with build...',
      error.message
    );
  }
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

    // Use nx build with NODE_OPTIONS set directly
    const buildCommand = 'npx nx build wasabee --prod';
    const nodeOptions = '--max-old-space-size=2048 --max-semi-space-size=128';

    execSync(buildCommand, {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: nodeOptions,
        // Disable all Sentry operations during build
        DISABLE_SENTRY: 'true',
        SENTRY_UPLOAD_SOURCE_MAPS: 'false',
        NEXT_TELEMETRY_DISABLED: '1',
        // Additional memory optimizations
        UV_THREADPOOL_SIZE: '4', // Limit thread pool
      },
    });
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}
