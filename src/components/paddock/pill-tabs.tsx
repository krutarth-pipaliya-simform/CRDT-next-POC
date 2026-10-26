"use client";

import { useRef, type KeyboardEvent } from "react";

import { cn } from "@/lib/cn";

export interface PillTab<TValue extends string> {
    value: TValue;
    label: string;
    /** A real count, set in mono. */
    count?: number;
}

export interface PillTabsProps<TValue extends string> {
    items: PillTab<TValue>[];
    value: TValue;
    onChange: (value: TValue) => void;
    /** Names the tab list, e.g. "Workspace lists". */
    label: string;
    /** Prefix for tab and panel ids; see `pillTabIds`. */
    idBase: string;
    className?: string;
}

/** The ids a tab and its panel share, so the panel can point back at its tab. */
export function pillTabIds(idBase: string, value: string) {
    return {
        tabId: `${idBase}-tab-${value}`,
        panelId: `${idBase}-panel-${value}`,
    };
}

/**
 * A segmented switch on a night track; the selected segment is a lime fill.
 *
 * Follows the WAI-ARIA tabs pattern with automatic activation: one tab stop,
 * arrow keys move and select, Home and End jump to the ends. Render the panel
 * yourself with `role="tabpanel"`, `id={panelId}` and
 * `aria-labelledby={tabId}` from `pillTabIds`.
 */
export function PillTabs<TValue extends string>({
    items,
    value,
    onChange,
    label,
    idBase,
    className,
}: PillTabsProps<TValue>) {
    const tabRefs = useRef<Map<TValue, HTMLButtonElement>>(new Map());

    function select(index: number) {
        const item = items.at(index % items.length);
        if (!item) return;
        onChange(item.value);
        tabRefs.current.get(item.value)?.focus();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const current = items.findIndex((item) => item.value === value);
        const last = items.length - 1;
        const next: Record<string, number> = {
            ArrowRight: current + 1,
            ArrowLeft: current - 1 + items.length,
            Home: 0,
            End: last,
        };
        const target = next[event.key];
        if (target === undefined) return;
        event.preventDefault();
        select(target);
    }

    return (
        <div
            role="tablist"
            aria-label={label}
            onKeyDown={handleKeyDown}
            className={cn(
                "paddock-night inline-flex max-w-full flex-wrap gap-1 rounded-full p-[5px]",
                className,
            )}
        >
            {items.map((item) => {
                const selected = item.value === value;
                const { tabId, panelId } = pillTabIds(idBase, item.value);
                return (
                    <button
                        key={item.value}
                        ref={(node) => {
                            if (node) tabRefs.current.set(item.value, node);
                            else tabRefs.current.delete(item.value);
                        }}
                        id={tabId}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={panelId}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onChange(item.value)}
                        className={cn(
                            "paddock-press inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-5 text-[0.90625rem] font-semibold",
                            selected
                                ? "bg-paddock-lime text-paddock-on-fill"
                                : "bg-transparent text-paddock-night-fg hover:bg-paddock-night-fg/10",
                        )}
                    >
                        {item.label}
                        {item.count !== undefined ? (
                            <span className="paddock-mono text-xs font-normal">
                                {item.count}
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}
