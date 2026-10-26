import { cn } from "@/lib/cn";

import {
    initialsOf,
    listNames,
    paddockPresenceVar,
    type PaddockPerson,
} from "./paddock-presence";

export type PaddockAvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
/** The ground the avatar sits on, so the separating ring matches it. */
export type PaddockAvatarRing = "none" | "paper" | "sheet" | "night";

export interface PaddockAvatarProps {
    person: PaddockPerson;
    size?: PaddockAvatarSize;
    ring?: PaddockAvatarRing;
    /** True when the name is already written next to the avatar. */
    decorative?: boolean;
    className?: string;
}

const SIZES: Record<PaddockAvatarSize, { box: string; initials: 1 | 2 }> = {
    xs: { box: "size-[1.125rem] text-[0.5625rem]", initials: 1 },
    sm: { box: "size-[1.625rem] text-[0.625rem]", initials: 1 },
    md: { box: "size-[2.125rem] text-xs", initials: 2 },
    lg: { box: "size-10 text-[0.8125rem]", initials: 2 },
    xl: { box: "size-12 text-[0.9375rem]", initials: 1 },
};

const RINGS: Record<PaddockAvatarRing, string> = {
    none: "",
    paper: "border-2 border-paddock-paper",
    sheet: "border-2 border-paddock-sheet",
    night: "border-2 border-paddock-night",
};

/**
 * Round, filled with the person's own hue — the same colour as their cursor
 * flag, chat rail and highlight. Text on the hue is `on-fill`, which stays
 * dark in both themes because the hues stay light in both.
 */
export function PaddockAvatar({
    person,
    size = "md",
    ring = "none",
    decorative = false,
    className,
}: PaddockAvatarProps) {
    const { box, initials } = SIZES[size];

    return (
        <span
            role={decorative ? undefined : "img"}
            aria-label={decorative ? undefined : person.name}
            aria-hidden={decorative ? true : undefined}
            style={{ backgroundColor: paddockPresenceVar(person.id) }}
            className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-paddock-on-fill",
                box,
                RINGS[ring],
                className,
            )}
        >
            {initialsOf(person.name, initials)}
        </span>
    );
}

export interface AvatarStackProps {
    people: PaddockPerson[];
    size?: Exclude<PaddockAvatarSize, "xl">;
    ring?: Exclude<PaddockAvatarRing, "none">;
    /** Faces shown before collapsing the rest into "+n". */
    max?: number;
    className?: string;
}

/** Overlapping faces for "who is here". One accessible name lists everyone. */
export function AvatarStack({
    people,
    size = "sm",
    ring = "paper",
    max = 4,
    className,
}: AvatarStackProps) {
    const shown = people.slice(0, max);
    const hidden = people.length - shown.length;

    return (
        <span
            role="img"
            aria-label={listNames(people.map((person) => person.name))}
            className={cn("inline-flex pl-[7px]", className)}
        >
            {shown.map((person) => (
                <PaddockAvatar
                    key={person.id}
                    person={person}
                    size={size}
                    ring={ring}
                    decorative
                    className="-ml-[7px]"
                />
            ))}
            {hidden > 0 ? (
                <span
                    aria-hidden="true"
                    className={cn(
                        "-ml-[7px] inline-flex shrink-0 items-center justify-center rounded-full",
                        "bg-paddock-inverse font-bold text-paddock-on-inverse",
                        SIZES[size].box,
                        RINGS[ring],
                    )}
                >
                    +{hidden}
                </span>
            ) : null}
        </span>
    );
}
