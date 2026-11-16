import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import {
    paddockButtonClasses,
    paddockButtonSizes,
    paddockButtonVariants,
    paddockFieldClasses,
    paddockIconButtonSizes,
    paddockPillBase,
} from "@/components/paddock/paddock-styles";

describe("paddockButtonClasses", () => {
    it("defaults to a primary, medium button in the display voice", () => {
        const classes = paddockButtonClasses();
        expect(classes).toContain(paddockButtonVariants.primary.paper);
        expect(classes).toContain(paddockButtonSizes.md);
        expect(classes).toContain("paddock-heavy");
    });

    it("uses the plain voice for ghost and danger buttons", () => {
        expect(paddockButtonClasses({ variant: "ghost" })).toContain(
            "font-semibold",
        );
        expect(paddockButtonClasses({ variant: "danger" })).toContain(
            "font-semibold",
        );
        expect(paddockButtonClasses({ variant: "outline" })).toContain(
            "paddock-heavy",
        );
    });

    it("lets an explicit voice win", () => {
        const classes = paddockButtonClasses({
            variant: "primary",
            voice: "plain",
        });
        expect(classes).toContain("font-semibold");
        expect(classes).not.toContain("paddock-heavy");
    });

    it("restates outline ink on night grounds", () => {
        expect(
            paddockButtonClasses({ variant: "outline", surface: "night" }),
        ).toContain("text-paddock-night-fg");
    });

    it("merges a caller class last, resolving conflicts", () => {
        expect(paddockButtonClasses({ className: "h-20" })).toContain("h-20");
        expect(paddockButtonClasses({ className: "h-20" })).not.toContain(
            "h-12",
        );
    });

    it("never produces an empty class string (client-reference regression)", () => {
        expect(paddockButtonClasses()).not.toBe("");
        expect(PAGE_CONTAINER).toContain("max-w-");
    });
});

describe("paddock class constants", () => {
    it("keeps every button at least 44px tall", () => {
        expect(paddockButtonSizes.sm).toContain("h-11");
        expect(paddockIconButtonSizes.sm).toBe("size-11");
    });

    it("provides field and pill bases", () => {
        expect(paddockFieldClasses).toContain("border-paddock-ink");
        expect(paddockPillBase).toContain("paddock-tag");
    });
});
