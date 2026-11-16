"use client";

import { useRef, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";

import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { useShellPanel } from "@/stores/shell-ui-store";
import { cn } from "@/lib/cn";

import type { ShellWorkspace } from "./types";

export interface WorkspaceSwitcherProps {
    workspaces: ShellWorkspace[];
}

/**
 * The pill in the middle of the header: the current workspace's initial on a
 * night disc, its name, and a list of the caller's other workspaces. Renders
 * nothing outside a workspace, or in a public one the caller has not joined.
 */
export function WorkspaceSwitcher({ workspaces }: WorkspaceSwitcherProps) {
    const { workspace: current } = useCurrentWorkspace(workspaces);
    const { open, toggle, close } = useShellPanel("switcher");
    const containerRef = useRef<HTMLDivElement>(null);

    useOutsideClick(containerRef, close, open);

    if (!current) return null;

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape" && open) {
            event.stopPropagation();
            close();
        }
    }

    return (
        <div
            ref={containerRef}
            onKeyDown={handleKeyDown}
            className="relative min-w-0"
        >
            <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-haspopup="true"
                className="paddock-press flex h-12 max-w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-full border-[1.5px] border-paddock-ink bg-transparent pr-4 pl-1.5 font-semibold text-paddock-ink"
            >
                <span
                    aria-hidden="true"
                    className="paddock-night paddock-heavy flex size-9 shrink-0 items-center justify-center rounded-full text-[0.9375rem] text-paddock-lime"
                >
                    {current.name.charAt(0)}
                </span>
                <span className="truncate">{current.name}</span>
                <ChevronDown
                    aria-hidden="true"
                    className={cn(
                        "size-3.5 shrink-0 transition-transform",
                        open && "rotate-180",
                    )}
                    strokeWidth={2.4}
                />
            </button>

            {open ? (
                <div className="paddock-in absolute top-[calc(100%+0.5rem)] left-1/2 z-50 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded-paddock-card border-[1.5px] border-paddock-ink bg-paddock-sheet shadow-paddock-float">
                    <p className="paddock-tag m-0 px-4 pt-3.5 pb-2 text-[0.6875rem] text-paddock-subtle">
                        Your workspaces
                    </p>
                    <ul className="m-0 max-h-64 list-none overflow-y-auto p-0 pb-1.5">
                        {workspaces.map((workspace) => {
                            const isCurrent = workspace.id === current.id;
                            return (
                                <li key={workspace.id}>
                                    <Link
                                        href={`/${workspace.id}`}
                                        onClick={close}
                                        aria-current={
                                            isCurrent ? "page" : undefined
                                        }
                                        className={cn(
                                            "flex items-center justify-between gap-2 px-4 py-2.5 text-[0.9375rem] no-underline transition-colors hover:bg-paddock-ink/6",
                                            isCurrent && "font-bold",
                                        )}
                                    >
                                        <span className="truncate">
                                            {workspace.name}
                                        </span>
                                        {isCurrent ? (
                                            <Check
                                                aria-hidden="true"
                                                className="size-4 shrink-0"
                                                strokeWidth={2.4}
                                            />
                                        ) : null}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <Link
                        href="/dashboard"
                        onClick={close}
                        className="block border-t border-paddock-rule px-4 py-3 text-sm font-semibold no-underline transition-colors hover:bg-paddock-ink/6"
                    >
                        All workspaces
                    </Link>
                </div>
            ) : null}
        </div>
    );
}
