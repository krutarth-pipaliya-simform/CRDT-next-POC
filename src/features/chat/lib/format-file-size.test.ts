import { formatFileSize } from "@/features/chat/lib/format-file-size";

describe("formatFileSize", () => {
    it.each([
        [0, "0 B"],
        [812, "812 B"],
        [1023, "1023 B"],
        [1024, "1.0 KB"],
        [14_540, "14 KB"],
        [1536, "1.5 KB"],
        [10 * 1024, "10 KB"],
        [3.4 * 1024 * 1024, "3.4 MB"],
        [8 * 1024 * 1024, "8.0 MB"],
        [2.5 * 1024 ** 3, "2.5 GB"],
    ])("formats %d bytes as %s", (bytes, expected) => {
        expect(formatFileSize(bytes)).toBe(expected);
    });

    it("tops out at gigabytes", () => {
        expect(formatFileSize(5000 * 1024 ** 3)).toBe("5000 GB");
    });
});
