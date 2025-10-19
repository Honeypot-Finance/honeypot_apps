import { kv as vercelKv } from "@vercel/kv";

// Fallback Map implementation for development
class LocalMap {
  private data = new Map<string, string>();
  
  async set(key: string, value: any, options?: any): Promise<string> {
    try {
      // Always store as string to match Vercel KV behavior
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      this.data.set(key, stringValue);
      return "OK";
    } catch (error) {
      console.error('LocalMap.set error:', error);
      throw error;
    }
  }
  
  async get<T = any>(key: string): Promise<T | null> {
    const value = this.data.get(key);
    if (!value) return null;
    
    // Return the stored string value as-is, let the calling code handle JSON parsing
    // This matches Vercel KV behavior which stores and returns strings
    return value as T;
  }
}

export const kv = process.env.KV_URL ? vercelKv : new LocalMap();

export const createCache = (namespace: string) => {
  return {
    set: async (key: string, value: any, options?: any) => {
      const namespacedKey = `${namespace}-${key}`;
      return kv.set(namespacedKey, value, options);
    },
    get<T>(key: string) {
      const namespacedKey = `${namespace}-${key}`;
      return kv.get<T>(namespacedKey);
    },
  };
};
