"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { LoaderScreen } from "@/components/paddock/loader-screen";
import { PaddockButton } from "@/components/paddock/paddock-button";
import { Tag } from "@/components/paddock/tag";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * The loader inside a frame instead of over the whole page, with a replay.
 * Replaying remounts it with a new key, which restarts its CSS animations.
 * Sits on a night band, so its controls use the night surface.
 */
export function LoaderDemo() {
    const [run, setRun] = useState(0);
    const prefersStillness = usePrefersReducedMotion();

    return (
        <div className="flex flex-col gap-4">
            <div className="relative h-80 overflow-hidden rounded-paddock-card border border-paddock-rule bg-paddock-sheet">
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                    <Tag>The page underneath</Tag>
                    <p className="m-0 max-w-[28ch] text-paddock-subtle">
                        Already rendered and readable before the curtain lifts.
                    </p>
                </div>
                {run > 0 ? <LoaderScreen key={run} contained /> : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <PaddockButton
                    variant="outline"
                    voice="plain"
                    size="sm"
                    surface="night"
                    onClick={() => setRun((current) => current + 1)}
                    disabled={prefersStillness}
                >
                    <RotateCcw aria-hidden="true" className="size-4" />
                    {run === 0 ? "Play loader" : "Replay loader"}
                </PaddockButton>
                {prefersStillness ? (
                    <p className="m-0 text-sm text-paddock-night-subtle">
                        Your device asks for reduced motion, so the loader is
                        not shown.
                    </p>
                ) : null}
            </div>
        </div>
    );
}
