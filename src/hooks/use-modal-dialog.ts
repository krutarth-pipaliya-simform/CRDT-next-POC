"use client";

import {
    useEffect,
    useRef,
    type MouseEvent,
    type RefObject,
    type SyntheticEvent,
} from "react";

import { useScrollLock } from "@/hooks/use-scroll-lock";

export interface ModalDialogBindings {
    ref: RefObject<HTMLDialogElement | null>;
    onCancel: (event: SyntheticEvent<HTMLDialogElement>) => void;
    onClose: () => void;
    onClick: (event: MouseEvent<HTMLDialogElement>) => void;
}

/**
 * Drives a native `<dialog>` as a controlled modal.
 *
 * `showModal()` gives the hard parts for free: the rest of the page becomes
 * inert (so focus cannot leave), the dialog joins the top layer, and Escape
 * raises `cancel`. This hook adds what the element leaves out: the open state
 * stays owned by React, the page behind stops scrolling, a click on the
 * backdrop closes, and focus goes back to whatever opened the dialog.
 *
 * Spread the result onto the `<dialog>`.
 */
export function useModalDialog(
    open: boolean,
    onRequestClose: () => void,
): ModalDialogBindings {
    const ref = useRef<HTMLDialogElement>(null);
    const returnFocusTo = useRef<HTMLElement | null>(null);

    useScrollLock(open);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            returnFocusTo.current =
                document.activeElement instanceof HTMLElement
                    ? document.activeElement
                    : null;
            dialog.showModal();
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    return {
        ref,
        // Escape: keep React in charge of the state instead of letting the
        // element close itself behind React's back.
        onCancel: (event) => {
            event.preventDefault();
            onRequestClose();
        },
        // Fires for every close, including the browser's own (a second rapid
        // Escape). Restoring focus here covers all of them. `preventScroll`
        // matters when the dialog closed because an in-page link was chosen:
        // focusing the trigger must not scroll the page back to it.
        onClose: () => {
            returnFocusTo.current?.focus({ preventScroll: true });
            returnFocusTo.current = null;
            onRequestClose();
        },
        // The backdrop is part of the <dialog> box, so a click whose target is
        // the dialog itself landed outside the content.
        onClick: (event) => {
            if (event.target === event.currentTarget) {
                onRequestClose();
            }
        },
    };
}
