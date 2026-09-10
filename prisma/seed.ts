import { Role, TaskPriority, TaskStatus } from "@prisma/client";

import { db as prisma } from "@/lib/db";

async function main() {
    console.log("Seeding database...");

    // 1. Create a workspace with a specific ID to match our hardcoded test URL
    const workspaceId = "test-workspace-123";

    const workspace = await prisma.workspace.upsert({
        where: { id: workspaceId },
        update: {},
        create: {
            id: workspaceId,
            name: "Testing Workspace",
        },
    });
    console.log(`Created workspace: ${workspace.name} (${workspace.id})`);

    // 2. Create 3 users
    const usersData = [
        { email: "admin@test.com", name: "Alice Admin", role: Role.ADMIN },
        { email: "member@test.com", name: "Bob Member", role: Role.MEMBER },
        { email: "guest@test.com", name: "Charlie Guest", role: Role.GUEST },
    ];

    for (const data of usersData) {
        const user = await prisma.user.upsert({
            where: { email: data.email },
            update: {},
            create: {
                email: data.email,
                name: data.name,
                password: "password123", // In a real app this should be hashed, but for testing it's fine
            },
        });

        console.log(`Created user: ${user.name} (${user.email})`);

        // 3. Assign roles in the workspace
        // Check if member already exists to prevent duplicate unique errors if there's no unique constraint
        // Wait, WorkspaceMember doesn't have a unique constraint on [workspaceId, userId] in schema? Let's check.
        // It has `id`, `workspaceId`, `userId`. I will just use findFirst, then create.

        const existingMember = await prisma.workspaceMember.findFirst({
            where: {
                workspaceId: workspace.id,
                userId: user.id,
            },
        });

        if (!existingMember) {
            await prisma.workspaceMember.create({
                data: {
                    workspaceId: workspace.id,
                    userId: user.id,
                    role: data.role,
                },
            });
            console.log(`Assigned ${user.name} as ${data.role}`);
        } else {
            console.log(
                `${user.name} is already a member with role ${existingMember.role}`,
            );
        }
    }

    // 4. Create sample tasks for testing
    const sampleTasks = [
        {
            title: "Set up CI/CD pipeline",
            description:
                "Configure GitHub Actions workflows for lint, type-check, and automated E2E tests.",
            status: TaskStatus.TODO,
            priority: TaskPriority.HIGH,
            position: 1024,
        },
        {
            title: "Design landing page mockup",
            description:
                "Create high-fidelity designs conforming to Machined Precision design guidelines.",
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.MEDIUM,
            position: 1024,
        },
        {
            title: "Implement user authentication",
            description:
                "NextAuth v5 session management, verification emails, and credentials flow.",
            status: TaskStatus.DONE,
            priority: TaskPriority.URGENT,
            position: 1024,
        },
        {
            title: "Write API documentation",
            description:
                "Document all endpoints, Server Actions, and CRDT data structures.",
            status: TaskStatus.TODO,
            priority: TaskPriority.LOW,
            position: 2048,
        },
    ];

    for (const taskData of sampleTasks) {
        const existingTask = await prisma.task.findFirst({
            where: {
                workspaceId: workspace.id,
                title: taskData.title,
            },
        });

        if (!existingTask) {
            await prisma.task.create({
                data: {
                    ...taskData,
                    workspaceId: workspace.id,
                },
            });
            console.log(`Created sample task: ${taskData.title}`);
        }
    }

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
