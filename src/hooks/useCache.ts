import { useState, useEffect, useCallback } from 'react';
import { openDB, IDBPDatabase } from 'idb';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  strategy?: 'cache-first' | 'network-first' | 'cache-only' | 'network-only';
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private db: IDBPDatabase | null = null;
  private memoryCache = new Map<string, CacheEntry<any>>();

  async init() {
    if (this.db) return;
    
    this.db = await openDB('RepairConnectCache', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
      },
    });
  }

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data;
    }

    // Check IndexedDB
    if (!this.db) await this.init();
    
    try {
      const entry = await this.db!.get('cache', key);
      if (entry && this.isValid(entry)) {
        // Restore to memory cache
        this.memoryCache.set(key, entry);
        return entry.data;
      }
    } catch (error) {
      console.warn('Cache get error:', error);
    }

    return null;
  }

  async set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // Set in memory cache
    this.memoryCache.set(key, entry);

    // Set in IndexedDB
    if (!this.db) await this.init();
    
    try {
      await this.db!.put('cache', entry, key);
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    if (!this.db) await this.init();
    
    try {
      await this.db!.delete('cache', key);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    if (!this.db) await this.init();
    
    try {
      await this.db!.clear('cache');
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  // Cleanup expired entries
  async cleanup(): Promise<void> {
    // Memory cache cleanup
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // IndexedDB cleanup
    if (!this.db) await this.init();
    
    try {
      const tx = this.db!.transaction('cache', 'readwrite');
      const store = tx.objectStore('cache');
      const cursor = await store.openCursor();
      
      if (cursor) {
        do {
          const entry = cursor.value;
          if (!this.isValid(entry)) {
            await cursor.delete();
          }
        } while (await cursor.continue());
      }
      
      await tx.done;
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }
}

const cacheManager = new CacheManager();

export const useCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    strategy = 'cache-first'
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceFresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Cache-first strategy
      if (strategy === 'cache-first' && !forceFresh) {
        const cached = await cacheManager.get<T>(key);
        if (cached) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      // Network-only or cache miss
      if (strategy !== 'cache-only') {
        const freshData = await fetcher();
        await cacheManager.set(key, freshData, ttl);
        setData(freshData);
        setLoading(false);
        return freshData;
      }

      // Cache-only but no data
      setData(null);
      setLoading(false);
      return null;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      
      // On error, try to return cached data if available
      if (strategy !== 'network-only') {
        const cached = await cacheManager.get<T>(key);
        if (cached) {
          setData(cached);
          return cached;
        }
      }
      
      throw err;
    }
  }, [key, fetcher, ttl, strategy]);

  const invalidate = useCallback(async () => {
    await cacheManager.delete(key);
    return fetchData(true);
  }, [key, fetchData]);

  const updateCache = useCallback(async (newData: T) => {
    await cacheManager.set(key, newData, ttl);
    setData(newData);
  }, [key, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optional: cleanup specific cache entry on unmount
      // cacheManager.delete(key);
    };
  }, [key]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate,
    updateCache
  };
};

// Global cache utilities
export const clearAllCache = () => cacheManager.clear();
export const cleanupCache = () => cacheManager.cleanup();

// Set up periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup();
  }, 10 * 60 * 1000); // Cleanup every 10 minutes
}