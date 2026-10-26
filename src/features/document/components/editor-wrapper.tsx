"use client";

import dynamic from "next/dynamic";

export const CollaborativeEditor = dynamic(
    () => import("./editor").then((m) => m.CollaborativeEditor),
    {
        ssr: false,
        loading: () => (
            <p className="paddock-tag m-0 px-4 py-16 text-center text-[0.6875rem] text-paddock-subtle">
                Loading the editor…
            </p>
        ),
    },
);
