import { z } from "zod";

/**
 * Strapi v5 "Blocks" rich text: an array of block objects, each with `type`
 * and `children`. Text leaves carry boolean modifiers. The shape follows
 * Strapi's `@strapi/blocks-react-renderer` (paragraph, heading, list, quote,
 * code, image, link). A block of a type we do not render, or with malformed
 * fields, parses as `{ type: "unknown" }` and is skipped by the renderer
 * instead of failing the whole page.
 */
export const textNodeSchema = z.object({
    type: z.literal("text"),
    text: z.string(),
    bold: z.boolean().nullish(),
    italic: z.boolean().nullish(),
    underline: z.boolean().nullish(),
    strikethrough: z.boolean().nullish(),
    code: z.boolean().nullish(),
});

export const linkNodeSchema = z.object({
    type: z.literal("link"),
    url: z.string(),
    children: z.array(textNodeSchema),
});

export const inlineNodeSchema = z.discriminatedUnion("type", [
    textNodeSchema,
    linkNodeSchema,
]);

const listItemSchema = z.object({
    type: z.literal("list-item"),
    children: z.array(inlineNodeSchema),
});

export type TextNode = z.infer<typeof textNodeSchema>;
export type InlineNode = z.infer<typeof inlineNodeSchema>;
export type ListItemNode = z.infer<typeof listItemSchema>;

export interface ListBlock {
    type: "list";
    format: "ordered" | "unordered";
    children: (ListItemNode | ListBlock)[];
}

const listBlockSchema: z.ZodType<ListBlock> = z.lazy(() =>
    z.object({
        type: z.literal("list"),
        format: z.enum(["ordered", "unordered"]),
        children: z.array(z.union([listItemSchema, listBlockSchema])),
    }),
);

const knownBlockSchema = z.union([
    z.object({
        type: z.literal("paragraph"),
        children: z.array(inlineNodeSchema),
    }),
    z.object({
        type: z.literal("heading"),
        level: z.number().int().min(1).max(6),
        children: z.array(inlineNodeSchema),
    }),
    z.object({
        type: z.literal("quote"),
        children: z.array(inlineNodeSchema),
    }),
    z.object({
        type: z.literal("code"),
        children: z.array(inlineNodeSchema),
    }),
    z.object({
        type: z.literal("image"),
        image: z.object({
            url: z.string(),
            alternativeText: z.string().nullish(),
        }),
    }),
    listBlockSchema,
]);

const unknownBlock = { type: "unknown" } as const;

export type KnownBlock = z.infer<typeof knownBlockSchema>;
export type BlockNode = KnownBlock | typeof unknownBlock;

export const blocksSchema = z.array(
    z.union([
        knownBlockSchema,
        z.unknown().transform((): typeof unknownBlock => unknownBlock),
    ]),
);
