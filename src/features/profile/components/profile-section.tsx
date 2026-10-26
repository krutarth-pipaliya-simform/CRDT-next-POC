import { useId, type ReactNode } from "react";
import { Check } from "lucide-react";

import { ContourBackground } from "@/components/paddock/contour-background";
import { DisplayHeading } from "@/components/paddock/display-heading";
import { cn } from "@/lib/cn";

export interface ProfileSectionProps {
    /** The two voices of the section title: "Profile" over "picture". */
    serif: string;
    heavy: string;
    description: string;
    /** `night` is the dark band used for the password, in both themes. */
    tone?: "paper" | "night";
    children: ReactNode;
}

/**
 * One settings row on the profile page: the title and a sentence on the left,
 * the controls on the right. Paper rows sit on a rule with the controls on a
 * sheet; the night row is a contoured band that stays dark in both themes.
 */
export function ProfileSection({
    serif,
    heavy,
    description,
    tone = "paper",
    children,
}: ProfileSectionProps) {
    const headingId = useId();
    const night = tone === "night";

    return (
        <section
            aria-labelledby={headingId}
            className={cn(
                "relative flex flex-wrap gap-x-14 gap-y-6",
                night
                    ? "paddock-night mt-6 overflow-hidden rounded-paddock-card px-6 py-10 sm:px-10 sm:py-11"
                    : "border-t border-paddock-rule py-10",
            )}
        >
            {night ? (
                <ContourBackground pattern="band" surface="night" />
            ) : null}
            <div className="relative max-w-[22.5rem] flex-[1_1_17.5rem]">
                <DisplayHeading
                    id={headingId}
                    as="h2"
                    size="md"
                    surface={night ? "night" : "paper"}
                    serif={serif}
                    heavy={heavy}
                    className="mb-2.5"
                />
                <p
                    className={cn(
                        "m-0 text-[0.90625rem]",
                        night
                            ? "text-paddock-night-subtle"
                            : "text-paddock-subtle",
                    )}
                >
                    {description}
                </p>
            </div>
            <div
                className={cn(
                    "relative min-w-0 flex-[999_1_32.5rem]",
                    !night &&
                        "rounded-paddock-card border border-paddock-rule bg-paddock-sheet p-5 sm:p-7",
                )}
            >
                {children}
            </div>
        </section>
    );
}

export interface ProfileNoticeProps {
    intent: "success" | "danger";
    children: ReactNode;
}

/**
 * A form result. Both are fills with their own text colour, so they read on
 * paper, on a sheet and on the night band alike.
 */
export function ProfileNotice({ intent, children }: ProfileNoticeProps) {
    const success = intent === "success";
    return (
        <p
            role={success ? "status" : "alert"}
            className={cn(
                "paddock-in m-0 flex items-center gap-2.5 rounded-paddock px-3.5 py-3 text-sm font-semibold",
                success
                    ? "bg-paddock-lime text-paddock-on-fill"
                    : "bg-paddock-danger text-paddock-on-danger",
            )}
        >
            {success ? (
                <Check
                    aria-hidden="true"
                    className="size-4 shrink-0"
                    strokeWidth={2.4}
                />
            ) : null}
            {children}
        </p>
    );
}
