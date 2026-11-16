"use client";

import { useCallback } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

/** The header surfaces that open over the page. Only one is open at a time. */
export type ShellPanel = "notifications" | "account" | "switcher" | "menu";

export interface ShellUiState {
    openPanel: ShellPanel | null;
}

export interface ShellUiActions {
    togglePanel: (panel: ShellPanel) => void;
    /** Closes `panel` only if it is the open one; a stale close is a no-op. */
    closePanel: (panel: ShellPanel) => void;
}

export type ShellUiStore = ShellUiState & ShellUiActions;

/**
 * Purely client-side UI state, so a module store is safe here: it starts as
 * `null` on the server and on the first client render alike, it is never
 * seeded from server data, and only event handlers write to it, so nothing
 * from one request can reach another.
 */
export const useShellUiStore = create<ShellUiStore>()(
    devtools(
        (set) => ({
            openPanel: null,
            togglePanel: (panel) =>
                set(
                    (s) => ({
                        openPanel: s.openPanel === panel ? null : panel,
                    }),
                    undefined,
                    "togglePanel",
                ),
            closePanel: (panel) =>
                set(
                    (s) => (s.openPanel === panel ? { openPanel: null } : s),
                    undefined,
                    "closePanel",
                ),
        }),
        {
            name: "shell-ui-store",
            enabled: process.env.NODE_ENV === "development",
        },
    ),
);

/**
 * One header panel's open state. Opening it closes whichever other panel was
 * open, which separate `useState`s could not do.
 */
export function useShellPanel(panel: ShellPanel) {
    const open = useShellUiStore((s) => s.openPanel === panel);
    const togglePanel = useShellUiStore((s) => s.togglePanel);
    const closePanel = useShellUiStore((s) => s.closePanel);

    const toggle = useCallback(() => togglePanel(panel), [togglePanel, panel]);
    const close = useCallback(() => closePanel(panel), [closePanel, panel]);

    return { open, toggle, close };
}
