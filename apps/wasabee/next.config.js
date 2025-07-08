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
  // Custom webpack config for wasabee
  webpack: (config, options) => {
    // Apply base webpack config first
    const baseConfig = require('../../next.base.config.js')();
    if (baseConfig.webpack) {
      config = baseConfig.webpack(config, options);
    }

    // Additional optimizations for wasabee
    if (!options.dev) {
      // DISABLE webpack cache completely in production to prevent OOM
      config.cache = false;

      // Add webpack optimizations to speed up build despite no caching
      config.resolve = {
        ...config.resolve,
        // Reduce module resolution time
        modules: ['node_modules'],
        // Prioritize extensions
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        // Use aliases to speed up resolution
        alias: {
          ...config.resolve.alias,
          // Add common aliases to speed up resolution
          '@': path.resolve(__dirname, './'),
          components: path.resolve(__dirname, './components'),
        },
      };

      // Optimize chunks for faster builds
      config.optimization = {
        ...config.optimization,
        minimize: true,
        // Faster minification
        minimizer: [
          new TerserPlugin({
            parallel: true,
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
              },
            },
          }),
        ],
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000, // Larger chunks for fewer files
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Group large libraries
            charts: {
              test: /[\\/]node_modules[\\/](lightweight-charts|apexcharts|recharts|echarts)[\\/]/,
              name: 'charts',
              chunks: 'all',
              priority: 20,
            },
            web3: {
              test: /[\\/]node_modules[\\/](@rainbow-me|wagmi|viem|ethers|@web3modal)[\\/]/,
              name: 'web3',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };

      // Reduce module concatenation for faster builds
      config.optimization.concatenateModules = false;

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
