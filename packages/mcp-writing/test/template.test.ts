import { removeFrontmatterAndIntroduction } from "../src/template";
import { describe, it, expect } from "bun:test";
import { dedent } from "ts-dedent";

describe("removeFrontmatterAndIntroduction", () => {
  describe("when markdown has frontmatter and introduction content", () => {
    it("removes both frontmatter and content before first h2", () => {
      const markdown = dedent`
        ---
        title: Test
        ---

        This is an introduction paragraph.

        Some more intro content.

        ## First Section

        This should remain.

        ## Second Section

        This should also remain.
      `;

      const expected = dedent`
        ## First Section

        This should remain.

        ## Second Section

        This should also remain.
      `;

      expect(removeFrontmatterAndIntroduction(markdown)).toBe(expected);
    });
  });

  describe("when markdown has no frontmatter but has introduction content", () => {
    it("removes content before first h2", () => {
      const markdown = dedent`
        This is an introduction paragraph.

        Some more intro content.

        ## First Section

        This should remain.
      `;

      const expected = dedent`
        ## First Section

        This should remain.
      `;

      expect(removeFrontmatterAndIntroduction(markdown)).toBe(expected);
    });
  });

  describe("when markdown has frontmatter but no introduction content", () => {
    it("removes frontmatter only", () => {
      const markdown = dedent`
        ---
        title: Test
        ---

        ## First Section

        This should remain.
      `;

      const expected = dedent`
        ## First Section

        This should remain.
      `;

      expect(removeFrontmatterAndIntroduction(markdown)).toBe(expected);
    });
  });

  describe("when markdown has no h2 headings", () => {
    it("returns the markdown unchanged", () => {
      const markdown = dedent`
        ---
        title: Test
        ---

        Just some content without h2 headings.
      `;

      expect(removeFrontmatterAndIntroduction(markdown)).toBe(markdown);
    });
  });

  describe("when h2 appears mid-document", () => {
    it("only removes content before the first h2", () => {
      const markdown = dedent`
        Some initial content.
        
        # Main Title
        
        More content here.
        
        ## First H2 Section
        
        This should remain.
        
        ## Second H2 Section
        
        This should also remain.
      `;

      const expected = dedent`
        ## First H2 Section
        
        This should remain.
        
        ## Second H2 Section
        
        This should also remain.
      `;

      expect(removeFrontmatterAndIntroduction(markdown)).toBe(expected);
    });

    it("should not match ## pattern in the middle of a line", () => {
      const markdown = dedent`
        Some content that mentions ## headers in text.
        
        More content here.
        
        ## Actual Header
        
        This should remain.
      `;

      const expected = dedent`
        ## Actual Header
        
        This should remain.
      `;

      expect(removeFrontmatterAndIntroduction(markdown)).toBe(expected);
    });
  });
});
