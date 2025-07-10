// @ts-check
const withBaseConfig = require('../../next.base.config');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = withBaseConfig({
  // VERCEL DEPLOYMENT OPTIMIZATION - Disable webpack cache to prevent OOM
  experimental: {
    // Disable webpack cache completely to avoid 1GB+ cache files during build
    webpackBuildWorker: false,
    optimizeCss: true,
    // Keep other optimizations
    instrumentationHook: true,
  },

  // Override webpack config for memory optimization
  webpack: (config, options) => {
    // CRITICAL: Apply base webpack config first (includes cache disabling)
    const baseConfig = require('../../next.base.config.js')();
    if (baseConfig.webpack) {
      config = baseConfig.webpack(config, options);
    }

    // Additional optimizations for pot2pump
    if (!options.dev) {
      // ENSURE webpack cache is disabled (base config should handle this)
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
        // Reduce module concatenation for faster builds
        concatenateModules: false,
      };

      // Minimize memory usage
      config.stats = 'errors-warnings';
      config.performance = {
        hints: false, // Disable performance hints to save memory
      };
    }

    return config;
  },
});
