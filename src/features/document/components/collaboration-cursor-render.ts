import type { DecorationAttrs } from "@tiptap/pm/view";

import {
    paddockCaretVar,
    paddockPresenceTint,
    paddockPresenceVar,
} from "@/components/paddock/paddock-presence";

/**
 * How a peer's caret and selection are painted on this screen.
 *
 * Awareness still broadcasts the theme-independent `getUserColor()` literal,
 * untouched. Locally we key off the peer's user id instead, so their caret is
 * the same Paddock hue as their face in the presence stack, and it follows
 * this viewer's theme. A payload without an id falls back to the wire colour.
 */

function readString(user: Record<string, unknown>, key: string): string | null {
    const value = user[key];
    return typeof value === "string" && value.length > 0 ? value : null;
}

export function renderCollaborationCursor(
    user: Record<string, unknown>,
): HTMLElement {
    const id = readString(user, "id");
    const wireColor = readString(user, "color") ?? "currentColor";

    const caret = document.createElement("span");
    caret.classList.add("collaboration-cursor__caret");
    caret.style.borderColor = id ? paddockCaretVar(id) : wireColor;

    const label = document.createElement("div");
    label.classList.add("collaboration-cursor__label");
    label.style.backgroundColor = id ? paddockPresenceVar(id) : wireColor;
    label.textContent = readString(user, "name") ?? "Someone";

    caret.append(label);
    return caret;
}

export function renderCollaborationSelection(
    user: Record<string, unknown>,
): DecorationAttrs {
    const id = readString(user, "id");
    const wireColor = readString(user, "color");
    const background = id
        ? paddockPresenceTint(id, 32)
        : wireColor
          ? `${wireColor}70`
          : "transparent";

    return {
        style: `background-color: ${background}`,
        class: "ProseMirror-yjs-selection",
    };
}
