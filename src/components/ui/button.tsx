"use client";

import type { ButtonHTMLAttributes, Ref } from "react";
import { useFormStatus } from "react-dom";

import {
    buttonBaseClasses,
    sizeClasses,
    variantClasses,
} from "@/components/ui/button-styles";
import type { ButtonVariant, Size } from "@/components/ui/types";
import { cn } from "@/lib/cn";

export interface ButtonProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "ref"
> {
    variant?: ButtonVariant;
    size?: Size;
    pendingText?: string;
    ref?: Ref<HTMLButtonElement>;
}

export function Button({
    className,
    children,
    variant = "primary",
    size = "md",
    pendingText,
    ref,
    disabled,
    ...props
}: ButtonProps) {
    const { pending } = useFormStatus();
    const isDisabled = pending || disabled;
    const showPending = pending && pendingText;

    return (
        <button
            ref={ref}
            disabled={isDisabled}
            aria-busy={pending}
            className={cn(
                buttonBaseClasses,
                pending && "cursor-wait",
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        >
            {showPending ? pendingText : children}
        </button>
    );
}
