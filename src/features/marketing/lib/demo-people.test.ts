import { paddockPresenceVar } from "@/components/paddock/paddock-presence";
import { DEMO_PEOPLE, DEMO_TRIO } from "@/features/marketing/lib/demo-people";

describe("demo people", () => {
    it("lists the three collaborators in order", () => {
        expect(DEMO_TRIO.map((person) => person.name)).toEqual([
            "Ama",
            "Ravi",
            "Jonna",
        ]);
        expect(DEMO_TRIO).toEqual(Object.values(DEMO_PEOPLE));
    });

    it("hashes onto three distinct hues (do not change an id without checking)", () => {
        const hues = new Set(
            DEMO_TRIO.map((person) => paddockPresenceVar(person.id)),
        );
        expect(hues.size).toBe(3);
    });
});
