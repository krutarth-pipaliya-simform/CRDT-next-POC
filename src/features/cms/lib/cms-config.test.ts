import { env } from "@/lib/env";
import { getCmsContext } from "@/features/cms/lib/cms-config";

jest.mock("@/lib/env", () => ({ env: {} }));

describe("getCmsContext", () => {
    afterEach(() => {
        Reflect.deleteProperty(env, "CMS_API_URL");
        Reflect.deleteProperty(env, "CMS_API_TOKEN");
    });

    it("reports an unconfigured CMS", () => {
        expect(getCmsContext().success).toBe(false);
    });

    it("builds the context from the validated environment", () => {
        Object.assign(env, {
            CMS_API_URL: "https://cms.example.com/",
            CMS_API_TOKEN: "secret",
        });
        expect(getCmsContext()).toEqual({
            success: true,
            data: { baseUrl: "https://cms.example.com", token: "secret" },
        });
    });
});
