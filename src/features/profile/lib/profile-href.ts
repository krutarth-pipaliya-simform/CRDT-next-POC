/**
 * The profile page, carrying the path it was opened from so the page can link
 * straight back there. No `"use client"`, so the shell's client menus and any
 * server component can share it.
 */
export function profileHref(from: string): string {
    if (from === "/profile") return "/profile";
    return `/profile?from=${encodeURIComponent(from)}`;
}
