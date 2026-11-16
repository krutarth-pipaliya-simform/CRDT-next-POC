"use client";

import {
    useCallback,
    useMemo,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import { createContext } from "react";

import {
    DEFAULT_THEME_PREFERENCE,
    THEME_STORAGE_KEY,
    isThemePreference,
    type ResolvedTheme,
    type ThemePreference,
} from "@/lib/theme";

export interface ThemeState {
    /** The stored choice, including `system`. */
    preference: ThemePreference;
    /** The theme actually painted right now. */
    resolvedTheme: ResolvedTheme;
}

export interface ThemeContextValue extends ThemeState {
    setPreference: (preference: ThemePreference) => void;
    /** False during SSR and the hydrating render; the stored choice is unknown until then. */
    ready: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * What the server renders. It is a distinct object identity, which is also how
 * `ready` is derived — any other snapshot means the client store has been read.
 */
const SERVER_STATE: ThemeState = {
    preference: DEFAULT_THEME_PREFERENCE,
    resolvedTheme: "light",
};

// ── External store ────────────────────────────────────────────────
// The theme lives outside React (localStorage + a media query), so it is read
// through useSyncExternalStore. That keeps the hydrating render identical to
// the server's while still adopting the real value immediately afterwards,
// without a setState-in-effect cascade.

let state: ThemeState = SERVER_STATE;
let initialized = false;
const listeners = new Set<() => void>();

function systemTheme(): ResolvedTheme {
    return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function resolve(preference: ThemePreference): ResolvedTheme {
    return preference === "system" ? systemTheme() : preference;
}

function readStoredPreference(): ThemePreference {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE;
    } catch {
        // Storage can be blocked outright; fall back to following the OS.
        return DEFAULT_THEME_PREFERENCE;
    }
}

/**
 * Write the theme to the document immediately, outside React's render cycle.
 *
 * Consumers that read the resolved tokens back out of the cascade during render
 * (the ECharts widgets) would otherwise see the previous theme for one render,
 * because an effect runs after the render it belongs to.
 */
function applyTheme(theme: ResolvedTheme): void {
    document.documentElement.setAttribute("data-theme", theme);
}

function publish(next: ThemeState): void {
    if (
        next.preference === state.preference &&
        next.resolvedTheme === state.resolvedTheme &&
        state !== SERVER_STATE
    ) {
        return;
    }
    state = next;
    applyTheme(next.resolvedTheme);
    listeners.forEach((listener) => listener());
}

function getSnapshot(): ThemeState {
    if (!initialized) {
        initialized = true;
        const preference = readStoredPreference();
        state = { preference, resolvedTheme: resolve(preference) };
    }
    return state;
}

function getServerSnapshot(): ThemeState {
    return SERVER_STATE;
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    const media = window.matchMedia(DARK_QUERY);

    // Follow the OS while the preference is `system`.
    const onMediaChange = () => {
        if (state.preference !== "system") return;
        publish({ preference: "system", resolvedTheme: systemTheme() });
    };

    // Keep other tabs in step.
    const onStorage = (event: StorageEvent) => {
        if (event.key !== THEME_STORAGE_KEY) return;
        const preference = isThemePreference(event.newValue)
            ? event.newValue
            : DEFAULT_THEME_PREFERENCE;
        publish({ preference, resolvedTheme: resolve(preference) });
    };

    media.addEventListener("change", onMediaChange);
    window.addEventListener("storage", onStorage);

    return () => {
        listeners.delete(listener);
        media.removeEventListener("change", onMediaChange);
        window.removeEventListener("storage", onStorage);
    };
}

export interface ThemeProviderProps {
    children: ReactNode;
}

/** Owns the theme preference and keeps `<html data-theme>` in sync. */
export function ThemeProvider({ children }: ThemeProviderProps) {
    const snapshot = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    const setPreference = useCallback((preference: ThemePreference) => {
        publish({ preference, resolvedTheme: resolve(preference) });
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, preference);
        } catch {
            // The preference simply does not persist when storage is unavailable.
        }
    }, []);

    const value = useMemo<ThemeContextValue>(
        () => ({
            preference: snapshot.preference,
            resolvedTheme: snapshot.resolvedTheme,
            setPreference,
            ready: snapshot !== SERVER_STATE,
        }),
        [snapshot, setPreference],
    );

    return <ThemeContext value={value}>{children}</ThemeContext>;
}
