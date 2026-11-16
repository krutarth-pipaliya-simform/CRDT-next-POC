import { formatMoney } from "@/features/billing/lib/format-money";

describe("formatMoney", () => {
    it("formats minor units as a currency amount", () => {
        expect(formatMoney(1200, "usd")).toBe("$12.00");
        expect(formatMoney(5, "USD")).toBe("$0.05");
        expect(formatMoney(0, "usd")).toBe("$0.00");
    });

    it("handles zero-decimal currencies without dividing by 100", () => {
        expect(formatMoney(1200, "jpy")).toMatch(/1,200/);
    });

    it("handles three-decimal currencies", () => {
        expect(formatMoney(1234, "kwd")).toMatch(/1\.234/);
    });

    it("formats negatives (refunds)", () => {
        expect(formatMoney(-250, "usd")).toBe("-$2.50");
    });
});
