import { isJavaScriptProject, isRubyProject } from "../../src/utilities/project";
import { mkdtemp, writeFile, mkdir, rmdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("isJavaScriptProject", () => {
  let tempDirectory: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDirectory = await mkdtemp(join(tmpdir(), "test-"));
    process.chdir(tempDirectory);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rmdir(tempDirectory, { recursive: true });
  });

  describe("when a package.json file exists in the current directory", () => {
    beforeEach(async () => {
      await writeFile(join(tempDirectory, "package.json"), "{}");
    });

    it("returns true", async () => {
      expect(await isJavaScriptProject()).toBe(true);
    });
  });

  describe("when a package.json exists in a parent directory", () => {
    beforeEach(async () => {
      const subdirectory = join(tempDirectory, "subdirectory");
      await mkdir(subdirectory);
      await writeFile(join(tempDirectory, "package.json"), "{}");
      process.chdir(subdirectory);
    });

    it("returns true", async () => {
      expect(await isJavaScriptProject()).toBe(true);
    });
  });

  describe("when a package.json exists in an ancestor directory", () => {
    beforeEach(async () => {
      const deepDirectory = join(tempDirectory, "level1", "level2", "level3");
      await mkdir(deepDirectory, { recursive: true });
      await writeFile(join(tempDirectory, "package.json"), "{}");
      process.chdir(deepDirectory);
    });

    it("returns true", async () => {
      expect(await isJavaScriptProject()).toBe(true);
    });
  });

  describe("when a package.json does not exist", () => {
    it("returns false", async () => {
      expect(await isJavaScriptProject()).toBe(false);
    });
  });
});

describe("isRubyProject", () => {
  let tempDirectory: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDirectory = await mkdtemp(join(tmpdir(), "test-"));
    process.chdir(tempDirectory);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rmdir(tempDirectory, { recursive: true });
  });

  describe("when a Gemfile exists in the current directory", () => {
    beforeEach(async () => {
      await writeFile(join(tempDirectory, "Gemfile"), "source 'https://rubygems.org'");
    });

    it("returns true", async () => {
      expect(await isRubyProject()).toBe(true);
    });
  });

  describe("when a Gemfile exists in a parent directory", () => {
    beforeEach(async () => {
      const subdirectory = join(tempDirectory, "subdirectory");
      await mkdir(subdirectory);
      await writeFile(join(tempDirectory, "Gemfile"), "source 'https://rubygems.org'");
      process.chdir(subdirectory);
    });

    it("returns true", async () => {
      expect(await isRubyProject()).toBe(true);
    });
  });

  describe("when a Gemfile exists in an ancestor directory", () => {
    beforeEach(async () => {
      const deepDirectory = join(tempDirectory, "level1", "level2", "level3");
      await mkdir(deepDirectory, { recursive: true });
      await writeFile(join(tempDirectory, "Gemfile"), "source 'https://rubygems.org'");
      process.chdir(deepDirectory);
    });

    it("returns true", async () => {
      expect(await isRubyProject()).toBe(true);
    });
  });

  describe("when a Gemfile does not exist", () => {
    it("returns false", async () => {
      expect(await isRubyProject()).toBe(false);
    });
  });
});
