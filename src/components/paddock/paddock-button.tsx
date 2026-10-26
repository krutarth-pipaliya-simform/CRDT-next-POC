import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

import {
    paddockButtonClasses,
    paddockButtonVariants,
    paddockIconButtonSizes,
    type PaddockButtonClassOptions,
    type PaddockButtonSize,
    type PaddockButtonVariant,
    type PaddockSurface,
} from "./paddock-styles";

/**
 * Hook-free on purpose, with no `"use client"`: these render on the server
 * and can still be handed an `onClick` from a client parent.
 */

export interface PaddockButtonProps
    extends
        ButtonHTMLAttributes<HTMLButtonElement>,
        Omit<PaddockButtonClassOptions, "className"> {}

export function PaddockButton({
    variant,
    size,
    surface,
    voice,
    className,
    type = "button",
    ...props
}: PaddockButtonProps) {
    return (
        <button
            type={type}
            className={paddockButtonClasses({
                variant,
                size,
                surface,
                voice,
                className,
            })}
            {...props}
        />
    );
}

export interface PaddockLinkButtonProps
    extends
        ComponentProps<typeof Link>,
        Omit<PaddockButtonClassOptions, "className"> {}

/** Navigation that looks like an action. The `<a>` itself is styled — no button inside. */
export function PaddockLinkButton({
    variant,
    size,
    surface,
    voice,
    className,
    ...props
}: PaddockLinkButtonProps) {
    return (
        <Link
            className={paddockButtonClasses({
                variant,
                size,
                surface,
                voice,
                className,
            })}
            {...props}
        />
    );
}

export interface PaddockIconButtonProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "aria-label" | "children"
> {
    /** Required: an icon-only control has no other accessible name. */
    label: string;
    icon: ReactNode;
    variant?: Exclude<PaddockButtonVariant, "danger">;
    size?: Exclude<PaddockButtonSize, "lg">;
    surface?: PaddockSurface;
}

/** The 48px square used for notifications, close and add. */
export function PaddockIconButton({
    label,
    icon,
    variant = "outline",
    size = "md",
    surface = "paper",
    className,
    type = "button",
    ...props
}: PaddockIconButtonProps) {
    return (
        <button
            type={type}
            aria-label={label}
            className={cn(
                "paddock-press inline-flex shrink-0 items-center justify-center rounded-paddock cursor-pointer",
                "disabled:cursor-not-allowed disabled:opacity-45",
                paddockButtonVariants[variant][surface],
                paddockIconButtonSizes[size],
                className,
            )}
            {...props}
        >
            <span aria-hidden="true" className="inline-flex">
                {icon}
            </span>
        </button>
    );
}

export interface BurgerButtonProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "aria-label" | "aria-expanded" | "children"
> {
    /** Drives `aria-expanded` and the crossed-bars state. */
    open: boolean;
    /** The id of the menu this button opens. */
    controls?: string;
}

/**
 * Lime square with two bars. The short bar grows to full width on hover or
 * focus, and the bars cross while the menu is open.
 */
export function BurgerButton({
    open,
    controls,
    className,
    type = "button",
    ...props
}: BurgerButtonProps) {
    return (
        <button
            type={type}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={controls}
            className={cn(
                "paddock-press paddock-burger inline-flex size-12 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5",
                "rounded-paddock bg-paddock-lime text-paddock-on-fill",
                className,
            )}
            {...props}
        >
            <span aria-hidden="true" className="h-0.5 w-5 bg-current" />
            <span aria-hidden="true" className="h-0.5 w-5 bg-current" />
        </button>
    );
}
