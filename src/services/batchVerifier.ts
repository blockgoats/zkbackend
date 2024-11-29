import { ZKProof } from '../types/zkp.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import { BlockchainService } from '../blockchain/index.js';
import { CacheService } from './cache.js';
import { ethers, AbiCoder } from 'ethers';

export class BatchVerifier {
  private static readonly BATCH_SIZE = 10;
  private static readonly BATCH_TIMEOUT = 5000; // 5 seconds
  private static readonly CACHE_KEY = 'batch_verifier';

  private static pendingBatch: ZKProof[] = [];
  private static batchTimeout: NodeJS.Timeout | null = null;

  static async addProof(proof: ZKProof): Promise<void> {
    this.pendingBatch.push(proof);
    
    if (this.pendingBatch.length >= this.BATCH_SIZE) {
      await this.processBatch();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.processBatch(), this.BATCH_TIMEOUT);
    }
  }

  private static async processBatch(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.pendingBatch.length === 0) return;

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

    } catch (error) {
      logger.error('Batch verification failed', { error });
      throw new AppError('Batch verification failed', 500, 'BATCH_VERIFICATION_FAILED');
    }
  }

  private static groupProofsByProtocol(proofs: ZKProof[]): Record<string, ZKProof[]> {
    return proofs.reduce((acc, proof) => {
      const protocol = proof.protocol;
      if (!acc[protocol]) acc[protocol] = [];
      acc[protocol].push(proof);
      return acc;
    }, {} as Record<string, ZKProof[]>);
  }

  private static async verifyBatch(protocol: string, proofs: ZKProof[]): Promise<void> {
    try {
      // Aggregate proofs based on protocol
      const aggregatedProof = await this.aggregateProofs(protocol, proofs);

      // Verify on blockchain
      const isValid = await this.verifyBatchProofOnChain(
        protocol,
        aggregatedProof,
        proofs.map(p => p.id)
      );

      if (!isValid) {
        throw new AppError('Batch verification failed', 500, 'INVALID_BATCH_PROOF');
      }

      logger.info(`Batch verification successful for protocol ${protocol}`);
    } catch (error) {
      logger.error(`Batch verification failed for protocol ${protocol}`, { error });
      throw error;
    }
  }

  private static async verifyBatchProofOnChain(
    protocol: string,
    aggregatedProof: any,
    proofIds: string[]
  ): Promise<boolean> {
    try {
      const proofHash = ethers.keccak256(ethers.encodeBytes32String(proofIds.join(',')));
      const abiCoder = AbiCoder.defaultAbiCoder();
      const encodedProof = abiCoder.encode(
        ['tuple(string protocol, bytes proof, string[] proofIds)'],
        [{
          protocol,
          proof: ethers.encodeBytes32String(JSON.stringify(aggregatedProof)),
          proofIds
        }]
      );

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
    } catch (error) {
      logger.error('Failed to verify batch proof on chain', { protocol, proofIds, error });
      throw new AppError(
        'Blockchain batch verification failed',
        500,
        'BLOCKCHAIN_BATCH_VERIFICATION_FAILED'
      );
    }
  }

  private static async aggregateProofs(
    protocol: string,
    proofs: ZKProof[]
  ): Promise<any> {
    switch (protocol) {
      case 'groth16':
        return this.aggregateGroth16Proofs(proofs);
      case 'plonk':
        return this.aggregatePlonkProofs(proofs);
      default:
        throw new AppError(
          `Unsupported protocol for batch verification: ${protocol}`,
          400,
          'UNSUPPORTED_PROTOCOL'
        );
    }
  }

  private static async aggregateGroth16Proofs(proofs: ZKProof[]): Promise<any> {
    // Implement Groth16 proof aggregation
    // This would use snarkjs or a similar library in production
    return {
      protocol: 'groth16',
      aggregatedProof: proofs.map(p => p.proof),
      publicSignals: proofs.map(p => p.publicSignals)
    };
  }

  private static async aggregatePlonkProofs(proofs: ZKProof[]): Promise<any> {
    // Implement PLONK proof aggregation
    // This would use snarkjs or a similar library in production
    return {
      protocol: 'plonk',
      aggregatedProof: proofs.map(p => p.proof),
      publicSignals: proofs.map(p => p.publicSignals)
    };
  }

  private static async cacheBatchResults(proofs: ZKProof[]): Promise<void> {
    const results = proofs.map(proof => ({
      proofId: proof.id,
      verified: true,
      timestamp: Date.now()
    }));

    await CacheService.set(
      `${this.CACHE_KEY}:${Date.now()}`,
      results,
      3600 // 1 hour cache
    );
  }

  static async shutdown(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.pendingBatch.length > 0) {
      await this.processBatch();
    }
  }
}