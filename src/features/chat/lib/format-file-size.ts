const UNITS = ["KB", "MB", "GB"];

/** "812 B", "14.2 KB", "3.4 MB". */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;

    let value = bytes / 1024;
    let unit = 0;
    while (value >= 1024 && unit < UNITS.length - 1) {
        value /= 1024;
        unit += 1;
    }

    return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${UNITS[unit]}`;
}
