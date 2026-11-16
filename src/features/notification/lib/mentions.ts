export interface MentionCandidate {
    userId: string;
    name: string | null;
    email: string | null;
}

/**
 * Matches an `@` immediately followed by a name-like run. Allows internal single
 * spaces so multi-word display names ("@Ada Lovelace") resolve, and stops at
 * punctuation so "@ada," and "@ada." still match the bare handle.
 */
const MENTION_PATTERN = /@([\p{L}\p{N}._-]+(?:[ ][\p{L}\p{N}._-]+)?)/gu;

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

/** "ada." -> "ada": sentence punctuation after a handle is not part of it. */
function stripTrailingPunctuation(value: string): string {
    return value.replace(/[._-]+$/, "");
}

function handleFromEmail(email: string): string {
    return normalize(email.split("@")[0] ?? "");
}

/**
 * Resolves `@mentions` inside a chat message body against the workspace roster.
 *
 * A candidate matches when the captured text equals their display name, the local
 * part of their email, or — for multi-word names — the first word of their name.
 * Returns de-duplicated user IDs.
 */
export function resolveMentionedUserIds(
    body: string,
    candidates: MentionCandidate[],
): string[] {
    if (!body.includes("@") || candidates.length === 0) {
        return [];
    }

    const byHandle = new Map<string, string>();

    for (const candidate of candidates) {
        const register = (handle: string) => {
            if (handle.length > 0 && !byHandle.has(handle)) {
                byHandle.set(handle, candidate.userId);
            }
        };

        if (candidate.name) {
            const name = normalize(candidate.name);
            register(name);
            register(name.split(" ")[0] ?? "");
        }
        if (candidate.email) {
            register(handleFromEmail(candidate.email));
        }
    }

    const mentioned = new Set<string>();

    for (const match of body.matchAll(MENTION_PATTERN)) {
        const captured = stripTrailingPunctuation(normalize(match[1] ?? ""));
        if (captured.length === 0) continue;

        // Prefer the longest interpretation ("@Ada Lovelace"), then fall back to "@Ada"
        const firstWord = stripTrailingPunctuation(
            captured.split(" ")[0] ?? "",
        );
        const userId = byHandle.get(captured) ?? byHandle.get(firstWord);

        if (userId) {
            mentioned.add(userId);
        }
    }

    return Array.from(mentioned);
}
