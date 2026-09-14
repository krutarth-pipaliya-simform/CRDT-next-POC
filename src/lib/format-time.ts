const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

/**
 * Compact relative timestamp ("now", "4m", "3h", "2d", then an absolute date).
 * Deliberately terse — these render inside dense notification and chat rows.
 */
export function formatRelativeTime(
    value: Date | string,
    now: Date = new Date(),
): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const elapsed = now.getTime() - date.getTime();

    if (elapsed < MINUTE_MS) return "now";
    if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m`;
    if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}h`;
    if (elapsed < WEEK_MS) return `${Math.floor(elapsed / DAY_MS)}d`;

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

/** Absolute clock time used for chat message timestamps. */
export function formatClockTime(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/** Day separator label used between chat message groups. */
export function formatDayLabel(
    value: Date | string,
    now: Date = new Date(),
): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const isSameDay = date.toDateString() === now.toDateString();
    if (isSameDay) return "Today";

    const yesterday = new Date(now.getTime() - DAY_MS);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    });
}
