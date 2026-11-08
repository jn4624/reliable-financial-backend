export class RetryableJobError extends Error {
    readonly kind = "RETRYABLE";
}

export class PermanentJobError extends Error {
    readonly kind = "PERMANENT";
}

export class ReviewRequiredJobError extends Error {
    readonly kind = "REQUIRES_REVIEW";
}

export function classifyPayoutRequestedFailure(error: unknown): Error {
    if (error instanceof SyntaxError) {
        return new PermanentJobError("invalid payout-requested payload");
    }

    if (error instanceof Error && /ECONNRESET|ETIMEDOUT|40001/.test(error.message)) {
        return new RetryableJobError(error.message);
    }

    return new ReviewRequiredJobError("cannot safely decide the next action");
}
