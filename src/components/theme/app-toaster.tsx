"use client";

import { Toaster } from "sonner";

import { useTheme } from "@/hooks/use-theme";

/**
 * Sonner renders outside the app's token scope, so it is handed the resolved
 * theme explicitly — `theme="system"` alone would ignore an in-app override.
 */
export function AppToaster() {
    const { resolvedTheme } = useTheme();

    return <Toaster position="bottom-right" theme={resolvedTheme} />;
}
