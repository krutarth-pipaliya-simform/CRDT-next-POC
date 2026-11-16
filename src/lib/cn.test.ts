import { cn } from "@/lib/cn";

describe("cn", () => {
    it("joins truthy class names and drops falsy ones", () => {
        expect(cn("a", false, null, undefined, "b")).toBe("a b");
    });

    it("lets the later Tailwind utility win a conflict", () => {
        expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    it("supports conditional object syntax", () => {
        expect(cn("base", { on: true, off: false })).toBe("base on");
    });
});
