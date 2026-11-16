// A dependency-free stand-in for a Strapi v5 instance, for local dev and e2e.
// It speaks the subset of the REST Content API the app uses:
//   GET /api/<collection>?sort[0]=f:desc&pagination[page]=1&pagination[pageSize]=10
//       &filters[slug][$eq]=x   with  Authorization: Bearer <token>
// and answers { data: [...flat entries with id + documentId...], meta: { pagination } }.
// The app does not know this file exists; it only reads CMS_API_URL.
//
//   node e2e/fixtures/cms-server.mjs        (PORT via CMS_FIXTURE_PORT, default 4103)

import { createServer } from "node:http";

const PORT = Number(process.env.CMS_FIXTURE_PORT ?? 4103);
const FIXTURE_TOKEN = process.env.CMS_FIXTURE_TOKEN ?? "fixture-token";

const text = (value, extra = {}) => ({ type: "text", text: value, ...extra });
const paragraph = (...children) => ({ type: "paragraph", children });

const richBody = [
    {
        type: "heading",
        level: 2,
        children: [text("Why merging beats locking")],
    },
    paragraph(
        text("Every keystroke is "),
        text("merged", { bold: true }),
        text(", never "),
        text("blocked", { italic: true }),
        text(". See "),
        {
            type: "link",
            url: "https://example.com/crdt",
            children: [text("the CRDT primer")],
        },
        text("."),
    ),
    {
        type: "list",
        format: "unordered",
        children: [
            { type: "list-item", children: [text("No locks")] },
            { type: "list-item", children: [text("No conflicts")] },
        ],
    },
    { type: "quote", children: [text("Nothing gets lost.")] },
    { type: "code", children: [text("const doc = new Y.Doc();")] },
    paragraph({
        type: "link",
        url: "javascript:alert(1)",
        children: [text("unsafe link label")],
    }),
    // A block type the app does not render; it must be skipped, not fatal.
    { type: "carousel", slides: [] },
];

const simple = (message) => [paragraph(text(message))];

const day = (n) => new Date(Date.UTC(2026, 5, n)).toISOString();

const articles = Array.from({ length: 8 }, (_, index) => {
    const n = index + 1;
    return {
        id: n,
        documentId: `article-doc-${n}`,
        title: `Fixture article ${n}`,
        slug: `fixture-article-${n}`,
        excerpt: `Excerpt for fixture article ${n}.`,
        author: "Ada Lovelace",
        category: n % 2 ? "Engineering" : "Product",
        body: n === 8 ? richBody : simple(`Body of fixture article ${n}.`),
        publishedAt: day(n),
        updatedAt: day(n),
    };
});
articles.push({
    id: 99,
    documentId: "article-doc-draft",
    title: "Unpublished draft",
    slug: "unpublished-draft",
    excerpt: null,
    author: null,
    category: null,
    body: simple("Never visible."),
    publishedAt: null,
    updatedAt: day(20),
});

const announcements = [
    {
        id: 1,
        documentId: "announcement-doc-1",
        title: "Fixture announcement: Boards got faster",
        slug: "boards-faster",
        summary: "Drag and drop is smoother.",
        ctaLabel: "See the changelog",
        ctaUrl: "/changelog",
        body: simple("Boards now render in half the time."),
        publishedAt: day(12),
        updatedAt: day(12),
    },
    {
        id: 2,
        documentId: "announcement-doc-2",
        title: "Fixture announcement: Chat history",
        slug: "chat-history",
        summary: null,
        ctaLabel: null,
        ctaUrl: null,
        body: simple("Chat keeps your full history."),
        publishedAt: day(3),
        updatedAt: day(3),
    },
];

const docs = [
    ["Getting started", 1, "Create a workspace", "create-a-workspace"],
    ["Getting started", 2, "Invite your team", "invite-your-team"],
    ["Guides", 1, "Writing documents", "writing-documents"],
    ["Guides", 2, "Using boards", "using-boards"],
].map(([section, order, title, slug], index) => ({
    id: index + 1,
    documentId: `doc-doc-${index + 1}`,
    title,
    slug,
    section,
    order,
    summary: `How to: ${title.toLowerCase()}.`,
    body: simple(`Documentation body for ${title}.`),
    publishedAt: day(1),
    updatedAt: day(1),
}));

const releaseNotes = Array.from({ length: 6 }, (_, index) => {
    const n = index + 1;
    return {
        id: n,
        documentId: `release-doc-${n}`,
        version: `1.${n}.0`,
        title: `Fixture release ${n}`,
        slug: `release-1-${n}-0`,
        releaseDate: `2026-0${n}-15`,
        summary: `Summary of release 1.${n}.0.`,
        body: simple(`Notes for release 1.${n}.0.`),
        publishedAt: day(n),
        updatedAt: day(n),
    };
});

const collections = {
    articles,
    announcements,
    docs,
    "release-notes": releaseNotes,
};

function send(response, status, body) {
    response.writeHead(status, { "content-type": "application/json" });
    response.end(JSON.stringify(body));
}

function strapiError(response, status, name, message) {
    send(response, status, {
        data: null,
        error: { status, name, message, details: {} },
    });
}

function compare(a, b) {
    if (a === b) return 0;
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
    return a < b ? -1 : 1;
}

const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", `http://localhost:${PORT}`);
    const match = /^\/api\/([a-z-]+)$/.exec(url.pathname);

    if (request.method !== "GET" || !match) {
        return strapiError(response, 404, "NotFoundError", "Not Found");
    }
    if (request.headers.authorization !== `Bearer ${FIXTURE_TOKEN}`) {
        return strapiError(
            response,
            401,
            "UnauthorizedError",
            "Missing or invalid credentials",
        );
    }

    const collection = collections[match[1]];
    if (!collection) {
        return strapiError(response, 404, "NotFoundError", "Not Found");
    }

    const params = url.searchParams;
    // Strapi returns published entries unless status=draft is requested.
    let entries = collection.filter(
        (entry) => params.get("status") === "draft" || entry.publishedAt,
    );

    for (const [key, value] of params) {
        const filter = /^filters\[([A-Za-z]+)\]\[\$eq\]$/.exec(key);
        if (filter)
            entries = entries.filter((e) => String(e[filter[1]]) === value);
    }

    const sorts = [...params]
        .filter(([key]) => /^sort(\[\d+\])?$/.test(key))
        .map(([, value]) => value.split(":"));
    entries = [...entries].sort((a, b) => {
        for (const [field, direction = "asc"] of sorts) {
            const result = compare(a[field], b[field]);
            if (result !== 0) return direction === "desc" ? -result : result;
        }
        return 0;
    });

    const page = Math.max(1, Number(params.get("pagination[page]") ?? 1));
    const pageSize = Math.min(
        100,
        Math.max(1, Number(params.get("pagination[pageSize]") ?? 25)),
    );
    const total = entries.length;

    send(response, 200, {
        data: entries.slice((page - 1) * pageSize, page * pageSize),
        meta: {
            pagination: {
                page,
                pageSize,
                pageCount: Math.ceil(total / pageSize),
                total,
            },
        },
    });
});

server.listen(PORT, () => {
    console.log(`CMS fixture server listening on http://localhost:${PORT}`);
});
