export type CreatePayoutInput = {
    merchantId: string;
    recipientAddress: string;
    amount: string;
    idempotencyKey: string;
};

export type Payout = Omit<CreatePayoutInput, "idempotencyKey"> & {
    id: string;
    status: "REQUESTED";
};

export interface PayoutRepository {
    create(input: CreatePayoutInput): Promise<Payout>;
}

export interface UsdcTransferGateway {
    transfer(input: { to: string; amount: string }): Promise<{ hash: string }>;
}

export interface CreatePayout {
    execute(input: CreatePayoutInput): Promise<Payout>;
}

export class CreatePayoutNow implements CreatePayout {
    constructor(
        private readonly payoutRepository: PayoutRepository,
        private readonly usdcTransferGateway: UsdcTransferGateway
    ) { }
    async execute(input: CreatePayoutInput): Promise<Payout> {
        // 데이터베이스 저장
        const payout = await this.payoutRepository.create(input);

        // !여기 이 지점

        // 블록체인 자금 전송
        await this.usdcTransferGateway.transfer({
            to: payout.recipientAddress,
            amount: payout.amount
        });

        return payout;
    }
}
