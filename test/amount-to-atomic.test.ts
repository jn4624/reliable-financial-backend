import {describe, expect, it} from "vitest";
import {amountToAtomic} from "../src/domain/amount-to-atomic";

describe("amountToAtomic", () => {
    it("converts 25.50 USDC to six-decimal atomic units", () => {
        expect(amountToAtomic("25.50", 6)).toBe("25500000");
    });

    it("keeps trailing zeroes without using floating point", () => {
        expect(amountToAtomic("0.000001", 6)).toBe("1");
    });

    it("rejects an amount with more digits than the token decimals", () => {
        expect(() => amountToAtomic("1.0000001", 6)).toThrow("too many decimal places");
    });

    it("rejects zero instead of creating a zero-value payout", () => {
        expect(() => amountToAtomic("0", 6)).toThrow("amount must be greater than zero");
    });
});
