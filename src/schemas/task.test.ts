import {
    createTaskSchema,
    deleteTaskSchema,
    moveTaskSchema,
    setTaskPrioritySchema,
    taskPrioritySchema,
    taskStatusSchema,
    updateTaskSchema,
} from "@/schemas/task";

describe("createTaskSchema", () => {
    it("applies defaults and trims the title", () => {
        const task = createTaskSchema.parse({
            workspaceId: "w1",
            title: "  Ship it ",
        });
        expect(task).toMatchObject({
            title: "Ship it",
            status: "TODO",
            priority: "MEDIUM",
        });
    });

    it("rejects blank and over-long titles", () => {
        expect(
            createTaskSchema.safeParse({ workspaceId: "w1", title: "   " })
                .success,
        ).toBe(false);
        expect(
            createTaskSchema.safeParse({
                workspaceId: "w1",
                title: "x".repeat(201),
            }).success,
        ).toBe(false);
    });

    it("allows blank optional form fields", () => {
        expect(
            createTaskSchema.safeParse({
                workspaceId: "w1",
                title: "T",
                description: "",
                assigneeId: "",
                dueDate: "",
            }).success,
        ).toBe(true);
    });

    it("rejects unknown status or priority values", () => {
        expect(
            createTaskSchema.safeParse({
                workspaceId: "w1",
                title: "T",
                status: "ARCHIVED",
            }).success,
        ).toBe(false);
        expect(taskPrioritySchema.safeParse("CRITICAL").success).toBe(false);
    });
});

describe("task mutation schemas", () => {
    it("exposes the five board columns as statuses", () => {
        expect(taskStatusSchema.options).toEqual([
            "BACKLOG",
            "TODO",
            "IN_PROGRESS",
            "REVIEW",
            "DONE",
        ]);
    });

    it("allows null to clear assignee and due date on update", () => {
        expect(
            updateTaskSchema.safeParse({
                taskId: "t1",
                assigneeId: null,
                dueDate: null,
            }).success,
        ).toBe(true);
        expect(updateTaskSchema.safeParse({ title: "x" }).success).toBe(false);
    });

    it("requires a numeric position to move", () => {
        expect(
            moveTaskSchema.safeParse({
                taskId: "t1",
                status: "DONE",
                position: "1",
            }).success,
        ).toBe(false);
        expect(
            moveTaskSchema.safeParse({
                taskId: "t1",
                status: "DONE",
                position: 1.5,
            }).success,
        ).toBe(true);
    });

    it("validates priority and delete payloads", () => {
        expect(
            setTaskPrioritySchema.safeParse({ taskId: "t1", priority: "HIGH" })
                .success,
        ).toBe(true);
        expect(deleteTaskSchema.safeParse({ taskId: "" }).success).toBe(false);
    });
});
