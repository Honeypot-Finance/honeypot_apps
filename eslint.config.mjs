import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?js$',
            // Allow dynamic imports for lazy-loaded libraries
            '@honeypot/shared',
            'hpot-sdk',

            '@all-in-one-vault/*', // 👈 add here globally
          ],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },

  {
    // Disable module boundaries for wasabee app since it uses shared library extensively
    files: ['apps/wasabee/**/*.tsx', 'apps/wasabee/**/*.ts'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },

  // just for testing added by shahzaib
  {
    files: [
      'apps/pot2pump/**/*.tsx', 
      'apps/pot2pump/**/*.ts',
    'test/**/*.ts',
      'test/**/*.tsx',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: [
            // ✅ allow test imports
            '../../../../../apps/pot2pump/pages/launch-token',
            '../../../../../apps/pot2pump/services/launchpad',
            // add more as needed
          ],
        },
      ],
    },
  },
  {
    files: ['apps/all-in-one-vault/**/*.tsx', 'apps/all-in-one-vault/**/*.ts'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: ['@all-in-one-vault/*'],
        },
      ],
    },
  },

  {
    files: ['apps/dreampad/**/*.tsx', 'apps/dreampad/**/*.ts'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: ['@dreampad/*'],
        },
      ],
    },
  },

  // Allow test files to import from any app using relative paths
  {
    files: [
      'test/**/*.ts',
      'test/**/*.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: [
            // Allow specific relative import for leaderboard test
            '../../../../../apps/all-in-one-vault/pages/leaderboard',
            '../../../../../apps/all-in-one-vault/hooks',

            '../../../../../apps/dreampad/pages/leaderboard',

            // Allow other common test patterns
            '../../../../../apps/*/pages/**',
            '../../../../../apps/*/components/**',
            '../../../../../apps/*/lib/**',
            '../../../../../libs/**',
            // Allow scoped imports
            '@all-in-one-vault/*',
            '@wasabee/*',
            '@pot2pump/*',
            '@dreampad/*',
          ],
        },
      ],
    },
  },

  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
