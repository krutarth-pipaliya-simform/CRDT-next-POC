import type { ReactNode } from "react";
import Link from "next/link";

import { ContourBackground } from "@/components/paddock/contour-background";
import {
    CollaboratorHighlight,
    CursorFlag,
} from "@/components/paddock/cursor-flag";
import { AvatarStack } from "@/components/paddock/paddock-avatar";
import { Tag } from "@/components/paddock/tag";
import { Wordmark } from "@/components/paddock/wordmark";
import { DEMO_PEOPLE, DEMO_TRIO } from "@/features/marketing/lib/demo-people";

export interface AuthSplitScreenProps {
    children: ReactNode;
}

const ASIDE_SERIF =
    "paddock-serif block text-[clamp(2.75rem,5vw,4rem)] text-paddock-lime";

/**
 * Sign in and sign up: the form on paper, and beside it a night panel that
 * teaches the colour language before anyone has an account — three people,
 * three hues, one document. Deliberately still: the moving version lives on
 * the landing page. Below 1040px the panel wraps under the form.
 */
export function AuthSplitScreen({ children }: AuthSplitScreenProps) {
    return (
        <div className="flex min-h-screen w-full flex-wrap bg-paddock-paper">
            <main className="relative flex min-w-0 flex-[1_1_32.5rem] flex-col overflow-hidden px-4 pt-7 pb-10 sm:px-8">
                <ContourBackground pattern="band" />
                <Link
                    href="/"
                    aria-label="Converge home"
                    className="relative block w-fit no-underline"
                >
                    <Wordmark />
                </Link>
                <div className="relative flex flex-1 items-center">
                    <div className="mx-auto mt-10 w-full max-w-[26.25rem]">
                        {children}
                    </div>
                </div>
            </main>

            <aside className="paddock-night relative flex min-w-0 flex-[1_1_32.5rem] flex-col justify-center gap-10 overflow-hidden px-6 py-14 sm:px-14 sm:py-18">
                <ContourBackground pattern="band" surface="night" />

                <h2 className="relative m-0 leading-[0.86]">
                    <span className={ASIDE_SERIF}>Three people</span>{" "}
                    <span className="paddock-heavy block text-[clamp(2.25rem,4vw,3.25rem)]">
                        one document
                    </span>{" "}
                    <span className={ASIDE_SERIF}>no conflicts</span>
                </h2>

                <div className="relative max-w-[28.75rem] rounded-paddock-card bg-paddock-sheet px-5 pt-6.5 pb-7 text-paddock-ink shadow-paddock-float sm:px-7">
                    <div className="mb-4.5 flex items-center justify-between gap-3">
                        <Tag tone="ink">Launch plan</Tag>
                        <AvatarStack people={DEMO_TRIO} ring="sheet" />
                    </div>
                    <p className="paddock-heavy m-0 mb-3.5 text-[1.375rem] leading-none">
                        Launch checklist
                        <CursorFlag person={DEMO_PEOPLE.ama} />
                    </p>
                    <ul className="m-0 list-none p-0 text-[0.96875rem]">
                        <li className="flex items-center gap-3 border-t border-paddock-rule py-2.25">
                            <span
                                aria-hidden="true"
                                className="size-4.5 shrink-0 rounded-[5px] bg-paddock-lime"
                            />
                            <span>
                                <CollaboratorHighlight
                                    person={DEMO_PEOPLE.ravi}
                                >
                                    Draft the release note
                                </CollaboratorHighlight>
                                <CursorFlag person={DEMO_PEOPLE.ravi} />
                            </span>
                        </li>
                        <li className="flex items-center gap-3 border-t border-paddock-rule py-2.25">
                            <span
                                aria-hidden="true"
                                className="size-4.5 shrink-0 rounded-[5px] border-[1.5px] border-paddock-ink"
                            />
                            <span>
                                Book the walkthrough for Thursday
                                <CursorFlag person={DEMO_PEOPLE.jonna} />
                            </span>
                        </li>
                    </ul>
                </div>

                <p className="relative m-0 max-w-[27.5rem] text-[0.90625rem] text-paddock-night-subtle">
                    Everyone keeps their own colour — on their cursor, their
                    messages and the cards assigned to them — so you always know
                    who did what.
                </p>
            </aside>
        </div>
    );
}
