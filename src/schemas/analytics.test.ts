import {
    analyticsSearchParamsSchema,
    RANGE_DAYS,
    RANGE_LABELS,
} from "@/schemas/analytics";

describe("analyticsSearchParamsSchema", () => {
    it.each(["7d", "30d", "90d", "365d"])("accepts %s", (range) => {
        expect(analyticsSearchParamsSchema.parse({ range }).range).toBe(range);
    });

    it("falls back to 7d for unknown or missing values", () => {
        expect(analyticsSearchParamsSchema.parse({ range: "1y" }).range).toBe(
            "7d",
        );
        expect(analyticsSearchParamsSchema.parse({}).range).toBe("7d");
        expect(analyticsSearchParamsSchema.parse({ range: 5 }).range).toBe(
            "7d",
        );
    });

    it("has a day count and label for every range", () => {
        expect(Object.keys(RANGE_DAYS)).toEqual(Object.keys(RANGE_LABELS));
        expect(RANGE_DAYS["365d"]).toBe(365);
    });
});
