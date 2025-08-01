import { useEffect, useCallback } from 'react';
import { vaultCache } from '@/lib/vaultCache';
import { VaultsSortedByHoldersQuery } from '@/lib/algebra/graphql/generated/graphql';
import { useSubgraphClient, ICHIVaultContract } from '@honeypot/shared';

export const useVaultCache = () => {
  const infoClient = useSubgraphClient('algebra_info');

  const getCachedData = useCallback((searchString: string = '') => {
    return vaultCache.getCachedData(searchString);
  }, []);

  const setCachedData = useCallback((data: VaultsSortedByHoldersQuery, searchString: string = '', processedVaults?: ICHIVaultContract[]) => {
    vaultCache.setCachedData(data, searchString, processedVaults);
  }, []);

  const isDataStale = useCallback((searchString: string = '') => {
    return vaultCache.isDataStale(searchString);
  }, []);

  const getCacheInfo = useCallback((searchString: string = '') => {
    return vaultCache.getCacheInfo(searchString);
  }, []);

  const clearCache = useCallback(() => {
    vaultCache.clearCache();
  }, []);

  const preloadCommonSearches = useCallback(async () => {
    if (!infoClient) return;
    
    try {
      await vaultCache.preloadCommonSearches(infoClient);
    } catch (error) {
      console.error('Error preloading common searches:', error);
    }
  }, [infoClient]);

  const forceRefresh = useCallback(async (searchString: string = '') => {
    if (!infoClient) return null;
    
    try {
      return await vaultCache.forceRefresh(infoClient, searchString);
    } catch (error) {
      console.error('Error force refreshing:', error);
      return null;
    }
  }, [infoClient]);

  const getCacheStats = useCallback(() => {
    return vaultCache.getCacheStats();
  }, []);

  const getCachedKeys = useCallback(() => {
    return vaultCache.getCachedKeys();
  }, []);

  const getCachedProcessedVaults = useCallback((searchString: string = '') => {
    return vaultCache.getCachedProcessedVaults(searchString);
  }, []);

  const setCachedProcessedVaults = useCallback((processedVaults: ICHIVaultContract[], searchString: string = '') => {
    vaultCache.setCachedProcessedVaults(processedVaults, searchString);
  }, []);

  // Preload common searches when component mounts
  useEffect(() => {
    preloadCommonSearches();
  }, [preloadCommonSearches]);

  return {
    getCachedData,
    setCachedData,
    getCachedProcessedVaults,
    setCachedProcessedVaults,
    isDataStale,
    getCacheInfo,
    clearCache,
    preloadCommonSearches,
    forceRefresh,
    getCacheStats,
    getCachedKeys,
  };
}; 