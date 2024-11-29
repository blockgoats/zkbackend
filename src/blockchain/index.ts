import { ethers } from 'ethers';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import type { ProofVerification } from '../types/zkp.js';

export class BlockchainService {
  private static provider: ethers.JsonRpcProvider;
  private static verifierContract: ethers.Contract;
  private static wallet: ethers.Wallet;

  static async initialize() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(
        process.env.RPC_URL || 'http://localhost:8545'
      );

      // Initialize wallet
      this.wallet = new ethers.Wallet(
        process.env.PRIVATE_KEY || ethers.Wallet.createRandom().privateKey,
        this.provider
      );

      // Initialize verifier contract
      this.verifierContract = new ethers.Contract(
        process.env.VERIFIER_CONTRACT_ADDRESS!,
        [
          'function verifyProof(bytes32 proofId, bytes calldata proof) external returns (bool)',
          'function verifyBatchProof(bytes32 batchId, bytes calldata batchProof) external returns (bool)',
          'function getProofStatus(bytes32 proofId) external view returns (bool verified, uint256 timestamp, address verifier)'
        ],
        this.wallet
      );

      await this.provider.getNetwork();
      logger.info('Blockchain service initialized');
    } catch (error) {
      logger.error('Failed to initialize blockchain service', { error });
      throw error;
    }
  }

  static async getVerifierContract(): Promise<ethers.Contract> {
    if (!this.verifierContract) {
      await this.initialize();
    }
    return this.verifierContract;
  }

  static async verifyProofOnChain(
    proofId: string,
    verification: ProofVerification
  ): Promise<boolean> {
    try {
      const proofHash = ethers.id(proofId);
      const encodedProof = ethers.toUtf8Bytes(JSON.stringify(verification));

      const tx = await this.verifierContract.verifyProof(proofHash, encodedProof);
      const receipt = await tx.wait();

      logger.info('Proof verified on chain', {
        proofId,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      });

      return true;
    } catch (error) {
      logger.error('Failed to verify proof on chain', { proofId, error });
      throw new AppError(
        'Blockchain verification failed',
        500,
        'BLOCKCHAIN_VERIFICATION_FAILED'
      );
    }
  }

  static async verifyBatchProofOnChain(
    batchId: string,
    batchProof: string[]
  ): Promise<boolean> {
    try {
      const batchHash = ethers.id(batchId);
      const encodedBatchProof = ethers.AbiCoder.defaultAbiCoder().encode(
        ['bytes[]'],
        [batchProof.map((proof) => ethers.toUtf8Bytes(JSON.stringify(proof)))]
      );

      const tx = await this.verifierContract.verifyBatchProof(batchHash, encodedBatchProof);
      const receipt = await tx.wait();

      logger.info('Batch proof verified on chain', {
        batchId,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      });

      return true;
    } catch (error) {
      logger.error('Failed to verify batch proof on chain', { batchId, error });
      throw new AppError(
        'Blockchain batch verification failed',
        500,
        'BLOCKCHAIN_BATCH_VERIFICATION_FAILED'
      );
    }
  }

  static async getProofStatus(proofId: string): Promise<{
    verified: boolean;
    timestamp: number;
    verifier: string;
  }> {
    try {
      const proofHash = ethers.id(proofId);
      const status = await this.verifierContract.getProofStatus(proofHash);

      return {
        verified: status.verified,
        timestamp: Number(status.timestamp),
        verifier: status.verifier
      };
    } catch (error) {
      logger.error('Failed to get proof status', { proofId, error });
      throw new AppError(
        'Failed to get proof status',
        500,
        'PROOF_STATUS_ERROR'
      );
    }
  }
}