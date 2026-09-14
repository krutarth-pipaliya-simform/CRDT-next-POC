/** What the user picked. `system` defers to the OS setting. */
export type ThemePreference = "light" | "dark" | "system";

/** What is actually painted — `system` is always resolved to one of these. */
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

export const THEME_PREFERENCES: ThemePreference[] = ["light", "dark", "system"];

export function isThemePreference(value: unknown): value is ThemePreference {
    return value === "light" || value === "dark" || value === "system";
}

/**
 * Runs synchronously in <head> before the first paint, so the saved theme is
 * applied to <html> before the browser has anything to flash.
 *
 * It is deliberately dependency-free and wrapped in try/catch: a blocked
 * localStorage (private windows, cookie-blocking extensions) must degrade to
 * the server-rendered light default rather than throw and abort the script.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");var t=p==="light"||p==="dark"?p:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
