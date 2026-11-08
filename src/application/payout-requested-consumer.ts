export type PayoutRequestedMessage = {
    messageId: string;
    payoutId: string;
};

export interface PayoutDispatchStore {
    startOnce(payoutId: string): Promise<boolean>;
}

export class PayoutRequestedConsumer {
    constructor(private readonly payoutDispatchStore: PayoutDispatchStore) {
    }

    async handle(message: PayoutRequestedMessage): Promise<void> {
        await this.payoutDispatchStore.startOnce(message.payoutId);
    }
}
