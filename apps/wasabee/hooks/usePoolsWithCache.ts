import { useEffect, useState } from 'react';
import { useUserPools } from '@/lib/algebra/graphql/clients/pool';
import {
  usePoolsListQuery,
  useActiveFarmingsQuery,
} from '@/lib/algebra/graphql/generated/graphql';
import { useSubgraphClient } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import { poolsCache } from '@/services/cache/poolsCache';
import { observer } from 'mobx-react-lite';

interface UsePoolsWithCacheResult {
  pools: any;
  userPools: any;
  activeFarmings: any;
  isLoading: boolean;
  isCached: boolean;
  lastRefreshTime: number;
  forceRefresh: () => Promise<void>;
}

export const usePoolsWithCache = (
  defaultFilter: string = 'trending',
  search: string = ''
): UsePoolsWithCacheResult => {
  const [isCached, setIsCached] = useState(false);
  const farmingClient = useSubgraphClient('algebra_farming');

  // Original GraphQL queries
  const {
    data: pools,
    loading: isPoolsListLoading,
    refetch: refetchPools,
  } = usePoolsListQuery({
    fetchPolicy: 'cache-and-network', 
    nextFetchPolicy: 'cache-first',
    initialFetchPolicy: 'cache-and-network', 
    notifyOnNetworkStatusChange: true,
    variables: {
      search: search || '', 
    },
  });

  const {
    data: userPools,
    loading: isUserPoolsLoading,
    refetch: refetchUserPools,
  } = useUserPools(wallet.account);

  const {
    data: activeFarmings,
    loading: isFarmingsLoading,
    refetch: refetchFarmings,
  } = useActiveFarmingsQuery({
    client: farmingClient,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const isOriginalLoading = isPoolsListLoading || isFarmingsLoading;

  // Initialize cache data on mount and when filter changes
  useEffect(() => {
    const initializeCache = async () => {
      if (!wallet.account) return;

      // Reset cached state when filter changes
      setIsCached(false);


      const cachedPoolsData = await poolsCache.getPoolsData(defaultFilter);
      const cachedUserPools = await poolsCache.getUserPoolsData();


      if (cachedPoolsData && cachedPoolsData.pools.length > 0) {
        setIsCached(true);
      }
    };

    initializeCache();
  }, [defaultFilter, wallet.account]);

  // Update cache when fresh data arrives
  useEffect(() => {
    if (!isOriginalLoading && pools && activeFarmings) {
      const poolsData = {
        pools: pools.pools || [],
        userPools: (userPools as any)?.data || { pools: [] }, 
        activeFarmings: (userPools as any).farmings || [],
      };

      poolsCache.updatePoolsCache(poolsData, defaultFilter);
      setIsCached(false); 
    }
  }, [pools, userPools, activeFarmings, isOriginalLoading, defaultFilter]);


  useEffect(() => {
    if (!isUserPoolsLoading && userPools) {
      poolsCache.updateUserPoolsCache((userPools as any).data || { pools: [] });
    }
  }, [userPools, isUserPoolsLoading]);

  const forceRefresh = async () => {
    setIsCached(false);
    await Promise.all([refetchPools(), refetchUserPools(), refetchFarmings()]);
    await poolsCache.forceRefreshPools(defaultFilter);
    await poolsCache.forceRefreshUserPools();
  };

  // Use cached data if available and no fresh data yet
  const shouldUseCachedData = isCached && isOriginalLoading;
  const cachedData = poolsCache.poolsData;


  const poolsToShow =
    shouldUseCachedData && cachedData ? { pools: cachedData.pools } : pools;
  const userPoolsToShow =
    shouldUseCachedData && cachedData
      ? {
          data: cachedData.userPools, 
        }
      : userPools;
  const activeFarmingsToShow =
    shouldUseCachedData && cachedData
      ? { farmings: cachedData.activeFarmings }
      : activeFarmings;

  // Show loading logic for tab switching
  const hasFreshDataForCurrentFilter =
    pools && pools.pools && pools.pools.length > 0;
  const hasCachedDataForCurrentFilter =
    shouldUseCachedData && cachedData && cachedData.pools.length > 0;


  const shouldShowLoading =
    isOriginalLoading &&
    !hasFreshDataForCurrentFilter &&
    !hasCachedDataForCurrentFilter;

  return {
    pools: poolsToShow,
    userPools: userPoolsToShow,
    activeFarmings: activeFarmingsToShow,
    isLoading: shouldShowLoading,
    isCached,
    lastRefreshTime: poolsCache.lastRefreshTime,
    forceRefresh,
  };
};
