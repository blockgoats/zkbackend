import { Request, Response } from 'express';
import { ProjectService } from '../services/project.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { RequestWithUser } from '../types/RequestWithUser.js'; 

export async function createProject(req: RequestWithUser, res: Response) {
  const { userId } = req.user;
  const projectData = req.body;

  try {
    const project = await ProjectService.createProject(userId, projectData);
    logger.info('Project created successfully', { userId, projectId: project.id });
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Project creation failed', { error });
    throw new AppError('Failed to create project', 500, 'PROJECT_CREATION_FAILED');
  }
}

export async function getProjects(req: RequestWithUser, res: Response) {
  const { userId } = req.user;

  try {
    const projects = await ProjectService.getProjects(userId);
    res.json(projects);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to get projects', { error });
    throw new AppError('Failed to get projects', 500, 'PROJECT_FETCH_FAILED');
  }
}

export async function getProject(req: RequestWithUser, res: Response) {
  const { userId } = req.user;
  const { projectId } = req.params;

  try {
    const project = await ProjectService.getProject(userId, projectId);
    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }
    res.json(project);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to get project', { error });
    throw new AppError('Failed to get project', 500, 'PROJECT_FETCH_FAILED');
  }
}

export async function updateProject(req: RequestWithUser, res: Response) {
  const { userId } = req.user;
  const { projectId } = req.params;
  const updates = req.body;

  try {
    const project = await ProjectService.updateProject(userId, projectId, updates);
    logger.info('Project updated successfully', { userId, projectId });
    res.json(project);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Project update failed', { error });
    throw new AppError('Failed to update project', 500, 'PROJECT_UPDATE_FAILED');
  }
}

export async function deleteProject(req: RequestWithUser, res: Response) {
  const { userId } = req.user;
  const { projectId } = req.params;

  try {
    await ProjectService.deleteProject(userId, projectId);
    logger.info('Project deleted successfully', { userId, projectId });
    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Project deletion failed', { error });
    throw new AppError('Failed to delete project', 500, 'PROJECT_DELETION_FAILED');
  }
}

export async function regenerateApiKey(req: RequestWithUser, res: Response) {
  const { userId } = req.user;
  const { projectId } = req.params;

  try {
    const apiKey = await ProjectService.regenerateApiKey(userId, projectId);
    logger.info('API key regenerated successfully', { userId, projectId });
    res.json({ apiKey });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('API key regeneration failed', { error });
    throw new AppError('Failed to regenerate API key', 500, 'API_KEY_REGENERATION_FAILED');
  }
}