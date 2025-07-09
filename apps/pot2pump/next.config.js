// @ts-check
const withBaseConfig = require('../../next.base.config');

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
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // CRITICAL: Disable webpack cache to prevent OOM on Vercel
    config.cache = false;

    // Memory optimization settings
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 150000, // 150KB max chunks
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            maxSize: 150000,
          },
          // Split large libraries
          charts: {
            test: /[\\/]node_modules[\\/](recharts|apexcharts|lightweight-charts)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 20,
            maxSize: 150000,
          },
          web3: {
            test: /[\\/]node_modules[\\/](ethers|wagmi|viem|@wagmi|@rainbow-me)[\\/]/,
            name: 'web3',
            chunks: 'all',
            priority: 20,
            maxSize: 150000,
          },
        },
      },
      // Disable module concatenation for better memory usage
      concatenateModules: false,
    };

    // Enhanced performance settings
    config.resolve.symlinks = false;
    config.resolve.cacheWithContext = false;

    // Faster module resolution
    config.resolve.modules = ['node_modules'];
    config.resolve.alias = {
      ...config.resolve.alias,
      react: require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    };

    // Optimize terser for parallel processing
    if (!dev && !isServer) {
      const TerserPlugin = require('terser-webpack-plugin');
      config.optimization.minimizer = [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ];
    }

    return config;
  },
});
