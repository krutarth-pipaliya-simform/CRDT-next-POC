import {
    isSectionCurrent,
    workspaceSections,
} from "@/components/layout/workspace-sections";

describe("workspaceSections", () => {
    it("lists the sections in order under the workspace id", () => {
        const sections = workspaceSections("w1", "MEMBER");
        expect(sections.map((section) => section.label)).toEqual([
            "Overview",
            "Documents",
            "Tasks",
            "Chat",
            "Activity",
            "Analytics",
        ]);
        expect(
            sections.every((section) => section.href.startsWith("/w1")),
        ).toBe(true);
    });

    it("adds Settings for admins only", () => {
        expect(workspaceSections("w1", "ADMIN").at(-1)).toEqual({
            label: "Settings",
            href: "/w1/settings",
        });
        for (const role of ["MEMBER", "GUEST", null] as const) {
            expect(
                workspaceSections("w1", role).some(
                    (section) => section.label === "Settings",
                ),
            ).toBe(false);
        }
    });
});

describe("isSectionCurrent", () => {
    it("matches an exact section strictly", () => {
        const overview = { href: "/w1", exact: true };
        expect(isSectionCurrent("/w1", overview)).toBe(true);
        expect(isSectionCurrent("/w1/tasks", overview)).toBe(false);
    });

    it("matches a prefix section on itself and its children only", () => {
        const tasks = { href: "/w1/tasks" };
        expect(isSectionCurrent("/w1/tasks", tasks)).toBe(true);
        expect(isSectionCurrent("/w1/tasks/t9", tasks)).toBe(true);
        expect(isSectionCurrent("/w1/tasks-archive", tasks)).toBe(false);
        expect(isSectionCurrent("/w1/chat", tasks)).toBe(false);
    });
});
