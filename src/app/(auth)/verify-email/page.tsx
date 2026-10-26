import type { Metadata } from "next";
import { Check, Link2, X } from "lucide-react";

import { NotchedCard } from "@/components/paddock/notched-card";
import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import { Scribble } from "@/components/paddock/scribble";
import { Tag } from "@/components/paddock/tag";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { PublicScreen } from "@/features/auth/components/public-screen";
import { verifyToken } from "@/features/auth/lib/tokens";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
    title: "Verify your email",
};

interface VerifyView {
    tag: string;
    serif: string;
    heavy: string;
    body: string;
    cta: string;
    verified: boolean;
    Icon: typeof Check;
}

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Next.js 16 breaking change: searchParams must be awaited
    const awaitedParams = await searchParams;
    const token = awaitedParams.token;

    let view: VerifyView;

    if (!token || typeof token !== "string") {
        view = {
            tag: "Missing link",
            serif: "No link",
            heavy: "found",
            body: "No verification token was included in this address. Open the link from your email again.",
            cta: "Back to log in",
            verified: false,
            Icon: Link2,
        };
    } else {
        const result = await verifyToken(token);

        view = result.success
            ? {
                  tag: "Email confirmed",
                  serif: "Email",
                  heavy: "verified",
                  body: result.success,
                  cta: "Proceed to log in",
                  verified: true,
                  Icon: Check,
              }
            : {
                  tag: "Verification failed",
                  serif: "Verification",
                  heavy: "failed",
                  body:
                      result.error ??
                      "This verification link could not be used.",
                  cta: "Back to log in",
                  verified: false,
                  Icon: X,
              };
    }

    const { Icon } = view;

    return (
        <PublicScreen>
            <div className="w-full max-w-[35rem]">
                <Tag as="p" tone="ink" className="mb-1.5">
                    {view.tag}
                </Tag>
                <NotchedCard
                    notch="top"
                    bodyClassName="flex flex-col items-center gap-4.5 px-6 pt-16 pb-11 text-center sm:px-12"
                >
                    <span
                        aria-hidden="true"
                        className={cn(
                            "flex size-18 items-center justify-center rounded-full",
                            view.verified
                                ? "bg-paddock-lime text-paddock-on-fill"
                                : "bg-paddock-inverse text-paddock-on-inverse",
                        )}
                    >
                        <Icon className="size-7.5" strokeWidth={3} />
                    </span>

                    <div className="relative">
                        {view.verified ? (
                            <Scribble
                                shape="loop"
                                className="absolute -top-2.5 left-1/2 h-20 w-60 -translate-x-1/2"
                            />
                        ) : null}
                        {/* Positioned after the scribble so the type paints
                            over the stroke, like ink over a highlighter. */}
                        <AuthHeading
                            serif={view.serif}
                            heavy={view.heavy}
                            align="center"
                            className="relative"
                        />
                    </div>

                    <p className="m-0 max-w-[25rem] text-paddock-subtle">
                        {view.body}
                    </p>

                    <PaddockLinkButton
                        href="/login"
                        variant={view.verified ? "primary" : "outline"}
                        className="mt-2"
                    >
                        {view.cta}
                    </PaddockLinkButton>
                </NotchedCard>
            </div>
        </PublicScreen>
    );
}
