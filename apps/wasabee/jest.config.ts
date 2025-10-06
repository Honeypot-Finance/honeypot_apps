import type { Config } from 'jest';

const config: Config = {
  displayName: 'wasabee',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/../../test/apps/wasabee/setup.ts'],
  testMatch: ['<rootDir>/../../test/apps/wasabee/**/*.test.{ts,tsx}'],
  roots: ['<rootDir>/../../test/apps/wasabee'],
  collectCoverageFrom: [
    '<rootDir>/**/*.{ts,tsx}',
    '!<rootDir>/**/*.d.ts',
    '!<rootDir>/pages/_app.tsx',
    '!<rootDir>/pages/_document.tsx',
    '!<rootDir>/next.config.js',
    '!<rootDir>/**/*.config.{js,ts}',
    '!<rootDir>/public/**',
    '!<rootDir>/.next/**',
  ],
  coverageDirectory: '<rootDir>/../../coverage/wasabee',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@wasabee/(.*)$': '<rootDir>/$1',
    '^@honeypot/shared/(.*)$': '<rootDir>/../../libs/shared/hpot-sdk/src/$1',
    '^@honeypot/shared$': '<rootDir>/../../libs/shared/hpot-sdk/src/index.ts',
    // Mock CSS and image imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/../../test/apps/wasabee/__mocks__/fileMock.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: ['node_modules/(?!(superjson|@trpc|viem|@rainbow-me|clipboard-polyfill|wagmi|@wagmi)/)'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        useESM: false,
      },
    ],
  },
};

export default config;