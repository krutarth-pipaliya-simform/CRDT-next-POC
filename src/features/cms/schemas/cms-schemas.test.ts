import { blocksSchema } from "@/features/cms/schemas/blocks";
import {
    announcementSchema,
    articleSchema,
    collectionResponseSchema,
    docSchema,
    pageParamSchema,
    paginationSchema,
    releaseNoteSchema,
    slugSchema,
} from "@/features/cms/schemas/content";

const text = (value: string) => ({ type: "text" as const, text: value });
const base = { id: 1, documentId: "d1", slug: "s", title: "T" };

describe("blocksSchema", () => {
    it("parses the supported block types", () => {
        const blocks = blocksSchema.parse([
            { type: "paragraph", children: [text("hi")] },
            { type: "heading", level: 2, children: [text("h")] },
            { type: "quote", children: [text("q")] },
            { type: "code", children: [text("c")] },
            { type: "image", image: { url: "/u.png", alternativeText: null } },
            {
                type: "list",
                format: "unordered",
                children: [
                    { type: "list-item", children: [text("a")] },
                    {
                        type: "list",
                        format: "ordered",
                        children: [
                            { type: "list-item", children: [text("n")] },
                        ],
                    },
                ],
            },
            {
                type: "paragraph",
                children: [
                    {
                        type: "link",
                        url: "/x",
                        children: [{ ...text("l"), bold: true }],
                    },
                ],
            },
        ]);
        expect(blocks.map((block) => block.type)).toEqual([
            "paragraph",
            "heading",
            "quote",
            "code",
            "image",
            "list",
            "paragraph",
        ]);
    });

    it("degrades an unknown or malformed block to { type: unknown } instead of failing", () => {
        const blocks = blocksSchema.parse([
            { type: "video", src: "x" },
            { type: "heading", level: 9, children: [] },
            "garbage",
            null,
        ]);
        expect(blocks).toEqual([
            { type: "unknown" },
            { type: "unknown" },
            { type: "unknown" },
            { type: "unknown" },
        ]);
    });
});

describe("content schemas", () => {
    it("accepts entries with nullable optional fields", () => {
        expect(
            articleSchema.safeParse({
                ...base,
                excerpt: null,
                author: null,
                category: null,
                body: [],
            }).success,
        ).toBe(true);
        expect(
            announcementSchema.safeParse({ ...base, ctaUrl: null, body: [] })
                .success,
        ).toBe(true);
        expect(
            docSchema.safeParse({ ...base, section: "Start", body: [] })
                .success,
        ).toBe(true);
        expect(
            releaseNoteSchema.safeParse({
                ...base,
                version: "1.0.0",
                releaseDate: "2026-01-01",
                body: [],
            }).success,
        ).toBe(true);
    });

    it("rejects entries missing required fields", () => {
        expect(
            articleSchema.safeParse({ ...base, body: [], slug: undefined })
                .success,
        ).toBe(false);
        expect(docSchema.safeParse({ ...base, body: [] }).success).toBe(false);
        expect(releaseNoteSchema.safeParse({ ...base, body: [] }).success).toBe(
            false,
        );
    });

    it("validates the pagination envelope", () => {
        const pagination = { page: 1, pageSize: 10, pageCount: 1, total: 0 };
        expect(paginationSchema.safeParse(pagination).success).toBe(true);
        expect(
            collectionResponseSchema(docSchema).safeParse({
                data: [],
                meta: { pagination },
            }).success,
        ).toBe(true);
        expect(
            collectionResponseSchema(docSchema).safeParse({ data: [] }).success,
        ).toBe(false);
    });
});

describe("slugSchema", () => {
    it.each(["intro", "v1_2-final", "A9"])("accepts %s", (slug) => {
        expect(slugSchema.safeParse(slug).success).toBe(true);
    });

    it.each([
        "",
        "-leading",
        "has space",
        "../etc",
        "a/b",
        "x".repeat(121),
        "ü",
    ])("rejects %j", (slug) => {
        expect(slugSchema.safeParse(slug).success).toBe(false);
    });
});

describe("pageParamSchema", () => {
    it("coerces valid page numbers", () => {
        expect(pageParamSchema.parse("3")).toBe(3);
    });

    it.each(["0", "-2", "1.5", "abc", undefined, ""])(
        "falls back to page 1 for %j",
        (value) => {
            expect(pageParamSchema.parse(value)).toBe(1);
        },
    );
});
