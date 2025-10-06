module.exports = {
  displayName: 'all-in-one-vault-tests',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: [
    '<rootDir>/jest.polyfills.ts',
    '<rootDir>/test-setup.tsx'
  ],
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(superjson|uuid|@solana/web3.js|@coral-xyz/anchor|@particle-network/universal-account-sdk|jayson|@rainbow-me/rainbowkit|wagmi|viem|cuer))', // <-- make babel-jest transpile these ES modules
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/apps/all-in-one-vault',
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
    '^@all-in-one-vault/test-exports$': '<rootDir>/../test-exports.ts',
    '^@all-in-one-vault/(.*)$': '<rootDir>/../$1',
    '^@/(.*)$': '<rootDir>/../$1',
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