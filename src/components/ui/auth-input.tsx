import * as React from "react";

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1 w-full">
                <input
                    ref={ref}
                    className={`
            w-full bg-[#F0F0F0] text-[#1A1A1A] 
            placeholder:text-[#555555]
            px-4 py-3 text-sm
            border-2 transition-colors outline-none
            rounded-none
            ${
                error
                    ? "border-[#E53E3E] focus:border-[#E53E3E]"
                    : "border-transparent focus:border-[#2948FF]"
            }
            ${className || ""}
          `}
                    {...props}
                />
                {error && (
                    <span className="text-[#E53E3E] text-xs font-mono uppercase tracking-wider">
                        {error}
                    </span>
                )}
            </div>
        );
    },
);
AuthInput.displayName = "AuthInput";
