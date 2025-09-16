import { describe, it, expect, mock, beforeEach } from "bun:test";
import { tmpdir } from "os";
import { join } from "path";
import { dedent } from "ts-dedent";

// Mock environment variables before any imports
mock.module("../../src/env.ts", () => ({
  WRITING_FORMAT: "/tmp/format.md",
  WRITING_VOICE: "/tmp/voice.md",
  WRITING_IMPROVEMENT: "/tmp/improvement.md",
}));

const { handlebars } = await import("../../src/handlebars/index.ts");

function render(template: string): string {
  return handlebars.compile(template)({});
}

describe("documentation helper", () => {
  let result: string;

  it("is registered", () => {
    expect(handlebars.helpers).toHaveProperty("documentation");
  });

  describe("when the path exists", () => {
    beforeEach(() => {
      result = render('{{documentation "code/better-tests"}}');
    });

    it("includes the content of the file", () => {
      expect(result).toContain("Use `it` instead of `test`");
      expect(result).toContain("Keep Descriptions Short");
    });

    it("removes the frontmatter", () => {
      expect(result).not.toContain("---");
      expect(result).not.toContain("title: Better Tests");
    });
  });

  describe("when the path is 'writing/format'", () => {
    it("throws an error when path does not exist", () => {
      expect(() => render('{{documentation "writing/format"}}')).toThrow();
    });
  });

  describe("when the path is 'writing/voice'", () => {
    it("throws an error when path does not exist", () => {
      expect(() => render('{{documentation "writing/voice"}}')).toThrow();
    });
  });

  describe("when the path is 'writing/improvement'", () => {
    it("throws an error when path does not exist", () => {
      expect(() => render('{{documentation "writing/improvement"}}')).toThrow();
    });
  });

  describe("when the path does not exist", () => {
    it("throws an error", () => {
      expect(() => render('{{documentation "nonexistent/file"}}')).toThrow();
    });
  });

  describe("when a section is provided", () => {
    describe("when the section exists", () => {
      describe("when section is 'mocks' (matches '## Mocks')", () => {
        beforeEach(() => {
          result = render('{{documentation "code/better-tests" section="mocks"}}');
        });

        it("returns only the section content", () => {
          expect(result).toContain("Use mocks sparingly");
          expect(result).toContain("Test real behavior when possible");
        });

        it("does not include the next section", () => {
          expect(result).not.toContain("## Factories");
        });
      });

      describe("when section is 'use-contexts-with-describe' (matches '## Use Contexts (With `describe`)')", () => {
        beforeEach(() => {
          result = render(
            '{{documentation "code/better-tests" section="use-contexts-with-describe"}}',
          );
        });

        it("returns only the section content", () => {
          expect(result).toContain("Use contexts to organize related tests");
          expect(result).toContain("Start context descriptions with");
        });

        it("does not include the next section", () => {
          expect(result).not.toContain("## Keep Descriptions Short");
        });
      });
    });

    describe("when the section does not exist", () => {
      beforeEach(() => {
        result = render('{{documentation "code/better-tests" section="nope"}}');
      });

      it("returns empty string", () => {
        expect(result).toBe("");
      });
    });
  });
});
