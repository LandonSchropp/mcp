import { liquid } from "./liquid";
import { mkdtemp, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { dedent } from "ts-dedent";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("liquid", () => {
  let tempDirectory: string;
  let filePath: string;

  beforeEach(async () => {
    tempDirectory = await mkdtemp(join(tmpdir(), "test-"));
    filePath = join(tempDirectory, "template.md.liquid");
  });

  afterEach(async () => {
    await rm(tempDirectory, { recursive: true });
  });

  describe(".options.fs.readFile", () => {
    describe("when the file has frontmatter", () => {
      beforeEach(async () => {
        await writeFile(
          filePath,
          dedent`
            ---
            title: Test
            ---

            Hello, World!
          `,
        );
      });

      it("strips the frontmatter", async () => {
        const result = await liquid.options.fs.readFile(filePath);
        expect(result).toBe("Hello, World!");
      });
    });

    describe("when the file has no frontmatter", () => {
      beforeEach(async () => {
        await writeFile(filePath, "Hello, World!");
      });

      it("returns the content unchanged", async () => {
        const result = await liquid.options.fs.readFile(filePath);
        expect(result).toBe("Hello, World!");
      });
    });
  });

  describe(".options.fs.readFileSync", () => {
    describe("when the file has frontmatter", () => {
      beforeEach(async () => {
        await writeFile(
          filePath,
          dedent`
            ---
            title: Test
            ---

            Hello, World!
          `,
        );
      });

      it("strips the frontmatter", () => {
        const result = liquid.options.fs.readFileSync(filePath);
        expect(result).toBe("Hello, World!");
      });
    });

    describe("when the file has no frontmatter", () => {
      beforeEach(async () => {
        await writeFile(filePath, "Hello, World!");
      });

      it("returns the content unchanged", () => {
        const result = liquid.options.fs.readFileSync(filePath);
        expect(result).toBe("Hello, World!");
      });
    });
  });
});
