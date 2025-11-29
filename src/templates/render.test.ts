import { renderTemplate, readPartialContent } from "./render.js";
import { describe, it, expect } from "vitest";

describe("renderTemplate", () => {
  describe("when the template has no placeholders", () => {
    it("returns the template unchanged", () => {
      const template = "This is a plain text template";
      const result = renderTemplate(template, {});
      expect(result).toBe("This is a plain text template");
    });
  });

  describe("when the template has a single placeholder", () => {
    it("replaces the placeholder with the context value", () => {
      const template = "Hello, {{name}}!";
      const result = renderTemplate(template, { name: "World" });
      expect(result).toBe("Hello, World!");
    });
  });

  describe("when the template has multiple placeholders", () => {
    it("replaces all placeholders with their context values", () => {
      const template = "{{greeting}}, {{name}}! {{message}}";
      const result = renderTemplate(template, {
        greeting: "Hello",
        name: "Alice",
        message: "How are you?",
      });
      expect(result).toBe("Hello, Alice! How are you?");
    });
  });

  describe("when the template has placeholders with whitespace", () => {
    it("handles whitespace inside placeholder braces", () => {
      const template = "Hello, {{ name }}!";
      const result = renderTemplate(template, { name: "World" });
      expect(result).toBe("Hello, World!");
    });

    it("handles multiple spaces inside placeholder braces", () => {
      const template = "Hello, {{  name  }}!";
      const result = renderTemplate(template, { name: "World" });
      expect(result).toBe("Hello, World!");
    });
  });

  describe("when the template has repeated placeholders", () => {
    it("replaces all occurrences of the same placeholder", () => {
      const template = "{{name}} meets {{name}} at {{location}}";
      const result = renderTemplate(template, {
        name: "Bob",
        location: "the park",
      });
      expect(result).toBe("Bob meets Bob at the park");
    });
  });

  describe("when the context is missing a placeholder value", () => {
    it("raises an error", () => {
      const template = "Hello, {{name}}! Welcome to {{missing}}.";
      expect(() => renderTemplate(template, { name: "Alice" })).toThrow();
    });
  });

  describe("when the context value is an empty string", () => {
    it("replaces the placeholder with empty string", () => {
      const template = "Name: {{name}}";
      const result = renderTemplate(template, { name: "" });
      expect(result).toBe("Name: ");
    });
  });

  describe("when the template contains a plan partial", () => {
    it("renders the partial", () => {
      const template = "{{> plan/_instructions}}";

      const result = renderTemplate(template, {
        planType: "example",
        currentBranch: "feature-example",
        defaultBranch: "main",
      });

      expect(result).toContain("example implementation plan");
      expect(result).toContain(
        "Please describe the example or provide a Linear issue ID or Linear issue URL",
      );
      expect(result).toContain("switch_git_branch");
      expect(result).toContain("fetch_feature_branch");
      expect(result).toContain("feature-example");
    });
  });

  describe("when the template contains a documentation partial", () => {
    it("renders the partial", () => {
      const template = "{{> doc/test/better-tests}}";
      const result = renderTemplate(template, {});

      expect(result).toContain("Keep Descriptions Short");
      expect(result).toContain("Use Contexts");
      expect(result).toContain("Single Expectations");
    });
  });

  describe("eq helper", () => {
    describe("when values are equal", () => {
      it("returns true", () => {
        const template = "{{#if (eq a b)}}equal{{else}}not equal{{/if}}";
        const result = renderTemplate(template, { a: "test", b: "test" });

        expect(result).toBe("equal");
      });
    });

    describe("when values are not equal", () => {
      it("returns false", () => {
        const template = "{{#if (eq a b)}}equal{{else}}not equal{{/if}}";
        const result = renderTemplate(template, { a: "test", b: "different" });

        expect(result).toBe("not equal");
      });
    });

    describe("when comparing with undefined", () => {
      it("returns false", () => {
        const template = "{{#if (eq a b)}}equal{{else}}not equal{{/if}}";
        const result = renderTemplate(template, { a: "test" });

        expect(result).toBe("not equal");
      });
    });
  });
});

describe("readPartialContent", () => {
  describe("when the partial exists", () => {
    it("returns the partial content", () => {
      const content = readPartialContent("plan/_instructions");

      expect(content).toContain("Your job is to create");
      expect(content).toContain("{{planType}}");
      expect(content).toContain("{{#if (eq currentBranch defaultBranch)}}");
      expect(content).toContain("switch_git_branch");
    });
  });

  describe("when the partial does not exist", () => {
    it("throws an error", () => {
      expect(() => readPartialContent("nonexistent/partial")).toThrow(
        "Partial nonexistent/partial was not found.",
      );
    });
  });
});
