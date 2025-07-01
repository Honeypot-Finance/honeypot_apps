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
  productionBrowserSourceMaps: true,
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@honeypot/shared': path.resolve(__dirname, 'libs/shared/hpot-sdk/src'),
    };
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'), // 👈 prioritize root
      'node_modules', // fallback to local
    ];

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
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
        // Apply security headers to all routes to prevent clickjacking
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'",
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
    ];
  },
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

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

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
};

module.exports = (customConfig = {}) =>
  withSentryConfig(
    composePlugins(...plugins)({ ...baseConfig, ...customConfig }),
    sentryConfig
  );
