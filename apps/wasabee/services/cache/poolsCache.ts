import { makeAutoObservable } from 'mobx';
import { profileDataCache } from './profileDataCache';
import { wallet } from '@honeypot/shared/lib/wallet';


interface PoolsData {
  pools: any[];
  userPools: { pools: any[] }; // Fix: userPools should have a pools property
  activeFarmings: any[];
}

interface PoolsCacheState {
  poolsData: PoolsData | null;
  isLoading: boolean;
  lastRefreshTime: number;
}

class PoolsCache {
  private state: PoolsCacheState = {
    poolsData: null,
    isLoading: false,
    lastRefreshTime: 0,
  };

  constructor() {
    makeAutoObservable(this);
  }

  get poolsData() {
    return this.state.poolsData;
  }

  get isLoading() {
    return this.state.isLoading;
  }

  get lastRefreshTime() {
    return this.state.lastRefreshTime;
  }

  // Get cached pools data with background refresh
  async getPoolsData(filter: string = 'trending'): Promise<PoolsData | null> {
    if (!wallet.account) return null;

    const cacheKey = profileDataCache.getPoolsCacheKey(
      wallet.account,
      wallet.currentChainId.toString(),
      filter
    );

    // Check cache first
    const cached = profileDataCache.get<PoolsData>(cacheKey);

    if (cached) {
      // Update local state
      this.state.poolsData = cached.data;
      this.state.isLoading = false;
      this.state.lastRefreshTime = cached.timestamp;

      // If data is stale, refresh in background
      if (cached.isStale) {
        this.refreshPoolsInBackground(cacheKey, filter);
      }

      return cached.data;
    }

    // No cache, fetch fresh data
    this.state.isLoading = true;
    return await this.fetchAndCachePoolsData(cacheKey, filter);
  }

  // Get user pools data with background refresh
  async getUserPoolsData(): Promise<{ pools: any[] } | null> {
    if (!wallet.account) return null;

    const cacheKey = profileDataCache.getUserPoolsCacheKey(
      wallet.account,
      wallet.currentChainId.toString()
    );

    // Check cache first
    const cached = profileDataCache.get<{ pools: any[] }>(cacheKey);

    if (cached) {
      // If data is stale, refresh in background
      if (cached.isStale) {
        this.refreshUserPoolsInBackground(cacheKey);
      }

      return cached.data;
    }

    // No cache, fetch fresh data
    return await this.fetchAndCacheUserPoolsData(cacheKey);
  }

  private async fetchAndCachePoolsData(
    cacheKey: string,
    filter: string
  ): Promise<PoolsData | null> {
    try {
      const poolsData: PoolsData = {
        pools: [],
        userPools: { pools: [] },
        activeFarmings: [],
      };

      this.state.poolsData = poolsData;
      this.state.lastRefreshTime = Date.now();

      // Cache the data
      profileDataCache.set(cacheKey, poolsData, {
        ttl: 4 * 60 * 1000, // 4 minutes for pools data
        staleTime: 3 * 60 * 1000, // 3 minutes
        backgroundRefresh: true,
      });

      return poolsData;
    } catch (error) {
      console.error('Error fetching pools data:', error);
      return null;
    } finally {
      this.state.isLoading = false;
    }
  }

  private async fetchAndCacheUserPoolsData(
    cacheKey: string
  ): Promise<{ pools: any[] } | null> {
    try {
      const userPoolsData = { pools: [] };

      // Cache the data
      profileDataCache.set(cacheKey, userPoolsData, {
        ttl: 4 * 60 * 1000, // 10 minutes
        staleTime: 3 * 60 * 1000, // 3 minutes
        backgroundRefresh: true,
      });

      return userPoolsData;
    } catch (error) {
      console.error('Error fetching user pools data:', error);
      return null;
    }
  }

  private async refreshPoolsInBackground(cacheKey: string, filter: string) {
    try {
      await this.fetchAndCachePoolsData(cacheKey, filter);
    } catch (error) {
      console.error('Background pools refresh error:', error);
    }
  }

  private async refreshUserPoolsInBackground(cacheKey: string) {
    try {
      await this.fetchAndCacheUserPoolsData(cacheKey);
    } catch (error) {
      console.error('Background user pools refresh error:', error);
    }
  }

  // Method to be called from components with fresh data
  updatePoolsCache(poolsData: PoolsData, filter: string) {
    if (!wallet.account) return;

    const cacheKey = profileDataCache.getPoolsCacheKey(
      wallet.account,
      wallet.currentChainId.toString(),
      filter
    );

    this.state.poolsData = poolsData;
    this.state.lastRefreshTime = Date.now();

    profileDataCache.set(cacheKey, poolsData, {
      ttl: 10 * 60 * 1000,
      staleTime: 3 * 60 * 1000,
      backgroundRefresh: true,
    });
  }

  // Method to be called from components with fresh user pools data
  updateUserPoolsCache(userPoolsData: { pools: any[] }) {
    if (!wallet.account) return;

    const cacheKey = profileDataCache.getUserPoolsCacheKey(
      wallet.account,
      wallet.currentChainId.toString()
    );

    profileDataCache.set(cacheKey, userPoolsData, {
      ttl: 10 * 60 * 1000,
      staleTime: 3 * 60 * 1000,
      backgroundRefresh: true,
    });
  }

  // Force refresh pools data
  async forceRefreshPools(filter: string) {
    if (!wallet.account) return;

    const cacheKey = profileDataCache.getPoolsCacheKey(
      wallet.account,
      wallet.currentChainId.toString(),
      filter
    );

    profileDataCache.clear(cacheKey);
    this.state.isLoading = true;
    await this.fetchAndCachePoolsData(cacheKey, filter);
  }

  // Force refresh user pools data
  async forceRefreshUserPools() {
    if (!wallet.account) return;

    const cacheKey = profileDataCache.getUserPoolsCacheKey(
      wallet.account,
      wallet.currentChainId.toString()
    );

    profileDataCache.clear(cacheKey);
    await this.fetchAndCacheUserPoolsData(cacheKey);
  }

  // Clear all pools cache
  clearCache() {
    if (!wallet.account) return;

    const accountPattern = new RegExp(`^(pools|user_pools)_${wallet.account}_`);
    profileDataCache.clearByPattern(accountPattern);

    this.state.poolsData = null;
    this.state.lastRefreshTime = 0;
  }

  // Check if pools data is available and fresh
  isPoolsDataFresh(filter: string): boolean {
    if (!wallet.account) return false;

    const cacheKey = profileDataCache.getPoolsCacheKey(
      wallet.account,
      wallet.currentChainId.toString(),
      filter
    );

    return profileDataCache.isFresh(cacheKey);
  }

  // Check if user pools data is available and fresh
  isUserPoolsDataFresh(): boolean {
    if (!wallet.account) return false;

    const cacheKey = profileDataCache.getUserPoolsCacheKey(
      wallet.account,
      wallet.currentChainId.toString()
    );

    return profileDataCache.isFresh(cacheKey);
  }
}

export const poolsCache = new PoolsCache();
