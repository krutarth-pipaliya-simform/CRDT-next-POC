import { getPresenceSlot } from "@/lib/presence";
import {
    initialsOf,
    listNames,
    PADDOCK_PRESENCE_SLOT_COUNT,
    paddockCaretVar,
    paddockPresenceTint,
    paddockPresenceVar,
} from "@/components/paddock/paddock-presence";

describe("paddock presence colours", () => {
    it("maps a user onto one of four one-based slots, shared with presence.ts", () => {
        const slot = getPresenceSlot("u1", PADDOCK_PRESENCE_SLOT_COUNT) + 1;
        expect(slot).toBeGreaterThanOrEqual(1);
        expect(slot).toBeLessThanOrEqual(4);
        expect(paddockPresenceVar("u1")).toBe(
            `var(--color-paddock-presence-${slot})`,
        );
        expect(paddockCaretVar("u1")).toBe(
            `var(--color-paddock-caret-${slot})`,
        );
    });

    it("builds a translucent tint, 32% by default", () => {
        expect(paddockPresenceTint("u1")).toBe(
            `color-mix(in srgb, ${paddockPresenceVar("u1")} 32%, transparent)`,
        );
        expect(paddockPresenceTint("u1", 50)).toContain(" 50%,");
    });
});

describe("initialsOf", () => {
    it("takes the first letter by default and up to two on request", () => {
        expect(initialsOf("Maya Okafor")).toBe("M");
        expect(initialsOf("Maya Okafor", 2)).toBe("MO");
        expect(initialsOf("Maya Louise Okafor", 2)).toBe("ML");
    });

    it("upper-cases, trims and collapses whitespace", () => {
        expect(initialsOf("  ada   lovelace ", 2)).toBe("AL");
    });

    it("falls back to ? for an empty name", () => {
        expect(initialsOf("")).toBe("?");
        expect(initialsOf("   ", 2)).toBe("?");
    });
});

describe("listNames", () => {
    it("joins names as a spoken list", () => {
        expect(listNames(["Maya"])).toBe("Maya");
        expect(listNames(["Maya", "Theo"])).toBe("Maya and Theo");
        expect(listNames(["Maya", "Theo", "Priya"])).toBe(
            "Maya, Theo, and Priya",
        );
    });
});
