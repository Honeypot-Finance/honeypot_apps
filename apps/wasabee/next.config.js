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
    // Apply base webpack config first
    const baseConfig = require('../../next.base.config.js')();
    if (baseConfig.webpack) {
      config = baseConfig.webpack(config, options);
    }

    // Additional optimizations for wasabee
    if (!options.dev) {
      // Use limited filesystem cache with memory constraints instead of disabling completely
      config.cache = {
        type: 'filesystem',
        maxMemoryGenerations: 1,
        maxAge: 1000 * 60 * 60 * 2, // 2 hours
        compression: 'gzip',
      };

      // Optimize chunks
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };

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
