"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { useModalDialog } from "@/hooks/use-modal-dialog";
import { cn } from "@/lib/cn";

import { PaddockIconButton } from "./paddock-button";
import type { CssVariableStyle } from "./paddock-styles";
import { Scribble } from "./scribble";

export interface MenuOverlayItem {
    label: string;
    href: string;
    current?: boolean;
}

export interface MenuOverlayCard {
    title: string;
    /** Real data, set in mono: "edited 9 min ago". */
    meta: string;
}

export interface MenuOverlayProps {
    id?: string;
    open: boolean;
    onClose: () => void;
    items: MenuOverlayItem[];
    /** Recent work drifting behind the menu. Decorative; hidden below `md`. */
    cards?: MenuOverlayCard[];
    footer?: ReactNode;
}

/** Stagger for the rising nav items, matching the mockup's 120ms + 55ms steps. */
function riseStyle(index: number): CssVariableStyle {
    return { "--paddock-rise-delay": `${120 + index * 55}ms` };
}

function DriftColumn({
    cards,
    direction,
    voice,
}: {
    cards: MenuOverlayCard[];
    direction: "up" | "down";
    voice: "heavy" | "serif";
}) {
    const style: CssVariableStyle = {
        "--paddock-drift-duration": direction === "up" ? "26s" : "30s",
    };
    // Doubled so the loop has no seam.
    const loop = [...cards, ...cards];

    return (
        <div
            data-direction={direction}
            style={style}
            className="paddock-drift flex flex-1 flex-col gap-6"
        >
            {loop.map((card, index) => (
                <div
                    key={`${card.title}-${index}`}
                    className="flex h-[14.375rem] flex-none flex-col justify-between rounded bg-paddock-night-card p-5.5"
                >
                    <span
                        className={cn(
                            voice === "heavy"
                                ? "paddock-heavy text-2xl leading-[0.95]"
                                : "paddock-serif text-[2.125rem] leading-[0.9] text-paddock-lime",
                        )}
                    >
                        {card.title}
                    </span>
                    <span className="paddock-mono text-[0.6875rem] text-paddock-night-subtle">
                        {card.meta}
                    </span>
                </div>
            ))}
        </div>
    );
}

/**
 * The full-screen menu. It opens as a circle growing out of the burger's
 * corner; recent documents drift past on the left; the nav items rise in
 * sequence. Hover turns an item lime, and the current page is struck through
 * with a lime squiggle and named with `aria-current`.
 *
 * It is a modal `<dialog>` (via `useModalDialog`), so focus is held inside,
 * Escape closes it, the page behind cannot scroll, and focus returns to the
 * burger. Choosing an item closes the menu.
 */
export function MenuOverlay({
    id,
    open,
    onClose,
    items,
    cards = [],
    footer,
}: MenuOverlayProps) {
    const bindings = useModalDialog(open, onClose);
    const half = Math.ceil(cards.length / 2);

    return (
        <dialog
            {...bindings}
            id={id}
            aria-label="Menu"
            className={cn(
                "paddock-night paddock-menu-reveal fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden p-0",
                "backdrop:bg-transparent open:flex",
            )}
        >
            {cards.length > 0 ? (
                <div
                    aria-hidden="true"
                    className="hidden flex-1 basis-1/2 gap-6 overflow-hidden pl-10 md:flex"
                >
                    <DriftColumn
                        cards={cards.slice(0, half)}
                        direction="up"
                        voice="heavy"
                    />
                    <DriftColumn
                        cards={cards.slice(half).reverse()}
                        direction="down"
                        voice="serif"
                    />
                </div>
            ) : null}
            <div className="relative flex flex-1 basis-1/2 flex-col items-center justify-center gap-9 overflow-y-auto px-4 py-20">
                <PaddockIconButton
                    label="Close menu"
                    icon={<X className="size-5" strokeWidth={2.6} />}
                    variant="primary"
                    surface="night"
                    onClick={onClose}
                    className="absolute top-4 right-6"
                />
                <nav aria-label="Main">
                    <ul className="m-0 flex list-none flex-col items-center p-0">
                        {items.map((item, index) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={
                                        item.current ? "page" : undefined
                                    }
                                    onClick={onClose}
                                    className={cn(
                                        "paddock-heavy relative block overflow-hidden py-0.5 text-[clamp(2.25rem,6vw,3.25rem)] leading-[1.02] no-underline",
                                        "transition-colors hover:text-paddock-lime focus-visible:text-paddock-lime",
                                        item.current
                                            ? "text-paddock-night-muted"
                                            : "text-paddock-night-fg",
                                    )}
                                >
                                    <span
                                        className="paddock-rise"
                                        style={riseStyle(index)}
                                    >
                                        {item.label}
                                    </span>
                                    {item.current ? (
                                        <Scribble
                                            shape="squiggle"
                                            trigger="static"
                                            className="absolute top-[42%] left-0 h-4.5 w-full"
                                        />
                                    ) : null}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                {footer ? (
                    <div className="flex flex-col items-center gap-2.5 text-center">
                        {footer}
                    </div>
                ) : null}
            </div>
        </dialog>
    );
}
