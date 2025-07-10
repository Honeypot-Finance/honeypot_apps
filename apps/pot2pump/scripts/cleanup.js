#!/usr/bin/env node

/**
 * Cleanup script for pot2pump
 * Removes build artifacts and cache files to free up memory
 */

const fs = require('fs');
const path = require('path');

const cleanupPaths = [
  // Build outputs
  'dist/apps/pot2pump',
  '.next',
  'out',

  // Cache directories
  'node_modules/.cache',
  '.vercel/cache',
  '.next/cache',

  // TypeScript build info
  'tsconfig.tsbuildinfo',

  // Test artifacts
  'coverage',
  '.nyc_output',

  // Logs
  'npm-debug.log*',
  'yarn-debug.log*',
  'yarn-error.log*',
  'pnpm-debug.log*',

  // Misc
  '.eslintcache',
  '.stylelintcache',
];

console.log('🧹 Starting pot2pump cleanup...');

let cleanedCount = 0;
let totalSize = 0;

cleanupPaths.forEach((cleanupPath) => {
  const fullPath = path.resolve(cleanupPath);

  if (fs.existsSync(fullPath)) {
    try {
      // Calculate size before deletion
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        // For directories, we'll just count them
        totalSize += 1;
      } else {
        totalSize += stats.size;
      }

      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`  ✓ Cleaned: ${cleanupPath}`);
      cleanedCount++;
    } catch (error) {
      console.warn(`  ⚠️  Could not clean ${cleanupPath}:`, error.message);
    }
  }
});

console.log(`\n🎉 Cleanup complete!`);
console.log(`  - Cleaned ${cleanedCount} items`);
console.log(`  - Memory freed up for next build`);

// Force garbage collection if available
if (global.gc) {
  console.log('🗑️  Running garbage collection...');
  global.gc();
}
