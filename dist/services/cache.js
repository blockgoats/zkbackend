import { logger } from '../utils/logger.js';
export class CacheService {
    static async set(key, value, ttl = this.DEFAULT_TTL) {
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
    static async get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    static async delete(key) {
        this.cache.delete(key);
        logger.debug('Cache entry deleted', { key });
    }
    static async clear() {
        this.cache.clear();
        logger.debug('Cache cleared');
    }
    static cleanup() {
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
CacheService.cache = new Map();
CacheService.DEFAULT_TTL = 3600; // 1 hour
CacheService.MAX_SIZE = 10000;
