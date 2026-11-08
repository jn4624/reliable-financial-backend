import {describe, expect, it} from "vitest";
import {
    classifyPayoutRequestedFailure,
    PermanentJobError,
    RetryableJobError,
    ReviewRequiredJobError
} from "../src/application/job-failure";

describe("classifyPayoutRequestedFailure", () => {
    it("retries a temporary Redis connection error", () => {
        expect(classifyPayoutRequestedFailure(new Error("ECONNRESET")))
            .toBeInstanceOf(RetryableJobError);
    });

    it("stops an invalid payload", () => {
        expect(classifyPayoutRequestedFailure(new SyntaxError("invalid json")))
            .toBeInstanceOf(PermanentJobError);
    });

    it("sends an unknown situation to review", () => {
        expect(classifyPayoutRequestedFailure(new Error("unexpected state")))
            .toBeInstanceOf(ReviewRequiredJobError);
    });
});
