import { auth } from "@/features/auth/lib/auth";
import type { NotificationPayload } from "@/features/notification/types";
import { notificationBus } from "@/lib/notification-bus";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
// Long-lived stream: opt out of the platform's default invocation ceiling where supported
export const maxDuration = 300;

/** Comment frame interval that keeps proxies from closing an idle stream. */
const HEARTBEAT_INTERVAL_MS = 25_000;

function formatEvent(event: string, data: unknown): string {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Server-Sent Events stream delivering this user's notifications in real time.
 *
 * The stream is per-user: the recipient is taken from the session, never from the
 * request, so a client cannot subscribe to somebody else's notifications.
 */
export async function GET(request: Request): Promise<Response> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            let closed = false;

            const send = (chunk: string) => {
                if (closed) return;
                try {
                    controller.enqueue(encoder.encode(chunk));
                } catch {
                    // Controller already torn down by an aborted request; stop writing
                    closed = true;
                }
            };

            const unsubscribe = notificationBus.subscribe(
                userId,
                (payload: NotificationPayload) => {
                    send(formatEvent("notification", payload));
                },
            );

            const heartbeat = setInterval(() => {
                send(`: heartbeat ${Date.now()}\n\n`);
            }, HEARTBEAT_INTERVAL_MS);

            const cleanup = () => {
                if (closed) return;
                closed = true;
                clearInterval(heartbeat);
                unsubscribe();
                try {
                    controller.close();
                } catch {
                    // Already closed by the runtime
                }
            };

            request.signal.addEventListener("abort", cleanup);

            // Flush an opening frame so EventSource fires `open` without waiting for traffic
            send(
                formatEvent("ready", { userId, at: new Date().toISOString() }),
            );

            if (request.signal.aborted) {
                cleanup();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            // Disable proxy buffering (nginx and friends) so events are not batched
            "X-Accel-Buffering": "no",
        },
    });
}
