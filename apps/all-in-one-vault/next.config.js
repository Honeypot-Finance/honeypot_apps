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
  ],
  // Add webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Fix module resolution issues
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        // Fix viem import issues
        'viem/index.js': require.resolve('viem'),
        viem: require.resolve('viem'),
      },
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
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
      ],
    };

    return config;
  },
  // Add experimental features
  experimental: {
    // Handle external packages for server components
    serverComponentsExternalPackages: [
      '@particle-network/universal-account-sdk',
      'viem',
      'wagmi',
    ],
    // Improve module resolution
    esmExternals: 'loose',
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
