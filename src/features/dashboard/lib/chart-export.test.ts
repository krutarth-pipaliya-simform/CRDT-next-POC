/**
 * @jest-environment jsdom
 */
import {
    downloadCsv,
    downloadFile,
    exportFileName,
    toCsv,
} from "@/features/dashboard/lib/chart-export";

describe("toCsv", () => {
    it("writes RFC 4180 rows with CRLF endings", () => {
        expect(
            toCsv({
                headers: ["Name", "Count"],
                rows: [
                    ["Ada", 3],
                    ["Bob", 0],
                ],
            }),
        ).toBe("Name,Count\r\nAda,3\r\nBob,0");
    });

    it("quotes cells with commas, quotes and newlines, doubling quotes", () => {
        expect(
            toCsv({
                headers: ["a"],
                rows: [['say "hi", ok'], ["line1\nline2"], ["cr\rcell"]],
            }),
        ).toBe('a\r\n"say ""hi"", ok"\r\n"line1\nline2"\r\n"cr\rcell"');
    });

    describe("spreadsheet formula injection", () => {
        it.each([
            '=HYPERLINK("http://evil","x")',
            "+1+1",
            "-2+3",
            "@SUM(A1)",
            "\t=1+1",
            "\r=1+1",
        ])("neutralises %j with a leading apostrophe", (cell) => {
            const csv = toCsv({ headers: ["h"], rows: [[cell]] });
            const body = csv.split("\r\n").slice(1).join("\r\n");
            // The (possibly quoted) cell must start with the apostrophe.
            expect(body.replace(/^"/, "")).toMatch(/^'/);
        });

        it("also neutralises a dangerous header", () => {
            expect(toCsv({ headers: ["=cmd"], rows: [] })).toBe("'=cmd");
        });

        it("leaves harmless text and numbers alone", () => {
            expect(
                toCsv({ headers: ["h"], rows: [["a=b"], ["x-y"], [-5]] }),
            ).toBe("h\r\na=b\r\nx-y\r\n-5");
        });
    });

    it("writes non-finite numbers as empty cells", () => {
        expect(
            toCsv({
                headers: ["n"],
                rows: [[Number.NaN], [Number.POSITIVE_INFINITY]],
            }),
        ).toBe("n\r\n\r\n");
    });

    it("writes headers only for an empty table", () => {
        expect(toCsv({ headers: ["a", "b"], rows: [] })).toBe("a,b");
    });
});

describe("exportFileName", () => {
    it("slugs a title into a safe file name", () => {
        expect(exportFileName("Workspace activity", "csv")).toBe(
            "workspace-activity.csv",
        );
        expect(exportFileName("  Tasks / Done! ", "png")).toBe(
            "tasks-done.png",
        );
    });

    it("falls back to 'chart' when nothing usable remains", () => {
        expect(exportFileName("???", "csv")).toBe("chart.csv");
        expect(exportFileName("", "png")).toBe("chart.png");
    });

    it("never lets a path separator through", () => {
        expect(exportFileName("../../etc/passwd", "csv")).toBe(
            "etc-passwd.csv",
        );
    });
});

describe("downloads", () => {
    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it("clicks a transient anchor with the file name and removes it", () => {
        const click = jest
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(function recordLink(this: HTMLAnchorElement) {
                expect(this.download).toBe("a.csv");
                expect(this.getAttribute("href")).toBe("blob:x");
                expect(this.rel).toBe("noopener");
                expect(document.body.contains(this)).toBe(true);
            });

        downloadFile("a.csv", "blob:x");

        expect(click).toHaveBeenCalledTimes(1);
        expect(document.querySelector("a[download]")).toBeNull();
    });

    it("saves CSV through a BOM-prefixed blob and releases the URL", async () => {
        jest.useFakeTimers();
        const blobs: Blob[] = [];
        URL.createObjectURL = jest.fn((blob: Blob) => {
            blobs.push(blob);
            return "blob:csv";
        });
        URL.revokeObjectURL = jest.fn();
        jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
            () => {},
        );

        downloadCsv("x.csv", "a,b");

        expect(blobs[0]?.type).toBe("text/csv;charset=utf-8");
        // 3-byte UTF-8 BOM + "a,b"
        expect(blobs[0]?.size).toBe(6);
        expect(URL.revokeObjectURL).not.toHaveBeenCalled();
        jest.runAllTimers();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:csv");
    });
});
