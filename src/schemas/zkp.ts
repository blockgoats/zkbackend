import { z } from 'zod';

export const proofSchema = z.object({
  body: z.object({
    challenge: z.string(),
    protocol: z.enum(['groth16', 'plonk']).optional(),
    curve: z.enum(['bn128', 'bls12_381']).optional(),
    publicInputs: z.array(z.unknown()).optional(),
    metadata: z.record(z.unknown()).optional()
  })
});

export const verifySchema = z.object({
  body: z.object({
    proofId: z.string(),
    protocol: z.enum(['groth16', 'plonk']),
    proof: z.record(z.unknown()),
    publicSignals: z.array(z.string()).optional(),
    metadata: z.record(z.unknown()).optional()
  })
});