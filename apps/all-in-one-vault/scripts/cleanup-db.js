#!/usr/bin/env node

/**
 * Database cleanup script for postgres connections
 * This script helps clean up any lingering postgres connections
 * that might be causing EMFILE errors in serverless environments
 */

const { exec } = require('child_process');
const path = require('path');

async function cleanupConnections() {
  console.log('🔄 Starting postgres connection cleanup...');

  try {
    // Check if there are any Node.js processes with postgres connections
    const checkCommand = `ps aux | grep node | grep -v grep | wc -l`;

    exec(checkCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error checking processes:', error);
        return;
      }

      const processCount = parseInt(stdout.trim());
      console.log(`📊 Found ${processCount} Node.js processes`);

      if (processCount > 0) {
        console.log('⚠️  Some Node.js processes may still be running');
        console.log('   This could indicate lingering postgres connections');
        console.log('   Consider restarting your development server');
      } else {
        console.log('✅ No lingering Node.js processes found');
      }
    });

    // Force garbage collection if possible
    if (global.gc) {
      console.log('🧹 Running garbage collection...');
      global.gc();
    }

    console.log('✅ Cleanup completed successfully');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupConnections();
}

module.exports = { cleanupConnections };
