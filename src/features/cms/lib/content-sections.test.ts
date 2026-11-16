import {
    CONTENT_SECTIONS,
    isContentSectionCurrent,
} from "@/features/cms/lib/content-sections";

describe("isContentSectionCurrent", () => {
    const blog = { label: "Blog", href: "/blog" };

    it("matches the section and anything beneath it", () => {
        expect(isContentSectionCurrent("/blog", blog)).toBe(true);
        expect(isContentSectionCurrent("/blog/some-post", blog)).toBe(true);
    });

    it("does not match look-alike or other sections", () => {
        expect(isContentSectionCurrent("/blogger", blog)).toBe(false);
        expect(isContentSectionCurrent("/docs", blog)).toBe(false);
    });

    it("lists the four public sections in order", () => {
        expect(CONTENT_SECTIONS.map((section) => section.href)).toEqual([
            "/blog",
            "/announcements",
            "/docs",
            "/changelog",
        ]);
    });
});
