import { kv } from "./kv";

interface CacheData {
  data: string;
  timestamp: number;
}

export const getCacheKey = (chainId: number | string, key: string) => {
  return `${chainId}-${key}`;
};

export const cache = (key: string, data: string) => {
  kv.set(key, { data: data, timestamp: new Date().getTime() });
};

export const getCache = async (
  cacheKey: string
): Promise<string | null> => {
  const timeBeforeRefresh = 15 * 60 * 1000; // 15 min
  const rawCacheData = await kv.get<string>(cacheKey);

  if (!rawCacheData) {
    return null;
  }

  let cacheData: CacheData;
  try {
    // Parse the JSON string returned from KV store
    cacheData = typeof rawCacheData === 'string' ? JSON.parse(rawCacheData) : rawCacheData;
  } catch (error) {
    console.error('Failed to parse cache data:', error);
    return null;
  }

  if (new Date().getTime() - cacheData.timestamp > timeBeforeRefresh) {
    return null;
  }

  return cacheData.data;
};
