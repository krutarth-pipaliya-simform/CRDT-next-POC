import type { ButtonVariant, Size } from "@/components/ui/types";
import { cn } from "@/lib/cn";

/**
 * Button styling lives in its own module, deliberately without `"use client"`.
 *
 * `Button` needs `useFormStatus`, so it is a client component. When a server
 * component imports a value from a client module, the bundler hands back a
 * client reference rather than the value, so these constants arrive
 * `undefined` on the server and the element renders with an empty class list.
 * Keeping them here lets `LinkButton` stay a server component and still be
 * styled from the same source as `Button`.
 */

/**
 * Colour never carries the primary action — ink does. That keeps every
 * saturated pixel in the product meaning "a person", and it makes the one red
 * button on a destructive dialog genuinely alarming.
 *
 * Hover is a lift into the hard offset shadow rather than a hue change: the
 * brutalist bones do the work, and there is no second colour to maintain
 * across two themes.
 */
export const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "bg-brand-ink text-brand-paper border-2 border-brand-ink hover:-translate-y-[2px] hover:shadow-brand-subtle active:translate-y-0 active:shadow-none",
    secondary:
        "bg-brand-surface text-brand-ink border-2 border-brand-ink hover:-translate-y-[2px] hover:shadow-brand-subtle active:translate-y-0 active:shadow-none",
    ghost: "bg-transparent text-brand-subtle border-2 border-transparent hover:text-brand-ink hover:bg-brand-muted",
    danger: "bg-brand-danger text-brand-on-fill border-2 border-brand-danger hover:-translate-y-[2px] hover:shadow-brand-subtle active:translate-y-0 active:shadow-none",
};

export const sizeClasses: Record<Size, string> = {
    sm: "h-8 px-3 text-[13px]",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-[15px]",
};

export const buttonBaseClasses = cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium tracking-[-0.005em] rounded-brand",
    "transition-[transform,box-shadow,background-color,color,border-color] duration-100 ease-out",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none",
);
