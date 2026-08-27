"use client";

import { useEffect, type RefObject } from "react";

/**
 * Hook that invokes a handler callback when a click event occurs outside the referenced DOM element.
 */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>,
    callback: () => void,
    enabled: boolean = true,
): void {
    useEffect(() => {
        if (!enabled) return;

        function handleClickOutside(event: MouseEvent) {
            if (
                ref.current &&
                event.target instanceof Node &&
                !ref.current.contains(event.target)
            ) {
                callback();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback, enabled]);
}
