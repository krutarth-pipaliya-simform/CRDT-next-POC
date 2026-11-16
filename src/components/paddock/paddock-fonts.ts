import { Instrument_Serif, Mona_Sans } from "next/font/google";

/**
 * Paddock's two display voices. Loaded here, not in the root layout, so the
 * files are only requested by routes that render `<PaddockRoot>` and the
 * current product's typography is untouched. Geist Mono is already provided
 * by the root layout and is reused through `--font-geist-mono`.
 */

/** Body and the heavy, wide caps. The `wdth` axis is what makes 112% possible. */
const monaSans = Mona_Sans({
    variable: "--font-mona-sans",
    subsets: ["latin"],
    axes: ["wdth"],
    display: "swap",
});

/** The serif half of every two-voice heading. Ships in a single weight. */
const instrumentSerif = Instrument_Serif({
    variable: "--font-instrument-serif",
    weight: "400",
    subsets: ["latin"],
    display: "swap",
});

export const paddockFontVariables = `${monaSans.variable} ${instrumentSerif.variable}`;
