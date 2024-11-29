import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { initializeDatabase } from './database/index.js';
import { logger } from './utils/logger.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Basic middleware
app.use(express.json());
app.use(requestLogger);
app.use(createRateLimiter());
// Routes
setupRoutes(app);
// Error handling
app.use(errorHandler);
async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();
        const server = app.listen(port, () => {
            logger.info(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM signal received. Shutting down gracefully...');
            server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });
        });
    }
    catch (error) {
        logger.error('Failed to start server:');
        console.log(error);
        process.exit(1);
    }
}
startServer();
