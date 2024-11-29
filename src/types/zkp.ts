export interface ZKProof {
  id: string;
  userId: string;
  challenge: string;
  timestamp: number;
  publicSignals: string[];
  proof: any;
  status: 'pending' | 'verified' | 'failed';
  protocol: string;
  curve: string;
  verifiedAt?: number;
  metadata?: Record<string, any>;
}

export interface ProofRequest {
  challenge: string;
  protocol?: string;
  curve?: string;
  publicInputs?: any[];
  metadata?: Record<string, any>;
}

export interface ProofVerification {
  proofId: string;
  protocol: string;
  proof: any;
  publicSignals?: string[];
  metadata?: Record<string, any>;
}

export interface VerificationResult {
  isValid: boolean;
  verifiedAt: number;
  metadata?: {
    verifier: string;
    blockNumber?: number;
    transactionHash?: string;
  };
}