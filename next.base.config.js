//@ts-check

const { composePlugins, withNx } = require('@nx/next');
const { withSentryConfig } = require('@sentry/nextjs');
const TerserPlugin = require('terser-webpack-plugin');
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
    // CSS optimization
    optimizeCss: true,
    // Optimize large package imports for better tree shaking
    optimizePackageImports: [
      '@nextui-org/react',
      '@nextui-org/system',
      '@nextui-org/theme',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-scroll-area',
      '@rainbow-me/rainbowkit',
      'framer-motion',
      'lucide-react',
    ],
    // Enable turbo for faster builds
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
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

    // PRODUCTION OPTIMIZATIONS - DISABLE CACHE TO PREVENT OOM
    if (isProd) {
      // COMPLETELY DISABLE webpack cache in production to prevent OOM
      // The cache files are created DURING build and cause memory issues
      config.cache = false;

      // Enhanced webpack optimization
      config.optimization = {
        ...config.optimization,
        // Enable module concatenation for better performance
        concatenateModules: true,
        // Use deterministic module IDs
        moduleIds: 'deterministic',
        mangleExports: 'deterministic',
        // More aggressive chunk splitting
        splitChunks: {
          chunks: 'all',
          minSize: 10000, // Reduced from 20000
          maxSize: 150000, // Reduced from 244000
          minChunks: 2,
          enforceSizeThreshold: 50000,
          cacheGroups: {
            default: false,
            vendors: false,
            // Framework chunk
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|next|@next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Next.js UI components
            nextui: {
              name: 'nextui',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@nextui-org[\\/]/,
              priority: 35,
              enforce: true,
            },
            // Radix UI components
            radix: {
              name: 'radix',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              priority: 34,
              enforce: true,
            },
            // Chart libraries
            charts: {
              name: 'charts',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](lightweight-charts|apexcharts|recharts|echarts)[\\/]/,
              priority: 33,
              enforce: true,
            },
            // Web3 libraries
            web3: {
              name: 'web3',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@rainbow-me|wagmi|viem|ethers|@web3modal)[\\/]/,
              priority: 32,
              enforce: true,
            },
            // Utils and small modules
            utils: {
              name: 'utils',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](lodash|date-fns|dayjs|clsx)[\\/]/,
              minSize: 5000,
              priority: 30,
              reuseExistingChunk: true,
            },
            // Shared modules between pages
            commons: {
              name: 'commons',
              minChunks: 3,
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Default vendor chunk
            vendor: {
              /**
               * @param {any} module
               */
              name: (module) => {
                if (!module.context) return 'vendor';
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                const packageName = match?.[1] || 'vendor';
                return `vendor.${packageName.replace('@', '')}`;
              },
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              priority: 15,
              reuseExistingChunk: true,
            },
          },
        },
        // Enhanced Terser configuration
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
                passes: 2,
              },
              mangle: true,
              format: {
                comments: false,
              },
            },
            extractComments: false,
          }),
        ],
        // Reduce memory pressure
        usedExports: true,
        sideEffects: false,
      };

      // More aggressive performance settings
      config.performance = {
        hints: false, // Disable performance hints
        maxAssetSize: 250000, // 250KB
        maxEntrypointSize: 250000, // 250KB
      };

      // Reduce parallelism to save memory
      config.parallelism = 1;

      // Limit stats output to save memory
      config.stats = 'errors-warnings';
    }

    // Development optimizations - minimal caching
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
        // Cache static assets (images, fonts) for 30 days
        source: '/(.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|otf))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, immutable',
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

  // Disable all Sentry features during build to save memory
  automaticVercelMonitors: false,
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
  // Disable telemetry to save memory
  telemetry: false,
  // Skip source map upload to save memory and time
  skipSourceMapUpload: true,
};

module.exports = (customConfig = {}) =>
  withSentryConfig(
    composePlugins(...plugins)({ ...baseConfig, ...customConfig }),
    sentryConfig
  );
