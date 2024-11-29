import { z } from 'zod';

export const projectSchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, 'Project name must be at least 3 characters')
      .max(50, 'Project name cannot exceed 50 characters'),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    environment: z.enum(['development', 'production']),
    allowedOrigins: z.string()
      .min(1, 'Allowed origins cannot be empty')
      .regex(/^(\*|https?:\/\/[^\s,]+)(,\s*https?:\/\/[^\s,]+)*$/, 'Invalid allowed origins format')
  })
});

export const updateProjectSchema = projectSchema.deepPartial();

export const apiKeySchema = z.object({
  params: z.object({
    projectId: z.string().regex(/^proj_[a-zA-Z0-9]+$/, 'Invalid project ID format')
  })
});