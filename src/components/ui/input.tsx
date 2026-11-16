import { useId, type InputHTMLAttributes, type Ref } from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "ref"
> {
    label?: string;
    error?: string;
    hint?: string;
    ref?: Ref<HTMLInputElement>;
}

export function Input({
    className,
    label,
    error,
    hint,
    id,
    ref,
    ...props
}: InputProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const describedBy =
        [error ? errorId : null, hint && !error ? hintId : null]
            .filter(Boolean)
            .join(" ") || undefined;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-[13px] font-medium text-brand-ink"
                >
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy}
                className={cn(
                    "w-full bg-brand-surface text-brand-ink placeholder:text-brand-subtle/70",
                    "h-10 px-3 text-sm border rounded-brand transition-colors",
                    error
                        ? "border-brand-danger"
                        : "border-brand-line hover:border-brand-ink",
                    className,
                )}
                {...props}
            />
            {error && (
                <span
                    id={errorId}
                    role="alert"
                    className="text-brand-danger text-[13px]"
                >
                    {error}
                </span>
            )}
            {hint && !error && (
                <span id={hintId} className="text-brand-subtle text-[13px]">
                    {hint}
                </span>
            )}
        </div>
    );
}
