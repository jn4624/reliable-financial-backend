export interface PayoutSettlementStore {
    markSettledAndEnqueueWebhook(input: {
        payoutId: string;
        transactionHash: string;
        merchantId: string;
    }): Promise<void>;
}

export class RecordPayoutSettled {
    constructor(private readonly store: PayoutSettlementStore) {
    }

    async execute(input: {
        payoutId: string;
        transactionHash: string;
        merchantId: string;
    }): Promise<void> {
        await this.store.markSettledAndEnqueueWebhook(input);
    }
}
