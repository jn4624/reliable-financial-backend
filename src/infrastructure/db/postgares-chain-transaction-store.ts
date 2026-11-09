import {randomUUID} from "node:crypto";
import type {Pool} from "pg";
import type {
    ChainTransaction,
    ChainTransactionStore,
    CreateChainTransactionInput
} from "../../application/create-chain-transaction";

export class PostgresChainTransactionStore implements ChainTransactionStore {
    constructor(private readonly pool: Pool) {
    }

    async createOrGet(input: CreateChainTransactionInput): Promise<ChainTransaction> {
        const result = await this.pool.query(
            `INSERT INTO chain_transactions (id, payout_id, sender_address, recipient_address, amount_atomic, nonce,
                                             status)
             VALUES ($1, $2, $3, $4, $5, $6, 'CREATED') ON CONFLICT (payout_id) DO NOTHING
       RETURNING id, payout_id, sender_address, recipient_address, amount_atomic, nonce, status`,
            [`ctx_${randomUUID()}`, input.payoutId, input.senderAddress,
                input.recipientAddress, input.amountAtomic, input.nonce]
        );
        const row = result.rows[0] ?? (await this.pool.query(
            `SELECT id, payout_id, sender_address, recipient_address, amount_atomic, nonce, status
             FROM chain_transactions
             WHERE payout_id = $1`, [input.payoutId]
        )).rows[0];
        return {
            id: row.id, payoutId: row.payout_id, senderAddress: row.sender_address,
            recipientAddress: row.recipient_address, amountAtomic: String(row.amount_atomic),
            nonce: Number(row.nonce), status: row.status
        };
    }
}
