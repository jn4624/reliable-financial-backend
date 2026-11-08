import {describe, expect, it} from "vitest";
import {PublishOutboxBatch} from "../src/application/publish-outbox-batch";
import {InMemoryOutboxStore} from "../src/test-support/in-memory-outbox-store";
import {RecordingOutboxQueue} from "../src/test-support/recording-outbox-queue";

describe("PublishOutboxBatch", () => {
    it("publishes the same message again when it dies before marking it published", async () => {
        const store = new InMemoryOutboxStore([
            {id: "out_01", type: "PAYOUT_REQUESTED", status: "PENDING"}
        ]);
        const queue = new RecordingOutboxQueue();
        const publisher = new PublishOutboxBatch(store, queue, {
            failAfterPublish: true
        });

        await expect(publisher.execute("publisher-a")).rejects.toThrow("process stopped");
        store.expireLocks();

        await new PublishOutboxBatch(store, queue).execute("publisher-b");

        expect(queue.jobs).toEqual([
            {id: "out_01", type: "PAYOUT_REQUESTED"},
            {id: "out_01", type: "PAYOUT_REQUESTED"}
        ]);
    });
});
