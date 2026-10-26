import { ContourBackground } from "@/components/paddock/contour-background";
import { CollaboratorHighlight } from "@/components/paddock/cursor-flag";
import { Marquee } from "@/components/paddock/marquee";
import { Tag } from "@/components/paddock/tag";
import { WordReveal } from "@/components/paddock/word-reveal";
import { DEMO_PEOPLE } from "@/features/marketing/lib/demo-people";

/**
 * The night band: what merging means, said three ways — a marquee (with its
 * own pause control), one paragraph two people wrote at once, and the colour
 * statement that brightens as it scrolls into view.
 */
export function MergeBand() {
    return (
        <section
            aria-label="Merging"
            className="paddock-night relative overflow-hidden pt-20 pb-24 lg:pt-[6.875rem] lg:pb-[7.5rem]"
        >
            <ContourBackground pattern="band" surface="night" />

            <div className="relative">
                <Marquee
                    top={["nothing to resolve —", "no locks —"]}
                    bottom={[
                        "documents · boards · chat ·",
                        "every keystroke merged ·",
                    ]}
                    className="pb-16"
                />

                {/* Floats over the marquee where there is room; on a narrow
                    screen it sits under it, clear of the pause button. The
                    washes are stronger than the mockup's and carry on-fill
                    text: a half-strength wash under light text on this grey
                    measures about 3:1. */}
                <figure className="relative mx-4 mt-6 rounded-md bg-paddock-float px-5.5 pt-5.5 pb-4.5 text-paddock-night-fg shadow-paddock-float sm:mx-auto sm:w-[22.5rem] md:absolute md:top-1/2 md:left-1/2 md:m-0 md:-translate-x-1/2 md:-translate-y-[60%]">
                    <Tag as="p" tone="lime" className="mb-2.5">
                        Same paragraph · two authors
                    </Tag>
                    <p className="m-0 mb-3 text-[1.0625rem] leading-normal">
                        <CollaboratorHighlight
                            person={DEMO_PEOPLE.ama}
                            strength={75}
                            className="text-paddock-on-fill"
                        >
                            Book the walkthrough
                        </CollaboratorHighlight>{" "}
                        <CollaboratorHighlight
                            person={DEMO_PEOPLE.ravi}
                            strength={75}
                            className="text-paddock-on-fill"
                        >
                            for Thursday
                        </CollaboratorHighlight>
                        .
                    </p>
                    <figcaption className="text-[0.8125rem] text-paddock-float-fg">
                        Both edits kept. Nothing to resolve.
                    </figcaption>
                </figure>
            </div>

            <div className="relative mx-auto mt-20 max-w-[66.25rem] px-4 text-center sm:px-6 lg:mt-[8.125rem]">
                <Tag as="p" tone="night-subtle" className="mb-6.5">
                    Who did what
                </Tag>
                <WordReveal
                    segments={[
                        { text: "Everyone keeps their" },
                        { text: "own colour", emphasis: true },
                        {
                            text: "— on their cursor, their messages and their cards — so you always know",
                        },
                        { text: "who did what.", emphasis: true },
                    ]}
                />
            </div>
        </section>
    );
}
