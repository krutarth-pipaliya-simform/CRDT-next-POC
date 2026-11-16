import {
    getPresenceSlot,
    getUserColor,
    PRESENCE_SLOT_COUNT,
    presenceVar,
} from "@/lib/presence";

describe("presence colour", () => {
    it("is stable for the same user id", () => {
        expect(getPresenceSlot("user-1")).toBe(getPresenceSlot("user-1"));
    });

    it("always lands inside the slot range", () => {
        for (const id of ["", "a", "user-1", "ünïcode", "x".repeat(500)]) {
            const slot = getPresenceSlot(id);
            expect(slot).toBeGreaterThanOrEqual(0);
            expect(slot).toBeLessThan(PRESENCE_SLOT_COUNT);
        }
    });

    it("honours a custom slot count", () => {
        for (const id of ["a", "b", "c", "d", "e"]) {
            expect(getPresenceSlot(id, 4)).toBeLessThan(4);
        }
    });

    it("spreads different ids over more than one slot", () => {
        const slots = new Set(
            Array.from({ length: 40 }, (_, i) => getPresenceSlot(`u${i}`)),
        );
        expect(slots.size).toBeGreaterThan(3);
    });

    it("builds a one-based CSS variable reference", () => {
        expect(presenceVar("user-1")).toBe(
            `var(--color-brand-presence-${getPresenceSlot("user-1") + 1})`,
        );
    });

    it("returns a theme-independent hex for awareness payloads", () => {
        expect(getUserColor("user-1")).toMatch(/^#[0-9a-f]{6}$/);
        expect(getUserColor("user-1")).toBe(getUserColor("user-1"));
    });
});
