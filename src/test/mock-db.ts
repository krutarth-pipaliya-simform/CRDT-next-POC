/**
 * A stand-in for the Prisma client (`@/lib/db`) so unit tests never touch a
 * database. Install it with:
 *
 *     jest.mock("@/lib/db", () => jest.requireActual("@/test/mock-db"));
 *
 * Every method is a bare `jest.fn()`; tests set the return values they need
 * and call `resetDb()` in `beforeEach` to drop them between tests.
 */
function model() {
    return {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        createManyAndReturn: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    };
}

export const db = {
    user: model(),
    verificationToken: model(),
    workspace: model(),
    workspaceMember: model(),
    notification: model(),
    subscription: model(),
    $transaction: jest.fn(),
};

export function resetDb(): void {
    for (const value of Object.values(db)) {
        if (typeof value === "function") {
            value.mockReset();
        } else {
            Object.values(value).forEach((method) => method.mockReset());
        }
    }
}
