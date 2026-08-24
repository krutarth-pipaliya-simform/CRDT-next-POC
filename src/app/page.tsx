import { logoutAction } from "@/features/auth/actions/logout";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
            <h1 className="text-4xl font-bold">CRDT Next POC</h1>
            <form action={logoutAction}>
                <Button type="submit" size="sm">
                    Sign Out
                </Button>
            </form>
        </main>
    );
}
