import type { PaddockPerson } from "@/components/paddock/paddock-presence";

/**
 * Sample content for the Paddock showcase only. Nothing here is fetched.
 *
 * The ids are arbitrary strings picked so the four sample people hash onto
 * four different hues (`paddockPresenceVar`); with only four hues, real ids
 * will collide sooner — see the open decision in AGENTS.md.
 */
export const DEMO_PEOPLE = {
    maya: { id: "demo-maya-3", name: "Maya Okafor" },
    theo: { id: "demo-theo-4", name: "Theo Lind" },
    priya: { id: "demo-priya-2", name: "Priya Raman" },
    sam: { id: "demo-sam-3", name: "Sam Ortiz" },
} satisfies Record<string, PaddockPerson>;

export const DEMO_TEAM: PaddockPerson[] = [
    DEMO_PEOPLE.maya,
    DEMO_PEOPLE.theo,
    DEMO_PEOPLE.priya,
    DEMO_PEOPLE.sam,
];

export const DEMO_RECENT_DOCUMENTS = [
    { title: "Pricing page copy", meta: "edited 9 min ago" },
    { title: "Release checklist", meta: "edited 3 days ago" },
    { title: "Interview notes", meta: "edited 2 days ago" },
    { title: "Autumn launch plan", meta: "4 people here now" },
];

export interface ShowcaseIndexEntry {
    id: string;
    label: string;
    components: string[];
}

/** One list drives the in-page index, the menu overlay and the section ids. */
export const SHOWCASE_INDEX: ShowcaseIndexEntry[] = [
    {
        id: "foundations",
        label: "Foundations",
        components: [
            "Tokens",
            "Wordmark",
            "Display heading",
            "Tag",
            "Contour background",
        ],
    },
    {
        id: "actions",
        label: "Actions",
        components: ["Buttons", "Icon square", "Burger"],
    },
    {
        id: "forms",
        label: "Forms",
        components: ["Input, textarea, select", "Radio cards"],
    },
    {
        id: "surfaces",
        label: "Surfaces",
        components: ["Notched card", "Stat tile", "Plan card"],
    },
    {
        id: "navigation",
        label: "Navigation",
        components: ["Workspace tabs", "Pill tabs", "Menu overlay"],
    },
    {
        id: "people",
        label: "People",
        components: [
            "Avatar and stack",
            "Cursor flag and highlight",
            "Status, priority and role",
        ],
    },
    {
        id: "collaboration",
        label: "Collaboration",
        components: [
            "Floating toolbar",
            "Chat message and composer",
            "Notification row",
        ],
    },
    { id: "overlays", label: "Overlays", components: ["Dialog"] },
    {
        id: "motion",
        label: "Motion",
        components: ["Scribble", "Marquee", "Word reveal", "Loader screen"],
    },
];
