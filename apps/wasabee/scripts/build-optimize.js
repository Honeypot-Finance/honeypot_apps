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
    '.next/export-marker.json',
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
  console.log('🚀 Starting optimized build...');

  // Set optimized environment variables
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.SENTRY_UPLOAD_SOURCEMAPS = 'false';
  process.env.SENTRY_DISABLE_TELEMETRY = 'true';
  process.env.NEXT_BUILD_CACHE_DISABLED = '0'; // Enable limited caching

  // Optimized Node.js settings for better performance with limited memory
  const nodeOptions = [
    '--max-old-space-size=3072', // 3GB limit (increased from 2GB for better performance)
    '--max-semi-space-size=512', // 512MB for new generation
    '--optimize-for-size', // Optimize for smaller memory footprint
    '--use-compressed-oozmap', // Use compressed memory maps
    '--trace-warnings', // Enable tracing for debugging
  ].join(' ');

  // Run build with optimized settings
  const buildCommand = `cross-env NODE_OPTIONS="${nodeOptions}" pnpm exec nx build wasabee --prod`;

  console.log('🔧 Build command:', buildCommand);

  try {
    execSync(buildCommand, {
      stdio: 'inherit',
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });

    console.log('✅ Build completed successfully!');

    // Clean up large files after successful build
    setTimeout(() => {
      const postBuildCleanup = [
        '.next/cache',
        '.next/trace',
        'node_modules/.cache',
      ];

      postBuildCleanup.forEach((path) => {
        if (fs.existsSync(path)) {
          fs.rmSync(path, { recursive: true, force: true });
        }
      });
    }, 1000);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
cleanup();
build();
