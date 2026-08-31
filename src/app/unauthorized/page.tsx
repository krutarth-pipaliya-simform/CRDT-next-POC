import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
    return (
        <main className="min-h-[80vh] flex items-center justify-center p-6 bg-brand-surface">
            <Card elevated className="max-w-md w-full text-center">
                <CardHeader className="flex flex-col items-center gap-2 pb-4 mb-4 border-b-2 border-brand-muted">
                    <span className="font-brand-mono text-xs uppercase tracking-widest text-brand-danger">
                        403 · Access Denied
                    </span>
                    <CardTitle className="text-2xl font-bold text-brand-ink">
                        Unauthorized Access
                    </CardTitle>
                </CardHeader>
                <CardBody className="flex flex-col gap-6 text-brand-subtle">
                    <p className="text-sm leading-relaxed">
                        You do not have permission to access this private
                        workspace or resource. If you were previously a member,
                        your access may have been revoked or the workspace
                        visibility updated.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Link href="/dashboard">
                            <Button variant="primary">
                                Return to Dashboard
                            </Button>
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </main>
    );
}
