import { ShellNotice } from "@/components/layout/shell-notice";
import { PaddockLinkButton } from "@/components/paddock/paddock-button";

export interface ContentNoticeProps {
    /** True when the CMS env vars are missing, false when the CMS failed. */
    notConfigured: boolean;
    /** The readable reason from the CMS client. */
    error: string;
}

/**
 * What a content page shows instead of content when the CMS is not set up or
 * did not answer. It never throws, so the app keeps working without a CMS.
 */
export function ContentNotice({ notConfigured, error }: ContentNoticeProps) {
    return (
        <ShellNotice
            code={
                notConfigured
                    ? "Content · Not configured"
                    : "Content · Unavailable"
            }
            numeral={notConfigured ? "CMS" : "503"}
            serif={notConfigured ? "Content is" : "Content"}
            heavy={notConfigured ? "not set up" : "unavailable"}
            actions={
                <PaddockLinkButton href="/" size="lg" surface="night">
                    Back to home
                </PaddockLinkButton>
            }
        >
            {error}
        </ShellNotice>
    );
}
