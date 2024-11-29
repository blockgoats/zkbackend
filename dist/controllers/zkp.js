import { ZKPService } from '../services/zkp.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
export async function generateProof(req, res) {
    const { userId } = req.user;
    const proofRequest = req.body;
    try {
        const proof = await ZKPService.generateProof(userId, proofRequest);
        logger.info('Proof generated successfully', { userId, proofId: proof.id });
        res.status(201).json(proof);
    }
    catch (error) {
        if (error instanceof AppError)
            throw error;
        logger.error('Proof generation failed', { error });
        throw new AppError('Failed to generate proof', 500, 'PROOF_GENERATION_FAILED');
    }
}
export async function verifyProof(req, res) {
    const { proofId, proof } = req.body;
    try {
        const isValid = await ZKPService.verifyProof(proofId, proof);
        logger.info('Proof verified', { proofId, isValid });
        res.json({ isValid });
    }
    catch (error) {
        if (error instanceof AppError)
            throw error;
        logger.error('Proof verification failed', { error });
        throw new AppError('Failed to verify proof', 500, 'PROOF_VERIFICATION_FAILED');
    }
}
export async function getProofStatus(req, res) {
    const { proofId } = req.params;
    try {
        const status = await ZKPService.getProofStatus(proofId);
        res.json(status);
    }
    catch (error) {
        if (error instanceof AppError)
            throw error;
        logger.error('Failed to get proof status', { error });
        throw new AppError('Failed to get proof status', 500, 'PROOF_STATUS_FAILED');
    }
}
