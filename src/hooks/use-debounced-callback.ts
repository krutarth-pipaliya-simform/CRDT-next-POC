"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

export interface UseDebouncedCallbackOptions {
    /**
     * Run a pending call when the component unmounts instead of dropping it.
     * For writes the user expects to land (a last click before navigating).
     */
    flushOnUnmount?: boolean;
}

export interface DebouncedCallback<Args extends unknown[]> {
    /** Schedule a call; each new call restarts the wait and replaces the arguments. */
    schedule: (...args: Args) => void;
    /** Run the pending call now, if there is one. */
    flush: () => void;
    /** Drop the pending call. */
    cancel: () => void;
}

/**
 * Trailing-edge debounce: a burst of calls becomes one, made `delayMs` after
 * the last, with the last call's arguments. The latest `callback` is always
 * the one that runs, so it need not be memoised.
 */
export function useDebouncedCallback<Args extends unknown[]>(
    callback: (...args: Args) => void,
    delayMs: number,
    { flushOnUnmount = false }: UseDebouncedCallbackOptions = {},
): DebouncedCallback<Args> {
    const callbackRef = useRef(callback);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingArgsRef = useRef<Args | null>(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const cancel = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
        pendingArgsRef.current = null;
    }, []);

    const flush = useCallback(() => {
        const args = pendingArgsRef.current;
        cancel();
        if (args) callbackRef.current(...args);
    }, [cancel]);

    const schedule = useCallback(
        (...args: Args) => {
            pendingArgsRef.current = args;
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(flush, delayMs);
        },
        [delayMs, flush],
    );

    useEffect(
        () => (flushOnUnmount ? flush : cancel),
        [flushOnUnmount, flush, cancel],
    );

    return useMemo(
        () => ({ schedule, flush, cancel }),
        [schedule, flush, cancel],
    );
}
