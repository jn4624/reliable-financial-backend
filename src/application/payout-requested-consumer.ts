export type PayoutRequestedMessage = {
    messageId: string;
    payoutId: string;
};

export interface PayoutRequestedProcessingStore {
    processOnce(input: {
        consumerName: "payout-requested";
        messageId: string;
        payoutId: string;
    }): Promise<void>;
}

export class PayoutRequestedConsumer {
    constructor(private readonly store: PayoutRequestedProcessingStore) {
    }

    async handle(message: PayoutRequestedMessage): Promise<void> {
        await this.store.processOnce({
            consumerName: "payout-requested",
            messageId: message.messageId,
            payoutId: message.payoutId
        });
    }
}
