import { cn } from "@/lib/cn";

export interface WordRevealSegment {
    text: string;
    /** Emphasised words switch to the serif voice (lime on night grounds). */
    emphasis?: boolean;
}

export interface WordRevealProps {
    segments: WordRevealSegment[];
    surface?: "paper" | "night";
    className?: string;
}

/**
 * A statement whose words brighten as they scroll into view.
 *
 * Progressive enhancement, entirely in CSS: only browsers with scroll-driven
 * animations (`animation-timeline: view()`) and no reduced-motion preference
 * start the words faint. Everyone else gets the finished, fully legible
 * sentence. It is one `<p>`, so it reads as one sentence.
 */
export function WordReveal({
    segments,
    surface = "night",
    className,
}: WordRevealProps) {
    const words = segments.flatMap((segment, segmentIndex) =>
        segment.text
            .split(/\s+/)
            .filter(Boolean)
            .map((word, wordIndex) => ({
                key: `${segmentIndex}-${wordIndex}`,
                word,
                emphasis: segment.emphasis === true,
            })),
    );

    return (
        <p className={cn("m-0 leading-[0.98] break-words", className)}>
            {words.map(({ key, word, emphasis }) => (
                <span
                    key={key}
                    className={cn(
                        "paddock-word",
                        emphasis
                            ? cn(
                                  "paddock-serif text-[clamp(2.25rem,6vw,4.75rem)]",
                                  surface === "night"
                                      ? "text-paddock-lime"
                                      : "text-paddock-ink",
                              )
                            : cn(
                                  "paddock-heavy text-[clamp(1.75rem,4.8vw,3.75rem)]",
                                  surface === "night"
                                      ? "text-paddock-night-fg"
                                      : "text-paddock-ink",
                              ),
                    )}
                >
                    {word}{" "}
                </span>
            ))}
        </p>
    );
}
