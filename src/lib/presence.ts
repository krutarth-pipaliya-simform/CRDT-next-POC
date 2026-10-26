/**
 * Presence colour — the one saturated colour system in the product.
 *
 * The design rule: a saturated hue always means *a person*. The eight presence
 * hues below are warm/earth/jewel tones and deliberately contain no blue,
 * because blue is reserved for the system itself (focus, selection, links). A
 * viewer can therefore never confuse "someone is here" with "the UI is talking
 * to me".
 *
 * Two representations of the same slot:
 *
 * - `presenceVar()`   — a CSS variable reference, for anything the browser
 *                       paints. Flips with the theme automatically, which is
 *                       why UI code must use this and never a literal.
 * - `getUserColor()`  — a literal mid-tone hex, used *only* for CRDT awareness.
 *                       Awareness state is shared between clients, so the value
 *                       has to be theme-independent: a peer on a dark screen
 *                       renders the hex a peer on a light screen broadcast.
 */

export const PRESENCE_SLOT_COUNT = 8;

/**
 * Mid-tone literals broadcast over Yjs awareness. These sit between the light
 * and dark token values so a caret drawn with one stays legible on either
 * ground, no matter which theme the peer who sent it was using.
 */
const PRESENCE_WIRE_COLORS = [
    "#e05247", // crimson
    "#db6a2a", // rust
    "#c08a16", // ochre
    "#93a31f", // olive
    "#2e9d5f", // green
    "#1795ab", // teal
    "#8b5fe0", // violet
    "#d4488c", // magenta
] as const;

/**
 * Maps a user id onto a stable presence slot. The same person keeps the same
 * hue across every surface and every session, which is the whole point — the
 * colour has to be learnable.
 *
 * `slotCount` defaults to the eight product hues. The Paddock showcase passes
 * its own, smaller palette size so both systems share one hash.
 */
export function getPresenceSlot(
    userId: string,
    slotCount: number = PRESENCE_SLOT_COUNT,
): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash << 5) - hash + userId.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % slotCount;
}

/** Theme-aware CSS variable for a person's hue. Use this for anything painted. */
export function presenceVar(userId: string): string {
    return `var(--color-brand-presence-${getPresenceSlot(userId) + 1})`;
}

/**
 * Theme-independent literal for CRDT awareness payloads only. UI code wanting a
 * person's colour wants {@link presenceVar} instead.
 */
export function getUserColor(userId: string): string {
    return (
        PRESENCE_WIRE_COLORS[getPresenceSlot(userId)] ?? PRESENCE_WIRE_COLORS[0]
    );
}
