import {
    HEADING_LEVELS,
    selectFormatState,
    type FormatStateEditor,
} from "@/features/document/lib/editor-format-state";

interface Active {
    name?: string;
    attributes?: Record<string, unknown>;
}

/** An editor whose `isActive` answers true only for the listed marks/nodes. */
function fakeEditor(
    active: Active[],
    { undo = false, redo = false } = {},
): FormatStateEditor {
    return {
        can: () => ({ undo: () => undo, redo: () => redo }),
        isActive: (nameOrAttributes, attributes) => {
            if (typeof nameOrAttributes === "string") {
                return active.some(
                    (entry) =>
                        entry.name === nameOrAttributes &&
                        (attributes === undefined ||
                            Object.entries(attributes).every(
                                ([key, value]) =>
                                    entry.attributes?.[key] === value,
                            )),
                );
            }
            return active.some(
                (entry) =>
                    entry.name === undefined &&
                    Object.entries(nameOrAttributes).every(
                        ([key, value]) => entry.attributes?.[key] === value,
                    ),
            );
        },
    };
}

describe("selectFormatState", () => {
    it("reports nothing active on a blank selection", () => {
        const state = selectFormatState(fakeEditor([]));
        expect(state).toMatchObject({
            canUndo: false,
            canRedo: false,
            paragraph: false,
            headingLevel: null,
            bold: false,
            textAlign: null,
            table: false,
        });
    });

    it("exposes undo/redo availability", () => {
        const state = selectFormatState(
            fakeEditor([], { undo: true, redo: true }),
        );
        expect(state.canUndo).toBe(true);
        expect(state.canRedo).toBe(true);
    });

    it("reports active marks and blocks", () => {
        const state = selectFormatState(
            fakeEditor([
                { name: "bold" },
                { name: "italic" },
                { name: "link" },
                { name: "bulletList" },
                { name: "codeBlock" },
            ]),
        );
        expect(state).toMatchObject({
            bold: true,
            italic: true,
            link: true,
            bulletList: true,
            codeBlock: true,
            underline: false,
        });
    });

    it.each(HEADING_LEVELS)("finds heading level %i", (level) => {
        const state = selectFormatState(
            fakeEditor([{ name: "heading", attributes: { level } }]),
        );
        expect(state.headingLevel).toBe(level);
    });

    it.each(["left", "center", "right", "justify"] as const)(
        "finds %s alignment",
        (textAlign) => {
            const state = selectFormatState(
                fakeEditor([{ attributes: { textAlign } }]),
            );
            expect(state.textAlign).toBe(textAlign);
        },
    );
});
