import {createPublicClient, http} from "viem";
import {foundry} from "viem/chains";
import type {ChainProbe} from "../../application/chain-probe";

export class ViemChainProbe implements ChainProbe {
    private readonly client;

    constructor(rpcUrl: string) {
        this.client = createPublicClient({
            chain: foundry,
            transport: http(rpcUrl)
        });
    }

    async getChainId(): Promise<number> {
        return this.client.getChainId();
    }
}
