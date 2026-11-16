import { safeImageUrl, safeLinkUrl } from "@/features/cms/lib/safe-url";

describe("safeLinkUrl", () => {
    it.each([
        "/blog/post",
        "#section",
        "https://example.com/a?b=1",
        "http://example.com",
        "mailto:hi@example.com",
    ])("allows %s", (url) => {
        expect(safeLinkUrl(url)).toBe(url);
    });

    it("trims surrounding whitespace", () => {
        expect(safeLinkUrl("  /docs  ")).toBe("/docs");
    });

    it.each([
        "javascript:alert(1)",
        "JaVaScRiPt:alert(1)",
        " javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "vbscript:x",
        "//evil.example/path",
        "ftp://example.com",
        "not a url",
        "",
    ])("blocks %j", (url) => {
        expect(safeLinkUrl(url)).toBeNull();
    });
});

describe("safeImageUrl", () => {
    const base = "https://cms.example.com";

    it("resolves CMS upload paths against the CMS origin", () => {
        expect(safeImageUrl("/uploads/a.png", base)).toBe(
            "https://cms.example.com/uploads/a.png",
        );
    });

    it("allows absolute http(s) images", () => {
        expect(safeImageUrl("https://cdn.example.com/a.png", base)).toBe(
            "https://cdn.example.com/a.png",
        );
        expect(safeImageUrl("http://cdn.example.com/a.png", base)).toBe(
            "http://cdn.example.com/a.png",
        );
    });

    it.each([
        "javascript:alert(1)",
        "data:image/svg+xml;base64,PHN2Zz4=",
        "//evil.example/a.png",
        "mailto:a@b.co",
        "relative.png",
    ])("blocks %j", (url) => {
        expect(safeImageUrl(url, base)).toBeNull();
    });
});
