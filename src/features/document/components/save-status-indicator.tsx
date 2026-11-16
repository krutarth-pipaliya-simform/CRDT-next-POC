"use client";

import type { ReactNode } from "react";
import {
    AlertCircle,
    Check,
    CloudOff,
    Loader2,
    Lock,
    RefreshCw,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { formatClockTime } from "@/lib/format-time";

import type { SaveState } from "../types";

export interface SaveStatusIndicatorProps {
    saveState: SaveState;
    lastSavedAt: Date | null;
    onSaveNow?: () => void;
    isReadOnly?: boolean;
}

type PillTone = "ink" | "warning" | "danger";

const PILL_TONES: Record<PillTone, string> = {
    ink: "border-paddock-rule text-paddock-ink",
    warning: "border-paddock-warning text-paddock-warning",
    danger: "border-paddock-danger text-paddock-danger",
};

interface StatusPillProps {
    tone: PillTone;
    icon: ReactNode;
    children: ReactNode;
}

function StatusPill({ tone, icon, children }: StatusPillProps) {
    return (
        <span
            className={cn(
                "paddock-mono inline-flex h-[2.125rem] items-center gap-1.5 rounded-full border px-3 text-xs whitespace-nowrap",
                PILL_TONES[tone],
            )}
        >
            <span aria-hidden="true" className="inline-flex">
                {icon}
            </span>
            {children}
        </span>
    );
}

const ICON = "size-[0.8125rem]";

/**
 * One pill that answers "is my work safe?". A read-only session never saves,
 * so in that state the pill says so instead of reporting a save.
 */
export function SaveStatusIndicator({
    saveState,
    lastSavedAt,
    onSaveNow,
    isReadOnly = false,
}: SaveStatusIndicatorProps) {
    const formattedTime = lastSavedAt ? formatClockTime(lastSavedAt) : null;

    if (isReadOnly) {
        return (
            <div role="status" aria-live="polite">
                <StatusPill
                    tone="warning"
                    icon={<Lock className={ICON} strokeWidth={2.2} />}
                >
                    Read only
                </StatusPill>
            </div>
        );
    }

    if (saveState === "saving" || saveState === "pending") {
        return (
            <div role="status" aria-live="polite">
                <StatusPill
                    tone="ink"
                    icon={<Loader2 className={cn(ICON, "animate-spin")} />}
                >
                    Saving…
                </StatusPill>
            </div>
        );
    }

    if (saveState === "failed") {
        return (
            <div
                role="status"
                aria-live="assertive"
                className="flex items-center gap-2"
            >
                <StatusPill
                    tone="danger"
                    icon={<AlertCircle className={ICON} strokeWidth={2.2} />}
                >
                    Save failed
                </StatusPill>
                {onSaveNow ? (
                    <button
                        type="button"
                        onClick={onSaveNow}
                        className="paddock-press inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-paddock bg-paddock-danger px-3.5 text-[0.8125rem] font-semibold text-paddock-on-danger"
                    >
                        <RefreshCw className="size-3.5" aria-hidden="true" />
                        Retry
                    </button>
                ) : null}
            </div>
        );
    }

    if (saveState === "offline") {
        return (
            <div role="status" aria-live="polite">
                <StatusPill
                    tone="warning"
                    icon={<CloudOff className={ICON} strokeWidth={2.2} />}
                >
                    Offline (saved locally)
                </StatusPill>
            </div>
        );
    }

    return (
        <div role="status" aria-live="polite">
            <StatusPill
                tone="ink"
                icon={<Check className={ICON} strokeWidth={2.4} />}
            >
                {formattedTime ? `Saved at ${formattedTime}` : "Saved"}
            </StatusPill>
        </div>
    );
}
