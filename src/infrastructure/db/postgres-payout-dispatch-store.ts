import {randomUUID} from "node:crypto";
import type {Pool} from "pg";
import type {PayoutDispatchStore} from "../../application/payout-requested-consumer";

export class PostgresPayoutDispatchStore implements PayoutDispatchStore {
    constructor(private readonly pool: Pool) {
    }

    async startOnce(payoutId: string): Promise<boolean> {
        const result = await this.pool.query(
            `INSERT INTO payout_dispatches (id, payout_id, status)
             VALUES ($1, $2, 'STARTED') ON CONFLICT (payout_id) DO NOTHING
       RETURNING id`,
            [`dispatch_${randomUUID()}`, payoutId]
        );

        return result.rowCount === 1;
    }
}
