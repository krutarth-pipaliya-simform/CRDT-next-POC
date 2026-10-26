"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

import type { CssVariableStyle } from "./paddock-styles";

export interface MarqueeProps {
    /** Top row, serif in lime, running left. */
    top: string[];
    /** Bottom row, heavy caps, running right. */
    bottom: string[];
    /** Seconds per loop for the top row; the bottom runs slightly slower. */
    durationSeconds?: number;
    className?: string;
}

/**
 * Two rows of display type sliding in opposite directions on a night band.
 *
 * Each row is rendered twice end to end so the loop has no seam; only the
 * first copy is exposed to assistive tech. Motion that runs longer than five
 * seconds needs a way to stop it (WCAG 2.2.2), hence the pause button — which
 * is hidden when the visitor already asked for reduced motion, because then
 * nothing moves.
 */
export function Marquee({
    top,
    bottom,
    durationSeconds = 34,
    className,
}: MarqueeProps) {
    const [paused, setPaused] = useState(false);
    const prefersStillness = usePrefersReducedMotion();

    const rows = [
        {
            items: top,
            direction: "left",
            duration: durationSeconds,
            voice: "serif",
        },
        {
            items: bottom,
            direction: "right",
            duration: durationSeconds + 4,
            voice: "heavy",
        },
    ] as const;

    return (
        <div
            data-paused={paused}
            className={cn(
                "paddock-marquee relative overflow-hidden",
                className,
            )}
        >
            {rows.map((row) => {
                const trackStyle: CssVariableStyle = {
                    "--paddock-marquee-duration": `${row.duration}s`,
                };
                return (
                    <div
                        key={row.direction}
                        data-direction={row.direction}
                        className="paddock-marquee-track"
                        style={trackStyle}
                    >
                        {[0, 1].map((copy) => (
                            <p
                                key={copy}
                                aria-hidden={copy === 1 ? true : undefined}
                                className="m-0 flex shrink-0"
                            >
                                {row.items.map((item) => (
                                    <span
                                        key={item}
                                        className={cn(
                                            "pr-10 whitespace-nowrap",
                                            row.voice === "serif"
                                                ? "paddock-serif text-[clamp(3rem,8vw,6rem)] leading-none text-paddock-lime"
                                                : "paddock-heavy text-[clamp(2.5rem,7vw,5.25rem)] leading-[1.02]",
                                        )}
                                    >
                                        {item}
                                    </span>
                                ))}
                            </p>
                        ))}
                    </div>
                );
            })}
            {prefersStillness ? null : (
                <button
                    type="button"
                    onClick={() => setPaused((current) => !current)}
                    aria-pressed={paused}
                    className="paddock-press absolute right-4 bottom-4 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-paddock-lime px-4 text-sm font-semibold text-paddock-on-fill"
                >
                    {paused ? (
                        <Play aria-hidden="true" className="size-4" />
                    ) : (
                        <Pause aria-hidden="true" className="size-4" />
                    )}
                    {paused ? "Play marquee" : "Pause marquee"}
                </button>
            )}
        </div>
    );
}
