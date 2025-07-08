// @ts-check
const withBaseConfig = require('../../next.base.config');

module.exports = withBaseConfig({
  // Add cache optimization
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Override experimental features for this specific app
  experimental: {
    optimizeCss: true,
    // Reduce memory usage during build
    proxyTimeout: 60 * 1000,
  },
  // Custom webpack config for wasabee
  webpack: (config, options) => {
    // Apply base config first
    config = require('../../next.base.config.js')().webpack(config, options);

    // Additional optimizations for wasabee
    if (options.isServer) {
      // Server-side optimizations
      config.externals = config.externals || [];
      config.externals.push({
        'node:crypto': 'crypto',
        'node:stream': 'stream',
        'node:buffer': 'buffer',
      });
    }

    // Optimize for production builds
    if (!options.dev) {
      // Additional production optimizations
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Minimize memory usage
      config.stats = 'errors-warnings';
      config.performance = {
        hints: false, // Disable performance hints to save memory
      };
    }

    return config;
  },
  redirects: async () => [
    {
      source: '/',
      destination: '/swap',
      permanent: false,
    },
  ],
});
