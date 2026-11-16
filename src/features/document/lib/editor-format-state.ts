import type { Editor } from "@tiptap/react";

export const HEADING_LEVELS: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];

const ALIGNMENTS = ["left", "center", "right", "justify"] as const;

/**
 * Everything the toolbar and bubble menu show as pressed or unavailable, read
 * in one pass. Used as a `useEditorState` selector: it runs on every
 * transaction, but the menus re-render only when one of these values changes,
 * never on plain typing.
 */
export function selectFormatState(editor: Editor) {
    return {
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
        paragraph: editor.isActive("paragraph"),
        headingLevel:
            HEADING_LEVELS.find((level) =>
                editor.isActive("heading", { level }),
            ) ?? null,
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        code: editor.isActive("code"),
        highlight: editor.isActive("highlight"),
        link: editor.isActive("link"),
        textAlign:
            ALIGNMENTS.find((textAlign) => editor.isActive({ textAlign })) ??
            null,
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        taskList: editor.isActive("taskList"),
        codeBlock: editor.isActive("codeBlock"),
        blockquote: editor.isActive("blockquote"),
        table: editor.isActive("table"),
    };
}

export type EditorFormatState = ReturnType<typeof selectFormatState>;
