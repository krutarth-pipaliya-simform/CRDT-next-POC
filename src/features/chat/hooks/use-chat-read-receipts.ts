"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as Y from "yjs";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { chatReadReceiptSchema } from "@/schemas/chat";

import { markChatReadAction } from "../actions/mark-chat-read";
import {
    READ_RECEIPT_DEBOUNCE_MS,
    type ChatAuthor,
    type ChatMessage,
    type ChatReadReceipt,
} from "../types";

const RECEIPTS_KEY = "receipts";

export interface UseChatReadReceiptsOptions {
    ydoc: Y.Doc;
    workspaceId: string;
    currentUserId: string;
    /** Guests read without writing a cursor, as they leave no presence either. */
    canWrite: boolean;
    messages: ChatMessage[];
    initialReceipts: ChatReadReceipt[];
    /** The reader is scrolled to the newest message. */
    isViewingLatest: boolean;
}

function time(value: string): number {
    return new Date(value).getTime();
}

/** Keeps whichever of two receipts for one person reaches further. */
function mergeReceipt(
    receipts: ReadonlyMap<string, ChatReadReceipt>,
    receipt: ChatReadReceipt,
): ReadonlyMap<string, ChatReadReceipt> {
    const existing = receipts.get(receipt.user.id);
    if (existing && time(existing.lastReadAt) >= time(receipt.lastReadAt)) {
        return receipts;
    }

    const next = new Map(receipts);
    next.set(receipt.user.id, receipt);
    return next;
}

/**
 * Read receipts for the workspace channel.
 *
 * PostgreSQL holds each member's `ChatReadCursor`; the page seeds them. When
 * the reader is on a visible tab and scrolled to the newest message, the
 * cursor is moved forward by a Server Action and the persisted result is
 * written to the room's shared `Y.Map` under the reader's id, which is how
 * every other connected client moves its "Seen by" marker live.
 */
export function useChatReadReceipts({
    ydoc,
    workspaceId,
    currentUserId,
    canWrite,
    messages,
    initialReceipts,
    isViewingLatest,
}: UseChatReadReceiptsOptions): ReadonlyMap<string, ChatAuthor[]> {
    const [receipts, setReceipts] = useState<
        ReadonlyMap<string, ChatReadReceipt>
    >(() =>
        initialReceipts.reduce<ReadonlyMap<string, ChatReadReceipt>>(
            mergeReceipt,
            new Map(),
        ),
    );
    const lastRequestedRef = useRef<string | null>(null);

    // Live receipts from other clients
    useEffect(() => {
        const yReceipts = ydoc.getMap<unknown>(RECEIPTS_KEY);

        const syncFromDoc = () => {
            const incoming: ChatReadReceipt[] = [];
            yReceipts.forEach((value) => {
                const parsed = chatReadReceiptSchema.safeParse(value);
                if (parsed.success) incoming.push(parsed.data);
            });
            if (incoming.length === 0) return;

            setReceipts((previous) => incoming.reduce(mergeReceipt, previous));
        };

        syncFromDoc();
        yReceipts.observe(syncFromDoc);
        return () => yReceipts.unobserve(syncFromDoc);
    }, [ydoc]);

    const markRead = useCallback(
        async (messageId: string) => {
            const result = await markChatReadAction({ workspaceId, messageId });
            if (!result.success) {
                console.warn("[Chat] Read receipt not recorded:", result.error);
                return;
            }

            setReceipts((previous) => mergeReceipt(previous, result.data));
            ydoc.getMap<unknown>(RECEIPTS_KEY).set(
                result.data.user.id,
                result.data,
            );
        },
        [workspaceId, ydoc],
    );

    const debouncedMarkRead = useDebouncedCallback(
        (messageId: string) => void markRead(messageId),
        READ_RECEIPT_DEBOUNCE_MS,
        { flushOnUnmount: true },
    );

    const latest = useMemo(() => {
        for (let index = messages.length - 1; index >= 0; index -= 1) {
            if (messages[index].deliveryState === "sent")
                return messages[index];
        }
        return null;
    }, [messages]);

    const ownReadAt = receipts.get(currentUserId)?.lastReadAt ?? null;

    useEffect(() => {
        if (!canWrite || !latest || !isViewingLatest) return;
        if (ownReadAt && time(ownReadAt) >= time(latest.createdAt)) return;

        const attempt = () => {
            if (document.visibilityState !== "visible") return;
            if (lastRequestedRef.current === latest.id) return;

            lastRequestedRef.current = latest.id;
            debouncedMarkRead.schedule(latest.id);
        };

        attempt();
        document.addEventListener("visibilitychange", attempt);
        return () => document.removeEventListener("visibilitychange", attempt);
    }, [canWrite, latest, isViewingLatest, ownReadAt, debouncedMarkRead]);

    return useMemo(() => {
        const sent = messages.filter(
            (message) => message.deliveryState === "sent",
        );
        const seenBy = new Map<string, ChatAuthor[]>();

        receipts.forEach((receipt) => {
            // Never show readers their own receipt
            if (receipt.user.id === currentUserId) return;

            const readAt = time(receipt.lastReadAt);
            let reached: ChatMessage | null = null;
            for (let index = sent.length - 1; index >= 0; index -= 1) {
                if (time(sent[index].createdAt) <= readAt) {
                    reached = sent[index];
                    break;
                }
            }

            // An author has obviously seen their own message
            if (!reached || reached.author.id === receipt.user.id) return;

            const readers = seenBy.get(reached.id) ?? [];
            readers.push(receipt.user);
            seenBy.set(reached.id, readers);
        });

        seenBy.forEach((readers) =>
            readers.sort((a, b) =>
                (a.name ?? a.email ?? "").localeCompare(
                    b.name ?? b.email ?? "",
                ),
            ),
        );
        return seenBy;
    }, [messages, receipts, currentUserId]);
}
