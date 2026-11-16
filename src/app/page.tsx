import Link from "next/link";

import { ContourBackground } from "@/components/paddock/contour-background";
import { DisplayHeading } from "@/components/paddock/display-heading";
import { NotchedCard } from "@/components/paddock/notched-card";
import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import { Scribble } from "@/components/paddock/scribble";
import { Tag } from "@/components/paddock/tag";
import { Wordmark } from "@/components/paddock/wordmark";
import { auth } from "@/features/auth/lib/auth";
import { PLANS } from "@/features/billing/lib/plans";
import { LatestAnnouncement } from "@/features/cms/components/latest-announcement";
import { CONTENT_SECTIONS } from "@/features/cms/lib/content-sections";
import { ConvergenceCases } from "@/features/marketing/components/convergence-cases";
import { LandingHeader } from "@/features/marketing/components/landing-header";
import { MergeBand } from "@/features/marketing/components/merge-band";
import { MergeDemo } from "@/features/marketing/components/merge-demo";
import { MergeGlyph } from "@/features/marketing/components/merge-glyph";

const FOOTER_LINK =
    "paddock-tag inline-flex min-h-11 items-center text-[0.6875rem] text-paddock-ink no-underline hover:underline";

export default async function LandingPage() {
    const session = await auth();
    const signedIn = Boolean(session?.user);
    const freePlan = PLANS.FREE;

    return (
        <div className="flex min-h-screen flex-col bg-paddock-paper">
            <LandingHeader signedIn={signedIn} />

            <main className="w-full flex-1">
                <LatestAnnouncement className="mx-auto w-full max-w-[77rem] px-4 pt-4 sm:px-6" />

                {/* Hero: the claim, then the demo proving it underneath. */}
                <section
                    aria-label="Introduction"
                    className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:pt-[6.5rem] lg:pb-[6.875rem]"
                >
                    <ContourBackground pattern="hero" />

                    <div className="relative text-center">
                        <Tag as="p" className="mb-4.5">
                            Documents, boards and chat
                        </Tag>
                        <div className="relative inline-block max-w-full">
                            <DisplayHeading
                                as="h1"
                                size="xl"
                                serif="Everyone types"
                                heavy="at once."
                                outline="Nothing gets lost."
                                align="center"
                            />
                            <Scribble
                                shape="loop"
                                delayMs={500}
                                className="absolute top-[4.875rem] -right-10 hidden h-[6.875rem] w-[20.625rem] xl:block"
                            />
                        </div>
                        <p className="mx-auto mt-6.5 mb-0 max-w-[35rem] text-lg leading-[1.6]">
                            Documents, boards and chat that merge every
                            keystroke as it happens. No locks, no &ldquo;someone
                            else is editing&rdquo;, and nothing for you to
                            resolve by hand.
                        </p>
                        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                            {signedIn ? (
                                <PaddockLinkButton href="/dashboard" size="lg">
                                    Open your workspace
                                </PaddockLinkButton>
                            ) : (
                                <>
                                    <PaddockLinkButton
                                        href="/register"
                                        size="lg"
                                    >
                                        Start writing
                                    </PaddockLinkButton>
                                    <PaddockLinkButton
                                        href="/login"
                                        variant="outline"
                                        size="lg"
                                    >
                                        Log in
                                    </PaddockLinkButton>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Demo in the middle, the two quiet facts either side.
                        Below the wide breakpoint the demo goes first and the
                        facts share a row under it. */}
                    <div className="relative mx-auto mt-16 flex max-w-[77rem] flex-wrap items-end justify-between gap-x-4 gap-y-8 lg:gap-8">
                        <div className="order-2 w-[8.5rem] shrink-0 sm:w-[9.375rem] lg:order-1">
                            <Tag as="p" tone="ink" className="mb-1">
                                Free for small teams
                            </Tag>
                            <NotchedCard
                                notch="top"
                                tone="paper"
                                bodyClassName="flex flex-col items-center gap-2.5 px-3.5 pt-[1.875rem] pb-3.5 text-center"
                            >
                                <MergeGlyph
                                    strokeWidth={2}
                                    className="size-8 text-paddock-ink"
                                />
                                <Tag
                                    tone="ink"
                                    className="block w-full border-b-[1.5px] border-paddock-ink pb-2"
                                >
                                    {freePlan.name} plan
                                </Tag>
                                <span className="paddock-mono text-[1.375rem] font-medium">
                                    {freePlan.price}
                                </span>
                                <Tag>{freePlan.cadence}</Tag>
                            </NotchedCard>
                        </div>

                        <div className="order-1 min-w-0 basis-full lg:order-2 lg:max-w-[45rem] lg:flex-1 lg:basis-auto">
                            <MergeDemo />
                        </div>

                        <div className="order-3 flex w-[8.5rem] shrink-0 sm:w-[9.375rem] flex-col items-end gap-1.5 text-right">
                            <Tag as="p" tone="ink">
                                Works offline
                            </Tag>
                            <p className="m-0 text-[0.84375rem] font-medium">
                                Everything syncs offline and catches up when you
                                reconnect.
                            </p>
                        </div>
                    </div>
                </section>

                <MergeBand />

                <ConvergenceCases />

                {/* Closing */}
                <section
                    aria-labelledby="landing-closing-heading"
                    className="relative overflow-hidden px-4 pt-24 pb-10 text-center sm:px-6 lg:pt-[8.75rem] lg:pb-20"
                >
                    <ContourBackground pattern="panel" />
                    <div className="relative">
                        <DisplayHeading
                            id="landing-closing-heading"
                            serif="Bring the whole team"
                            heavy="into one page."
                            align="center"
                        />
                        <p className="mx-auto mt-6.5 mb-0 max-w-[32.5rem] text-lg">
                            Free for small teams. Everything syncs offline and
                            catches up when you reconnect.
                        </p>
                        <PaddockLinkButton
                            href={signedIn ? "/dashboard" : "/register"}
                            size="lg"
                            className="mt-7.5"
                        >
                            {signedIn
                                ? "Open your workspace"
                                : "Create a workspace"}
                        </PaddockLinkButton>
                    </div>

                    <footer className="relative mx-auto mt-24 flex max-w-[77rem] flex-wrap items-center justify-between gap-4 border-t border-paddock-rule pt-4 text-left lg:mt-[8.75rem]">
                        <Link
                            href="/"
                            aria-label="Converge home"
                            className="no-underline"
                        >
                            <Wordmark size="sm" />
                        </Link>
                        <nav
                            aria-label="Content"
                            className="flex flex-wrap gap-x-5.5"
                        >
                            {CONTENT_SECTIONS.map((section) => (
                                <Link
                                    key={section.href}
                                    href={section.href}
                                    className={FOOTER_LINK}
                                >
                                    {section.label}
                                </Link>
                            ))}
                        </nav>
                        <nav aria-label="Account" className="flex gap-5.5">
                            {signedIn ? (
                                <Link href="/dashboard" className={FOOTER_LINK}>
                                    Your workspaces
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className={FOOTER_LINK}>
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className={FOOTER_LINK}
                                    >
                                        Create account
                                    </Link>
                                </>
                            )}
                        </nav>
                    </footer>
                </section>
            </main>
        </div>
    );
}
