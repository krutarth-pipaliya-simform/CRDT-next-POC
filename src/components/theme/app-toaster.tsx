"use client";

import { Toaster } from "sonner";

import type { CssVariableStyle } from "@/components/paddock/paddock-styles";
import { useTheme } from "@/hooks/use-theme";

/**
 * Sonner's own palette variables, pointed at Paddock tokens. The tokens flip
 * with `data-theme`, so one mapping serves both themes.
 */
const PADDOCK_TOAST_STYLE: CssVariableStyle = {
    "--normal-bg": "var(--color-paddock-sheet)",
    "--normal-text": "var(--color-paddock-ink)",
    "--normal-border": "var(--color-paddock-ink)",
    "--success-bg": "var(--color-paddock-sheet)",
    "--success-text": "var(--color-paddock-ink)",
    "--success-border": "var(--color-paddock-ink)",
    "--error-bg": "var(--color-paddock-sheet)",
    "--error-text": "var(--color-paddock-danger)",
    "--error-border": "var(--color-paddock-danger)",
    "--border-radius": "var(--radius-paddock-card)",
};

/**
 * Sonner renders outside the app's token scope, so it is handed the resolved
 * theme explicitly — `theme="system"` alone would ignore an in-app override.
 * It is mounted inside `<PaddockRoot>`, so toasts inherit the Paddock fonts.
 */
export function AppToaster() {
    const { resolvedTheme } = useTheme();

    return (
        <Toaster
            position="bottom-right"
            theme={resolvedTheme}
            style={PADDOCK_TOAST_STYLE}
            toastOptions={{
                classNames: {
                    toast: "border-[1.5px] shadow-paddock-float",
                    title: "font-semibold",
                    description: "text-paddock-subtle",
                },
            }}
        />
    );
}
