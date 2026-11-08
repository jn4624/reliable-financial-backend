import {describe, expect, it} from "vitest";
import {PayoutRequestedConsumer} from "../src/application/payout-requested-consumer";
import {InMemoryPayoutDispatchStore} from "../src/test-support/in-memory-payout-dispatch-store";

describe("PayoutRequestedConsumer", () => {
    it("starts dispatch once for two messages about the same payout", async () => {
        const store = new InMemoryPayoutDispatchStore();
        const consumer = new PayoutRequestedConsumer(store);

        await consumer.handle({messageId: "out_01", payoutId: "pay_01"});
        await consumer.handle({messageId: "out_02", payoutId: "pay_01"});

        expect(store.startedPayoutIds()).toEqual(["pay_01"]);
    });
});
