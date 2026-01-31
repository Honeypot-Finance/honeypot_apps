import type { CodegenConfig } from '@graphql-codegen/cli';
import { subgraphAddresses } from './src/config/subgraphEndPoint';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    ...Object.values(subgraphAddresses)
      .flatMap((subgraph) => [
        subgraph.algebra_info,
        subgraph.algebra_farming,
        subgraph.bgt_market,
        subgraph.lbp,
        subgraph.wasabee_ido,
      ])
      .filter(Boolean),
  ],
  documents: 'src/lib/graphql/queries/!(*.d).{ts,tsx}',
  generates: {
    'src/lib/graphql/generated/graphql.tsx': {
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
