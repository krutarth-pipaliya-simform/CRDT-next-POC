"use client";

import dynamic from "next/dynamic";

export const CollaborativeEditor = dynamic(
    () => import("./editor").then((m) => m.CollaborativeEditor),
    {
        ssr: false,
        loading: () => (
            <div className="p-8 text-center text-brand-ink/60 animate-pulse font-brand-mono uppercase tracking-widest text-sm">
                Loading Editor...
            </div>
        ),
    },
);
