"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/cn";
import { THEME_PREFERENCES, type ThemePreference } from "@/lib/theme";

export interface ThemeToggleProps {
    className?: string;
}

const OPTIONS: Record<ThemePreference, { label: string; Icon: typeof Sun }> = {
    light: { label: "Light", Icon: Sun },
    dark: { label: "Dark", Icon: Moon },
    system: { label: "System", Icon: Monitor },
};

/**
 * Three-state theme control. `system` is a first-class choice rather than a
 * hidden default, so a visitor who follows their OS can say so explicitly.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
    const { preference, setPreference, ready } = useTheme();

    return (
        <div
            role="radiogroup"
            aria-label="Colour theme"
            data-testid="theme-toggle"
            data-preference={ready ? preference : undefined}
            className={cn(
                "inline-flex items-center gap-0.5 p-0.5 border-2 border-brand-border rounded-brand bg-brand-surface",
                className,
            )}
        >
            {THEME_PREFERENCES.map((option) => {
                const { label, Icon } = OPTIONS[option];
                // Before storage is read, nothing is marked active: claiming a
                // selection the user did not make is worse than claiming none.
                const active = ready && preference === option;

                return (
                    <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={`${label} theme`}
                        title={`${label} theme`}
                        data-testid={`theme-option-${option}`}
                        onClick={() => setPreference(option)}
                        className={cn(
                            "p-1.5 rounded-brand transition-colors cursor-pointer",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
                            active
                                ? "bg-brand-ink text-brand-surface"
                                : "text-brand-subtle hover:text-brand-ink hover:bg-brand-muted",
                        )}
                    >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                );
            })}
        </div>
    );
}
