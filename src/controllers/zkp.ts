import { Request, Response } from 'express';
import { ZKPService } from '../services/zkp.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { ProofRequest, ProofVerification } from '../types/zkp.js';
import { RequestWithUser } from '../types/RequestWithUser.js';

export async function generateProof(req: RequestWithUser, res: Response) {
  const { userId } = req.user;
  const proofRequest: ProofRequest = req.body;

  try {
    const proof = await ZKPService.generateProof(userId, proofRequest);
    logger.info('Proof generated successfully', { userId, proofId: proof.id });
    res.status(201).json(proof);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Proof generation failed', { error });
    throw new AppError('Failed to generate proof', 500, 'PROOF_GENERATION_FAILED');
  }
}

export async function verifyProof(req: Request, res: Response) {
  const { proofId, proof }: { proofId: string; proof: ProofVerification } = req.body;

  try {
    const isValid = await ZKPService.verifyProof(proofId, proof);
    logger.info('Proof verified', { proofId, isValid });
    res.json({ isValid });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Proof verification failed', { error });
    throw new AppError('Failed to verify proof', 500, 'PROOF_VERIFICATION_FAILED');
  }
}

export async function getProofStatus(req: Request, res: Response) {
  const { proofId } = req.params;

  try {
    const status = await ZKPService.getProofStatus(proofId);
    res.json(status);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to get proof status', { error });
    throw new AppError('Failed to get proof status', 500, 'PROOF_STATUS_FAILED');
  }
}