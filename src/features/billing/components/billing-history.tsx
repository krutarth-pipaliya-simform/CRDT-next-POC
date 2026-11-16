import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { DisplayHeading } from "@/components/paddock/display-heading";
import { NotchedCard } from "@/components/paddock/notched-card";
import { Tag } from "@/components/paddock/tag";
import { cn } from "@/lib/cn";
import { formatCalendarDate } from "@/lib/format-time";

import { formatMoney } from "../lib/format-money";
import type { BillingHistory as BillingHistoryData } from "../types";

import { BillingNotice } from "./billing-notice";

export interface BillingHistoryProps {
    history: BillingHistoryData;
}

const CELL = "border-t border-paddock-rule px-3 py-3 text-left align-middle";
const HEAD =
    "paddock-tag px-3 pb-2.5 text-left text-[0.6875rem] font-normal text-paddock-subtle";
const LINK =
    "inline-flex items-center gap-1 font-semibold text-paddock-ink underline decoration-[1.5px] underline-offset-[3px] hover:decoration-transparent";

/** Statuses read as words; only a problem gets colour, and never colour alone. */
const STATUS_LABELS: Record<string, string> = {
    paid: "Paid",
    open: "Open",
    draft: "Draft",
    void: "Void",
    uncollectible: "Uncollectible",
    succeeded: "Succeeded",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded",
};
const PROBLEM_STATUSES = new Set(["open", "uncollectible", "failed"]);

interface StatusTextProps {
    status: string | null;
}

function StatusText({ status }: StatusTextProps) {
    const key = status ?? "draft";
    return (
        <span
            className={cn(
                "font-semibold",
                PROBLEM_STATUSES.has(key) && "text-paddock-danger",
            )}
        >
            {STATUS_LABELS[key] ?? key}
        </span>
    );
}

interface ExternalLinkProps {
    href: string;
    children: ReactNode;
}

function ExternalLink({ href, children }: ExternalLinkProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
        >
            {children}
            <ArrowUpRight
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={2.4}
            />
            <span className="sr-only"> (opens in a new tab)</span>
        </a>
    );
}

interface HistoryTableProps {
    caption: string;
    headers: string[];
    /** Shown instead of the table when there are no rows. */
    empty: string | null;
    children: ReactNode;
    testId: string;
}

function HistoryTable({
    caption,
    headers,
    empty,
    children,
    testId,
}: HistoryTableProps) {
    return (
        <div className="flex flex-col gap-3" data-testid={testId}>
            <Tag as="h3" tone="ink">
                {caption}
            </Tag>
            {empty ? (
                <p className="m-0 text-sm text-paddock-subtle">{empty}</p>
            ) : (
                // Wide tables scroll inside their own box on a phone, never the page.
                <div className="-mx-3 overflow-x-auto">
                    <table className="w-full min-w-[34rem] border-collapse text-sm">
                        <caption className="sr-only">{caption}</caption>
                        <thead>
                            <tr>
                                {headers.map((header) => (
                                    <th
                                        key={header}
                                        scope="col"
                                        className={HEAD}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>{children}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/**
 * Invoices and payments for the workspace, read from Stripe on each visit
 * (FR-21). Invoices link to Stripe's hosted page and PDF; payments to their
 * receipt. Amounts and dates are data, so they are set in mono.
 */
export function BillingHistory({ history }: BillingHistoryProps) {
    return (
        <NotchedCard
            tone="sheet"
            bodyClassName="flex flex-col gap-8 px-6 pt-7 pb-10 sm:px-8"
        >
            <section
                aria-labelledby="billing-history-heading"
                className="flex flex-col gap-8"
            >
                <DisplayHeading
                    id="billing-history-heading"
                    as="h2"
                    size="md"
                    layout="inline"
                    serif="Billing"
                    heavy="history"
                />

                {history.status === "unavailable" ? (
                    <BillingNotice
                        tone="warning"
                        data-testid="billing-history-unavailable"
                    >
                        {history.reason}
                    </BillingNotice>
                ) : (
                    <>
                        <HistoryTable
                            caption="Invoices"
                            testId="invoice-history"
                            headers={[
                                "Date",
                                "Invoice",
                                "Period",
                                "Amount",
                                "Status",
                                "",
                            ]}
                            empty={
                                history.invoices.length === 0
                                    ? "No invoices yet. The first one is issued when this workspace upgrades."
                                    : null
                            }
                        >
                            {history.invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td
                                        className={cn(
                                            CELL,
                                            "paddock-mono whitespace-nowrap",
                                        )}
                                    >
                                        {formatCalendarDate(invoice.createdAt)}
                                    </td>
                                    <td className={cn(CELL, "paddock-mono")}>
                                        {invoice.number ?? "Draft"}
                                    </td>
                                    <td
                                        className={cn(
                                            CELL,
                                            "paddock-mono whitespace-nowrap text-paddock-subtle",
                                        )}
                                    >
                                        {formatCalendarDate(
                                            invoice.periodStart,
                                        )}{" "}
                                        –{" "}
                                        {formatCalendarDate(invoice.periodEnd)}
                                    </td>
                                    <td
                                        className={cn(
                                            CELL,
                                            "paddock-mono whitespace-nowrap",
                                        )}
                                    >
                                        {formatMoney(
                                            invoice.status === "paid"
                                                ? invoice.amountPaid
                                                : invoice.amountDue,
                                            invoice.currency,
                                        )}
                                    </td>
                                    <td className={CELL}>
                                        <StatusText status={invoice.status} />
                                    </td>
                                    <td
                                        className={cn(
                                            CELL,
                                            "whitespace-nowrap text-right",
                                        )}
                                    >
                                        <span className="inline-flex gap-4">
                                            {invoice.hostedUrl ? (
                                                <ExternalLink
                                                    href={invoice.hostedUrl}
                                                >
                                                    View
                                                </ExternalLink>
                                            ) : null}
                                            {invoice.pdfUrl ? (
                                                <ExternalLink
                                                    href={invoice.pdfUrl}
                                                >
                                                    PDF
                                                </ExternalLink>
                                            ) : null}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </HistoryTable>

                        <HistoryTable
                            caption="Payments"
                            testId="payment-history"
                            headers={["Date", "Card", "Amount", "Status", ""]}
                            empty={
                                history.payments.length === 0
                                    ? "No payments yet."
                                    : null
                            }
                        >
                            {history.payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td
                                        className={cn(
                                            CELL,
                                            "paddock-mono whitespace-nowrap",
                                        )}
                                    >
                                        {formatCalendarDate(payment.createdAt)}
                                    </td>
                                    <td
                                        className={cn(
                                            CELL,
                                            "whitespace-nowrap",
                                        )}
                                    >
                                        {payment.cardLast4 ? (
                                            <>
                                                <span className="capitalize">
                                                    {payment.cardBrand ??
                                                        "Card"}
                                                </span>{" "}
                                                <span className="paddock-mono">
                                                    •••• {payment.cardLast4}
                                                </span>
                                            </>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td
                                        className={cn(
                                            CELL,
                                            "paddock-mono whitespace-nowrap",
                                        )}
                                    >
                                        {formatMoney(
                                            payment.amount,
                                            payment.currency,
                                        )}
                                        {payment.amountRefunded > 0 &&
                                        payment.amountRefunded <
                                            payment.amount ? (
                                            <span className="text-paddock-subtle">
                                                {" "}
                                                (
                                                {formatMoney(
                                                    payment.amountRefunded,
                                                    payment.currency,
                                                )}{" "}
                                                refunded)
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className={CELL}>
                                        <StatusText status={payment.status} />
                                    </td>
                                    <td
                                        className={cn(
                                            CELL,
                                            "whitespace-nowrap text-right",
                                        )}
                                    >
                                        {payment.receiptUrl ? (
                                            <ExternalLink
                                                href={payment.receiptUrl}
                                            >
                                                Receipt
                                            </ExternalLink>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </HistoryTable>
                    </>
                )}
            </section>
        </NotchedCard>
    );
}
