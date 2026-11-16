const LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);
const IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

function isSiteRelative(url: string): boolean {
    return (
        (url.startsWith("/") && !url.startsWith("//")) || url.startsWith("#")
    );
}

function protocolOf(url: string): string | null {
    try {
        return new URL(url).protocol;
    } catch {
        return null;
    }
}

/**
 * A link target from CMS content, or `null` when it is not safe to render.
 * Only site-relative paths and http(s)/mailto URLs pass, so a `javascript:`
 * or `data:` URL typed into the CMS never becomes a clickable link.
 */
export function safeLinkUrl(url: string): string | null {
    const trimmed = url.trim();
    if (isSiteRelative(trimmed)) return trimmed;
    const protocol = protocolOf(trimmed);
    return protocol && LINK_PROTOCOLS.has(protocol) ? trimmed : null;
}

/**
 * An image URL from CMS content. Strapi's upload provider returns paths like
 * `/uploads/a.png`, which are resolved against the CMS origin.
 */
export function safeImageUrl(url: string, cmsBaseUrl: string): string | null {
    const trimmed = url.trim();
    const absolute =
        trimmed.startsWith("/") && !trimmed.startsWith("//")
            ? `${cmsBaseUrl}${trimmed}`
            : trimmed;
    const protocol = protocolOf(absolute);
    return protocol && IMAGE_PROTOCOLS.has(protocol) ? absolute : null;
}
