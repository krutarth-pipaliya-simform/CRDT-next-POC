"use client";

import { useMemo } from "react";
import { useEditorState, type Editor } from "@tiptap/react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

export interface DocumentStatsProps {
    editor: Editor | null;
}

/** How long typing must pause before the document is recounted. */
const RECOUNT_DELAY_MS = 300;

/**
 * Word and character counts. Counting walks the whole document, so it waits
 * for a pause in typing instead of running on every keystroke, and only this
 * line re-renders when it does.
 */
export function DocumentStats({ editor }: DocumentStatsProps) {
    const doc = useEditorState({
        editor,
        selector: ({ editor: current }) => current?.state.doc ?? null,
        // Documents are immutable: a new reference is a change.
        equalityFn: (a, b) => a === b,
    });
    const settledDoc = useDebouncedValue(doc, RECOUNT_DELAY_MS);

    const { words, characters } = useMemo(() => {
        const counter = editor?.storage.characterCount;
        if (!counter || !settledDoc) return { words: 0, characters: 0 };
        return {
            words: counter.words({ node: settledDoc }),
            characters: counter.characters({ node: settledDoc }),
        };
    }, [editor, settledDoc]);

    return (
        <span className="paddock-mono text-xs">
            {words} words · {characters} characters
        </span>
    );
}
