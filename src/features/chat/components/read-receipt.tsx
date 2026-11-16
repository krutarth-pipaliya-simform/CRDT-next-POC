import { AvatarStack } from "@/components/paddock/paddock-avatar";
import { listNames } from "@/components/paddock/paddock-presence";

import type { ChatAuthor } from "../types";

export interface ReadReceiptProps {
    readers: ChatAuthor[];
}

function displayName(reader: ChatAuthor): string {
    return reader.name || reader.email || "Someone";
}

/**
 * "Seen by" under the latest message each other member has read. Readers
 * keep their own colour through the avatar; the line itself is quiet ink.
 */
export function ReadReceipt({ readers }: ReadReceiptProps) {
    const people = readers.map((reader) => ({
        id: reader.id,
        name: displayName(reader),
        image: reader.image,
    }));
    const names = listNames(people.map((person) => person.name));

    return (
        <p
            data-testid="chat-read-receipt"
            className="m-0 mt-1 flex items-center justify-end gap-2 text-xs text-paddock-subtle"
        >
            <span className="truncate">Seen by {names}</span>
            <span aria-hidden="true" className="inline-flex">
                <AvatarStack people={people} size="xs" ring="sheet" max={5} />
            </span>
        </p>
    );
}
