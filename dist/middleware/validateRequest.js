import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
export function validateRequest(schema) {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                logger.warn('Request validation failed', {
                    path: req.path,
                    errors: error.errors
                });
                throw new AppError('Validation failed: ' + error.errors.map(e => e.message).join(', '), 400, 'VALIDATION_ERROR');
            }
            next(error);
        }
    };
}
