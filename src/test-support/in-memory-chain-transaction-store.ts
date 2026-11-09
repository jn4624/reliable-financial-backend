import {randomUUID} from "node:crypto";
import type {
    ChainTransaction,
    ChainTransactionStore,
    CreateChainTransactionInput
} from "../application/create-chain-transaction";

export class InMemoryChainTransactionStore implements ChainTransactionStore {
    private readonly transactions: ChainTransaction[] = [];

    async createOrGet(input: CreateChainTransactionInput): Promise<ChainTransaction> {
        const existing = this.transactions.find((item) => item.payoutId === input.payoutId);
        if (existing) return existing;
        const transaction: ChainTransaction = {...input, id: `ctx_${randomUUID()}`, status: "CREATED"};
        this.transactions.push(transaction);
        return transaction;
    }

    items(): ChainTransaction[] {
        return [...this.transactions];
    }
}
