import { Request, Response } from 'express';
import { AuthService } from '../services/auth.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { RequestWithUser } from '../types/RequestWithUser.js'; 
import {JWTUtils} from './../utils/jwt.js';
import { ZKPService } from '../services/zkp.js';

export async function registerUser(req: Request, res: Response) {
  const { username, password, email } = req.body;

  try {
    const result = await AuthService.register(username, password, email);
    logger.info('User registered successfully', { username });
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Registration failed', { error });
    throw new AppError('Registration failed', 500, 'REGISTRATION_FAILED');
  }
}

export async function loginUser(req: Request, res: Response) {
  const { username, password, didProof } = req.body;

  try {
    const result = await AuthService.login({ username, password, didProof });
    logger.info('User logged in successfully', { username });
    res.json(result);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Login failed', { error });
    throw new AppError('Login failed', 500, 'LOGIN_FAILED');
  }
}

export async function loginUser1(req: Request, res: Response) {
  const { username, didProof, proofId } = req.body;

  try {
    // Verify ZKP proof using ZKPService
    const isValidProof = await ZKPService.verifyProof(proofId, didProof);
    if (!isValidProof) {
      throw new AppError('Invalid ZKP proof', 401, 'INVALID_ZKP_PROOF');
    }

    const result = await AuthService.login({ username, didProof });
    logger.info('User logged in successfully', { username });
    res.json(result);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Login failed', { error });
    throw new AppError('Login failed', 500, 'LOGIN_FAILED');
  }
}

export async function logout(req: RequestWithUser, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const userId = req.user.userId;

    // Perform logout logic, e.g., invalidate refresh token or clear session
    // If you're using a Redis or database session store, remove the session entry
    // Example:
    // await sessionStore.deleteSession(userId);

    logger.info('User logged out successfully', { userId });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout failed', { error });
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
}


// export async function logout(req: Request, res: Response) {
//   const { userId } = req.user;

//   try {
//     await AuthService.logout(userId);
//     logger.info('User logged out successfully', { userId });
//     res.status(204).send();
//   } catch (error) {
//     if (error instanceof AppError) throw error;
//     logger.error('Logout failed', { error });
//     throw new AppError('Logout failed', 500, 'LOGOUT_FAILED');
//   }
// }


export async function refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.body;

  try {
    // Verify the refresh token
    const decoded = JWTUtils.verifyToken(refreshToken);

    // Ensure the token is of type 'refresh'
    // if (decoded.type !== 'refresh') {
    //   throw new AppError('Invalid token type', 401, 'INVALID_TOKEN_TYPE');
    // }

    // Generate a new access token
    const accessToken = JWTUtils.generateToken({
      userId: decoded.userId,
      username: decoded.username,
    });

    logger.info('Token refreshed successfully', { userId: decoded.userId });

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn('Token refresh failed', { error });
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      logger.error('Unexpected error during token refresh', { error });
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
}
