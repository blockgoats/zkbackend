import jwt from 'jsonwebtoken';
import { AppError } from './../utils/errors.js';
import { logger } from './../utils/logger.js';
export class JWTUtils {
    static generateToken(payload) {
        return jwt.sign(payload, this.SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRES });
    }
    static generateRefreshToken(payload) {
        return jwt.sign({ ...payload, type: 'refresh' }, this.SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRES });
    }
    static verifyToken(token) {
        try {
            return jwt.verify(token, this.SECRET);
        }
        catch (error) {
            logger.error('Token verification failed', { error });
            throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
        }
    }
}
JWTUtils.SECRET = process.env.JWT_SECRET || 'supersecret';
JWTUtils.ACCESS_TOKEN_EXPIRES = '1h';
JWTUtils.REFRESH_TOKEN_EXPIRES = '7d';
