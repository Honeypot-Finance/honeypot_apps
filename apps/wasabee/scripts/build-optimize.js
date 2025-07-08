#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cleanup function
function cleanup() {
  console.log('🧹 Cleaning up before build...');

  const cleanupPaths = [
    '.next/cache',
    '.next/server',
    '.next/static',
    '.next/standalone',
    '.next/build-manifest.json',
    '.next/export-marker.json',
    '.next/required-server-files.json',
    '.next/routes-manifest.json',
    '.next/trace',
    '.next/react-loadable-manifest.json',
    'node_modules/.cache',
    '.swc',
    'tsconfig.tsbuildinfo',
  ];

  cleanupPaths.forEach((path) => {
    if (fs.existsSync(path)) {
      fs.rmSync(path, { recursive: true, force: true });
    }
  });

  console.log('✨ Cleanup completed');
}

// Main build function
function build() {
  console.log(
    '🚀 Starting optimized build (no-cache for memory efficiency)...'
  );

  // Set optimized environment variables
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.SENTRY_UPLOAD_SOURCEMAPS = 'false';
  process.env.SENTRY_DISABLE_TELEMETRY = 'true';

  // Advanced Node.js memory management optimizations
  const nodeOptions = [
    '--max-old-space-size=4096', // Increase to 4GB since no caching means more memory available
    '--max-semi-space-size=256', // Reduced semi-space for faster GC
    '--optimize-for-size', // Optimize for smaller memory footprint
    '--gc-interval=100', // More frequent garbage collection
    '--max-old-space-size=4096',
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
  const buildCommand = `pnpm exec nx build wasabee --prod`;

  console.log('🔧 Build command:', buildCommand);
  console.log('🧠 Node.js memory settings:', nodeOptions);

  try {
    execSync(buildCommand, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: buildEnv,
      maxBuffer: 1024 * 1024 * 50, // 50MB buffer
    });

    console.log('✅ Build completed successfully!');

    // Aggressive post-build cleanup
    setTimeout(() => {
      const postBuildCleanup = [
        '.next/cache',
        '.next/trace',
        '.next/server/chunks/polyfills.js.map',
        '.next/server/chunks/webpack.js.map',
        'node_modules/.cache',
        '.swc',
      ];

      postBuildCleanup.forEach((path) => {
        if (fs.existsSync(path)) {
          fs.rmSync(path, { recursive: true, force: true });
        }
      });

      console.log('🧹 Post-build cleanup completed');
    }, 1000);
  } catch (error) {
    console.error('❌ Build failed:', error.message);

    // Emergency cleanup on failure
    const emergencyCleanup = ['.next/cache', 'node_modules/.cache'];

    emergencyCleanup.forEach((path) => {
      if (fs.existsSync(path)) {
        try {
          fs.rmSync(path, { recursive: true, force: true });
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    });

    process.exit(1);
  }
}

// Run the build
cleanup();
build();
