import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import { BlockchainService } from '../blockchain/index.js';
import { CacheService } from './cache.js';
import { ethers, AbiCoder } from 'ethers';
export class BatchVerifier {
    static async addProof(proof) {
        this.pendingBatch.push(proof);
        if (this.pendingBatch.length >= this.BATCH_SIZE) {
            await this.processBatch();
        }
        else if (!this.batchTimeout) {
            this.batchTimeout = setTimeout(() => this.processBatch(), this.BATCH_TIMEOUT);
        }
    }
    static async processBatch() {
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        if (this.pendingBatch.length === 0)
            return;
        const currentBatch = [...this.pendingBatch];
        this.pendingBatch = [];
        try {
            logger.info(`Processing batch of ${currentBatch.length} proofs`);
            // Group proofs by protocol
            const groupedProofs = this.groupProofsByProtocol(currentBatch);
            // Process each protocol group
            for (const [protocol, proofs] of Object.entries(groupedProofs)) {
                await this.verifyBatch(protocol, proofs);
            }
            // Cache verification results
            await this.cacheBatchResults(currentBatch);
        }
        catch (error) {
            logger.error('Batch verification failed', { error });
            throw new AppError('Batch verification failed', 500, 'BATCH_VERIFICATION_FAILED');
        }
    }
    static groupProofsByProtocol(proofs) {
        return proofs.reduce((acc, proof) => {
            const protocol = proof.protocol;
            if (!acc[protocol])
                acc[protocol] = [];
            acc[protocol].push(proof);
            return acc;
        }, {});
    }
    static async verifyBatch(protocol, proofs) {
        try {
            // Aggregate proofs based on protocol
            const aggregatedProof = await this.aggregateProofs(protocol, proofs);
            // Verify on blockchain
            const isValid = await this.verifyBatchProofOnChain(protocol, aggregatedProof, proofs.map(p => p.id));
            if (!isValid) {
                throw new AppError('Batch verification failed', 500, 'INVALID_BATCH_PROOF');
            }
            logger.info(`Batch verification successful for protocol ${protocol}`);
        }
        catch (error) {
            logger.error(`Batch verification failed for protocol ${protocol}`, { error });
            throw error;
        }
    }
    static async verifyBatchProofOnChain(protocol, aggregatedProof, proofIds) {
        try {
            const proofHash = ethers.keccak256(ethers.encodeBytes32String(proofIds.join(',')));
            const abiCoder = AbiCoder.defaultAbiCoder();
            const encodedProof = abiCoder.encode(['tuple(string protocol, bytes proof, string[] proofIds)'], [{
                    protocol,
                    proof: ethers.encodeBytes32String(JSON.stringify(aggregatedProof)),
                    proofIds
                }]);
            // Get the verifier contract instance
            const verifierContract = await BlockchainService.getVerifierContract();
            const tx = await verifierContract.verifyBatchProof(proofHash, encodedProof);
            const receipt = await tx.wait();
            logger.info('Batch proof verified on chain', {
                protocol,
                proofIds,
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber
            });
            return true;
        }
        catch (error) {
            logger.error('Failed to verify batch proof on chain', { protocol, proofIds, error });
            throw new AppError('Blockchain batch verification failed', 500, 'BLOCKCHAIN_BATCH_VERIFICATION_FAILED');
        }
    }
    static async aggregateProofs(protocol, proofs) {
        switch (protocol) {
            case 'groth16':
                return this.aggregateGroth16Proofs(proofs);
            case 'plonk':
                return this.aggregatePlonkProofs(proofs);
            default:
                throw new AppError(`Unsupported protocol for batch verification: ${protocol}`, 400, 'UNSUPPORTED_PROTOCOL');
        }
    }
    static async aggregateGroth16Proofs(proofs) {
        // Implement Groth16 proof aggregation
        // This would use snarkjs or a similar library in production
        return {
            protocol: 'groth16',
            aggregatedProof: proofs.map(p => p.proof),
            publicSignals: proofs.map(p => p.publicSignals)
        };
    }
    static async aggregatePlonkProofs(proofs) {
        // Implement PLONK proof aggregation
        // This would use snarkjs or a similar library in production
        return {
            protocol: 'plonk',
            aggregatedProof: proofs.map(p => p.proof),
            publicSignals: proofs.map(p => p.publicSignals)
        };
    }
    static async cacheBatchResults(proofs) {
        const results = proofs.map(proof => ({
            proofId: proof.id,
            verified: true,
            timestamp: Date.now()
        }));
        await CacheService.set(`${this.CACHE_KEY}:${Date.now()}`, results, 3600 // 1 hour cache
        );
    }
    static async shutdown() {
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        if (this.pendingBatch.length > 0) {
            await this.processBatch();
        }
    }
}
BatchVerifier.BATCH_SIZE = 10;
BatchVerifier.BATCH_TIMEOUT = 5000; // 5 seconds
BatchVerifier.CACHE_KEY = 'batch_verifier';
BatchVerifier.pendingBatch = [];
BatchVerifier.batchTimeout = null;
