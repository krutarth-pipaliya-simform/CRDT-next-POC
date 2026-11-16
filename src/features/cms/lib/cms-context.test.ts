import {
    CMS_NOT_CONFIGURED_ERROR,
    resolveCmsContext,
} from "@/features/cms/lib/cms-context";

describe("resolveCmsContext", () => {
    it("is not configured without both the URL and the token", () => {
        const expected = { success: false, error: CMS_NOT_CONFIGURED_ERROR };
        expect(resolveCmsContext(undefined, undefined)).toEqual(expected);
        expect(resolveCmsContext("https://cms.example.com", undefined)).toEqual(
            expected,
        );
        expect(resolveCmsContext(undefined, "tok")).toEqual(expected);
        expect(resolveCmsContext("", "tok")).toEqual(expected);
    });

    it("strips trailing slashes from the origin", () => {
        expect(resolveCmsContext("https://cms.example.com///", "tok")).toEqual({
            success: true,
            data: { baseUrl: "https://cms.example.com", token: "tok" },
        });
    });
});
