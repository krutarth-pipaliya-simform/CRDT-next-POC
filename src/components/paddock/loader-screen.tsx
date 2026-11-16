import { cn } from "@/lib/cn";

import { Wordmark } from "./wordmark";

export interface LoaderScreenProps {
    caption?: string;
    /** `contained` fills the nearest positioned parent instead of the viewport. */
    contained?: boolean;
    className?: string;
}

/**
 * The first-load curtain: wordmark, a lime bar that fills, a mono caption,
 * then the whole screen lifts away at 1.3s. Purely decorative — the page
 * underneath is already rendered and readable, so it is hidden from
 * assistive tech, and it is not drawn at all under reduced motion.
 */
export function LoaderScreen({
    caption = "merging every keystroke",
    contained = false,
    className,
}: LoaderScreenProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "paddock-loader paddock-night z-60 flex flex-col items-center justify-center gap-5.5",
                contained ? "absolute inset-0" : "fixed inset-0",
                className,
            )}
        >
            <Wordmark size="lg" surface="night" align="center" />
            <div className="h-[3px] w-55 overflow-hidden bg-paddock-track">
                <div className="paddock-loader-bar h-full bg-paddock-lime" />
            </div>
            <p className="paddock-mono m-0 text-xs text-paddock-night-subtle">
                {caption}
            </p>
        </div>
    );
}
