import { db } from '../database/index.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ethers } from 'ethers';

interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  environment: 'development' | 'production';
  allowedOrigins: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
}

export class ProjectService {
  static async createProject(userId: string, data: Partial<Project>): Promise<Project> {
    try {
      const projectId = `proj_${ethers.hexlify(ethers.randomBytes(16))}`;
      const apiKey = this.generateApiKey(data.environment || 'development');

      await db.execute({
        sql: `
          INSERT INTO projects (
            id, user_id, name, description, environment,
            allowed_origins, api_key, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `,
        args: [
          projectId,
          userId,
          data.name || 'Unnamed Project',
          data.description || '',
          data.environment || 'development',
          data.allowedOrigins || '*',
          apiKey
        ]
      });

      logger.info('Project created successfully', { projectId, userId });

      return {
        id: projectId,
        userId,
        name: data.name || 'Unnamed Project',
        description: data.description,
        environment: data.environment || 'development',
        allowedOrigins: data.allowedOrigins || '*',
        apiKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to create project', { error });
      throw new AppError('Failed to create project', 500, 'PROJECT_CREATION_FAILED');
    }
  }

  static async getProjects(userId: string): Promise<Project[]> {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
        args: [userId]
      });

      return result.rows.map(row => ({
        id: String(row.id),
        userId: String(row.user_id),
        name: String(row.name),
        description: row.description ? String(row.description) : undefined,
        environment: String(row.environment) as 'development' | 'production',
        allowedOrigins: String(row.allowed_origins),
        apiKey: String(row.api_key),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
      }));
    } catch (error) {
      logger.error('Failed to get projects', { error });
      throw new AppError('Failed to get projects', 500, 'PROJECT_FETCH_FAILED');
    }
  }

  static async getProject(userId: string, projectId: string): Promise<Project | null> {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM projects WHERE id = ? AND user_id = ?',
        args: [projectId, userId]
      });

      if (!result.rows[0]) return null;

      const row = result.rows[0];
      return {
        id: String(row.id),
        userId: String(row.user_id),
        name: String(row.name),
        description: row.description ? String(row.description) : undefined,
        environment: String(row.environment) as 'development' | 'production',
        allowedOrigins: String(row.allowed_origins),
        apiKey: String(row.api_key),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at)
      };
    } catch (error) {
      logger.error('Failed to get project', { error });
      throw new AppError('Failed to get project', 500, 'PROJECT_FETCH_FAILED');
    }
  }

  static async updateProject(
    userId: string,
    projectId: string,
    updates: Partial<Project>
  ): Promise<Project> {
    try {
      const project = await this.getProject(userId, projectId);
      if (!project) {
        throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      const updatedProject = { ...project, ...updates, updatedAt: new Date().toISOString() };

      await db.execute({
        sql: `
          UPDATE projects
          SET name = ?, description = ?, environment = ?, allowed_origins = ?, updated_at = datetime('now')
          WHERE id = ? AND user_id = ?
        `,
        args: [
          updatedProject.name,
          updatedProject.description || '',
          updatedProject.environment,
          updatedProject.allowedOrigins,
          projectId,
          userId
        ]
      });

      logger.info('Project updated successfully', { projectId, userId });

      return updatedProject;
    } catch (error) {
      logger.error('Failed to update project', { error });
      throw new AppError('Failed to update project', 500, 'PROJECT_UPDATE_FAILED');
    }
  }

  static async deleteProject(userId: string, projectId: string): Promise<void> {
    try {
      const result = await db.execute({
        sql: 'DELETE FROM projects WHERE id = ? AND user_id = ?',
        args: [projectId, userId]
      });

      if (result.rowsAffected === 0) {
        throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      logger.info('Project deleted successfully', { projectId, userId });
    } catch (error) {
      logger.error('Failed to delete project', { error });
      throw new AppError('Failed to delete project', 500, 'PROJECT_DELETION_FAILED');
    }
  }

  static async regenerateApiKey(userId: string, projectId: string): Promise<string> {
    try {
      const project = await this.getProject(userId, projectId);
      if (!project) {
        throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      const newApiKey = this.generateApiKey(project.environment);

      await db.execute({
        sql: 'UPDATE projects SET api_key = ? WHERE id = ? AND user_id = ?',
        args: [newApiKey, projectId, userId]
      });

      logger.info('API key regenerated successfully', { projectId, userId });

      return newApiKey;
    } catch (error) {
      logger.error('Failed to regenerate API key', { error });
      throw new AppError('Failed to regenerate API key', 500, 'API_KEY_REGENERATION_FAILED');
    }
  }

  private static generateApiKey(environment: string): string {
    const prefix = environment === 'production' ? 'zk_live_' : 'zk_test_';
    return `${prefix}${ethers.hexlify(ethers.randomBytes(24)).slice(2)}`;
  }
}