export interface ChainProbe {
    getChainId(): Promise<Number>;
}

export class ChainUnavailableError extends Error {
    constructor() {
        super("chain is temporarily unavailable");
    }
}
