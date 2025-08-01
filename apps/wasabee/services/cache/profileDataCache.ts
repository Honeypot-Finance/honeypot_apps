import { makeAutoObservable } from 'mobx';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  isStale: boolean;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleTime: number; // Time after which data is considered stale but still usable
  backgroundRefresh: boolean; // Whether to refresh data in background when stale
}

class ProfileDataCache {
  private cache = new Map<string, CacheItem<any>>();
  private refreshPromises = new Map<string, Promise<any>>();

  constructor() {
    makeAutoObservable(this);
  }

  private getDefaultConfig(): CacheConfig {
    return {
      ttl: 4 * 60 * 1000, // 4 minutes
      staleTime: 3 * 60 * 1000, // 3 minutes - data is stale after 3 minutes but still usable
      backgroundRefresh: true,
    };
  }

  // Get cache key for portfolio data
  getPortfolioCacheKey(account: string, chainId: string): string {
    return `portfolio_${account}_${chainId}`;
  }

  // Get cache key for pools data
  getPoolsCacheKey(account: string, chainId: string, filter: string): string {
    return `pools_${account}_${chainId}_${filter}`;
  }

  // Get cache key for user pools data
  getUserPoolsCacheKey(account: string, chainId: string): string {
    return `user_pools_${account}_${chainId}`;
  }

  // Set data in cache
  set<T>(key: string, data: T, config?: Partial<CacheConfig>): void {
    const fullConfig = { ...this.getDefaultConfig(), ...config };
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      isStale: false,
    });

    // Schedule stale marking
    setTimeout(() => {
      const item = this.cache.get(key);
      if (item && item.timestamp === now) {
        item.isStale = true;
      }
    }, fullConfig.staleTime);

    // Schedule expiration
    setTimeout(() => {
      const item = this.cache.get(key);
      if (item && item.timestamp === now) {
        this.cache.delete(key);
      }
    }, fullConfig.ttl);
  }

  // Get data from cache
  get<T>(key: string): CacheItem<T> | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    return item as CacheItem<T>;
  }

  // Get data with background refresh if stale
  async getWithRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: Partial<CacheConfig>
  ): Promise<T> {
    const fullConfig = { ...this.getDefaultConfig(), ...config };
    const cached = this.get<T>(key);

    // If we have fresh data, return it immediately
    if (cached && !cached.isStale) {
      return cached.data;
    }

    // If we have stale data, return it and refresh in background
    if (cached && cached.isStale && fullConfig.backgroundRefresh) {
      // Start background refresh if not already running
      if (!this.refreshPromises.has(key)) {
        const refreshPromise = this.refreshData(key, fetcher, fullConfig);
        this.refreshPromises.set(key, refreshPromise);
        
        // Clean up promise when done
        refreshPromise.finally(() => {
          this.refreshPromises.delete(key);
        });
      }
      
      return cached.data;
    }

    // No cache or cache expired, fetch fresh data
    const data = await this.refreshData(key, fetcher, fullConfig);
    return data;
  }

  // Force refresh data
  async forceRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: Partial<CacheConfig>
  ): Promise<T> {
    const fullConfig = { ...this.getDefaultConfig(), ...config };
    return this.refreshData(key, fetcher, fullConfig);
  }

  private async refreshData<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    try {
      const data = await fetcher();
      this.set(key, data, config);
      return data;
    } catch (error) {
      console.error(`Failed to refresh cache for key: ${key}`, error);
      
      // If refresh fails and we have stale data, return that
      const cached = this.get<T>(key);
      if (cached) {
        return cached.data;
      }
      
      throw error;
    }
  }

  // Check if data exists and is fresh
  isFresh(key: string): boolean {
    const item = this.cache.get(key);
    return item ? !item.isStale : false;
  }

  // Check if data exists (fresh or stale)
  exists(key: string): boolean {
    return this.cache.has(key);
  }

  // Clear specific cache entry
  clear(key: string): void {
    this.cache.delete(key);
    this.refreshPromises.delete(key);
  }

  // Clear all cache entries
  clearAll(): void {
    this.cache.clear();
    this.refreshPromises.clear();
  }

  // Clear cache entries by pattern
  clearByPattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.clear(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      freshEntries: entries.filter(([_, item]) => !item.isStale).length,
      staleEntries: entries.filter(([_, item]) => item.isStale).length,
      averageAge: entries.length > 0 
        ? entries.reduce((sum, [_, item]) => sum + (now - item.timestamp), 0) / entries.length
        : 0,
      oldestEntry: entries.reduce((oldest, [_, item]) => 
        Math.min(oldest, item.timestamp), now),
    };
  }
}

export const profileDataCache = new ProfileDataCache();