//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const path = require('path');
// Try to load TerserPlugin, fallback if not available
let TerserPlugin;
try {
  TerserPlugin = require('terser-webpack-plugin');
} catch (e) {
  console.log('TerserPlugin not available, using default minification');
}

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Add image optimization
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },
  // Add transpiled packages to fix module resolution
  transpilePackages: [
    '@particle-network/universal-account-sdk',
    'viem',
    'wagmi',
    '@rainbow-me/rainbowkit',
    '@nextui-org/react',
    '@nextui-org/system',
    '@nextui-org/theme',
    '@apollo/client',
    '@tanstack/react-query',
    '@tanstack/query-sync-storage-persister',
    '@wagmi/core',
    '@wagmi/connectors',
    '@ethersproject/providers',
    '@ethersproject/contracts',
    '@safe-global/safe-apps-sdk',
    '@safe-global/safe-apps-provider',
    'zustand',
  ],
  // Add webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Ignore optional dependencies that cause warnings
    config.ignoreWarnings = [
      { module: /node_modules\/pino\/lib\/tools\.js/ },
      /Can't resolve 'pino-pretty'/,
    ];

    // Fix module resolution issues
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        'pino-pretty': false, // Ignore pino-pretty as it's optional
      },

      extensionAlias: {
        '.js': ['.ts', '.tsx', '.js', '.jsx'],
        '.mjs': ['.mts', '.mjs'],
      },
    };

    // Add production optimizations
    if (!dev && !isServer) {
      const optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            web3: {
              test: /[\\/]node_modules[\\/](@rainbow-me|wagmi|viem|@particle-network)[\\/]/,
              name: 'web3',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };

      // Add TerserPlugin if available
      if (TerserPlugin) {
        optimization.minimizer = [
          new TerserPlugin({
            parallel: true,
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
              },
            },
          }),
        ];
      }

      config.optimization = optimization;
    }

    // Add parser options to handle import.meta in CJS files
    config.module.parser = {
      ...config.module.parser,
      javascript: {
        ...config.module.parser?.javascript,
        importMeta: false,
      },
    };

    // Add DefinePlugin to define import.meta for problematic modules
    const webpack = require('webpack');
    config.plugins = [
      ...config.plugins,
      new webpack.DefinePlugin({
        'import.meta.hot': 'undefined',
        'import.meta.webpackHot': 'undefined',
        'import.meta.env': '{}',
      }),
    ];

    // Add module resolution for problematic packages
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
        {
          test: /node_modules\/viem\/_cjs\/.*\.js$/,
          type: 'javascript/auto',
          parser: {
            importMeta: false,
          },
        },
        {
          test: /node_modules\/@safe-global\/safe-apps-sdk\/dist\/cjs\/.*\.js$/,
          type: 'javascript/auto',
          parser: {
            importMeta: false,
          },
        },
        {
          test: /node_modules\/zustand\/.*\.(js|mjs)$/,
          type: 'javascript/auto',
          parser: {
            importMeta: false,
          },
        },

        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: [
            /node_modules\/viem/,
            /node_modules\/wagmi/,
            /node_modules\/@wagmi/,
            /node_modules\/@rainbow-me/,
          ],
          exclude: [
            /node_modules\/viem\/_cjs/,
            /node_modules\/@safe-global\/safe-apps-sdk.*\/dist\/cjs/,
          ],
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
                '@babel/preset-typescript',
              ],
            },
          },
        },
      ],
    };

    return config;
  },
  // Add experimental features
  experimental: {
    // Improve module resolution
    esmExternals: false,
    // Better support for ESM packages
    externalDir: true,
  },
  // Compiler optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
  swcMinify: true,
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
