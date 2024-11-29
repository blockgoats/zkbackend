import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';
export function errorHandler(err, req, res, next) {
    // Log error details
    logger.error('Error occurred', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });
    // Handle known error types
    if (err instanceof AppError) {
        const response = {
            status: 'error',
            code: err.code,
            message: err.message,
            ...(err.metadata && { metadata: err.metadata })
        };
        if (err.code === 'RATE_LIMIT_EXCEEDED') {
            res.setHeader('Retry-After', err.metadata?.retryAfter || 60);
        }
        return res.status(err.statusCode).json(response);
    }
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'error',
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            errors: err.errors.map(e => ({
                path: e.path.join('.'),
                message: e.message
            }))
        });
    }
    // Handle unexpected errors
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: isProduction ? 'An unexpected error occurred' : err.message,
        ...(isProduction ? {} : { stack: err.stack })
    });
}
