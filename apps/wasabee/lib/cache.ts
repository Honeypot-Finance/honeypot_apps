import { kv } from "./kv";

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
  const cacheData = await kv.get(cacheKey);

  if (!cacheData) {
    return null;
  }

  if (new Date().getTime() - cacheData.timestamp > timeBeforeRefresh) {
    return null;
  }

  return cacheData.data;
};
