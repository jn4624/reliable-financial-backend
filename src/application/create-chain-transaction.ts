export type CreateChainTransactionInput = {
    payoutId: string;
    senderAddress: string;
    recipientAddress: string;
    amountAtomic: string;
    nonce: number;
};

export type ChainTransaction = CreateChainTransactionInput & {
    id: string;
    status: "CREATED";
};

export interface ChainTransactionStore {
    createOrGet(input: CreateChainTransactionInput): Promise<ChainTransaction>;
}

export class CreateChainTransaction {
    constructor(private readonly store: ChainTransactionStore) {
    }

    execute(input: CreateChainTransactionInput): Promise<ChainTransaction> {
        return this.store.createOrGet(input);
    }
}
