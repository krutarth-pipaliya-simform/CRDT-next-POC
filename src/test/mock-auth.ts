/**
 * A stand-in for `@/features/auth/lib/auth` (Auth.js needs a database and
 * secrets). Install it with:
 *
 *     jest.mock("@/features/auth/lib/auth", () =>
 *         jest.requireActual("@/test/mock-auth"),
 *     );
 */
export const auth = jest.fn();
export const signIn = jest.fn();
export const signOut = jest.fn();

/** Make `auth()` resolve to a signed-in session for `userId`. */
export function signInAs(userId: string): void {
    auth.mockResolvedValue({ user: { id: userId } });
}

/** Make `auth()` resolve to a signed-out session. */
export function signOutSession(): void {
    auth.mockResolvedValue(null);
}
