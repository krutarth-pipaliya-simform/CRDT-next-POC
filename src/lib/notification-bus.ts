import type { NotificationPayload } from "@/features/notification/types";

import "server-only";

export type NotificationListener = (payload: NotificationPayload) => void;

/**
 * Process-local publish/subscribe hub backing the SSE notification stream.
 *
 * Notifications are persisted in PostgreSQL first; this bus only fans the freshly
 * written rows out to the `/api/notifications/stream` readers connected to *this*
 * Node process. It is deliberately in-memory (no Redis) for the POC — see the
 * "What was cut and why" section of the README for the horizontal-scaling caveat.
 */
class NotificationBus {
    private readonly listeners = new Map<string, Set<NotificationListener>>();

    subscribe(userId: string, listener: NotificationListener): () => void {
        const existing = this.listeners.get(userId);

        if (existing) {
            existing.add(listener);
        } else {
            this.listeners.set(userId, new Set([listener]));
        }

        return () => this.unsubscribe(userId, listener);
    }

    private unsubscribe(userId: string, listener: NotificationListener): void {
        const subscribers = this.listeners.get(userId);
        if (!subscribers) return;

        subscribers.delete(listener);
        if (subscribers.size === 0) {
            this.listeners.delete(userId);
        }
    }

    publish(userId: string, payload: NotificationPayload): void {
        const subscribers = this.listeners.get(userId);
        if (!subscribers) return;

        subscribers.forEach((listener) => {
            try {
                listener(payload);
            } catch (error) {
                console.error(
                    "[NotificationBus] Listener threw while dispatching:",
                    error,
                );
            }
        });
    }

    subscriberCount(userId: string): number {
        return this.listeners.get(userId)?.size ?? 0;
    }
}

// Survive Next.js dev-server hot reloads so open SSE connections keep their subscription
export const notificationBus: NotificationBus =
    globalThis.notificationBus ?? new NotificationBus();

if (process.env.NODE_ENV !== "production") {
    globalThis.notificationBus = notificationBus;
}

export type { NotificationBus };
