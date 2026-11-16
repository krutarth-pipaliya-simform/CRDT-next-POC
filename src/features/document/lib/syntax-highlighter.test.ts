import { lowlight } from "@/features/document/lib/syntax-highlighter";

describe("lowlight (ESM-only dependency)", () => {
    it("registers the common languages", () => {
        expect(lowlight.registered("javascript")).toBe(true);
        expect(lowlight.registered("typescript")).toBe(true);
        expect(lowlight.registered("not-a-language")).toBe(false);
    });

    it("highlights code into a syntax tree", () => {
        const tree = lowlight.highlight("javascript", "const a = 1;");
        expect(tree.type).toBe("root");
        expect(tree.children.length).toBeGreaterThan(0);
    });
});
