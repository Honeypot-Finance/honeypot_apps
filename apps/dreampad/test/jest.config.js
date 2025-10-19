const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  displayName: 'Dreampad Tests',   
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  // Add test timeout and retry configuration
  testTimeout: 10000,
  maxWorkers: 1, // Run tests serially to avoid race conditions

  testMatch: ['<rootDir>/pages/**/*.test.{ts,tsx}'],

  collectCoverageFrom: [
    '../**/*.{ts,tsx}',
    '!../**/*.d.ts',
    '!../**/pages/_app.tsx',
    '!../**/pages/_document.tsx',
    '!../**/next.config.js',
    '!../**/*.config.{js,ts}',
    '!../**/public/**',
    '!../**/.next/**',
    '!../**/node_modules/**',
    '!../test/**/*.{ts,tsx}',
  ],
  coverageDirectory: '../../../coverage/apps/dreampad',
  coverageReporters: ['text', 'lcov', 'html'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../$1',
    '^@/components/CardContianer/(.*)$': '<rootDir>/../components/CardContianer/$1',
    '^@honeypot/shared$': '<rootDir>/../../../libs/shared/hpot-sdk/src/index.ts',
    '^@honeypot/shared/(.*)$': '<rootDir>/../../../libs/shared/hpot-sdk/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },

  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }], // <-- same as vault
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
 
};
