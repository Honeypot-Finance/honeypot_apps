#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting cache cleanup...');

// Define cache directories to clean
const cacheDirectories = [
  'apps/wasabee/.next/cache',
  'apps/bgt-market/.next/cache',
  'apps/dreampad/.next/cache',
  'apps/leaderboard/.next/cache',
  'apps/pot2pump/.next/cache',
  'apps/all-in-one-vault/.next/cache',
  'apps/claim-token/.next/cache',
  '.next/cache',
  'node_modules/.cache',
  '.turbo',
  '.nx/cache',
];

// Clean cache function
function cleanCache() {
  let totalCleaned = 0;

  cacheDirectories.forEach((dir) => {
    try {
      if (fs.existsSync(dir)) {
        // Get directory size before cleaning
        const sizeBefore = getDirSize(dir);
        console.log(`📁 Cleaning ${dir} (${formatBytes(sizeBefore)})...`);

        fs.rmSync(dir, { recursive: true, force: true });
        totalCleaned += sizeBefore;
        console.log(`✅ Cleaned ${dir}`);
      }
    } catch (error) {
      console.warn(`⚠️ Could not clean ${dir}:`, error.message);
    }
  });

  console.log(`🎉 Total cache cleaned: ${formatBytes(totalCleaned)}`);
}

// Get directory size
function getDirSize(dir) {
  try {
    const result = execSync(`du -s ${dir}`, { encoding: 'utf8' });
    return parseInt(result.split('\t')[0]) * 1024; // Convert KB to bytes
  } catch (error) {
    return 0;
  }
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Clean temporary files
function cleanTempFiles() {
  console.log('🗑️ Cleaning temporary files...');

  const tempPatterns = [
    '**/*.tmp',
    '**/*.temp',
    '**/*.log',
    '**/npm-debug.log*',
    '**/yarn-debug.log*',
    '**/yarn-error.log*',
    '**/.DS_Store',
    '**/Thumbs.db',
  ];

  tempPatterns.forEach((pattern) => {
    try {
      execSync(`find . -name "${pattern}" -type f -delete`, {
        stdio: 'inherit',
      });
    } catch (error) {
      // Ignore errors for files that don't exist
    }
  });
}

// Main cleanup function
function cleanup() {
  console.log('🚀 Starting comprehensive cleanup...');

  cleanCache();
  cleanTempFiles();

  console.log('✅ Cleanup completed successfully!');
}

// Run cleanup
cleanup();
