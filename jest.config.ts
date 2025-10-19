import { getJestProjectsAsync } from '@nx/jest';

// export default async () => ({
//   projects: await getJestProjectsAsync(),
// });

export default async () => ({
  projects: await getJestProjectsAsync(),
  collectCoverageFrom: [
    'apps/**/components/**/*.{ts,tsx}',
    'apps/**/pages/**/*.{ts,tsx}',
    'apps/**/lib/**/*.{ts,tsx}',
    'apps/**/hooks/**/*.{ts,tsx}',
    'apps/**/services/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/test/**/*.test.{ts,tsx}',
    '<rootDir>/apps/**/src/**/*.{test,spec}.{ts,tsx}'
  ],
});
