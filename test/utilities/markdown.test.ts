import { extractHeaders, extractSection, extractSectionById } from "../../src/utilities/markdown";
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

describe("extractHeaders", () => {
  describe("when the markdown contains headers", () => {
    it("returns all header text", () => {
      const result = extractHeaders(MARKDOWN_EXAMPLE);

      expect(result).toEqual(["Introduction", "Body", "Subheader 1", "Subheader 2", "Conclusion"]);
    });
  });

  describe("when the markdown is empty", () => {
    it("returns empty array", () => {
      const result = extractHeaders("");

      expect(result).toEqual([]);
    });
  });

  describe("when the markdown has no headers", () => {
    it("returns empty array", () => {
      const result = extractHeaders("Just some text without headers.");

      expect(result).toEqual([]);
    });
  });

  describe("when headers have different levels", () => {
    it("includes all header levels", () => {
      const markdown = dedent`
        # Main Title
        
        ## Section
        
        ### Subsection
        
        #### Sub-subsection
      `;

      const result = extractHeaders(markdown);

      expect(result).toEqual(["Main Title", "Section", "Subsection", "Sub-subsection"]);
    });
  });

  describe("when headers contain special characters", () => {
    it("preserves the header text", () => {
      const markdown = dedent`
        ## Use Contexts (With \`describe\`)
        
        ## API v2.0 Testing!
      `;

      const result = extractHeaders(markdown);

      expect(result).toEqual(["Use Contexts (With `describe`)", "API v2.0 Testing!"]);
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

describe("extractSectionById", () => {
  describe("when the section exists", () => {
    it("extracts the section content using ID matching", () => {
      const result = extractSectionById(MARKDOWN_EXAMPLE, "subheader-1");

      expect(result).toBe("Sub content 1");
    });
  });

  describe("when the section does not exist", () => {
    it("returns undefined", () => {
      const result = extractSectionById(MARKDOWN_EXAMPLE, "nonexistent-section");

      expect(result).toBeUndefined();
    });
  });

  describe("when the section has special characters", () => {
    it("matches using kebab-case ID conversion", () => {
      const markdown = dedent`
        ## Use Contexts (With \`describe\`)
        
        Use contexts to organize related tests.
        
        ## Other Section
        
        Other content.
      `;

      const result = extractSectionById(markdown, "use-contexts-with-describe");

      expect(result).toBe("Use contexts to organize related tests.");
    });
  });

  describe("when the markdown is empty", () => {
    it("returns undefined", () => {
      const result = extractSectionById("", "any-section");

      expect(result).toBeUndefined();
    });
  });
});
