import {
    toChatBroadcast,
    type ChatMessageRow,
} from "@/features/chat/lib/message-select";

const author = { id: "u1", name: "Ada", email: "a@b.co", image: null };

function row(overrides: Partial<ChatMessageRow> = {}): ChatMessageRow {
    return {
        id: "m1",
        body: "hello",
        createdAt: new Date("2026-01-02T03:04:05.000Z"),
        attachmentUrl: null,
        attachmentName: null,
        attachmentType: null,
        attachmentSize: null,
        author,
        ...overrides,
    };
}

describe("toChatBroadcast", () => {
    it("serialises a plain message", () => {
        expect(toChatBroadcast(row())).toEqual({
            id: "m1",
            body: "hello",
            createdAt: "2026-01-02T03:04:05.000Z",
            author,
            attachment: null,
        });
    });

    it("includes the attachment when all four columns are set", () => {
        expect(
            toChatBroadcast(
                row({
                    attachmentUrl: "/api/uploads/chat/w/a.png",
                    attachmentName: "a.png",
                    attachmentType: "image/png",
                    attachmentSize: 12,
                }),
            ).attachment,
        ).toEqual({
            url: "/api/uploads/chat/w/a.png",
            name: "a.png",
            type: "image/png",
            size: 12,
        });
    });

    it("drops a half-written attachment rather than sending partial data", () => {
        expect(
            toChatBroadcast(row({ attachmentUrl: "/api/uploads/chat/w/a.png" }))
                .attachment,
        ).toBeNull();
    });

    it("keeps a zero-byte size distinct from a missing one", () => {
        expect(
            toChatBroadcast(
                row({
                    attachmentUrl: "/u",
                    attachmentName: "n",
                    attachmentType: "t",
                    attachmentSize: 0,
                }),
            ).attachment?.size,
        ).toBe(0);
    });
});
