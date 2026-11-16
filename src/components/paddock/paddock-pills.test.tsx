/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import {
    PriorityLabel,
    RolePill,
    StatusPill,
} from "@/components/paddock/paddock-pills";
import {
    TASK_PRIORITY_LABELS,
    TASK_STATUS_LABELS,
} from "@/features/task/types";
import { WORKSPACE_ROLE_LABELS } from "@/schemas/workspace";

describe("StatusPill", () => {
    it.each(Object.entries(TASK_STATUS_LABELS))(
        "shows the shared label for %s",
        (status, label) => {
            if (
                status !== "BACKLOG" &&
                status !== "TODO" &&
                status !== "IN_PROGRESS" &&
                status !== "REVIEW" &&
                status !== "DONE"
            ) {
                throw new Error(`unexpected status ${status}`);
            }
            render(<StatusPill status={status} />);
            expect(screen.getByText(label)).toBeInTheDocument();
        },
    );

    it("fills only the completed state", () => {
        render(<StatusPill status="DONE" />);
        expect(screen.getByText("Completed")).toHaveClass("bg-paddock-inverse");
    });
});

describe("PriorityLabel", () => {
    it("announces the word, not just the colour", () => {
        render(<PriorityLabel priority="URGENT" />);
        expect(screen.getByText("Priority:")).toHaveClass("sr-only");
        expect(
            screen.getByText(TASK_PRIORITY_LABELS.URGENT),
        ).toBeInTheDocument();
    });

    it("tones urgency, leaving low priorities neutral", () => {
        const { container, rerender } = render(
            <PriorityLabel priority="HIGH" />,
        );
        expect(container.firstElementChild).toHaveClass("text-paddock-warning");
        rerender(<PriorityLabel priority="URGENT" />);
        expect(container.firstElementChild).toHaveClass("text-paddock-danger");
        rerender(<PriorityLabel priority="LOW" />);
        expect(container.firstElementChild).toHaveClass("text-paddock-subtle");
    });
});

describe("RolePill", () => {
    it.each(["ADMIN", "MEMBER", "GUEST"] as const)(
        "labels %s from the shared role labels",
        (role) => {
            render(<RolePill role={role} />);
            expect(
                screen.getByText(WORKSPACE_ROLE_LABELS[role]),
            ).toBeInTheDocument();
        },
    );

    it("fills admin, dashes guest", () => {
        const { rerender } = render(<RolePill role="ADMIN" />);
        expect(screen.getByText("Admin")).toHaveClass("bg-paddock-night");
        rerender(<RolePill role="GUEST" />);
        expect(screen.getByText("Guest")).toHaveClass("border-dashed");
    });
});
