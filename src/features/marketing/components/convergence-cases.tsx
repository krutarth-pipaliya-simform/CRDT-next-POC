import { Columns3, FileText, MessageSquare } from "lucide-react";

import { DisplayHeading } from "@/components/paddock/display-heading";
import { NotchedCard } from "@/components/paddock/notched-card";
import {
    paddockPresenceVar,
    type PaddockPerson,
} from "@/components/paddock/paddock-presence";
import { Tag } from "@/components/paddock/tag";
import { DEMO_PEOPLE } from "@/features/marketing/lib/demo-people";

interface ConvergenceCase {
    surface: string;
    situation: string;
    outcome: string;
    /** The person on the other end of the conflict; their hue fills the face. */
    person: PaddockPerson;
    Icon: typeof FileText;
    /** The staggered top edge of the row, on wide screens only. */
    offset: string;
}

/**
 * What actually converges. Written as situations a team recognises rather than
 * as capabilities, because "real-time collaboration" is what every one of these
 * products says and none of them mean anything by.
 */
const CASES: ConvergenceCase[] = [
    {
        surface: "Documents",
        situation: "Two people rewrite the same paragraph.",
        outcome:
            "Both rewrites survive, in order, with each author's cursor visible the whole time.",
        person: DEMO_PEOPLE.ama,
        Icon: FileText,
        offset: "",
    },
    {
        surface: "Boards",
        situation: "Someone drags a card while you are dragging it.",
        outcome: "The card lands once. No phantom duplicate, no snap-back.",
        person: DEMO_PEOPLE.ravi,
        Icon: Columns3,
        offset: "lg:mt-[4.375rem]",
    },
    {
        surface: "Chat",
        situation: "You write three messages on a train with no signal.",
        outcome: "They arrive when you do, in the order you wrote them.",
        person: DEMO_PEOPLE.jonna,
        Icon: MessageSquare,
        offset: "lg:mt-[1.875rem]",
    },
];

/**
 * Pointers that can hover see the problem first and the answer on hover;
 * keyboard users get the same reveal on focus. Touch screens cannot hover, so
 * there the answer simply sits under the problem. Screen readers always hear
 * both, because the answer is only ever faded, never removed.
 */
const ANSWER_LAYER =
    "flex flex-col justify-end gap-3 bg-paddock-deep-card p-[1.875rem] " +
    "[@media(hover:hover)]:absolute [@media(hover:hover)]:inset-x-0 [@media(hover:hover)]:top-0 [@media(hover:hover)]:bottom-7 " +
    "[@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:transition-opacity motion-safe:duration-300";

export function ConvergenceCases() {
    return (
        <section
            aria-labelledby="convergence-cases-heading"
            className="paddock-deep px-4 py-20 sm:px-6 lg:py-[6.875rem]"
        >
            <DisplayHeading
                id="convergence-cases-heading"
                serif="The cases that usually"
                heavy="cost you an afternoon"
                surface="night"
                align="center"
            />
            <Tag
                as="p"
                tone="night-subtle"
                className="mt-6 text-center [@media(hover:none)]:hidden"
            >
                Hover a card to see what happens instead
            </Tag>

            <ul className="mx-auto mt-12 grid max-w-[28rem] list-none items-start gap-4 p-0 lg:mt-16 lg:max-w-[73.75rem] lg:grid-cols-3">
                {CASES.map(
                    ({ surface, situation, outcome, person, Icon, offset }) => (
                        <NotchedCard
                            key={surface}
                            as="li"
                            tone="deep"
                            tab={surface}
                            className={offset}
                            bodyClassName="p-0"
                        >
                            {/* Focusable so a keyboard can turn the card over
                                too. The ring is drawn inset, because the
                                notched clip would cut an outside ring away. */}
                            <div
                                tabIndex={0}
                                className="group relative flex min-h-[22.5rem] flex-col pb-7 focus-visible:outline-offset-[-6px]!"
                            >
                                <div className="flex flex-1 flex-col justify-between gap-8 p-[1.875rem]">
                                    <span
                                        aria-hidden="true"
                                        className="flex size-[5.75rem] items-center justify-center rounded-full text-paddock-on-fill motion-safe:transition-transform motion-safe:duration-600 group-hover:scale-108 group-hover:-rotate-4"
                                        style={{
                                            backgroundColor: paddockPresenceVar(
                                                person.id,
                                            ),
                                        }}
                                    >
                                        <Icon
                                            className="size-9"
                                            strokeWidth={1.8}
                                        />
                                    </span>
                                    <h3 className="paddock-heavy m-0 text-[clamp(1.5rem,2.6vw,1.875rem)] leading-[0.96]">
                                        {situation}
                                    </h3>
                                </div>
                                <div className={ANSWER_LAYER}>
                                    <span className="paddock-serif text-[2.5rem] leading-[0.9] text-paddock-lime">
                                        Instead
                                    </span>
                                    <p className="m-0 text-[1.0625rem] leading-normal">
                                        {outcome}
                                    </p>
                                </div>
                            </div>
                        </NotchedCard>
                    ),
                )}
            </ul>
        </section>
    );
}
