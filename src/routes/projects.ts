import { Router, Request, Response, RequestHandler } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { projectSchema, apiKeySchema } from '../schemas/project.js';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  regenerateApiKey
} from '../controllers/projects.js';
import { RequestWithUser } from '../types/RequestWithUser.js';

const router = Router();

router.use(authenticate);

router.post('/', validateRequest(projectSchema), createProject as RequestHandler);
router.get('/', getProjects as RequestHandler);
router.get('/:projectId', getProject as RequestHandler);
router.put('/:projectId', validateRequest(projectSchema), updateProject as RequestHandler);
router.delete('/:projectId', deleteProject as RequestHandler);
router.post('/:projectId/keys', validateRequest(apiKeySchema), regenerateApiKey as RequestHandler);

export { router as projectsRouter };