import fs from "fs/promises";
import path from "path";

import {
    deleteUpload,
    readUpload,
    resolveUploadPath,
    saveUpload,
    UPLOAD_URL_PREFIX,
} from "@/lib/upload-storage";

jest.mock("fs/promises");

const mockFs = jest.mocked(fs);
const ROOT = path.join(process.cwd(), "storage", "uploads");

describe("resolveUploadPath", () => {
    it("resolves safe segments inside the upload root", () => {
        expect(resolveUploadPath(["avatars", "u1.png"])).toBe(
            path.join(ROOT, "avatars", "u1.png"),
        );
    });

    it("refuses an empty path", () => {
        expect(resolveUploadPath([])).toBeNull();
    });

    it.each([
        [".."],
        ["."],
        ["../etc"],
        ["a/b"],
        ["a\\b"],
        [".hidden"],
        [""],
        ["a b"],
        ["%2e%2e"],
    ])("refuses the unsafe segment %j", (segment) => {
        expect(resolveUploadPath(["avatars", segment])).toBeNull();
    });
});

describe("saveUpload", () => {
    it("creates the folder, writes the bytes and returns the served URL", async () => {
        const data = new Uint8Array([1, 2, 3]);
        const url = await saveUpload(["docs", "a.png"], data);

        expect(url).toBe(`${UPLOAD_URL_PREFIX}docs/a.png`);
        expect(mockFs.mkdir).toHaveBeenCalledWith(path.join(ROOT, "docs"), {
            recursive: true,
        });
        expect(mockFs.writeFile).toHaveBeenCalledWith(
            path.join(ROOT, "docs", "a.png"),
            data,
        );
    });

    it("throws and writes nothing for a path-escape attempt", async () => {
        await expect(
            saveUpload(["..", "evil.txt"], new Uint8Array()),
        ).rejects.toThrow("Unsafe upload path");
        expect(mockFs.writeFile).not.toHaveBeenCalled();
    });
});

describe("readUpload", () => {
    it("returns the file contents", async () => {
        const buffer = Buffer.from("hi");
        mockFs.readFile.mockResolvedValue(buffer);
        await expect(readUpload(["a", "b.txt"])).resolves.toBe(buffer);
    });

    it("returns null for a missing file or unsafe path", async () => {
        mockFs.readFile.mockRejectedValue(new Error("ENOENT"));
        await expect(readUpload(["a", "b.txt"])).resolves.toBeNull();
        await expect(readUpload(["..", "x"])).resolves.toBeNull();
    });
});

describe("deleteUpload", () => {
    it("deletes a stored file by URL", async () => {
        await deleteUpload(`${UPLOAD_URL_PREFIX}avatars/u1.png`);
        expect(mockFs.unlink).toHaveBeenCalledWith(
            path.join(ROOT, "avatars", "u1.png"),
        );
    });

    it("ignores null, external URLs and escape attempts", async () => {
        await deleteUpload(null);
        await deleteUpload("https://lh3.googleusercontent.com/a.png");
        await deleteUpload(`${UPLOAD_URL_PREFIX}../../etc/passwd`);
        expect(mockFs.unlink).not.toHaveBeenCalled();
    });

    it("logs, but does not throw, when unlinking fails", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        mockFs.unlink.mockRejectedValue(new Error("EPERM"));

        await expect(
            deleteUpload(`${UPLOAD_URL_PREFIX}a/b.png`),
        ).resolves.toBeUndefined();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});
