"use client";

import { useId, type ReactNode } from "react";
import { X } from "lucide-react";

import { useModalDialog } from "@/hooks/use-modal-dialog";
import { cn } from "@/lib/cn";

import { DisplayHeading } from "./display-heading";
import { PaddockIconButton } from "./paddock-button";

export interface PaddockDialogProps {
    open: boolean;
    onClose: () => void;
    /** The two voices of the title: "New" over "task". */
    titleSerif: string;
    titleHeavy: string;
    description?: string;
    children: ReactNode;
    /** Actions, pinned below the scrolling body. */
    footer?: ReactNode;
    className?: string;
}

/**
 * Modal dialog on a native `<dialog>` (see `useModalDialog`): background
 * inert and unscrollable, Escape and backdrop close, focus returns to the
 * trigger. The header and footer stay put while a long body scrolls inside
 * the dialog, never the page behind it.
 */
export function PaddockDialog({
    open,
    onClose,
    titleSerif,
    titleHeavy,
    description,
    children,
    footer,
    className,
}: PaddockDialogProps) {
    const bindings = useModalDialog(open, onClose);
    const titleId = useId();
    const descriptionId = useId();

    return (
        <dialog
            {...bindings}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={cn(
                "paddock-in m-auto w-[40rem] max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-4rem)] overflow-hidden p-0",
                "rounded-paddock-panel bg-paddock-paper text-paddock-ink shadow-paddock-dialog",
                "backdrop:bg-paddock-scrim",
                "open:flex open:flex-col",
                className,
            )}
        >
            <header className="flex shrink-0 items-start justify-between gap-4 px-6 pt-7 pb-5 sm:px-8">
                <div className="flex flex-col gap-2">
                    <DisplayHeading
                        id={titleId}
                        as="h2"
                        size="md"
                        serif={titleSerif}
                        heavy={titleHeavy}
                    />
                    {description ? (
                        <p
                            id={descriptionId}
                            className="m-0 text-sm text-paddock-subtle"
                        >
                            {description}
                        </p>
                    ) : null}
                </div>
                <PaddockIconButton
                    label="Close dialog"
                    icon={<X className="size-5" strokeWidth={2.4} />}
                    size="sm"
                    onClick={onClose}
                />
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 sm:px-8">
                {children}
            </div>
            {footer ? (
                <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-paddock-rule px-6 py-4.5 sm:px-8">
                    {footer}
                </footer>
            ) : null}
        </dialog>
    );
}
