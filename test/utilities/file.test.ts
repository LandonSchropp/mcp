import { pathExists, ancestorPathExists } from "../../src/utilities/file";
import { stat } from "fs/promises";
import { mkdtemp, writeFile, mkdir, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("fs/promises", { spy: true });

describe("pathExists", () => {
  let tempDirectory: string;

  beforeEach(async () => {
    tempDirectory = await mkdtemp(join(tmpdir(), "test-"));
  });

  afterEach(async () => {
    await rm(tempDirectory, { recursive: true });
  });

  describe("when the path is a file", () => {
    let filePath: string;

    beforeEach(async () => {
      filePath = join(tempDirectory, "test.txt");
      await writeFile(filePath, "content");
    });

    it("returns true", async () => {
      expect(await pathExists(filePath)).toBe(true);
    });
  });

  describe("when the path is a directory", () => {
    let directoryPath: string;

    beforeEach(async () => {
      directoryPath = join(tempDirectory, "subdir");
      await mkdir(directoryPath);
    });

    it("returns true", async () => {
      expect(await pathExists(directoryPath)).toBe(true);
    });
  });

  describe("when the path does not exist", () => {
    let nonExistentPath: string;

    beforeEach(() => {
      nonExistentPath = join(tempDirectory, "non-existent.txt");
    });

    it("returns false", async () => {
      expect(await pathExists(nonExistentPath)).toBe(false);
    });
  });

  describe("when there is a permission error", () => {
    it("returns false", async () => {
      vi.mocked(stat).mockRejectedValueOnce(new Error("EACCES: permission denied"));

      expect(await pathExists("/some/path")).toBe(false);
    });
  });
});

describe("ancestorPathExists", () => {
  let tempDirectory: string;
  let childDirectory: string;
  let grandchildDirectory: string;

  beforeEach(async () => {
    tempDirectory = await mkdtemp(join(tmpdir(), "test-"));
    childDirectory = join(tempDirectory, "child");
    grandchildDirectory = join(childDirectory, "grandchild");

    await mkdir(grandchildDirectory, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDirectory, { recursive: true });
  });

  describe("when the file exists in the current directory", () => {
    beforeEach(async () => {
      await writeFile(join(grandchildDirectory, "target.txt"), "content");
    });

    it("returns true", async () => {
      expect(await ancestorPathExists("target.txt", grandchildDirectory)).toBe(true);
    });
  });

  describe("when the file exists in a parent directory", () => {
    beforeEach(async () => {
      await writeFile(join(childDirectory, "target.txt"), "content");
    });

    it("returns true", async () => {
      expect(await ancestorPathExists("target.txt", grandchildDirectory)).toBe(true);
    });
  });

  describe("when the file exists in an ancestor directory", () => {
    beforeEach(async () => {
      await writeFile(join(tempDirectory, "target.txt"), "content");
    });

    it("returns true", async () => {
      expect(await ancestorPathExists("target.txt", grandchildDirectory)).toBe(true);
    });
  });

  describe("when the file does not exist in the tree", () => {
    it("returns false", async () => {
      expect(await ancestorPathExists("non-existent.txt", grandchildDirectory)).toBe(false);
    });
  });
});
