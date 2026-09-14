import { SiteHeader } from "@/components/layout/site-header";
import { LinkButton } from "@/components/ui/link-button";
import { auth } from "@/features/auth/lib/auth";
import { MergeDemo } from "@/features/marketing/components/merge-demo";

/**
 * What actually converges. Written as situations a team recognises rather than
 * as capabilities, because "real-time collaboration" is what every one of these
 * products says and none of them mean anything by.
 */
const CONVERGENCES = [
    {
        surface: "Documents",
        situation: "Two people rewrite the same paragraph.",
        outcome:
            "Both rewrites survive, in order, with each author's cursor visible the whole time.",
        slot: "var(--color-brand-presence-6)",
    },
    {
        surface: "Boards",
        situation: "Someone drags a card while you are dragging it.",
        outcome: "The card lands once. No phantom duplicate, no snap-back.",
        slot: "var(--color-brand-presence-3)",
    },
    {
        surface: "Chat",
        situation: "You write three messages on a train with no signal.",
        outcome: "They arrive when you do, in the order you wrote them.",
        slot: "var(--color-brand-presence-7)",
    },
];

export default async function LandingPage() {
    const session = await auth();

    return (
        <div className="flex flex-col min-h-screen bg-brand-paper">
            <SiteHeader />

            <main className="flex-1 w-full">
                {/* Hero — left-aligned, with the demo carrying the right half.
                    A centred headline over a gradient would say nothing that
                    watching the thing work does not say better. */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
                    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center">
                        <div className="min-w-0">
                            <h1 className="text-[40px] sm:text-[52px] lg:text-[60px] font-semibold tracking-[-0.032em] leading-[1.02] text-brand-ink text-balance">
                                Everyone types at once.
                                <br />
                                Nothing gets lost.
                            </h1>

                            <p className="mt-6 text-[17px] sm:text-[19px] leading-[1.6] text-brand-subtle max-w-[52ch]">
                                Documents, boards and chat that merge every
                                keystroke as it happens. No locks, no
                                &ldquo;someone else is editing&rdquo;, and
                                nothing for you to resolve by hand.
                            </p>

                            <div className="mt-9 flex flex-wrap items-center gap-3">
                                {session?.user ? (
                                    <LinkButton
                                        href="/dashboard"
                                        variant="primary"
                                        size="lg"
                                    >
                                        Open your workspace
                                    </LinkButton>
                                ) : (
                                    <>
                                        <LinkButton
                                            href="/register"
                                            variant="primary"
                                            size="lg"
                                        >
                                            Start writing
                                        </LinkButton>
                                        <LinkButton
                                            href="/login"
                                            variant="secondary"
                                            size="lg"
                                        >
                                            Log in
                                        </LinkButton>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="min-w-0">
                            <MergeDemo />
                        </div>
                    </div>
                </section>

                {/* What converges */}
                <section className="border-t border-brand-border bg-brand-surface">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
                        <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.022em] text-brand-ink max-w-[24ch]">
                            The cases that usually cost you an afternoon
                        </h2>

                        <ul className="mt-10 grid gap-px bg-brand-border sm:grid-cols-3 border border-brand-border">
                            {CONVERGENCES.map((item) => (
                                <li
                                    key={item.surface}
                                    className="bg-brand-surface p-6 flex gap-4"
                                >
                                    {/* The rail again: here it stands for the
                                        person on the other end of the conflict. */}
                                    <span
                                        aria-hidden="true"
                                        className="w-[3px] shrink-0 self-stretch"
                                        style={{ backgroundColor: item.slot }}
                                    />
                                    <div className="min-w-0">
                                        <h3 className="text-[15px] font-semibold text-brand-ink">
                                            {item.surface}
                                        </h3>
                                        <p className="mt-2 text-[15px] leading-relaxed text-brand-ink">
                                            {item.situation}
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed text-brand-subtle">
                                            {item.outcome}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Closing */}
                <section className="border-t border-brand-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="min-w-0">
                            <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.022em] text-brand-ink">
                                Bring the whole team into one page.
                            </h2>
                            <p className="mt-2 text-[15px] text-brand-subtle max-w-[52ch]">
                                Free for small teams. Everything syncs offline
                                and catches up when you reconnect.
                            </p>
                        </div>
                        <LinkButton
                            href={session?.user ? "/dashboard" : "/register"}
                            variant="primary"
                            size="lg"
                            className="shrink-0"
                        >
                            {session?.user
                                ? "Open your workspace"
                                : "Create a workspace"}
                        </LinkButton>
                    </div>
                </section>
            </main>
        </div>
    );
}
