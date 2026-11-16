import { notify } from "@/features/notification/lib/notify";
import { notifyTaskChange } from "@/features/task/lib/notify-task-change";
import type { TaskWithAssignee } from "@/features/task/types";

jest.mock("@/features/notification/lib/notify", () => ({ notify: jest.fn() }));

const mockNotify = jest.mocked(notify);

function task(overrides: {
    status?: TaskWithAssignee["status"];
    assigneeUserId?: string | null;
}): TaskWithAssignee {
    const { status = "TODO", assigneeUserId = null } = overrides;
    return {
        id: "t1",
        title: "Write docs",
        description: "details",
        status,
        priority: "MEDIUM",
        position: 1,
        dueDate: null,
        workspaceId: "w1",
        assigneeId: assigneeUserId ? "m1" : null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        assignee: assigneeUserId
            ? {
                  id: "m1",
                  workspaceId: "w1",
                  userId: assigneeUserId,
                  role: "MEMBER",
                  joinedAt: new Date(0),
                  user: {
                      id: assigneeUserId,
                      name: "N",
                      email: null,
                      image: null,
                  },
              }
            : null,
    };
}

describe("notifyTaskChange", () => {
    it("tells a new assignee, and only them", async () => {
        await notifyTaskChange({
            task: task({ assigneeUserId: "u2" }),
            previousStatus: "TODO",
            previousAssigneeUserId: null,
            actorId: "u1",
        });

        expect(mockNotify).toHaveBeenCalledTimes(1);
        expect(mockNotify).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "TASK_ASSIGNED",
                recipientIds: ["u2"],
                actorId: "u1",
                href: "/w1/tasks",
                title: 'You were assigned "Write docs"',
            }),
        );
    });

    it("does not re-announce an unchanged assignee", async () => {
        await notifyTaskChange({
            task: task({ assigneeUserId: "u2" }),
            previousStatus: "TODO",
            previousAssigneeUserId: "u2",
            actorId: "u1",
        });
        expect(mockNotify).not.toHaveBeenCalled();
    });

    it("never notifies the actor about assigning a task to themselves", async () => {
        await notifyTaskChange({
            task: task({ assigneeUserId: "u1" }),
            previousStatus: "TODO",
            previousAssigneeUserId: null,
            actorId: "u1",
        });
        expect(mockNotify).not.toHaveBeenCalled();
    });

    it("announces completion to everyone except the actor", async () => {
        await notifyTaskChange({
            task: task({ status: "DONE" }),
            previousStatus: "REVIEW",
            previousAssigneeUserId: null,
            actorId: "u1",
        });

        expect(mockNotify).toHaveBeenCalledTimes(1);
        expect(mockNotify).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "TASK_COMPLETED",
                excludeUserIds: ["u1"],
                title: '"Write docs" was completed',
            }),
        );
    });

    it("does not announce a task that was already done", async () => {
        await notifyTaskChange({
            task: task({ status: "DONE" }),
            previousStatus: "DONE",
            previousAssigneeUserId: null,
            actorId: "u1",
        });
        expect(mockNotify).not.toHaveBeenCalled();
    });

    it("can announce both an assignment and a completion", async () => {
        await notifyTaskChange({
            task: task({ status: "DONE", assigneeUserId: "u2" }),
            previousStatus: "IN_PROGRESS",
            previousAssigneeUserId: null,
            actorId: "u1",
        });
        expect(mockNotify.mock.calls.map(([input]) => input.type)).toEqual([
            "TASK_ASSIGNED",
            "TASK_COMPLETED",
        ]);
    });
});
