import { db } from './index.js';
import { randomUUID } from 'crypto';
export async function insertProof({ userId, proof }) {
    const proofId = randomUUID();
    await db.execute({
        sql: `
      INSERT INTO proofs (id, user_id, type, proof_data)
      VALUES (?, ?, ?, ?)
    `,
        args: [proofId, userId, 'zkp', JSON.stringify(proof)]
    });
    return proofId;
}
// Add more database operations as needed
