module.exports = {
  displayName: 'wasabee-tests',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: [
    '<rootDir>/jest.polyfills.ts',
    '<rootDir>/test-setup.tsx',
  ],
  // Add test timeout and retry configuration
  testTimeout: 10000,
  maxWorkers: 1, // Run tests serially to avoid race conditions
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(superjson|uuid|@solana/web3.js|@coral-xyz/anchor|@particle-network/universal-account-sdk|jayson|@rainbow-me/rainbowkit|wagmi|@wagmi/core|@wagmi/connectors|@gemini-wallet/core|viem|cuer|qr))', // <-- make babel-jest transpile these ES modules
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/apps/wasabee',
  

  collectCoverageFrom: [
    '../**/*.{ts,tsx}',
    '!../**/*.d.ts',
    '!../**/*.stories.{ts,tsx}',
    '!../**/index.{ts,tsx}',
    '!../test/**/*.{ts,tsx}',
  ],

  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  moduleNameMapper: {
    '^@wasabee/(.*)$': '<rootDir>/../../../apps/wasabee/$1',
    '^@/(.*)$': '<rootDir>/../../../apps/wasabee/$1',
    '^@honeypot/shared$': '<rootDir>/../../../libs/shared/hpot-sdk/src/index.ts',
    '^@honeypot/shared/(.*)$': '<rootDir>/../../../libs/shared/hpot-sdk/src/$1',
    '^@honeypot/shared/lib/(.*)$': '<rootDir>/../../../libs/shared/hpot-sdk/src/lib/$1',
    '^@honeypot/shared/server/callers$': '<rootDir>/../../../libs/shared/hpot-sdk/src/server/callers/index.ts',
    '^@honeypot-frontend/universal-account$': '<rootDir>/../../../libs/shared/universal-account/src/index.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
  },
  testMatch: [
    '<rootDir>/**/*.test.{ts,tsx}',
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../../../tsconfig.spec.json',
    },
  },
};