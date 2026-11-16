/**
 * @jest-environment jsdom
 */
import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { markAllNotificationsReadAction } from "@/features/notification/actions/mark-all-notifications-read";
import { markNotificationReadAction } from "@/features/notification/actions/mark-notification-read";
import {
    createNotificationStore,
    mergeNotifications,
    NOTIFICATION_STORE_LIMIT,
} from "@/features/notification/stores/notification-store";
import {
    notificationSignature,
    NotificationStoreProvider,
    useNotificationStore,
    useNotificationStoreApi,
} from "@/features/notification/stores/notification-store-provider";
import { makeNotificationPayload } from "@/test/factories";

jest.mock("@/features/notification/actions/mark-notification-read", () => ({
    markNotificationReadAction: jest.fn(),
}));
jest.mock(
    "@/features/notification/actions/mark-all-notifications-read",
    () => ({ markAllNotificationsReadAction: jest.fn() }),
);

const markOne = jest.mocked(markNotificationReadAction);
const markAll = jest.mocked(markAllNotificationsReadAction);

const n = (id: string, createdAt: string, extra = {}) =>
    makeNotificationPayload({ id, createdAt, ...extra });

describe("mergeNotifications", () => {
    it("sorts newest first and lets incoming rows replace base rows", () => {
        const merged = mergeNotifications(
            [n("a", "2026-01-01T00:00:00Z"), n("b", "2026-01-03T00:00:00Z")],
            [
                n("a", "2026-01-01T00:00:00Z", { readAt: "x" }),
                n("c", "2026-01-02T00:00:00Z"),
            ],
        );
        expect(merged.map((item) => item.id)).toEqual(["b", "c", "a"]);
        expect(merged.find((item) => item.id === "a")?.readAt).toBe("x");
    });

    it("caps the list at the limit", () => {
        const many = Array.from(
            { length: NOTIFICATION_STORE_LIMIT + 5 },
            (_, i) =>
                n(`id${i}`, `2026-01-01T00:00:${String(i).padStart(2, "0")}Z`),
        );
        expect(mergeNotifications([], many)).toHaveLength(
            NOTIFICATION_STORE_LIMIT,
        );
        expect(mergeNotifications([], many, 2)).toHaveLength(2);
    });

    it("keeps equal timestamps stable", () => {
        const merged = mergeNotifications(
            [],
            [n("a", "2026-01-01T00:00:00Z"), n("b", "2026-01-01T00:00:00Z")],
        );
        expect(merged).toHaveLength(2);
    });
});

describe("createNotificationStore", () => {
    const seed = () => ({
        notifications: [
            n("a", "2026-01-02T00:00:00Z", { workspaceId: "w1" }),
            n("b", "2026-01-01T00:00:00Z", { workspaceId: "w2" }),
        ],
        unreadCount: 2,
    });

    it("starts connecting, seeded and sorted", () => {
        const store = createNotificationStore(seed());
        expect(store.getState().status).toBe("connecting");
        expect(store.getState().unreadCount).toBe(2);
        expect(store.getState().notifications.map((x) => x.id)).toEqual([
            "a",
            "b",
        ]);
    });

    it("receive adds a new notification and counts it unread once", () => {
        const store = createNotificationStore(seed());
        const incoming = n("c", "2026-01-03T00:00:00Z");

        store.getState().receive(incoming);
        store.getState().receive(incoming);

        expect(store.getState().notifications[0]?.id).toBe("c");
        expect(store.getState().notifications).toHaveLength(3);
        expect(store.getState().unreadCount).toBe(3);
    });

    it("receive does not count an already-read notification", () => {
        const store = createNotificationStore(seed());
        store
            .getState()
            .receive(n("c", "2026-01-03T00:00:00Z", { readAt: "2026-01-03" }));
        expect(store.getState().unreadCount).toBe(2);
    });

    it("mergeFromServer adopts server rows, keeps stream rows, optionally the total", () => {
        const store = createNotificationStore(seed());
        store.getState().receive(n("stream", "2026-01-05T00:00:00Z"));

        store
            .getState()
            .mergeFromServer([n("a", "2026-01-02T00:00:00Z", { readAt: "r" })]);
        expect(store.getState().unreadCount).toBe(3);
        expect(store.getState().notifications.map((x) => x.id)).toContain(
            "stream",
        );

        store.getState().mergeFromServer([], 9);
        expect(store.getState().unreadCount).toBe(9);
    });

    it("setStatus updates the stream status", () => {
        const store = createNotificationStore(seed());
        store.getState().setStatus("live");
        expect(store.getState().status).toBe("live");
    });

    describe("markRead", () => {
        it("optimistically marks read, decrements, then adopts the server total", async () => {
            markOne.mockResolvedValue({
                success: true,
                data: { unreadCount: 7 },
            });
            const store = createNotificationStore(seed());

            const pending = store.getState().markRead("a");
            expect(
                store.getState().notifications.find((x) => x.id === "a")
                    ?.readAt,
            ).not.toBeNull();
            expect(store.getState().unreadCount).toBe(1);

            await pending;
            expect(markOne).toHaveBeenCalledWith({ notificationId: "a" });
            expect(store.getState().unreadCount).toBe(7);
        });

        it("does nothing server-side for an already-read row", async () => {
            const store = createNotificationStore({
                notifications: [
                    n("a", "2026-01-01T00:00:00Z", { readAt: "r" }),
                ],
                unreadCount: 0,
            });
            await store.getState().markRead("a");
            expect(markOne).not.toHaveBeenCalled();
            expect(store.getState().unreadCount).toBe(0);
        });

        it("never lets the count go negative and keeps the guess on failure", async () => {
            markOne.mockResolvedValue({ success: false, error: "nope" });
            const store = createNotificationStore({
                notifications: [n("a", "2026-01-01T00:00:00Z")],
                unreadCount: 0,
            });
            await store.getState().markRead("a");
            expect(store.getState().unreadCount).toBe(0);
        });
    });

    describe("markAllRead", () => {
        it("clears everything and zeroes the total", async () => {
            markAll.mockResolvedValue({
                success: true,
                data: { unreadCount: 0 },
            });
            const store = createNotificationStore(seed());

            await store.getState().markAllRead();

            expect(markAll).toHaveBeenCalledWith({});
            expect(
                store.getState().notifications.every((x) => x.readAt !== null),
            ).toBe(true);
            expect(store.getState().unreadCount).toBe(0);
        });

        it("clears one workspace and leaves the others unread", async () => {
            markAll.mockResolvedValue({
                success: true,
                data: { unreadCount: 1 },
            });
            const store = createNotificationStore(seed());

            const pending = store.getState().markAllRead("w1");
            expect(store.getState().unreadCount).toBe(1);
            const byId = Object.fromEntries(
                store.getState().notifications.map((x) => [x.id, x.readAt]),
            );
            expect(byId.a).not.toBeNull();
            expect(byId.b).toBeNull();

            await pending;
            expect(markAll).toHaveBeenCalledWith({ workspaceId: "w1" });
        });

        it("keeps the optimistic total when the server refuses", async () => {
            markAll.mockResolvedValue({ success: false, error: "x" });
            const store = createNotificationStore(seed());
            await store.getState().markAllRead();
            expect(store.getState().unreadCount).toBe(0);
        });
    });
});

describe("notificationSignature", () => {
    it("changes with the total, ids and read state", () => {
        const base = [n("a", "2026-01-01T00:00:00Z")];
        const sig = notificationSignature(base, 1);
        expect(notificationSignature(base, 2)).not.toBe(sig);
        expect(
            notificationSignature(
                [n("a", "2026-01-01T00:00:00Z", { readAt: "r" })],
                1,
            ),
        ).not.toBe(sig);
        expect(notificationSignature([...base], 1)).toBe(sig);
    });
});

describe("NotificationStoreProvider", () => {
    const first = [n("a", "2026-01-02T00:00:00Z")];

    function wrapperFor(initial: typeof first, unread: number) {
        return function Wrapper({ children }: { children: ReactNode }) {
            return (
                <NotificationStoreProvider
                    initialNotifications={initial}
                    initialUnreadCount={unread}
                >
                    {children}
                </NotificationStoreProvider>
            );
        };
    }

    it("exposes a selector hook over the seeded store", () => {
        const { result } = renderHook(
            () => useNotificationStore((s) => s.unreadCount),
            { wrapper: wrapperFor(first, 4) },
        );
        expect(result.current).toBe(4);
    });

    it("re-seeds only when the server sends something different", () => {
        function Probe() {
            const api = useNotificationStoreApi();
            const count = useNotificationStore((s) => s.unreadCount);
            return (
                <button onClick={() => api.setState({ unreadCount: 99 })}>
                    {count}
                </button>
            );
        }
        const tree = (items: typeof first, unread: number) => (
            <NotificationStoreProvider
                initialNotifications={items}
                initialUnreadCount={unread}
            >
                <Probe />
            </NotificationStoreProvider>
        );

        const { rerender } = render(tree(first, 1));
        act(() => screen.getByRole("button").click());
        expect(screen.getByRole("button")).toHaveTextContent("99");

        // Same content, new array identity: the optimistic value survives.
        rerender(tree([...first], 1));
        expect(screen.getByRole("button")).toHaveTextContent("99");

        // The server really changed: adopt its total.
        rerender(tree(first, 5));
        expect(screen.getByRole("button")).toHaveTextContent("5");
    });

    it("throws a clear error outside the provider", () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        expect(() =>
            renderHook(() => useNotificationStore((s) => s.status)),
        ).toThrow("useNotificationStore must be used within");
        spy.mockRestore();
    });
});
