//@ts-check

const { composePlugins, withNx } = require('@nx/next');
const { withSentryConfig } = require('@sentry/nextjs');
const path = require('path');
const isProd = process.env.NODE_ENV === 'production';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  // enabled: !isProd,
  enabled: false,
});

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const baseConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  reactStrictMode: true,
  output: 'standalone',
  productionBrowserSourceMaps: false, // Disable source maps in production to save space
  experimental: {
    optimizeCss: true,
  },
  // Add webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Memory and cache optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      '@honeypot/shared': path.resolve(__dirname, 'libs/shared/hpot-sdk/src'),
    };
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'), // 👈 prioritize root
      'node_modules', // fallback to local
    ];

    // Production optimizations
    if (isProd) {
      // Limit cache size in production
      config.cache = {
        type: 'filesystem',
        maxMemoryGenerations: 1,
        cacheDirectory: path.resolve(__dirname, '.next/cache'),
        buildDependencies: {
          config: [__filename],
        },
      };

      // Memory optimization
      config.optimization = {
        ...config.optimization,
        // Split chunks to reduce memory usage
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
              maxSize: 244000, // 244KB max chunk size
            },
            // Separate large libraries
            charts: {
              test: /[\\/]node_modules[\\/](lightweight-charts|apexcharts|recharts|echarts)[\\/]/,
              name: 'charts',
              chunks: 'all',
              priority: 10,
            },
            web3: {
              test: /[\\/]node_modules[\\/](@rainbow-me|wagmi|viem|ethers)[\\/]/,
              name: 'web3',
              chunks: 'all',
              priority: 10,
            },
          },
        },
        // Minimize memory usage
        moduleIds: 'deterministic',
        mangleExports: 'deterministic',
      };

      // Minimize bundle size
      config.module.rules.push({
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['next/babel'],
            plugins: [
              ['transform-remove-console', { exclude: ['error', 'warn'] }],
            ],
          },
        },
      });
    }

    // Development optimizations
    if (dev) {
      config.cache = {
        type: 'filesystem',
        maxMemoryGenerations: 1,
      };
    }

    return config;
  },
  // Optimize images
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
  async headers() {
    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://wasabee.honeypotfinance.xyz',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        // Apply security headers to all routes to prevent clickjacking, but allow Safe
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://app.safe.global https://safe.global;",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, content-type, Authorization',
          },
        ],
      },
    ];
  },
  // Optimize transpilation
  transpilePackages: isProd
    ? [
        '@nextui-org/react',
        '@nextui-org/system',
        '@nextui-org/theme',
        '@nextui-org/accordion',
        '@nextui-org/alert',
        '@nextui-org/autocomplete',
        '@nextui-org/badge',
        '@nextui-org/breadcrumbs',
        '@nextui-org/framer-transitions',
        '@radix-ui/react-avatar',
        '@radix-ui/react-dialog',
        '@radix-ui/react-hover-card',
        '@radix-ui/react-popover',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-separator',
        '@radix-ui/react-slider',
        '@radix-ui/react-slot',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-toast',
        '@rainbow-me/rainbowkit',
        '@heroicons/react',
        'lucide-react',
        'vaul',
        'viem',
        'wagmi',
        '@honeypot-frontend/hpot-sdk',
        '@honeypot/shared',
      ]
    : [],
  // Add compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },
  // Add SWC optimizations
  swcMinify: true,
  // Add build optimizations
  generateBuildId: async () => {
    // Use a shorter build ID to reduce cache size
    return 'build-' + Date.now().toString(36);
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withBundleAnalyzer,
  withNx,
];

const sentryConfig = {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'hongming-wang',
  project: 'hpot',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Disable source maps upload in production to save space and time
  widenClientFileUpload: false,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
  /**
   * Automatically instrument Next.js data fetching methods and Next.js API routes with error and performance monitoring.
   * Defaults to `true`.
   */
  autoInstrumentServerFunctions: false,
  /**
   * Automatically instrument Next.js middleware with error and performance monitoring. Defaults to `true`.
   */
  autoInstrumentMiddleware: false,
  /**
   * Automatically instrument components in the `app` directory with error monitoring. Defaults to `true`.
   */
  autoInstrumentAppDirectory: false,
  // Disable debug logging in production
  debug: false,
};

module.exports = (customConfig = {}) =>
  withSentryConfig(
    composePlugins(...plugins)({ ...baseConfig, ...customConfig }),
    sentryConfig
  );
