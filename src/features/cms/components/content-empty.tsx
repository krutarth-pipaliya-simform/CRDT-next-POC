import { NotchedCard } from "@/components/paddock/notched-card";

export interface ContentEmptyProps {
    title: string;
    description: string;
}

/** A list with nothing published yet. */
export function ContentEmpty({ title, description }: ContentEmptyProps) {
    return (
        <NotchedCard
            tone="sheet"
            bodyClassName="px-6 py-12 text-center"
            className="mx-auto max-w-xl"
        >
            <p className="paddock-heavy m-0 text-xl">{title}</p>
            <p className="m-0 mt-2 text-paddock-subtle">{description}</p>
        </NotchedCard>
    );
}
