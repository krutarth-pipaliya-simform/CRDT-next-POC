"use client";

import { useFormStatus } from "react-dom";

import {
    PaddockButton,
    type PaddockButtonProps,
} from "@/components/paddock/paddock-button";

export interface AuthSubmitButtonProps extends Omit<
    PaddockButtonProps,
    "type"
> {
    /** Shown while the form's action runs, in place of the label. */
    pendingText?: string;
}

/**
 * `PaddockButton` is hook-free so it can render on the server; the pending
 * state of a form needs `useFormStatus`, so the submit button lives here.
 */
export function AuthSubmitButton({
    pendingText,
    disabled,
    children,
    size = "lg",
    ...props
}: AuthSubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <PaddockButton
            type="submit"
            size={size}
            disabled={pending || disabled}
            {...props}
        >
            {pending && pendingText ? pendingText : children}
        </PaddockButton>
    );
}
