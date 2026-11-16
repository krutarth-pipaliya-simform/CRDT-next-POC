/**
 * An amount in a currency's smallest unit (as Stripe reports it) as display
 * text: `formatMoney(1200, "usd")` is "$12.00". Zero-decimal currencies such
 * as JPY are handled by `Intl`, which knows each currency's minor unit.
 */
export function formatMoney(amountMinor: number, currency: string): string {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    });
    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(amountMinor / 10 ** digits);
}
