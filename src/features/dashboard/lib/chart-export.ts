/** A chart's data as a table: what the CSV export writes. */
export interface CsvTable {
    headers: string[];
    rows: ReadonlyArray<ReadonlyArray<string | number>>;
}

/**
 * Spreadsheet apps run a cell that starts with one of these as a formula, so
 * a member named `=HYPERLINK(...)` would become a live link in the export.
 * Such cells are prefixed with an apostrophe, which the app shows as text.
 */
const FORMULA_TRIGGERS = /^[=+\-@\t\r]/;

function escapeCell(value: string | number): string {
    if (typeof value === "number") {
        return Number.isFinite(value) ? String(value) : "";
    }

    const safe = FORMULA_TRIGGERS.test(value) ? `'${value}` : value;
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** RFC 4180 CSV with CRLF line endings, which Excel and Sheets both expect. */
export function toCsv({ headers, rows }: CsvTable): string {
    return [headers, ...rows]
        .map((row) => row.map(escapeCell).join(","))
        .join("\r\n");
}

/** A file name that is safe on every OS: "Workspace activity" -> "workspace-activity". */
export function exportFileName(title: string, extension: "csv" | "png") {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `${slug || "chart"}.${extension}`;
}

/** Hands the browser a file to save. Browser only. */
export function downloadFile(fileName: string, href: string) {
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName;
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
}

/** Saves a CSV string, through a Blob so large tables do not hit URL limits. */
export function downloadCsv(fileName: string, csv: string) {
    // The BOM makes Excel read the file as UTF-8, so names keep their accents.
    const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    downloadFile(fileName, url);
    // Revoked on the next task: the click above has started the download.
    setTimeout(() => URL.revokeObjectURL(url), 0);
}
