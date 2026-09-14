"use client";

import { use } from "react";

import {
    ThemeContext,
    type ThemeContextValue,
} from "@/components/theme/theme-provider";

/** Read the active theme. Must be called under `<ThemeProvider>` (root layout). */
export function useTheme(): ThemeContextValue {
    const context = use(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
}
