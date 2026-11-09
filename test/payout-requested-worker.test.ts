import {describe, expect, it} from "vitest";
import {UnrecoverableError} from "bullmq";
import {handlePayoutRequestedJob} from "../src/worker/payout-requested-worker";

describe("handlePayoutRequestedJob", () => {
    it("moves a permanent failure to the dead letter queue", async () => {
        const deadLetters: unknown[] = [];
        const consumer = {
            async handle() {
                throw new SyntaxError("invalid json");
            }
        };

        await expect(handlePayoutRequestedJob(
            {id: "out_20", data: {payoutId: "pay_20"}},
            consumer,
            {
                async add(input) {
                    deadLetters.push(input);
                }
            }
        )).rejects.toBeInstanceOf(UnrecoverableError);

        expect(deadLetters).toEqual([{
            outboxMessageId: "out_20",
            payoutId: "pay_20",
            failureKind: "PERMANENT",
            message: "invalid payout-requested payload"
        }]);
    });
});
