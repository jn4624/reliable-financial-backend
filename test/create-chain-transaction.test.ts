import {beforeEach, describe, expect, it} from "vitest";
import {CreateChainTransaction} from "../src/application/create-chain-transaction";
import {InMemoryChainTransactionStore} from "../src/test-support/in-memory-chain-transaction-store";
import {testPool} from "../src/test-support/test-pool";
import {PostgresChainTransactionStore} from "../src/infrastructure/db/postgares-chain-transaction-store";

describe("CreateChainTransaction", () => {
    it("creates one CREATED transaction for the same payout", async () => {
        const store = new InMemoryChainTransactionStore();
        const service = new CreateChainTransaction(store);

        const first = await service.execute({
            payoutId: "pay_21", senderAddress: "0xsender", recipientAddress: "0xrecipient",
            amountAtomic: "25500000", nonce: 7
        });
        const second = await service.execute({
            payoutId: "pay_21", senderAddress: "0xsender", recipientAddress: "0xrecipient",
            amountAtomic: "25500000", nonce: 7
        });

        expect(second).toEqual(first);
        expect(store.items()).toHaveLength(1);
        expect(first.status).toBe("CREATED");
    });
});

describe("PostgresChainTransactionStore", () => {
    beforeEach(async () => {
        await testPool.query("DELETE FROM chain_transactions WHERE payout_id = 'pay_21'");
        await testPool.query("DELETE FROM payouts WHERE id = 'pay_21'");
        await testPool.query(`INSERT INTO payouts (id, idempotency_key, merchant_id, recipient_address, amount_atomic,
                                                   request_fingerprint, status)
                              VALUES ('pay_21', 'payout-2026-021', 'merchant_demo_01',
                                      '0x1111111111111111111111111111111111111111', 25500000,
                                      'fingerprint-2026-021', 'REQUESTED')`);
    });

    it("persists and returns one intent for the same payout", async () => {
        const service = new CreateChainTransaction(new PostgresChainTransactionStore(testPool));
        const input = {
            payoutId: "pay_21", senderAddress: "0xsender",
            recipientAddress: "0xrecipient", amountAtomic: "25500000", nonce: 7
        };
        const first = await service.execute(input);
        expect(await service.execute(input)).toEqual(first);
        await expect(testPool.query(
            "SELECT id, status FROM chain_transactions WHERE payout_id = 'pay_21'"
        )).resolves.toMatchObject({rowCount: 1, rows: [{id: first.id, status: "CREATED"}]});
    });
});
