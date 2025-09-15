import { removeFrontmatter } from "../src/frontmatter";
import { describe, it, expect } from "bun:test";
import { dedent } from "ts-dedent";

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
