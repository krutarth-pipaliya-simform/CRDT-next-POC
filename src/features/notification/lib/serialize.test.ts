import { toNotificationPayload } from "@/features/notification/lib/serialize";
import type { NotificationItem } from "@/features/notification/types";

const base: NotificationItem = {
    id: "n1",
    type: "MENTION",
    title: "t",
    body: "b",
    href: "/w1",
    workspaceId: "w1",
    readAt: null,
    createdAt: new Date("2026-01-02T03:04:05.000Z"),
    actor: null,
};

describe("toNotificationPayload", () => {
    it("serialises dates to ISO strings and a null readAt", () => {
        const payload = toNotificationPayload(base);
        expect(payload.createdAt).toBe("2026-01-02T03:04:05.000Z");
        expect(payload.readAt).toBeNull();
        expect(payload.actor).toBeNull();
    });

    it("serialises a read date", () => {
        const payload = toNotificationPayload({
            ...base,
            readAt: new Date("2026-02-01T00:00:00.000Z"),
        });
        expect(payload.readAt).toBe("2026-02-01T00:00:00.000Z");
    });

    it("copies only the public actor fields", () => {
        const payload = toNotificationPayload({
            ...base,
            actor: {
                id: "u1",
                name: "Ada",
                email: "a@b.co",
                image: null,
            },
        });
        expect(payload.actor).toEqual({
            id: "u1",
            name: "Ada",
            email: "a@b.co",
            image: null,
        });
        expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
    });
});
