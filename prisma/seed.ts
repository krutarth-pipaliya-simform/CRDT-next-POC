import { rawDb as prisma } from "../src/lib/db";
import { Role } from "@prisma/client";

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
