import type {PayoutRequestedProcessingStore} from "../application/payout-requested-consumer";

export class InMemoryPayoutDispatchStore implements PayoutRequestedProcessingStore {
    private readonly payoutIds = new Set<string>();
    private readonly messageIds = new Set<string>();

    async processOnce(input: {
        consumerName: "payout-requested";
        messageId: string;
        payoutId: string;
    }): Promise<void> {
        if (this.messageIds.has(input.messageId)) return;

        this.messageIds.add(input.messageId);
        this.payoutIds.add(input.payoutId);
    }

    startedPayoutIds(): string[] {
        return [...this.payoutIds];
    }

    processedMessageIds(): string[] {
        return [...this.messageIds];
    }
}
