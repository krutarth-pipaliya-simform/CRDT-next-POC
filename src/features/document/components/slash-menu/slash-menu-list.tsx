"use client";

import { useImperativeHandle, useState, type ReactNode, type Ref } from "react";
import type { Editor, Range } from "@tiptap/core";

import { cn } from "@/lib/cn";

export interface CommandItem {
    title: string;
    description: string;
    icon: ReactNode;
    command: (props: { editor: Editor; range: Range }) => void;
}

export interface SlashMenuListProps {
    items: CommandItem[];
    command: (item: CommandItem) => void;
    ref?: Ref<SlashMenuListRef>;
}

export interface SlashMenuListRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

/** A floating sheet, so it is one of the few surfaces that earns a shadow. */
const PANEL =
    "rounded-paddock-card border-[1.5px] border-paddock-ink bg-paddock-sheet text-paddock-ink shadow-paddock-float";

export function SlashMenuList({ items, command, ref }: SlashMenuListProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [prevItems, setPrevItems] = useState(items);

    if (prevItems !== items) {
        setPrevItems(items);
        setSelectedIndex(0);
    }

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === "ArrowUp") {
                setSelectedIndex(
                    (prev) => (prev + items.length - 1) % items.length,
                );
                return true;
            }
            if (event.key === "ArrowDown") {
                setSelectedIndex((prev) => (prev + 1) % items.length);
                return true;
            }
            if (event.key === "Enter") {
                const selected = items[selectedIndex];
                if (selected) {
                    command(selected);
                }
                return true;
            }
            return false;
        },
    }));

    if (items.length === 0) {
        return (
            <div
                className={cn(
                    PANEL,
                    "px-4 py-3 text-[0.8125rem] text-paddock-subtle",
                )}
            >
                No matching commands
            </div>
        );
    }

    return (
        <div
            role="menu"
            aria-label="Slash commands"
            className={cn(
                PANEL,
                "paddock-in no-scrollbar z-50 flex max-h-80 w-72 max-w-[calc(100vw-2rem)] flex-col gap-0.5 overflow-y-auto p-1.5",
            )}
        >
            <p className="paddock-tag m-0 px-2.5 pt-1.5 pb-1 text-[0.6875rem] text-paddock-subtle">
                Insert a block
            </p>
            {items.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                    <button
                        key={item.title}
                        type="button"
                        role="menuitem"
                        onClick={() => command(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                            "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-paddock px-2.5 py-2 text-left transition-colors",
                            isSelected
                                ? "bg-paddock-inverse text-paddock-on-inverse"
                                : "bg-transparent text-paddock-ink hover:bg-paddock-ink/8",
                        )}
                    >
                        <span
                            className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-paddock border",
                                isSelected
                                    ? "border-paddock-on-inverse/30 text-paddock-on-inverse"
                                    : "border-paddock-rule bg-paddock-paper text-paddock-ink",
                            )}
                        >
                            {item.icon}
                        </span>
                        <span className="flex min-w-0 flex-col">
                            <span className="truncate text-[0.8125rem] font-bold">
                                {item.title}
                            </span>
                            <span
                                className={cn(
                                    "truncate text-xs",
                                    isSelected
                                        ? "text-paddock-on-inverse/75"
                                        : "text-paddock-subtle",
                                )}
                            >
                                {item.description}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
