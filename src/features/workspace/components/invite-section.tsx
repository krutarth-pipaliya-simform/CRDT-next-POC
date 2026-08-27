"use client";

import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createInvitationAction } from "@/features/workspace/actions/create-invitation";

export interface InviteSectionProps {
    workspaceId: string;
}

export function InviteSection({ workspaceId }: InviteSectionProps) {
    const [link, setLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleGenerate = () => {
        setLink(null);
        setError(null);
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
        <div className="flex flex-col gap-4 max-w-md">
            <p className="text-xs font-brand-mono text-brand-subtle">
                Generate a secure invitation link. Links expire in 24 hours and
                can be used once.
            </p>
            <div>
                <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isPending}
                    variant="secondary"
                >
                    {isPending ? "Generating..." : "Generate Invite Link"}
                </Button>
            </div>
            {error && <Alert intent="danger">{error}</Alert>}
            {link && (
                <div className="flex flex-col gap-3 p-4 bg-brand-muted border-2 border-brand-border rounded-brand animate-fade-in-up">
                    <label
                        htmlFor="shareable-link"
                        className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle"
                    >
                        Shareable Link
                    </label>
                    <input
                        id="shareable-link"
                        aria-label="Shareable Link"
                        type="text"
                        readOnly
                        value={link}
                        className="w-full bg-brand-surface text-brand-ink font-brand-mono text-xs px-3 py-2 border border-brand-border outline-none select-all"
                        onClick={(e) => e.currentTarget.select()}
                    />
                    <div className="flex items-center justify-between gap-4 pt-1">
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleCopy}
                        >
                            {copied ? "Copied to Clipboard!" : "Copy Link"}
                        </Button>
                        <span className="text-[11px] font-brand-mono text-brand-subtle">
                            ⏱ Valid for 24 hours
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
