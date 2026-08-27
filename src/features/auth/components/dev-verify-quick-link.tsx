export interface DevVerifyQuickLinkProps {
    verifyUrl: string;
}

export function DevVerifyQuickLink({ verifyUrl }: DevVerifyQuickLinkProps) {
    return (
        <div className="flex flex-col gap-2 p-3 bg-brand-muted border-2 border-brand-border rounded-brand">
            <span className="font-brand-mono text-[10px] uppercase tracking-widest text-brand-subtle">
                Development Quick Link
            </span>
            <a
                href={verifyUrl}
                className="inline-flex items-center justify-center font-brand-mono font-semibold text-xs uppercase tracking-widest bg-brand-ink text-brand-surface py-2 px-3 rounded-brand hover:bg-brand-accent transition-colors"
            >
                Verify Email Now →
            </a>
        </div>
    );
}
