import { removeFrontmatter, extractSection } from "../src/template";
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

describe("removeFrontmatter", () => {
  it("removes frontmatter and leaves content unchanged", () => {
    const markdown = dedent`
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

    expect(removeFrontmatter(markdown)).toBe(expected);
  });

  it("leaves markdown unchanged when no frontmatter exists", () => {
    const markdown = dedent`
      This is content without frontmatter.

      ## Section Header

      More content here.
    `;

    expect(removeFrontmatter(markdown)).toBe(markdown);
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
