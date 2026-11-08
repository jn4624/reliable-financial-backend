import type {ClaimedOutboxMessage, OutboxStore} from "../infrastructure/db/postgres-outbox-store";

type StoredMessage = ClaimedOutboxMessage & {
    status: "PENDING" | "PUBLISHED";
    locked: boolean;
};

export class InMemoryOutboxStore implements OutboxStore {
    private readonly messages: StoredMessage[];

    constructor(seed: Array<Pick<ClaimedOutboxMessage, "id" | "type"> & { status: "PENDING" | "PUBLISHED" }>) {
        this.messages = seed.map((message) => ({
            ...message,
            aggregateId: "pay_demo",
            payload: {
                payoutId: "pay_demo",
                recipientAddress: "0x1111111111111111111111111111111111111111",
                amountAtomic: "25500000"
            },
            locked: false
        }));
    }

    async claimNextBatch(_workerId: string, limit: number): Promise<ClaimedOutboxMessage[]> {
        return this.messages.filter((message) => message.status === "PENDING" && !message.locked)
            .slice(0, limit).map((message) => {
                message.locked = true;
                return {id: message.id, type: message.type, aggregateId: message.aggregateId, payload: message.payload};
            });
    }

    async markPublished(messageId: string): Promise<void> {
        const message = this.messages.find((candidate) => candidate.id === messageId);
        if (!message) throw new Error(`outbox message ${messageId} not found`);
        message.status = "PUBLISHED";
        message.locked = false;
    }

    expireLocks(): void {
        for (const message of this.messages) message.locked = false;
    }
}
