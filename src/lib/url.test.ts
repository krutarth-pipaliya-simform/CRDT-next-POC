import { headers } from "next/headers";

import { getAppUrl } from "@/lib/url";

jest.mock("next/headers", () => ({ headers: jest.fn() }));

const mockHeaders = jest.mocked(headers);

function withHeaders(values: Record<string, string>) {
    mockHeaders.mockResolvedValue(new Headers(values));
}

describe("getAppUrl", () => {
    afterEach(() => {
        delete process.env.APP_URL;
    });

    it("prefers APP_URL and strips trailing slashes", async () => {
        process.env.APP_URL = "https://app.example.com//";
        withHeaders({ host: "evil.example" });

        await expect(getAppUrl()).resolves.toBe("https://app.example.com");
        expect(mockHeaders).not.toHaveBeenCalled();
    });

    it("uses http for local hosts", async () => {
        withHeaders({ host: "localhost:3000" });
        await expect(getAppUrl()).resolves.toBe("http://localhost:3000");

        withHeaders({ host: "192.168.1.5:3000" });
        await expect(getAppUrl()).resolves.toBe("http://192.168.1.5:3000");
    });

    it("uses https for public hosts", async () => {
        withHeaders({ host: "example.com" });
        await expect(getAppUrl()).resolves.toBe("https://example.com");
    });

    it("honours x-forwarded-proto", async () => {
        withHeaders({ host: "localhost:3000", "x-forwarded-proto": "https" });
        await expect(getAppUrl()).resolves.toBe("https://localhost:3000");
    });

    it("defaults to localhost:3000 without a host header", async () => {
        withHeaders({});
        await expect(getAppUrl()).resolves.toBe("http://localhost:3000");
    });
});
