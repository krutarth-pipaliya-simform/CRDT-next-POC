import {
    markAllNotificationsReadSchema,
    markNotificationReadSchema,
    notificationPayloadSchema,
    notificationTypeSchema,
} from "@/schemas/notification";
import { makeNotificationPayload } from "@/test/factories";

describe("notification schemas", () => {
    it("requires a notification id to mark one read", () => {
        expect(
            markNotificationReadSchema.safeParse({ notificationId: "" })
                .success,
        ).toBe(false);
        expect(
            markNotificationReadSchema.safeParse({ notificationId: "n1" })
                .success,
        ).toBe(true);
    });

    it("allows marking all read with or without a workspace", () => {
        expect(markAllNotificationsReadSchema.safeParse({}).success).toBe(true);
        expect(
            markAllNotificationsReadSchema.safeParse({ workspaceId: "" })
                .success,
        ).toBe(false);
    });

    it("accepts the known types only", () => {
        expect(notificationTypeSchema.safeParse("MENTION").success).toBe(true);
        expect(notificationTypeSchema.safeParse("SPAM").success).toBe(false);
    });

    it("validates the SSE wire payload", () => {
        expect(
            notificationPayloadSchema.safeParse(makeNotificationPayload())
                .success,
        ).toBe(true);
        expect(
            notificationPayloadSchema.safeParse({
                ...makeNotificationPayload(),
                actor: { id: "u1" },
            }).success,
        ).toBe(false);
        expect(notificationPayloadSchema.safeParse({ id: "x" }).success).toBe(
            false,
        );
    });
});
