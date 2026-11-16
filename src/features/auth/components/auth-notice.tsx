import type { ReactNode } from "react";
import { CircleAlert, MailCheck } from "lucide-react";

import { cn } from "@/lib/cn";

export type AuthNoticeTone = "success" | "danger";

export interface AuthNoticeProps {
    tone: AuthNoticeTone;
    children: ReactNode;
    className?: string;
}

/**
 * A message from the server. Success is the lime fill (a fill, so its text is
 * `on-fill`); danger is an outlined sentence. Each carries an icon as well as
 * colour, and both are announced when they appear.
 */
export function AuthNotice({ tone, children, className }: AuthNoticeProps) {
    const success = tone === "success";
    const Icon = success ? MailCheck : CircleAlert;

    return (
        <div
            role={success ? "status" : "alert"}
            className={cn(
                "flex items-start gap-3 rounded-paddock text-[0.9375rem] font-semibold",
                success
                    ? "bg-paddock-lime p-4.5 text-paddock-on-fill"
                    : "border-[1.5px] border-paddock-danger bg-paddock-sheet px-4 py-3 text-paddock-danger",
                className,
            )}
        >
            <Icon
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0"
                strokeWidth={1.8}
            />
            <span className="min-w-0">{children}</span>
        </div>
    );
}
