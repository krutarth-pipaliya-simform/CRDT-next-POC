import type { PaddockPerson } from "@/components/paddock/paddock-presence";

/**
 * The three sample collaborators drawn on the public pages (the landing merge
 * demo and the sign-in split screen). Nothing here is fetched.
 *
 * Colours are never picked by hand: these ids were chosen so that
 * `paddockPresenceVar()` hashes them onto three different hues (coral, amber,
 * cyan). Change an id and check the hues stay distinct.
 */
export const DEMO_PEOPLE = {
    ama: { id: "landing-ama-2", name: "Ama" },
    ravi: { id: "landing-ravi-0", name: "Ravi" },
    jonna: { id: "landing-jonna-1", name: "Jonna" },
} satisfies Record<string, PaddockPerson>;

export const DEMO_TRIO: PaddockPerson[] = [
    DEMO_PEOPLE.ama,
    DEMO_PEOPLE.ravi,
    DEMO_PEOPLE.jonna,
];
