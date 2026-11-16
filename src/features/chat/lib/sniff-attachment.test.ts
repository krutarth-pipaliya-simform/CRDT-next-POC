import { sniffAttachment } from "@/features/chat/lib/sniff-attachment";

const bytes = (...values: number[]) => Uint8Array.from(values);
const ascii = (text: string) => Uint8Array.from(text, (c) => c.charCodeAt(0));
const concat = (...parts: Uint8Array[]) =>
    Uint8Array.from(parts.flatMap((part) => Array.from(part)));

const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0);

describe("sniffAttachment", () => {
    it("accepts real signatures", () => {
        expect(sniffAttachment(PNG, "png")).toBe(true);
        expect(sniffAttachment(bytes(0xff, 0xd8, 0xff, 0xe0), "jpeg")).toBe(
            true,
        );
        expect(sniffAttachment(ascii("GIF89a...."), "gif")).toBe(true);
        expect(sniffAttachment(ascii("GIF87a...."), "gif")).toBe(true);
        expect(
            sniffAttachment(
                concat(ascii("RIFF"), bytes(1, 2, 3, 4), ascii("WEBPVP8 ")),
                "webp",
            ),
        ).toBe(true);
        expect(sniffAttachment(ascii("%PDF-1.7"), "pdf")).toBe(true);
        expect(sniffAttachment(bytes(0x50, 0x4b, 0x03, 0x04, 0), "zip")).toBe(
            true,
        );
        expect(sniffAttachment(bytes(0x50, 0x4b, 0x05, 0x06, 0), "zip")).toBe(
            true,
        );
    });

    it("rejects a file whose bytes do not match the claimed type", () => {
        // An executable renamed to .png
        expect(sniffAttachment(ascii("MZ\x90\x00"), "png")).toBe(false);
        expect(sniffAttachment(PNG, "jpeg")).toBe(false);
        expect(sniffAttachment(PNG, "pdf")).toBe(false);
        expect(sniffAttachment(ascii("GIF90a"), "gif")).toBe(false);
        expect(sniffAttachment(ascii("RIFF\0\0\0\0WAVE"), "webp")).toBe(false);
        expect(sniffAttachment(ascii("<html>"), "zip")).toBe(false);
    });

    it("rejects data shorter than the signature", () => {
        expect(sniffAttachment(bytes(0x89, 0x50), "png")).toBe(false);
        expect(sniffAttachment(new Uint8Array(), "pdf")).toBe(false);
        expect(sniffAttachment(ascii("RIFF"), "webp")).toBe(false);
    });

    describe("text", () => {
        it("accepts UTF-8 text, including multi-byte characters", () => {
            expect(sniffAttachment(ascii("plain,csv\n1,2"), "text")).toBe(true);
            expect(
                sniffAttachment(
                    new TextEncoder().encode("héllo – 日本語"),
                    "text",
                ),
            ).toBe(true);
            expect(sniffAttachment(new Uint8Array(), "text")).toBe(true);
        });

        it("rejects NUL bytes and invalid UTF-8 (binary posing as text)", () => {
            expect(sniffAttachment(bytes(0x41, 0x00, 0x42), "text")).toBe(
                false,
            );
            expect(sniffAttachment(bytes(0xff, 0xfe, 0xfd), "text")).toBe(
                false,
            );
        });

        it("tolerates a multi-byte character cut off at the sample edge", () => {
            // 64 KiB sample boundary falls inside a 3-byte character.
            const filler = new Uint8Array(64 * 1024 - 1).fill(0x61);
            const data = concat(filler, new TextEncoder().encode("日"));
            expect(sniffAttachment(data, "text")).toBe(true);
        });
    });
});
