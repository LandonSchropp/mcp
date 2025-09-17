import { glob } from "../src/file.ts";
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

describe("glob", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `glob-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });

    // Create minimal test structure
    await mkdir(join(testDir, "src"), { recursive: true });
    await writeFile(join(testDir, "index.ts"), "// index");
    await writeFile(join(testDir, "README.md"), "# README");
    await writeFile(join(testDir, "src/app.ts"), "// app.ts");
    await writeFile(join(testDir, "src/app.js"), "// app.js");
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe("when files match the pattern", () => {
    it("returns the matching files", async () => {
      const files = await glob(testDir, "**/*.ts");

      expect(files).toContain("index.ts");
      expect(files).toContain("src/app.ts");
    });

    it("excludes the non-matching files", async () => {
      const files = await glob(testDir, "**/*.ts");

      expect(files).not.toContain("src/app.js");
    });
  });

  describe("when no files match the pattern", () => {
    it("returns an empty array", async () => {
      const files = await glob(testDir, "**/*.xyz");

      expect(files).toEqual([]);
    });
  });
});
