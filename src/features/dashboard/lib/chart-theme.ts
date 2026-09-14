import type { ResolvedTheme } from "@/lib/theme";

/**
 * ECharts needs concrete color strings, so the design tokens are read back out
 * of the cascade at runtime rather than duplicated as hex literals here. The
 * fallbacks only apply before styles resolve (or in a non-DOM environment).
 */
export interface ChartPalette {
    series: string[];
    ink: string;
    subtle: string;
    border: string;
    surface: string;
    success: string;
    warning: string;
    danger: string;
}

/** Mirrors the `@theme` block in globals.css; used only until the cascade resolves. */
const FALLBACKS: Record<ResolvedTheme, ChartPalette> = {
    light: {
        series: ["#2948ff", "#16a34a", "#d97706", "#7c3aed", "#0891b2"],
        ink: "#1a1a1a",
        subtle: "#555555",
        border: "#e8e8e8",
        surface: "#fbfbfb",
        success: "#16a34a",
        warning: "#d97706",
        danger: "#e53e3e",
    },
    dark: {
        series: ["#6c86ff", "#4ade80", "#fbbf24", "#a78bfa", "#22d3ee"],
        ink: "#ededed",
        subtle: "#a3a3a3",
        border: "#2e2e2e",
        surface: "#141414",
        success: "#4ade80",
        warning: "#fbbf24",
        danger: "#ff6b6b",
    },
};

function readToken(
    styles: CSSStyleDeclaration,
    name: string,
    fallback: string,
): string {
    const value = styles.getPropertyValue(name).trim();
    return value.length > 0 ? value : fallback;
}

/**
 * Read the palette for the currently painted theme.
 *
 * `theme` selects the fallback set and makes the theme an explicit input, so a
 * caller memoising on it is declaring a real dependency rather than a hint —
 * the live values still come from the cascade, which the theme attribute drives.
 */
export function readChartPalette(theme: ResolvedTheme = "light"): ChartPalette {
    const fallback = FALLBACKS[theme];

    if (typeof window === "undefined") {
        return fallback;
    }

    const styles = window.getComputedStyle(document.documentElement);

    return {
        series: fallback.series.map((value, index) =>
            readToken(styles, `--color-brand-chart-${index + 1}`, value),
        ),
        ink: readToken(styles, "--color-brand-ink", fallback.ink),
        subtle: readToken(styles, "--color-brand-subtle", fallback.subtle),
        border: readToken(styles, "--color-brand-border", fallback.border),
        surface: readToken(styles, "--color-brand-surface", fallback.surface),
        success: readToken(styles, "--color-brand-success", fallback.success),
        warning: readToken(styles, "--color-brand-warning", fallback.warning),
        danger: readToken(styles, "--color-brand-danger", fallback.danger),
    };
}

/** Shared axis / tooltip styling so every widget reads as one system. */
export function baseChartStyles(palette: ChartPalette) {
    return {
        textStyle: {
            fontFamily: "var(--font-brand-mono), ui-monospace, monospace",
            color: palette.subtle,
            fontSize: 11,
        },
        tooltip: {
            backgroundColor: palette.surface,
            borderColor: palette.ink,
            borderWidth: 2,
            textStyle: { color: palette.ink, fontSize: 12 },
            extraCssText: "border-radius:0;box-shadow:2px 2px 0 #1a1a1a;",
        },
        axisLine: { lineStyle: { color: palette.border } },
        splitLine: {
            lineStyle: { color: palette.border, type: "dashed" as const },
        },
    };
}
