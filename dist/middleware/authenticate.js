import { JWTUtils } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
export async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401, 'UNAUTHORIZED');
        }
        const token = authHeader.split(' ')[1];
        const decoded = JWTUtils.verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        logger.error('Authentication failed', { error });
        if (error instanceof AppError) {
            next(error);
        }
        else {
            next(new AppError('Authentication failed', 401, 'UNAUTHORIZED'));
        }
    }
}
