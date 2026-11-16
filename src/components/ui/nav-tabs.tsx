"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

export interface NavTabItem {
    /**
     * Display label for the tab (text or ReactNode)
     */
    label: ReactNode;
    /**
     * Target URL when the tab operates as a link
     */
    href?: string;
    /**
     * Unique identifier/value for the tab (used when controlled via activeValue or onTabChange)
     */
    value?: string;
    /**
     * If true, requires exact pathname match. If false or undefined, matches exact or as subpath prefix.
     */
    exact?: boolean;
    /**
     * Optional badge or count indicator displayed alongside the label
     */
    badge?: ReactNode;
    /**
     * Optional icon displayed before the label
     */
    icon?: ReactNode;
    /**
     * Optional click handler for the tab
     */
    onClick?: (event: MouseEvent) => void;
    /**
     * Explicit override for active state
     */
    active?: boolean;
    /**
     * Disabled state
     */
    disabled?: boolean;
}

export interface NavTabsProps {
    /**
     * Array of navigation tab items
     */
    items: NavTabItem[];
    /**
     * Explicitly specify the active value (e.g. for query parameter or state-driven tabs).
     * If omitted, active state is automatically computed from usePathname() comparing against item.href.
     */
    activeValue?: string;
    /**
     * Optional callback fired when a tab is clicked
     */
    onTabChange?: (value: string, item: NavTabItem) => void;
    /**
     * Accessible label for the navigation landmark
     */
    ariaLabel?: string;
    /**
     * If true, enables horizontal scrolling on overflow with hidden scrollbars
     * @default true
     */
    scrollable?: boolean;
    /**
     * Additional CSS classes for the nav container
     */
    className?: string;
    /**
     * Additional CSS classes applied to each tab item link/button
     */
    itemClassName?: string;
    /**
     * Visual size variant
     * @default "md"
     */
    size?: "sm" | "md";
}

export function NavTabs({
    items,
    activeValue,
    onTabChange,
    ariaLabel = "Navigation tabs",
    scrollable = true,
    className,
    itemClassName,
    size = "md",
}: NavTabsProps) {
    const pathname = usePathname();

    const isItemActive = (item: NavTabItem) => {
        if (typeof item.active === "boolean") {
            return item.active;
        }
        if (activeValue !== undefined) {
            return (item.value ?? item.href) === activeValue;
        }
        if (item.href && pathname) {
            if (item.exact) {
                return pathname === item.href;
            }
            return (
                pathname === item.href || pathname.startsWith(`${item.href}/`)
            );
        }
        return false;
    };

    // Sentence case in the product grotesque. Tabs are navigation, not data,
    // so they are set like the rest of the interface rather than in mono caps.
    const baseItemClasses = cn(
        "transition-colors border-b-2 flex items-center gap-2 -mb-px rounded-none",
        size === "sm" ? "px-2.5 py-2 text-[13px]" : "px-3 py-2.5 text-sm",
        scrollable ? "whitespace-nowrap shrink-0" : "",
    );

    // Ink marks the current tab. Blue is reserved for focus, so a tab you have
    // navigated to and a tab your keyboard is on stay tellable apart.
    const activeClasses = "border-brand-ink text-brand-ink font-semibold";
    const inactiveClasses =
        "border-transparent text-brand-subtle hover:text-brand-ink hover:border-brand-line";
    const disabledClasses =
        "opacity-40 cursor-not-allowed pointer-events-none text-brand-subtle border-transparent";

    return (
        <nav
            aria-label={ariaLabel}
            className={cn(
                "flex items-center border-b border-brand-border",
                scrollable
                    ? "overflow-x-auto overflow-y-hidden no-scrollbar gap-1"
                    : "gap-2",
                className,
            )}
        >
            {items.map((item, index) => {
                const active = isItemActive(item);
                const key = item.value ?? item.href ?? `tab-${index}`;

                if (item.href && !item.disabled) {
                    return (
                        <Link
                            key={key}
                            href={item.href}
                            onClick={item.onClick}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                                baseItemClasses,
                                active ? activeClasses : inactiveClasses,
                                itemClassName,
                            )}
                        >
                            {item.icon && (
                                <span className="shrink-0">{item.icon}</span>
                            )}
                            <span>{item.label}</span>
                            {item.badge && (
                                <span className="shrink-0">{item.badge}</span>
                            )}
                        </Link>
                    );
                }

                return (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        disabled={item.disabled}
                        onClick={(e) => {
                            item.onClick?.(e);
                            if (item.value) onTabChange?.(item.value, item);
                        }}
                        className={cn(
                            baseItemClasses,
                            "cursor-pointer",
                            item.disabled
                                ? disabledClasses
                                : active
                                  ? activeClasses
                                  : inactiveClasses,
                            itemClassName,
                        )}
                    >
                        {item.icon && (
                            <span className="shrink-0">{item.icon}</span>
                        )}
                        <span>{item.label}</span>
                        {item.badge && (
                            <span className="shrink-0">{item.badge}</span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
