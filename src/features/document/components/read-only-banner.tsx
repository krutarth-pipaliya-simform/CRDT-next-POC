"use client";

import { Eye, Lock, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ReadOnlyReason } from "../types";

export interface ReadOnlyBannerProps {
    reason: ReadOnlyReason;
    onTakeOverEditing: () => void;
}

export function ReadOnlyBanner({
    reason,
    onTakeOverEditing,
}: ReadOnlyBannerProps) {
    const isTakenOver = reason === "taken_over";

    return (
        <div
            role="alert"
            aria-live="polite"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-brand-surface border-2 border-brand-ink rounded-brand shadow-brand-subtle border-l-4 border-l-brand-warning transition-all duration-150"
        >
            <div className="flex items-start gap-3 min-w-0">
                <div className="p-1.5 bg-brand-warning/10 border border-brand-warning text-brand-warning rounded-brand shrink-0 mt-0.5 sm:mt-0">
                    {isTakenOver ? (
                        <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                    ) : (
                        <Lock className="w-4 h-4" aria-hidden="true" />
                    )}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold font-brand-mono uppercase tracking-wider text-brand-ink">
                            {isTakenOver
                                ? "Editing Session Taken Over"
                                : "Read-Only Mode Active"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-brand-mono uppercase tracking-widest bg-brand-muted border border-brand-border text-brand-subtle rounded-brand">
                            <Eye className="w-2.5 h-2.5" aria-hidden="true" />
                            Spectating
                        </span>
                    </div>

                    <p className="text-xs text-brand-subtle font-brand-sans leading-relaxed">
                        {isTakenOver
                            ? "Another session or window for your account took over editing. Real-time updates are still synced."
                            : "This document is currently being edited in another session of your account. Real-time updates are still synced."}
                    </p>
                </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-0">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onTakeOverEditing}
                    className="w-full sm:w-auto text-xs font-brand-mono uppercase tracking-wider bg-brand-muted hover:bg-brand-ink hover:text-brand-surface border-2 border-brand-ink shadow-brand-subtle transition-all"
                >
                    Take Over Editing
                </Button>
            </div>
        </div>
    );
}
