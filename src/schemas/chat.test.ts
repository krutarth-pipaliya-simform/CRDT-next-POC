import {
    CHAT_ATTACHMENT_ACCEPT,
    CHAT_ATTACHMENT_MAX_BYTES,
    chatAttachmentExtension,
    chatAttachmentKind,
    chatAttachmentSchema,
    chatBroadcastSchema,
    chatReadReceiptSchema,
    getMessagesSchema,
    isChatImageType,
    markChatReadSchema,
    MESSAGE_MAX_LENGTH,
    sendMessageSchema,
} from "@/schemas/chat";

function file(name: string, size = 10) {
    return new File([new Uint8Array(size)], name);
}

describe("chat attachment helpers", () => {
    it("extracts a lower-case extension", () => {
        expect(chatAttachmentExtension("Photo.PNG")).toBe("png");
        expect(chatAttachmentExtension("archive.tar.gz")).toBe("gz");
        expect(chatAttachmentExtension("README")).toBe("");
    });

    it("maps extensions onto the allow-list", () => {
        expect(chatAttachmentKind("a.jpg")?.contentType).toBe("image/jpeg");
        expect(chatAttachmentKind("a.JPEG")?.signature).toBe("jpeg");
        expect(chatAttachmentKind("a.docx")?.signature).toBe("zip");
    });

    it.each(["x.svg", "x.html", "x.exe", "x.js", "noext"])(
        "refuses %s (script-capable or unknown)",
        (name) => {
            expect(chatAttachmentKind(name)).toBeNull();
        },
    );

    it("recognises image content types only", () => {
        expect(isChatImageType("image/png")).toBe(true);
        expect(isChatImageType("application/pdf")).toBe(false);
        expect(isChatImageType("image/svg+xml")).toBe(false);
    });

    it("builds the picker accept list from the allow-list", () => {
        expect(CHAT_ATTACHMENT_ACCEPT).toContain(".png");
        expect(CHAT_ATTACHMENT_ACCEPT).not.toContain(".svg");
    });
});

describe("chatAttachmentSchema", () => {
    it("accepts a normal file", () => {
        expect(chatAttachmentSchema.safeParse(file("a.pdf")).success).toBe(
            true,
        );
    });

    it("rejects non-files, empty files, oversize files, long names, bad types", () => {
        expect(chatAttachmentSchema.safeParse("a.pdf").success).toBe(false);
        expect(chatAttachmentSchema.safeParse(file("a.pdf", 0)).success).toBe(
            false,
        );
        expect(
            chatAttachmentSchema.safeParse(
                file("a.pdf", CHAT_ATTACHMENT_MAX_BYTES + 1),
            ).success,
        ).toBe(false);
        expect(
            chatAttachmentSchema.safeParse(file(`${"a".repeat(200)}.pdf`))
                .success,
        ).toBe(false);
        expect(chatAttachmentSchema.safeParse(file("a.exe")).success).toBe(
            false,
        );
    });

    it("accepts a file exactly at the size cap", () => {
        expect(
            chatAttachmentSchema.safeParse(
                file("a.zip", CHAT_ATTACHMENT_MAX_BYTES),
            ).success,
        ).toBe(true);
    });
});

describe("sendMessageSchema", () => {
    it("trims the body and defaults it to empty", () => {
        expect(
            sendMessageSchema.parse({ workspaceId: "w1", body: "  hi  " }).body,
        ).toBe("hi");
        expect(sendMessageSchema.parse({ workspaceId: "w1" }).body).toBe("");
    });

    it("caps the body length", () => {
        expect(
            sendMessageSchema.safeParse({
                workspaceId: "w1",
                body: "x".repeat(MESSAGE_MAX_LENGTH + 1),
            }).success,
        ).toBe(false);
    });

    it("requires a workspace and validates an optional file", () => {
        expect(sendMessageSchema.safeParse({ body: "hi" }).success).toBe(false);
        expect(
            sendMessageSchema.safeParse({
                workspaceId: "w1",
                file: file("a.exe"),
            }).success,
        ).toBe(false);
    });
});

describe("misc request schemas", () => {
    it("validates markChatRead and getMessages", () => {
        expect(
            markChatReadSchema.safeParse({ workspaceId: "w", messageId: "" })
                .success,
        ).toBe(false);
        expect(getMessagesSchema.safeParse({ workspaceId: "w" }).success).toBe(
            true,
        );
    });
});

describe("CRDT payload schemas", () => {
    const author = { id: "u1", name: "Ada", email: null, image: null };
    const base = {
        id: "m1",
        body: "hello",
        createdAt: "2026-01-01T00:00:00.000Z",
        author,
    };

    it("normalises a legacy entry without an attachment to null", () => {
        expect(chatBroadcastSchema.parse(base).attachment).toBeNull();
        expect(
            chatBroadcastSchema.parse({ ...base, attachment: null }).attachment,
        ).toBeNull();
    });

    it("accepts an attachment under the chat upload prefix", () => {
        const attachment = {
            url: "/api/uploads/chat/w1/a.png",
            name: "a.png",
            type: "image/png",
            size: 12,
        };
        expect(
            chatBroadcastSchema.parse({ ...base, attachment }).attachment,
        ).toEqual(attachment);
    });

    it("rejects attachment URLs outside the chat prefix (peer-supplied data)", () => {
        for (const url of [
            "https://evil.example/x.png",
            "javascript:alert(1)",
            "/api/uploads/avatars/u.png",
        ]) {
            expect(
                chatBroadcastSchema.safeParse({
                    ...base,
                    attachment: { url, name: "a", type: "image/png", size: 1 },
                }).success,
            ).toBe(false);
        }
    });

    it("rejects malformed timestamps and empty ids", () => {
        expect(
            chatBroadcastSchema.safeParse({ ...base, createdAt: "yesterday" })
                .success,
        ).toBe(false);
        expect(chatBroadcastSchema.safeParse({ ...base, id: "" }).success).toBe(
            false,
        );
    });

    it("parses read receipts", () => {
        expect(
            chatReadReceiptSchema.safeParse({
                user: author,
                lastReadAt: "2026-01-01T00:00:00.000Z",
            }).success,
        ).toBe(true);
        expect(
            chatReadReceiptSchema.safeParse({ user: author, lastReadAt: "x" })
                .success,
        ).toBe(false);
    });
});
