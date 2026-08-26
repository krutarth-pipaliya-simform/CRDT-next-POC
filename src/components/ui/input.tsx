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
                    className="font-brand-mono text-xs uppercase tracking-wider text-brand-ink"
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
                    "w-full bg-brand-muted text-brand-ink placeholder:text-brand-subtle px-4 py-3 text-sm border-2 transition-colors outline-none rounded-brand",
                    error
                        ? "border-brand-danger focus:border-brand-danger"
                        : "border-transparent focus:border-brand-accent",
                    className,
                )}
                {...props}
            />
            {error && (
                <span
                    id={errorId}
                    role="alert"
                    className="text-brand-danger text-xs font-brand-mono uppercase tracking-wider"
                >
                    {error}
                </span>
            )}
            {hint && !error && (
                <span
                    id={hintId}
                    className="text-brand-subtle text-xs font-brand-mono"
                >
                    {hint}
                </span>
            )}
        </div>
    );
}
