/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";

import { useScrollLock } from "@/hooks/use-scroll-lock";

const overflow = () => document.documentElement.style.overflow;

afterEach(() => {
    document.documentElement.style.overflow = "";
});

describe("useScrollLock", () => {
    it("locks while active and restores the previous value", () => {
        document.documentElement.style.overflow = "scroll";
        const { rerender } = renderHook(({ active }) => useScrollLock(active), {
            initialProps: { active: false },
        });
        expect(overflow()).toBe("scroll");

        rerender({ active: true });
        expect(overflow()).toBe("hidden");

        rerender({ active: false });
        expect(overflow()).toBe("scroll");
    });

    it("keeps the lock until the last of several overlays releases it", () => {
        const outer = renderHook(() => useScrollLock(true));
        const inner = renderHook(() => useScrollLock(true));
        expect(overflow()).toBe("hidden");

        inner.unmount();
        expect(overflow()).toBe("hidden");

        outer.unmount();
        expect(overflow()).toBe("");
    });
});
