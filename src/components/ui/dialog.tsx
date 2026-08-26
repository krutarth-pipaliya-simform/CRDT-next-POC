"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function Dialog({
    open,
    onClose,
    title,
    children,
    className,
}: DialogProps) {
    const ref = React.useRef<HTMLDialogElement>(null);

    React.useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;

        if (open) {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else {
            if (dialog.open) {
                dialog.close();
            }
        }
    }, [open]);

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            className={cn(
                "bg-brand-surface text-brand-ink border-2 border-brand-ink p-6 sm:p-8 w-full max-w-md",
                "rounded-brand shadow-brand-card backdrop:bg-brand-ink/40 backdrop:backdrop-blur-xs",
                "m-auto fixed inset-0",
                className,
            )}
        >
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight text-brand-ink">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="text-brand-subtle hover:text-brand-ink transition-colors p-1 cursor-pointer font-brand-mono text-base"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </dialog>
    );
}
