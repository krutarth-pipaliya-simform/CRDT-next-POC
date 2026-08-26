"use client";

import { useActionState, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateWorkspaceAction } from "@/features/workspace/actions/update-workspace";
import { cn } from "@/lib/cn";
import { WorkspaceVisibility } from "@/schemas/workspace";

export interface UpdateWorkspaceFormProps {
    workspaceId: string;
    initialName: string;
    initialVisibility?: WorkspaceVisibility;
}

export function UpdateWorkspaceForm({
    workspaceId,
    initialName,
    initialVisibility = WorkspaceVisibility.PRIVATE,
}: UpdateWorkspaceFormProps) {
    const boundUpdateAction = updateWorkspaceAction.bind(null, workspaceId);
    const [state, formAction] = useActionState(boundUpdateAction, null);
    const [visibility, setVisibility] =
        useState<WorkspaceVisibility>(initialVisibility);

    const visibilityOptions = [
        {
            value: WorkspaceVisibility.PRIVATE,
            title: "Private",
            description:
                "Only members explicitly invited can view and access this workspace.",
            badge: "Restricted",
        },
        {
            value: WorkspaceVisibility.PUBLIC,
            title: "Public",
            description:
                "Anyone can discover this workspace, join it, and collaborate.",
            badge: "Open",
        },
    ];

    return (
        <form action={formAction} className="flex flex-col gap-6 max-w-xl">
            <Input
                id="name"
                name="name"
                label="Workspace Name"
                defaultValue={initialName}
                required
            />

            <div className="flex flex-col gap-3">
                <label className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle">
                    Workspace Visibility
                </label>
                <input type="hidden" name="visibility" value={visibility} />
                <div className="grid grid-cols-1 gap-3">
                    {visibilityOptions.map((opt) => (
                        <button
                            type="button"
                            key={opt.value}
                            onClick={() => setVisibility(opt.value)}
                            className={cn(
                                "flex items-start justify-between p-4 border-2 rounded-brand text-left transition-all cursor-pointer",
                                visibility === opt.value
                                    ? "border-brand-accent bg-brand-surface shadow-brand-subtle"
                                    : "border-brand-border bg-brand-surface hover:border-brand-subtle opacity-80",
                            )}
                            aria-pressed={visibility === opt.value}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        "w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0",
                                        visibility === opt.value
                                            ? "border-brand-accent bg-brand-accent"
                                            : "border-brand-border",
                                    )}
                                >
                                    {visibility === opt.value && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-surface" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-brand-ink">
                                            {opt.title}
                                        </span>
                                    </div>
                                    <p className="text-xs text-brand-subtle mt-1 leading-relaxed">
                                        {opt.description}
                                    </p>
                                </div>
                            </div>
                            <span className="font-brand-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-brand-border bg-brand-muted text-brand-subtle rounded-brand shrink-0">
                                {opt.badge}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {state?.error && <Alert intent="danger">{state.error}</Alert>}
            {state?.success && (
                <Alert intent="success">
                    Workspace settings saved successfully.
                </Alert>
            )}

            <div>
                <Button type="submit" pendingText="Saving...">
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
