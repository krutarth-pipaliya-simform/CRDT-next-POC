import {
    CHAT_BROADCAST_LIMIT,
    CHAT_HISTORY_LIMIT,
    READ_RECEIPT_DEBOUNCE_MS,
    TYPING_THROTTLE_MS,
    TYPING_TIMEOUT_MS,
} from "@/features/chat/types";

describe("chat timing and size constants", () => {
    it("throttles typing awareness well inside the typing timeout", () => {
        // A peer must still read as "typing" between two throttled writes.
        expect(TYPING_THROTTLE_MS).toBeLessThan(TYPING_TIMEOUT_MS);
    });

    it("keeps the CRDT replay at least as large as the page of history", () => {
        expect(CHAT_BROADCAST_LIMIT).toBeGreaterThanOrEqual(CHAT_HISTORY_LIMIT);
    });

    it("debounces read receipts for under a second", () => {
        expect(READ_RECEIPT_DEBOUNCE_MS).toBeLessThan(1000);
    });
});
