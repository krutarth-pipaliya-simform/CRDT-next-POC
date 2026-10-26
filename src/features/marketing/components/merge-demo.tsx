"use client";

import { useEffect, useState } from "react";

import { CursorFlag } from "@/components/paddock/cursor-flag";
import {
    paddockPresenceTint,
    paddockPresenceVar,
    type PaddockPerson,
} from "@/components/paddock/paddock-presence";
import { DEMO_PEOPLE } from "@/features/marketing/lib/demo-people";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

/**
 * Two people writing into one document at the same time, then the result
 * standing there intact. This is the product's only real claim, so it is the
 * one thing on the page that moves by itself — and it demonstrates rather than
 * asserts.
 */
const AUTHORS: [PaddockPerson, PaddockPerson] = [
    DEMO_PEOPLE.ama,
    DEMO_PEOPLE.ravi,
];

interface DemoLine {
    author: 0 | 1;
    text: string;
    /** Tick at which this line starts typing. Overlapping starts = concurrency. */
    start: number;
    heading?: boolean;
}

/**
 * Lines 0 and 1 type simultaneously, as do 2 and 3. Two carets are live at
 * once, which is the part a static mockup can never show.
 */
const LINES: DemoLine[] = [
    { author: 0, text: "Launch checklist", start: 0, heading: true },
    { author: 1, text: "Draft the release note", start: 4 },
    { author: 0, text: "Book the walkthrough for Thursday", start: 26 },
    { author: 1, text: "Confirm the pricing copy", start: 30 },
];

const TICK_MS = 34;
const HOLD_TICKS = 46;

const TOTAL_TICKS =
    Math.max(...LINES.map((line) => line.start + line.text.length)) +
    HOLD_TICKS;

export function MergeDemo() {
    const [tick, setTick] = useState(0);

    // Read as a subscription rather than a one-off check in an effect: a
    // visitor who turns on "reduce motion" mid-visit gets the settled document
    // immediately, and the server snapshot is a constant so hydration matches.
    const prefersStillness = usePrefersReducedMotion();

    useEffect(() => {
        if (prefersStillness) return;

        const id = window.setInterval(() => {
            setTick((current) => (current >= TOTAL_TICKS ? 0 : current + 1));
        }, TICK_MS);
        return () => window.clearInterval(id);
    }, [prefersStillness]);

    // Stillness shows the finished document rather than a frozen half-sentence.
    const frame = prefersStillness ? TOTAL_TICKS : tick;
    const settled = frame >= TOTAL_TICKS - HOLD_TICKS;

    return (
        <figure className="m-0 overflow-hidden rounded-paddock-card border border-paddock-rule bg-paddock-sheet text-paddock-ink">
            <div className="flex items-center justify-between gap-3 border-b border-paddock-rule px-5 py-3.5 sm:px-6">
                <span className="font-semibold">Launch plan</span>
                <span className="flex items-center gap-3.5 text-[0.8125rem] font-semibold">
                    {AUTHORS.map((author) => (
                        <span
                            key={author.id}
                            className="flex items-center gap-1.5"
                        >
                            <span
                                aria-hidden="true"
                                className="size-2.5 rounded-full"
                                style={{
                                    backgroundColor: paddockPresenceVar(
                                        author.id,
                                    ),
                                }}
                            />
                            {author.name}
                        </span>
                    ))}
                </span>
            </div>

            {/*
                The whole animation is decorative: the finished text is given to
                assistive tech in one piece below, so nobody has to watch it
                being typed to find out what it says.
            */}
            <div
                aria-hidden="true"
                className="flex min-h-[14.5rem] flex-col gap-3.5 px-5 pt-8 pb-6 sm:px-10"
            >
                {LINES.map((line, index) => {
                    const revealed = Math.max(
                        0,
                        Math.min(line.text.length, frame - line.start),
                    );
                    const typing = revealed > 0 && revealed < line.text.length;
                    const author = AUTHORS[line.author];

                    return (
                        <p
                            key={index}
                            className={cn(
                                "m-0 min-h-[1.35em] leading-[1.35]",
                                line.heading
                                    ? "text-[1.625rem] font-bold"
                                    : "text-lg",
                            )}
                        >
                            <span
                                className="rounded-[3px]"
                                style={{
                                    backgroundColor: typing
                                        ? paddockPresenceTint(author.id, 26)
                                        : "transparent",
                                }}
                            >
                                {line.text.slice(0, revealed)}
                            </span>
                            {typing ? (
                                <CursorFlag person={author} blinking />
                            ) : null}
                        </p>
                    );
                })}
            </div>

            <div
                aria-hidden="true"
                className="flex items-center justify-between gap-3 border-t border-paddock-rule bg-paddock-paper px-5 py-3 sm:px-6"
            >
                <span
                    className="text-[0.84375rem] font-semibold transition-opacity duration-300"
                    style={{ opacity: settled ? 1 : 0.7 }}
                >
                    {settled
                        ? "Both edits kept. Nothing to resolve."
                        : "Two people typing…"}
                </span>
                <span className="paddock-mono text-xs text-paddock-subtle">
                    0 conflicts
                </span>
            </div>

            <figcaption className="sr-only">
                A demonstration: Ama and Ravi type into the same document at the
                same time. The finished document reads — Launch checklist. Draft
                the release note. Book the walkthrough for Thursday. Confirm the
                pricing copy. Every edit is kept and nothing is merged by hand.
            </figcaption>
        </figure>
    );
}
