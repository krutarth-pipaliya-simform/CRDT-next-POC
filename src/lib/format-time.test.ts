import {
    formatCalendarDate,
    formatClockTime,
    formatDayLabel,
    formatRelativeTime,
} from "@/lib/format-time";

const NOW = new Date("2026-03-15T12:00:00.000Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms);
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatRelativeTime", () => {
    it.each([
        [30_000, "now"],
        [4 * MIN, "4m"],
        [59 * MIN, "59m"],
        [3 * HOUR, "3h"],
        [2 * DAY, "2d"],
    ])("renders %i ms ago as %s", (elapsed, expected) => {
        expect(formatRelativeTime(ago(elapsed), NOW)).toBe(expected);
    });

    it("falls back to an absolute date after a week", () => {
        expect(formatRelativeTime(ago(10 * DAY), NOW)).toMatch(/Mar/);
    });

    it("accepts ISO strings", () => {
        expect(formatRelativeTime(ago(5 * MIN).toISOString(), NOW)).toBe("5m");
    });

    it("returns an empty string for an invalid date", () => {
        expect(formatRelativeTime("not a date", NOW)).toBe("");
    });

    it("defaults `now` to the current time", () => {
        expect(formatRelativeTime(new Date())).toBe("now");
    });
});

describe("formatClockTime", () => {
    it("renders hours and minutes", () => {
        expect(formatClockTime(new Date("2026-03-15T09:05:00.000Z"))).toMatch(
            /09:05/,
        );
    });

    it("accepts strings and rejects garbage", () => {
        expect(formatClockTime("2026-03-15T09:05:00.000Z")).toMatch(/09:05/);
        expect(formatClockTime("nope")).toBe("");
    });
});

describe("formatDayLabel", () => {
    it("labels today and yesterday", () => {
        expect(formatDayLabel(NOW, NOW)).toBe("Today");
        expect(formatDayLabel(ago(DAY), NOW)).toBe("Yesterday");
    });

    it("omits the year within the current year", () => {
        const label = formatDayLabel(new Date("2026-01-02T12:00:00Z"), NOW);
        expect(label).toMatch(/Jan/);
        expect(label).not.toMatch(/2026/);
    });

    it("includes the year for other years", () => {
        expect(formatDayLabel(new Date("2024-01-02T12:00:00Z"), NOW)).toMatch(
            /2024/,
        );
    });

    it("returns an empty string for an invalid date", () => {
        expect(formatDayLabel("nope", NOW)).toBe("");
    });

    it("defaults `now` to the current time", () => {
        expect(formatDayLabel(new Date())).toBe("Today");
    });
});

describe("formatCalendarDate", () => {
    it("formats in en-US regardless of the host locale", () => {
        expect(formatCalendarDate(new Date("2026-10-27T12:00:00Z"))).toBe(
            "Oct 27, 2026",
        );
        expect(formatCalendarDate("2026-10-27T12:00:00Z")).toBe("Oct 27, 2026");
    });

    it("returns null for null and invalid dates", () => {
        expect(formatCalendarDate(null)).toBeNull();
        expect(formatCalendarDate("nope")).toBeNull();
    });
});
