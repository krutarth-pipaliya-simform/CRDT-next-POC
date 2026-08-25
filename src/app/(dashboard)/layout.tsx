import { SiteHeader } from "@/components/layout/site-header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <SiteHeader />
            <div className="dashboard-layout flex-1">{children}</div>
        </>
    );
}
