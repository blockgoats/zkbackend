import { db } from '../database/index.js';
import { CacheService } from './cache.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ethers } from 'ethers';

interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export class SessionService {
  private static readonly SESSION_CACHE_TTL = 3600; // 1 hour

  static async createSession(userId: string, token: string): Promise<Session> {
    try {
      const sessionId = `sess_${ethers.hexlify(ethers.randomBytes(16))}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.execute({
        sql: `
          INSERT INTO sessions (id, user_id, token, expires_at)
          VALUES (?, ?, ?, ?)
        `,
        args: [sessionId, userId, token, expiresAt.toISOString()]
      });

      const session = {
        id: sessionId,
        userId,
        token,
        expiresAt,
        createdAt: new Date()
      };

      // Cache session
      await CacheService.set(
        `session:${userId}`,
        session,
        this.SESSION_CACHE_TTL
      );

      logger.info('Session created', { userId, sessionId });
      return session;
    } catch (error) {
      logger.error('Failed to create session', { error });
      throw new AppError('Failed to create session', 500, 'SESSION_CREATION_FAILED');
    }
  }

  static async invalidateSession(userId: string, token: string): Promise<void> {
    try {
      // Delete from database
      await db.execute({
        sql: 'DELETE FROM sessions WHERE user_id = ? AND token = ?',
        args: [userId, token]
      });

      // Remove from cache
      await CacheService.delete(`session:${userId}`);

      // Blacklist token
      await CacheService.set(
        `blacklist:${token}`,
        true,
        24 * 60 * 60 // 24 hours
      );

      logger.info('Session invalidated', { userId });
    } catch (error) {
      logger.error('Failed to invalidate session', { error });
      throw new AppError('Failed to invalidate session', 500, 'SESSION_INVALIDATION_FAILED');
    }
  }

  static async validateSession(userId: string, token: string): Promise<boolean> {
    try {
      // Check cache first
      const cachedSession = await CacheService.get<Session>(`session:${userId}`);
      if (cachedSession?.token === token) {
        return true;
      }

      // Check database
      const result = await db.execute({
        sql: `
          SELECT * FROM sessions 
          WHERE user_id = ? AND token = ? AND expires_at > datetime('now')
        `,
        args: [userId, token]
      });

      const isValid = result.rows.length > 0;
      if (isValid) {
        // Update cache
        await CacheService.set(
          `session:${userId}`,
          result.rows[0],
          this.SESSION_CACHE_TTL
        );
      }

      return isValid;
    } catch (error) {
      logger.error('Failed to validate session', { error });
      throw new AppError('Failed to validate session', 500, 'SESSION_VALIDATION_FAILED');
    }
  }

  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await db.execute({
        sql: 'DELETE FROM sessions WHERE expires_at <= datetime("now")',
        args: []
      });
      logger.info('Cleaned up expired sessions');
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', { error });
    }
  }
}