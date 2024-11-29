import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { CacheService } from '../services/cache.js';
import { logger } from '../utils/logger.js';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (req: Request) => {
    return `${req.ip}:${req.path}`;
  }
};

export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const options = { ...defaultConfig, ...config };

  return async function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const key = `ratelimit:${options.keyGenerator!(req)}`;
    
    try {
      const current = await CacheService.get<{ count: number, reset: number }>(key);
      const now = Date.now();

      if (!current) {
        // First request in window
        await CacheService.set(key, {
          count: 1,
          reset: now + options.windowMs
        }, options.windowMs / 1000);
        return next();
      }

      if (now > current.reset) {
        // Window expired, reset counter
        await CacheService.set(key, {
          count: 1,
          reset: now + options.windowMs
        }, options.windowMs / 1000);
        return next();
      }

      if (current.count >= options.max) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((current.reset - now) / 1000);
        
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          retryAfter
        });

        throw new AppError(
          'Too many requests',
          429,
          'RATE_LIMIT_EXCEEDED',
          { retryAfter }
        );
      }

      // Increment counter
      await CacheService.set(key, {
        count: current.count + 1,
        reset: current.reset
      }, (current.reset - now) / 1000);

      next();
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Rate limiter error', { error });
      next(error);
    }
  };
}