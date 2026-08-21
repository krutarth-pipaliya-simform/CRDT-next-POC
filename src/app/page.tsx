import { logoutAction } from "@/features/auth/actions/logout";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
            <h1 className="text-4xl font-bold">CRDT Next POC</h1>
            <form action={logoutAction}>
                <button
                    type="submit"
                    className="px-4 py-2 bg-[#1A1A1A] text-[#FBFBFB] font-mono text-xs uppercase tracking-wider hover:bg-[#333333] transition-colors"
                >
                    Sign Out
                </button>
            </form>
        </main>
    );
}
