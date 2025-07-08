#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting AGGRESSIVE cache cleanup for wasabee...');

// Define all possible cache and temp directories
const cleanupPaths = [
  // Local app caches
  '.next',
  '.next/cache',
  '.next/cache/webpack',
  'node_modules/.cache',
  '.turbo',
  '.vercel',

  // Temporary files
  '*.tmp',
  '*.temp',
  '.DS_Store',
  'Thumbs.db',

  // Large webpack pack files (the actual culprits)
  '.next/cache/webpack/client-production/*.pack',
  '.next/cache/webpack/server-production/*.pack',
  '.next/cache/webpack/*/*.pack',
];

// Function to safely remove files/directories
function safeRemove(pattern) {
  try {
    console.log(`🗑️ Removing: ${pattern}`);

    if (pattern.includes('*')) {
      // Handle glob patterns
      execSync(
        `find . -name "${pattern}" -type f -delete 2>/dev/null || true`,
        { stdio: 'inherit' }
      );
    } else {
      // Handle directory paths
      const fullPath = path.resolve(pattern);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        let sizeBefore = 0;

        if (stats.isDirectory()) {
          try {
            const result = execSync(
              `du -s "${fullPath}" 2>/dev/null || echo "0"`,
              { encoding: 'utf8' }
            );
            sizeBefore = parseInt(result.split('\t')[0]) * 1024; // Convert KB to bytes
          } catch (e) {
            sizeBefore = 0;
          }
        } else {
          sizeBefore = stats.size;
        }

        console.log(`📁 Removing ${pattern} (${formatBytes(sizeBefore)})`);
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Removed ${pattern}`);
      } else {
        console.log(`⏭️ Skipping ${pattern} (doesn't exist)`);
      }
    }
  } catch (error) {
    console.warn(`⚠️ Could not remove ${pattern}:`, error.message);

    // Try with sudo if permission denied
    if (
      error.message.includes('EACCES') ||
      error.message.includes('permission')
    ) {
      try {
        console.log(`🔓 Trying with elevated permissions...`);
        if (pattern.includes('*')) {
          execSync(
            `sudo find . -name "${pattern}" -type f -delete 2>/dev/null || true`,
            { stdio: 'inherit' }
          );
        } else {
          execSync(`sudo rm -rf "${pattern}" 2>/dev/null || true`, {
            stdio: 'inherit',
          });
        }
        console.log(`✅ Removed ${pattern} with sudo`);
      } catch (sudoError) {
        console.warn(`❌ Even sudo failed for ${pattern}:`, sudoError.message);
      }
    }
  }
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get total directory size before cleanup
function getTotalSize() {
  try {
    const result = execSync('du -sh . 2>/dev/null | cut -f1', {
      encoding: 'utf8',
    });
    return result.trim();
  } catch (error) {
    return 'unknown';
  }
}

// Main cleanup function
function aggressiveCleanup() {
  const sizeBefore = getTotalSize();
  console.log(`📊 Directory size before cleanup: ${sizeBefore}`);

  console.log('🚀 Starting aggressive cleanup...');

  // Clean each path
  cleanupPaths.forEach((pattern) => {
    safeRemove(pattern);
  });

  // Additional cleanup for large webpack files
  console.log('🎯 Targeting large webpack cache files...');
  try {
    execSync('find . -name "*.pack" -size +100M -delete 2>/dev/null || true', {
      stdio: 'inherit',
    });
    execSync(
      'find . -path "*/.next/cache/webpack*" -name "*.pack" -delete 2>/dev/null || true',
      { stdio: 'inherit' }
    );
  } catch (error) {
    console.warn('⚠️ Could not remove large pack files:', error.message);
  }

  // Clean any remaining large files
  console.log('🧹 Removing any files larger than 50MB...');
  try {
    execSync(
      'find . -type f -size +50M -not -path "./node_modules/*" -delete 2>/dev/null || true',
      { stdio: 'inherit' }
    );
  } catch (error) {
    console.warn('⚠️ Could not remove large files:', error.message);
  }

  const sizeAfter = getTotalSize();
  console.log(`📊 Directory size after cleanup: ${sizeAfter}`);
  console.log('✅ Aggressive cleanup completed!');
}

// Run cleanup
aggressiveCleanup();

module.exports = { aggressiveCleanup };
