/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import { NotificationRow } from "@/components/paddock/notification-row";

const base = {
    href: "/w1/tasks",
    title: "You were assigned a task",
    time: "4m",
    dateTime: "2026-01-01T00:00:00.000Z",
};

function renderRow(props: Partial<Parameters<typeof NotificationRow>[0]> = {}) {
    return render(
        <ul>
            <NotificationRow {...base} {...props} />
        </ul>,
    );
}

describe("NotificationRow", () => {
    it("is a link to its target with the title, time and machine-readable date", () => {
        renderRow({ body: "Fix login" });
        expect(
            screen.getByRole("link", { name: /You were assigned a task/ }),
        ).toHaveAttribute("href", "/w1/tasks");
        expect(screen.getByText("Fix login")).toBeInTheDocument();
        expect(screen.getByText("4m")).toHaveAttribute(
            "datetime",
            base.dateTime,
        );
    });

    it("says Unread in words, not only by colour", () => {
        const { unmount } = renderRow();
        expect(screen.queryByText("Unread")).toBeNull();
        unmount();

        renderRow({ unread: true });
        expect(screen.getByText("Unread")).toHaveClass("sr-only");
        expect(screen.getByText(base.title)).toHaveClass("font-bold");
    });

    it("shows the actor's avatar, or the icon for a system notice", () => {
        const { unmount } = renderRow({
            actor: { id: "u1", name: "Ada Lovelace" },
        });
        expect(screen.getByText("AL")).toBeInTheDocument();
        unmount();

        renderRow({ icon: <span data-testid="sys-icon" /> });
        expect(screen.getByTestId("sys-icon")).toBeInTheDocument();
    });
});
