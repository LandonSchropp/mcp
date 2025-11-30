import { renderFile } from "./render";
import { mkdtemp, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("renderFile", () => {
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
    it("returns the template unchanged", async () => {
      await writeFile(filePath, "This is a plain text template");
      const result = await renderFile(filePath, {});
      expect(result).toBe("This is a plain text template");
    });
  });

  describe("when the template has a single variable", () => {
    it("replaces the variable with the context value", async () => {
      await writeFile(filePath, "Hello, {{name}}!");
      const result = await renderFile(filePath, { name: "World" });
      expect(result).toBe("Hello, World!");
    });
  });

  describe("when the template has multiple variables", () => {
    it("replaces all variables with their context values", async () => {
      await writeFile(filePath, "{{greeting}}, {{name}}! {{message}}");
      const result = await renderFile(filePath, {
        greeting: "Hello",
        name: "Alice",
        message: "How are you?",
      });
      expect(result).toBe("Hello, Alice! How are you?");
    });
  });

  describe("when the template has variables with whitespace", () => {
    it("handles whitespace inside variable braces", async () => {
      await writeFile(filePath, "Hello, {{ name }}!");
      const result = await renderFile(filePath, { name: "World" });
      expect(result).toBe("Hello, World!");
    });

    it("handles multiple spaces inside variable braces", async () => {
      await writeFile(filePath, "Hello, {{  name  }}!");
      const result = await renderFile(filePath, { name: "World" });
      expect(result).toBe("Hello, World!");
    });
  });

  describe("when the template has repeated variables", () => {
    it("replaces all occurrences of the same variable", async () => {
      await writeFile(filePath, "{{name}} meets {{name}} at {{location}}");
      const result = await renderFile(filePath, {
        name: "Bob",
        location: "the park",
      });
      expect(result).toBe("Bob meets Bob at the park");
    });
  });

  describe("when the context is missing a variable value", () => {
    it("throws an error", async () => {
      await writeFile(filePath, "Hello, {{name}}! Welcome to {{missing}}.");
      await expect(renderFile(filePath, { name: "Alice" })).rejects.toThrow();
    });
  });

  describe("when the context value is an empty string", () => {
    it("replaces the variable with empty string", async () => {
      await writeFile(filePath, "Name: {{name}}");
      const result = await renderFile(filePath, { name: "" });
      expect(result).toBe("Name: ");
    });
  });

  describe("when the template includes a partial with a relative path", () => {
    it("renders the partial content", async () => {
      await writeFile(join(tempDirectory, "_partial.md.liquid"), "Hello from partial!");
      await writeFile(filePath, "Before. {% include './_partial' %} After.");
      const result = await renderFile(filePath, {});
      expect(result).toBe("Before. Hello from partial! After.");
    });
  });
});
