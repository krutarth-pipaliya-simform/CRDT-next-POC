"use client";

import { useRef, useState, type ReactNode } from "react";
import { AtSign, Bold, Italic, Link2 } from "lucide-react";

import { AvatarStack } from "@/components/paddock/paddock-avatar";
import { ChatComposer, ComposerTool } from "@/components/paddock/chat-composer";
import { ChatMessage, Mention } from "@/components/paddock/chat-message";
import { DisplayHeading } from "@/components/paddock/display-heading";
import type { PaddockPerson } from "@/components/paddock/paddock-presence";
import { Tag } from "@/components/paddock/tag";
import {
    DEMO_PEOPLE,
    DEMO_TEAM,
} from "@/features/design-system/lib/paddock-demo-data";
import { formatClockTime } from "@/lib/format-time";

interface DemoMessage {
    id: string;
    author: PaddockPerson;
    body: ReactNode;
    time: string;
    dateTime: string;
    failed?: boolean;
}

/**
 * Seeded with fixed times rather than `new Date()`, so the server and the
 * hydrating client render the same strings.
 */
const SEED: DemoMessage[] = [
    {
        id: "m1",
        author: DEMO_PEOPLE.maya,
        body: "Pushed the new pricing copy into the launch plan.",
        time: "09:12",
        dateTime: "2026-10-23T09:12:00Z",
    },
    {
        id: "m2",
        author: DEMO_PEOPLE.maya,
        body: "Theo, can you check the annual toggle wording?",
        time: "09:12",
        dateTime: "2026-10-23T09:12:30Z",
    },
    {
        id: "m3",
        author: DEMO_PEOPLE.theo,
        body: "On it. The drag fix for iPad split view is in review too.",
        time: "09:15",
        dateTime: "2026-10-23T09:15:00Z",
    },
    {
        id: "m4",
        author: DEMO_PEOPLE.priya,
        body: (
            <>
                <Mention person={DEMO_PEOPLE.sam} /> the pricing copy is
                approved, it goes live behind a flag.
            </>
        ),
        time: "09:21",
        dateTime: "2026-10-23T09:21:00Z",
    },
    {
        id: "m5",
        author: DEMO_PEOPLE.sam,
        body: "Walkthrough booked for Thursday.",
        time: "09:24",
        dateTime: "2026-10-23T09:24:00Z",
        failed: true,
    },
];

/**
 * The full-height chat pattern: header, a scrolling log that sticks to the
 * bottom, and the composer pinned under it. Sending appends a message as you;
 * the failed message retries in place.
 */
export function ChatDemo() {
    const [messages, setMessages] = useState<DemoMessage[]>(SEED);
    const logRef = useRef<HTMLDivElement>(null);

    function scrollToLatest() {
        requestAnimationFrame(() => {
            const log = logRef.current;
            if (log) log.scrollTop = log.scrollHeight;
        });
    }

    function send(text: string) {
        const now = new Date();
        setMessages((current) => [
            ...current,
            {
                id: `local-${now.getTime()}`,
                author: DEMO_PEOPLE.sam,
                body: text,
                time: formatClockTime(now),
                dateTime: now.toISOString(),
            },
        ]);
        scrollToLatest();
    }

    function retry(id: string) {
        setMessages((current) =>
            current.map((message) =>
                message.id === id ? { ...message, failed: false } : message,
            ),
        );
    }

    return (
        <section
            aria-label="Workspace chat demo"
            className="flex h-[36rem] min-h-0 flex-col overflow-hidden rounded-paddock-panel border border-paddock-rule bg-paddock-sheet"
        >
            <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b border-paddock-rule px-5 py-3.5">
                <DisplayHeading
                    as="p"
                    layout="inline"
                    size="sm"
                    serif="Everyone in"
                    heavy="Halden Studio"
                />
                <span className="flex items-center gap-3">
                    <AvatarStack people={DEMO_TEAM} ring="sheet" />
                    <Tag tone="ink">4 here</Tag>
                </span>
            </header>
            <div
                ref={logRef}
                role="log"
                aria-label="Messages"
                tabIndex={0}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5"
            >
                <div className="flex min-h-full flex-col justify-end py-2">
                    {messages.map((message, index) => {
                        const previous = messages[index - 1];
                        return (
                            <ChatMessage
                                key={message.id}
                                author={message.author}
                                time={message.time}
                                dateTime={message.dateTime}
                                first={
                                    previous?.author.id !== message.author.id
                                }
                                failed={message.failed}
                                onRetry={() => retry(message.id)}
                            >
                                {message.body}
                            </ChatMessage>
                        );
                    })}
                </div>
            </div>
            <div className="shrink-0 px-5 pb-4">
                <p
                    aria-live="polite"
                    className="m-0 flex h-6.5 items-center gap-2.5 pl-1 text-[0.78125rem] text-paddock-subtle"
                >
                    Theo is typing
                </p>
                <ChatComposer
                    label="Message everyone in Halden Studio"
                    placeholder="Message everyone — use @ to mention a teammate"
                    onSend={send}
                    tools={
                        <>
                            <ComposerTool label="Mention a teammate">
                                <AtSign className="size-4.5" />
                            </ComposerTool>
                            <ComposerTool label="Bold">
                                <Bold className="size-4.5" />
                            </ComposerTool>
                            <ComposerTool label="Italic">
                                <Italic className="size-4.5" />
                            </ComposerTool>
                            <ComposerTool label="Link to a document or task">
                                <Link2 className="size-4.5" />
                            </ComposerTool>
                        </>
                    }
                />
            </div>
        </section>
    );
}
