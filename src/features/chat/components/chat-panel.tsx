"use client";

import { useCallback } from "react";

import { Alert } from "@/components/ui/alert";

import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";
import { PresenceList } from "./presence-list";
import { TypingIndicator } from "./typing-indicator";
import { useWorkspaceChat } from "../hooks/use-workspace-chat";
import type { ChatMessage } from "../types";

export interface ChatPanelProps {
    workspaceId: string;
    workspaceName: string;
    initialMessages: ChatMessage[];
    currentUser: {
        id: string;
        name: string;
        email?: string | null;
        image?: string | null;
    };
    canPost: boolean;
}

export function ChatPanel({
    workspaceId,
    workspaceName,
    initialMessages,
    currentUser,
    canPost,
}: ChatPanelProps) {
    const {
        messages,
        participants,
        typingUsers,
        connectionStatus,
        sendMessage,
        notifyTyping,
        retryMessage,
    } = useWorkspaceChat({
        workspaceId,
        initialMessages,
        currentUser,
        canPost,
    });

    const handleSend = useCallback(
        (body: string) => {
            void sendMessage(body);
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
            data-testid="chat-panel"
            className="flex flex-col h-[calc(100vh-20rem)] min-h-[28rem] border-2 border-brand-ink rounded-brand bg-brand-surface shadow-brand-card overflow-hidden"
        >
            <header className="flex items-center justify-between gap-4 px-4 py-3 border-b-2 border-brand-muted bg-brand-muted/30">
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-brand-ink truncate">
                        #general
                    </h2>
                    <p className="font-brand-mono text-[10px] uppercase tracking-widest text-brand-subtle truncate">
                        {workspaceName}
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
                onRetry={handleRetry}
            />

            <TypingIndicator typingUsers={typingUsers} />

            {canPost ? (
                <MessageComposer onSend={handleSend} onTyping={notifyTyping} />
            ) : (
                <div className="border-t-2 border-brand-muted p-3">
                    <Alert intent="muted">
                        You are viewing this workspace as a guest. Join the
                        workspace to post messages.
                    </Alert>
                </div>
            )}
        </div>
    );
}
