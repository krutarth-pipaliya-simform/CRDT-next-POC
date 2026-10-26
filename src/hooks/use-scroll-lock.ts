"use client";

import { useEffect } from "react";

/** How many overlays currently hold the lock, so nested ones release cleanly. */
let activeLocks = 0;
let previousOverflow = "";

/**
 * Stops the page behind an overlay from scrolling while `active` is true.
 *
 * Counted rather than toggled: a dialog opened from inside the menu overlay
 * must not unlock the page when it closes while the menu is still open.
 * `scrollbar-gutter: stable` keeps the layout from shifting when the
 * scrollbar disappears.
 */
export function useScrollLock(active: boolean): void {
    useEffect(() => {
        if (!active) return;

        const root = document.documentElement;
        if (activeLocks === 0) {
            previousOverflow = root.style.overflow;
            root.style.overflow = "hidden";
            root.style.scrollbarGutter = "stable";
        }
        activeLocks += 1;

        return () => {
            activeLocks -= 1;
            if (activeLocks === 0) {
                root.style.overflow = previousOverflow;
                root.style.scrollbarGutter = "";
            }
        };
    }, [active]);
}
