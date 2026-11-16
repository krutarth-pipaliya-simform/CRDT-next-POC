import {
    apiAuthPrefix,
    authRoutes,
    DEFAULT_LOGIN_REDIRECT,
    DEFAULT_UNAUTHENTICATED_REDIRECT,
    isPublicPath,
} from "@/lib/routes";

describe("isPublicPath", () => {
    it.each(["/", "/verify-email", "/forgot-password", "/reset-password"])(
        "treats %s as public",
        (path) => {
            expect(isPublicPath(path)).toBe(true);
        },
    );

    it("treats CMS sections and their children as public", () => {
        expect(isPublicPath("/blog")).toBe(true);
        expect(isPublicPath("/blog/some-slug")).toBe(true);
        expect(isPublicPath("/changelog/2026")).toBe(true);
    });

    it("does not treat look-alike prefixes as public", () => {
        expect(isPublicPath("/blogger")).toBe(false);
        expect(isPublicPath("/docsx/page")).toBe(false);
    });

    it("keeps app routes private", () => {
        expect(isPublicPath("/dashboard")).toBe(false);
        expect(isPublicPath("/w1/settings/billing")).toBe(false);
    });
});

describe("route constants", () => {
    it("exposes the auth routes and redirects", () => {
        expect(authRoutes).toEqual(["/login", "/register"]);
        expect(apiAuthPrefix).toBe("/api/auth");
        expect(DEFAULT_LOGIN_REDIRECT).toBe("/dashboard");
        expect(DEFAULT_UNAUTHENTICATED_REDIRECT).toBe("/login");
    });
});
