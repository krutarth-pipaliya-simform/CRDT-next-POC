import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

/**
 * Paddock class maps, deliberately without `"use client"` — the same reason as
 * `src/components/ui/button-styles.ts`: a server component that imports a
 * value from a client module receives a client reference, not the value.
 */

export type PaddockButtonVariant = "primary" | "outline" | "ghost" | "danger";
export type PaddockButtonSize = "sm" | "md" | "lg";
/** Which ground the control sits on. Night grounds stay dark in both themes. */
export type PaddockSurface = "paper" | "night";
/** `display` is the heavy wide caps; `plain` is sentence case for quieter actions. */
export type PaddockButtonVoice = "display" | "plain";

export const paddockButtonBase = cn(
    "paddock-press inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-paddock no-underline cursor-pointer select-none",
    "disabled:cursor-not-allowed disabled:opacity-45",
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-45",
);

/**
 * Lime is a fill and only ever carries `on-fill` text. Outline and ghost
 * restate their ink for night grounds, where ink would vanish.
 */
export const paddockButtonVariants: Record<
    PaddockButtonVariant,
    Record<PaddockSurface, string>
> = {
    primary: {
        paper: "bg-paddock-lime text-paddock-on-fill",
        night: "bg-paddock-lime text-paddock-on-fill",
    },
    outline: {
        paper: "border-[1.5px] border-paddock-ink bg-transparent text-paddock-ink",
        night: "border-[1.5px] border-paddock-night-fg bg-transparent text-paddock-night-fg",
    },
    ghost: {
        paper: "bg-transparent text-paddock-ink hover:bg-paddock-ink/8",
        night: "bg-transparent text-paddock-night-fg hover:bg-paddock-night-fg/10",
    },
    danger: {
        paper: "bg-paddock-danger text-paddock-on-danger",
        night: "bg-paddock-danger text-paddock-on-danger",
    },
};

/** Heights never drop below 44px, the minimum touch target. */
export const paddockButtonSizes: Record<PaddockButtonSize, string> = {
    sm: "h-11 px-4 text-sm",
    md: "h-12 px-5 text-[0.9375rem]",
    lg: "h-14 px-7 text-base",
};

export const paddockButtonVoices: Record<PaddockButtonVoice, string> = {
    display: "paddock-heavy",
    plain: "font-semibold",
};

export const paddockIconButtonSizes: Record<
    Exclude<PaddockButtonSize, "lg">,
    string
> = {
    sm: "size-11",
    md: "size-12",
};

export interface PaddockButtonClassOptions {
    variant?: PaddockButtonVariant;
    size?: PaddockButtonSize;
    surface?: PaddockSurface;
    voice?: PaddockButtonVoice;
    className?: string;
}

/** One composer for `<PaddockButton>` and `<PaddockLinkButton>`. */
export function paddockButtonClasses({
    variant = "primary",
    size = "md",
    surface = "paper",
    voice,
    className,
}: PaddockButtonClassOptions = {}): string {
    const resolvedVoice =
        voice ??
        (variant === "primary" || variant === "outline" ? "display" : "plain");

    return cn(
        paddockButtonBase,
        paddockButtonVariants[variant][surface],
        paddockButtonSizes[size],
        paddockButtonVoices[resolvedVoice],
        className,
    );
}

/** Text fields share one body; the focus ring comes from `.paddock-root`. */
export const paddockFieldClasses = cn(
    "w-full rounded-paddock border-[1.5px] border-paddock-ink bg-paddock-sheet",
    "px-4 text-[0.9375rem] font-medium text-paddock-ink",
    "placeholder:text-paddock-subtle",
    "aria-invalid:border-paddock-danger",
    "disabled:cursor-not-allowed disabled:opacity-55",
);

/** Small pills: roles and statuses. Never a hue — those belong to people. */
export const paddockPillBase =
    "paddock-tag inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem] leading-none whitespace-nowrap";

/**
 * Inline style that may also set custom properties (`--paddock-*`), typed
 * without a cast. Declare the object with this annotation, then pass it on.
 */
export type CssVariableStyle = CSSProperties & {
    [property: `--${string}`]: string;
};
