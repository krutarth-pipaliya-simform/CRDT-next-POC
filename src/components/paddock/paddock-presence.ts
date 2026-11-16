import { getPresenceSlot } from "@/lib/presence";

/**
 * People colours for Paddock: coral, amber, cyan and violet.
 *
 * Like the product's presence hues, they are assigned by a hash of the user id
 * and never picked by hand, so one person keeps one colour across surfaces.
 * Four hues collide sooner than eight; that, and cyan sitting close to the
 * product's system blue, are recorded as open decisions in AGENTS.md.
 */
export const PADDOCK_PRESENCE_SLOT_COUNT = 4;

export interface PaddockPerson {
    id: string;
    name: string;
    /** An uploaded photo. Without one the avatar is the person's own hue. */
    image?: string | null;
}

function paddockSlot(userId: string): number {
    return getPresenceSlot(userId, PADDOCK_PRESENCE_SLOT_COUNT) + 1;
}

/** Fill for an avatar, a name flag or a rail. Always paired with `on-fill` text. */
export function paddockPresenceVar(userId: string): string {
    return `var(--color-paddock-presence-${paddockSlot(userId)})`;
}

/** The darker step used for a 2px caret, which needs more weight to read. */
export function paddockCaretVar(userId: string): string {
    return `var(--color-paddock-caret-${paddockSlot(userId)})`;
}

/** A translucent wash of a person's colour, for text they are touching. */
export function paddockPresenceTint(userId: string, percent = 32): string {
    return `color-mix(in srgb, ${paddockPresenceVar(userId)} ${percent}%, transparent)`;
}

/** Up to `count` initials from a display name: "Maya Okafor" → "MO". */
export function initialsOf(name: string, count: 1 | 2 = 1): string {
    const letters = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase());

    return letters.slice(0, count).join("") || "?";
}

/** "Maya, Theo and Priya", for the accessible name of a stack of faces. */
export function listNames(names: string[]): string {
    return new Intl.ListFormat("en", {
        style: "long",
        type: "conjunction",
    }).format(names);
}
