import { replacePlaceholders, extractPlaceholders } from "../../src/templates/placeholders.js";
import { describe, it, expect } from "vitest";

describe("extractPlaceholders", () => {
  describe("when the template has no placeholders", () => {
    it("returns an empty set", () => {
      const template = "This is a plain text template";
      const result = extractPlaceholders(template);
      expect(result).toEqual(new Set());
    });
  });

  describe("when the template has a single placeholder", () => {
    it("returns the placeholder name", () => {
      const template = "Hello, {{name}}!";
      const result = extractPlaceholders(template);
      expect(result).toEqual(new Set(["name"]));
    });
  });

  describe("when the template has multiple unique placeholders", () => {
    it("returns all unique placeholder names", () => {
      const template = "{{greeting}}, {{name}}! {{message}}";
      const result = extractPlaceholders(template);
      expect(result).toEqual(new Set(["greeting", "name", "message"]));
    });
  });

  describe("when the template has repeated placeholders", () => {
    it("returns each placeholder name only once", () => {
      const template = "{{name}} meets {{name}} at {{location}}";
      const result = extractPlaceholders(template);
      expect(result).toEqual(new Set(["name", "location"]));
    });
  });

  describe("when placeholders have whitespace", () => {
    it("trims whitespace from placeholder names", () => {
      const template = "Hello, {{ name }}! Welcome, {{  user  }}.";
      const result = extractPlaceholders(template);
      expect(result).toEqual(new Set(["name", "user"]));
    });
  });

  describe("when the template has multiple lines", () => {
    it("extracts the placeholders", () => {
      const template = `
        Line 1: {{first}}
        Line 2: {{second}}
        Line 3: {{first}} and {{third}}
      `;
      const result = extractPlaceholders(template);
      expect(result).toEqual(new Set(["first", "second", "third"]));
    });
  });

  describe("when the template includes a partial", () => {
    it("extracts placeholders from both the template and the partial", () => {
      const template = "{{title}} {{> plan/_instructions}}";
      const result = extractPlaceholders(template);

      expect(result).toContain("title");
      expect(result).toContain("planType");
      expect(result).toContain("currentBranch");
    });
  });

  describe("when the template includes a partial with some parameters explicitly passed", () => {
    it("extracts placeholders from both the template and the partial", () => {
      const template = '{{title}} {{> plan/_instructions planType="test"}}';
      const result = extractPlaceholders(template);

      expect(result).toContain("title");
      expect(result).toContain("currentBranch");

      expect(result).not.toContain("planType");
    });

    describe("when the parameter value contains whitespace", () => {
      it("excludes the parameter from required placeholders", () => {
        const template = '{{title}} {{> plan/_instructions planType="bug fix"}}';
        const result = extractPlaceholders(template);

        expect(result).toContain("title");
        expect(result).toContain("currentBranch");
        expect(result).not.toContain("planType");
      });
    });
  });
});

describe("replacePlaceholders", () => {
  describe("when the template has no placeholders", () => {
    it("returns the template unchanged", () => {
      const template = "This is a plain text template";
      const result = replacePlaceholders(template, {});
      expect(result).toBe("This is a plain text template");
    });
  });

  describe("when the template has a single placeholder", () => {
    it("replaces the placeholder", () => {
      const template = "Hello, {{name}}!";
      const result = replacePlaceholders(template, { name: "World" });
      expect(result).toBe("Hello, World!");
    });
  });

  describe("when the template has multiple placeholders", () => {
    it("replaces the placeholders", () => {
      const template = "{{greeting}}, {{name}}!";
      const result = replacePlaceholders(template, {
        greeting: "Hello",
        name: "Alice",
      });
      expect(result).toBe("Hello, Alice!");
    });
  });

  describe("when placeholders have whitespace", () => {
    it("replaces the placeholders", () => {
      const template = "Hello, {{ name }}!";
      const result = replacePlaceholders(template, { name: "World" });
      expect(result).toBe("Hello, World!");
    });
  });

  describe("when the context is missing placeholders in the template", () => {
    it("raises an error", () => {
      const template = "Hello, {{name}}! Welcome to {{place}}.";
      expect(() => replacePlaceholders(template, { name: "Alice" })).toThrow();
    });
  });
});
