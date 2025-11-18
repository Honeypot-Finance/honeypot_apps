// @ts-check
const withBaseConfig = require('../../next.base.config');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

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
  // Exclude large assets from build to save memory
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds to save memory
  },
  typescript: {
    // TypeScript checking done separately, skip during build
    ignoreBuildErrors: false,
  },
    // Custom webpack config for wasabee - adds to base config
  webpack: (config, options) => {
    // Wasabee-specific optimizations (will be merged with base config)
    if (!options.dev) {
      // Add wasabee-specific aliases for faster resolution
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, './'),
        components: path.resolve(__dirname, './components'),
      };

      // Exclude large static assets from being processed by webpack
      config.module.rules.push({
        test: /charting_library.*\.js$/,
        type: 'asset/resource',
        generator: {
          emit: false, // Don't process these files, serve them statically
        },
      });

      // Enable parallel processing for TerserPlugin (enhances base config)
      if (config.optimization?.minimizer) {
        config.optimization.minimizer = config.optimization.minimizer.map(plugin => {
          if (plugin.constructor.name === 'TerserPlugin') {
            return new TerserPlugin({
              ...plugin.options,
              parallel: false, // Disable parallel to save memory (trade speed for memory)
            });
          }
          return plugin;
        });
      }
    }

    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/swap',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/datafeeds/:path*',
        destination: '/static/charting_library/datafeeds/:path*',
      },
    ];
  },
});
