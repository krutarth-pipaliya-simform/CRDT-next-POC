import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WorkspaceUnauthorizedPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;

    return (
        <main className="max-w-xl mx-auto px-6 py-16 flex items-center justify-center">
            <Card elevated className="w-full text-center">
                <CardHeader className="flex flex-col items-center gap-2 pb-4 mb-4 border-b-2 border-brand-muted">
                    <span className="font-brand-mono text-xs uppercase tracking-widest text-brand-danger">
                        403 · Restricted Area
                    </span>
                    <CardTitle className="text-2xl font-bold text-brand-ink">
                        Permission Required
                    </CardTitle>
                </CardHeader>
                <CardBody className="flex flex-col gap-6 text-brand-subtle">
                    <p className="text-sm leading-relaxed">
                        You do not have the required role to access this section
                        in workspace{" "}
                        <span className="font-brand-mono text-brand-ink font-semibold">
                            {workspaceId}
                        </span>
                        .
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Link href={`/${workspaceId}`}>
                            <Button variant="primary">
                                Return to Workspace
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="secondary">Go to Dashboard</Button>
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </main>
    );
}
