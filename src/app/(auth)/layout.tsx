import type { ReactNode } from "react";
import Link from "next/link";

export interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <main className="min-h-screen w-full flex bg-brand-surface font-brand-sans">
            {/* Left Column - Form Area */}
            <div className="w-full lg:w-1/3 min-w-100 flex flex-col justify-center items-center p-8 sm:p-12 border-r-2 border-brand-muted relative">
                <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
                    <Link
                        href="/"
                        className="text-sm font-brand-mono uppercase tracking-widest text-brand-subtle hover:text-brand-ink transition-colors flex items-center gap-2"
                    >
                        <span>←</span> Back to Home
                    </Link>
                </div>
                {children}
            </div>

            {/* Right Column - Visual Area */}
            <div className="hidden lg:flex flex-1 flex-col justify-center bg-brand-muted relative overflow-hidden p-16">
                <div className="absolute top-12 left-12">
                    <div className="font-brand-mono text-sm tracking-widest text-brand-ink font-bold">
                        [ CRDT-NEXT-POC ]
                    </div>
                </div>

                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-5xl font-bold tracking-tighter text-brand-ink leading-tight mb-8">
                        Synchronized. <br />
                        Distributed. <br />
                        Precise.
                    </h1>

                    <div className="font-brand-mono text-sm text-brand-subtle leading-relaxed p-6 bg-brand-surface border-2 border-brand-ink">
                        <pre className="whitespace-pre-wrap">
                            {`[ Client A ] <---> [ Sync Server ]
       |                  |
[ Client B ] <---> [ DB Cluster ]

STATUS: ONLINE
LATENCY: < 50ms
PROTOCOL: YJS_WS`}
                        </pre>
                    </div>
                </div>

                {/* Abstract grid background */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(var(--color-brand-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-brand-ink) 1px, transparent 1px)`,
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>
        </main>
    );
}
