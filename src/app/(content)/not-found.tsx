import { ShellNotice } from "@/components/layout/shell-notice";
import { PaddockLinkButton } from "@/components/paddock/paddock-button";

/** A `notFound()` from a blog post, doc or other content page. */
export default function ContentNotFound() {
    return (
        <ShellNotice
            code="404 · Not found"
            numeral="404"
            serif="Nothing"
            heavy="here"
            actions={
                <>
                    <PaddockLinkButton href="/blog" size="lg" surface="night">
                        Read the blog
                    </PaddockLinkButton>
                    <PaddockLinkButton
                        href="/docs"
                        variant="outline"
                        size="lg"
                        surface="night"
                    >
                        Browse the docs
                    </PaddockLinkButton>
                </>
            }
        >
            This page does not exist. It may have been unpublished, or the link
            is out of date.
        </ShellNotice>
    );
}
