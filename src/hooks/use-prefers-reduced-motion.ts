"use client";

import { useSyncExternalStore } from "react";

const STILLNESS_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
    const query = window.matchMedia(STILLNESS_QUERY);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

function readClientSnapshot(): boolean {
    return window.matchMedia(STILLNESS_QUERY).matches;
}

/** The server cannot know, so it renders the moving version and hydration matches. */
function readServerSnapshot(): boolean {
    return false;
}

/**
 * Whether the visitor asked for reduced motion, read as a subscription.
 *
 * A one-off check inside an effect (followed by `setState`) renders twice and
 * misses a preference changed mid-visit. `useSyncExternalStore` does neither,
 * and its constant server snapshot keeps the hydrating render identical.
 */
export function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(
        subscribe,
        readClientSnapshot,
        readServerSnapshot,
    );
}
