import { extractVariables } from "./variables";
import { mkdtemp, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { dedent } from "ts-dedent";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("extractVariables", () => {
  let tempDirectory: string;
  let filePath: string;

  beforeEach(async () => {
    tempDirectory = await mkdtemp(join(tmpdir(), "test-"));
    filePath = join(tempDirectory, "template.md.liquid");
  });

  afterEach(async () => {
    await rm(tempDirectory, { recursive: true });
  });

  describe("when the template has no variables", () => {
    beforeEach(async () => {
      await writeFile(filePath, "This is a plain text template");
    });

    it("returns an empty set", async () => {
      const result = await extractVariables(filePath);
      expect(result).toEqual(new Set());
    });
  });

  describe("when the template has a single variable", () => {
    beforeEach(async () => {
      await writeFile(filePath, "Hello, {{name}}!");
    });

    it("returns the variable name", async () => {
      const result = await extractVariables(filePath);
      expect(result).toEqual(new Set(["name"]));
    });
  });

  describe("when the template has multiple unique variables", () => {
    beforeEach(async () => {
      await writeFile(filePath, "{{greeting}}, {{name}}! {{message}}");
    });

    it("returns all variable names", async () => {
      const result = await extractVariables(filePath);
      expect(result).toEqual(new Set(["greeting", "name", "message"]));
    });
  });

  describe("when the template has repeated variables", () => {
    beforeEach(async () => {
      await writeFile(filePath, "{{name}} meets {{name}} at {{location}}");
    });

    it("returns each variable name only once", async () => {
      const result = await extractVariables(filePath);
      expect(result).toEqual(new Set(["name", "location"]));
    });
  });

  describe("when the variables have whitespace", () => {
    beforeEach(async () => {
      await writeFile(filePath, "Hello, {{ name }}! Welcome, {{  user  }}.");
    });

    it("trims the whitespace from variable names", async () => {
      const result = await extractVariables(filePath);
      expect(result).toEqual(new Set(["name", "user"]));
    });
  });

  describe("when the template has multiple lines", () => {
    beforeEach(async () => {
      await writeFile(
        filePath,
        dedent`
          Line 1: {{first}}
          Line 2: {{second}}
          Line 3: {{first}} and {{third}}
        `,
      );
    });

    it("extracts the variables", async () => {
      const result = await extractVariables(filePath);
      expect(result).toEqual(new Set(["first", "second", "third"]));
    });
  });

  describe("when the template has frontmatter", () => {
    beforeEach(async () => {
      await writeFile(
        filePath,
        dedent`
          ---
          title: Test
          description: A test template
          ---

          Hello, {{name}}!
        `,
      );
    });

    it("ignores the frontmatter", async () => {
      const result = await extractVariables(filePath);
      expect(result).toEqual(new Set(["name"]));
    });
  });

  describe("when the template includes a partial", () => {
    beforeEach(async () => {
      await writeFile(join(tempDirectory, "_partial.md.liquid"), "{{partialVariable}}");
      await writeFile(filePath, "{{title}} {% include './_partial' %}");
    });

    it("extracts variables from both the template and the partial", async () => {
      const result = await extractVariables(filePath);
      expect(result).toEqual(new Set(["title", "partialVariable"]));
    });
  });

  describe("when the template includes a partial with a parameter passed", () => {
    beforeEach(async () => {
      await writeFile(join(tempDirectory, "_partial.md.liquid"), "{{foo}} {{bar}}");
      await writeFile(filePath, "{{title}} {% include './_partial', foo: 'test' %}");
    });

    it("includes the unpassed partial variables", async () => {
      const result = await extractVariables(filePath);
      expect(result).toContain("bar");
    });

    it("includes the template variables", async () => {
      const result = await extractVariables(filePath);
      expect(result).toContain("title");
    });

    it("excludes the passed parameter", async () => {
      const result = await extractVariables(filePath);
      expect(result).not.toContain("foo");
    });

    describe("when the parameter value contains whitespace", () => {
      beforeEach(async () => {
        await writeFile(filePath, "{{title}} {% include './_partial', foo: 'bug fix' %}");
      });

      it("excludes the passed parameter", async () => {
        const result = await extractVariables(filePath);
        expect(result).not.toContain("foo");
      });
    });
  });
});
