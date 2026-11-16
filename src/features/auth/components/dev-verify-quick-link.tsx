import { Tag } from "@/components/paddock/tag";

export interface DevVerifyQuickLinkProps {
    verifyUrl: string;
    /** The link's text; the password reset form reuses this for its link. */
    label?: string;
}

/**
 * Development only: the server hands back the verification URL when no mail
 * transport is configured. Dashed, because it is scaffolding, not product.
 */
export function DevVerifyQuickLink({
    verifyUrl,
    label = "Verify email now",
}: DevVerifyQuickLinkProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-paddock border-[1.5px] border-dashed border-paddock-ink px-4 py-3.5">
            <Tag>Development quick link</Tag>
            <a
                href={verifyUrl}
                className="paddock-tag paddock-press inline-flex h-11 items-center rounded-full bg-paddock-inverse px-4 text-[0.6875rem] text-paddock-on-inverse no-underline"
            >
                {label}
            </a>
        </div>
    );
}
