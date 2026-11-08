import type {ClaimedOutboxMessage} from "../infrastructure/db/postgres-outbox-store";
import type {OutboxQueue} from "../infrastructure/queue/bullmq-outbox-queue";

export class RecordingOutboxQueue implements OutboxQueue {
    readonly jobs: Array<Pick<ClaimedOutboxMessage, "id" | "type">> = [];

    async publish(message: ClaimedOutboxMessage): Promise<void> {
        this.jobs.push({id: message.id, type: message.type});
    }
}
