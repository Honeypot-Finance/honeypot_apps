import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema:
    'https://api.ghostlogs.xyz/gg/pub/10550f11-33a0-421c-b25d-6aff7cceca11',
  documents: 'lib/algebra/graphql/queries/!(*.d).{ts,tsx}',
  ignoreNoDocuments: true,
  generates: {
    'lib/algebra/graphql/__generated__/graphql.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withResultType: true,
        addQuery: true,
        addInfiniteQuery: true,
        addPagination: true,
        addInlineFragment: true,
      },
    },
  },
};

export default config;
