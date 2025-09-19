import { renderTemplate } from "../../src/templates/render";
import { describe, it, expect } from "bun:test";

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

  describe("when the template has special characters", () => {
    it("handles templates with newlines", () => {
      const template = "Line 1: {{first}}\nLine 2: {{second}}";
      const result = renderTemplate(template, {
        first: "Hello",
        second: "World",
      });
      expect(result).toBe("Line 1: Hello\nLine 2: World");
    });

    it("handles templates with tabs", () => {
      const template = "Column1:\t{{col1}}\nColumn2:\t{{col2}}";
      const result = renderTemplate(template, {
        col1: "Value1",
        col2: "Value2",
      });
      expect(result).toBe("Column1:\tValue1\nColumn2:\tValue2");
    });
  });

  describe("when the context value is an empty string", () => {
    it("replaces the placeholder with empty string", () => {
      const template = "Name: {{name}}";
      const result = renderTemplate(template, { name: "" });
      expect(result).toBe("Name: ");
    });
  });
});
