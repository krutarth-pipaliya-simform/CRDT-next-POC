/**
 * @jest-environment jsdom
 */
import {
    DEFAULT_THEME_PREFERENCE,
    isThemePreference,
    THEME_INIT_SCRIPT,
    THEME_PREFERENCES,
    THEME_STORAGE_KEY,
} from "@/lib/theme";

function runInitScript() {
    new Function(THEME_INIT_SCRIPT)();
}

describe("theme", () => {
    it("accepts only the three preferences", () => {
        for (const value of THEME_PREFERENCES) {
            expect(isThemePreference(value)).toBe(true);
        }
        for (const value of ["", "auto", null, undefined, 1]) {
            expect(isThemePreference(value)).toBe(false);
        }
        expect(DEFAULT_THEME_PREFERENCE).toBe("system");
    });

    describe("THEME_INIT_SCRIPT", () => {
        function run(stored: string | null, prefersDark: boolean) {
            window.localStorage.clear();
            if (stored !== null) {
                window.localStorage.setItem(THEME_STORAGE_KEY, stored);
            }
            window.matchMedia = jest
                .fn()
                .mockReturnValue({ matches: prefersDark });
            document.documentElement.removeAttribute("data-theme");
            runInitScript();
            return document.documentElement.getAttribute("data-theme");
        }

        it("applies a saved explicit theme", () => {
            expect(run("dark", false)).toBe("dark");
            expect(run("light", true)).toBe("light");
        });

        it("resolves system / unknown values from the OS preference", () => {
            expect(run("system", true)).toBe("dark");
            expect(run(null, false)).toBe("light");
            expect(run("garbage", true)).toBe("dark");
        });

        it("never throws when storage is blocked", () => {
            const spy = jest
                .spyOn(Storage.prototype, "getItem")
                .mockImplementation(() => {
                    throw new Error("blocked");
                });
            expect(runInitScript).not.toThrow();
            spy.mockRestore();
        });
    });
});
