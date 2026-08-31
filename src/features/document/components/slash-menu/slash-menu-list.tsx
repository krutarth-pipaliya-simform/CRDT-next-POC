"use client";

import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
    type ReactNode,
} from "react";
import type { Editor, Range } from "@tiptap/core";

export interface CommandItem {
    title: string;
    description: string;
    icon: ReactNode;
    command: (props: { editor: Editor; range: Range }) => void;
}

export interface SlashMenuListProps {
    items: CommandItem[];
    command: (item: CommandItem) => void;
}

export interface SlashMenuListRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashMenuList = forwardRef<SlashMenuListRef, SlashMenuListProps>(
    function SlashMenuList({ items, command }, ref) {
        const [selectedIndex, setSelectedIndex] = useState(0);

        useEffect(() => {
            setSelectedIndex(0);
        }, [items]);

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
                <div className="p-3 bg-brand-surface border-2 border-brand-ink text-brand-subtle text-xs font-brand-mono rounded-brand shadow-brand-card">
                    No matching commands
                </div>
            );
        }

        return (
            <div
                role="menu"
                aria-label="Slash commands"
                className="w-72 max-h-80 overflow-y-auto p-1.5 bg-brand-surface border-2 border-brand-ink rounded-brand shadow-brand-card z-50 flex flex-col gap-0.5 no-scrollbar"
            >
                <div className="px-2 py-1 text-[10px] font-brand-mono font-bold uppercase tracking-wider text-brand-subtle">
                    Insert Block
                </div>
                {items.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <button
                            key={item.title}
                            type="button"
                            role="menuitem"
                            onClick={() => command(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`flex items-center gap-2.5 px-2.5 py-2 w-full text-left rounded-brand transition-colors ${
                                isSelected
                                    ? "bg-brand-ink text-brand-surface"
                                    : "bg-transparent text-brand-ink hover:bg-brand-muted"
                            }`}
                        >
                            <div
                                className={`p-1 rounded-brand border ${
                                    isSelected
                                        ? "border-brand-surface/40 bg-brand-surface/10 text-brand-surface"
                                        : "border-brand-border bg-brand-muted text-brand-ink"
                                }`}
                            >
                                {item.icon}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold font-brand-mono truncate">
                                    {item.title}
                                </span>
                                <span
                                    className={`text-[10px] truncate ${
                                        isSelected
                                            ? "text-brand-surface/70"
                                            : "text-brand-subtle"
                                    }`}
                                >
                                    {item.description}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    },
);
