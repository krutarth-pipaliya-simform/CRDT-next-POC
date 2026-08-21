import * as React from "react";
import { useFormStatus } from "react-dom";

export interface AuthButtonProps extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "ref"
> {
    pendingText?: string;
    variant?: "primary" | "secondary";
    ref?: React.Ref<HTMLButtonElement>;
}

export function AuthButton({
    className,
    children,
    pendingText = "PROCESSING...",
    variant = "primary",
    ref,
    ...props
}: AuthButtonProps) {
    const { pending } = useFormStatus();

    const isPrimary = variant === "primary";
    const baseClasses =
        "w-full font-mono uppercase tracking-widest px-6 py-4 text-sm font-semibold transition-all rounded-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 flex items-center justify-between group";

    const primaryClasses =
        "bg-[#1A1A1A] text-white hover:bg-[#2948FF] focus-visible:ring-[#2948FF]";
    const secondaryClasses =
        "bg-transparent text-[#1A1A1A] border-2 border-[#1A1A1A] hover:bg-[#F0F0F0] focus-visible:ring-[#1A1A1A]";

    return (
        <button
            ref={ref}
            disabled={pending || props.disabled}
            className={`
      ${baseClasses}
      ${isPrimary ? primaryClasses : secondaryClasses}
      ${pending ? "opacity-70 cursor-wait" : ""}
      ${className || ""}
    `}
            {...props}
        >
            <span>{pending ? pendingText : children}</span>
            {isPrimary && !pending && (
                <span
                    aria-hidden="true"
                    className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                >
                    -&gt;
                </span>
            )}
        </button>
    );
}
