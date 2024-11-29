import { logger } from '../utils/logger.js';

interface CacheOptions {
  ttl?: number;
  maxSize?: number;
}

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class CacheService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static readonly DEFAULT_TTL = 3600; // 1 hour
  private static readonly MAX_SIZE = 10000;

  static async set<T>(
    key: string,
    value: T,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    // Cleanup if cache is too large
    if (this.cache.size >= this.MAX_SIZE) {
      this.cleanup();
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });

    logger.debug('Cache entry set', { key, ttl });
  }

  static async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  static async delete(key: string): Promise<void> {
    this.cache.delete(key);
    logger.debug('Cache entry deleted', { key });
  }

  static async clear(): Promise<void> {
    this.cache.clear();
    logger.debug('Cache cleared');
  }

  private static cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cleaned ${cleaned} expired cache entries`);
    }

    // If still too large, remove oldest entries
    if (this.cache.size >= this.MAX_SIZE) {
      const entriesToDelete = Array.from(this.cache.entries())
        .sort((a, b) => a[1].expiry - b[1].expiry)
        .slice(0, Math.floor(this.MAX_SIZE * 0.2))
        .map(([key]) => key);

      entriesToDelete.forEach(key => this.cache.delete(key));
      logger.debug(`Removed ${entriesToDelete.length} old cache entries`);
    }
  }
}