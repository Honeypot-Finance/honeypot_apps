import type { CodegenConfig } from '@graphql-codegen/cli';
import { QueryClient } from '@tanstack/react-query';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-core/2.4.0/gn',

    'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-algebra-farming/2.0.0/gn',
    'https://api.goldsky.com/api/public/project_cm78242tjtmme01uvcbkaay27/subgraphs/hpot-bgt-market/bgt-market/gn',
  ],
  documents: 'lib/algebra/graphql/queries/!(*.d).{ts,tsx}',
  generates: {
    'lib/algebra/graphql/generated/graphql.tsx': {
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
