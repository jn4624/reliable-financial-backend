export function amountToAtomic(amount: string, decimals: number): string {
    if (!Number.isInteger(decimals) || decimals < 0) {
        throw new Error("decimals must be a non-negative integer");
    }

    if (!/^\d+(\.\d+)?$/.test(amount)) {
        throw new Error("amount must be a positive decimal string");
    }

    const [whole, fraction = ""] = amount.split(".");

    if (fraction.length > decimals) {
        throw new Error("too many decimal places");
    }

    const atomic = BigInt(`${whole}${fraction.padEnd(decimals, "0")}`);
    if (atomic <= 0n) {
        throw new Error("amount must be greater than zero");
    }

    return atomic.toString();
}
