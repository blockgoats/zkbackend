import jwt from 'jsonwebtoken';
import { AppError } from './../utils/errors.js';
import { logger } from './../utils/logger.js';

interface TokenPayload {
  userId: string;
  username: string;
}

export class JWTUtils {
  private static readonly SECRET = process.env.JWT_SECRET || 'supersecret';
  private static readonly ACCESS_TOKEN_EXPIRES = '1h';
  private static readonly REFRESH_TOKEN_EXPIRES = '7d';

  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRES });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign({ ...payload, type: 'refresh' }, this.SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRES });
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.SECRET) as TokenPayload;
    } catch (error) {
      logger.error('Token verification failed', { error });
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
    }
  }
}
