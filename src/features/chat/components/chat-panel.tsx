"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DisplayHeading } from "@/components/paddock/display-heading";

import { useWorkspaceChat } from "../hooks/use-workspace-chat";
import type { ChatMessage, ChatReadReceipt } from "../types";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";
import { PeoplePanel } from "./people-panel";
import { PresenceList } from "./presence-list";
import { TypingIndicator } from "./typing-indicator";

export interface ChatPanelProps {
    workspaceId: string;
    workspaceName: string;
    initialMessages: ChatMessage[];
    initialReadReceipts: ChatReadReceipt[];
    currentUser: {
        id: string;
        name: string;
        email?: string | null;
        image?: string | null;
    };
    canPost: boolean;
}

/**
 * Size the chat to the viewport left under the shell, so the page itself never
 * scrolls and only the message log does. The CSS height is a close first
 * guess; this corrects it for the real offset (the section tabs wrap on narrow
 * screens) by writing the style directly, outside React's render, so it can
 * never disagree with the server's markup.
 */
function useFillViewport() {
    const frameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;

        const fit = () => {
            const top = frame.getBoundingClientRect().top + window.scrollY;
            const parent = frame.parentElement;
            const bottomGap = parent
                ? Number.parseFloat(getComputedStyle(parent).paddingBottom) || 0
                : 0;
            frame.style.height = `${Math.max(window.innerHeight - top - bottomGap, 0)}px`;
        };

        fit();
        window.addEventListener("resize", fit);
        // Web fonts change the tab widths, and so whether the tabs wrap.
        void document.fonts?.ready.then(fit);

        return () => window.removeEventListener("resize", fit);
    }, []);

    return frameRef;
}

export function ChatPanel({
    workspaceId,
    workspaceName,
    initialMessages,
    initialReadReceipts,
    currentUser,
    canPost,
}: ChatPanelProps) {
    const frameRef = useFillViewport();
    // The log opens scrolled to the newest message
    const [isViewingLatest, setIsViewingLatest] = useState(true);
    const {
        messages,
        participants,
        typingUsers,
        connectionStatus,
        seenBy,
        sendMessage,
        notifyTyping,
        retryMessage,
    } = useWorkspaceChat({
        workspaceId,
        initialMessages,
        currentUser,
        canPost,
        initialReadReceipts,
        isViewingLatest,
    });

    const handleSend = useCallback(
        (body: string, file: File | null) => {
            void sendMessage(body, file);
        },
        [sendMessage],
    );

    const handleRetry = useCallback(
        (messageId: string) => {
            void retryMessage(messageId);
        },
        [retryMessage],
    );

    return (
        <div
            ref={frameRef}
            className="flex h-[calc(100dvh-11rem)] min-h-[26rem] gap-4"
        >
            <section
                data-testid="chat-panel"
                aria-label="Workspace chat"
                className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-paddock-panel border border-paddock-rule bg-paddock-sheet"
            >
                <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b border-paddock-rule px-4 py-3.5 sm:px-5">
                    <div className="min-w-0">
                        <DisplayHeading
                            as="h1"
                            layout="inline"
                            size="sm"
                            serif="Everyone in"
                            heavy={workspaceName}
                        />
                        <p className="m-0 mt-1.5 text-[0.8125rem] text-paddock-subtle">
                            Messages send even when you are offline, and catch
                            up the moment you reconnect.
                        </p>
                    </div>

                    <PresenceList
                        participants={participants}
                        connectionStatus={connectionStatus}
                    />
                </header>

                <MessageList
                    messages={messages}
                    currentUserId={currentUser.id}
                    seenBy={seenBy}
                    onRetry={handleRetry}
                    onViewingLatestChange={setIsViewingLatest}
                />

                <div className="shrink-0 px-4 pb-4 sm:px-5">
                    <TypingIndicator typingUsers={typingUsers} />

                    {canPost ? (
                        <MessageComposer
                            onSend={handleSend}
                            onTyping={notifyTyping}
                        />
                    ) : (
                        <p className="m-0 rounded-xl border-[1.5px] border-dashed border-paddock-ink px-4 py-3.5 text-sm text-paddock-subtle">
                            You are viewing this workspace as a guest. Join the
                            workspace to post messages.
                        </p>
                    )}
                </div>
            </section>

            <PeoplePanel
                participants={participants}
                className="hidden lg:flex"
            />
        </div>
    );
}
