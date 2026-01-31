import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  /** 8 bytes signed integer */
  Int8: { input: any; output: any; }
  /** A string representation of microseconds UNIX timestamp (16 digits) */
  Timestamp: { input: any; output: any; }
};

export type Account = {
  __typename?: 'Account';
  bitgetCampaignParticipants: Array<BitgetCampaignParticipant>;
  holdingPoolCount: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  platformTxCount: Scalars['BigInt']['output'];
  swapCount: Scalars['BigInt']['output'];
  totalSpendUSD: Scalars['BigDecimal']['output'];
  vaultShares?: Maybe<Array<VaultShare>>;
};


export type AccountBitgetCampaignParticipantsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BitgetCampaignParticipant_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<BitgetCampaignParticipant_Filter>;
};


export type AccountVaultSharesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultShare_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultShare_Filter>;
};

export type Account_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Account_Filter>>>;
  bitgetCampaignParticipants_?: InputMaybe<BitgetCampaignParticipant_Filter>;
  holdingPoolCount?: InputMaybe<Scalars['BigInt']['input']>;
  holdingPoolCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  holdingPoolCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  holdingPoolCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  holdingPoolCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  holdingPoolCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  holdingPoolCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  holdingPoolCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Account_Filter>>>;
  platformTxCount?: InputMaybe<Scalars['BigInt']['input']>;
  platformTxCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  platformTxCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  platformTxCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  platformTxCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  platformTxCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  platformTxCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  platformTxCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  swapCount?: InputMaybe<Scalars['BigInt']['input']>;
  swapCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  swapCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  swapCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  swapCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  swapCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  swapCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  swapCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSpendUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalSpendUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalSpendUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalSpendUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalSpendUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalSpendUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalSpendUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalSpendUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  vaultShares_?: InputMaybe<VaultShare_Filter>;
};

export enum Account_OrderBy {
  BitgetCampaignParticipants = 'bitgetCampaignParticipants',
  HoldingPoolCount = 'holdingPoolCount',
  Id = 'id',
  PlatformTxCount = 'platformTxCount',
  SwapCount = 'swapCount',
  TotalSpendUsd = 'totalSpendUSD',
  VaultShares = 'vaultShares'
}

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour'
}

export type BitgetCampaign = {
  __typename?: 'BitgetCampaign';
  eventPools: Array<BitgetCampaignEventPool>;
  id: Scalars['ID']['output'];
  participants: Array<BitgetCampaignParticipant>;
  totalFinishedUserCount: Scalars['BigInt']['output'];
  totalVolumeUSD: Scalars['BigDecimal']['output'];
};


export type BitgetCampaignEventPoolsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BitgetCampaignEventPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<BitgetCampaignEventPool_Filter>;
};


export type BitgetCampaignParticipantsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BitgetCampaignParticipant_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<BitgetCampaignParticipant_Filter>;
};

export type BitgetCampaignEventPool = {
  __typename?: 'BitgetCampaignEventPool';
  campaign: BitgetCampaign;
  finishedUsers: Array<BitgetCampaignParticipant>;
  id: Scalars['ID']['output'];
  pool: Pool;
  totalFinishedUserCount: Scalars['BigInt']['output'];
  totalVolumeUSD: Scalars['BigDecimal']['output'];
};


export type BitgetCampaignEventPoolFinishedUsersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BitgetCampaignParticipant_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<BitgetCampaignParticipant_Filter>;
};

export type BitgetCampaignEventPool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<BitgetCampaignEventPool_Filter>>>;
  campaign?: InputMaybe<Scalars['String']['input']>;
  campaign_?: InputMaybe<BitgetCampaign_Filter>;
  campaign_contains?: InputMaybe<Scalars['String']['input']>;
  campaign_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  campaign_ends_with?: InputMaybe<Scalars['String']['input']>;
  campaign_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  campaign_gt?: InputMaybe<Scalars['String']['input']>;
  campaign_gte?: InputMaybe<Scalars['String']['input']>;
  campaign_in?: InputMaybe<Array<Scalars['String']['input']>>;
  campaign_lt?: InputMaybe<Scalars['String']['input']>;
  campaign_lte?: InputMaybe<Scalars['String']['input']>;
  campaign_not?: InputMaybe<Scalars['String']['input']>;
  campaign_not_contains?: InputMaybe<Scalars['String']['input']>;
  campaign_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  campaign_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  campaign_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  campaign_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  campaign_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  campaign_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  campaign_starts_with?: InputMaybe<Scalars['String']['input']>;
  campaign_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  finishedUsers_?: InputMaybe<BitgetCampaignParticipant_Filter>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<BitgetCampaignEventPool_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalFinishedUserCount?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalFinishedUserCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalVolumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum BitgetCampaignEventPool_OrderBy {
  Campaign = 'campaign',
  CampaignId = 'campaign__id',
  CampaignTotalFinishedUserCount = 'campaign__totalFinishedUserCount',
  CampaignTotalVolumeUsd = 'campaign__totalVolumeUSD',
  FinishedUsers = 'finishedUsers',
  Id = 'id',
  Pool = 'pool',
  PoolAprPercentage = 'pool__aprPercentage',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCommunityFee = 'pool__communityFee',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolDeployer = 'pool__deployer',
  PoolFee = 'pool__fee',
  PoolFeeGrowthGlobal0X128 = 'pool__feeGrowthGlobal0X128',
  PoolFeeGrowthGlobal1X128 = 'pool__feeGrowthGlobal1X128',
  PoolFeesToken0 = 'pool__feesToken0',
  PoolFeesToken1 = 'pool__feesToken1',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolObservationIndex = 'pool__observationIndex',
  PoolPlugin = 'pool__plugin',
  PoolPluginConfig = 'pool__pluginConfig',
  PoolSearchString = 'pool__searchString',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolTickSpacing = 'pool__tickSpacing',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedMatic = 'pool__totalValueLockedMatic',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTotalValueLockedUsdUntracked = 'pool__totalValueLockedUSDUntracked',
  PoolTxCount = 'pool__txCount',
  PoolUntrackedFeesUsd = 'pool__untrackedFeesUSD',
  PoolUntrackedVolumeUsd = 'pool__untrackedVolumeUSD',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  TotalFinishedUserCount = 'totalFinishedUserCount',
  TotalVolumeUsd = 'totalVolumeUSD'
}

export type BitgetCampaignParticipant = {
  __typename?: 'BitgetCampaignParticipant';
  amountUSD: Scalars['BigDecimal']['output'];
  campaign: BitgetCampaign;
  finished: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  pool: BitgetCampaignEventPool;
  user: Account;
};

export type BitgetCampaignParticipant_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amountUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  amountUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  amountUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  and?: InputMaybe<Array<InputMaybe<BitgetCampaignParticipant_Filter>>>;
  campaign?: InputMaybe<Scalars['String']['input']>;
  campaign_?: InputMaybe<BitgetCampaign_Filter>;
  campaign_contains?: InputMaybe<Scalars['String']['input']>;
  campaign_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  campaign_ends_with?: InputMaybe<Scalars['String']['input']>;
  campaign_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  campaign_gt?: InputMaybe<Scalars['String']['input']>;
  campaign_gte?: InputMaybe<Scalars['String']['input']>;
  campaign_in?: InputMaybe<Array<Scalars['String']['input']>>;
  campaign_lt?: InputMaybe<Scalars['String']['input']>;
  campaign_lte?: InputMaybe<Scalars['String']['input']>;
  campaign_not?: InputMaybe<Scalars['String']['input']>;
  campaign_not_contains?: InputMaybe<Scalars['String']['input']>;
  campaign_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  campaign_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  campaign_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  campaign_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  campaign_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  campaign_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  campaign_starts_with?: InputMaybe<Scalars['String']['input']>;
  campaign_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  finished?: InputMaybe<Scalars['Boolean']['input']>;
  finished_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  finished_not?: InputMaybe<Scalars['Boolean']['input']>;
  finished_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<BitgetCampaignParticipant_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<BitgetCampaignEventPool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<Account_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum BitgetCampaignParticipant_OrderBy {
  AmountUsd = 'amountUSD',
  Campaign = 'campaign',
  CampaignId = 'campaign__id',
  CampaignTotalFinishedUserCount = 'campaign__totalFinishedUserCount',
  CampaignTotalVolumeUsd = 'campaign__totalVolumeUSD',
  Finished = 'finished',
  Id = 'id',
  Pool = 'pool',
  PoolId = 'pool__id',
  PoolTotalFinishedUserCount = 'pool__totalFinishedUserCount',
  PoolTotalVolumeUsd = 'pool__totalVolumeUSD',
  User = 'user',
  UserHoldingPoolCount = 'user__holdingPoolCount',
  UserId = 'user__id',
  UserPlatformTxCount = 'user__platformTxCount',
  UserSwapCount = 'user__swapCount',
  UserTotalSpendUsd = 'user__totalSpendUSD'
}

export type BitgetCampaign_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<BitgetCampaign_Filter>>>;
  eventPools_?: InputMaybe<BitgetCampaignEventPool_Filter>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<BitgetCampaign_Filter>>>;
  participants_?: InputMaybe<BitgetCampaignParticipant_Filter>;
  totalFinishedUserCount?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalFinishedUserCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalFinishedUserCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalVolumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum BitgetCampaign_OrderBy {
  EventPools = 'eventPools',
  Id = 'id',
  Participants = 'participants',
  TotalFinishedUserCount = 'totalFinishedUserCount',
  TotalVolumeUsd = 'totalVolumeUSD'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type Bundle = {
  __typename?: 'Bundle';
  id: Scalars['ID']['output'];
  maticPriceUSD: Scalars['BigDecimal']['output'];
};

export type Bundle_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Bundle_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  maticPriceUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  maticPriceUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  maticPriceUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  maticPriceUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  maticPriceUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  maticPriceUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  maticPriceUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  maticPriceUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Bundle_Filter>>>;
};

export enum Bundle_OrderBy {
  Id = 'id',
  MaticPriceUsd = 'maticPriceUSD'
}

export type DeployIchiVault = {
  __typename?: 'DeployICHIVault';
  allowToken0: Scalars['Boolean']['output'];
  allowToken1: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  owner: Scalars['Bytes']['output'];
  pool: Pool;
  sender: Scalars['Bytes']['output'];
  twapPeriod: Scalars['BigInt']['output'];
  vault: IchiVault;
};

export type DeployIchiVault_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  allowToken0?: InputMaybe<Scalars['Boolean']['input']>;
  allowToken0_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  allowToken0_not?: InputMaybe<Scalars['Boolean']['input']>;
  allowToken0_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  allowToken1?: InputMaybe<Scalars['Boolean']['input']>;
  allowToken1_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  allowToken1_not?: InputMaybe<Scalars['Boolean']['input']>;
  allowToken1_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  and?: InputMaybe<Array<InputMaybe<DeployIchiVault_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<DeployIchiVault_Filter>>>;
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sender?: InputMaybe<Scalars['Bytes']['input']>;
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  twapPeriod?: InputMaybe<Scalars['BigInt']['input']>;
  twapPeriod_gt?: InputMaybe<Scalars['BigInt']['input']>;
  twapPeriod_gte?: InputMaybe<Scalars['BigInt']['input']>;
  twapPeriod_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  twapPeriod_lt?: InputMaybe<Scalars['BigInt']['input']>;
  twapPeriod_lte?: InputMaybe<Scalars['BigInt']['input']>;
  twapPeriod_not?: InputMaybe<Scalars['BigInt']['input']>;
  twapPeriod_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum DeployIchiVault_OrderBy {
  AllowToken0 = 'allowToken0',
  AllowToken1 = 'allowToken1',
  Id = 'id',
  Owner = 'owner',
  Pool = 'pool',
  PoolAprPercentage = 'pool__aprPercentage',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCommunityFee = 'pool__communityFee',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolDeployer = 'pool__deployer',
  PoolFee = 'pool__fee',
  PoolFeeGrowthGlobal0X128 = 'pool__feeGrowthGlobal0X128',
  PoolFeeGrowthGlobal1X128 = 'pool__feeGrowthGlobal1X128',
  PoolFeesToken0 = 'pool__feesToken0',
  PoolFeesToken1 = 'pool__feesToken1',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolObservationIndex = 'pool__observationIndex',
  PoolPlugin = 'pool__plugin',
  PoolPluginConfig = 'pool__pluginConfig',
  PoolSearchString = 'pool__searchString',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolTickSpacing = 'pool__tickSpacing',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedMatic = 'pool__totalValueLockedMatic',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTotalValueLockedUsdUntracked = 'pool__totalValueLockedUSDUntracked',
  PoolTxCount = 'pool__txCount',
  PoolUntrackedFeesUsd = 'pool__untrackedFeesUSD',
  PoolUntrackedVolumeUsd = 'pool__untrackedVolumeUSD',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  Sender = 'sender',
  TwapPeriod = 'twapPeriod',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type Deposit = {
  __typename?: 'Deposit';
  eternalFarming?: Maybe<Scalars['Bytes']['output']>;
  id: Scalars['ID']['output'];
  liquidity: Scalars['BigInt']['output'];
  owner: Scalars['Bytes']['output'];
  pool: Scalars['Bytes']['output'];
  rangeLength: Scalars['BigInt']['output'];
};

export type Deposit_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Deposit_Filter>>>;
  eternalFarming?: InputMaybe<Scalars['Bytes']['input']>;
  eternalFarming_contains?: InputMaybe<Scalars['Bytes']['input']>;
  eternalFarming_gt?: InputMaybe<Scalars['Bytes']['input']>;
  eternalFarming_gte?: InputMaybe<Scalars['Bytes']['input']>;
  eternalFarming_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  eternalFarming_lt?: InputMaybe<Scalars['Bytes']['input']>;
  eternalFarming_lte?: InputMaybe<Scalars['Bytes']['input']>;
  eternalFarming_not?: InputMaybe<Scalars['Bytes']['input']>;
  eternalFarming_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  eternalFarming_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Deposit_Filter>>>;
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  pool?: InputMaybe<Scalars['Bytes']['input']>;
  pool_contains?: InputMaybe<Scalars['Bytes']['input']>;
  pool_gt?: InputMaybe<Scalars['Bytes']['input']>;
  pool_gte?: InputMaybe<Scalars['Bytes']['input']>;
  pool_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  pool_lt?: InputMaybe<Scalars['Bytes']['input']>;
  pool_lte?: InputMaybe<Scalars['Bytes']['input']>;
  pool_not?: InputMaybe<Scalars['Bytes']['input']>;
  pool_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  rangeLength?: InputMaybe<Scalars['BigInt']['input']>;
  rangeLength_gt?: InputMaybe<Scalars['BigInt']['input']>;
  rangeLength_gte?: InputMaybe<Scalars['BigInt']['input']>;
  rangeLength_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rangeLength_lt?: InputMaybe<Scalars['BigInt']['input']>;
  rangeLength_lte?: InputMaybe<Scalars['BigInt']['input']>;
  rangeLength_not?: InputMaybe<Scalars['BigInt']['input']>;
  rangeLength_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum Deposit_OrderBy {
  EternalFarming = 'eternalFarming',
  Id = 'id',
  Liquidity = 'liquidity',
  Owner = 'owner',
  Pool = 'pool',
  RangeLength = 'rangeLength'
}

export type EternalFarming = {
  __typename?: 'EternalFarming';
  bonusReward: Scalars['BigInt']['output'];
  bonusRewardRate: Scalars['BigInt']['output'];
  bonusRewardToken: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  isDeactivated?: Maybe<Scalars['Boolean']['output']>;
  minRangeLength: Scalars['BigInt']['output'];
  nonce: Scalars['BigInt']['output'];
  pool: Scalars['Bytes']['output'];
  reward: Scalars['BigInt']['output'];
  rewardRate: Scalars['BigInt']['output'];
  rewardToken: Scalars['Bytes']['output'];
  virtualPool: Scalars['Bytes']['output'];
};

export type EternalFarming_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<EternalFarming_Filter>>>;
  bonusReward?: InputMaybe<Scalars['BigInt']['input']>;
  bonusRewardRate?: InputMaybe<Scalars['BigInt']['input']>;
  bonusRewardRate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  bonusRewardRate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  bonusRewardRate_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  bonusRewardRate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  bonusRewardRate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  bonusRewardRate_not?: InputMaybe<Scalars['BigInt']['input']>;
  bonusRewardRate_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  bonusRewardToken?: InputMaybe<Scalars['Bytes']['input']>;
  bonusRewardToken_contains?: InputMaybe<Scalars['Bytes']['input']>;
  bonusRewardToken_gt?: InputMaybe<Scalars['Bytes']['input']>;
  bonusRewardToken_gte?: InputMaybe<Scalars['Bytes']['input']>;
  bonusRewardToken_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  bonusRewardToken_lt?: InputMaybe<Scalars['Bytes']['input']>;
  bonusRewardToken_lte?: InputMaybe<Scalars['Bytes']['input']>;
  bonusRewardToken_not?: InputMaybe<Scalars['Bytes']['input']>;
  bonusRewardToken_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  bonusRewardToken_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  bonusReward_gt?: InputMaybe<Scalars['BigInt']['input']>;
  bonusReward_gte?: InputMaybe<Scalars['BigInt']['input']>;
  bonusReward_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  bonusReward_lt?: InputMaybe<Scalars['BigInt']['input']>;
  bonusReward_lte?: InputMaybe<Scalars['BigInt']['input']>;
  bonusReward_not?: InputMaybe<Scalars['BigInt']['input']>;
  bonusReward_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  isDeactivated?: InputMaybe<Scalars['Boolean']['input']>;
  isDeactivated_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isDeactivated_not?: InputMaybe<Scalars['Boolean']['input']>;
  isDeactivated_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  minRangeLength?: InputMaybe<Scalars['BigInt']['input']>;
  minRangeLength_gt?: InputMaybe<Scalars['BigInt']['input']>;
  minRangeLength_gte?: InputMaybe<Scalars['BigInt']['input']>;
  minRangeLength_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  minRangeLength_lt?: InputMaybe<Scalars['BigInt']['input']>;
  minRangeLength_lte?: InputMaybe<Scalars['BigInt']['input']>;
  minRangeLength_not?: InputMaybe<Scalars['BigInt']['input']>;
  minRangeLength_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nonce?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_gt?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_gte?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  nonce_lt?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_lte?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_not?: InputMaybe<Scalars['BigInt']['input']>;
  nonce_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<EternalFarming_Filter>>>;
  pool?: InputMaybe<Scalars['Bytes']['input']>;
  pool_contains?: InputMaybe<Scalars['Bytes']['input']>;
  pool_gt?: InputMaybe<Scalars['Bytes']['input']>;
  pool_gte?: InputMaybe<Scalars['Bytes']['input']>;
  pool_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  pool_lt?: InputMaybe<Scalars['Bytes']['input']>;
  pool_lte?: InputMaybe<Scalars['Bytes']['input']>;
  pool_not?: InputMaybe<Scalars['Bytes']['input']>;
  pool_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  reward?: InputMaybe<Scalars['BigInt']['input']>;
  rewardRate?: InputMaybe<Scalars['BigInt']['input']>;
  rewardRate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  rewardRate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  rewardRate_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rewardRate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  rewardRate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  rewardRate_not?: InputMaybe<Scalars['BigInt']['input']>;
  rewardRate_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rewardToken?: InputMaybe<Scalars['Bytes']['input']>;
  rewardToken_contains?: InputMaybe<Scalars['Bytes']['input']>;
  rewardToken_gt?: InputMaybe<Scalars['Bytes']['input']>;
  rewardToken_gte?: InputMaybe<Scalars['Bytes']['input']>;
  rewardToken_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  rewardToken_lt?: InputMaybe<Scalars['Bytes']['input']>;
  rewardToken_lte?: InputMaybe<Scalars['Bytes']['input']>;
  rewardToken_not?: InputMaybe<Scalars['Bytes']['input']>;
  rewardToken_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  rewardToken_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  reward_gt?: InputMaybe<Scalars['BigInt']['input']>;
  reward_gte?: InputMaybe<Scalars['BigInt']['input']>;
  reward_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  reward_lt?: InputMaybe<Scalars['BigInt']['input']>;
  reward_lte?: InputMaybe<Scalars['BigInt']['input']>;
  reward_not?: InputMaybe<Scalars['BigInt']['input']>;
  reward_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  virtualPool?: InputMaybe<Scalars['Bytes']['input']>;
  virtualPool_contains?: InputMaybe<Scalars['Bytes']['input']>;
  virtualPool_gt?: InputMaybe<Scalars['Bytes']['input']>;
  virtualPool_gte?: InputMaybe<Scalars['Bytes']['input']>;
  virtualPool_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  virtualPool_lt?: InputMaybe<Scalars['Bytes']['input']>;
  virtualPool_lte?: InputMaybe<Scalars['Bytes']['input']>;
  virtualPool_not?: InputMaybe<Scalars['Bytes']['input']>;
  virtualPool_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  virtualPool_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum EternalFarming_OrderBy {
  BonusReward = 'bonusReward',
  BonusRewardRate = 'bonusRewardRate',
  BonusRewardToken = 'bonusRewardToken',
  Id = 'id',
  IsDeactivated = 'isDeactivated',
  MinRangeLength = 'minRangeLength',
  Nonce = 'nonce',
  Pool = 'pool',
  Reward = 'reward',
  RewardRate = 'rewardRate',
  RewardToken = 'rewardToken',
  VirtualPool = 'virtualPool'
}

export type Factory = {
  __typename?: 'Factory';
  accountCount: Scalars['BigInt']['output'];
  defaultCommunityFee: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  owner: Scalars['ID']['output'];
  poolCount: Scalars['BigInt']['output'];
  totalFeesMatic: Scalars['BigDecimal']['output'];
  totalFeesUSD: Scalars['BigDecimal']['output'];
  totalValueLockedMatic: Scalars['BigDecimal']['output'];
  totalValueLockedMaticUntracked: Scalars['BigDecimal']['output'];
  totalValueLockedUSD: Scalars['BigDecimal']['output'];
  totalValueLockedUSDUntracked: Scalars['BigDecimal']['output'];
  totalVolumeMatic: Scalars['BigDecimal']['output'];
  totalVolumeUSD: Scalars['BigDecimal']['output'];
  txCount: Scalars['BigInt']['output'];
  untrackedVolumeUSD: Scalars['BigDecimal']['output'];
};

export type Factory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  accountCount?: InputMaybe<Scalars['BigInt']['input']>;
  accountCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  accountCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  accountCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  accountCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  accountCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  accountCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  accountCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Factory_Filter>>>;
  defaultCommunityFee?: InputMaybe<Scalars['BigInt']['input']>;
  defaultCommunityFee_gt?: InputMaybe<Scalars['BigInt']['input']>;
  defaultCommunityFee_gte?: InputMaybe<Scalars['BigInt']['input']>;
  defaultCommunityFee_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  defaultCommunityFee_lt?: InputMaybe<Scalars['BigInt']['input']>;
  defaultCommunityFee_lte?: InputMaybe<Scalars['BigInt']['input']>;
  defaultCommunityFee_not?: InputMaybe<Scalars['BigInt']['input']>;
  defaultCommunityFee_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Factory_Filter>>>;
  owner?: InputMaybe<Scalars['ID']['input']>;
  owner_gt?: InputMaybe<Scalars['ID']['input']>;
  owner_gte?: InputMaybe<Scalars['ID']['input']>;
  owner_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  owner_lt?: InputMaybe<Scalars['ID']['input']>;
  owner_lte?: InputMaybe<Scalars['ID']['input']>;
  owner_not?: InputMaybe<Scalars['ID']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  poolCount?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  poolCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalFeesMatic?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesMatic_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesMatic_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesMatic_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalFeesMatic_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesMatic_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesMatic_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesMatic_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalFeesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalFeesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalFeesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedMatic?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMaticUntracked?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMaticUntracked_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMaticUntracked_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMaticUntracked_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedMaticUntracked_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMaticUntracked_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMaticUntracked_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMaticUntracked_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedMatic_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMatic_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMatic_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedMatic_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMatic_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMatic_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMatic_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSDUntracked_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeMatic?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeMatic_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeMatic_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeMatic_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeMatic_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeMatic_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeMatic_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeMatic_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCount?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  untrackedVolumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  untrackedVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum Factory_OrderBy {
  AccountCount = 'accountCount',
  DefaultCommunityFee = 'defaultCommunityFee',
  Id = 'id',
  Owner = 'owner',
  PoolCount = 'poolCount',
  TotalFeesMatic = 'totalFeesMatic',
  TotalFeesUsd = 'totalFeesUSD',
  TotalValueLockedMatic = 'totalValueLockedMatic',
  TotalValueLockedMaticUntracked = 'totalValueLockedMaticUntracked',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  TotalValueLockedUsdUntracked = 'totalValueLockedUSDUntracked',
  TotalVolumeMatic = 'totalVolumeMatic',
  TotalVolumeUsd = 'totalVolumeUSD',
  TxCount = 'txCount',
  UntrackedVolumeUsd = 'untrackedVolumeUSD'
}

export type IchiVault = {
  __typename?: 'IchiVault';
  allowTokenA: Scalars['Boolean']['output'];
  allowTokenB: Scalars['Boolean']['output'];
  count: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  feeApr_1d: Scalars['BigDecimal']['output'];
  feeApr_3d: Scalars['BigDecimal']['output'];
  feeApr_7d: Scalars['BigDecimal']['output'];
  feeApr_30d: Scalars['BigDecimal']['output'];
  feePerSecond0_1d: Scalars['BigInt']['output'];
  feePerSecond0_3d: Scalars['BigInt']['output'];
  feePerSecond0_7d: Scalars['BigInt']['output'];
  feePerSecond0_30d: Scalars['BigInt']['output'];
  feePerSecond1_1d: Scalars['BigInt']['output'];
  feePerSecond1_3d: Scalars['BigInt']['output'];
  feePerSecond1_7d: Scalars['BigInt']['output'];
  feePerSecond1_30d: Scalars['BigInt']['output'];
  holdersCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  lastFeeUpdate: Scalars['BigInt']['output'];
  lastPrice: Scalars['BigDecimal']['output'];
  lastPriceTimestamp: Scalars['BigInt']['output'];
  maxTotalSupply: Array<MaxTotalSupply>;
  pool: Pool;
  searchString: Scalars['String']['output'];
  sender: Scalars['Bytes']['output'];
  tokenA: Scalars['Bytes']['output'];
  tokenB: Scalars['Bytes']['output'];
  totalAmount0: Scalars['BigInt']['output'];
  totalAmount1: Scalars['BigInt']['output'];
  totalShares: Scalars['BigDecimal']['output'];
  totalSupply: Scalars['BigInt']['output'];
  vaultAffiliates: Array<VaultAffiliate>;
  vaultApprovals: Array<VaultApproval>;
  vaultCollectFees: Array<VaultCollectFee>;
  vaultDeposits: Array<VaultDeposit>;
  vaultHysteresis: Array<VaultHysteresis>;
  vaultOwnershipTransferred: Array<VaultOwnershipTransferred>;
  vaultRebalance: Array<VaultRebalance>;
  vaultSetTwapPeriod: Array<VaultSetTwapPeriod>;
  vaultShares: Array<VaultShare>;
  vaultTransfer: Array<VaultTransfer>;
  vaultWithdraws: Array<VaultWithdraw>;
};


export type IchiVaultMaxTotalSupplyArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<MaxTotalSupply_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<MaxTotalSupply_Filter>;
};


export type IchiVaultVaultAffiliatesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultAffiliate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultAffiliate_Filter>;
};


export type IchiVaultVaultApprovalsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultApproval_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultApproval_Filter>;
};


export type IchiVaultVaultCollectFeesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultCollectFee_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultCollectFee_Filter>;
};


export type IchiVaultVaultDepositsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultDeposit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultDeposit_Filter>;
};


export type IchiVaultVaultHysteresisArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultHysteresis_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultHysteresis_Filter>;
};


export type IchiVaultVaultOwnershipTransferredArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultOwnershipTransferred_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultOwnershipTransferred_Filter>;
};


export type IchiVaultVaultRebalanceArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultRebalance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultRebalance_Filter>;
};


export type IchiVaultVaultSetTwapPeriodArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultSetTwapPeriod_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultSetTwapPeriod_Filter>;
};


export type IchiVaultVaultSharesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultShare_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultShare_Filter>;
};


export type IchiVaultVaultTransferArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultTransfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultTransfer_Filter>;
};


export type IchiVaultVaultWithdrawsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultWithdraw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VaultWithdraw_Filter>;
};

export type IchiVault_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  allowTokenA?: InputMaybe<Scalars['Boolean']['input']>;
  allowTokenA_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  allowTokenA_not?: InputMaybe<Scalars['Boolean']['input']>;
  allowTokenA_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  allowTokenB?: InputMaybe<Scalars['Boolean']['input']>;
  allowTokenB_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  allowTokenB_not?: InputMaybe<Scalars['Boolean']['input']>;
  allowTokenB_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  and?: InputMaybe<Array<InputMaybe<IchiVault_Filter>>>;
  count?: InputMaybe<Scalars['BigInt']['input']>;
  count_gt?: InputMaybe<Scalars['BigInt']['input']>;
  count_gte?: InputMaybe<Scalars['BigInt']['input']>;
  count_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  count_lt?: InputMaybe<Scalars['BigInt']['input']>;
  count_lte?: InputMaybe<Scalars['BigInt']['input']>;
  count_not?: InputMaybe<Scalars['BigInt']['input']>;
  count_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeApr_1d?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_1d_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_1d_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_1d_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeApr_1d_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_1d_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_1d_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_1d_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeApr_3d?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_3d_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_3d_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_3d_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeApr_3d_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_3d_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_3d_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_3d_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeApr_7d?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_7d_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_7d_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_7d_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeApr_7d_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_7d_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_7d_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_7d_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeApr_30d?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_30d_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_30d_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_30d_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeApr_30d_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_30d_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_30d_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feeApr_30d_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feePerSecond0_1d?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_1d_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_1d_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_1d_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond0_1d_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_1d_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_1d_not?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_1d_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond0_3d?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_3d_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_3d_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_3d_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond0_3d_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_3d_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_3d_not?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_3d_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond0_7d?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_7d_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_7d_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_7d_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond0_7d_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_7d_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_7d_not?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_7d_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond0_30d?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_30d_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_30d_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_30d_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond0_30d_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_30d_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_30d_not?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond0_30d_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond1_1d?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_1d_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_1d_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_1d_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond1_1d_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_1d_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_1d_not?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_1d_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond1_3d?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_3d_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_3d_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_3d_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond1_3d_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_3d_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_3d_not?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_3d_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond1_7d?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_7d_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_7d_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_7d_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond1_7d_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_7d_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_7d_not?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_7d_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond1_30d?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_30d_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_30d_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_30d_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feePerSecond1_30d_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_30d_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_30d_not?: InputMaybe<Scalars['BigInt']['input']>;
  feePerSecond1_30d_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  holdersCount?: InputMaybe<Scalars['Int']['input']>;
  holdersCount_gt?: InputMaybe<Scalars['Int']['input']>;
  holdersCount_gte?: InputMaybe<Scalars['Int']['input']>;
  holdersCount_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  holdersCount_lt?: InputMaybe<Scalars['Int']['input']>;
  holdersCount_lte?: InputMaybe<Scalars['Int']['input']>;
  holdersCount_not?: InputMaybe<Scalars['Int']['input']>;
  holdersCount_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastFeeUpdate?: InputMaybe<Scalars['BigInt']['input']>;
  lastFeeUpdate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastFeeUpdate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastFeeUpdate_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastFeeUpdate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastFeeUpdate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastFeeUpdate_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastFeeUpdate_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPriceTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  lastPriceTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastPriceTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastPriceTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastPriceTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastPriceTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastPriceTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastPriceTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lastPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  maxTotalSupply_?: InputMaybe<MaxTotalSupply_Filter>;
  or?: InputMaybe<Array<InputMaybe<IchiVault_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  searchString?: InputMaybe<Scalars['String']['input']>;
  searchString_contains?: InputMaybe<Scalars['String']['input']>;
  searchString_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  searchString_ends_with?: InputMaybe<Scalars['String']['input']>;
  searchString_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  searchString_gt?: InputMaybe<Scalars['String']['input']>;
  searchString_gte?: InputMaybe<Scalars['String']['input']>;
  searchString_in?: InputMaybe<Array<Scalars['String']['input']>>;
  searchString_lt?: InputMaybe<Scalars['String']['input']>;
  searchString_lte?: InputMaybe<Scalars['String']['input']>;
  searchString_not?: InputMaybe<Scalars['String']['input']>;
  searchString_not_contains?: InputMaybe<Scalars['String']['input']>;
  searchString_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  searchString_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  searchString_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  searchString_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  searchString_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  searchString_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  searchString_starts_with?: InputMaybe<Scalars['String']['input']>;
  searchString_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sender?: InputMaybe<Scalars['Bytes']['input']>;
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  tokenA?: InputMaybe<Scalars['Bytes']['input']>;
  tokenA_contains?: InputMaybe<Scalars['Bytes']['input']>;
  tokenA_gt?: InputMaybe<Scalars['Bytes']['input']>;
  tokenA_gte?: InputMaybe<Scalars['Bytes']['input']>;
  tokenA_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  tokenA_lt?: InputMaybe<Scalars['Bytes']['input']>;
  tokenA_lte?: InputMaybe<Scalars['Bytes']['input']>;
  tokenA_not?: InputMaybe<Scalars['Bytes']['input']>;
  tokenA_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  tokenA_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  tokenB?: InputMaybe<Scalars['Bytes']['input']>;
  tokenB_contains?: InputMaybe<Scalars['Bytes']['input']>;
  tokenB_gt?: InputMaybe<Scalars['Bytes']['input']>;
  tokenB_gte?: InputMaybe<Scalars['Bytes']['input']>;
  tokenB_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  tokenB_lt?: InputMaybe<Scalars['Bytes']['input']>;
  tokenB_lte?: InputMaybe<Scalars['Bytes']['input']>;
  tokenB_not?: InputMaybe<Scalars['Bytes']['input']>;
  tokenB_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  tokenB_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  totalAmount0?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalShares?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalShares_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalShares_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalShares_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalShares_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalShares_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalShares_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalShares_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  vaultAffiliates_?: InputMaybe<VaultAffiliate_Filter>;
  vaultApprovals_?: InputMaybe<VaultApproval_Filter>;
  vaultCollectFees_?: InputMaybe<VaultCollectFee_Filter>;
  vaultDeposits_?: InputMaybe<VaultDeposit_Filter>;
  vaultHysteresis_?: InputMaybe<VaultHysteresis_Filter>;
  vaultOwnershipTransferred_?: InputMaybe<VaultOwnershipTransferred_Filter>;
  vaultRebalance_?: InputMaybe<VaultRebalance_Filter>;
  vaultSetTwapPeriod_?: InputMaybe<VaultSetTwapPeriod_Filter>;
  vaultShares_?: InputMaybe<VaultShare_Filter>;
  vaultTransfer_?: InputMaybe<VaultTransfer_Filter>;
  vaultWithdraws_?: InputMaybe<VaultWithdraw_Filter>;
};

export enum IchiVault_OrderBy {
  AllowTokenA = 'allowTokenA',
  AllowTokenB = 'allowTokenB',
  Count = 'count',
  CreatedAtTimestamp = 'createdAtTimestamp',
  FeeApr_1d = 'feeApr_1d',
  FeeApr_3d = 'feeApr_3d',
  FeeApr_7d = 'feeApr_7d',
  FeeApr_30d = 'feeApr_30d',
  FeePerSecond0_1d = 'feePerSecond0_1d',
  FeePerSecond0_3d = 'feePerSecond0_3d',
  FeePerSecond0_7d = 'feePerSecond0_7d',
  FeePerSecond0_30d = 'feePerSecond0_30d',
  FeePerSecond1_1d = 'feePerSecond1_1d',
  FeePerSecond1_3d = 'feePerSecond1_3d',
  FeePerSecond1_7d = 'feePerSecond1_7d',
  FeePerSecond1_30d = 'feePerSecond1_30d',
  HoldersCount = 'holdersCount',
  Id = 'id',
  LastFeeUpdate = 'lastFeeUpdate',
  LastPrice = 'lastPrice',
  LastPriceTimestamp = 'lastPriceTimestamp',
  MaxTotalSupply = 'maxTotalSupply',
  Pool = 'pool',
  PoolAprPercentage = 'pool__aprPercentage',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCommunityFee = 'pool__communityFee',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolDeployer = 'pool__deployer',
  PoolFee = 'pool__fee',
  PoolFeeGrowthGlobal0X128 = 'pool__feeGrowthGlobal0X128',
  PoolFeeGrowthGlobal1X128 = 'pool__feeGrowthGlobal1X128',
  PoolFeesToken0 = 'pool__feesToken0',
  PoolFeesToken1 = 'pool__feesToken1',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolObservationIndex = 'pool__observationIndex',
  PoolPlugin = 'pool__plugin',
  PoolPluginConfig = 'pool__pluginConfig',
  PoolSearchString = 'pool__searchString',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolTickSpacing = 'pool__tickSpacing',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedMatic = 'pool__totalValueLockedMatic',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTotalValueLockedUsdUntracked = 'pool__totalValueLockedUSDUntracked',
  PoolTxCount = 'pool__txCount',
  PoolUntrackedFeesUsd = 'pool__untrackedFeesUSD',
  PoolUntrackedVolumeUsd = 'pool__untrackedVolumeUSD',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  SearchString = 'searchString',
  Sender = 'sender',
  TokenA = 'tokenA',
  TokenB = 'tokenB',
  TotalAmount0 = 'totalAmount0',
  TotalAmount1 = 'totalAmount1',
  TotalShares = 'totalShares',
  TotalSupply = 'totalSupply',
  VaultAffiliates = 'vaultAffiliates',
  VaultApprovals = 'vaultApprovals',
  VaultCollectFees = 'vaultCollectFees',
  VaultDeposits = 'vaultDeposits',
  VaultHysteresis = 'vaultHysteresis',
  VaultOwnershipTransferred = 'vaultOwnershipTransferred',
  VaultRebalance = 'vaultRebalance',
  VaultSetTwapPeriod = 'vaultSetTwapPeriod',
  VaultShares = 'vaultShares',
  VaultTransfer = 'vaultTransfer',
  VaultWithdraws = 'vaultWithdraws'
}

export type LiquidatorData = {
  __typename?: 'LiquidatorData';
  account: Account;
  amount0: Scalars['BigDecimal']['output'];
  amount1: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  pool: Pool;
  token0: Token;
  token1: Token;
  totalLiquidityUsd: Scalars['BigDecimal']['output'];
};

export type LiquidatorData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']['input']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']['input']>;
  account_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_gt?: InputMaybe<Scalars['String']['input']>;
  account_gte?: InputMaybe<Scalars['String']['input']>;
  account_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_lt?: InputMaybe<Scalars['String']['input']>;
  account_lte?: InputMaybe<Scalars['String']['input']>;
  account_not?: InputMaybe<Scalars['String']['input']>;
  account_not_contains?: InputMaybe<Scalars['String']['input']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  amount0?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  amount0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  amount1?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  amount1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  amount1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  and?: InputMaybe<Array<InputMaybe<LiquidatorData_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<LiquidatorData_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0?: InputMaybe<Scalars['String']['input']>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']['input']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_gt?: InputMaybe<Scalars['String']['input']>;
  token0_gte?: InputMaybe<Scalars['String']['input']>;
  token0_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_lt?: InputMaybe<Scalars['String']['input']>;
  token0_lte?: InputMaybe<Scalars['String']['input']>;
  token0_not?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1?: InputMaybe<Scalars['String']['input']>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']['input']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_gt?: InputMaybe<Scalars['String']['input']>;
  token1_gte?: InputMaybe<Scalars['String']['input']>;
  token1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_lt?: InputMaybe<Scalars['String']['input']>;
  token1_lte?: InputMaybe<Scalars['String']['input']>;
  token1_not?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalLiquidityUsd?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalLiquidityUsd_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalLiquidityUsd_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalLiquidityUsd_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalLiquidityUsd_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalLiquidityUsd_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalLiquidityUsd_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalLiquidityUsd_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum LiquidatorData_OrderBy {
  Account = 'account',
  AccountHoldingPoolCount = 'account__holdingPoolCount',
  AccountId = 'account__id',
  AccountPlatformTxCount = 'account__platformTxCount',
  AccountSwapCount = 'account__swapCount',
  AccountTotalSpendUsd = 'account__totalSpendUSD',
  Amount0 = 'amount0',
  Amount1 = 'amount1',
  Id = 'id',
  Pool = 'pool',
  PoolAprPercentage = 'pool__aprPercentage',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCommunityFee = 'pool__communityFee',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolDeployer = 'pool__deployer',
  PoolFee = 'pool__fee',
  PoolFeeGrowthGlobal0X128 = 'pool__feeGrowthGlobal0X128',
  PoolFeeGrowthGlobal1X128 = 'pool__feeGrowthGlobal1X128',
  PoolFeesToken0 = 'pool__feesToken0',
  PoolFeesToken1 = 'pool__feesToken1',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolObservationIndex = 'pool__observationIndex',
  PoolPlugin = 'pool__plugin',
  PoolPluginConfig = 'pool__pluginConfig',
  PoolSearchString = 'pool__searchString',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolTickSpacing = 'pool__tickSpacing',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedMatic = 'pool__totalValueLockedMatic',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTotalValueLockedUsdUntracked = 'pool__totalValueLockedUSDUntracked',
  PoolTxCount = 'pool__txCount',
  PoolUntrackedFeesUsd = 'pool__untrackedFeesUSD',
  PoolUntrackedVolumeUsd = 'pool__untrackedVolumeUSD',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  Token0 = 'token0',
  Token0Decimals = 'token0__decimals',
  Token0DerivedMatic = 'token0__derivedMatic',
  Token0DerivedUsd = 'token0__derivedUSD',
  Token0FeesUsd = 'token0__feesUSD',
  Token0Id = 'token0__id',
  Token0InitialUsd = 'token0__initialUSD',
  Token0LiquidityUsd = 'token0__liquidityUSD',
  Token0MarketCap = 'token0__marketCap',
  Token0Name = 'token0__name',
  Token0PoolCount = 'token0__poolCount',
  Token0PriceChange24h = 'token0__priceChange24h',
  Token0PriceChange24hPercentage = 'token0__priceChange24hPercentage',
  Token0Symbol = 'token0__symbol',
  Token0TotalSupply = 'token0__totalSupply',
  Token0TotalValueLocked = 'token0__totalValueLocked',
  Token0TotalValueLockedUsd = 'token0__totalValueLockedUSD',
  Token0TotalValueLockedUsdUntracked = 'token0__totalValueLockedUSDUntracked',
  Token0TxCount = 'token0__txCount',
  Token0UntrackedVolumeUsd = 'token0__untrackedVolumeUSD',
  Token0Volume = 'token0__volume',
  Token0VolumeUsd = 'token0__volumeUSD',
  Token1 = 'token1',
  Token1Decimals = 'token1__decimals',
  Token1DerivedMatic = 'token1__derivedMatic',
  Token1DerivedUsd = 'token1__derivedUSD',
  Token1FeesUsd = 'token1__feesUSD',
  Token1Id = 'token1__id',
  Token1InitialUsd = 'token1__initialUSD',
  Token1LiquidityUsd = 'token1__liquidityUSD',
  Token1MarketCap = 'token1__marketCap',
  Token1Name = 'token1__name',
  Token1PoolCount = 'token1__poolCount',
  Token1PriceChange24h = 'token1__priceChange24h',
  Token1PriceChange24hPercentage = 'token1__priceChange24hPercentage',
  Token1Symbol = 'token1__symbol',
  Token1TotalSupply = 'token1__totalSupply',
  Token1TotalValueLocked = 'token1__totalValueLocked',
  Token1TotalValueLockedUsd = 'token1__totalValueLockedUSD',
  Token1TotalValueLockedUsdUntracked = 'token1__totalValueLockedUSDUntracked',
  Token1TxCount = 'token1__txCount',
  Token1UntrackedVolumeUsd = 'token1__untrackedVolumeUSD',
  Token1Volume = 'token1__volume',
  Token1VolumeUsd = 'token1__volumeUSD',
  TotalLiquidityUsd = 'totalLiquidityUsd'
}

export type MaxTotalSupply = {
  __typename?: 'MaxTotalSupply';
  id: Scalars['ID']['output'];
  maxTotalSupply: Scalars['BigInt']['output'];
  sender: Scalars['Bytes']['output'];
  vault: IchiVault;
};

export type MaxTotalSupply_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<MaxTotalSupply_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  maxTotalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  maxTotalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  maxTotalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  maxTotalSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  maxTotalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  maxTotalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  maxTotalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  maxTotalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<MaxTotalSupply_Filter>>>;
  sender?: InputMaybe<Scalars['Bytes']['input']>;
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum MaxTotalSupply_OrderBy {
  Id = 'id',
  MaxTotalSupply = 'maxTotalSupply',
  Sender = 'sender',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Plugin = {
  __typename?: 'Plugin';
  collectedFeesToken0: Scalars['BigDecimal']['output'];
  collectedFeesToken1: Scalars['BigDecimal']['output'];
  collectedFeesUSD: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  pool: Pool;
};

export type Plugin_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Plugin_Filter>>>;
  collectedFeesToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Plugin_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum Plugin_OrderBy {
  CollectedFeesToken0 = 'collectedFeesToken0',
  CollectedFeesToken1 = 'collectedFeesToken1',
  CollectedFeesUsd = 'collectedFeesUSD',
  Id = 'id',
  Pool = 'pool',
  PoolAprPercentage = 'pool__aprPercentage',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCommunityFee = 'pool__communityFee',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolDeployer = 'pool__deployer',
  PoolFee = 'pool__fee',
  PoolFeeGrowthGlobal0X128 = 'pool__feeGrowthGlobal0X128',
  PoolFeeGrowthGlobal1X128 = 'pool__feeGrowthGlobal1X128',
  PoolFeesToken0 = 'pool__feesToken0',
  PoolFeesToken1 = 'pool__feesToken1',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolObservationIndex = 'pool__observationIndex',
  PoolPlugin = 'pool__plugin',
  PoolPluginConfig = 'pool__pluginConfig',
  PoolSearchString = 'pool__searchString',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolTickSpacing = 'pool__tickSpacing',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedMatic = 'pool__totalValueLockedMatic',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTotalValueLockedUsdUntracked = 'pool__totalValueLockedUSDUntracked',
  PoolTxCount = 'pool__txCount',
  PoolUntrackedFeesUsd = 'pool__untrackedFeesUSD',
  PoolUntrackedVolumeUsd = 'pool__untrackedVolumeUSD',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD'
}

export type Pool = {
  __typename?: 'Pool';
  aprPercentage: Scalars['BigDecimal']['output'];
  collectedFeesToken0: Scalars['BigDecimal']['output'];
  collectedFeesToken1: Scalars['BigDecimal']['output'];
  collectedFeesUSD: Scalars['BigDecimal']['output'];
  communityFee: Scalars['BigInt']['output'];
  createdAtBlockNumber: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  deployer: Scalars['Bytes']['output'];
  fee: Scalars['BigInt']['output'];
  feeGrowthGlobal0X128: Scalars['BigInt']['output'];
  feeGrowthGlobal1X128: Scalars['BigInt']['output'];
  feesToken0: Scalars['BigDecimal']['output'];
  feesToken1: Scalars['BigDecimal']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  liquidity: Scalars['BigInt']['output'];
  liquidityProviderCount: Scalars['BigInt']['output'];
  observationIndex: Scalars['BigInt']['output'];
  plugin: Scalars['Bytes']['output'];
  pluginConfig: Scalars['Int']['output'];
  searchString: Scalars['String']['output'];
  sqrtPrice: Scalars['BigInt']['output'];
  tick: Scalars['BigInt']['output'];
  tickSpacing: Scalars['BigInt']['output'];
  ticks: Array<Tick>;
  token0: Token;
  token0Price: Scalars['BigDecimal']['output'];
  token1: Token;
  token1Price: Scalars['BigDecimal']['output'];
  totalValueLockedMatic: Scalars['BigDecimal']['output'];
  totalValueLockedToken0: Scalars['BigDecimal']['output'];
  totalValueLockedToken1: Scalars['BigDecimal']['output'];
  totalValueLockedUSD: Scalars['BigDecimal']['output'];
  totalValueLockedUSDUntracked: Scalars['BigDecimal']['output'];
  txCount: Scalars['BigInt']['output'];
  untrackedFeesUSD: Scalars['BigDecimal']['output'];
  untrackedVolumeUSD: Scalars['BigDecimal']['output'];
  vaults?: Maybe<IchiVault>;
  volumeToken0: Scalars['BigDecimal']['output'];
  volumeToken1: Scalars['BigDecimal']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};


export type PoolTicksArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Tick_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Tick_Filter>;
};

export type PoolFeeData = {
  __typename?: 'PoolFeeData';
  fee: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  pool?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['BigInt']['output'];
};

export type PoolFeeData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PoolFeeData_Filter>>>;
  fee?: InputMaybe<Scalars['BigInt']['input']>;
  fee_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fee_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<PoolFeeData_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export enum PoolFeeData_OrderBy {
  Fee = 'fee',
  Id = 'id',
  Pool = 'pool',
  Timestamp = 'timestamp'
}

export type PoolPosition = {
  __typename?: 'PoolPosition';
  id: Scalars['ID']['output'];
  liquidity: Scalars['BigInt']['output'];
  lowerTick: Tick;
  owner: Scalars['Bytes']['output'];
  pool: Pool;
  upperTick: Tick;
};

export type PoolPosition_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PoolPosition_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lowerTick?: InputMaybe<Scalars['String']['input']>;
  lowerTick_?: InputMaybe<Tick_Filter>;
  lowerTick_contains?: InputMaybe<Scalars['String']['input']>;
  lowerTick_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  lowerTick_ends_with?: InputMaybe<Scalars['String']['input']>;
  lowerTick_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lowerTick_gt?: InputMaybe<Scalars['String']['input']>;
  lowerTick_gte?: InputMaybe<Scalars['String']['input']>;
  lowerTick_in?: InputMaybe<Array<Scalars['String']['input']>>;
  lowerTick_lt?: InputMaybe<Scalars['String']['input']>;
  lowerTick_lte?: InputMaybe<Scalars['String']['input']>;
  lowerTick_not?: InputMaybe<Scalars['String']['input']>;
  lowerTick_not_contains?: InputMaybe<Scalars['String']['input']>;
  lowerTick_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  lowerTick_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  lowerTick_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lowerTick_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  lowerTick_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  lowerTick_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lowerTick_starts_with?: InputMaybe<Scalars['String']['input']>;
  lowerTick_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<PoolPosition_Filter>>>;
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  upperTick?: InputMaybe<Scalars['String']['input']>;
  upperTick_?: InputMaybe<Tick_Filter>;
  upperTick_contains?: InputMaybe<Scalars['String']['input']>;
  upperTick_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  upperTick_ends_with?: InputMaybe<Scalars['String']['input']>;
  upperTick_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  upperTick_gt?: InputMaybe<Scalars['String']['input']>;
  upperTick_gte?: InputMaybe<Scalars['String']['input']>;
  upperTick_in?: InputMaybe<Array<Scalars['String']['input']>>;
  upperTick_lt?: InputMaybe<Scalars['String']['input']>;
  upperTick_lte?: InputMaybe<Scalars['String']['input']>;
  upperTick_not?: InputMaybe<Scalars['String']['input']>;
  upperTick_not_contains?: InputMaybe<Scalars['String']['input']>;
  upperTick_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  upperTick_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  upperTick_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  upperTick_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  upperTick_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  upperTick_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  upperTick_starts_with?: InputMaybe<Scalars['String']['input']>;
  upperTick_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum PoolPosition_OrderBy {
  Id = 'id',
  Liquidity = 'liquidity',
  LowerTick = 'lowerTick',
  LowerTickCollectedFeesToken0 = 'lowerTick__collectedFeesToken0',
  LowerTickCollectedFeesToken1 = 'lowerTick__collectedFeesToken1',
  LowerTickCollectedFeesUsd = 'lowerTick__collectedFeesUSD',
  LowerTickCreatedAtBlockNumber = 'lowerTick__createdAtBlockNumber',
  LowerTickCreatedAtTimestamp = 'lowerTick__createdAtTimestamp',
  LowerTickFeeGrowthOutside0X128 = 'lowerTick__feeGrowthOutside0X128',
  LowerTickFeeGrowthOutside1X128 = 'lowerTick__feeGrowthOutside1X128',
  LowerTickFeesUsd = 'lowerTick__feesUSD',
  LowerTickId = 'lowerTick__id',
  LowerTickLiquidityGross = 'lowerTick__liquidityGross',
  LowerTickLiquidityNet = 'lowerTick__liquidityNet',
  LowerTickLiquidityProviderCount = 'lowerTick__liquidityProviderCount',
  LowerTickPoolAddress = 'lowerTick__poolAddress',
  LowerTickPrice0 = 'lowerTick__price0',
  LowerTickPrice1 = 'lowerTick__price1',
  LowerTickTickIdx = 'lowerTick__tickIdx',
  LowerTickUntrackedVolumeUsd = 'lowerTick__untrackedVolumeUSD',
  LowerTickVolumeToken0 = 'lowerTick__volumeToken0',
  LowerTickVolumeToken1 = 'lowerTick__volumeToken1',
  LowerTickVolumeUsd = 'lowerTick__volumeUSD',
  Owner = 'owner',
  Pool = 'pool',
  PoolAprPercentage = 'pool__aprPercentage',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCommunityFee = 'pool__communityFee',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolDeployer = 'pool__deployer',
  PoolFee = 'pool__fee',
  PoolFeeGrowthGlobal0X128 = 'pool__feeGrowthGlobal0X128',
  PoolFeeGrowthGlobal1X128 = 'pool__feeGrowthGlobal1X128',
  PoolFeesToken0 = 'pool__feesToken0',
  PoolFeesToken1 = 'pool__feesToken1',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolObservationIndex = 'pool__observationIndex',
  PoolPlugin = 'pool__plugin',
  PoolPluginConfig = 'pool__pluginConfig',
  PoolSearchString = 'pool__searchString',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolTickSpacing = 'pool__tickSpacing',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedMatic = 'pool__totalValueLockedMatic',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTotalValueLockedUsdUntracked = 'pool__totalValueLockedUSDUntracked',
  PoolTxCount = 'pool__txCount',
  PoolUntrackedFeesUsd = 'pool__untrackedFeesUSD',
  PoolUntrackedVolumeUsd = 'pool__untrackedVolumeUSD',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  UpperTick = 'upperTick',
  UpperTickCollectedFeesToken0 = 'upperTick__collectedFeesToken0',
  UpperTickCollectedFeesToken1 = 'upperTick__collectedFeesToken1',
  UpperTickCollectedFeesUsd = 'upperTick__collectedFeesUSD',
  UpperTickCreatedAtBlockNumber = 'upperTick__createdAtBlockNumber',
  UpperTickCreatedAtTimestamp = 'upperTick__createdAtTimestamp',
  UpperTickFeeGrowthOutside0X128 = 'upperTick__feeGrowthOutside0X128',
  UpperTickFeeGrowthOutside1X128 = 'upperTick__feeGrowthOutside1X128',
  UpperTickFeesUsd = 'upperTick__feesUSD',
  UpperTickId = 'upperTick__id',
  UpperTickLiquidityGross = 'upperTick__liquidityGross',
  UpperTickLiquidityNet = 'upperTick__liquidityNet',
  UpperTickLiquidityProviderCount = 'upperTick__liquidityProviderCount',
  UpperTickPoolAddress = 'upperTick__poolAddress',
  UpperTickPrice0 = 'upperTick__price0',
  UpperTickPrice1 = 'upperTick__price1',
  UpperTickTickIdx = 'upperTick__tickIdx',
  UpperTickUntrackedVolumeUsd = 'upperTick__untrackedVolumeUSD',
  UpperTickVolumeToken0 = 'upperTick__volumeToken0',
  UpperTickVolumeToken1 = 'upperTick__volumeToken1',
  UpperTickVolumeUsd = 'upperTick__volumeUSD'
}

export type Pool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
  aprPercentage?: InputMaybe<Scalars['BigDecimal']['input']>;
  aprPercentage_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  aprPercentage_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  aprPercentage_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  aprPercentage_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  aprPercentage_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  aprPercentage_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  aprPercentage_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  communityFee?: InputMaybe<Scalars['BigInt']['input']>;
  communityFee_gt?: InputMaybe<Scalars['BigInt']['input']>;
  communityFee_gte?: InputMaybe<Scalars['BigInt']['input']>;
  communityFee_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  communityFee_lt?: InputMaybe<Scalars['BigInt']['input']>;
  communityFee_lte?: InputMaybe<Scalars['BigInt']['input']>;
  communityFee_not?: InputMaybe<Scalars['BigInt']['input']>;
  communityFee_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  deployer?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_contains?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_gt?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_gte?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  deployer_lt?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_lte?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_not?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  deployer_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  fee?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal0X128?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal0X128_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal0X128_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal0X128_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeGrowthGlobal0X128_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal0X128_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal0X128_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal0X128_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeGrowthGlobal1X128?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal1X128_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal1X128_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal1X128_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeGrowthGlobal1X128_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal1X128_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal1X128_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthGlobal1X128_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fee_gt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_gte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  fee_lt?: InputMaybe<Scalars['BigInt']['input']>;
  fee_lte?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not?: InputMaybe<Scalars['BigInt']['input']>;
  fee_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feesToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityProviderCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  observationIndex?: InputMaybe<Scalars['BigInt']['input']>;
  observationIndex_gt?: InputMaybe<Scalars['BigInt']['input']>;
  observationIndex_gte?: InputMaybe<Scalars['BigInt']['input']>;
  observationIndex_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  observationIndex_lt?: InputMaybe<Scalars['BigInt']['input']>;
  observationIndex_lte?: InputMaybe<Scalars['BigInt']['input']>;
  observationIndex_not?: InputMaybe<Scalars['BigInt']['input']>;
  observationIndex_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
  plugin?: InputMaybe<Scalars['Bytes']['input']>;
  pluginConfig?: InputMaybe<Scalars['Int']['input']>;
  pluginConfig_gt?: InputMaybe<Scalars['Int']['input']>;
  pluginConfig_gte?: InputMaybe<Scalars['Int']['input']>;
  pluginConfig_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  pluginConfig_lt?: InputMaybe<Scalars['Int']['input']>;
  pluginConfig_lte?: InputMaybe<Scalars['Int']['input']>;
  pluginConfig_not?: InputMaybe<Scalars['Int']['input']>;
  pluginConfig_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  plugin_contains?: InputMaybe<Scalars['Bytes']['input']>;
  plugin_gt?: InputMaybe<Scalars['Bytes']['input']>;
  plugin_gte?: InputMaybe<Scalars['Bytes']['input']>;
  plugin_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  plugin_lt?: InputMaybe<Scalars['Bytes']['input']>;
  plugin_lte?: InputMaybe<Scalars['Bytes']['input']>;
  plugin_not?: InputMaybe<Scalars['Bytes']['input']>;
  plugin_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  plugin_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  searchString?: InputMaybe<Scalars['String']['input']>;
  searchString_contains?: InputMaybe<Scalars['String']['input']>;
  searchString_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  searchString_ends_with?: InputMaybe<Scalars['String']['input']>;
  searchString_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  searchString_gt?: InputMaybe<Scalars['String']['input']>;
  searchString_gte?: InputMaybe<Scalars['String']['input']>;
  searchString_in?: InputMaybe<Array<Scalars['String']['input']>>;
  searchString_lt?: InputMaybe<Scalars['String']['input']>;
  searchString_lte?: InputMaybe<Scalars['String']['input']>;
  searchString_not?: InputMaybe<Scalars['String']['input']>;
  searchString_not_contains?: InputMaybe<Scalars['String']['input']>;
  searchString_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  searchString_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  searchString_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  searchString_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  searchString_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  searchString_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  searchString_starts_with?: InputMaybe<Scalars['String']['input']>;
  searchString_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  sqrtPrice?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick?: InputMaybe<Scalars['BigInt']['input']>;
  tickSpacing?: InputMaybe<Scalars['BigInt']['input']>;
  tickSpacing_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tickSpacing_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tickSpacing_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tickSpacing_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tickSpacing_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tickSpacing_not?: InputMaybe<Scalars['BigInt']['input']>;
  tickSpacing_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tick_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not?: InputMaybe<Scalars['BigInt']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  ticks_?: InputMaybe<Tick_Filter>;
  token0?: InputMaybe<Scalars['String']['input']>;
  token0Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']['input']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_gt?: InputMaybe<Scalars['String']['input']>;
  token0_gte?: InputMaybe<Scalars['String']['input']>;
  token0_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_lt?: InputMaybe<Scalars['String']['input']>;
  token0_lte?: InputMaybe<Scalars['String']['input']>;
  token0_not?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1?: InputMaybe<Scalars['String']['input']>;
  token1Price?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Price_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Price_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']['input']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_gt?: InputMaybe<Scalars['String']['input']>;
  token1_gte?: InputMaybe<Scalars['String']['input']>;
  token1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_lt?: InputMaybe<Scalars['String']['input']>;
  token1_lte?: InputMaybe<Scalars['String']['input']>;
  token1_not?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalValueLockedMatic?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMatic_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMatic_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMatic_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedMatic_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMatic_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMatic_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedMatic_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSDUntracked_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCount?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  untrackedFeesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedFeesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedFeesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedFeesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  untrackedFeesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedFeesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedFeesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedFeesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  untrackedVolumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  untrackedVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  vaults_?: InputMaybe<IchiVault_Filter>;
  volumeToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum Pool_OrderBy {
  AprPercentage = 'aprPercentage',
  CollectedFeesToken0 = 'collectedFeesToken0',
  CollectedFeesToken1 = 'collectedFeesToken1',
  CollectedFeesUsd = 'collectedFeesUSD',
  CommunityFee = 'communityFee',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Deployer = 'deployer',
  Fee = 'fee',
  FeeGrowthGlobal0X128 = 'feeGrowthGlobal0X128',
  FeeGrowthGlobal1X128 = 'feeGrowthGlobal1X128',
  FeesToken0 = 'feesToken0',
  FeesToken1 = 'feesToken1',
  FeesUsd = 'feesUSD',
  Id = 'id',
  Liquidity = 'liquidity',
  LiquidityProviderCount = 'liquidityProviderCount',
  ObservationIndex = 'observationIndex',
  Plugin = 'plugin',
  PluginConfig = 'pluginConfig',
  SearchString = 'searchString',
  SqrtPrice = 'sqrtPrice',
  Tick = 'tick',
  TickSpacing = 'tickSpacing',
  Ticks = 'ticks',
  Token0 = 'token0',
  Token0Price = 'token0Price',
  Token0Decimals = 'token0__decimals',
  Token0DerivedMatic = 'token0__derivedMatic',
  Token0DerivedUsd = 'token0__derivedUSD',
  Token0FeesUsd = 'token0__feesUSD',
  Token0Id = 'token0__id',
  Token0InitialUsd = 'token0__initialUSD',
  Token0LiquidityUsd = 'token0__liquidityUSD',
  Token0MarketCap = 'token0__marketCap',
  Token0Name = 'token0__name',
  Token0PoolCount = 'token0__poolCount',
  Token0PriceChange24h = 'token0__priceChange24h',
  Token0PriceChange24hPercentage = 'token0__priceChange24hPercentage',
  Token0Symbol = 'token0__symbol',
  Token0TotalSupply = 'token0__totalSupply',
  Token0TotalValueLocked = 'token0__totalValueLocked',
  Token0TotalValueLockedUsd = 'token0__totalValueLockedUSD',
  Token0TotalValueLockedUsdUntracked = 'token0__totalValueLockedUSDUntracked',
  Token0TxCount = 'token0__txCount',
  Token0UntrackedVolumeUsd = 'token0__untrackedVolumeUSD',
  Token0Volume = 'token0__volume',
  Token0VolumeUsd = 'token0__volumeUSD',
  Token1 = 'token1',
  Token1Price = 'token1Price',
  Token1Decimals = 'token1__decimals',
  Token1DerivedMatic = 'token1__derivedMatic',
  Token1DerivedUsd = 'token1__derivedUSD',
  Token1FeesUsd = 'token1__feesUSD',
  Token1Id = 'token1__id',
  Token1InitialUsd = 'token1__initialUSD',
  Token1LiquidityUsd = 'token1__liquidityUSD',
  Token1MarketCap = 'token1__marketCap',
  Token1Name = 'token1__name',
  Token1PoolCount = 'token1__poolCount',
  Token1PriceChange24h = 'token1__priceChange24h',
  Token1PriceChange24hPercentage = 'token1__priceChange24hPercentage',
  Token1Symbol = 'token1__symbol',
  Token1TotalSupply = 'token1__totalSupply',
  Token1TotalValueLocked = 'token1__totalValueLocked',
  Token1TotalValueLockedUsd = 'token1__totalValueLockedUSD',
  Token1TotalValueLockedUsdUntracked = 'token1__totalValueLockedUSDUntracked',
  Token1TxCount = 'token1__txCount',
  Token1UntrackedVolumeUsd = 'token1__untrackedVolumeUSD',
  Token1Volume = 'token1__volume',
  Token1VolumeUsd = 'token1__volumeUSD',
  TotalValueLockedMatic = 'totalValueLockedMatic',
  TotalValueLockedToken0 = 'totalValueLockedToken0',
  TotalValueLockedToken1 = 'totalValueLockedToken1',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  TotalValueLockedUsdUntracked = 'totalValueLockedUSDUntracked',
  TxCount = 'txCount',
  UntrackedFeesUsd = 'untrackedFeesUSD',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  Vaults = 'vaults',
  VaultsAllowTokenA = 'vaults__allowTokenA',
  VaultsAllowTokenB = 'vaults__allowTokenB',
  VaultsCount = 'vaults__count',
  VaultsCreatedAtTimestamp = 'vaults__createdAtTimestamp',
  VaultsFeeApr_1d = 'vaults__feeApr_1d',
  VaultsFeeApr_3d = 'vaults__feeApr_3d',
  VaultsFeeApr_7d = 'vaults__feeApr_7d',
  VaultsFeeApr_30d = 'vaults__feeApr_30d',
  VaultsFeePerSecond0_1d = 'vaults__feePerSecond0_1d',
  VaultsFeePerSecond0_3d = 'vaults__feePerSecond0_3d',
  VaultsFeePerSecond0_7d = 'vaults__feePerSecond0_7d',
  VaultsFeePerSecond0_30d = 'vaults__feePerSecond0_30d',
  VaultsFeePerSecond1_1d = 'vaults__feePerSecond1_1d',
  VaultsFeePerSecond1_3d = 'vaults__feePerSecond1_3d',
  VaultsFeePerSecond1_7d = 'vaults__feePerSecond1_7d',
  VaultsFeePerSecond1_30d = 'vaults__feePerSecond1_30d',
  VaultsHoldersCount = 'vaults__holdersCount',
  VaultsId = 'vaults__id',
  VaultsLastFeeUpdate = 'vaults__lastFeeUpdate',
  VaultsLastPrice = 'vaults__lastPrice',
  VaultsLastPriceTimestamp = 'vaults__lastPriceTimestamp',
  VaultsSearchString = 'vaults__searchString',
  VaultsSender = 'vaults__sender',
  VaultsTokenA = 'vaults__tokenA',
  VaultsTokenB = 'vaults__tokenB',
  VaultsTotalAmount0 = 'vaults__totalAmount0',
  VaultsTotalAmount1 = 'vaults__totalAmount1',
  VaultsTotalShares = 'vaults__totalShares',
  VaultsTotalSupply = 'vaults__totalSupply',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD'
}

export type Position = {
  __typename?: 'Position';
  collectedFeesToken0: Scalars['BigDecimal']['output'];
  collectedFeesToken1: Scalars['BigDecimal']['output'];
  collectedToken0: Scalars['BigDecimal']['output'];
  collectedToken1: Scalars['BigDecimal']['output'];
  depositedToken0: Scalars['BigDecimal']['output'];
  depositedToken1: Scalars['BigDecimal']['output'];
  feeGrowthInside0LastX128: Scalars['BigInt']['output'];
  feeGrowthInside1LastX128: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  liquidity: Scalars['BigInt']['output'];
  owner: Scalars['Bytes']['output'];
  pool: Pool;
  tickLower: Tick;
  tickUpper: Tick;
  token0: Token;
  token0Tvl?: Maybe<Scalars['BigDecimal']['output']>;
  token1: Token;
  token1Tvl?: Maybe<Scalars['BigDecimal']['output']>;
  withdrawnToken0: Scalars['BigDecimal']['output'];
  withdrawnToken1: Scalars['BigDecimal']['output'];
};

export type Position_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Position_Filter>>>;
  collectedFeesToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  depositedToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  depositedToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  depositedToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  depositedToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  depositedToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feeGrowthInside0LastX128?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside0LastX128_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside0LastX128_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside0LastX128_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeGrowthInside0LastX128_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside0LastX128_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside0LastX128_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside0LastX128_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeGrowthInside1LastX128?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside1LastX128_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside1LastX128_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside1LastX128_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeGrowthInside1LastX128_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside1LastX128_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside1LastX128_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthInside1LastX128_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidity?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Position_Filter>>>;
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower?: InputMaybe<Scalars['String']['input']>;
  tickLower_?: InputMaybe<Tick_Filter>;
  tickLower_contains?: InputMaybe<Scalars['String']['input']>;
  tickLower_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower_ends_with?: InputMaybe<Scalars['String']['input']>;
  tickLower_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower_gt?: InputMaybe<Scalars['String']['input']>;
  tickLower_gte?: InputMaybe<Scalars['String']['input']>;
  tickLower_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tickLower_lt?: InputMaybe<Scalars['String']['input']>;
  tickLower_lte?: InputMaybe<Scalars['String']['input']>;
  tickLower_not?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_contains?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tickLower_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  tickLower_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickLower_starts_with?: InputMaybe<Scalars['String']['input']>;
  tickLower_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper?: InputMaybe<Scalars['String']['input']>;
  tickUpper_?: InputMaybe<Tick_Filter>;
  tickUpper_contains?: InputMaybe<Scalars['String']['input']>;
  tickUpper_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper_ends_with?: InputMaybe<Scalars['String']['input']>;
  tickUpper_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper_gt?: InputMaybe<Scalars['String']['input']>;
  tickUpper_gte?: InputMaybe<Scalars['String']['input']>;
  tickUpper_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tickUpper_lt?: InputMaybe<Scalars['String']['input']>;
  tickUpper_lte?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_contains?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tickUpper_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  tickUpper_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickUpper_starts_with?: InputMaybe<Scalars['String']['input']>;
  tickUpper_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0?: InputMaybe<Scalars['String']['input']>;
  token0Tvl?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Tvl_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Tvl_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Tvl_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0Tvl_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Tvl_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Tvl_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token0Tvl_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']['input']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_gt?: InputMaybe<Scalars['String']['input']>;
  token0_gte?: InputMaybe<Scalars['String']['input']>;
  token0_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_lt?: InputMaybe<Scalars['String']['input']>;
  token0_lte?: InputMaybe<Scalars['String']['input']>;
  token0_not?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1?: InputMaybe<Scalars['String']['input']>;
  token1Tvl?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Tvl_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Tvl_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Tvl_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1Tvl_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Tvl_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Tvl_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  token1Tvl_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']['input']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_gt?: InputMaybe<Scalars['String']['input']>;
  token1_gte?: InputMaybe<Scalars['String']['input']>;
  token1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_lt?: InputMaybe<Scalars['String']['input']>;
  token1_lte?: InputMaybe<Scalars['String']['input']>;
  token1_not?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawnToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  withdrawnToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  withdrawnToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  withdrawnToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  withdrawnToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum Position_OrderBy {
  CollectedFeesToken0 = 'collectedFeesToken0',
  CollectedFeesToken1 = 'collectedFeesToken1',
  CollectedToken0 = 'collectedToken0',
  CollectedToken1 = 'collectedToken1',
  DepositedToken0 = 'depositedToken0',
  DepositedToken1 = 'depositedToken1',
  FeeGrowthInside0LastX128 = 'feeGrowthInside0LastX128',
  FeeGrowthInside1LastX128 = 'feeGrowthInside1LastX128',
  Id = 'id',
  Liquidity = 'liquidity',
  Owner = 'owner',
  Pool = 'pool',
  PoolAprPercentage = 'pool__aprPercentage',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCommunityFee = 'pool__communityFee',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolDeployer = 'pool__deployer',
  PoolFee = 'pool__fee',
  PoolFeeGrowthGlobal0X128 = 'pool__feeGrowthGlobal0X128',
  PoolFeeGrowthGlobal1X128 = 'pool__feeGrowthGlobal1X128',
  PoolFeesToken0 = 'pool__feesToken0',
  PoolFeesToken1 = 'pool__feesToken1',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolObservationIndex = 'pool__observationIndex',
  PoolPlugin = 'pool__plugin',
  PoolPluginConfig = 'pool__pluginConfig',
  PoolSearchString = 'pool__searchString',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolTickSpacing = 'pool__tickSpacing',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedMatic = 'pool__totalValueLockedMatic',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTotalValueLockedUsdUntracked = 'pool__totalValueLockedUSDUntracked',
  PoolTxCount = 'pool__txCount',
  PoolUntrackedFeesUsd = 'pool__untrackedFeesUSD',
  PoolUntrackedVolumeUsd = 'pool__untrackedVolumeUSD',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  TickLower = 'tickLower',
  TickLowerCollectedFeesToken0 = 'tickLower__collectedFeesToken0',
  TickLowerCollectedFeesToken1 = 'tickLower__collectedFeesToken1',
  TickLowerCollectedFeesUsd = 'tickLower__collectedFeesUSD',
  TickLowerCreatedAtBlockNumber = 'tickLower__createdAtBlockNumber',
  TickLowerCreatedAtTimestamp = 'tickLower__createdAtTimestamp',
  TickLowerFeeGrowthOutside0X128 = 'tickLower__feeGrowthOutside0X128',
  TickLowerFeeGrowthOutside1X128 = 'tickLower__feeGrowthOutside1X128',
  TickLowerFeesUsd = 'tickLower__feesUSD',
  TickLowerId = 'tickLower__id',
  TickLowerLiquidityGross = 'tickLower__liquidityGross',
  TickLowerLiquidityNet = 'tickLower__liquidityNet',
  TickLowerLiquidityProviderCount = 'tickLower__liquidityProviderCount',
  TickLowerPoolAddress = 'tickLower__poolAddress',
  TickLowerPrice0 = 'tickLower__price0',
  TickLowerPrice1 = 'tickLower__price1',
  TickLowerTickIdx = 'tickLower__tickIdx',
  TickLowerUntrackedVolumeUsd = 'tickLower__untrackedVolumeUSD',
  TickLowerVolumeToken0 = 'tickLower__volumeToken0',
  TickLowerVolumeToken1 = 'tickLower__volumeToken1',
  TickLowerVolumeUsd = 'tickLower__volumeUSD',
  TickUpper = 'tickUpper',
  TickUpperCollectedFeesToken0 = 'tickUpper__collectedFeesToken0',
  TickUpperCollectedFeesToken1 = 'tickUpper__collectedFeesToken1',
  TickUpperCollectedFeesUsd = 'tickUpper__collectedFeesUSD',
  TickUpperCreatedAtBlockNumber = 'tickUpper__createdAtBlockNumber',
  TickUpperCreatedAtTimestamp = 'tickUpper__createdAtTimestamp',
  TickUpperFeeGrowthOutside0X128 = 'tickUpper__feeGrowthOutside0X128',
  TickUpperFeeGrowthOutside1X128 = 'tickUpper__feeGrowthOutside1X128',
  TickUpperFeesUsd = 'tickUpper__feesUSD',
  TickUpperId = 'tickUpper__id',
  TickUpperLiquidityGross = 'tickUpper__liquidityGross',
  TickUpperLiquidityNet = 'tickUpper__liquidityNet',
  TickUpperLiquidityProviderCount = 'tickUpper__liquidityProviderCount',
  TickUpperPoolAddress = 'tickUpper__poolAddress',
  TickUpperPrice0 = 'tickUpper__price0',
  TickUpperPrice1 = 'tickUpper__price1',
  TickUpperTickIdx = 'tickUpper__tickIdx',
  TickUpperUntrackedVolumeUsd = 'tickUpper__untrackedVolumeUSD',
  TickUpperVolumeToken0 = 'tickUpper__volumeToken0',
  TickUpperVolumeToken1 = 'tickUpper__volumeToken1',
  TickUpperVolumeUsd = 'tickUpper__volumeUSD',
  Token0 = 'token0',
  Token0Tvl = 'token0Tvl',
  Token0Decimals = 'token0__decimals',
  Token0DerivedMatic = 'token0__derivedMatic',
  Token0DerivedUsd = 'token0__derivedUSD',
  Token0FeesUsd = 'token0__feesUSD',
  Token0Id = 'token0__id',
  Token0InitialUsd = 'token0__initialUSD',
  Token0LiquidityUsd = 'token0__liquidityUSD',
  Token0MarketCap = 'token0__marketCap',
  Token0Name = 'token0__name',
  Token0PoolCount = 'token0__poolCount',
  Token0PriceChange24h = 'token0__priceChange24h',
  Token0PriceChange24hPercentage = 'token0__priceChange24hPercentage',
  Token0Symbol = 'token0__symbol',
  Token0TotalSupply = 'token0__totalSupply',
  Token0TotalValueLocked = 'token0__totalValueLocked',
  Token0TotalValueLockedUsd = 'token0__totalValueLockedUSD',
  Token0TotalValueLockedUsdUntracked = 'token0__totalValueLockedUSDUntracked',
  Token0TxCount = 'token0__txCount',
  Token0UntrackedVolumeUsd = 'token0__untrackedVolumeUSD',
  Token0Volume = 'token0__volume',
  Token0VolumeUsd = 'token0__volumeUSD',
  Token1 = 'token1',
  Token1Tvl = 'token1Tvl',
  Token1Decimals = 'token1__decimals',
  Token1DerivedMatic = 'token1__derivedMatic',
  Token1DerivedUsd = 'token1__derivedUSD',
  Token1FeesUsd = 'token1__feesUSD',
  Token1Id = 'token1__id',
  Token1InitialUsd = 'token1__initialUSD',
  Token1LiquidityUsd = 'token1__liquidityUSD',
  Token1MarketCap = 'token1__marketCap',
  Token1Name = 'token1__name',
  Token1PoolCount = 'token1__poolCount',
  Token1PriceChange24h = 'token1__priceChange24h',
  Token1PriceChange24hPercentage = 'token1__priceChange24hPercentage',
  Token1Symbol = 'token1__symbol',
  Token1TotalSupply = 'token1__totalSupply',
  Token1TotalValueLocked = 'token1__totalValueLocked',
  Token1TotalValueLockedUsd = 'token1__totalValueLockedUSD',
  Token1TotalValueLockedUsdUntracked = 'token1__totalValueLockedUSDUntracked',
  Token1TxCount = 'token1__txCount',
  Token1UntrackedVolumeUsd = 'token1__untrackedVolumeUSD',
  Token1Volume = 'token1__volume',
  Token1VolumeUsd = 'token1__volumeUSD',
  WithdrawnToken0 = 'withdrawnToken0',
  WithdrawnToken1 = 'withdrawnToken1'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  bitgetCampaign?: Maybe<BitgetCampaign>;
  bitgetCampaignEventPool?: Maybe<BitgetCampaignEventPool>;
  bitgetCampaignEventPools: Array<BitgetCampaignEventPool>;
  bitgetCampaignParticipant?: Maybe<BitgetCampaignParticipant>;
  bitgetCampaignParticipants: Array<BitgetCampaignParticipant>;
  bitgetCampaigns: Array<BitgetCampaign>;
  bundle?: Maybe<Bundle>;
  bundles: Array<Bundle>;
  deployICHIVault?: Maybe<DeployIchiVault>;
  deployICHIVaults: Array<DeployIchiVault>;
  deposit?: Maybe<Deposit>;
  deposits: Array<Deposit>;
  eternalFarming?: Maybe<EternalFarming>;
  eternalFarmings: Array<EternalFarming>;
  factories: Array<Factory>;
  factory?: Maybe<Factory>;
  ichiVault?: Maybe<IchiVault>;
  ichiVaults: Array<IchiVault>;
  liquidatorData?: Maybe<LiquidatorData>;
  liquidatorDatas: Array<LiquidatorData>;
  maxTotalSupplies: Array<MaxTotalSupply>;
  maxTotalSupply?: Maybe<MaxTotalSupply>;
  plugin?: Maybe<Plugin>;
  plugins: Array<Plugin>;
  pool?: Maybe<Pool>;
  poolFeeData?: Maybe<PoolFeeData>;
  poolFeeDatas: Array<PoolFeeData>;
  poolPosition?: Maybe<PoolPosition>;
  poolPositions: Array<PoolPosition>;
  pools: Array<Pool>;
  position?: Maybe<Position>;
  positions: Array<Position>;
  reward?: Maybe<Reward>;
  rewards: Array<Reward>;
  tick?: Maybe<Tick>;
  ticks: Array<Tick>;
  token?: Maybe<Token>;
  tokens: Array<Token>;
  vaultAffiliate?: Maybe<VaultAffiliate>;
  vaultAffiliates: Array<VaultAffiliate>;
  vaultApproval?: Maybe<VaultApproval>;
  vaultApprovals: Array<VaultApproval>;
  vaultCollectFee?: Maybe<VaultCollectFee>;
  vaultCollectFees: Array<VaultCollectFee>;
  vaultDeposit?: Maybe<VaultDeposit>;
  vaultDepositMax?: Maybe<VaultDepositMax>;
  vaultDepositMaxes: Array<VaultDepositMax>;
  vaultDeposits: Array<VaultDeposit>;
  vaultHystereses: Array<VaultHysteresis>;
  vaultHysteresis?: Maybe<VaultHysteresis>;
  vaultOwnershipTransferred?: Maybe<VaultOwnershipTransferred>;
  vaultOwnershipTransferreds: Array<VaultOwnershipTransferred>;
  vaultRebalance?: Maybe<VaultRebalance>;
  vaultRebalances: Array<VaultRebalance>;
  vaultSetTwapPeriod?: Maybe<VaultSetTwapPeriod>;
  vaultSetTwapPeriods: Array<VaultSetTwapPeriod>;
  vaultShare?: Maybe<VaultShare>;
  vaultShares: Array<VaultShare>;
  vaultTransfer?: Maybe<VaultTransfer>;
  vaultTransfers: Array<VaultTransfer>;
  vaultWithdraw?: Maybe<VaultWithdraw>;
  vaultWithdraws: Array<VaultWithdraw>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Account_Filter>;
};


export type QueryBitgetCampaignArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryBitgetCampaignEventPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryBitgetCampaignEventPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BitgetCampaignEventPool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<BitgetCampaignEventPool_Filter>;
};


export type QueryBitgetCampaignParticipantArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryBitgetCampaignParticipantsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BitgetCampaignParticipant_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<BitgetCampaignParticipant_Filter>;
};


export type QueryBitgetCampaignsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BitgetCampaign_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<BitgetCampaign_Filter>;
};


export type QueryBundleArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryBundlesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Bundle_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Bundle_Filter>;
};


export type QueryDeployIchiVaultArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDeployIchiVaultsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<DeployIchiVault_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DeployIchiVault_Filter>;
};


export type QueryDepositArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDepositsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Deposit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Deposit_Filter>;
};


export type QueryEternalFarmingArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEternalFarmingsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<EternalFarming_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EternalFarming_Filter>;
};


export type QueryFactoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Factory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Factory_Filter>;
};


export type QueryFactoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryIchiVaultArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryIchiVaultsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<IchiVault_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<IchiVault_Filter>;
};


export type QueryLiquidatorDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLiquidatorDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<LiquidatorData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LiquidatorData_Filter>;
};


export type QueryMaxTotalSuppliesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<MaxTotalSupply_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<MaxTotalSupply_Filter>;
};


export type QueryMaxTotalSupplyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPluginArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPluginsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Plugin_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Plugin_Filter>;
};


export type QueryPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPoolFeeDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPoolFeeDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolFeeData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PoolFeeData_Filter>;
};


export type QueryPoolPositionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPoolPositionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolPosition_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PoolPosition_Filter>;
};


export type QueryPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Pool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Pool_Filter>;
};


export type QueryPositionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPositionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Position_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Position_Filter>;
};


export type QueryRewardArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryRewardsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Reward_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Reward_Filter>;
};


export type QueryTickArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTicksArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Tick_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Tick_Filter>;
};


export type QueryTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Token_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Token_Filter>;
};


export type QueryVaultAffiliateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultAffiliatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultAffiliate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultAffiliate_Filter>;
};


export type QueryVaultApprovalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultApprovalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultApproval_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultApproval_Filter>;
};


export type QueryVaultCollectFeeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultCollectFeesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultCollectFee_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultCollectFee_Filter>;
};


export type QueryVaultDepositArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultDepositMaxArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultDepositMaxesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultDepositMax_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultDepositMax_Filter>;
};


export type QueryVaultDepositsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultDeposit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultDeposit_Filter>;
};


export type QueryVaultHysteresesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultHysteresis_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultHysteresis_Filter>;
};


export type QueryVaultHysteresisArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultOwnershipTransferredArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultOwnershipTransferredsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultOwnershipTransferred_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultOwnershipTransferred_Filter>;
};


export type QueryVaultRebalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultRebalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultRebalance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultRebalance_Filter>;
};


export type QueryVaultSetTwapPeriodArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultSetTwapPeriodsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultSetTwapPeriod_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultSetTwapPeriod_Filter>;
};


export type QueryVaultShareArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultSharesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultShare_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultShare_Filter>;
};


export type QueryVaultTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultTransfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultTransfer_Filter>;
};


export type QueryVaultWithdrawArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVaultWithdrawsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<VaultWithdraw_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VaultWithdraw_Filter>;
};

export type Reward = {
  __typename?: 'Reward';
  amount: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  owner: Scalars['Bytes']['output'];
  rewardAddress: Scalars['Bytes']['output'];
};

export type Reward_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Reward_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Reward_Filter>>>;
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  rewardAddress?: InputMaybe<Scalars['Bytes']['input']>;
  rewardAddress_contains?: InputMaybe<Scalars['Bytes']['input']>;
  rewardAddress_gt?: InputMaybe<Scalars['Bytes']['input']>;
  rewardAddress_gte?: InputMaybe<Scalars['Bytes']['input']>;
  rewardAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  rewardAddress_lt?: InputMaybe<Scalars['Bytes']['input']>;
  rewardAddress_lte?: InputMaybe<Scalars['Bytes']['input']>;
  rewardAddress_not?: InputMaybe<Scalars['Bytes']['input']>;
  rewardAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  rewardAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum Reward_OrderBy {
  Amount = 'amount',
  Id = 'id',
  Owner = 'owner',
  RewardAddress = 'rewardAddress'
}

export type Tick = {
  __typename?: 'Tick';
  collectedFeesToken0: Scalars['BigDecimal']['output'];
  collectedFeesToken1: Scalars['BigDecimal']['output'];
  collectedFeesUSD: Scalars['BigDecimal']['output'];
  createdAtBlockNumber: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  feeGrowthOutside0X128: Scalars['BigInt']['output'];
  feeGrowthOutside1X128: Scalars['BigInt']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  liquidityGross: Scalars['BigInt']['output'];
  liquidityNet: Scalars['BigInt']['output'];
  liquidityProviderCount: Scalars['BigInt']['output'];
  pool: Pool;
  poolAddress?: Maybe<Scalars['String']['output']>;
  price0: Scalars['BigDecimal']['output'];
  price1: Scalars['BigDecimal']['output'];
  tickIdx: Scalars['BigInt']['output'];
  untrackedVolumeUSD: Scalars['BigDecimal']['output'];
  volumeToken0: Scalars['BigDecimal']['output'];
  volumeToken1: Scalars['BigDecimal']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
};

export type Tick_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Tick_Filter>>>;
  collectedFeesToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  collectedFeesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  collectedFeesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  createdAtBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeGrowthOutside0X128?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside0X128_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside0X128_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside0X128_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeGrowthOutside0X128_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside0X128_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside0X128_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside0X128_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeGrowthOutside1X128?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside1X128_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside1X128_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside1X128_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeGrowthOutside1X128_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside1X128_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside1X128_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeGrowthOutside1X128_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  liquidityGross?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityGross_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityGross_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityNet?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityNet_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityNet_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityProviderCount?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  liquidityProviderCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  liquidityProviderCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Tick_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  poolAddress?: InputMaybe<Scalars['String']['input']>;
  poolAddress_contains?: InputMaybe<Scalars['String']['input']>;
  poolAddress_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_ends_with?: InputMaybe<Scalars['String']['input']>;
  poolAddress_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_gt?: InputMaybe<Scalars['String']['input']>;
  poolAddress_gte?: InputMaybe<Scalars['String']['input']>;
  poolAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  poolAddress_lt?: InputMaybe<Scalars['String']['input']>;
  poolAddress_lte?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  poolAddress_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_starts_with?: InputMaybe<Scalars['String']['input']>;
  poolAddress_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  price0?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  price0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  price0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  price1?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  price1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  price1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  tickIdx?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tickIdx_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_not?: InputMaybe<Scalars['BigInt']['input']>;
  tickIdx_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  untrackedVolumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  untrackedVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum Tick_OrderBy {
  CollectedFeesToken0 = 'collectedFeesToken0',
  CollectedFeesToken1 = 'collectedFeesToken1',
  CollectedFeesUsd = 'collectedFeesUSD',
  CreatedAtBlockNumber = 'createdAtBlockNumber',
  CreatedAtTimestamp = 'createdAtTimestamp',
  FeeGrowthOutside0X128 = 'feeGrowthOutside0X128',
  FeeGrowthOutside1X128 = 'feeGrowthOutside1X128',
  FeesUsd = 'feesUSD',
  Id = 'id',
  LiquidityGross = 'liquidityGross',
  LiquidityNet = 'liquidityNet',
  LiquidityProviderCount = 'liquidityProviderCount',
  Pool = 'pool',
  PoolAddress = 'poolAddress',
  PoolAprPercentage = 'pool__aprPercentage',
  PoolCollectedFeesToken0 = 'pool__collectedFeesToken0',
  PoolCollectedFeesToken1 = 'pool__collectedFeesToken1',
  PoolCollectedFeesUsd = 'pool__collectedFeesUSD',
  PoolCommunityFee = 'pool__communityFee',
  PoolCreatedAtBlockNumber = 'pool__createdAtBlockNumber',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolDeployer = 'pool__deployer',
  PoolFee = 'pool__fee',
  PoolFeeGrowthGlobal0X128 = 'pool__feeGrowthGlobal0X128',
  PoolFeeGrowthGlobal1X128 = 'pool__feeGrowthGlobal1X128',
  PoolFeesToken0 = 'pool__feesToken0',
  PoolFeesToken1 = 'pool__feesToken1',
  PoolFeesUsd = 'pool__feesUSD',
  PoolId = 'pool__id',
  PoolLiquidity = 'pool__liquidity',
  PoolLiquidityProviderCount = 'pool__liquidityProviderCount',
  PoolObservationIndex = 'pool__observationIndex',
  PoolPlugin = 'pool__plugin',
  PoolPluginConfig = 'pool__pluginConfig',
  PoolSearchString = 'pool__searchString',
  PoolSqrtPrice = 'pool__sqrtPrice',
  PoolTick = 'pool__tick',
  PoolTickSpacing = 'pool__tickSpacing',
  PoolToken0Price = 'pool__token0Price',
  PoolToken1Price = 'pool__token1Price',
  PoolTotalValueLockedMatic = 'pool__totalValueLockedMatic',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  PoolTotalValueLockedUsdUntracked = 'pool__totalValueLockedUSDUntracked',
  PoolTxCount = 'pool__txCount',
  PoolUntrackedFeesUsd = 'pool__untrackedFeesUSD',
  PoolUntrackedVolumeUsd = 'pool__untrackedVolumeUSD',
  PoolVolumeToken0 = 'pool__volumeToken0',
  PoolVolumeToken1 = 'pool__volumeToken1',
  PoolVolumeUsd = 'pool__volumeUSD',
  Price0 = 'price0',
  Price1 = 'price1',
  TickIdx = 'tickIdx',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  VolumeToken0 = 'volumeToken0',
  VolumeToken1 = 'volumeToken1',
  VolumeUsd = 'volumeUSD'
}

export type Token = {
  __typename?: 'Token';
  decimals: Scalars['BigInt']['output'];
  derivedMatic: Scalars['BigDecimal']['output'];
  derivedUSD: Scalars['BigDecimal']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  id: Scalars['ID']['output'];
  initialUSD: Scalars['BigDecimal']['output'];
  liquidityUSD: Scalars['BigDecimal']['output'];
  marketCap: Scalars['BigDecimal']['output'];
  name: Scalars['String']['output'];
  poolCount: Scalars['BigInt']['output'];
  priceChange24h: Scalars['BigDecimal']['output'];
  priceChange24hPercentage: Scalars['BigDecimal']['output'];
  symbol: Scalars['String']['output'];
  totalSupply: Scalars['BigInt']['output'];
  totalValueLocked: Scalars['BigDecimal']['output'];
  totalValueLockedUSD: Scalars['BigDecimal']['output'];
  totalValueLockedUSDUntracked: Scalars['BigDecimal']['output'];
  txCount: Scalars['BigInt']['output'];
  untrackedVolumeUSD: Scalars['BigDecimal']['output'];
  volume: Scalars['BigDecimal']['output'];
  volumeUSD: Scalars['BigDecimal']['output'];
  whitelistPools: Array<Pool>;
};


export type TokenWhitelistPoolsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Pool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Pool_Filter>;
};

export type Token_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  decimals?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_gt?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_gte?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  decimals_lt?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_lte?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_not?: InputMaybe<Scalars['BigInt']['input']>;
  decimals_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  derivedMatic?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedMatic_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedMatic_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedMatic_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  derivedMatic_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedMatic_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedMatic_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedMatic_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  derivedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  derivedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  derivedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  initialUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  initialUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  initialUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  initialUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  initialUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  initialUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  initialUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  initialUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  liquidityUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  liquidityUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  liquidityUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  liquidityUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  liquidityUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  liquidityUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  liquidityUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  liquidityUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  marketCap?: InputMaybe<Scalars['BigDecimal']['input']>;
  marketCap_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  marketCap_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  marketCap_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  marketCap_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  marketCap_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  marketCap_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  marketCap_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  poolCount?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  poolCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  poolCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  priceChange24h?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24hPercentage?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24hPercentage_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24hPercentage_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24hPercentage_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceChange24hPercentage_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24hPercentage_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24hPercentage_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24hPercentage_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceChange24h_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24h_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24h_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  priceChange24h_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24h_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24h_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  priceChange24h_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_gt?: InputMaybe<Scalars['String']['input']>;
  symbol_gte?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_lt?: InputMaybe<Scalars['String']['input']>;
  symbol_lte?: InputMaybe<Scalars['String']['input']>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalValueLocked?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSDUntracked_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSDUntracked_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLocked_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLocked_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLocked_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLocked_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLocked_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLocked_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLocked_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  txCount?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not?: InputMaybe<Scalars['BigInt']['input']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  untrackedVolumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  untrackedVolumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  untrackedVolumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volume?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volumeUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volumeUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volume_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volume_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volume_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  volume_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  volume_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  volume_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  volume_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  whitelistPools?: InputMaybe<Array<Scalars['String']['input']>>;
  whitelistPools_?: InputMaybe<Pool_Filter>;
  whitelistPools_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  whitelistPools_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  whitelistPools_not?: InputMaybe<Array<Scalars['String']['input']>>;
  whitelistPools_not_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  whitelistPools_not_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
};

export enum Token_OrderBy {
  Decimals = 'decimals',
  DerivedMatic = 'derivedMatic',
  DerivedUsd = 'derivedUSD',
  FeesUsd = 'feesUSD',
  Id = 'id',
  InitialUsd = 'initialUSD',
  LiquidityUsd = 'liquidityUSD',
  MarketCap = 'marketCap',
  Name = 'name',
  PoolCount = 'poolCount',
  PriceChange24h = 'priceChange24h',
  PriceChange24hPercentage = 'priceChange24hPercentage',
  Symbol = 'symbol',
  TotalSupply = 'totalSupply',
  TotalValueLocked = 'totalValueLocked',
  TotalValueLockedUsd = 'totalValueLockedUSD',
  TotalValueLockedUsdUntracked = 'totalValueLockedUSDUntracked',
  TxCount = 'txCount',
  UntrackedVolumeUsd = 'untrackedVolumeUSD',
  Volume = 'volume',
  VolumeUsd = 'volumeUSD',
  WhitelistPools = 'whitelistPools'
}

export type VaultAffiliate = {
  __typename?: 'VaultAffiliate';
  affiliate: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  sender: Scalars['Bytes']['output'];
  vault: IchiVault;
};

export type VaultAffiliate_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  affiliate?: InputMaybe<Scalars['Bytes']['input']>;
  affiliate_contains?: InputMaybe<Scalars['Bytes']['input']>;
  affiliate_gt?: InputMaybe<Scalars['Bytes']['input']>;
  affiliate_gte?: InputMaybe<Scalars['Bytes']['input']>;
  affiliate_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  affiliate_lt?: InputMaybe<Scalars['Bytes']['input']>;
  affiliate_lte?: InputMaybe<Scalars['Bytes']['input']>;
  affiliate_not?: InputMaybe<Scalars['Bytes']['input']>;
  affiliate_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  affiliate_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<VaultAffiliate_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultAffiliate_Filter>>>;
  sender?: InputMaybe<Scalars['Bytes']['input']>;
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultAffiliate_OrderBy {
  Affiliate = 'affiliate',
  Id = 'id',
  Sender = 'sender',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type VaultApproval = {
  __typename?: 'VaultApproval';
  id: Scalars['ID']['output'];
  owner: Scalars['Bytes']['output'];
  spender: Scalars['Bytes']['output'];
  value: Scalars['BigInt']['output'];
  vault: IchiVault;
};

export type VaultApproval_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VaultApproval_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultApproval_Filter>>>;
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  owner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  owner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  owner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  owner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  spender?: InputMaybe<Scalars['Bytes']['input']>;
  spender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  spender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  spender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  spender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  spender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  spender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  spender_not?: InputMaybe<Scalars['Bytes']['input']>;
  spender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  spender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  value?: InputMaybe<Scalars['BigInt']['input']>;
  value_gt?: InputMaybe<Scalars['BigInt']['input']>;
  value_gte?: InputMaybe<Scalars['BigInt']['input']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  value_lt?: InputMaybe<Scalars['BigInt']['input']>;
  value_lte?: InputMaybe<Scalars['BigInt']['input']>;
  value_not?: InputMaybe<Scalars['BigInt']['input']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultApproval_OrderBy {
  Id = 'id',
  Owner = 'owner',
  Spender = 'spender',
  Value = 'value',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type VaultCollectFee = {
  __typename?: 'VaultCollectFee';
  createdAtTimestamp: Scalars['BigInt']['output'];
  feeAmount0: Scalars['BigInt']['output'];
  feeAmount1: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  lastPrice: Scalars['BigDecimal']['output'];
  sender: Scalars['Bytes']['output'];
  sqrtPrice: Scalars['BigInt']['output'];
  tick: Scalars['Int']['output'];
  totalAmount0: Scalars['BigInt']['output'];
  totalAmount1: Scalars['BigInt']['output'];
  totalSupply: Scalars['BigInt']['output'];
  vault: IchiVault;
};

export type VaultCollectFee_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VaultCollectFee_Filter>>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeAmount0?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeAmount0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeAmount1?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeAmount1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lastPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultCollectFee_Filter>>>;
  sender?: InputMaybe<Scalars['Bytes']['input']>;
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sqrtPrice?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick?: InputMaybe<Scalars['Int']['input']>;
  tick_gt?: InputMaybe<Scalars['Int']['input']>;
  tick_gte?: InputMaybe<Scalars['Int']['input']>;
  tick_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tick_lt?: InputMaybe<Scalars['Int']['input']>;
  tick_lte?: InputMaybe<Scalars['Int']['input']>;
  tick_not?: InputMaybe<Scalars['Int']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  totalAmount0?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultCollectFee_OrderBy {
  CreatedAtTimestamp = 'createdAtTimestamp',
  FeeAmount0 = 'feeAmount0',
  FeeAmount1 = 'feeAmount1',
  Id = 'id',
  LastPrice = 'lastPrice',
  Sender = 'sender',
  SqrtPrice = 'sqrtPrice',
  Tick = 'tick',
  TotalAmount0 = 'totalAmount0',
  TotalAmount1 = 'totalAmount1',
  TotalSupply = 'totalSupply',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type VaultDeposit = {
  __typename?: 'VaultDeposit';
  amount0: Scalars['BigInt']['output'];
  amount1: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  lastPrice: Scalars['BigDecimal']['output'];
  sender: Scalars['Bytes']['output'];
  shares: Scalars['BigInt']['output'];
  sqrtPrice: Scalars['BigInt']['output'];
  tick: Scalars['Int']['output'];
  to: Scalars['Bytes']['output'];
  totalAmount0: Scalars['BigInt']['output'];
  totalAmount0BeforeEvent: Scalars['BigInt']['output'];
  totalAmount1: Scalars['BigInt']['output'];
  totalAmount1BeforeEvent: Scalars['BigInt']['output'];
  totalSupply: Scalars['BigInt']['output'];
  vault: IchiVault;
};

export type VaultDepositMax = {
  __typename?: 'VaultDepositMax';
  deposit0Max: Scalars['BigInt']['output'];
  deposit1Max: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  sender: Scalars['Bytes']['output'];
  vault: IchiVault;
};

export type VaultDepositMax_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VaultDepositMax_Filter>>>;
  deposit0Max?: InputMaybe<Scalars['BigInt']['input']>;
  deposit0Max_gt?: InputMaybe<Scalars['BigInt']['input']>;
  deposit0Max_gte?: InputMaybe<Scalars['BigInt']['input']>;
  deposit0Max_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  deposit0Max_lt?: InputMaybe<Scalars['BigInt']['input']>;
  deposit0Max_lte?: InputMaybe<Scalars['BigInt']['input']>;
  deposit0Max_not?: InputMaybe<Scalars['BigInt']['input']>;
  deposit0Max_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  deposit1Max?: InputMaybe<Scalars['BigInt']['input']>;
  deposit1Max_gt?: InputMaybe<Scalars['BigInt']['input']>;
  deposit1Max_gte?: InputMaybe<Scalars['BigInt']['input']>;
  deposit1Max_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  deposit1Max_lt?: InputMaybe<Scalars['BigInt']['input']>;
  deposit1Max_lte?: InputMaybe<Scalars['BigInt']['input']>;
  deposit1Max_not?: InputMaybe<Scalars['BigInt']['input']>;
  deposit1Max_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultDepositMax_Filter>>>;
  sender?: InputMaybe<Scalars['Bytes']['input']>;
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultDepositMax_OrderBy {
  Deposit0Max = 'deposit0Max',
  Deposit1Max = 'deposit1Max',
  Id = 'id',
  Sender = 'sender',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type VaultDeposit_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount0?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount1?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<VaultDeposit_Filter>>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lastPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultDeposit_Filter>>>;
  sender?: InputMaybe<Scalars['Bytes']['input']>;
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  shares?: InputMaybe<Scalars['BigInt']['input']>;
  shares_gt?: InputMaybe<Scalars['BigInt']['input']>;
  shares_gte?: InputMaybe<Scalars['BigInt']['input']>;
  shares_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  shares_lt?: InputMaybe<Scalars['BigInt']['input']>;
  shares_lte?: InputMaybe<Scalars['BigInt']['input']>;
  shares_not?: InputMaybe<Scalars['BigInt']['input']>;
  shares_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick?: InputMaybe<Scalars['Int']['input']>;
  tick_gt?: InputMaybe<Scalars['Int']['input']>;
  tick_gte?: InputMaybe<Scalars['Int']['input']>;
  tick_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tick_lt?: InputMaybe<Scalars['Int']['input']>;
  tick_lte?: InputMaybe<Scalars['Int']['input']>;
  tick_not?: InputMaybe<Scalars['Int']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  to?: InputMaybe<Scalars['Bytes']['input']>;
  to_contains?: InputMaybe<Scalars['Bytes']['input']>;
  to_gt?: InputMaybe<Scalars['Bytes']['input']>;
  to_gte?: InputMaybe<Scalars['Bytes']['input']>;
  to_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  to_lt?: InputMaybe<Scalars['Bytes']['input']>;
  to_lte?: InputMaybe<Scalars['Bytes']['input']>;
  to_not?: InputMaybe<Scalars['Bytes']['input']>;
  to_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  to_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  totalAmount0?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount0BeforeEvent_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1BeforeEvent_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultDeposit_OrderBy {
  Amount0 = 'amount0',
  Amount1 = 'amount1',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Id = 'id',
  LastPrice = 'lastPrice',
  Sender = 'sender',
  Shares = 'shares',
  SqrtPrice = 'sqrtPrice',
  Tick = 'tick',
  To = 'to',
  TotalAmount0 = 'totalAmount0',
  TotalAmount0BeforeEvent = 'totalAmount0BeforeEvent',
  TotalAmount1 = 'totalAmount1',
  TotalAmount1BeforeEvent = 'totalAmount1BeforeEvent',
  TotalSupply = 'totalSupply',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type VaultHysteresis = {
  __typename?: 'VaultHysteresis';
  hysteresis: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  sender: Scalars['Bytes']['output'];
  vault: IchiVault;
};

export type VaultHysteresis_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VaultHysteresis_Filter>>>;
  hysteresis?: InputMaybe<Scalars['BigInt']['input']>;
  hysteresis_gt?: InputMaybe<Scalars['BigInt']['input']>;
  hysteresis_gte?: InputMaybe<Scalars['BigInt']['input']>;
  hysteresis_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  hysteresis_lt?: InputMaybe<Scalars['BigInt']['input']>;
  hysteresis_lte?: InputMaybe<Scalars['BigInt']['input']>;
  hysteresis_not?: InputMaybe<Scalars['BigInt']['input']>;
  hysteresis_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultHysteresis_Filter>>>;
  sender?: InputMaybe<Scalars['Bytes']['input']>;
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultHysteresis_OrderBy {
  Hysteresis = 'hysteresis',
  Id = 'id',
  Sender = 'sender',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type VaultOwnershipTransferred = {
  __typename?: 'VaultOwnershipTransferred';
  id: Scalars['ID']['output'];
  newOwner: Scalars['Bytes']['output'];
  previousOwner: Scalars['Bytes']['output'];
  vault: IchiVault;
};

export type VaultOwnershipTransferred_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VaultOwnershipTransferred_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  newOwner?: InputMaybe<Scalars['Bytes']['input']>;
  newOwner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  newOwner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  newOwner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  newOwner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  newOwner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  newOwner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  newOwner_not?: InputMaybe<Scalars['Bytes']['input']>;
  newOwner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  newOwner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultOwnershipTransferred_Filter>>>;
  previousOwner?: InputMaybe<Scalars['Bytes']['input']>;
  previousOwner_contains?: InputMaybe<Scalars['Bytes']['input']>;
  previousOwner_gt?: InputMaybe<Scalars['Bytes']['input']>;
  previousOwner_gte?: InputMaybe<Scalars['Bytes']['input']>;
  previousOwner_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  previousOwner_lt?: InputMaybe<Scalars['Bytes']['input']>;
  previousOwner_lte?: InputMaybe<Scalars['Bytes']['input']>;
  previousOwner_not?: InputMaybe<Scalars['Bytes']['input']>;
  previousOwner_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  previousOwner_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultOwnershipTransferred_OrderBy {
  Id = 'id',
  NewOwner = 'newOwner',
  PreviousOwner = 'previousOwner',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type VaultRebalance = {
  __typename?: 'VaultRebalance';
  createdAtTimestamp: Scalars['BigInt']['output'];
  feeAmount0: Scalars['BigInt']['output'];
  feeAmount1: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  lastPrice: Scalars['BigDecimal']['output'];
  sqrtPrice: Scalars['BigInt']['output'];
  tick: Scalars['Int']['output'];
  totalAmount0: Scalars['BigInt']['output'];
  totalAmount1: Scalars['BigInt']['output'];
  totalSupply: Scalars['BigInt']['output'];
  vault: IchiVault;
};

export type VaultRebalance_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VaultRebalance_Filter>>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeAmount0?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeAmount0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeAmount1?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeAmount1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeAmount1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lastPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultRebalance_Filter>>>;
  sqrtPrice?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick?: InputMaybe<Scalars['Int']['input']>;
  tick_gt?: InputMaybe<Scalars['Int']['input']>;
  tick_gte?: InputMaybe<Scalars['Int']['input']>;
  tick_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tick_lt?: InputMaybe<Scalars['Int']['input']>;
  tick_lte?: InputMaybe<Scalars['Int']['input']>;
  tick_not?: InputMaybe<Scalars['Int']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  totalAmount0?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultRebalance_OrderBy {
  CreatedAtTimestamp = 'createdAtTimestamp',
  FeeAmount0 = 'feeAmount0',
  FeeAmount1 = 'feeAmount1',
  Id = 'id',
  LastPrice = 'lastPrice',
  SqrtPrice = 'sqrtPrice',
  Tick = 'tick',
  TotalAmount0 = 'totalAmount0',
  TotalAmount1 = 'totalAmount1',
  TotalSupply = 'totalSupply',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type VaultSetTwapPeriod = {
  __typename?: 'VaultSetTwapPeriod';
  id: Scalars['ID']['output'];
  newTwapPeriod: Scalars['BigInt']['output'];
  sender: Scalars['Bytes']['output'];
  vault: IchiVault;
};

export type VaultSetTwapPeriod_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VaultSetTwapPeriod_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  newTwapPeriod?: InputMaybe<Scalars['BigInt']['input']>;
  newTwapPeriod_gt?: InputMaybe<Scalars['BigInt']['input']>;
  newTwapPeriod_gte?: InputMaybe<Scalars['BigInt']['input']>;
  newTwapPeriod_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  newTwapPeriod_lt?: InputMaybe<Scalars['BigInt']['input']>;
  newTwapPeriod_lte?: InputMaybe<Scalars['BigInt']['input']>;
  newTwapPeriod_not?: InputMaybe<Scalars['BigInt']['input']>;
  newTwapPeriod_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultSetTwapPeriod_Filter>>>;
  sender?: InputMaybe<Scalars['Bytes']['input']>;
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultSetTwapPeriod_OrderBy {
  Id = 'id',
  NewTwapPeriod = 'newTwapPeriod',
  Sender = 'sender',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type VaultShare = {
  __typename?: 'VaultShare';
  id: Scalars['ID']['output'];
  user: Account;
  vault: IchiVault;
  vaultShareBalance: Scalars['BigDecimal']['output'];
};

export type VaultShare_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VaultShare_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultShare_Filter>>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<Account_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vaultShareBalance?: InputMaybe<Scalars['BigDecimal']['input']>;
  vaultShareBalance_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  vaultShareBalance_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  vaultShareBalance_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  vaultShareBalance_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  vaultShareBalance_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  vaultShareBalance_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  vaultShareBalance_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultShare_OrderBy {
  Id = 'id',
  User = 'user',
  UserHoldingPoolCount = 'user__holdingPoolCount',
  UserId = 'user__id',
  UserPlatformTxCount = 'user__platformTxCount',
  UserSwapCount = 'user__swapCount',
  UserTotalSpendUsd = 'user__totalSpendUSD',
  Vault = 'vault',
  VaultShareBalance = 'vaultShareBalance',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type VaultTransfer = {
  __typename?: 'VaultTransfer';
  createdAtTimestamp: Scalars['BigInt']['output'];
  from: Scalars['Bytes']['output'];
  id: Scalars['ID']['output'];
  lastPrice: Scalars['BigDecimal']['output'];
  sqrtPrice: Scalars['BigInt']['output'];
  tick: Scalars['Int']['output'];
  to: Scalars['Bytes']['output'];
  totalAmount0: Scalars['BigInt']['output'];
  totalAmount1: Scalars['BigInt']['output'];
  totalSupply: Scalars['BigInt']['output'];
  value: Scalars['BigInt']['output'];
  vault: IchiVault;
};

export type VaultTransfer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VaultTransfer_Filter>>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  from?: InputMaybe<Scalars['Bytes']['input']>;
  from_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_gt?: InputMaybe<Scalars['Bytes']['input']>;
  from_gte?: InputMaybe<Scalars['Bytes']['input']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  from_lt?: InputMaybe<Scalars['Bytes']['input']>;
  from_lte?: InputMaybe<Scalars['Bytes']['input']>;
  from_not?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lastPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultTransfer_Filter>>>;
  sqrtPrice?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick?: InputMaybe<Scalars['Int']['input']>;
  tick_gt?: InputMaybe<Scalars['Int']['input']>;
  tick_gte?: InputMaybe<Scalars['Int']['input']>;
  tick_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tick_lt?: InputMaybe<Scalars['Int']['input']>;
  tick_lte?: InputMaybe<Scalars['Int']['input']>;
  tick_not?: InputMaybe<Scalars['Int']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  to?: InputMaybe<Scalars['Bytes']['input']>;
  to_contains?: InputMaybe<Scalars['Bytes']['input']>;
  to_gt?: InputMaybe<Scalars['Bytes']['input']>;
  to_gte?: InputMaybe<Scalars['Bytes']['input']>;
  to_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  to_lt?: InputMaybe<Scalars['Bytes']['input']>;
  to_lte?: InputMaybe<Scalars['Bytes']['input']>;
  to_not?: InputMaybe<Scalars['Bytes']['input']>;
  to_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  to_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  totalAmount0?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  value?: InputMaybe<Scalars['BigInt']['input']>;
  value_gt?: InputMaybe<Scalars['BigInt']['input']>;
  value_gte?: InputMaybe<Scalars['BigInt']['input']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  value_lt?: InputMaybe<Scalars['BigInt']['input']>;
  value_lte?: InputMaybe<Scalars['BigInt']['input']>;
  value_not?: InputMaybe<Scalars['BigInt']['input']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultTransfer_OrderBy {
  CreatedAtTimestamp = 'createdAtTimestamp',
  From = 'from',
  Id = 'id',
  LastPrice = 'lastPrice',
  SqrtPrice = 'sqrtPrice',
  Tick = 'tick',
  To = 'to',
  TotalAmount0 = 'totalAmount0',
  TotalAmount1 = 'totalAmount1',
  TotalSupply = 'totalSupply',
  Value = 'value',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type VaultWithdraw = {
  __typename?: 'VaultWithdraw';
  amount0: Scalars['BigInt']['output'];
  amount1: Scalars['BigInt']['output'];
  createdAtTimestamp: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  lastPrice: Scalars['BigDecimal']['output'];
  sender: Scalars['Bytes']['output'];
  shares: Scalars['BigInt']['output'];
  sqrtPrice: Scalars['BigInt']['output'];
  tick: Scalars['Int']['output'];
  to: Scalars['Bytes']['output'];
  totalAmount0: Scalars['BigInt']['output'];
  totalAmount0BeforeEvent: Scalars['BigInt']['output'];
  totalAmount1: Scalars['BigInt']['output'];
  totalAmount1BeforeEvent: Scalars['BigInt']['output'];
  totalSupply: Scalars['BigInt']['output'];
  vault: IchiVault;
};

export type VaultWithdraw_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount0?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount1?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<VaultWithdraw_Filter>>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  lastPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  lastPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  or?: InputMaybe<Array<InputMaybe<VaultWithdraw_Filter>>>;
  sender?: InputMaybe<Scalars['Bytes']['input']>;
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  shares?: InputMaybe<Scalars['BigInt']['input']>;
  shares_gt?: InputMaybe<Scalars['BigInt']['input']>;
  shares_gte?: InputMaybe<Scalars['BigInt']['input']>;
  shares_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  shares_lt?: InputMaybe<Scalars['BigInt']['input']>;
  shares_lte?: InputMaybe<Scalars['BigInt']['input']>;
  shares_not?: InputMaybe<Scalars['BigInt']['input']>;
  shares_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sqrtPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  sqrtPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tick?: InputMaybe<Scalars['Int']['input']>;
  tick_gt?: InputMaybe<Scalars['Int']['input']>;
  tick_gte?: InputMaybe<Scalars['Int']['input']>;
  tick_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tick_lt?: InputMaybe<Scalars['Int']['input']>;
  tick_lte?: InputMaybe<Scalars['Int']['input']>;
  tick_not?: InputMaybe<Scalars['Int']['input']>;
  tick_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  to?: InputMaybe<Scalars['Bytes']['input']>;
  to_contains?: InputMaybe<Scalars['Bytes']['input']>;
  to_gt?: InputMaybe<Scalars['Bytes']['input']>;
  to_gte?: InputMaybe<Scalars['Bytes']['input']>;
  to_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  to_lt?: InputMaybe<Scalars['Bytes']['input']>;
  to_lte?: InputMaybe<Scalars['Bytes']['input']>;
  to_not?: InputMaybe<Scalars['Bytes']['input']>;
  to_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  to_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  totalAmount0?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount0BeforeEvent_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0BeforeEvent_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount0_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount0_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount0_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1BeforeEvent_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1BeforeEvent_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalAmount1_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalAmount1_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<IchiVault_Filter>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum VaultWithdraw_OrderBy {
  Amount0 = 'amount0',
  Amount1 = 'amount1',
  CreatedAtTimestamp = 'createdAtTimestamp',
  Id = 'id',
  LastPrice = 'lastPrice',
  Sender = 'sender',
  Shares = 'shares',
  SqrtPrice = 'sqrtPrice',
  Tick = 'tick',
  To = 'to',
  TotalAmount0 = 'totalAmount0',
  TotalAmount0BeforeEvent = 'totalAmount0BeforeEvent',
  TotalAmount1 = 'totalAmount1',
  TotalAmount1BeforeEvent = 'totalAmount1BeforeEvent',
  TotalSupply = 'totalSupply',
  Vault = 'vault',
  VaultAllowTokenA = 'vault__allowTokenA',
  VaultAllowTokenB = 'vault__allowTokenB',
  VaultCount = 'vault__count',
  VaultCreatedAtTimestamp = 'vault__createdAtTimestamp',
  VaultFeeApr_1d = 'vault__feeApr_1d',
  VaultFeeApr_3d = 'vault__feeApr_3d',
  VaultFeeApr_7d = 'vault__feeApr_7d',
  VaultFeeApr_30d = 'vault__feeApr_30d',
  VaultFeePerSecond0_1d = 'vault__feePerSecond0_1d',
  VaultFeePerSecond0_3d = 'vault__feePerSecond0_3d',
  VaultFeePerSecond0_7d = 'vault__feePerSecond0_7d',
  VaultFeePerSecond0_30d = 'vault__feePerSecond0_30d',
  VaultFeePerSecond1_1d = 'vault__feePerSecond1_1d',
  VaultFeePerSecond1_3d = 'vault__feePerSecond1_3d',
  VaultFeePerSecond1_7d = 'vault__feePerSecond1_7d',
  VaultFeePerSecond1_30d = 'vault__feePerSecond1_30d',
  VaultHoldersCount = 'vault__holdersCount',
  VaultId = 'vault__id',
  VaultLastFeeUpdate = 'vault__lastFeeUpdate',
  VaultLastPrice = 'vault__lastPrice',
  VaultLastPriceTimestamp = 'vault__lastPriceTimestamp',
  VaultSearchString = 'vault__searchString',
  VaultSender = 'vault__sender',
  VaultTokenA = 'vault__tokenA',
  VaultTokenB = 'vault__tokenB',
  VaultTotalAmount0 = 'vault__totalAmount0',
  VaultTotalAmount1 = 'vault__totalAmount1',
  VaultTotalShares = 'vault__totalShares',
  VaultTotalSupply = 'vault__totalSupply'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>;
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type AllAccountsQueryVariables = Exact<{
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
}>;


export type AllAccountsQuery = { __typename?: 'Query', accounts: Array<{ __typename?: 'Account', id: string, swapCount: any, platformTxCount: any, holdingPoolCount: any, totalSpendUSD: any, vaultShares?: Array<{ __typename?: 'VaultShare', id: string, vaultShareBalance: any, vault: { __typename?: 'IchiVault', id: string } }> | null }> };

export type SingleAccountDetailsQueryVariables = Exact<{
  accountId: Scalars['ID']['input'];
}>;


export type SingleAccountDetailsQuery = { __typename?: 'Query', account?: { __typename?: 'Account', id: string, swapCount: any, platformTxCount: any, holdingPoolCount: any, totalSpendUSD: any, vaultShares?: Array<{ __typename?: 'VaultShare', id: string, vaultShareBalance: any, vault: { __typename?: 'IchiVault', id: string } }> | null } | null };

export type AccountFieldFragment = { __typename?: 'Account', id: string, swapCount: any, platformTxCount: any, holdingPoolCount: any, totalSpendUSD: any, vaultShares?: Array<{ __typename?: 'VaultShare', id: string, vaultShareBalance: any, vault: { __typename?: 'IchiVault', id: string } }> | null };

export type VaultShareFieldFragment = { __typename?: 'VaultShare', id: string, vaultShareBalance: any, vault: { __typename?: 'IchiVault', id: string } };

export type AlgebraVaultFieldFragment = { __typename?: 'IchiVault', id: string };

export type TokenFieldFragment = { __typename?: 'Token', id: string, symbol: string, derivedUSD: any };

export type EternalFarmingsQueryVariables = Exact<{
  pool?: InputMaybe<Scalars['Bytes']['input']>;
}>;


export type EternalFarmingsQuery = { __typename?: 'Query', eternalFarmings: Array<{ __typename?: 'EternalFarming', id: string, reward: any, bonusReward: any, rewardRate: any, bonusRewardRate: any, rewardToken: any, bonusRewardToken: any, isDeactivated?: boolean | null, nonce: any, minRangeLength: any, virtualPool: any, pool: any }> };

export type DepositsQueryVariables = Exact<{
  owner?: InputMaybe<Scalars['Bytes']['input']>;
  pool?: InputMaybe<Scalars['Bytes']['input']>;
}>;


export type DepositsQuery = { __typename?: 'Query', deposits: Array<{ __typename?: 'Deposit', eternalFarming?: any | null, id: string, liquidity: any, owner: any, pool: any, rangeLength: any }> };

export type ActiveFarmingsQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveFarmingsQuery = { __typename?: 'Query', eternalFarmings: Array<{ __typename?: 'EternalFarming', pool: any, id: string }> };

export type BundleFieldsFragment = { __typename?: 'Bundle', id: string, maticPriceUSD: any };

export type NativePriceQueryVariables = Exact<{ [key: string]: never; }>;


export type NativePriceQuery = { __typename?: 'Query', bundles: Array<{ __typename?: 'Bundle', id: string, maticPriceUSD: any }> };

export type DexAccountCountQueryVariables = Exact<{ [key: string]: never; }>;


export type DexAccountCountQuery = { __typename?: 'Query', factories: Array<{ __typename?: 'Factory', id: string, accountCount: any }> };

export type PoolFieldsFragment = { __typename?: 'Pool', id: string, fee: any, sqrtPrice: any, liquidity: any, tick: any, tickSpacing: any, totalValueLockedUSD: any, volumeUSD: any, feesUSD: any, untrackedFeesUSD: any, token0Price: any, token1Price: any, txCount: any, createdAtTimestamp: any, aprPercentage: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } };

export type TickFieldsFragment = { __typename?: 'Tick', tickIdx: any, liquidityNet: any, liquidityGross: any, price0: any, price1: any, feesUSD: any, volumeUSD: any };

export type PoolsListQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type PoolsListQuery = { __typename?: 'Query', pools: Array<{ __typename?: 'Pool', id: string, fee: any, sqrtPrice: any, liquidity: any, tick: any, tickSpacing: any, totalValueLockedUSD: any, volumeUSD: any, feesUSD: any, untrackedFeesUSD: any, token0Price: any, token1Price: any, txCount: any, createdAtTimestamp: any, aprPercentage: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } }> };

export type AllTicksQueryVariables = Exact<{
  poolAddress: Scalars['String']['input'];
  skip: Scalars['Int']['input'];
}>;


export type AllTicksQuery = { __typename?: 'Query', ticks: Array<{ __typename?: 'Tick', tickIdx: any, liquidityNet: any, liquidityGross: any, price0: any, price1: any, feesUSD: any, volumeUSD: any }> };

export type SinglePoolQueryVariables = Exact<{
  poolId: Scalars['ID']['input'];
}>;


export type SinglePoolQuery = { __typename?: 'Query', pool?: { __typename?: 'Pool', id: string, fee: any, sqrtPrice: any, liquidity: any, tick: any, tickSpacing: any, totalValueLockedUSD: any, volumeUSD: any, feesUSD: any, untrackedFeesUSD: any, token0Price: any, token1Price: any, txCount: any, createdAtTimestamp: any, aprPercentage: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } } | null };

export type MultiplePoolsQueryVariables = Exact<{
  poolIds?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type MultiplePoolsQuery = { __typename?: 'Query', pools: Array<{ __typename?: 'Pool', id: string, fee: any, sqrtPrice: any, liquidity: any, tick: any, tickSpacing: any, totalValueLockedUSD: any, volumeUSD: any, feesUSD: any, untrackedFeesUSD: any, token0Price: any, token1Price: any, txCount: any, createdAtTimestamp: any, aprPercentage: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } }> };

export type PoolsByTokenPairQueryVariables = Exact<{
  token0: Scalars['ID']['input'];
  token1: Scalars['ID']['input'];
}>;


export type PoolsByTokenPairQuery = { __typename?: 'Query', pools: Array<{ __typename?: 'Pool', id: string, fee: any, sqrtPrice: any, liquidity: any, tick: any, tickSpacing: any, totalValueLockedUSD: any, volumeUSD: any, feesUSD: any, untrackedFeesUSD: any, token0Price: any, token1Price: any, txCount: any, createdAtTimestamp: any, aprPercentage: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } }> };

export type LiquidatorDataQueryVariables = Exact<{
  account: Scalars['String']['input'];
}>;


export type LiquidatorDataQuery = { __typename?: 'Query', liquidatorDatas: Array<{ __typename?: 'LiquidatorData', id: string, totalLiquidityUsd: any, pool: { __typename?: 'Pool', id: string, fee: any, sqrtPrice: any, liquidity: any, tick: any, tickSpacing: any, totalValueLockedUSD: any, volumeUSD: any, feesUSD: any, untrackedFeesUSD: any, token0Price: any, token1Price: any, txCount: any, createdAtTimestamp: any, aprPercentage: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } } }> };

export type LiquidatorDataFieldsFragment = { __typename?: 'LiquidatorData', id: string, totalLiquidityUsd: any, pool: { __typename?: 'Pool', id: string, fee: any, sqrtPrice: any, liquidity: any, tick: any, tickSpacing: any, totalValueLockedUSD: any, volumeUSD: any, feesUSD: any, untrackedFeesUSD: any, token0Price: any, token1Price: any, txCount: any, createdAtTimestamp: any, aprPercentage: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } } };

export type UserPositionsQueryVariables = Exact<{
  account: Scalars['Bytes']['input'];
}>;


export type UserPositionsQuery = { __typename?: 'Query', positions: Array<{ __typename?: 'Position', id: string, owner: any, liquidity: any, depositedToken0: any, depositedToken1: any, withdrawnToken0: any, withdrawnToken1: any, pool: { __typename?: 'Pool', id: string, fee: any, sqrtPrice: any, liquidity: any, tick: any, tickSpacing: any, totalValueLockedUSD: any, volumeUSD: any, feesUSD: any, untrackedFeesUSD: any, token0Price: any, token1Price: any, txCount: any, createdAtTimestamp: any, aprPercentage: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } }, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, tickLower: { __typename?: 'Tick', tickIdx: any, liquidityNet: any, liquidityGross: any, price0: any, price1: any, feesUSD: any, volumeUSD: any }, tickUpper: { __typename?: 'Tick', tickIdx: any, liquidityNet: any, liquidityGross: any, price0: any, price1: any, feesUSD: any, volumeUSD: any } }> };

export type UserActivePositionsQueryVariables = Exact<{
  account: Scalars['Bytes']['input'];
}>;


export type UserActivePositionsQuery = { __typename?: 'Query', positions: Array<{ __typename?: 'Position', id: string, owner: any, liquidity: any, depositedToken0: any, depositedToken1: any, withdrawnToken0: any, withdrawnToken1: any, pool: { __typename?: 'Pool', id: string, fee: any, sqrtPrice: any, liquidity: any, tick: any, tickSpacing: any, totalValueLockedUSD: any, volumeUSD: any, feesUSD: any, untrackedFeesUSD: any, token0Price: any, token1Price: any, txCount: any, createdAtTimestamp: any, aprPercentage: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } }, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, tickLower: { __typename?: 'Tick', tickIdx: any, liquidityNet: any, liquidityGross: any, price0: any, price1: any, feesUSD: any, volumeUSD: any }, tickUpper: { __typename?: 'Tick', tickIdx: any, liquidityNet: any, liquidityGross: any, price0: any, price1: any, feesUSD: any, volumeUSD: any } }> };

export type TopPoolPositionsQueryVariables = Exact<{
  poolId: Scalars['String']['input'];
  orderBy?: InputMaybe<Position_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type TopPoolPositionsQuery = { __typename?: 'Query', positions: Array<{ __typename?: 'Position', id: string, owner: any, liquidity: any, depositedToken0: any, depositedToken1: any, withdrawnToken0: any, withdrawnToken1: any, pool: { __typename?: 'Pool', id: string, fee: any, sqrtPrice: any, liquidity: any, tick: any, tickSpacing: any, totalValueLockedUSD: any, volumeUSD: any, feesUSD: any, untrackedFeesUSD: any, token0Price: any, token1Price: any, txCount: any, createdAtTimestamp: any, aprPercentage: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } }, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, tickLower: { __typename?: 'Tick', tickIdx: any, liquidityNet: any, liquidityGross: any, price0: any, price1: any, feesUSD: any, volumeUSD: any }, tickUpper: { __typename?: 'Tick', tickIdx: any, liquidityNet: any, liquidityGross: any, price0: any, price1: any, feesUSD: any, volumeUSD: any } }> };

export type PositionFieldsFragment = { __typename?: 'Position', id: string, owner: any, liquidity: any, depositedToken0: any, depositedToken1: any, withdrawnToken0: any, withdrawnToken1: any, pool: { __typename?: 'Pool', id: string, fee: any, sqrtPrice: any, liquidity: any, tick: any, tickSpacing: any, totalValueLockedUSD: any, volumeUSD: any, feesUSD: any, untrackedFeesUSD: any, token0Price: any, token1Price: any, txCount: any, createdAtTimestamp: any, aprPercentage: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } }, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }, tickLower: { __typename?: 'Tick', tickIdx: any, liquidityNet: any, liquidityGross: any, price0: any, price1: any, feesUSD: any, volumeUSD: any }, tickUpper: { __typename?: 'Tick', tickIdx: any, liquidityNet: any, liquidityGross: any, price0: any, price1: any, feesUSD: any, volumeUSD: any } };

export type TokenFieldsFragment = { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any };

export type MultipleTokensQueryVariables = Exact<{
  tokenIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type MultipleTokensQuery = { __typename?: 'Query', tokens: Array<{ __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }> };

export type SingleTokenQueryVariables = Exact<{
  tokenId: Scalars['ID']['input'];
}>;


export type SingleTokenQuery = { __typename?: 'Query', token?: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any } | null };

export type TokenTop10HoldersQueryVariables = Exact<{
  tokenId: Scalars['ID']['input'];
}>;


export type TokenTop10HoldersQuery = { __typename?: 'Query', token?: { __typename?: 'Token', id: string, symbol: string } | null };

export type AllTokensQueryVariables = Exact<{ [key: string]: never; }>;


export type AllTokensQuery = { __typename?: 'Query', tokens: Array<{ __typename?: 'Token', id: string, symbol: string, name: string, decimals: any, derivedMatic: any, derivedUSD: any, initialUSD: any, txCount: any, totalSupply: any, volumeUSD: any, totalValueLockedUSD: any, marketCap: any, poolCount: any, priceChange24hPercentage: any }> };

export type VaultsSortedByHoldersQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type VaultsSortedByHoldersQuery = { __typename?: 'Query', ichiVaults: Array<{ __typename?: 'IchiVault', id: string, sender: any, tokenA: any, allowTokenA: boolean, tokenB: any, allowTokenB: boolean, count: any, createdAtTimestamp: any, holdersCount: number, totalShares: any, pool: { __typename?: 'Pool', id: string, totalValueLockedUSD: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any } } }> };

export type AccountVaultSharesQueryVariables = Exact<{
  AccountId: Scalars['ID']['input'];
}>;


export type AccountVaultSharesQuery = { __typename?: 'Query', vaultShares: Array<{ __typename?: 'VaultShare', id: string, vaultShareBalance: any, vault: { __typename?: 'IchiVault', id: string, sender: any, tokenA: any, allowTokenA: boolean, tokenB: any, allowTokenB: boolean, count: any, createdAtTimestamp: any, holdersCount: number, totalShares: any, pool: { __typename?: 'Pool', id: string, totalValueLockedUSD: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any } } } }> };

export type VaultUserFieldFragment = { __typename?: 'Account', id: string };

export type VaultSharesFieldFragment = { __typename?: 'VaultShare', id: string, vaultShareBalance: any, vault: { __typename?: 'IchiVault', id: string, sender: any, tokenA: any, allowTokenA: boolean, tokenB: any, allowTokenB: boolean, count: any, createdAtTimestamp: any, holdersCount: number, totalShares: any, pool: { __typename?: 'Pool', id: string, totalValueLockedUSD: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any } } } };

export type VaultFieldFragment = { __typename?: 'IchiVault', id: string, sender: any, tokenA: any, allowTokenA: boolean, tokenB: any, allowTokenB: boolean, count: any, createdAtTimestamp: any, holdersCount: number, totalShares: any, pool: { __typename?: 'Pool', id: string, totalValueLockedUSD: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any } } };

export type PoolFieldFragment = { __typename?: 'Pool', id: string, totalValueLockedUSD: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any } };

export type SingleVaultDetailsQueryVariables = Exact<{
  vaultId: Scalars['ID']['input'];
}>;


export type SingleVaultDetailsQuery = { __typename?: 'Query', ichiVault?: { __typename?: 'IchiVault', id: string, sender: any, tokenA: any, allowTokenA: boolean, tokenB: any, allowTokenB: boolean, count: any, createdAtTimestamp: any, holdersCount: number, totalShares: any, vaultShares: Array<{ __typename?: 'VaultShare', id: string, vaultShareBalance: any }>, vaultDeposits: Array<{ __typename?: 'VaultDeposit', id: string, createdAtTimestamp: any, amount0: any, amount1: any, shares: any, to: any }>, vaultWithdraws: Array<{ __typename?: 'VaultWithdraw', id: string, createdAtTimestamp: any, amount0: any, amount1: any, shares: any, to: any }>, vaultCollectFees: Array<{ __typename?: 'VaultCollectFee', id: string, createdAtTimestamp: any, feeAmount0: any, feeAmount1: any, sender: any }>, pool: { __typename?: 'Pool', id: string, totalValueLockedUSD: any, token0: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any }, token1: { __typename?: 'Token', id: string, symbol: string, name: string, decimals: any } } } | null };

export const AlgebraVaultFieldFragmentDoc = gql`
    fragment AlgebraVaultField on IchiVault {
  id
}
    `;
export const VaultShareFieldFragmentDoc = gql`
    fragment VaultShareField on VaultShare {
  id
  vaultShareBalance
  vault {
    ...AlgebraVaultField
  }
}
    ${AlgebraVaultFieldFragmentDoc}`;
export const AccountFieldFragmentDoc = gql`
    fragment AccountField on Account {
  id
  swapCount
  platformTxCount
  holdingPoolCount
  totalSpendUSD
  vaultShares {
    ...VaultShareField
  }
}
    ${VaultShareFieldFragmentDoc}`;
export const TokenFieldFragmentDoc = gql`
    fragment TokenField on Token {
  id
  symbol
  derivedUSD
}
    `;
export const BundleFieldsFragmentDoc = gql`
    fragment BundleFields on Bundle {
  id
  maticPriceUSD
}
    `;
export const TokenFieldsFragmentDoc = gql`
    fragment TokenFields on Token {
  id
  symbol
  name
  decimals
  derivedMatic
  derivedUSD
  initialUSD
  txCount
  totalSupply
  volumeUSD
  totalValueLockedUSD
  marketCap
  poolCount
  priceChange24hPercentage
}
    `;
export const PoolFieldsFragmentDoc = gql`
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
    ${TokenFieldsFragmentDoc}`;
export const LiquidatorDataFieldsFragmentDoc = gql`
    fragment LiquidatorDataFields on LiquidatorData {
  id
  totalLiquidityUsd
  pool {
    ...PoolFields
  }
}
    ${PoolFieldsFragmentDoc}`;
export const TickFieldsFragmentDoc = gql`
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
export const PositionFieldsFragmentDoc = gql`
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
    ${PoolFieldsFragmentDoc}
${TokenFieldsFragmentDoc}
${TickFieldsFragmentDoc}`;
export const VaultUserFieldFragmentDoc = gql`
    fragment VaultUserField on Account {
  id
}
    `;
export const PoolFieldFragmentDoc = gql`
    fragment PoolField on Pool {
  id
  totalValueLockedUSD
  token0 {
    id
    symbol
    name
    decimals
  }
  token1 {
    id
    symbol
    name
    decimals
  }
}
    `;
export const VaultFieldFragmentDoc = gql`
    fragment VaultField on IchiVault {
  id
  sender
  tokenA
  allowTokenA
  tokenB
  allowTokenB
  count
  createdAtTimestamp
  holdersCount
  totalShares
  pool {
    ...PoolField
  }
}
    ${PoolFieldFragmentDoc}`;
export const VaultSharesFieldFragmentDoc = gql`
    fragment VaultSharesField on VaultShare {
  id
  vault {
    ...VaultField
  }
  vaultShareBalance
}
    ${VaultFieldFragmentDoc}`;
export const AllAccountsDocument = gql`
    query AllAccounts($orderBy: Account_orderBy, $orderDirection: OrderDirection, $skip: Int, $first: Int, $address: String) {
  accounts(
    first: $first
    orderBy: $orderBy
    orderDirection: $orderDirection
    skip: $skip
  ) {
    ...AccountField
  }
}
    ${AccountFieldFragmentDoc}`;

/**
 * __useAllAccountsQuery__
 *
 * To run a query within a React component, call `useAllAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllAccountsQuery({
 *   variables: {
 *      orderBy: // value for 'orderBy'
 *      orderDirection: // value for 'orderDirection'
 *      skip: // value for 'skip'
 *      first: // value for 'first'
 *      address: // value for 'address'
 *   },
 * });
 */
export function useAllAccountsQuery(baseOptions?: Apollo.QueryHookOptions<AllAccountsQuery, AllAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllAccountsQuery, AllAccountsQueryVariables>(AllAccountsDocument, options);
      }
export function useAllAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllAccountsQuery, AllAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllAccountsQuery, AllAccountsQueryVariables>(AllAccountsDocument, options);
        }
// @ts-ignore
export function useAllAccountsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AllAccountsQuery, AllAccountsQueryVariables>): Apollo.UseSuspenseQueryResult<AllAccountsQuery, AllAccountsQueryVariables>;
export function useAllAccountsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllAccountsQuery, AllAccountsQueryVariables>): Apollo.UseSuspenseQueryResult<AllAccountsQuery | undefined, AllAccountsQueryVariables>;
export function useAllAccountsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllAccountsQuery, AllAccountsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AllAccountsQuery, AllAccountsQueryVariables>(AllAccountsDocument, options);
        }
export type AllAccountsQueryHookResult = ReturnType<typeof useAllAccountsQuery>;
export type AllAccountsLazyQueryHookResult = ReturnType<typeof useAllAccountsLazyQuery>;
export type AllAccountsSuspenseQueryHookResult = ReturnType<typeof useAllAccountsSuspenseQuery>;
export type AllAccountsQueryResult = Apollo.QueryResult<AllAccountsQuery, AllAccountsQueryVariables>;
export const SingleAccountDetailsDocument = gql`
    query SingleAccountDetails($accountId: ID!) {
  account(id: $accountId) {
    ...AccountField
  }
}
    ${AccountFieldFragmentDoc}`;

/**
 * __useSingleAccountDetailsQuery__
 *
 * To run a query within a React component, call `useSingleAccountDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSingleAccountDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSingleAccountDetailsQuery({
 *   variables: {
 *      accountId: // value for 'accountId'
 *   },
 * });
 */
export function useSingleAccountDetailsQuery(baseOptions: Apollo.QueryHookOptions<SingleAccountDetailsQuery, SingleAccountDetailsQueryVariables> & ({ variables: SingleAccountDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SingleAccountDetailsQuery, SingleAccountDetailsQueryVariables>(SingleAccountDetailsDocument, options);
      }
export function useSingleAccountDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SingleAccountDetailsQuery, SingleAccountDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SingleAccountDetailsQuery, SingleAccountDetailsQueryVariables>(SingleAccountDetailsDocument, options);
        }
// @ts-ignore
export function useSingleAccountDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SingleAccountDetailsQuery, SingleAccountDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<SingleAccountDetailsQuery, SingleAccountDetailsQueryVariables>;
export function useSingleAccountDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SingleAccountDetailsQuery, SingleAccountDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<SingleAccountDetailsQuery | undefined, SingleAccountDetailsQueryVariables>;
export function useSingleAccountDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SingleAccountDetailsQuery, SingleAccountDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SingleAccountDetailsQuery, SingleAccountDetailsQueryVariables>(SingleAccountDetailsDocument, options);
        }
export type SingleAccountDetailsQueryHookResult = ReturnType<typeof useSingleAccountDetailsQuery>;
export type SingleAccountDetailsLazyQueryHookResult = ReturnType<typeof useSingleAccountDetailsLazyQuery>;
export type SingleAccountDetailsSuspenseQueryHookResult = ReturnType<typeof useSingleAccountDetailsSuspenseQuery>;
export type SingleAccountDetailsQueryResult = Apollo.QueryResult<SingleAccountDetailsQuery, SingleAccountDetailsQueryVariables>;
export const EternalFarmingsDocument = gql`
    query EternalFarmings($pool: Bytes) {
  eternalFarmings(where: {pool: $pool}) {
    id
    reward
    bonusReward
    rewardRate
    bonusRewardRate
    rewardToken
    bonusRewardToken
    isDeactivated
    nonce
    minRangeLength
    virtualPool
    pool
  }
}
    `;

/**
 * __useEternalFarmingsQuery__
 *
 * To run a query within a React component, call `useEternalFarmingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEternalFarmingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEternalFarmingsQuery({
 *   variables: {
 *      pool: // value for 'pool'
 *   },
 * });
 */
export function useEternalFarmingsQuery(baseOptions?: Apollo.QueryHookOptions<EternalFarmingsQuery, EternalFarmingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EternalFarmingsQuery, EternalFarmingsQueryVariables>(EternalFarmingsDocument, options);
      }
export function useEternalFarmingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EternalFarmingsQuery, EternalFarmingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EternalFarmingsQuery, EternalFarmingsQueryVariables>(EternalFarmingsDocument, options);
        }
// @ts-ignore
export function useEternalFarmingsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<EternalFarmingsQuery, EternalFarmingsQueryVariables>): Apollo.UseSuspenseQueryResult<EternalFarmingsQuery, EternalFarmingsQueryVariables>;
export function useEternalFarmingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<EternalFarmingsQuery, EternalFarmingsQueryVariables>): Apollo.UseSuspenseQueryResult<EternalFarmingsQuery | undefined, EternalFarmingsQueryVariables>;
export function useEternalFarmingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<EternalFarmingsQuery, EternalFarmingsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<EternalFarmingsQuery, EternalFarmingsQueryVariables>(EternalFarmingsDocument, options);
        }
export type EternalFarmingsQueryHookResult = ReturnType<typeof useEternalFarmingsQuery>;
export type EternalFarmingsLazyQueryHookResult = ReturnType<typeof useEternalFarmingsLazyQuery>;
export type EternalFarmingsSuspenseQueryHookResult = ReturnType<typeof useEternalFarmingsSuspenseQuery>;
export type EternalFarmingsQueryResult = Apollo.QueryResult<EternalFarmingsQuery, EternalFarmingsQueryVariables>;
export const DepositsDocument = gql`
    query Deposits($owner: Bytes, $pool: Bytes) {
  deposits(where: {owner: $owner, pool: $pool}) {
    eternalFarming
    id
    liquidity
    owner
    pool
    rangeLength
  }
}
    `;

/**
 * __useDepositsQuery__
 *
 * To run a query within a React component, call `useDepositsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDepositsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDepositsQuery({
 *   variables: {
 *      owner: // value for 'owner'
 *      pool: // value for 'pool'
 *   },
 * });
 */
export function useDepositsQuery(baseOptions?: Apollo.QueryHookOptions<DepositsQuery, DepositsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DepositsQuery, DepositsQueryVariables>(DepositsDocument, options);
      }
export function useDepositsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DepositsQuery, DepositsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DepositsQuery, DepositsQueryVariables>(DepositsDocument, options);
        }
// @ts-ignore
export function useDepositsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<DepositsQuery, DepositsQueryVariables>): Apollo.UseSuspenseQueryResult<DepositsQuery, DepositsQueryVariables>;
export function useDepositsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DepositsQuery, DepositsQueryVariables>): Apollo.UseSuspenseQueryResult<DepositsQuery | undefined, DepositsQueryVariables>;
export function useDepositsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DepositsQuery, DepositsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DepositsQuery, DepositsQueryVariables>(DepositsDocument, options);
        }
export type DepositsQueryHookResult = ReturnType<typeof useDepositsQuery>;
export type DepositsLazyQueryHookResult = ReturnType<typeof useDepositsLazyQuery>;
export type DepositsSuspenseQueryHookResult = ReturnType<typeof useDepositsSuspenseQuery>;
export type DepositsQueryResult = Apollo.QueryResult<DepositsQuery, DepositsQueryVariables>;
export const ActiveFarmingsDocument = gql`
    query ActiveFarmings {
  eternalFarmings(where: {isDeactivated: false}) {
    pool
    id
  }
}
    `;

/**
 * __useActiveFarmingsQuery__
 *
 * To run a query within a React component, call `useActiveFarmingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useActiveFarmingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useActiveFarmingsQuery({
 *   variables: {
 *   },
 * });
 */
export function useActiveFarmingsQuery(baseOptions?: Apollo.QueryHookOptions<ActiveFarmingsQuery, ActiveFarmingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ActiveFarmingsQuery, ActiveFarmingsQueryVariables>(ActiveFarmingsDocument, options);
      }
export function useActiveFarmingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ActiveFarmingsQuery, ActiveFarmingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ActiveFarmingsQuery, ActiveFarmingsQueryVariables>(ActiveFarmingsDocument, options);
        }
// @ts-ignore
export function useActiveFarmingsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ActiveFarmingsQuery, ActiveFarmingsQueryVariables>): Apollo.UseSuspenseQueryResult<ActiveFarmingsQuery, ActiveFarmingsQueryVariables>;
export function useActiveFarmingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ActiveFarmingsQuery, ActiveFarmingsQueryVariables>): Apollo.UseSuspenseQueryResult<ActiveFarmingsQuery | undefined, ActiveFarmingsQueryVariables>;
export function useActiveFarmingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ActiveFarmingsQuery, ActiveFarmingsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ActiveFarmingsQuery, ActiveFarmingsQueryVariables>(ActiveFarmingsDocument, options);
        }
export type ActiveFarmingsQueryHookResult = ReturnType<typeof useActiveFarmingsQuery>;
export type ActiveFarmingsLazyQueryHookResult = ReturnType<typeof useActiveFarmingsLazyQuery>;
export type ActiveFarmingsSuspenseQueryHookResult = ReturnType<typeof useActiveFarmingsSuspenseQuery>;
export type ActiveFarmingsQueryResult = Apollo.QueryResult<ActiveFarmingsQuery, ActiveFarmingsQueryVariables>;
export const NativePriceDocument = gql`
    query NativePrice {
  bundles {
    ...BundleFields
  }
}
    ${BundleFieldsFragmentDoc}`;

/**
 * __useNativePriceQuery__
 *
 * To run a query within a React component, call `useNativePriceQuery` and pass it any options that fit your needs.
 * When your component renders, `useNativePriceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNativePriceQuery({
 *   variables: {
 *   },
 * });
 */
export function useNativePriceQuery(baseOptions?: Apollo.QueryHookOptions<NativePriceQuery, NativePriceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<NativePriceQuery, NativePriceQueryVariables>(NativePriceDocument, options);
      }
export function useNativePriceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<NativePriceQuery, NativePriceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<NativePriceQuery, NativePriceQueryVariables>(NativePriceDocument, options);
        }
// @ts-ignore
export function useNativePriceSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<NativePriceQuery, NativePriceQueryVariables>): Apollo.UseSuspenseQueryResult<NativePriceQuery, NativePriceQueryVariables>;
export function useNativePriceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<NativePriceQuery, NativePriceQueryVariables>): Apollo.UseSuspenseQueryResult<NativePriceQuery | undefined, NativePriceQueryVariables>;
export function useNativePriceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<NativePriceQuery, NativePriceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<NativePriceQuery, NativePriceQueryVariables>(NativePriceDocument, options);
        }
export type NativePriceQueryHookResult = ReturnType<typeof useNativePriceQuery>;
export type NativePriceLazyQueryHookResult = ReturnType<typeof useNativePriceLazyQuery>;
export type NativePriceSuspenseQueryHookResult = ReturnType<typeof useNativePriceSuspenseQuery>;
export type NativePriceQueryResult = Apollo.QueryResult<NativePriceQuery, NativePriceQueryVariables>;
export const DexAccountCountDocument = gql`
    query DexAccountCount {
  factories {
    id
    accountCount
  }
}
    `;

/**
 * __useDexAccountCountQuery__
 *
 * To run a query within a React component, call `useDexAccountCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useDexAccountCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDexAccountCountQuery({
 *   variables: {
 *   },
 * });
 */
export function useDexAccountCountQuery(baseOptions?: Apollo.QueryHookOptions<DexAccountCountQuery, DexAccountCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DexAccountCountQuery, DexAccountCountQueryVariables>(DexAccountCountDocument, options);
      }
export function useDexAccountCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DexAccountCountQuery, DexAccountCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DexAccountCountQuery, DexAccountCountQueryVariables>(DexAccountCountDocument, options);
        }
// @ts-ignore
export function useDexAccountCountSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<DexAccountCountQuery, DexAccountCountQueryVariables>): Apollo.UseSuspenseQueryResult<DexAccountCountQuery, DexAccountCountQueryVariables>;
export function useDexAccountCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DexAccountCountQuery, DexAccountCountQueryVariables>): Apollo.UseSuspenseQueryResult<DexAccountCountQuery | undefined, DexAccountCountQueryVariables>;
export function useDexAccountCountSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DexAccountCountQuery, DexAccountCountQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DexAccountCountQuery, DexAccountCountQueryVariables>(DexAccountCountDocument, options);
        }
export type DexAccountCountQueryHookResult = ReturnType<typeof useDexAccountCountQuery>;
export type DexAccountCountLazyQueryHookResult = ReturnType<typeof useDexAccountCountLazyQuery>;
export type DexAccountCountSuspenseQueryHookResult = ReturnType<typeof useDexAccountCountSuspenseQuery>;
export type DexAccountCountQueryResult = Apollo.QueryResult<DexAccountCountQuery, DexAccountCountQueryVariables>;
export const PoolsListDocument = gql`
    query PoolsList($search: String) {
  pools(
    where: {searchString_contains_nocase: $search, liquidity_gt: 0}
    orderBy: totalValueLockedUSD
    orderDirection: desc
    first: 100
  ) {
    ...PoolFields
  }
}
    ${PoolFieldsFragmentDoc}`;

/**
 * __usePoolsListQuery__
 *
 * To run a query within a React component, call `usePoolsListQuery` and pass it any options that fit your needs.
 * When your component renders, `usePoolsListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePoolsListQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function usePoolsListQuery(baseOptions?: Apollo.QueryHookOptions<PoolsListQuery, PoolsListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PoolsListQuery, PoolsListQueryVariables>(PoolsListDocument, options);
      }
export function usePoolsListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PoolsListQuery, PoolsListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PoolsListQuery, PoolsListQueryVariables>(PoolsListDocument, options);
        }
// @ts-ignore
export function usePoolsListSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<PoolsListQuery, PoolsListQueryVariables>): Apollo.UseSuspenseQueryResult<PoolsListQuery, PoolsListQueryVariables>;
export function usePoolsListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PoolsListQuery, PoolsListQueryVariables>): Apollo.UseSuspenseQueryResult<PoolsListQuery | undefined, PoolsListQueryVariables>;
export function usePoolsListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PoolsListQuery, PoolsListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PoolsListQuery, PoolsListQueryVariables>(PoolsListDocument, options);
        }
export type PoolsListQueryHookResult = ReturnType<typeof usePoolsListQuery>;
export type PoolsListLazyQueryHookResult = ReturnType<typeof usePoolsListLazyQuery>;
export type PoolsListSuspenseQueryHookResult = ReturnType<typeof usePoolsListSuspenseQuery>;
export type PoolsListQueryResult = Apollo.QueryResult<PoolsListQuery, PoolsListQueryVariables>;
export const AllTicksDocument = gql`
    query allTicks($poolAddress: String!, $skip: Int!) {
  ticks(
    first: 1000
    skip: $skip
    where: {poolAddress: $poolAddress}
    orderBy: tickIdx
  ) {
    ...TickFields
  }
}
    ${TickFieldsFragmentDoc}`;

/**
 * __useAllTicksQuery__
 *
 * To run a query within a React component, call `useAllTicksQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllTicksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllTicksQuery({
 *   variables: {
 *      poolAddress: // value for 'poolAddress'
 *      skip: // value for 'skip'
 *   },
 * });
 */
export function useAllTicksQuery(baseOptions: Apollo.QueryHookOptions<AllTicksQuery, AllTicksQueryVariables> & ({ variables: AllTicksQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllTicksQuery, AllTicksQueryVariables>(AllTicksDocument, options);
      }
export function useAllTicksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllTicksQuery, AllTicksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllTicksQuery, AllTicksQueryVariables>(AllTicksDocument, options);
        }
// @ts-ignore
export function useAllTicksSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AllTicksQuery, AllTicksQueryVariables>): Apollo.UseSuspenseQueryResult<AllTicksQuery, AllTicksQueryVariables>;
export function useAllTicksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllTicksQuery, AllTicksQueryVariables>): Apollo.UseSuspenseQueryResult<AllTicksQuery | undefined, AllTicksQueryVariables>;
export function useAllTicksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllTicksQuery, AllTicksQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AllTicksQuery, AllTicksQueryVariables>(AllTicksDocument, options);
        }
export type AllTicksQueryHookResult = ReturnType<typeof useAllTicksQuery>;
export type AllTicksLazyQueryHookResult = ReturnType<typeof useAllTicksLazyQuery>;
export type AllTicksSuspenseQueryHookResult = ReturnType<typeof useAllTicksSuspenseQuery>;
export type AllTicksQueryResult = Apollo.QueryResult<AllTicksQuery, AllTicksQueryVariables>;
export const SinglePoolDocument = gql`
    query SinglePool($poolId: ID!) {
  pool(id: $poolId) {
    ...PoolFields
  }
}
    ${PoolFieldsFragmentDoc}`;

/**
 * __useSinglePoolQuery__
 *
 * To run a query within a React component, call `useSinglePoolQuery` and pass it any options that fit your needs.
 * When your component renders, `useSinglePoolQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSinglePoolQuery({
 *   variables: {
 *      poolId: // value for 'poolId'
 *   },
 * });
 */
export function useSinglePoolQuery(baseOptions: Apollo.QueryHookOptions<SinglePoolQuery, SinglePoolQueryVariables> & ({ variables: SinglePoolQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SinglePoolQuery, SinglePoolQueryVariables>(SinglePoolDocument, options);
      }
export function useSinglePoolLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SinglePoolQuery, SinglePoolQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SinglePoolQuery, SinglePoolQueryVariables>(SinglePoolDocument, options);
        }
// @ts-ignore
export function useSinglePoolSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SinglePoolQuery, SinglePoolQueryVariables>): Apollo.UseSuspenseQueryResult<SinglePoolQuery, SinglePoolQueryVariables>;
export function useSinglePoolSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SinglePoolQuery, SinglePoolQueryVariables>): Apollo.UseSuspenseQueryResult<SinglePoolQuery | undefined, SinglePoolQueryVariables>;
export function useSinglePoolSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SinglePoolQuery, SinglePoolQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SinglePoolQuery, SinglePoolQueryVariables>(SinglePoolDocument, options);
        }
export type SinglePoolQueryHookResult = ReturnType<typeof useSinglePoolQuery>;
export type SinglePoolLazyQueryHookResult = ReturnType<typeof useSinglePoolLazyQuery>;
export type SinglePoolSuspenseQueryHookResult = ReturnType<typeof useSinglePoolSuspenseQuery>;
export type SinglePoolQueryResult = Apollo.QueryResult<SinglePoolQuery, SinglePoolQueryVariables>;
export const MultiplePoolsDocument = gql`
    query MultiplePools($poolIds: [ID!]) {
  pools(where: {id_in: $poolIds}) {
    ...PoolFields
  }
}
    ${PoolFieldsFragmentDoc}`;

/**
 * __useMultiplePoolsQuery__
 *
 * To run a query within a React component, call `useMultiplePoolsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMultiplePoolsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMultiplePoolsQuery({
 *   variables: {
 *      poolIds: // value for 'poolIds'
 *   },
 * });
 */
export function useMultiplePoolsQuery(baseOptions?: Apollo.QueryHookOptions<MultiplePoolsQuery, MultiplePoolsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MultiplePoolsQuery, MultiplePoolsQueryVariables>(MultiplePoolsDocument, options);
      }
export function useMultiplePoolsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MultiplePoolsQuery, MultiplePoolsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MultiplePoolsQuery, MultiplePoolsQueryVariables>(MultiplePoolsDocument, options);
        }
// @ts-ignore
export function useMultiplePoolsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MultiplePoolsQuery, MultiplePoolsQueryVariables>): Apollo.UseSuspenseQueryResult<MultiplePoolsQuery, MultiplePoolsQueryVariables>;
export function useMultiplePoolsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MultiplePoolsQuery, MultiplePoolsQueryVariables>): Apollo.UseSuspenseQueryResult<MultiplePoolsQuery | undefined, MultiplePoolsQueryVariables>;
export function useMultiplePoolsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MultiplePoolsQuery, MultiplePoolsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MultiplePoolsQuery, MultiplePoolsQueryVariables>(MultiplePoolsDocument, options);
        }
export type MultiplePoolsQueryHookResult = ReturnType<typeof useMultiplePoolsQuery>;
export type MultiplePoolsLazyQueryHookResult = ReturnType<typeof useMultiplePoolsLazyQuery>;
export type MultiplePoolsSuspenseQueryHookResult = ReturnType<typeof useMultiplePoolsSuspenseQuery>;
export type MultiplePoolsQueryResult = Apollo.QueryResult<MultiplePoolsQuery, MultiplePoolsQueryVariables>;
export const PoolsByTokenPairDocument = gql`
    query PoolsByTokenPair($token0: ID!, $token1: ID!) {
  pools(where: {token0_: {id: $token0}, token1_: {id: $token1}}) {
    ...PoolFields
  }
}
    ${PoolFieldsFragmentDoc}`;

/**
 * __usePoolsByTokenPairQuery__
 *
 * To run a query within a React component, call `usePoolsByTokenPairQuery` and pass it any options that fit your needs.
 * When your component renders, `usePoolsByTokenPairQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePoolsByTokenPairQuery({
 *   variables: {
 *      token0: // value for 'token0'
 *      token1: // value for 'token1'
 *   },
 * });
 */
export function usePoolsByTokenPairQuery(baseOptions: Apollo.QueryHookOptions<PoolsByTokenPairQuery, PoolsByTokenPairQueryVariables> & ({ variables: PoolsByTokenPairQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PoolsByTokenPairQuery, PoolsByTokenPairQueryVariables>(PoolsByTokenPairDocument, options);
      }
export function usePoolsByTokenPairLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PoolsByTokenPairQuery, PoolsByTokenPairQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PoolsByTokenPairQuery, PoolsByTokenPairQueryVariables>(PoolsByTokenPairDocument, options);
        }
// @ts-ignore
export function usePoolsByTokenPairSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<PoolsByTokenPairQuery, PoolsByTokenPairQueryVariables>): Apollo.UseSuspenseQueryResult<PoolsByTokenPairQuery, PoolsByTokenPairQueryVariables>;
export function usePoolsByTokenPairSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PoolsByTokenPairQuery, PoolsByTokenPairQueryVariables>): Apollo.UseSuspenseQueryResult<PoolsByTokenPairQuery | undefined, PoolsByTokenPairQueryVariables>;
export function usePoolsByTokenPairSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PoolsByTokenPairQuery, PoolsByTokenPairQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PoolsByTokenPairQuery, PoolsByTokenPairQueryVariables>(PoolsByTokenPairDocument, options);
        }
export type PoolsByTokenPairQueryHookResult = ReturnType<typeof usePoolsByTokenPairQuery>;
export type PoolsByTokenPairLazyQueryHookResult = ReturnType<typeof usePoolsByTokenPairLazyQuery>;
export type PoolsByTokenPairSuspenseQueryHookResult = ReturnType<typeof usePoolsByTokenPairSuspenseQuery>;
export type PoolsByTokenPairQueryResult = Apollo.QueryResult<PoolsByTokenPairQuery, PoolsByTokenPairQueryVariables>;
export const LiquidatorDataDocument = gql`
    query LiquidatorData($account: String!) {
  liquidatorDatas(where: {account: $account}) {
    ...LiquidatorDataFields
  }
}
    ${LiquidatorDataFieldsFragmentDoc}`;

/**
 * __useLiquidatorDataQuery__
 *
 * To run a query within a React component, call `useLiquidatorDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useLiquidatorDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLiquidatorDataQuery({
 *   variables: {
 *      account: // value for 'account'
 *   },
 * });
 */
export function useLiquidatorDataQuery(baseOptions: Apollo.QueryHookOptions<LiquidatorDataQuery, LiquidatorDataQueryVariables> & ({ variables: LiquidatorDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LiquidatorDataQuery, LiquidatorDataQueryVariables>(LiquidatorDataDocument, options);
      }
export function useLiquidatorDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LiquidatorDataQuery, LiquidatorDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LiquidatorDataQuery, LiquidatorDataQueryVariables>(LiquidatorDataDocument, options);
        }
// @ts-ignore
export function useLiquidatorDataSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<LiquidatorDataQuery, LiquidatorDataQueryVariables>): Apollo.UseSuspenseQueryResult<LiquidatorDataQuery, LiquidatorDataQueryVariables>;
export function useLiquidatorDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<LiquidatorDataQuery, LiquidatorDataQueryVariables>): Apollo.UseSuspenseQueryResult<LiquidatorDataQuery | undefined, LiquidatorDataQueryVariables>;
export function useLiquidatorDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<LiquidatorDataQuery, LiquidatorDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<LiquidatorDataQuery, LiquidatorDataQueryVariables>(LiquidatorDataDocument, options);
        }
export type LiquidatorDataQueryHookResult = ReturnType<typeof useLiquidatorDataQuery>;
export type LiquidatorDataLazyQueryHookResult = ReturnType<typeof useLiquidatorDataLazyQuery>;
export type LiquidatorDataSuspenseQueryHookResult = ReturnType<typeof useLiquidatorDataSuspenseQuery>;
export type LiquidatorDataQueryResult = Apollo.QueryResult<LiquidatorDataQuery, LiquidatorDataQueryVariables>;
export const UserPositionsDocument = gql`
    query UserPositions($account: Bytes!) {
  positions(where: {owner: $account}) {
    ...PositionFields
  }
}
    ${PositionFieldsFragmentDoc}`;

/**
 * __useUserPositionsQuery__
 *
 * To run a query within a React component, call `useUserPositionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserPositionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserPositionsQuery({
 *   variables: {
 *      account: // value for 'account'
 *   },
 * });
 */
export function useUserPositionsQuery(baseOptions: Apollo.QueryHookOptions<UserPositionsQuery, UserPositionsQueryVariables> & ({ variables: UserPositionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserPositionsQuery, UserPositionsQueryVariables>(UserPositionsDocument, options);
      }
export function useUserPositionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserPositionsQuery, UserPositionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserPositionsQuery, UserPositionsQueryVariables>(UserPositionsDocument, options);
        }
// @ts-ignore
export function useUserPositionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<UserPositionsQuery, UserPositionsQueryVariables>): Apollo.UseSuspenseQueryResult<UserPositionsQuery, UserPositionsQueryVariables>;
export function useUserPositionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UserPositionsQuery, UserPositionsQueryVariables>): Apollo.UseSuspenseQueryResult<UserPositionsQuery | undefined, UserPositionsQueryVariables>;
export function useUserPositionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UserPositionsQuery, UserPositionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<UserPositionsQuery, UserPositionsQueryVariables>(UserPositionsDocument, options);
        }
export type UserPositionsQueryHookResult = ReturnType<typeof useUserPositionsQuery>;
export type UserPositionsLazyQueryHookResult = ReturnType<typeof useUserPositionsLazyQuery>;
export type UserPositionsSuspenseQueryHookResult = ReturnType<typeof useUserPositionsSuspenseQuery>;
export type UserPositionsQueryResult = Apollo.QueryResult<UserPositionsQuery, UserPositionsQueryVariables>;
export const UserActivePositionsDocument = gql`
    query UserActivePositions($account: Bytes!) {
  positions(where: {owner: $account, liquidity_gt: 0}) {
    ...PositionFields
  }
}
    ${PositionFieldsFragmentDoc}`;

/**
 * __useUserActivePositionsQuery__
 *
 * To run a query within a React component, call `useUserActivePositionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserActivePositionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserActivePositionsQuery({
 *   variables: {
 *      account: // value for 'account'
 *   },
 * });
 */
export function useUserActivePositionsQuery(baseOptions: Apollo.QueryHookOptions<UserActivePositionsQuery, UserActivePositionsQueryVariables> & ({ variables: UserActivePositionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserActivePositionsQuery, UserActivePositionsQueryVariables>(UserActivePositionsDocument, options);
      }
export function useUserActivePositionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserActivePositionsQuery, UserActivePositionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserActivePositionsQuery, UserActivePositionsQueryVariables>(UserActivePositionsDocument, options);
        }
// @ts-ignore
export function useUserActivePositionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<UserActivePositionsQuery, UserActivePositionsQueryVariables>): Apollo.UseSuspenseQueryResult<UserActivePositionsQuery, UserActivePositionsQueryVariables>;
export function useUserActivePositionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UserActivePositionsQuery, UserActivePositionsQueryVariables>): Apollo.UseSuspenseQueryResult<UserActivePositionsQuery | undefined, UserActivePositionsQueryVariables>;
export function useUserActivePositionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UserActivePositionsQuery, UserActivePositionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<UserActivePositionsQuery, UserActivePositionsQueryVariables>(UserActivePositionsDocument, options);
        }
export type UserActivePositionsQueryHookResult = ReturnType<typeof useUserActivePositionsQuery>;
export type UserActivePositionsLazyQueryHookResult = ReturnType<typeof useUserActivePositionsLazyQuery>;
export type UserActivePositionsSuspenseQueryHookResult = ReturnType<typeof useUserActivePositionsSuspenseQuery>;
export type UserActivePositionsQueryResult = Apollo.QueryResult<UserActivePositionsQuery, UserActivePositionsQueryVariables>;
export const TopPoolPositionsDocument = gql`
    query TopPoolPositions($poolId: String!, $orderBy: Position_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {
  positions(
    where: {pool: $poolId, liquidity_gt: 0}
    orderBy: $orderBy
    orderDirection: $orderDirection
    first: $first
    skip: $skip
  ) {
    ...PositionFields
  }
}
    ${PositionFieldsFragmentDoc}`;

/**
 * __useTopPoolPositionsQuery__
 *
 * To run a query within a React component, call `useTopPoolPositionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTopPoolPositionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTopPoolPositionsQuery({
 *   variables: {
 *      poolId: // value for 'poolId'
 *      orderBy: // value for 'orderBy'
 *      orderDirection: // value for 'orderDirection'
 *      first: // value for 'first'
 *      skip: // value for 'skip'
 *   },
 * });
 */
export function useTopPoolPositionsQuery(baseOptions: Apollo.QueryHookOptions<TopPoolPositionsQuery, TopPoolPositionsQueryVariables> & ({ variables: TopPoolPositionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TopPoolPositionsQuery, TopPoolPositionsQueryVariables>(TopPoolPositionsDocument, options);
      }
export function useTopPoolPositionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TopPoolPositionsQuery, TopPoolPositionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TopPoolPositionsQuery, TopPoolPositionsQueryVariables>(TopPoolPositionsDocument, options);
        }
// @ts-ignore
export function useTopPoolPositionsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TopPoolPositionsQuery, TopPoolPositionsQueryVariables>): Apollo.UseSuspenseQueryResult<TopPoolPositionsQuery, TopPoolPositionsQueryVariables>;
export function useTopPoolPositionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TopPoolPositionsQuery, TopPoolPositionsQueryVariables>): Apollo.UseSuspenseQueryResult<TopPoolPositionsQuery | undefined, TopPoolPositionsQueryVariables>;
export function useTopPoolPositionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TopPoolPositionsQuery, TopPoolPositionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TopPoolPositionsQuery, TopPoolPositionsQueryVariables>(TopPoolPositionsDocument, options);
        }
export type TopPoolPositionsQueryHookResult = ReturnType<typeof useTopPoolPositionsQuery>;
export type TopPoolPositionsLazyQueryHookResult = ReturnType<typeof useTopPoolPositionsLazyQuery>;
export type TopPoolPositionsSuspenseQueryHookResult = ReturnType<typeof useTopPoolPositionsSuspenseQuery>;
export type TopPoolPositionsQueryResult = Apollo.QueryResult<TopPoolPositionsQuery, TopPoolPositionsQueryVariables>;
export const MultipleTokensDocument = gql`
    query MultipleTokens($tokenIds: [ID!]!) {
  tokens(where: {id_in: $tokenIds}) {
    ...TokenFields
  }
}
    ${TokenFieldsFragmentDoc}`;

/**
 * __useMultipleTokensQuery__
 *
 * To run a query within a React component, call `useMultipleTokensQuery` and pass it any options that fit your needs.
 * When your component renders, `useMultipleTokensQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMultipleTokensQuery({
 *   variables: {
 *      tokenIds: // value for 'tokenIds'
 *   },
 * });
 */
export function useMultipleTokensQuery(baseOptions: Apollo.QueryHookOptions<MultipleTokensQuery, MultipleTokensQueryVariables> & ({ variables: MultipleTokensQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MultipleTokensQuery, MultipleTokensQueryVariables>(MultipleTokensDocument, options);
      }
export function useMultipleTokensLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MultipleTokensQuery, MultipleTokensQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MultipleTokensQuery, MultipleTokensQueryVariables>(MultipleTokensDocument, options);
        }
// @ts-ignore
export function useMultipleTokensSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<MultipleTokensQuery, MultipleTokensQueryVariables>): Apollo.UseSuspenseQueryResult<MultipleTokensQuery, MultipleTokensQueryVariables>;
export function useMultipleTokensSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MultipleTokensQuery, MultipleTokensQueryVariables>): Apollo.UseSuspenseQueryResult<MultipleTokensQuery | undefined, MultipleTokensQueryVariables>;
export function useMultipleTokensSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MultipleTokensQuery, MultipleTokensQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MultipleTokensQuery, MultipleTokensQueryVariables>(MultipleTokensDocument, options);
        }
export type MultipleTokensQueryHookResult = ReturnType<typeof useMultipleTokensQuery>;
export type MultipleTokensLazyQueryHookResult = ReturnType<typeof useMultipleTokensLazyQuery>;
export type MultipleTokensSuspenseQueryHookResult = ReturnType<typeof useMultipleTokensSuspenseQuery>;
export type MultipleTokensQueryResult = Apollo.QueryResult<MultipleTokensQuery, MultipleTokensQueryVariables>;
export const SingleTokenDocument = gql`
    query SingleToken($tokenId: ID!) {
  token(id: $tokenId) {
    ...TokenFields
  }
}
    ${TokenFieldsFragmentDoc}`;

/**
 * __useSingleTokenQuery__
 *
 * To run a query within a React component, call `useSingleTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useSingleTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSingleTokenQuery({
 *   variables: {
 *      tokenId: // value for 'tokenId'
 *   },
 * });
 */
export function useSingleTokenQuery(baseOptions: Apollo.QueryHookOptions<SingleTokenQuery, SingleTokenQueryVariables> & ({ variables: SingleTokenQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SingleTokenQuery, SingleTokenQueryVariables>(SingleTokenDocument, options);
      }
export function useSingleTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SingleTokenQuery, SingleTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SingleTokenQuery, SingleTokenQueryVariables>(SingleTokenDocument, options);
        }
// @ts-ignore
export function useSingleTokenSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SingleTokenQuery, SingleTokenQueryVariables>): Apollo.UseSuspenseQueryResult<SingleTokenQuery, SingleTokenQueryVariables>;
export function useSingleTokenSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SingleTokenQuery, SingleTokenQueryVariables>): Apollo.UseSuspenseQueryResult<SingleTokenQuery | undefined, SingleTokenQueryVariables>;
export function useSingleTokenSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SingleTokenQuery, SingleTokenQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SingleTokenQuery, SingleTokenQueryVariables>(SingleTokenDocument, options);
        }
export type SingleTokenQueryHookResult = ReturnType<typeof useSingleTokenQuery>;
export type SingleTokenLazyQueryHookResult = ReturnType<typeof useSingleTokenLazyQuery>;
export type SingleTokenSuspenseQueryHookResult = ReturnType<typeof useSingleTokenSuspenseQuery>;
export type SingleTokenQueryResult = Apollo.QueryResult<SingleTokenQuery, SingleTokenQueryVariables>;
export const TokenTop10HoldersDocument = gql`
    query TokenTop10Holders($tokenId: ID!) {
  token(id: $tokenId) {
    id
    symbol
  }
}
    `;

/**
 * __useTokenTop10HoldersQuery__
 *
 * To run a query within a React component, call `useTokenTop10HoldersQuery` and pass it any options that fit your needs.
 * When your component renders, `useTokenTop10HoldersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTokenTop10HoldersQuery({
 *   variables: {
 *      tokenId: // value for 'tokenId'
 *   },
 * });
 */
export function useTokenTop10HoldersQuery(baseOptions: Apollo.QueryHookOptions<TokenTop10HoldersQuery, TokenTop10HoldersQueryVariables> & ({ variables: TokenTop10HoldersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TokenTop10HoldersQuery, TokenTop10HoldersQueryVariables>(TokenTop10HoldersDocument, options);
      }
export function useTokenTop10HoldersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TokenTop10HoldersQuery, TokenTop10HoldersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TokenTop10HoldersQuery, TokenTop10HoldersQueryVariables>(TokenTop10HoldersDocument, options);
        }
// @ts-ignore
export function useTokenTop10HoldersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<TokenTop10HoldersQuery, TokenTop10HoldersQueryVariables>): Apollo.UseSuspenseQueryResult<TokenTop10HoldersQuery, TokenTop10HoldersQueryVariables>;
export function useTokenTop10HoldersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TokenTop10HoldersQuery, TokenTop10HoldersQueryVariables>): Apollo.UseSuspenseQueryResult<TokenTop10HoldersQuery | undefined, TokenTop10HoldersQueryVariables>;
export function useTokenTop10HoldersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TokenTop10HoldersQuery, TokenTop10HoldersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TokenTop10HoldersQuery, TokenTop10HoldersQueryVariables>(TokenTop10HoldersDocument, options);
        }
export type TokenTop10HoldersQueryHookResult = ReturnType<typeof useTokenTop10HoldersQuery>;
export type TokenTop10HoldersLazyQueryHookResult = ReturnType<typeof useTokenTop10HoldersLazyQuery>;
export type TokenTop10HoldersSuspenseQueryHookResult = ReturnType<typeof useTokenTop10HoldersSuspenseQuery>;
export type TokenTop10HoldersQueryResult = Apollo.QueryResult<TokenTop10HoldersQuery, TokenTop10HoldersQueryVariables>;
export const AllTokensDocument = gql`
    query AllTokens {
  tokens {
    ...TokenFields
  }
}
    ${TokenFieldsFragmentDoc}`;

/**
 * __useAllTokensQuery__
 *
 * To run a query within a React component, call `useAllTokensQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllTokensQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllTokensQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllTokensQuery(baseOptions?: Apollo.QueryHookOptions<AllTokensQuery, AllTokensQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllTokensQuery, AllTokensQueryVariables>(AllTokensDocument, options);
      }
export function useAllTokensLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllTokensQuery, AllTokensQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllTokensQuery, AllTokensQueryVariables>(AllTokensDocument, options);
        }
// @ts-ignore
export function useAllTokensSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AllTokensQuery, AllTokensQueryVariables>): Apollo.UseSuspenseQueryResult<AllTokensQuery, AllTokensQueryVariables>;
export function useAllTokensSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllTokensQuery, AllTokensQueryVariables>): Apollo.UseSuspenseQueryResult<AllTokensQuery | undefined, AllTokensQueryVariables>;
export function useAllTokensSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllTokensQuery, AllTokensQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AllTokensQuery, AllTokensQueryVariables>(AllTokensDocument, options);
        }
export type AllTokensQueryHookResult = ReturnType<typeof useAllTokensQuery>;
export type AllTokensLazyQueryHookResult = ReturnType<typeof useAllTokensLazyQuery>;
export type AllTokensSuspenseQueryHookResult = ReturnType<typeof useAllTokensSuspenseQuery>;
export type AllTokensQueryResult = Apollo.QueryResult<AllTokensQuery, AllTokensQueryVariables>;
export const VaultsSortedByHoldersDocument = gql`
    query VaultsSortedByHolders($search: String) {
  ichiVaults(
    first: 100
    orderBy: holdersCount
    orderDirection: desc
    where: {searchString_contains_nocase: $search}
  ) {
    ...VaultField
  }
}
    ${VaultFieldFragmentDoc}`;

/**
 * __useVaultsSortedByHoldersQuery__
 *
 * To run a query within a React component, call `useVaultsSortedByHoldersQuery` and pass it any options that fit your needs.
 * When your component renders, `useVaultsSortedByHoldersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVaultsSortedByHoldersQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useVaultsSortedByHoldersQuery(baseOptions?: Apollo.QueryHookOptions<VaultsSortedByHoldersQuery, VaultsSortedByHoldersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<VaultsSortedByHoldersQuery, VaultsSortedByHoldersQueryVariables>(VaultsSortedByHoldersDocument, options);
      }
export function useVaultsSortedByHoldersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<VaultsSortedByHoldersQuery, VaultsSortedByHoldersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<VaultsSortedByHoldersQuery, VaultsSortedByHoldersQueryVariables>(VaultsSortedByHoldersDocument, options);
        }
// @ts-ignore
export function useVaultsSortedByHoldersSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<VaultsSortedByHoldersQuery, VaultsSortedByHoldersQueryVariables>): Apollo.UseSuspenseQueryResult<VaultsSortedByHoldersQuery, VaultsSortedByHoldersQueryVariables>;
export function useVaultsSortedByHoldersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<VaultsSortedByHoldersQuery, VaultsSortedByHoldersQueryVariables>): Apollo.UseSuspenseQueryResult<VaultsSortedByHoldersQuery | undefined, VaultsSortedByHoldersQueryVariables>;
export function useVaultsSortedByHoldersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<VaultsSortedByHoldersQuery, VaultsSortedByHoldersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<VaultsSortedByHoldersQuery, VaultsSortedByHoldersQueryVariables>(VaultsSortedByHoldersDocument, options);
        }
export type VaultsSortedByHoldersQueryHookResult = ReturnType<typeof useVaultsSortedByHoldersQuery>;
export type VaultsSortedByHoldersLazyQueryHookResult = ReturnType<typeof useVaultsSortedByHoldersLazyQuery>;
export type VaultsSortedByHoldersSuspenseQueryHookResult = ReturnType<typeof useVaultsSortedByHoldersSuspenseQuery>;
export type VaultsSortedByHoldersQueryResult = Apollo.QueryResult<VaultsSortedByHoldersQuery, VaultsSortedByHoldersQueryVariables>;
export const AccountVaultSharesDocument = gql`
    query AccountVaultShares($AccountId: ID!) {
  vaultShares(where: {user_: {id: $AccountId}, vaultShareBalance_gt: 0}) {
    ...VaultSharesField
    id
  }
}
    ${VaultSharesFieldFragmentDoc}`;

/**
 * __useAccountVaultSharesQuery__
 *
 * To run a query within a React component, call `useAccountVaultSharesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountVaultSharesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountVaultSharesQuery({
 *   variables: {
 *      AccountId: // value for 'AccountId'
 *   },
 * });
 */
export function useAccountVaultSharesQuery(baseOptions: Apollo.QueryHookOptions<AccountVaultSharesQuery, AccountVaultSharesQueryVariables> & ({ variables: AccountVaultSharesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AccountVaultSharesQuery, AccountVaultSharesQueryVariables>(AccountVaultSharesDocument, options);
      }
export function useAccountVaultSharesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AccountVaultSharesQuery, AccountVaultSharesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AccountVaultSharesQuery, AccountVaultSharesQueryVariables>(AccountVaultSharesDocument, options);
        }
// @ts-ignore
export function useAccountVaultSharesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AccountVaultSharesQuery, AccountVaultSharesQueryVariables>): Apollo.UseSuspenseQueryResult<AccountVaultSharesQuery, AccountVaultSharesQueryVariables>;
export function useAccountVaultSharesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AccountVaultSharesQuery, AccountVaultSharesQueryVariables>): Apollo.UseSuspenseQueryResult<AccountVaultSharesQuery | undefined, AccountVaultSharesQueryVariables>;
export function useAccountVaultSharesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AccountVaultSharesQuery, AccountVaultSharesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AccountVaultSharesQuery, AccountVaultSharesQueryVariables>(AccountVaultSharesDocument, options);
        }
export type AccountVaultSharesQueryHookResult = ReturnType<typeof useAccountVaultSharesQuery>;
export type AccountVaultSharesLazyQueryHookResult = ReturnType<typeof useAccountVaultSharesLazyQuery>;
export type AccountVaultSharesSuspenseQueryHookResult = ReturnType<typeof useAccountVaultSharesSuspenseQuery>;
export type AccountVaultSharesQueryResult = Apollo.QueryResult<AccountVaultSharesQuery, AccountVaultSharesQueryVariables>;
export const SingleVaultDetailsDocument = gql`
    query SingleVaultDetails($vaultId: ID!) {
  ichiVault(id: $vaultId) {
    ...VaultField
    vaultShares {
      id
      vaultShareBalance
    }
    vaultDeposits(orderBy: createdAtTimestamp, orderDirection: desc, first: 100) {
      id
      createdAtTimestamp
      amount0
      amount1
      shares
      to
    }
    vaultWithdraws(orderBy: createdAtTimestamp, orderDirection: desc, first: 100) {
      id
      createdAtTimestamp
      amount0
      amount1
      shares
      to
    }
    vaultCollectFees(orderBy: createdAtTimestamp, orderDirection: desc, first: 100) {
      id
      createdAtTimestamp
      feeAmount0
      feeAmount1
      sender
    }
  }
}
    ${VaultFieldFragmentDoc}`;

/**
 * __useSingleVaultDetailsQuery__
 *
 * To run a query within a React component, call `useSingleVaultDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSingleVaultDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSingleVaultDetailsQuery({
 *   variables: {
 *      vaultId: // value for 'vaultId'
 *   },
 * });
 */
export function useSingleVaultDetailsQuery(baseOptions: Apollo.QueryHookOptions<SingleVaultDetailsQuery, SingleVaultDetailsQueryVariables> & ({ variables: SingleVaultDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SingleVaultDetailsQuery, SingleVaultDetailsQueryVariables>(SingleVaultDetailsDocument, options);
      }
export function useSingleVaultDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SingleVaultDetailsQuery, SingleVaultDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SingleVaultDetailsQuery, SingleVaultDetailsQueryVariables>(SingleVaultDetailsDocument, options);
        }
// @ts-ignore
export function useSingleVaultDetailsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SingleVaultDetailsQuery, SingleVaultDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<SingleVaultDetailsQuery, SingleVaultDetailsQueryVariables>;
export function useSingleVaultDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SingleVaultDetailsQuery, SingleVaultDetailsQueryVariables>): Apollo.UseSuspenseQueryResult<SingleVaultDetailsQuery | undefined, SingleVaultDetailsQueryVariables>;
export function useSingleVaultDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SingleVaultDetailsQuery, SingleVaultDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SingleVaultDetailsQuery, SingleVaultDetailsQueryVariables>(SingleVaultDetailsDocument, options);
        }
export type SingleVaultDetailsQueryHookResult = ReturnType<typeof useSingleVaultDetailsQuery>;
export type SingleVaultDetailsLazyQueryHookResult = ReturnType<typeof useSingleVaultDetailsLazyQuery>;
export type SingleVaultDetailsSuspenseQueryHookResult = ReturnType<typeof useSingleVaultDetailsSuspenseQuery>;
export type SingleVaultDetailsQueryResult = Apollo.QueryResult<SingleVaultDetailsQuery, SingleVaultDetailsQueryVariables>;