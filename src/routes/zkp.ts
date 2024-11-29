import { Router } from 'express';
import { generateProof, verifyProof, getProofStatus } from '../controllers/zkp.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { proofSchema, verifySchema } from '../schemas/zkp.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.post('/generate', validateRequest(proofSchema), generateProof as any);
router.post('/verify', validateRequest(verifySchema), verifyProof);
router.get('/status/:proofId', getProofStatus);

export { router as zkpRouter };


// curl -X POST http://localhost:4000/api/v1/zkp/generate \
// -H "Content-Type: application/json" \
// -H "Authorization: Bearer your_access_token" \
// -d '{
//   "data": "your_data_here"
// }'


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMHgyYjAxYjhiNDExMWU0NDYzMzY0MmE1MjI5OTE5OTlkMiIsInVzZXJuYW1lIjoiYWxpY2UiLCJpYXQiOjE3MzI4MTY3NTUsImV4cCI6MTczMjgyMDM1NX0.Cez3dAb5fkk-1COAY8qV75aGsVVSO5o7FWGhDn46LX4

// plonk,groth16
//'bn128' | 'bls12_381', received 'example_curve'"

// curl -X POST http://localhost:4000/api/v1/zkp/generate \
// -H "Content-Type: application/json" \
// -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMHgyYjAxYjhiNDExMWU0NDYzMzY0MmE1MjI5OTE5OTlkMiIsInVzZXJuYW1lIjoiYWxpY2UiLCJpYXQiOjE3MzI4MTY3NTUsImV4cCI6MTczMjgyMDM1NX0.Cez3dAb5fkk-1COAY8qV75aGsVVSO5o7FWGhDn46LX4" \
// -d '{
//   "challenge": "example_challenge",
//   "protocol": "groth16",
//   "curve": "bn128",
//   "publicInputs": ["input1", "input2"],
//   "metadata": {
//     "key1": "value1",
//     "key2": "value2"
//   }
// }'
// npm install circomlib

// circom your_circuit.circom --wasm --output /path/to/output

// curl -X POST http://localhost:4000/api/v1/zkp/verify \
// -H "Content-Type: application/json" \
// -H "Authorization: Bearer your_access_token" \
// -d '{
//   "proof": "your_proof_here",
//   "publicSignals": "your_public_signals_here"
// }'


// curl -X GET http://localhost:4000/api/v1/zkp/status/your_proof_id \
// -H "Authorization: Bearer your_access_token"
