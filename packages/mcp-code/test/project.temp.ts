import { isJavaScriptProject, isRubyProject } from "../src/project.ts";
import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";

const TEST_DIRECTORY = "/tmp/mcp-code-test";

let cwdSpy: ReturnType<typeof spyOn>;

beforeEach(async () => {
  await rm(TEST_DIRECTORY, { recursive: true, force: true });
  await mkdir(TEST_DIRECTORY, { recursive: true });

  // Mock process.cwd() to return our test directory
  cwdSpy = spyOn(process, "cwd").mockReturnValue(TEST_DIRECTORY);
});

afterEach(async () => {
  await rm(TEST_DIRECTORY, { recursive: true, force: true });
});

describe("isJavaScriptProject", () => {
  describe("when a package.json file exists in the current directory", () => {
    it("returns true", async () => {
      await writeFile(join(TEST_DIRECTORY, "package.json"), "");

      expect(isJavaScriptProject()).toBe(true);
    });
  });

  describe("when a package.json exists in the parent directory", () => {
    it("returns true", async () => {
      const subdirectory = join(TEST_DIRECTORY, "subdirectory");
      await mkdir(subdirectory);
      cwdSpy.mockReturnValue(subdirectory);

      await writeFile(join(TEST_DIRECTORY, "package.json"), "");

      expect(isJavaScriptProject()).toBe(true);
    });
  });

  describe("when a package.json exists in an ancestor parent directory", () => {
    it("returns true", async () => {
      const subdirectory = join(TEST_DIRECTORY, "level1", "level2", "level3");
      await mkdir(subdirectory, { recursive: true });
      cwdSpy.mockReturnValue(subdirectory);

      await writeFile(join(TEST_DIRECTORY, "package.json"), "");

      expect(isJavaScriptProject()).toBe(true);
    });
  });

  describe("when a package.json exists in a subdirectory", () => {
    it("returns false", async () => {
      const subdirectory = join(TEST_DIRECTORY, "subdirectory");
      await mkdir(subdirectory);
      await writeFile(join(subdirectory, "package.json"), "");

      expect(isJavaScriptProject()).toBe(false);
    });
  });

  describe("when a package.json does not exist", () => {
    it("returns false", () => {
      expect(isJavaScriptProject()).toBe(false);
    });
  });
});

describe("isRubyProject", () => {
  describe("when a Gemfile exists in the current directory", () => {
    it("returns true", async () => {
      await writeFile(join(TEST_DIRECTORY, "Gemfile"), "");

      expect(isRubyProject()).toBe(true);
    });
  });

  describe("when a Gemfile exists in the parent directory", () => {
    it("returns true", async () => {
      const subdirectory = join(TEST_DIRECTORY, "subdirectory");
      await mkdir(subdirectory);
      cwdSpy.mockReturnValue(subdirectory);

      await writeFile(join(TEST_DIRECTORY, "Gemfile"), "");

      expect(isRubyProject()).toBe(true);
    });
  });

  describe("when a Gemfile exists in an ancestor parent directory", () => {
    it("returns true", async () => {
      const subdirectory = join(TEST_DIRECTORY, "level1", "level2", "level3");
      await mkdir(subdirectory, { recursive: true });
      cwdSpy.mockReturnValue(subdirectory);

      await writeFile(join(TEST_DIRECTORY, "Gemfile"), "");

      expect(isRubyProject()).toBe(true);
    });
  });

  describe("when a Gemfile exists in a subdirectory", () => {
    it("returns false", async () => {
      const subdirectory = join(TEST_DIRECTORY, "subdirectory");
      await mkdir(subdirectory);
      await writeFile(join(subdirectory, "Gemfile"), "");

      expect(isRubyProject()).toBe(false);
    });
  });

  describe("when a Gemfile does not exist", () => {
    it("returns false", () => {
      expect(isRubyProject()).toBe(false);
    });
  });
});
