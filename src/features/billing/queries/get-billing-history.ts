import { getManagedSubscription } from "../lib/managed-subscription";
import type { BillingHistory } from "../types";

import "server-only";

/** Enough for a year of monthly invoices plus a few prorations. */
const HISTORY_LIMIT = 24;

/**
 * Invoices and payments for a workspace, read live from Stripe, which is the
 * record of what was billed and paid. Nothing here is stored locally. Admins
 * only: the guard is repeated here so a page cannot leak billing data by
 * forgetting its own.
 */
export async function getBillingHistory(
    workspaceId: string,
): Promise<BillingHistory> {
    const managed = await getManagedSubscription(workspaceId);
    if (!managed.success) {
        return { status: "unavailable", reason: managed.error };
    }

    const { stripeContext, subscription } = managed.data;
    const customer = subscription?.stripeCustomerId;
    if (!customer) {
        return { status: "ok", invoices: [], payments: [] };
    }

    try {
        const { stripe } = stripeContext;
        const [invoices, charges] = await Promise.all([
            stripe.invoices.list({ customer, limit: HISTORY_LIMIT }),
            stripe.charges.list({ customer, limit: HISTORY_LIMIT }),
        ]);

        return {
            status: "ok",
            invoices: invoices.data.map((invoice) => ({
                id: invoice.id,
                number: invoice.number,
                createdAt: new Date(invoice.created * 1000),
                periodStart: new Date(invoice.period_start * 1000),
                periodEnd: new Date(invoice.period_end * 1000),
                amountDue: invoice.amount_due,
                amountPaid: invoice.amount_paid,
                currency: invoice.currency,
                status: invoice.status,
                hostedUrl: invoice.hosted_invoice_url ?? null,
                pdfUrl: invoice.invoice_pdf ?? null,
            })),
            payments: charges.data.map((charge) => ({
                id: charge.id,
                createdAt: new Date(charge.created * 1000),
                amount: charge.amount,
                amountRefunded: charge.amount_refunded,
                currency: charge.currency,
                status: charge.refunded ? "refunded" : charge.status,
                cardBrand: charge.payment_method_details?.card?.brand ?? null,
                cardLast4: charge.payment_method_details?.card?.last4 ?? null,
                receiptUrl: charge.receipt_url,
            })),
        };
    } catch (error) {
        console.error("[billing] history fetch failed", error);
        return {
            status: "unavailable",
            reason: "Stripe did not return the billing history. Try again shortly.",
        };
    }
}
