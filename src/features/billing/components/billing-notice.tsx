import type { ReactNode } from "react";
import { Check, CircleAlert, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/cn";

export type BillingNoticeTone = "success" | "warning" | "danger";

export interface BillingNoticeProps {
    tone: BillingNoticeTone;
    children: ReactNode;
    "data-testid"?: string;
    className?: string;
}

const TONES: Record<
    BillingNoticeTone,
    { frame: string; badge: string; Icon: typeof Check }
> = {
    success: {
        frame: "border-paddock-ink",
        badge: "paddock-night text-paddock-lime",
        Icon: Check,
    },
    warning: {
        frame: "border-paddock-warning",
        badge: "text-paddock-warning",
        Icon: TriangleAlert,
    },
    danger: {
        frame: "border-paddock-danger",
        badge: "text-paddock-danger",
        Icon: CircleAlert,
    },
};

/**
 * A one-line message on paper. The icon and the sentence carry the meaning;
 * the rule colour only reinforces it. Danger interrupts (`alert`), the others
 * wait their turn (`status`).
 */
export function BillingNotice({
    tone,
    children,
    "data-testid": testId,
    className,
}: BillingNoticeProps) {
    const { frame, badge, Icon } = TONES[tone];

    return (
        <div
            role={tone === "danger" ? "alert" : "status"}
            data-testid={testId}
            className={cn(
                "flex items-start gap-3 rounded-paddock-card border-[1.5px] bg-paddock-sheet px-4.5 py-3.5 text-[0.9375rem]",
                frame,
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "mt-px flex size-5.5 shrink-0 items-center justify-center rounded-full",
                    badge,
                )}
            >
                <Icon
                    className={tone === "success" ? "size-3" : "size-5"}
                    strokeWidth={tone === "success" ? 3 : 2.2}
                />
            </span>
            <p className="m-0 font-medium">{children}</p>
        </div>
    );
}
