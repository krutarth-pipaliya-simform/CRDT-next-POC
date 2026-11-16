import type { ReactNode } from "react";

import { ContourBackground } from "@/components/paddock/contour-background";
import {
    AccessDenied,
    ForbiddenNumeral,
} from "@/features/auth/components/access-denied";

import { PAGE_CONTAINER } from "./layout-styles";

export interface ShellNoticeProps {
    /** The status line, e.g. "404 · Not found". */
    code: string;
    /** The status drawn in outline behind the panel on wide screens. */
    numeral: string;
    serif: string;
    heavy: string;
    children: ReactNode;
    /** The ways out, as night-surface link buttons. */
    actions: ReactNode;
}

/**
 * A dead end inside the app shell (a refusal, a missing page, an error) as a
 * night panel in the content column. The header stays above it, and inside a
 * workspace so do the section tabs, so there is always a way out besides the
 * browser's back button.
 */
export function ShellNotice({
    code,
    numeral,
    serif,
    heavy,
    children,
    actions,
}: ShellNoticeProps) {
    return (
        <main className={`${PAGE_CONTAINER} py-8 sm:py-12`}>
            <section className="paddock-night relative overflow-hidden rounded-paddock-panel px-6 py-14 sm:px-12 sm:py-20">
                <ContourBackground pattern="band" surface="night" />
                <ForbiddenNumeral
                    numeral={numeral}
                    className="-right-6 hidden text-[18rem] lg:block"
                />
                <AccessDenied
                    code={code}
                    serif={serif}
                    heavy={heavy}
                    actions={actions}
                >
                    {children}
                </AccessDenied>
            </section>
        </main>
    );
}
