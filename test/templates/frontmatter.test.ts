import { parseFrontmatter, removeFrontmatter } from "../../src/templates/frontmatter";
import { describe, it, expect } from "bun:test";
import { dedent } from "ts-dedent";
import { z } from "zod";

describe("removeFrontmatter", () => {
  describe("when the content contains frontmatter", () => {
    it("removes the frontmatter and leaves the content unchanged", () => {
      const content = dedent`
        ---
        title: Test
        author: Example
        ---

        This is content that should remain.

        ## Section Header

        More content here.
      `;

      const expected = dedent`
        This is content that should remain.

        ## Section Header

        More content here.
      `;

      expect(removeFrontmatter(content)).toBe(expected);
    });
  });

  describe("when the content does not contain frontmatter", () => {
    it("leaves the content unchanged", () => {
      const content = dedent`
        This is content without frontmatter.

        ## Section Header

        More content here.
      `;

      expect(removeFrontmatter(content)).toBe(content);
    });
  });
});

describe("parseFrontmatter", () => {
  const testSchema = z.object({
    title: z.string(),
    description: z.string(),
  });

  describe("when the content contains valid frontmatter", () => {
    it("parses the frontmatter and returns content", () => {
      const content = dedent`
        ---
        title: Test Title
        description: Test description
        ---

        This is the main content.

        ## Header

        More content.
      `;

      const result = parseFrontmatter(content, testSchema);

      expect(result.frontmatter).toEqual({
        title: "Test Title",
        description: "Test description",
      });

      expect(result.content).toBe(dedent`
        This is the main content.

        ## Header

        More content.
      `);
    });
  });

  describe("when the content has no frontmatter", () => {
    it("throws an error", () => {
      const content = dedent`
        This is content without frontmatter.

        ## Header

        More content.
      `;

      expect(() => parseFrontmatter(content, testSchema)).toThrow(
        "No frontmatter found in markdown",
      );
    });
  });

  describe("when the frontmatter contains invalid YAML", () => {
    it("throws an error", () => {
      const content = dedent`
        ---
        title: Test Title
        description: [invalid yaml
        ---

        Content here.
      `;

      expect(() => parseFrontmatter(content, testSchema)).toThrow("Invalid YAML in frontmatter");
    });
  });

  describe("when the frontmatter doesn't match the schema", () => {
    it("throws an error", () => {
      const content = dedent`
        ---
        title: Test Title
        ---

        Content here.
      `;

      expect(() => parseFrontmatter(content, testSchema)).toThrow("Frontmatter validation failed");
    });
  });
});
