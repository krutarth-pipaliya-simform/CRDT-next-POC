import type { ResolvedTheme } from "@/lib/theme";

/**
 * ECharts needs concrete color strings, so the Paddock chart tokens are read
 * back out of the cascade at runtime rather than duplicated as hex literals
 * here. The fallbacks only apply before styles resolve (or in a non-DOM
 * environment).
 *
 * Every chart sits on the night band, which stays dark in both themes, so the
 * palette is "on night" in both. Counts are not people: the series use lime,
 * paper and neutrals, never a presence hue.
 */
export interface ChartPalette {
    /** Lime: the series that matters most (created, done, progress). */
    accent: string;
    /** Paper: the second series, and chart text. */
    strong: string;
    /** Axis labels and the quietest series. */
    muted: string;
    /** A fourth series that should recede further than `muted`. */
    faint: string;
    /** Work still open, beside completed work. */
    open: string;
    warning: string;
    danger: string;
    /** The empty part of a gauge. */
    track: string;
    /** Grid and axis lines. */
    rule: string;
    /** The card the chart sits on: slice gaps and the tooltip. */
    surface: string;
    fontSans: string;
    fontMono: string;
}

type ChartColorKey = Exclude<keyof ChartPalette, "fontSans" | "fontMono">;

/** Mirrors the Paddock chart tokens in globals.css; used only until the cascade resolves. */
const FALLBACKS: Record<ResolvedTheme, ChartPalette> = {
    light: {
        accent: "#d2ff00",
        strong: "#f4f4ed",
        muted: "#a8ad98",
        faint: "#8a9078",
        open: "#7b7e73",
        warning: "#baa56f",
        danger: "#ff8c7a",
        track: "#5b6150",
        rule: "rgba(244, 244, 237, 0.14)",
        surface: "#3a3f31",
        fontSans: "ui-sans-serif, system-ui, sans-serif",
        fontMono: "ui-monospace, monospace",
    },
    dark: {
        accent: "#d2ff00",
        strong: "#f4f4ed",
        muted: "#a8ad98",
        faint: "#8a9078",
        open: "#75786e",
        warning: "#e3b44c",
        danger: "#ff8c7a",
        track: "#474d3d",
        rule: "rgba(244, 244, 237, 0.14)",
        surface: "#30352a",
        fontSans: "ui-sans-serif, system-ui, sans-serif",
        fontMono: "ui-monospace, monospace",
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
 *
 * Styles are read from `.paddock-root` because that is where the Paddock font
 * variables are attached; the colour tokens on `:root` inherit down to it.
 */
export function readChartPalette(theme: ResolvedTheme = "light"): ChartPalette {
    const fallback = FALLBACKS[theme];

    if (typeof window === "undefined") {
        return fallback;
    }

    const root =
        document.querySelector(".paddock-root") ?? document.documentElement;
    const styles = window.getComputedStyle(root);
    const color = (name: ChartColorKey) =>
        readToken(styles, `--color-paddock-chart-${name}`, fallback[name]);
    // A next/font variable holds the family plus its metric fallback; the
    // generic stack goes after it in case the variable is not there yet.
    const font = (variable: string, generic: string) => {
        const family = styles.getPropertyValue(variable).trim();
        return family ? `${family}, ${generic}` : generic;
    };

    return {
        accent: color("accent"),
        strong: color("strong"),
        muted: color("muted"),
        faint: color("faint"),
        open: color("open"),
        warning: color("warning"),
        danger: color("danger"),
        track: color("track"),
        rule: color("rule"),
        surface: color("surface"),
        fontSans: font("--font-mona-sans", fallback.fontSans),
        fontMono: font("--font-geist-mono", fallback.fontMono),
    };
}

/** Shared axis, legend and tooltip styling so every widget reads as one system. */
export function baseChartStyles(palette: ChartPalette) {
    return {
        textStyle: {
            fontFamily: palette.fontSans,
            color: palette.muted,
            fontSize: 12,
        },
        tooltip: {
            backgroundColor: palette.surface,
            borderColor: palette.track,
            borderWidth: 1,
            textStyle: {
                color: palette.strong,
                fontFamily: palette.fontSans,
                fontSize: 13,
            },
            extraCssText: "border-radius:8px;box-shadow:none;",
        },
        legend: {
            bottom: 0,
            icon: "roundRect",
            itemWidth: 12,
            itemHeight: 12,
            itemGap: 16,
            textStyle: {
                color: palette.muted,
                fontFamily: palette.fontSans,
                fontSize: 12,
            },
        },
        axisLabel: {
            color: palette.muted,
            fontFamily: palette.fontMono,
            fontSize: 11,
        },
        axisLine: { lineStyle: { color: palette.rule } },
        splitLine: { lineStyle: { color: palette.rule } },
    };
}
