import type { Metadata } from "next";
import { Geist_Mono, Newsreader, Schibsted_Grotesk } from "next/font/google";

import { PaddockRoot } from "@/components/paddock/paddock-root";
import { AppToaster } from "@/components/theme/app-toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

import "./globals.css";

/**
 * Product chrome. A grotesque with enough character to carry the brand at
 * display sizes and enough discipline to stay quiet in dense UI.
 */
const schibstedGrotesk = Schibsted_Grotesk({
    variable: "--font-schibsted-grotesk",
    subsets: ["latin"],
    display: "swap",
});

/**
 * The document canvas, and the demo of one on the landing page. `preload` is
 * off because most routes draw no prose — the face is fetched on the two
 * surfaces that actually set text in it, not on every page in the product.
 */
const newsreader = Newsreader({
    variable: "--font-newsreader",
    subsets: ["latin"],
    display: "swap",
    preload: false,
});

/**
 * Real data only — timestamps, ids, latency readouts, tabular figures. Never
 * labels or buttons; those are set in the grotesque like everything else.
 */
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Converge — everyone types at once",
        template: "%s · Converge",
    },
    description:
        "Documents, boards and chat that merge every keystroke, so no one has to resolve a conflict by hand.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            data-theme="light"
            suppressHydrationWarning
            className={`${schibstedGrotesk.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`}
        >
            <head>
                {/* Runs while the HTML is parsed, before the first paint, so a
                    dark-mode visitor never sees a flash of the light default. */}
                <script
                    dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
                />
            </head>
            <body className="min-h-full flex flex-col max-w-full overflow-x-hidden">
                <ThemeProvider>
                    {/* Paddock is the product's design language: every route
                        renders inside its scope, fonts and tokens. */}
                    <PaddockRoot className="flex-1 flex flex-col w-full max-w-full min-w-0">
                        {children}
                        <AppToaster />
                    </PaddockRoot>
                </ThemeProvider>
            </body>
        </html>
    );
}
