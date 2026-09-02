"use client";

import {
    CheckCircle2,
    CloudOff,
    Loader2,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

import type { SaveState } from "../types";

export interface SaveStatusIndicatorProps {
    saveState: SaveState;
    lastSavedAt: Date | null;
    onSaveNow?: () => void;
    isReadOnly?: boolean;
}

export function SaveStatusIndicator({
    saveState,
    lastSavedAt,
    onSaveNow,
    isReadOnly = false,
}: SaveStatusIndicatorProps) {
    const formattedTime = lastSavedAt
        ? new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
          }).format(lastSavedAt)
        : null;

    if (!isReadOnly && (saveState === "saving" || saveState === "pending")) {
        return (
            <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-brand-mono uppercase tracking-wider text-brand-subtle bg-brand-muted border border-brand-border rounded-brand"
            >
                <Loader2
                    className="w-3.5 h-3.5 animate-spin text-brand-accent"
                    aria-hidden="true"
                />
                <span>Saving...</span>
            </div>
        );
    }

    if (saveState === "failed") {
        return (
            <div
                role="status"
                aria-live="assertive"
                className="flex items-center gap-2 px-2.5 py-1 text-xs font-brand-mono uppercase tracking-wider text-brand-danger bg-brand-danger/10 border border-brand-danger rounded-brand"
            >
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Save failed</span>
                {onSaveNow && (
                    <button
                        type="button"
                        onClick={onSaveNow}
                        className="flex items-center gap-1 px-1.5 py-0.5 ml-1 text-[10px] font-bold uppercase bg-brand-danger text-white hover:opacity-90 rounded-brand focus-visible:outline-2 focus-visible:outline-brand-ink"
                    >
                        <RefreshCw className="w-2.5 h-2.5" aria-hidden="true" />
                        Retry
                    </button>
                )}
            </div>
        );
    }

    if (saveState === "offline") {
        return (
            <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-brand-mono uppercase tracking-wider text-brand-warning bg-brand-warning/10 border border-brand-warning rounded-brand"
            >
                <CloudOff className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Offline (saved locally)</span>
            </div>
        );
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-brand-mono uppercase tracking-wider text-brand-success bg-brand-success/10 border border-brand-success/30 rounded-brand"
        >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Saved {formattedTime ? `at ${formattedTime}` : ""}</span>
        </div>
    );
}
