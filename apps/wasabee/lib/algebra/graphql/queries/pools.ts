import { gql } from '@apollo/client';

export const POOL_FRAGMENT = gql`
  fragment PoolFields on Pool {
    id
    fee
    token0 {
      ...TokenFields
    }
    token1 {
      ...TokenFields
    }
    sqrtPrice
    liquidity
    tick
    tickSpacing
    totalValueLockedUSD
    volumeUSD
    feesUSD
    untrackedFeesUSD
    token0Price
    token1Price
    txCount
    createdAtTimestamp
    aprPercentage
  }
`;

export const POOL_HOUR_DATA_FRAGMENT = gql`
  fragment PoolHourDataFields on PoolHourData {
    feesUSD
    id
    tvlUSD
    txCount
    volumeUSD
    periodStartUnix
  }
`;

export const POOL_DAY_DATA_FRAGMENT = gql`
  fragment PoolDayDataFields on PoolDayData {
    feesUSD
    id
    txCount
    volumeUSD
    tvlUSD
    date
  }
`;

export const TICK_FRAGMENT = gql`
  fragment TickFields on Tick {
    tickIdx
    liquidityNet
    liquidityGross
    price0
    price1
    feesUSD
    volumeUSD
  }
`;

export const POOL_FEE_DATA_FRAGMENT = gql`
  fragment PoolFeeDataFields on PoolDayData {
    feesUSD
  }
`;

export const POOL_WEEK_DATA_FRAGMENT = gql`
  fragment PoolWeekDataFields on PoolWeekData {
    feesUSD
    tvlUSD
    volumeUSD
    id
    week
  }
`;

export const POOL_MONTH_DATA_FRAGMENT = gql`
  fragment PoolMonthDataFields on PoolMonthData {
    feesUSD
    tvlUSD
    volumeUSD
    id
    month
  }
`;

export const POOLS_LIST = gql`
  query PoolsList($search: String) {
    pools(
      where: { searchString_contains_nocase: $search, liquidity_gt: 0 }
      orderBy: totalValueLockedUSD
      orderDirection: desc
      first: 100
    ) {
      ...PoolFields
    }
  }
`;

export const ALL_TICKS = gql`
  query allTicks($poolAddress: String!, $skip: Int!) {
    ticks(
      first: 1000
      skip: $skip
      where: { poolAddress: $poolAddress }
      orderBy: tickIdx
    ) {
      ...TickFields
    }
  }
`;

export const SINGLE_POOL = gql`
  query SinglePool($poolId: ID!) {
    pool(id: $poolId) {
      ...PoolFields
    }
  }
`;

export const MULTIPLE_POOLS = gql`
  query MultiplePools($poolIds: [ID!]) {
    pools(where: { id_in: $poolIds }) {
      ...PoolFields
    }
  }
`;

export const POOL_FEE_DATA = gql`
  query PoolFeeData($poolId: String) {
    poolDayDatas(
      where: { pool: $poolId }
      orderBy: date
      orderDirection: desc
    ) {
      ...PoolFeeDataFields
    }
  }
`;

export const POOLS_BY_TOKEN_PAIR = gql`
  query PoolsByTokenPair($token0: ID!, $token1: ID!) {
    pools(where: { token0_: { id: $token0 }, token1_: { id: $token1 } }) {
      ...PoolFields
    }
  }
`;

export const LIQUIDATOR_DATA = gql`
  query LiquidatorData($account: String!) {
    liquidatorDatas(where: { account: $account }) {
      ...LiquidatorDataFields
    }
  }
`;

export const LIQUIDATOR_DATA_FIELDS = gql`
  fragment LiquidatorDataFields on LiquidatorData {
    id
    totalLiquidityUsd
    pool {
      ...PoolFields
    }
  }
`;

export const USER_POSITIONS = gql`
  query UserPositions($account: Bytes!) {
    positions(where: { owner: $account }) {
      ...PositionFields
    }
  }
`;

export const USER_ACTIVE_POSITIONS = gql`
  query UserActivePositions($account: Bytes!) {
    positions(where: { owner: $account, liquidity_gt: 0 }) {
      ...PositionFields
    }
  }
`;

export const TOP_POOL_POSITIONS = gql`
  query TopPoolPositions(
    $poolId: String!
    $orderBy: Position_orderBy
    $orderDirection: OrderDirection
    $first: Int
    $skip: Int
  ) {
    positions(
      where: { pool: $poolId, liquidity_gt: 0 }
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
      skip: $skip
    ) {
      ...PositionFields
    }
  }
`;

export const POSITION_FRAGMENT = gql`
  fragment PositionFields on Position {
    id
    owner
    pool {
      ...PoolFields
    }
    token0 {
      ...TokenFields
    }
    token1 {
      ...TokenFields
    }
    liquidity
    depositedToken0
    depositedToken1
    withdrawnToken0
    withdrawnToken1
    tickLower {
      ...TickFields
    }
    tickUpper {
      ...TickFields
    }
  }
`;
