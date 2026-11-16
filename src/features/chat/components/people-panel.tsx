"use client";

import { DisplayHeading } from "@/components/paddock/display-heading";
import { PaddockAvatar } from "@/components/paddock/paddock-avatar";
import { cn } from "@/lib/cn";

import type { ChatPresenceUser } from "../types";

export interface PeoplePanelProps {
    participants: ChatPresenceUser[];
    className?: string;
}

/**
 * Who is in the chat right now, with a word on what each is doing. Set on a
 * night ground, which stays dark in both themes, so the serif half may be lime.
 */
export function PeoplePanel({ participants, className }: PeoplePanelProps) {
    return (
        <aside
            aria-label="People in this chat"
            className={cn(
                "min-h-0 w-[18.75rem] shrink-0 flex-col gap-4 overflow-y-auto overscroll-contain",
                className,
            )}
        >
            <section className="paddock-night rounded-paddock-panel p-5.5">
                <DisplayHeading
                    as="h2"
                    size="sm"
                    surface="night"
                    serif="Here"
                    heavy="now"
                    className="mb-4"
                />
                {participants.length > 0 ? (
                    <ul className="m-0 flex list-none flex-col gap-3 p-0">
                        {participants.map((participant) => (
                            <li
                                key={participant.id}
                                className="flex items-center gap-3"
                            >
                                <PaddockAvatar
                                    person={{
                                        id: participant.id,
                                        name: participant.name,
                                        image: participant.avatarUrl,
                                    }}
                                    size="md"
                                    decorative
                                />
                                <div className="min-w-0">
                                    <p className="m-0 truncate text-[0.90625rem] font-bold">
                                        {participant.name}
                                        {participant.isSelf ? " (you)" : ""}
                                    </p>
                                    <p className="m-0 text-[0.8125rem] text-paddock-night-subtle">
                                        {participant.isTyping
                                            ? "Typing in chat…"
                                            : "Here"}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="m-0 text-sm text-paddock-night-subtle">
                        Connecting…
                    </p>
                )}
            </section>
        </aside>
    );
}
