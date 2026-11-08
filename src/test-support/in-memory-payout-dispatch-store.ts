import type {PayoutDispatchStore} from "../application/payout-requested-consumer";

export class InMemoryPayoutDispatchStore implements PayoutDispatchStore {
    private readonly payoutIds = new Set<string>();

    async startOnce(payoutId: string): Promise<boolean> {
        if (this.payoutIds.has(payoutId)) return false;

        this.payoutIds.add(payoutId);
        return true;
    }

    startedPayoutIds(): string[] {
        return [...this.payoutIds];
    }
}
