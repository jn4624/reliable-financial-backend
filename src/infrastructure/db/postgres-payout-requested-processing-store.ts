import {randomUUID} from "node:crypto";
import type {Pool} from "pg";
import type {PayoutRequestedProcessingStore} from "../../application/payout-requested-consumer";

export class PostgresPayoutRequestedProcessingStore
    implements PayoutRequestedProcessingStore {
    constructor(private readonly pool: Pool) {
    }

    async processOnce(input: {
        consumerName: "payout-requested";
        messageId: string;
        payoutId: string;
    }): Promise<void> {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");

            const inserted = await client.query(
                `INSERT INTO processed_messages (consumer_name, message_id, payout_id)
                 VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING message_id`,
                [input.consumerName, input.messageId, input.payoutId]
            );

            if (inserted.rowCount === 1) {
                await client.query(
                    `INSERT INTO payout_dispatches (id, payout_id, status)
                     VALUES ($1, $2, 'STARTED') ON CONFLICT (payout_id) DO NOTHING`,
                    [`dispatch_${randomUUID()}`, input.payoutId]
                );
            }

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}
