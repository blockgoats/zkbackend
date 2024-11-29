import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import { BatchVerifier } from './batchVerifier.js';
export class ProofAggregator {
    static async addProof(proof) {
        this.pendingProofs.set(proof.id, proof);
        logger.debug(`Added proof to aggregation queue`, { proofId: proof.id });
        if (this.pendingProofs.size >= this.MAX_BATCH_SIZE) {
            await this.aggregateAndVerify();
        }
        else if (!this.aggregationTimer) {
            this.aggregationTimer = setTimeout(() => this.aggregateAndVerify(), this.AGGREGATION_TIMEOUT);
        }
    }
    static async aggregateAndVerify() {
        if (this.pendingProofs.size === 0)
            return true;
        if (this.aggregationTimer) {
            clearTimeout(this.aggregationTimer);
            this.aggregationTimer = null;
        }
        try {
            const proofs = Array.from(this.pendingProofs.values());
            logger.info(`Aggregating ${proofs.length} proofs`);
            // Group proofs by protocol
            const groupedProofs = this.groupByProtocol(proofs);
            // Process each protocol group
            const results = await Promise.all(Object.entries(groupedProofs).map(([protocol, proofs]) => this.aggregateProtocolProofs(protocol, proofs)));
            const success = results.every(result => result);
            this.pendingProofs.clear();
            return success;
        }
        catch (error) {
            logger.error('Proof aggregation failed', { error });
            throw new AppError('Proof aggregation failed', 500, 'PROOF_AGGREGATION_FAILED');
        }
    }
    static groupByProtocol(proofs) {
        return proofs.reduce((acc, proof) => {
            if (!acc[proof.protocol])
                acc[proof.protocol] = [];
            acc[proof.protocol].push(proof);
            return acc;
        }, {});
    }
    static async aggregateProtocolProofs(protocol, proofs) {
        try {
            // Send to batch verifier for processing
            await BatchVerifier.addProof(proofs[0]); // Example: process first proof
            return true;
        }
        catch (error) {
            logger.error(`Protocol proof aggregation failed: ${protocol}`, { error });
            return false;
        }
    }
    static async shutdown() {
        if (this.aggregationTimer) {
            clearTimeout(this.aggregationTimer);
            this.aggregationTimer = null;
        }
        if (this.pendingProofs.size > 0) {
            await this.aggregateAndVerify();
        }
    }
}
ProofAggregator.MAX_BATCH_SIZE = 10;
ProofAggregator.AGGREGATION_TIMEOUT = 5000; // 5 seconds
ProofAggregator.pendingProofs = new Map();
ProofAggregator.aggregationTimer = null;
