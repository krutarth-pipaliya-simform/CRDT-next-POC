"use client";

import { Lock, ShieldAlert } from "lucide-react";

import { PaddockButton } from "@/components/paddock/paddock-button";

import type { ReadOnlyReason } from "../types";

export interface ReadOnlyBannerProps {
    reason: ReadOnlyReason;
    onTakeOverEditing: () => void;
}

/**
 * A night band over the canvas: this session is spectating, and here is the
 * one action that changes that. It stays dark in both themes.
 */
export function ReadOnlyBanner({
    reason,
    onTakeOverEditing,
}: ReadOnlyBannerProps) {
    const isTakenOver = reason === "taken_over";

    return (
        <div
            role="alert"
            aria-live="polite"
            data-testid="read-only-banner"
            className="paddock-night paddock-in flex flex-wrap items-center justify-between gap-x-6 gap-y-3.5 rounded-paddock-card px-5 py-4"
        >
            <div className="flex min-w-0 items-center gap-3.5">
                <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-paddock bg-paddock-lime text-paddock-on-fill"
                >
                    {isTakenOver ? (
                        <ShieldAlert
                            className="size-[1.125rem]"
                            strokeWidth={2}
                        />
                    ) : (
                        <Lock className="size-[1.125rem]" strokeWidth={2} />
                    )}
                </span>

                <div className="min-w-0">
                    <p className="m-0 text-[0.9375rem] font-bold">
                        {isTakenOver
                            ? "Editing session taken over — another tab is editing now"
                            : "Read-only mode active — you have this open in another tab"}
                    </p>
                    <p className="m-0 mt-0.5 text-[0.84375rem] text-paddock-night-subtle">
                        {isTakenOver
                            ? "Another session for your account took over editing. Edits from everyone still arrive live."
                            : "Edits from everyone still arrive live. Take over to write here instead."}
                    </p>
                </div>
            </div>

            <PaddockButton
                surface="night"
                size="sm"
                onClick={onTakeOverEditing}
                className="w-full sm:w-auto"
            >
                Take over editing
            </PaddockButton>
        </div>
    );
}
