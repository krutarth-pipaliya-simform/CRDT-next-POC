/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

function mockMatchMedia(initial: boolean) {
    let matches = initial;
    const listeners = new Set<() => void>();
    window.matchMedia = jest.fn().mockImplementation(() => ({
        get matches() {
            return matches;
        },
        addEventListener: (_: string, listener: () => void) =>
            listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) =>
            listeners.delete(listener),
    }));
    return {
        set(next: boolean) {
            matches = next;
            listeners.forEach((listener) => listener());
        },
        listenerCount: () => listeners.size,
    };
}

describe("usePrefersReducedMotion", () => {
    it("reads the current preference", () => {
        mockMatchMedia(true);
        const { result } = renderHook(() => usePrefersReducedMotion());
        expect(result.current).toBe(true);
    });

    it("follows a preference changed mid-visit", () => {
        const media = mockMatchMedia(false);
        const { result } = renderHook(() => usePrefersReducedMotion());
        expect(result.current).toBe(false);

        act(() => media.set(true));
        expect(result.current).toBe(true);
    });

    it("unsubscribes on unmount", () => {
        const media = mockMatchMedia(false);
        const { unmount } = renderHook(() => usePrefersReducedMotion());
        expect(media.listenerCount()).toBe(1);
        unmount();
        expect(media.listenerCount()).toBe(0);
    });
});
