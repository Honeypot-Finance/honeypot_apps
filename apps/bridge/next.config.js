// @ts-check
const withBaseConfig = require('../../next.base.config');
const path = require('path');

module.exports = withBaseConfig({
  experimental: {
    optimizeCss: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, options) => {
    if (!options.dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, './'),
        components: path.resolve(__dirname, './components'),
      };
    }
    return config;
  },
  async redirects() {
    return [];
  },
});
