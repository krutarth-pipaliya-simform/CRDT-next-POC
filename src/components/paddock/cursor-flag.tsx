import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import {
    paddockCaretVar,
    paddockPresenceTint,
    paddockPresenceVar,
    type PaddockPerson,
} from "./paddock-presence";

export interface CursorFlagProps {
    person: PaddockPerson;
    /** Blink the caret, as while someone is actively typing. */
    blinking?: boolean;
    className?: string;
}

/**
 * A collaborator's caret with their name flag. The flag is visual only; a
 * screen reader hears "(Maya is here)" once, instead of a stray name dropped
 * into the middle of the sentence.
 */
export function CursorFlag({
    person,
    blinking = false,
    className,
}: CursorFlagProps) {
    return (
        <span
            className={cn(
                "relative mx-px inline-block h-[1.2em] w-0.5 align-[-0.22em]",
                blinking && "animate-caret",
                className,
            )}
            style={{ backgroundColor: paddockCaretVar(person.id) }}
        >
            <span className="sr-only"> ({person.name} is here) </span>
            <span
                aria-hidden="true"
                className="paddock-tag absolute bottom-[calc(100%+3px)] -left-px rounded px-2 py-[3px] text-[0.625rem] whitespace-nowrap text-paddock-on-fill"
                style={{ backgroundColor: paddockPresenceVar(person.id) }}
            >
                {person.name}
            </span>
        </span>
    );
}

export interface CollaboratorHighlightProps {
    person: PaddockPerson;
    children: ReactNode;
    /** Wash strength; 32% is the editor default, 50% for a floating card. */
    strength?: number;
    className?: string;
}

/** Text someone else is touching, washed in their colour. Ink stays legible on it. */
export function CollaboratorHighlight({
    person,
    children,
    strength = 32,
    className,
}: CollaboratorHighlightProps) {
    return (
        <mark
            className={cn("rounded-[3px] text-inherit", className)}
            style={{
                backgroundColor: paddockPresenceTint(person.id, strength),
            }}
        >
            {children}
        </mark>
    );
}
