import { PAGE_CONTAINER } from "@/components/layout/layout-styles";

/** Skeleton shown while a content page waits for the CMS. */
export default function ContentLoading() {
    return (
        <main
            className={`${PAGE_CONTAINER} py-14`}
            aria-busy="true"
            aria-label="Loading content"
        >
            <div className="h-16 w-2/3 rounded-paddock-panel bg-paddock-sheet motion-safe:animate-pulse" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((key) => (
                    <div
                        key={key}
                        className="h-44 rounded-paddock-panel bg-paddock-sheet motion-safe:animate-pulse"
                    />
                ))}
            </div>
        </main>
    );
}
