"use client";

import { useState, useTransition } from "react";

import { ContourBackground } from "@/components/paddock/contour-background";
import { PaddockButton } from "@/components/paddock/paddock-button";
import { Tag } from "@/components/paddock/tag";
import { createInvitationAction } from "@/features/workspace/actions/create-invitation";
import { cn } from "@/lib/cn";

export interface InviteSectionProps {
    workspaceId: string;
    className?: string;
}

/**
 * Invite links, on a night panel. Night stays dark in both themes, which is
 * what lets the serif half of the heading be lime text.
 */
export function InviteSection({ workspaceId, className }: InviteSectionProps) {
    const [link, setLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleGenerate = () => {
        setLink(null);
        setError(null);
        setCopied(false);
        startTransition(async () => {
            const result = await createInvitationAction(workspaceId);
            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                const origin =
                    typeof window !== "undefined" ? window.location.origin : "";
                setLink(`${origin}/invite/${result.data.token}`);
            }
        });
    };

    const handleCopy = () => {
        if (!link) return;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <section
            aria-labelledby="invite-heading"
            className={cn(
                "paddock-night relative overflow-hidden rounded-paddock-card px-7 pt-7.5 pb-7",
                className,
            )}
        >
            <ContourBackground pattern="panel" surface="night" />
            <div className="relative flex flex-col gap-4">
                <h2 id="invite-heading" className="m-0 leading-[0.86]">
                    <span className="paddock-serif block text-[clamp(2.25rem,5vw,2.875rem)] text-paddock-lime">
                        Invite
                    </span>{" "}
                    <span className="paddock-heavy block text-[clamp(1.875rem,4.2vw,2.375rem)]">
                        new members
                    </span>
                </h2>
                <p className="m-0 text-paddock-night-subtle">
                    Each link works once and expires after 24 hours. Whoever
                    opens it joins as a member.
                </p>
                <PaddockButton
                    surface="night"
                    className="self-start"
                    onClick={handleGenerate}
                    disabled={isPending}
                >
                    {isPending
                        ? "Generating..."
                        : link
                          ? "Generate another link"
                          : "Generate invite link"}
                </PaddockButton>

                {error ? (
                    <p
                        role="alert"
                        className="m-0 rounded-paddock bg-paddock-danger px-3.5 py-2.5 text-sm font-semibold text-paddock-on-danger"
                    >
                        {error}
                    </p>
                ) : null}

                {link ? (
                    <div className="paddock-in flex flex-col gap-2.5 rounded-[10px] bg-paddock-night-card p-4.5">
                        <label
                            htmlFor="shareable-link"
                            className="flex flex-col gap-2"
                        >
                            <Tag tone="night-subtle">Shareable link</Tag>
                            <input
                                id="shareable-link"
                                type="text"
                                readOnly
                                value={link}
                                onClick={(event) =>
                                    event.currentTarget.select()
                                }
                                className="paddock-mono h-11.5 w-full rounded-paddock border-[1.5px] border-paddock-float bg-paddock-night px-3.5 text-[0.8125rem] text-paddock-night-fg"
                            />
                        </label>
                        <div className="flex flex-wrap items-center justify-between gap-2.5">
                            <PaddockButton
                                variant="outline"
                                voice="plain"
                                surface="night"
                                size="sm"
                                onClick={handleCopy}
                                className={cn(
                                    copied &&
                                        "bg-paddock-night-fg text-paddock-night",
                                )}
                            >
                                {copied ? "Copied" : "Copy link"}
                            </PaddockButton>
                            <span className="paddock-mono text-xs text-paddock-night-subtle">
                                valid for 24 h
                            </span>
                            <span role="status" className="sr-only">
                                {copied ? "Link copied to the clipboard" : ""}
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
