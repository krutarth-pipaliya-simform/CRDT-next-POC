import type { ReactNode } from "react";

import { ContourBackground } from "@/components/paddock/contour-background";
import { DisplayHeading } from "@/components/paddock/display-heading";
import { Tag } from "@/components/paddock/tag";
import { cn } from "@/lib/cn";

export interface ShowcaseSectionProps {
    id: string;
    eyebrow: string;
    serif: string;
    heavy: string;
    intro: string;
    surface?: "paper" | "night";
    children: ReactNode;
}

/** One group of components, titled in the two voices it demonstrates. */
export function ShowcaseSection({
    id,
    eyebrow,
    serif,
    heavy,
    intro,
    surface = "paper",
    children,
}: ShowcaseSectionProps) {
    const night = surface === "night";
    const headingId = `${id}-heading`;

    return (
        <section
            id={id}
            aria-labelledby={headingId}
            className={cn(
                "relative scroll-mt-24 overflow-hidden border-t px-4 py-20 sm:px-6",
                night
                    ? "paddock-night border-paddock-night-rule"
                    : "border-paddock-rule",
            )}
        >
            {night ? (
                <ContourBackground pattern="band" surface="night" />
            ) : null}
            <div className="relative mx-auto flex max-w-[77rem] flex-col gap-12">
                <header className="flex max-w-[44rem] flex-col gap-4">
                    <Tag tone={night ? "night-subtle" : "subtle"}>
                        {eyebrow}
                    </Tag>
                    <DisplayHeading
                        id={headingId}
                        serif={serif}
                        heavy={heavy}
                        size="lg"
                        surface={surface}
                    />
                    <p
                        className={cn(
                            "m-0 text-[1.0625rem] leading-relaxed",
                            night
                                ? "text-paddock-night-subtle"
                                : "text-paddock-subtle",
                        )}
                    >
                        {intro}
                    </p>
                </header>
                {children}
            </div>
        </section>
    );
}

export interface SpecimenProps {
    title: string;
    /** When and how to use it, in a sentence or two. */
    usage: string;
    /** The exported component names, shown as code. */
    components: string[];
    surface?: "paper" | "night";
    children: ReactNode;
    className?: string;
}

/** A single component: name, usage note, the code names, then the live demo. */
export function Specimen({
    title,
    usage,
    components,
    surface = "paper",
    children,
    className,
}: SpecimenProps) {
    const night = surface === "night";

    return (
        <article
            className={cn(
                "grid gap-6 border-t pt-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10",
                night ? "border-paddock-night-rule" : "border-paddock-rule",
                className,
            )}
        >
            <div className="flex flex-col gap-2.5">
                <h3 className="m-0 text-lg font-bold">{title}</h3>
                <p
                    className={cn(
                        "m-0 text-[0.90625rem] leading-relaxed",
                        night
                            ? "text-paddock-night-subtle"
                            : "text-paddock-subtle",
                    )}
                >
                    {usage}
                </p>
                <p className="m-0 flex flex-wrap gap-1.5">
                    {components.map((name) => (
                        <code
                            key={name}
                            className={cn(
                                "paddock-mono rounded px-1.5 py-0.5 text-xs",
                                night
                                    ? "bg-paddock-night-card text-paddock-night-fg"
                                    : "bg-paddock-ink/8 text-paddock-ink",
                            )}
                        >
                            {`<${name}>`}
                        </code>
                    ))}
                </p>
            </div>
            <div className="min-w-0">{children}</div>
        </article>
    );
}

export interface SpecimenRowProps {
    label: string;
    children: ReactNode;
    surface?: "paper" | "night";
    className?: string;
}

/** A labelled row of variants inside a specimen. */
export function SpecimenRow({
    label,
    children,
    surface = "paper",
    className,
}: SpecimenRowProps) {
    return (
        <div className={cn("flex flex-col gap-3", className)}>
            <Tag tone={surface === "night" ? "night-subtle" : "subtle"}>
                {label}
            </Tag>
            <div className="flex flex-wrap items-center gap-3">{children}</div>
        </div>
    );
}
