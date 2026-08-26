import { auth } from "@/features/auth/lib/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { LinkButton } from "@/components/ui/link-button";

export default async function LandingPage() {
    const session = await auth();

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden bg-brand-surface font-brand-sans">
            {/* Background architectural grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{
                    backgroundImage: `linear-gradient(var(--color-brand-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-brand-ink) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />

            <SiteHeader />

            <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 pt-20 pb-32">
                <div className="max-w-5xl w-full mx-auto flex flex-col items-center text-center">
                    {/* Eyebrow */}
                    <div className="animate-fade-in-up flex items-center gap-4 mb-8">
                        <div className="w-12 h-[2px] bg-brand-accent animate-draw-line" />
                        <span className="font-brand-mono text-sm tracking-[0.2em] uppercase font-bold text-brand-accent whitespace-nowrap">
                            CRDT Engine POC
                        </span>
                        <div className="w-12 h-[2px] bg-brand-accent animate-draw-line" />
                    </div>

                    {/* Headline */}
                    <h1 className="animate-fade-in-up delay-100 text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-brand-ink leading-[0.9] mb-8">
                        Collaborate with <br className="hidden sm:block" />
                        <span className="relative inline-block mt-2">
                            <span className="relative z-10">
                                Machined Precision
                            </span>
                            <span className="absolute bottom-2 left-0 w-full h-6 bg-brand-accent/20 -z-10" />
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="animate-fade-in-up delay-200 text-xl md:text-2xl text-brand-subtle mb-12 max-w-2xl font-brand-sans leading-relaxed">
                        A real-time workspace powered by Conflict-Free
                        Replicated Data Types. No locks. No merge conflicts.
                        Just pure synchronization.
                    </p>

                    {/* CTAs */}
                    <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center gap-6">
                        {session?.user ? (
                            <LinkButton
                                href="/dashboard"
                                variant="primary"
                                size="lg"
                                withArrow
                            >
                                Enter Workspace
                            </LinkButton>
                        ) : (
                            <>
                                <LinkButton
                                    href="/login"
                                    variant="primary"
                                    size="lg"
                                    withArrow
                                >
                                    Initialize Session
                                </LinkButton>
                                <LinkButton
                                    href="/design-system"
                                    variant="secondary"
                                    size="lg"
                                >
                                    View Design System
                                </LinkButton>
                            </>
                        )}
                    </div>
                </div>

                {/* Technical specs readout */}
                <div className="w-full max-w-4xl mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="animate-fade-in-up delay-400 p-6 border-l-4 border-brand-ink bg-brand-muted/40">
                        <div className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle mb-4 font-bold">
                            Protocol 01
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Yjs Engine</h3>
                        <p className="text-brand-subtle text-sm">
                            Peer-to-peer data synchronization resolving state
                            automatically via mathematical precision.
                        </p>
                    </div>
                    <div className="animate-fade-in-up delay-500 p-6 border-l-4 border-brand-ink bg-brand-muted/40">
                        <div className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle mb-4 font-bold">
                            Protocol 02
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                            &lt; 50ms Latency
                        </h3>
                        <p className="text-brand-subtle text-sm">
                            Real-time WebSockets integration ensuring keystrokes
                            propagate instantaneously.
                        </p>
                    </div>
                    <div className="animate-fade-in-up delay-600 p-6 border-l-4 border-brand-ink bg-brand-muted/40">
                        <div className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle mb-4 font-bold">
                            Protocol 03
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                            Offline First
                        </h3>
                        <p className="text-brand-subtle text-sm">
                            Local state persistence guarantees operations
                            survive network partitioning.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
