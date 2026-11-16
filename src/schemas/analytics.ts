import { z } from "zod";

export const analyticsRangeSchema = z.enum(["7d", "30d", "90d", "365d"]);
export type AnalyticsRangeValue = z.infer<typeof analyticsRangeSchema>;

/** Search params for the workspace analytics page. Unknown values fall back to 7d. */
export const analyticsSearchParamsSchema = z.object({
    range: analyticsRangeSchema.catch("7d").default("7d"),
});

export const RANGE_DAYS: Record<AnalyticsRangeValue, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "365d": 365,
};

export const RANGE_LABELS: Record<AnalyticsRangeValue, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    "365d": "Last 12 months",
};
