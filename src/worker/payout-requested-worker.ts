import {Queue, UnrecoverableError, Worker} from "bullmq";
import {classifyPayoutRequestedFailure, PermanentJobError, ReviewRequiredJobError} from "../application/job-failure";

const connection = {host: "127.0.0.1", port: 6380};
const deadLetterQueue = new Queue("stablepay-dead-letter", {connection});

export type DeadLetterSink = {
    add(input: {
        outboxMessageId: string;
        payoutId: string;
        failureKind: "PERMANENT" | "REQUIRES_REVIEW";
        message: string;
    }): Promise<void>;
};

export type PayoutRequestedHandler = {
    handle(message: { messageId: string; payoutId: string }): Promise<void>;
};

export async function handlePayoutRequestedJob(
    job: { id: string; data: { payoutId: string } },
    consumer: PayoutRequestedHandler,
    deadLetters: DeadLetterSink
): Promise<void> {
    try {
        await consumer.handle({messageId: job.id, payoutId: job.data.payoutId});
    } catch (error) {
        const classified = classifyPayoutRequestedFailure(error);

        if (classified instanceof PermanentJobError || classified instanceof ReviewRequiredJobError) {
            await deadLetters.add({
                outboxMessageId: job.id,
                payoutId: job.data.payoutId,
                failureKind: classified.kind,
                message: classified.message
            });
            throw new UnrecoverableError(classified.message);
        }

        throw classified;
    }
}

export function startPayoutRequestedWorker(consumer: PayoutRequestedHandler) {
    return new Worker("stablepay-outbox", async (job) => {
        await handlePayoutRequestedJob(job as { id: string; data: { payoutId: string } }, consumer, {
            async add(input) {
                await deadLetterQueue.add("payout-requested", input, {
                    jobId: `dlq_${input.outboxMessageId}`
                });
            }
        });
    }, {connection});
}
