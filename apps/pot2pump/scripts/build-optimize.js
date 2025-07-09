#!/usr/bin/env node

/**
 * Build optimization script for pot2pump
 * Prevents OOM errors on Vercel by managing memory and cleaning up build artifacts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Memory management settings
const MEMORY_LIMIT = '4096'; // 4GB
const GC_INTERVAL = '100';

// Build environment optimization
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_OPTIONS = `--max-old-space-size=${MEMORY_LIMIT} --gc-interval=${GC_INTERVAL}`;
process.env.UV_THREADPOOL_SIZE = '4';

console.log('🚀 Starting pot2pump build optimization...');
console.log(`Memory limit: ${MEMORY_LIMIT}MB`);
console.log(`GC interval: ${GC_INTERVAL}`);

// Clean up previous builds
const cleanupPaths = [
  'dist/apps/pot2pump',
  '.next',
  'node_modules/.cache',
  '.vercel/cache',
];

cleanupPaths.forEach((cleanupPath) => {
  const fullPath = path.resolve(cleanupPath);
  if (fs.existsSync(fullPath)) {
    console.log(`🧹 Cleaning up: ${cleanupPath}`);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Warning: Could not clean ${cleanupPath}:`, error.message);
    }
  }
});

// Force garbage collection before build
if (global.gc) {
  console.log('🗑️  Running garbage collection...');
  global.gc();
}

// Build with optimizations
console.log('🔨 Building pot2pump with memory optimizations...');
try {
  execSync(
    `node --max-old-space-size=${MEMORY_LIMIT} --gc-interval=${GC_INTERVAL} ./node_modules/.bin/nx build pot2pump --prod`,
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
        NODE_OPTIONS: `--max-old-space-size=${MEMORY_LIMIT} --gc-interval=${GC_INTERVAL}`,
      },
    }
  );

  console.log('✅ Build completed successfully!');

  // Post-build cleanup
  console.log('🧹 Post-build cleanup...');
  const postBuildCleanup = ['node_modules/.cache', '.next/cache'];

  postBuildCleanup.forEach((cleanupPath) => {
    const fullPath = path.resolve(cleanupPath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`  ✓ Cleaned: ${cleanupPath}`);
      } catch (error) {
        console.warn(`  ⚠️  Could not clean ${cleanupPath}:`, error.message);
      }
    }
  });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('🎉 pot2pump build optimization complete!');
