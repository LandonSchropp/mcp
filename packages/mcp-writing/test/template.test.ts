import { removeFrontmatterAndIntroduction, extractSection } from "../src/template";
import { describe, it, expect } from "bun:test";
import { dedent } from "ts-dedent";

const MARKDOWN_EXAMPLE = dedent`
  ## Introduction

  Introduction content

  ## Body

  Body content

  ### Subheader 1

  Sub content 1

  ### Subheader 2

  Sub content 2

  ## Conclusion

  Conclusion content
`;

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

describe("extractSection", () => {
  describe("when the markdown is empty", () => {
    it("returns undefined", () => {
      const result = extractSection("", "Example");

      expect(result).toBeUndefined();
    });
  });

  describe("when the header does not exist in the markdown", () => {
    it("returns undefined", () => {
      const result = extractSection(MARKDOWN_EXAMPLE, "Example");

      expect(result).toBeUndefined();
    });
  });

  describe("when the header exists at the beginning of the content", () => {
    it("returns the section content", () => {
      const result = extractSection(MARKDOWN_EXAMPLE.replace(/## Body[\s\S]*/, ""), "Introduction");

      expect(result).toBe("Introduction content");
    });
  });

  describe("when no other header of the same level follows the header", () => {
    it("returns the content from the header to the end", () => {
      const result = extractSection(MARKDOWN_EXAMPLE, "Conclusion");

      expect(result).toBe("Conclusion content");
    });
  });

  describe("when another header of the same level follows the header", () => {
    it("returns the content between the headers", () => {
      const result = extractSection(MARKDOWN_EXAMPLE, "Introduction");

      expect(result).toBe("Introduction content");
    });
  });

  describe("when a subheader follows the header", () => {
    it("returns the content including subheaders", () => {
      const result = extractSection(MARKDOWN_EXAMPLE, "Body");

      expect(result).toBe(dedent`
        Body content

        ### Subheader 1

        Sub content 1

        ### Subheader 2

        Sub content 2
      `);
    });
  });

  describe("when a higher-level header follows the header", () => {
    it("returns the content up to the higher-level header", () => {
      const markdown = dedent`
        ## Section

        Section content

        # Higher Level

        Higher level content
      `;

      const result = extractSection(markdown, "Section");

      expect(result).toBe("Section content");
    });
  });

  describe("when the content following the header is empty", () => {
    it("returns empty string", () => {
      const markdown = dedent`
        ## Empty Section

        ## Next Section

        Next content
      `;

      const result = extractSection(markdown, "Empty Section");

      expect(result).toBe("");
    });
  });

  describe("when the header exists multiple times in the markdown", () => {
    it("returns the content of the first occurrence", () => {
      const markdown = dedent`
        ## Duplicate

        First content

        ## Other Section

        Other content

        ## Duplicate

        Second content
      `;

      const result = extractSection(markdown, "Duplicate");

      expect(result).toBe("First content");
    });
  });
});
