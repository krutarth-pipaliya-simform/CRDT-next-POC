import { captureException } from "@sentry/nextjs";

import { reportBoundaryError, reportError } from "@/lib/report-error";

jest.mock("@sentry/nextjs", () => ({ captureException: jest.fn() }));

const capture = jest.mocked(captureException);

beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
    jest.restoreAllMocks();
});

describe("reportError", () => {
    it("logs and captures with the label as a tag", () => {
        const error = new Error("boom");
        reportError("[Thing] failed", error);

        expect(console.error).toHaveBeenCalledWith("[Thing] failed", error);
        expect(capture).toHaveBeenCalledWith(error, {
            tags: { source: "[Thing] failed" },
            extra: undefined,
        });
    });

    it("adds the workspace tag and extra details when given", () => {
        reportError("x", "e", { workspaceId: "w1", extra: { id: 1 } });

        expect(capture).toHaveBeenCalledWith("e", {
            tags: { source: "x", workspace_id: "w1" },
            extra: { id: 1 },
        });
    });

    it("never throws when Sentry itself throws", () => {
        capture.mockImplementationOnce(() => {
            throw new Error("sentry down");
        });
        expect(() => reportError("x", new Error("e"))).not.toThrow();
    });
});

describe("reportBoundaryError", () => {
    it("skips server errors that carry a digest", () => {
        reportBoundaryError(
            Object.assign(new Error("s"), { digest: "d" }),
            "b",
        );
        expect(capture).not.toHaveBeenCalled();
    });

    it("captures browser errors once", () => {
        const error = new Error("client");
        reportBoundaryError(error, "global-error");
        expect(capture).toHaveBeenCalledWith(error, {
            tags: { source: "global-error" },
        });
    });

    it("swallows a Sentry failure", () => {
        capture.mockImplementationOnce(() => {
            throw new Error("sentry down");
        });
        expect(() => reportBoundaryError(new Error("e"), "b")).not.toThrow();
    });
});
