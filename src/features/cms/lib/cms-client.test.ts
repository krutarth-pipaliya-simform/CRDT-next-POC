import { z } from "zod";

import { env } from "@/lib/env";
import { fetchBySlug, fetchCollection } from "@/features/cms/lib/cms-client";

jest.mock("@/lib/env", () => ({ env: {} }));

const itemSchema = z.object({ slug: z.string() });

const page = {
    data: [{ slug: "a" }, { slug: "b" }],
    meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: 2 } },
};

const fetchMock = jest.fn();

function respond(body: unknown, init: { status?: number } = {}) {
    fetchMock.mockResolvedValue(
        new Response(JSON.stringify(body), { status: init.status ?? 200 }),
    );
}

beforeEach(() => {
    fetchMock.mockReset();
    jest.spyOn(globalThis, "fetch").mockImplementation(fetchMock);
    jest.spyOn(console, "error").mockImplementation(() => {});
    Object.assign(env, {
        CMS_API_URL: "https://cms.example.com",
        CMS_API_TOKEN: "secret-token",
    });
});

afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(env, "CMS_API_URL");
    Reflect.deleteProperty(env, "CMS_API_TOKEN");
});

describe("fetchCollection", () => {
    it("reports an unconfigured CMS without making a request", async () => {
        Reflect.deleteProperty(env, "CMS_API_TOKEN");

        const result = await fetchCollection("articles", itemSchema);

        expect(result).toMatchObject({ success: false, notConfigured: true });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("sends the bearer token and the Strapi query, tagged for revalidation", async () => {
        respond(page);

        await fetchCollection("release-notes", itemSchema, {
            sort: ["releaseDate:desc", "title:asc"],
            page: 2,
            pageSize: 5,
            equals: { slug: "v1" },
        });

        const [url, init] = fetchMock.mock.calls[0];
        const parsed = new URL(url);
        expect(parsed.origin + parsed.pathname).toBe(
            "https://cms.example.com/api/release-notes",
        );
        expect(parsed.searchParams.get("sort[0]")).toBe("releaseDate:desc");
        expect(parsed.searchParams.get("sort[1]")).toBe("title:asc");
        expect(parsed.searchParams.get("pagination[page]")).toBe("2");
        expect(parsed.searchParams.get("pagination[pageSize]")).toBe("5");
        expect(parsed.searchParams.get("filters[slug][$eq]")).toBe("v1");
        expect(init.headers.Authorization).toBe("Bearer secret-token");
        expect(init.next.tags).toEqual(["cms", "cms:release-notes"]);
    });

    it("defaults to page 1 of 10", async () => {
        respond(page);
        await fetchCollection("articles", itemSchema);
        const parsed = new URL(fetchMock.mock.calls[0][0]);
        expect(parsed.searchParams.get("pagination[page]")).toBe("1");
        expect(parsed.searchParams.get("pagination[pageSize]")).toBe("10");
    });

    it("returns validated items and pagination", async () => {
        respond(page);
        await expect(fetchCollection("articles", itemSchema)).resolves.toEqual({
            success: true,
            data: { items: page.data, pagination: page.meta.pagination },
        });
    });

    it("explains an unreachable service", async () => {
        fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));
        const result = await fetchCollection("articles", itemSchema);
        expect(result).toMatchObject({ success: false, notConfigured: false });
        if (!result.success)
            expect(result.error).toMatch(/could not be reached/);
    });

    it.each([401, 403])(
        "names the token when the CMS answers %i",
        async (status) => {
            respond({}, { status });
            const result = await fetchCollection("articles", itemSchema);
            expect(result.success).toBe(false);
            if (!result.success) expect(result.error).toMatch(/CMS_API_TOKEN/);
        },
    );

    it("reports other HTTP failures with the status", async () => {
        respond({}, { status: 500 });
        const result = await fetchCollection("articles", itemSchema);
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toContain("500");
    });

    it("rejects a body that is not JSON", async () => {
        fetchMock.mockResolvedValue(new Response("<html>", { status: 200 }));
        const result = await fetchCollection("articles", itemSchema);
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toMatch(/could not read/);
    });

    it("rejects a response that does not match the schema", async () => {
        respond({ data: [{ slug: 5 }], meta: page.meta });
        const result = await fetchCollection("articles", itemSchema);
        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toMatch(/unexpected shape/);

        respond({ data: [] });
        const missingMeta = await fetchCollection("articles", itemSchema);
        expect(missingMeta.success).toBe(false);
    });
});

describe("fetchBySlug", () => {
    it("asks for exactly one entry with that slug", async () => {
        respond(page);
        const result = await fetchBySlug("docs", itemSchema, "intro");

        const parsed = new URL(fetchMock.mock.calls[0][0]);
        expect(parsed.searchParams.get("filters[slug][$eq]")).toBe("intro");
        expect(parsed.searchParams.get("pagination[pageSize]")).toBe("1");
        expect(result).toEqual({ success: true, data: { slug: "a" } });
    });

    it("returns null data for a miss", async () => {
        respond({ ...page, data: [] });
        await expect(fetchBySlug("docs", itemSchema, "x")).resolves.toEqual({
            success: true,
            data: null,
        });
    });

    it("passes a failure through", async () => {
        respond({}, { status: 500 });
        const result = await fetchBySlug("docs", itemSchema, "x");
        expect(result.success).toBe(false);
    });
});
