import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  BigInt: { input: any; output: any };
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  _meta?: Maybe<_Meta>;
  receipt?: Maybe<Receipt>;
  receipts: ReceiptPage;
  supportReceipt?: Maybe<SupportReceipt>;
  supportReceipts: SupportReceiptPage;
};

export type QueryReceiptArgs = {
  id: Scalars['BigInt']['input'];
};

export type QueryReceiptsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<ReceiptFilter>;
};

export type QuerySupportReceiptArgs = {
  id: Scalars['String']['input'];
};

export type QuerySupportReceiptsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<SupportReceiptFilter>;
};

export type Receipt = {
  __typename?: 'Receipt';
  claimableAt: Scalars['BigInt']['output'];
  id: Scalars['BigInt']['output'];
  isClaimed: Scalars['Boolean']['output'];
  receiptId: Scalars['BigInt']['output'];
  receiptWeight: Scalars['BigInt']['output'];
  token: Scalars['String']['output'];
  user: Scalars['String']['output'];
};

export type ReceiptFilter = {
  AND?: InputMaybe<Array<InputMaybe<ReceiptFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ReceiptFilter>>>;
  claimableAt?: InputMaybe<Scalars['BigInt']['input']>;
  claimableAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  claimableAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  claimableAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  claimableAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  claimableAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  claimableAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  claimableAt_not_in?: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >;
  id?: InputMaybe<Scalars['BigInt']['input']>;
  id_gt?: InputMaybe<Scalars['BigInt']['input']>;
  id_gte?: InputMaybe<Scalars['BigInt']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  id_lt?: InputMaybe<Scalars['BigInt']['input']>;
  id_lte?: InputMaybe<Scalars['BigInt']['input']>;
  id_not?: InputMaybe<Scalars['BigInt']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  isClaimed?: InputMaybe<Scalars['Boolean']['input']>;
  isClaimed_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  isClaimed_not?: InputMaybe<Scalars['Boolean']['input']>;
  isClaimed_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  receiptId?: InputMaybe<Scalars['BigInt']['input']>;
  receiptId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  receiptId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  receiptId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  receiptId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  receiptId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  receiptId_not?: InputMaybe<Scalars['BigInt']['input']>;
  receiptId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  receiptWeight?: InputMaybe<Scalars['BigInt']['input']>;
  receiptWeight_gt?: InputMaybe<Scalars['BigInt']['input']>;
  receiptWeight_gte?: InputMaybe<Scalars['BigInt']['input']>;
  receiptWeight_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  receiptWeight_lt?: InputMaybe<Scalars['BigInt']['input']>;
  receiptWeight_lte?: InputMaybe<Scalars['BigInt']['input']>;
  receiptWeight_not?: InputMaybe<Scalars['BigInt']['input']>;
  receiptWeight_not_in?: InputMaybe<
    Array<InputMaybe<Scalars['BigInt']['input']>>
  >;
  token?: InputMaybe<Scalars['String']['input']>;
  token_gt?: InputMaybe<Scalars['String']['input']>;
  token_gte?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token_lt?: InputMaybe<Scalars['String']['input']>;
  token_lte?: InputMaybe<Scalars['String']['input']>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ReceiptPage = {
  __typename?: 'ReceiptPage';
  items: Array<Receipt>;
  pageInfo: PageInfo;
};

export type SupportReceipt = {
  __typename?: 'SupportReceipt';
  id: Scalars['String']['output'];
  weight: Scalars['BigInt']['output'];
};

export type SupportReceiptFilter = {
  AND?: InputMaybe<Array<InputMaybe<SupportReceiptFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<SupportReceiptFilter>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  weight?: InputMaybe<Scalars['BigInt']['input']>;
  weight_gt?: InputMaybe<Scalars['BigInt']['input']>;
  weight_gte?: InputMaybe<Scalars['BigInt']['input']>;
  weight_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  weight_lt?: InputMaybe<Scalars['BigInt']['input']>;
  weight_lte?: InputMaybe<Scalars['BigInt']['input']>;
  weight_not?: InputMaybe<Scalars['BigInt']['input']>;
  weight_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type SupportReceiptPage = {
  __typename?: 'SupportReceiptPage';
  items: Array<SupportReceipt>;
  pageInfo: PageInfo;
};

export type _Meta = {
  __typename?: '_meta';
  block?: Maybe<Scalars['Int']['output']>;
};

export type ReceiptsListQueryVariables = Exact<{
  user: Scalars['String']['input'];
}>;

export type ReceiptsListQuery = {
  __typename?: 'Query';
  receipts: {
    __typename?: 'ReceiptPage';
    items: Array<{
      __typename?: 'Receipt';
      claimableAt: any;
      id: any;
      isClaimed: boolean;
      receiptId: any;
      receiptWeight: any;
      token: string;
      user: string;
    }>;
  };
};

export type TokenSupportQueryQueryVariables = Exact<{ [key: string]: never }>;

export type TokenSupportQueryQuery = {
  __typename?: 'Query';
  supportReceipts: {
    __typename?: 'SupportReceiptPage';
    items: Array<{ __typename?: 'SupportReceipt'; id: string; weight: any }>;
  };
};

export const ReceiptsListDocument = gql`
  query ReceiptsList($user: String!) {
    receipts(where: { user: $user }) {
      items {
        claimableAt
        id
        isClaimed
        receiptId
        receiptWeight
        token
        user
      }
    }
  }
`;

/**
 * __useReceiptsListQuery__
 *
 * To run a query within a React component, call `useReceiptsListQuery` and pass it any options that fit your needs.
 * When your component renders, `useReceiptsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReceiptsListQuery({
 *   variables: {
 *      user: // value for 'user'
 *   },
 * });
 */
export function useReceiptsListQuery(
  baseOptions: Apollo.QueryHookOptions<
    ReceiptsListQuery,
    ReceiptsListQueryVariables
  > &
    (
      | { variables: ReceiptsListQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ReceiptsListQuery, ReceiptsListQueryVariables>(
    ReceiptsListDocument,
    options
  );
}
export function useReceiptsListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ReceiptsListQuery,
    ReceiptsListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ReceiptsListQuery, ReceiptsListQueryVariables>(
    ReceiptsListDocument,
    options
  );
}
export function useReceiptsListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ReceiptsListQuery,
        ReceiptsListQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<ReceiptsListQuery, ReceiptsListQueryVariables>(
    ReceiptsListDocument,
    options
  );
}
export type ReceiptsListQueryHookResult = ReturnType<
  typeof useReceiptsListQuery
>;
export type ReceiptsListLazyQueryHookResult = ReturnType<
  typeof useReceiptsListLazyQuery
>;
export type ReceiptsListSuspenseQueryHookResult = ReturnType<
  typeof useReceiptsListSuspenseQuery
>;
export type ReceiptsListQueryResult = Apollo.QueryResult<
  ReceiptsListQuery,
  ReceiptsListQueryVariables
>;
export const TokenSupportQueryDocument = gql`
  query TokenSupportQuery {
    supportReceipts {
      items {
        id
        weight
      }
    }
  }
`;

/**
 * __useTokenSupportQueryQuery__
 *
 * To run a query within a React component, call `useTokenSupportQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useTokenSupportQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTokenSupportQueryQuery({
 *   variables: {
 *   },
 * });
 */
export function useTokenSupportQueryQuery(
  baseOptions?: Apollo.QueryHookOptions<
    TokenSupportQueryQuery,
    TokenSupportQueryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    TokenSupportQueryQuery,
    TokenSupportQueryQueryVariables
  >(TokenSupportQueryDocument, options);
}
export function useTokenSupportQueryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    TokenSupportQueryQuery,
    TokenSupportQueryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    TokenSupportQueryQuery,
    TokenSupportQueryQueryVariables
  >(TokenSupportQueryDocument, options);
}
export function useTokenSupportQuerySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        TokenSupportQueryQuery,
        TokenSupportQueryQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    TokenSupportQueryQuery,
    TokenSupportQueryQueryVariables
  >(TokenSupportQueryDocument, options);
}
export type TokenSupportQueryQueryHookResult = ReturnType<
  typeof useTokenSupportQueryQuery
>;
export type TokenSupportQueryLazyQueryHookResult = ReturnType<
  typeof useTokenSupportQueryLazyQuery
>;
export type TokenSupportQuerySuspenseQueryHookResult = ReturnType<
  typeof useTokenSupportQuerySuspenseQuery
>;
export type TokenSupportQueryQueryResult = Apollo.QueryResult<
  TokenSupportQueryQuery,
  TokenSupportQueryQueryVariables
>;
