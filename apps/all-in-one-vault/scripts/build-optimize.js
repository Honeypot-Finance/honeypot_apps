#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clean any existing build artifacts
function cleanBuildArtifacts() {
  console.log('🧹 Cleaning build artifacts...');

  const pathsToClean = ['.next', 'node_modules/.cache', '.nx/cache'];

  pathsToClean.forEach((cleanPath) => {
    try {
      if (fs.existsSync(cleanPath)) {
        fs.rmSync(cleanPath, { recursive: true, force: true });
        console.log(`✅ Cleaned ${cleanPath}`);
      }
    } catch (error) {
      console.log(`⚠️ Could not clean ${cleanPath}:`, error.message);
    }
  });
}

// Main build function
function build() {
  console.log('🚀 Starting optimized build for all-in-one-vault...');

  // Set optimized environment variables
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.SENTRY_UPLOAD_SOURCEMAPS = 'false';
  process.env.SENTRY_DISABLE_TELEMETRY = 'true';

  // Advanced Node.js memory management optimizations
  const nodeOptions = [
    '--max-old-space-size=4096', // 4GB memory limit
    '--max-semi-space-size=256', // Reduced semi-space for faster GC
    '--optimize-for-size', // Optimize for smaller memory footprint
    '--gc-interval=100', // More frequent garbage collection
    '--expose-gc', // Allow manual garbage collection
    '--trace-warnings', // Enable tracing for debugging
    '--no-deprecation', // Reduce noise
    '--no-warnings', // Reduce noise
  ].join(' ');

  // Advanced build environment settings
  const buildEnv = {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
    // Disable all telemetry and monitoring
    NEXT_TELEMETRY_DISABLED: '1',
    SENTRY_UPLOAD_SOURCEMAPS: 'false',
    SENTRY_DISABLE_TELEMETRY: 'true',
    SENTRY_SILENT: 'true',
    // Webpack optimizations
    WEBPACK_CACHE_DISABLED: 'true',
    // UV thread pool optimization
    UV_THREADPOOL_SIZE: '6', // Increase thread pool for better parallelism
    // Memory optimizations
    NODE_NO_WARNINGS: '1',
    NODE_DISABLE_COLORS: '1',
    // Build optimizations
    FORCE_COLOR: '0',
    CI: 'true', // Enable CI optimizations
  };

  // Run build with optimized settings
  const buildCommand = `pnpm exec nx build all-in-one-vault --prod`;

  console.log('🔧 Build command:', buildCommand);
  console.log('🧠 Node.js memory settings:', nodeOptions);

  try {
    execSync(buildCommand, {
      stdio: 'inherit',
      env: buildEnv,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });

    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Main execution
try {
  cleanBuildArtifacts();
  build();
} catch (error) {
  console.error('💥 Build script failed:', error.message);
  process.exit(1);
}
