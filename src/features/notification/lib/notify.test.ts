import { notify } from "@/features/notification/lib/notify";
import { notificationBus } from "@/lib/notification-bus";
import { db, resetDb } from "@/test/mock-db";

jest.mock("@/lib/db", () => jest.requireActual("@/test/mock-db"));

const BASE = {
    type: "MENTION",
    title: "You were mentioned",
    workspaceId: "w1",
} as const;

function createdRow(recipientId: string) {
    return {
        id: `n-${recipientId}`,
        type: "MENTION",
        title: "You were mentioned",
        body: null,
        href: null,
        workspaceId: "w1",
        readAt: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        actorId: "actor",
        recipientId,
    };
}

beforeEach(() => {
    resetDb();
    jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
    jest.restoreAllMocks();
});

describe("notify", () => {
    it("notifies every workspace member except the excluded actor", async () => {
        db.workspaceMember.findMany.mockResolvedValue([
            { userId: "actor" },
            { userId: "u1" },
            { userId: "u2" },
            { userId: "u1" },
        ]);
        db.user.findUnique.mockResolvedValue({
            id: "actor",
            name: "A",
            email: null,
            image: null,
        });
        db.notification.createManyAndReturn.mockResolvedValue([
            createdRow("u1"),
            createdRow("u2"),
        ]);

        await notify({ ...BASE, actorId: "actor", excludeUserIds: ["actor"] });

        const data =
            db.notification.createManyAndReturn.mock.calls[0]?.[0].data;
        expect(
            data.map((row: { recipientId: string }) => row.recipientId),
        ).toEqual(["u1", "u2"]);
        expect(data[0]).toMatchObject({
            type: "MENTION",
            body: null,
            href: null,
            actorId: "actor",
        });
    });

    it("uses an explicit recipient list, de-duplicated and minus exclusions", async () => {
        db.notification.createManyAndReturn.mockResolvedValue([]);

        await notify({
            ...BASE,
            recipientIds: ["u1", "u1", "", "u2", "actor"],
            excludeUserIds: ["actor"],
        });

        expect(db.workspaceMember.findMany).not.toHaveBeenCalled();
        const data =
            db.notification.createManyAndReturn.mock.calls[0]?.[0].data;
        expect(
            data.map((row: { recipientId: string }) => row.recipientId),
        ).toEqual(["u1", "u2"]);
    });

    it("writes nothing when there is nobody to tell", async () => {
        await notify({
            ...BASE,
            recipientIds: ["actor"],
            excludeUserIds: ["actor"],
        });
        expect(db.notification.createManyAndReturn).not.toHaveBeenCalled();
    });

    it("publishes each created row to its recipient on the bus", async () => {
        const received: string[] = [];
        const off = notificationBus.subscribe("notify-u1", (payload) =>
            received.push(payload.id),
        );
        db.user.findUnique.mockResolvedValue(null);
        db.notification.createManyAndReturn.mockResolvedValue([
            createdRow("notify-u1"),
            createdRow("someone-else"),
        ]);

        await notify({ ...BASE, recipientIds: ["notify-u1", "someone-else"] });

        expect(received).toEqual(["n-notify-u1"]);
        off();
    });

    it("never fails the caller: errors are logged and swallowed", async () => {
        db.workspaceMember.findMany.mockRejectedValue(new Error("db down"));

        await expect(notify(BASE)).resolves.toBeUndefined();
        expect(console.error).toHaveBeenCalled();
    });
});
