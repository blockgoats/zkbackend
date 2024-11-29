import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username cannot exceed 50 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    email: z.string()
      .email('Invalid email address')
      .optional(),
    did: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string(),
    password: z.string().optional(),
    didProof: z.record(z.unknown()).optional()
  }).refine(
    data => data.password || data.didProof,
    'Either password or DID proof must be provided'
  )
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
  })
});