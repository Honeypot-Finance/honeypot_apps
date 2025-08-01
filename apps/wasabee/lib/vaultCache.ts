import { VaultsSortedByHoldersQuery } from '@/lib/algebra/graphql/generated/graphql';
import { ICHIVaultContract } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';

interface CachedVaultData {
  data: VaultsSortedByHoldersQuery;
  timestamp: number;
  chainId: string;
}

const CACHE_KEY = 'aquabera-vaults-cache';
const CACHE_DURATION = 30 * 1000; // 30 seconds instead of 2 minutes

export class VaultCache {
  private static instance: VaultCache;
  private cache: Map<string, CachedVaultData> = new Map();

  static getInstance(): VaultCache {
    if (!VaultCache.instance) {
      VaultCache.instance = new VaultCache();
    }
    return VaultCache.instance;
  }

  private getCacheKey(searchString: string = ''): string {
    const chainId = wallet.currentChainId?.toString() || 'unknown';
    const searchHash = searchString ? btoa(searchString).slice(0, 10) : 'all';
    return `${CACHE_KEY}-${chainId}-${searchHash}`;
  }

  getCachedData(searchString: string = ''): VaultsSortedByHoldersQuery | null {
    const key = this.getCacheKey(searchString);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCachedData(data: VaultsSortedByHoldersQuery, searchString: string = ''): void {
    const key = this.getCacheKey(searchString);
    const chainId = wallet.currentChainId?.toString() || 'unknown';
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      chainId,
    });
  }

  isDataStale(searchString: string = ''): boolean {
    const key = this.getCacheKey(searchString);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return true;
    }

    const now = Date.now();
    return now - cached.timestamp > CACHE_DURATION;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheInfo(searchString: string = ''): { hasData: boolean; isStale: boolean; age: number | null } {
    const key = this.getCacheKey(searchString);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return { hasData: false, isStale: true, age: null };
    }

    const age = Date.now() - cached.timestamp;
    const isStale = age > CACHE_DURATION;

    return { hasData: true, isStale, age };
  }

  // Preload data for common search terms
  async preloadCommonSearches(infoClient: any): Promise<void> {
    const commonSearches = ['', 'USDC', 'USDT', 'WETH'];
    
    for (const search of commonSearches) {
      const cacheInfo = this.getCacheInfo(search);
      if (cacheInfo.isStale) {
        try {
          const { getVaultPageData } = await import('@/lib/algebra/graphql/clients/vaults');
          const data = await getVaultPageData(infoClient, search);
          this.setCachedData(data, search);
        } catch (error) {
          console.error(`Error preloading data for search "${search}":`, error);
        }
      }
    }
  }

  // Force refresh cache for a specific search
  async forceRefresh(infoClient: any, searchString: string = ''): Promise<VaultsSortedByHoldersQuery | null> {
    try {
      const { getVaultPageData } = await import('@/lib/algebra/graphql/clients/vaults');
      const data = await getVaultPageData(infoClient, searchString);
      this.setCachedData(data, searchString);
      return data;
    } catch (error) {
      console.error(`Error force refreshing data for search "${searchString}":`, error);
      return null;
    }
  }

  // Get all cached keys
  getCachedKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get cache statistics
  getCacheStats(): { totalEntries: number; totalSize: number } {
    const totalEntries = this.cache.size;
    const totalSize = JSON.stringify(Array.from(this.cache.entries())).length;
    return { totalEntries, totalSize };
  }
}

export const vaultCache = VaultCache.getInstance(); 