import type { ReactNode } from "react";
import Link from "next/link";

import { getCmsContext } from "../lib/cms-config";
import { safeImageUrl, safeLinkUrl } from "../lib/safe-url";
import type {
    BlockNode,
    InlineNode,
    ListBlock,
    ListItemNode,
    TextNode,
} from "../schemas/blocks";

export interface BlocksRendererProps {
    blocks: BlockNode[];
}

const LINK_CLASS =
    "text-paddock-ink underline decoration-paddock-lime decoration-2 underline-offset-4 hover:decoration-paddock-ink";

function renderText(node: TextNode, key: number): ReactNode {
    let content: ReactNode = node.text;
    if (node.code) {
        content = (
            <code className="paddock-mono rounded-sm bg-paddock-sheet px-1 py-0.5 text-[0.9em]">
                {content}
            </code>
        );
    }
    if (node.bold) content = <strong>{content}</strong>;
    if (node.italic) content = <em>{content}</em>;
    if (node.underline) content = <u>{content}</u>;
    if (node.strikethrough) content = <s>{content}</s>;
    return <span key={key}>{content}</span>;
}

function renderInline(nodes: InlineNode[]): ReactNode[] {
    return nodes.map((node, index) => {
        if (node.type === "text") return renderText(node, index);

        const href = safeLinkUrl(node.url);
        const label = node.children.map(renderText);
        if (!href) return <span key={index}>{label}</span>;
        if (href.startsWith("/") || href.startsWith("#")) {
            return (
                <Link key={index} href={href} className={LINK_CLASS}>
                    {label}
                </Link>
            );
        }
        return (
            <a
                key={index}
                href={href}
                rel="noopener noreferrer"
                className={LINK_CLASS}
            >
                {label}
            </a>
        );
    });
}

function renderListChildren(children: ListBlock["children"]): ReactNode[] {
    return children.map((child, index) => {
        if (child.type === "list") return renderList(child, index);
        return renderListItem(child, index);
    });
}

function renderListItem(item: ListItemNode, key: number): ReactNode {
    return <li key={key}>{renderInline(item.children)}</li>;
}

function renderList(list: ListBlock, key: number): ReactNode {
    const className = "m-0 flex flex-col gap-1.5 pl-6";
    return list.format === "ordered" ? (
        <ol key={key} className={`${className} list-decimal`}>
            {renderListChildren(list.children)}
        </ol>
    ) : (
        <ul key={key} className={`${className} list-disc`}>
            {renderListChildren(list.children)}
        </ul>
    );
}

function plainText(nodes: InlineNode[]): string {
    return nodes
        .map((node) =>
            node.type === "text"
                ? node.text
                : node.children.map((child) => child.text).join(""),
        )
        .join("");
}

/**
 * Renders Strapi "blocks" JSON as React elements. Nothing is injected as HTML:
 * text goes through React, link targets go through `safeLinkUrl`, and image
 * sources through `safeImageUrl`. Unknown blocks are skipped. Headings start
 * at `h2`, because the page owns the `h1`.
 */
export function BlocksRenderer({ blocks }: BlocksRendererProps) {
    const context = getCmsContext();
    const imageBase = context.success ? context.data.baseUrl : "";

    return (
        <div className="flex flex-col gap-5 text-[1.0625rem] leading-[1.7]">
            {blocks.map((block, index) => {
                switch (block.type) {
                    case "paragraph":
                        return (
                            <p key={index} className="m-0">
                                {renderInline(block.children)}
                            </p>
                        );
                    case "heading": {
                        const content = renderInline(block.children);
                        if (block.level <= 2) {
                            return (
                                <h2
                                    key={index}
                                    className="paddock-heavy m-0 mt-4 text-[1.5rem]"
                                >
                                    {content}
                                </h2>
                            );
                        }
                        if (block.level === 3) {
                            return (
                                <h3
                                    key={index}
                                    className="m-0 mt-2 text-xl font-bold"
                                >
                                    {content}
                                </h3>
                            );
                        }
                        return (
                            <h4 key={index} className="m-0 text-lg font-bold">
                                {content}
                            </h4>
                        );
                    }
                    case "quote":
                        return (
                            <blockquote
                                key={index}
                                className="m-0 border-l-4 border-paddock-lime py-1 pl-5 italic text-paddock-subtle"
                            >
                                {renderInline(block.children)}
                            </blockquote>
                        );
                    case "code":
                        return (
                            <pre
                                key={index}
                                className="paddock-mono m-0 overflow-x-auto rounded-paddock-panel bg-paddock-night p-4 text-[0.875rem] leading-[1.6] text-paddock-night-fg"
                            >
                                <code>{plainText(block.children)}</code>
                            </pre>
                        );
                    case "list":
                        return renderList(block, index);
                    case "image": {
                        const src = safeImageUrl(block.image.url, imageBase);
                        if (!src) return null;
                        return (
                            // eslint-disable-next-line @next/next/no-img-element -- CMS-hosted origin is not known at build time
                            <img
                                key={index}
                                src={src}
                                alt={block.image.alternativeText ?? ""}
                                loading="lazy"
                                className="h-auto max-w-full rounded-paddock-panel"
                            />
                        );
                    }
                    case "unknown":
                        return null;
                }
            })}
        </div>
    );
}
