import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { paddockFontVariables } from "./paddock-fonts";

export interface PaddockRootProps {
    children: ReactNode;
    className?: string;
}

/**
 * The boundary of the Paddock direction. Everything Paddock-specific in
 * `globals.css` is scoped under `.paddock-root`, and the two display faces are
 * attached here, so nothing outside this element changes. Overlays render in
 * place (a native `<dialog>` keeps its DOM position in the top layer), which
 * is why they still inherit the fonts and tokens.
 */
export function PaddockRoot({ children, className }: PaddockRootProps) {
    return (
        <div
            className={cn(
                paddockFontVariables,
                "paddock-root relative min-h-screen overflow-x-clip",
                className,
            )}
        >
            {children}
        </div>
    );
}
