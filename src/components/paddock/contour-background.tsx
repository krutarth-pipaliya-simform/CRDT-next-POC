import { cn } from "@/lib/cn";

export type ContourPattern = "hero" | "band" | "panel";

export interface ContourBackgroundProps {
    pattern?: ContourPattern;
    /** Night grounds draw the lines in a faint lime instead of ink. */
    surface?: "paper" | "night";
    className?: string;
}

/**
 * Faint contour-map lines, lifted from the mockups. Each pattern is two or
 * three drifting isolines plus a closed "summit" loop. Stretched to fill, so
 * the parent decides the size; `overflow-hidden` on the parent is expected.
 */
const PATTERNS: Record<ContourPattern, { viewBox: string; paths: string[] }> = {
    hero: {
        viewBox: "0 0 1280 400",
        paths: [
            "M-40 90C180 10 360 170 560 100S900-10 1120 80 1320 170 1340 150",
            "M-40 150C200 70 380 230 580 160S920 50 1130 140 1320 230 1340 210",
            "M960 220C1040 170 1160 190 1150 270S1040 360 980 330 900 260 960 220Z",
            "M920 220C1000 130 1200 150 1190 280S1040 400 960 370 860 280 920 220Z",
        ],
    },
    band: {
        viewBox: "0 0 1280 860",
        paths: [
            "M-40 140C180 60 360 220 560 150S900 40 1120 130 1320 220 1340 200",
            "M-40 520C160 600 420 460 640 540S980 660 1180 560 1320 520 1340 540",
            "M-40 580C170 660 430 520 650 600S990 720 1190 620 1320 580 1340 600",
            "M140 330C210 220 420 230 450 345S350 500 240 480 90 420 140 330Z",
            "M960 330C1040 280 1160 300 1150 380S1040 470 980 440 900 370 960 330Z",
        ],
    },
    panel: {
        viewBox: "0 0 1200 300",
        paths: [
            "M-40 60C180 0 360 140 560 80S900-20 1120 60 1240 120 1260 110",
            "M-40 240C160 300 420 180 640 250S980 320 1180 240",
            "M900 120C980 80 1100 100 1090 170S990 240 930 220 860 150 900 120Z",
        ],
    },
};

export function ContourBackground({
    pattern = "hero",
    surface = "paper",
    className,
}: ContourBackgroundProps) {
    const { viewBox, paths } = PATTERNS[pattern];

    return (
        <svg
            viewBox={viewBox}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
            className={cn(
                "pointer-events-none absolute inset-0 size-full",
                className,
            )}
        >
            <g
                strokeWidth={1.2}
                className={cn(
                    "fill-none",
                    surface === "night"
                        ? "stroke-paddock-night-contour"
                        : "stroke-paddock-contour",
                )}
            >
                {paths.map((d) => (
                    <path key={d} d={d} />
                ))}
            </g>
        </svg>
    );
}
