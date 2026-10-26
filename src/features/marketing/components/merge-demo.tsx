"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Two people writing into one document at the same time, then the result
 * standing there intact. This is the product's only real claim, so it is the
 * only thing on the page that moves — and it demonstrates rather than asserts.
 */
const AUTHORS = [
    { name: "Ama", color: "var(--color-brand-presence-6)" },
    { name: "Ravi", color: "var(--color-brand-presence-2)" },
] as const;

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
        <div className="border-2 border-brand-ink bg-brand-surface rounded-brand shadow-brand-card">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-brand-border">
                <span className="text-[13px] font-medium text-brand-ink">
                    Launch plan
                </span>
                <span className="flex items-center gap-2">
                    {AUTHORS.map((author) => (
                        <span
                            key={author.name}
                            className="flex items-center gap-1.5 text-[13px] text-brand-subtle"
                        >
                            <span
                                aria-hidden="true"
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: author.color }}
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
                className="px-5 py-6 min-h-[248px] font-brand-serif space-y-2"
            >
                {LINES.map((line, index) => {
                    const revealed = Math.max(
                        0,
                        Math.min(line.text.length, frame - line.start),
                    );
                    if (revealed === 0) {
                        return (
                            <p
                                key={index}
                                className={line.heading ? "h-9" : "h-7"}
                            />
                        );
                    }

                    const typing = revealed < line.text.length;
                    const author = AUTHORS[line.author];

                    return (
                        <p
                            key={index}
                            className={
                                line.heading
                                    ? "font-brand-sans text-[19px] font-semibold tracking-[-0.015em] text-brand-ink h-9 leading-9"
                                    : "text-[15px] leading-7 text-brand-ink h-7"
                            }
                        >
                            {line.text.slice(0, revealed)}
                            {typing && (
                                <span className="relative inline-block">
                                    <span
                                        className="inline-block w-[2px] h-[1.05em] translate-y-[0.16em] animate-caret"
                                        style={{
                                            backgroundColor: author.color,
                                        }}
                                    />
                                    <span
                                        className="absolute left-[3px] top-[0.1em] px-1 text-[12px] font-brand-sans font-semibold leading-[15px] whitespace-nowrap rounded-brand"
                                        style={{
                                            backgroundColor: author.color,
                                            color: "var(--color-brand-on-fill)",
                                        }}
                                    >
                                        {author.name}
                                    </span>
                                </span>
                            )}
                        </p>
                    );
                })}
            </div>

            <p className="sr-only">
                A demonstration: Ama and Ravi type into the same document at the
                same time. The finished document reads — Launch checklist. Draft
                the release note. Book the walkthrough for Thursday. Confirm the
                pricing copy. Every edit is kept and nothing is merged by hand.
            </p>

            <div className="px-4 py-2.5 border-t border-brand-border">
                <span
                    className="text-[13px] text-brand-subtle transition-opacity duration-300"
                    style={{ opacity: settled ? 1 : 0.35 }}
                >
                    {settled
                        ? "Both edits kept. Nothing to resolve."
                        : "Two people typing…"}
                </span>
            </div>
        </div>
    );
}
