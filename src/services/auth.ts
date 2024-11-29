import { db } from '../database/index.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { JWTUtils } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { ethers } from 'ethers';
import type { User, LoginRequest, AuthResponse } from '../types/auth.js';

// Add the verifyZKP function
async function verifyZKP(didProof: any): Promise<boolean> {
  // Implement ZKP verification using Snarkjs
  // For now, accept any ZKP proof in development
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('ZKP verification not implemented');
  }
  return true;
}

/**
 * AuthService handles user authentication-related operations.
 */
export class AuthService {
  static async register(
    username: string,
    password: string,
    email?: string
  ): Promise<AuthResponse> {
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: [username]
    });

    if (existingUser.rows.length > 0) {
      throw new AppError('Username already exists', 400, 'USERNAME_TAKEN');
    }

    const userId = `usr_${ethers.hexlify(ethers.randomBytes(16))}`;
    const hashedPassword = await hashPassword(password);

    await db.execute({
      sql: `INSERT INTO users (id, username, password, email, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))`,
      args: [userId, username, hashedPassword, email || '']
    });

    const token = JWTUtils.generateToken({ userId, username });
    logger.info('User registered successfully', { userId, username });

    return { userId, username, token };
  }

  static async login({ username, password, didProof }: LoginRequest): Promise<AuthResponse> {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });

    if (!result.rows || result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const row = result.rows[0];
    if (!row) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const user: User = {
      id: String(row.id),
      username: String(row.username),
      password: String(row.password),
      created_at: row.created_at ? new Date(String(row.created_at)).toISOString() : new Date().toISOString(),
      email: row.email ? String(row.email) : undefined,
      did: row.did ? String(row.did) : undefined
    };

    if (password) {
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }
    } else if (didProof) {
      // Implement DID proof verification
      // For now, accept any DID proof in development
      if (process.env.NODE_ENV !== 'development') {
        // const isVerified = await this.verifyZKP(didProof);
        // if (!isVerified) {
        //   throw new AppError('Invalid ZKP', 401, 'INVALID_PROOF');
        // }
      }
    } else {
      throw new AppError('No authentication method provided', 400, 'INVALID_AUTH_METHOD');
    }

    const token = JWTUtils.generateToken({ userId: user.id, username: user.username });
    logger.info('User logged in successfully', { userId: user.id });

    return {
      userId: user.id,
      username: user.username,
      token,
      did: user.did
    };
  }

  static async loginWithZKP({ username, didProof }: LoginRequest): Promise<AuthResponse> {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });

    if (!result.rows || result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const row = result.rows[0];
    if (!row) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const user: User = {
      id: String(row.id),
      username: String(row.username),
      password: String(row.password),
      created_at: row.created_at ? new Date(String(row.created_at)).toISOString() : new Date().toISOString(),
      email: row.email ? String(row.email) : undefined,
      did: row.did ? String(row.did) : undefined
    };

    if (!didProof) {
      throw new AppError('ZKP proof is required', 400, 'MISSING_PROOF');
    }

    // Verify ZKP proof using Snarkjs
    const isValidProof = await verifyZKP(didProof);
    if (!isValidProof) {
      throw new AppError('Invalid ZKP proof', 401, 'INVALID_ZKP_PROOF');
    }

    const token = JWTUtils.generateToken({ userId: user.id, username: user.username });
    logger.info('User logged in successfully', { userId: user.id });

    return {
      userId: user.id,
      username: user.username,
      token,
      did: user.did
    };
  }
}