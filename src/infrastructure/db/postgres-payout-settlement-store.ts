import {randomUUID} from "node:crypto";
import type {Pool} from "pg";
import type {PayoutSettlementStore} from "../../application/record-payout-settled";

export class PostgresPayoutSettlementStore implements PayoutSettlementStore {
    constructor(private readonly pool: Pool) {
    }

    async markSettledAndEnqueueWebhook(input: {
        payoutId: string;
        transactionHash: string;
        merchantId: string;
    }): Promise<void> {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");

            await client.query("UPDATE payouts SET status = 'SETTLED' WHERE id = $1", [
                input.payoutId
            ]);

            await client.query(
                `INSERT INTO payout_status_history (id, payout_id, from_status, to_status, reason)
                 VALUES ($1, $2, 'AWAITING_CONFIRMATION', 'SETTLED', 'RECEIPT_CONFIRMED')`,
                [`hist_${randomUUID()}`, input.payoutId]
            );

            await client.query(
                `INSERT INTO outbox_messages (id, aggregate_type, aggregate_id, type, payload)
                 VALUES ($1, 'PAYOUT', $2, 'MERCHANT_PAYOUT_SETTLED', $3::jsonb)`,
                [
                    `out_${randomUUID()}`,
                    input.payoutId,
                    JSON.stringify({
                        payoutId: input.payoutId,
                        merchantId: input.merchantId,
                        transactionHash: input.transactionHash
                    })
                ]
            );

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}
