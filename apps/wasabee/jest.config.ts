import type { Config } from 'jest';

const config: Config = {
  displayName: 'wasabee',
  preset: './jest.preset.js',
  testEnvironment: 'jsdom',
  rootDir: '../../',
  setupFilesAfterEnv: ['<rootDir>/apps/wasabee/src/test-setup.ts'],
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '<rootDir>/coverage/apps/wasabee',
  testMatch: [
    '<rootDir>/test/apps/wasabee/**/*.test.{ts,tsx}',
    '<rootDir>/apps/wasabee/**/*.{test,spec}.{ts,tsx}'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/wasabee/$1',
    '^@honeypot/(.*)$': '<rootDir>/libs/$1/src',
  },
  collectCoverageFrom: [
    'apps/wasabee/components/**/*.{ts,tsx}',
    'apps/wasabee/pages/**/*.{ts,tsx}',
    'apps/wasabee/lib/**/*.{ts,tsx}',
    'apps/wasabee/hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/apps/wasabee/.next/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@babel|@testing-library))',
  ],
};

export default config;