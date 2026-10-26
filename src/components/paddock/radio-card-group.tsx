import { cn } from "@/lib/cn";

import { Tag } from "./tag";

export interface RadioCardOption {
    value: string;
    label: string;
    /** A short state word: "Restricted", "Open". */
    badge: string;
    description: string;
}

export interface RadioCardGroupProps {
    name: string;
    legend: string;
    options: RadioCardOption[];
    defaultValue?: string;
    className?: string;
}

/**
 * A choice between a few weighty options, as notched cards.
 *
 * Built on native radio inputs inside labels, so arrow keys, form submission
 * and the "1 of 2" announcement all come from the platform with no script.
 * The card restyles from `:has(:checked)`. Because the clip-path would cut an
 * outline away, keyboard focus is drawn as an inset ring inside the card.
 */
export function RadioCardGroup({
    name,
    legend,
    options,
    defaultValue,
    className,
}: RadioCardGroupProps) {
    return (
        <fieldset className={cn("m-0 min-w-0 border-0 p-0", className)}>
            <Tag as="legend" tone="ink" className="mb-3">
                {legend}
            </Tag>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-3.5">
                {options.map((option) => {
                    const id = `${name}-${option.value}`;
                    return (
                        <label
                            key={option.value}
                            htmlFor={id}
                            className="paddock-press paddock-notch group/radio block cursor-pointer bg-paddock-ink p-[1.5px]"
                        >
                            <input
                                id={id}
                                type="radio"
                                name={name}
                                value={option.value}
                                defaultChecked={option.value === defaultValue}
                                aria-describedby={`${id}-description`}
                                className="sr-only"
                            />
                            <span
                                className={cn(
                                    "paddock-notch flex flex-col gap-2.5 px-5.5 pt-5.5 pb-11",
                                    "bg-paddock-sheet text-paddock-ink",
                                    "group-has-[:checked]/radio:bg-paddock-inverse group-has-[:checked]/radio:text-paddock-on-inverse",
                                    "group-has-[:focus-visible]/radio:shadow-[inset_0_0_0_3px_var(--color-paddock-lime),inset_0_0_0_5px_var(--color-paddock-ink)]",
                                )}
                            >
                                <span className="flex items-center justify-between gap-2.5">
                                    <span className="paddock-heavy text-[1.625rem]">
                                        {option.label}
                                    </span>
                                    <span
                                        className={cn(
                                            "paddock-tag rounded-full px-2.5 py-1 text-[0.6875rem]",
                                            "text-paddock-subtle",
                                            "group-has-[:checked]/radio:bg-paddock-lime group-has-[:checked]/radio:text-paddock-on-fill",
                                        )}
                                    >
                                        {option.badge}
                                    </span>
                                </span>
                                <span
                                    id={`${id}-description`}
                                    className="text-[0.90625rem] leading-normal"
                                >
                                    {option.description}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}
