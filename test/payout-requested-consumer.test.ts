import {beforeAll, describe, expect, it} from "vitest";
import {
    PostgresPayoutRequestedProcessingStore
} from "../src/infrastructure/db/postgres-payout-requested-processing-store";
import {testPool} from "../src/test-support/test-pool";
import {PayoutRequestedConsumer} from "../src/application/payout-requested-consumer";


describe("PostgresPayoutRequestedProcessingStore", () => {
    beforeAll(async () => {
        await testPool.query(
            "DELETE FROM processed_messages WHERE consumer_name = 'payout-requested' AND message_id = 'out_10'"
        );
        await testPool.query("DELETE FROM payout_dispatches WHERE payout_id = 'pay_10'");
        await testPool.query("DELETE FROM payouts WHERE id = 'pay_10'");
        await testPool.query(
            `INSERT INTO payouts (id, idempotency_key, merchant_id, recipient_address,
                                  amount_atomic, request_fingerprint, status)
             VALUES ('pay_10', 'payout-2026-010', 'merchant_demo_01',
                     '0x1111111111111111111111111111111111111111', 1000000,
                     'fingerprint-2026-010', 'REQUESTED')`
        );
    });

    it("persists one processing record and dispatch for ten deliveries", async () => {
        const consumer = new PayoutRequestedConsumer(
            new PostgresPayoutRequestedProcessingStore(testPool)
        );

        await Promise.all(
            Array.from({length: 10}, () =>
                consumer.handle({messageId: "out_10", payoutId: "pay_10"})
            )
        );

        await expect(testPool.query(
            "SELECT message_id FROM processed_messages WHERE consumer_name = 'payout-requested' AND message_id = 'out_10'"
        )).resolves.toMatchObject({rowCount: 1});
        await expect(testPool.query(
            "SELECT payout_id FROM payout_dispatches WHERE payout_id = 'pay_10'"
        )).resolves.toMatchObject({rowCount: 1});
    });
});
