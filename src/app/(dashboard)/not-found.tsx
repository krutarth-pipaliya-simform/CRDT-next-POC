import { ShellNotice } from "@/components/layout/shell-notice";
import { PaddockLinkButton } from "@/components/paddock/paddock-button";

/**
 * A `notFound()` from the dashboard, profile, or a workspace's own layout (the
 * workspace is gone or the id is wrong). Rendered under the site header.
 */
export default function DashboardNotFound() {
    return (
        <ShellNotice
            code="404 · Not found"
            numeral="404"
            serif="Nothing"
            heavy="here"
            actions={
                <PaddockLinkButton href="/dashboard" size="lg" surface="night">
                    Go to your workspaces
                </PaddockLinkButton>
            }
        >
            This workspace or page does not exist. It may have been deleted, or
            the link is out of date.
        </ShellNotice>
    );
}
