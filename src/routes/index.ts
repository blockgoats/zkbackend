import { Express } from 'express';
import { authRouter } from './auth.js';
import { projectsRouter } from './projects.js';
import { zkpRouter } from './zkp.js';
import { healthRouter } from './health.js';

const API_VERSION = 'v1';

export function setupRoutes(app: Express) {
  // Health check endpoint (no version prefix)
  app.use('/health', healthRouter);
  
  // API versioned routes
  app.use(`/api/${API_VERSION}/auth`, authRouter);
  app.use(`/api/${API_VERSION}/projects`, projectsRouter);
  app.use(`/api/${API_VERSION}/zkp`, zkpRouter);
  
  // API documentation
  app.get('/', (req, res) => {
    res.redirect('/api-docs');
  });
}