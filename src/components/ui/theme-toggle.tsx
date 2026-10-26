"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/cn";
import { THEME_PREFERENCES, type ThemePreference } from "@/lib/theme";

export interface ThemeToggleProps {
    /** Which ground it sits on. The menu overlay is night in both themes. */
    surface?: "paper" | "night";
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
 * The selected option is a lime fill, like every other Paddock selection.
 */
export function ThemeToggle({
    surface = "paper",
    className,
}: ThemeToggleProps) {
    const { preference, setPreference, ready } = useTheme();
    const night = surface === "night";

    return (
        <div
            role="radiogroup"
            aria-label="Colour theme"
            data-testid="theme-toggle"
            data-preference={ready ? preference : undefined}
            className={cn(
                "inline-flex items-center gap-0.5 rounded-full border-[1.5px] p-[3px]",
                night ? "border-paddock-night-rule" : "border-paddock-rule",
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
                            "flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors",
                            active
                                ? "bg-paddock-lime text-paddock-on-fill"
                                : night
                                  ? "text-paddock-night-subtle hover:bg-paddock-night-fg/10 hover:text-paddock-night-fg"
                                  : "text-paddock-subtle hover:bg-paddock-ink/8 hover:text-paddock-ink",
                        )}
                    >
                        <Icon className="size-4" aria-hidden="true" />
                    </button>
                );
            })}
        </div>
    );
}
