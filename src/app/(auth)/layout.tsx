import type { ReactNode } from "react";
import Link from "next/link";

export interface AuthLayoutProps {
    children: ReactNode;
}

/**
 * The panel beside the form teaches the product's colour language before
 * anyone signs in: three people, three hues, one document. It is deliberately
 * still — the animated version of this lives on the landing page, and one
 * moving thing per visit is enough.
 */
const SIGNED_IN_PREVIEW = [
    {
        author: "Ama",
        color: "var(--color-brand-presence-6)",
        line: "Launch checklist",
        heading: true,
    },
    {
        author: "Ravi",
        color: "var(--color-brand-presence-2)",
        line: "Draft the release note",
    },
    {
        author: "Jonna",
        color: "var(--color-brand-presence-7)",
        line: "Book the walkthrough for Thursday",
    },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <main className="min-h-screen w-full flex bg-brand-paper">
            <div className="w-full lg:w-[46%] lg:min-w-[30rem] flex flex-col justify-center items-center p-8 sm:p-12 relative bg-brand-surface">
                <div className="absolute top-8 left-8 sm:top-10 sm:left-12">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-semibold tracking-[-0.015em] text-brand-ink"
                    >
                        <span
                            aria-hidden="true"
                            className="relative w-4 h-4 shrink-0"
                        >
                            <span className="absolute left-0 top-0 w-2.5 h-2.5 border-2 border-brand-ink" />
                            <span className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-brand-ink" />
                        </span>
                        Converge
                    </Link>
                </div>
                {children}
            </div>

            <div className="hidden lg:flex flex-1 flex-col justify-center border-l border-brand-border p-12 xl:p-16">
                <div className="max-w-xl">
                    <h2 className="text-[34px] xl:text-[40px] font-semibold tracking-[-0.028em] leading-[1.1] text-brand-ink text-balance">
                        Three people, one document, no conflicts.
                    </h2>

                    <div className="mt-8 border border-brand-border bg-brand-surface rounded-brand">
                        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-brand-border">
                            {SIGNED_IN_PREVIEW.map((row) => (
                                <span
                                    key={row.author}
                                    className="flex items-center gap-1.5 text-[13px] text-brand-subtle"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: row.color }}
                                    />
                                    {row.author}
                                </span>
                            ))}
                        </div>

                        <div className="px-5 py-5 font-brand-serif space-y-2.5">
                            {SIGNED_IN_PREVIEW.map((row) => (
                                <p
                                    key={row.line}
                                    className={
                                        row.heading
                                            ? "font-brand-sans text-[19px] font-semibold tracking-[-0.015em] text-brand-ink"
                                            : "text-[15px] leading-7 text-brand-ink"
                                    }
                                >
                                    {row.line}
                                    <span
                                        aria-hidden="true"
                                        className="inline-block w-[2px] h-[1.05em] ml-[1px] translate-y-[0.16em]"
                                        style={{ backgroundColor: row.color }}
                                    />
                                </p>
                            ))}
                        </div>
                    </div>

                    <p className="mt-6 text-[15px] leading-relaxed text-brand-subtle max-w-[48ch]">
                        Everyone keeps their own colour — on their cursor, their
                        messages and the cards assigned to them — so you always
                        know who did what.
                    </p>
                </div>
            </div>
        </main>
    );
}
