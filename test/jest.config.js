module.exports = {
  displayName: 'Shared Unit Tests',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/minimal-setup.ts'],
  testMatch: [
    '<rootDir>/**/*.test.{ts,tsx}',
  ],
  collectCoverageFrom: [
    '../apps/**/*.{ts,tsx}',
    '../libs/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/pages/_app.tsx',
    '!**/pages/_document.tsx',
    '!**/next.config.js',
    '!**/*.config.{js,ts}',
    '!**/public/**',
    '!**/.next/**',
    '!**/node_modules/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // moduleNameMapper: {
  //   '^@/(.*)$': '<rootDir>/../apps/wasabee/$1',
  //   '^@honeypot/shared/(.*)$': '<rootDir>/../libs/shared/hpot-sdk/src/$1',
  //   '^@honeypot/(.*)$': '<rootDir>/../libs/$1',
  // },


  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../apps/dreampad/$1',
  
    '^@pot2pump/(.*)$': '<rootDir>/../apps/pot2pump/$1',
  
    '^@honeypot/shared$': '<rootDir>/../libs/shared/hpot-sdk/src/index.ts',
    '^@honeypot/shared/(.*)$': '<rootDir>/../libs/shared/hpot-sdk/src/$1',
    '^@honeypot/shared/lib/(.*)$': '<rootDir>/../libs/shared/hpot-sdk/src/lib/$1',
    '^@honeypot/shared/server/callers$': '<rootDir>/../libs/shared/hpot-sdk/src/server/callers/index.ts',
  
    '^@honeypot-frontend/universal-account$': '<rootDir>/../libs/shared/universal-account/src/index.ts',
  
    // mock static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/apps/pot2pump/__mocks__/fileMock.js',
  },
  
  

  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testTimeout: 10000,
  verbose: true,
  preset: 'ts-jest',
};