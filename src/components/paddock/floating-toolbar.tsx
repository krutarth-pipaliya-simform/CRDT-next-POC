"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface FloatingToolbarItem {
    id: string;
    /** Accessible name — every tool is icon-only. */
    label: string;
    icon: ReactNode;
    pressed?: boolean;
    disabled?: boolean;
}

export interface FloatingToolbarProps {
    /** Groups are separated by a hairline. */
    groups: FloatingToolbarItem[][];
    onToggle: (id: string) => void;
    /** Names the toolbar, e.g. "Formatting". */
    label: string;
    className?: string;
}

/**
 * The night pill that floats over the editor. Active formats are lime fills.
 *
 * WAI-ARIA toolbar pattern: the whole toolbar is one tab stop; arrow keys
 * move between tools, Home and End jump to the ends, and disabled tools stay
 * reachable (announced as unavailable) rather than vanishing from the order.
 */
export function FloatingToolbar({
    groups,
    onToggle,
    label,
    className,
}: FloatingToolbarProps) {
    const items = groups.flat();
    const [focusIndex, setFocusIndex] = useState(0);
    const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

    function moveTo(index: number) {
        const wrapped = (index + items.length) % items.length;
        setFocusIndex(wrapped);
        buttonRefs.current[wrapped]?.focus();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const targets: Record<string, number> = {
            ArrowRight: focusIndex + 1,
            ArrowLeft: focusIndex - 1,
            Home: 0,
            End: items.length - 1,
        };
        const target = targets[event.key];
        if (target === undefined) return;
        event.preventDefault();
        moveTo(target);
    }

    // Where each group starts in the flat order, so every tool knows its index.
    const groupStarts = groups.map((_, groupIndex) =>
        groups
            .slice(0, groupIndex)
            .reduce((total, group) => total + group.length, 0),
    );

    return (
        <div
            role="toolbar"
            aria-label={label}
            onKeyDown={handleKeyDown}
            className={cn(
                "paddock-night mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-0.5 rounded-[28px] p-1.5",
                className,
            )}
        >
            {groups.map((group, groupIndex) => (
                <div
                    key={group.map((item) => item.id).join("-")}
                    className="flex items-center gap-0.5"
                >
                    {groupIndex > 0 ? (
                        <span
                            aria-hidden="true"
                            className="mx-1 h-5 w-px bg-paddock-night-rule"
                        />
                    ) : null}
                    {group.map((item, itemIndex) => {
                        const index =
                            (groupStarts[groupIndex] ?? 0) + itemIndex;
                        return (
                            <button
                                key={item.id}
                                ref={(node) => {
                                    buttonRefs.current[index] = node;
                                }}
                                type="button"
                                aria-label={item.label}
                                aria-pressed={item.pressed ?? false}
                                aria-disabled={item.disabled ? true : undefined}
                                tabIndex={index === focusIndex ? 0 : -1}
                                onFocus={() => setFocusIndex(index)}
                                onClick={() => {
                                    if (!item.disabled) onToggle(item.id);
                                }}
                                className={cn(
                                    "flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors",
                                    item.pressed
                                        ? "bg-paddock-lime text-paddock-on-fill"
                                        : "bg-transparent text-paddock-night-fg hover:bg-paddock-night-fg/14",
                                    item.disabled &&
                                        "cursor-not-allowed opacity-35",
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className="inline-flex"
                                >
                                    {item.icon}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
