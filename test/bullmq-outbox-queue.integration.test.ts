import {randomUUID} from "node:crypto";
import {afterEach, describe, expect, it} from "vitest";
import {Queue} from "bullmq";
import {BullMqOutboxQueue} from "../src/infrastructure/queue/bullmq-outbox-queue";

describe("BullMqOutboxQueue", () => {
    const publisher = new BullMqOutboxQueue();
    const inspector = new Queue("stablepay-outbox", {
        connection: {host: "127.0.0.1", port: 6380}
    });

    afterEach(async () => {
        await publisher.close();
        await inspector.close();
    });

    it("stores retry and exponential backoff options in Redis", async () => {
        const id = `out_retry_${randomUUID()}`;
        await publisher.publish({
            id,
            type: "PAYOUT_REQUESTED",
            aggregateId: "pay_10",
            payload: {
                payoutId: "pay_10",
                recipientAddress: "0x1111111111111111111111111111111111111111",
                amountAtomic: "1000000"
            }
        });

        const job = await inspector.getJob(id);
        expect(job).not.toBeNull();
        expect(job?.opts).toMatchObject({
            attempts: 5,
            backoff: {type: "exponential", delay: 1_000},
            removeOnComplete: false,
            removeOnFail: false
        });
        await job?.remove();
    });
});
