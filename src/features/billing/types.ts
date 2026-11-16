import type {
    SubscriptionPlanValue,
    SubscriptionStatusValue,
} from "@/schemas/billing";

export interface WorkspaceSubscription {
    /** Plan recorded on the subscription row, regardless of status. */
    plan: SubscriptionPlanValue;
    /** Plan the workspace may actually use right now (a lapsed Pro reads as Free). */
    effectivePlan: SubscriptionPlanValue;
    status: SubscriptionStatusValue;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: Date | null;
    /** True once the workspace exists in Stripe and can open the billing portal. */
    hasStripeCustomer: boolean;
    /** True while a Stripe subscription backs the plan, so it can be switched or cancelled. */
    hasStripeSubscription: boolean;
}

export interface InvoiceRecord {
    id: string;
    /** Stripe's human-readable invoice number; `null` on a draft. */
    number: string | null;
    createdAt: Date;
    periodStart: Date;
    periodEnd: Date;
    /** Amounts are in the currency's smallest unit, as Stripe reports them. */
    amountDue: number;
    amountPaid: number;
    currency: string;
    status: string | null;
    hostedUrl: string | null;
    pdfUrl: string | null;
}

export interface PaymentRecord {
    id: string;
    createdAt: Date;
    amount: number;
    amountRefunded: number;
    currency: string;
    /** `succeeded`, `pending`, `failed`, or `refunded`. */
    status: string;
    cardBrand: string | null;
    cardLast4: string | null;
    receiptUrl: string | null;
}

export type BillingHistory =
    | { status: "ok"; invoices: InvoiceRecord[]; payments: PaymentRecord[] }
    | { status: "unavailable"; reason: string };
