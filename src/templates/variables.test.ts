import { replaceVariables, extractVariables } from "./variables.js";
import { describe, it, expect } from "vitest";

describe("extractVariables", () => {
  describe("when the template has no variables", () => {
    it("returns an empty set", () => {
      const template = "This is a plain text template";
      const result = extractVariables(template);
      expect(result).toEqual(new Set());
    });
  });

  describe("when the template has a single variable", () => {
    it("returns the variable name", () => {
      const template = "Hello, {{name}}!";
      const result = extractVariables(template);
      expect(result).toEqual(new Set(["name"]));
    });
  });

  describe("when the template has multiple unique variables", () => {
    it("returns all unique variable names", () => {
      const template = "{{greeting}}, {{name}}! {{message}}";
      const result = extractVariables(template);
      expect(result).toEqual(new Set(["greeting", "name", "message"]));
    });
  });

  describe("when the template has repeated variables", () => {
    it("returns each variable name only once", () => {
      const template = "{{name}} meets {{name}} at {{location}}";
      const result = extractVariables(template);
      expect(result).toEqual(new Set(["name", "location"]));
    });
  });

  describe("when variables have whitespace", () => {
    it("trims whitespace from variable names", () => {
      const template = "Hello, {{ name }}! Welcome, {{  user  }}.";
      const result = extractVariables(template);
      expect(result).toEqual(new Set(["name", "user"]));
    });
  });

  describe("when the template has multiple lines", () => {
    it("extracts the variables", () => {
      const template = `
        Line 1: {{first}}
        Line 2: {{second}}
        Line 3: {{first}} and {{third}}
      `;
      const result = extractVariables(template);
      expect(result).toEqual(new Set(["first", "second", "third"]));
    });
  });

  describe("when the template includes a partial", () => {
    it("extracts variables from both the template and the partial", () => {
      const template = "{{title}} {{> plan/_instructions}}";
      const result = extractVariables(template);

      expect(result).toContain("title");
      expect(result).toContain("planType");
      expect(result).toContain("currentBranch");
    });
  });

  describe("when the template includes a partial with some parameters explicitly passed", () => {
    it("extracts variables from both the template and the partial", () => {
      const template = '{{title}} {{> plan/_instructions planType="test"}}';
      const result = extractVariables(template);

      expect(result).toContain("title");
      expect(result).toContain("currentBranch");

      expect(result).not.toContain("planType");
    });

    describe("when the parameter value contains whitespace", () => {
      it("excludes the parameter from required variables", () => {
        const template = '{{title}} {{> plan/_instructions planType="bug fix"}}';
        const result = extractVariables(template);

        expect(result).toContain("title");
        expect(result).toContain("currentBranch");
        expect(result).not.toContain("planType");
      });
    });
  });
});

describe("replaceVariables", () => {
  describe("when the template has no variables", () => {
    it("returns the template unchanged", () => {
      const template = "This is a plain text template";
      const result = replaceVariables(template, {});
      expect(result).toBe("This is a plain text template");
    });
  });

  describe("when the template has a single variable", () => {
    it("replaces the variable", () => {
      const template = "Hello, {{name}}!";
      const result = replaceVariables(template, { name: "World" });
      expect(result).toBe("Hello, World!");
    });
  });

  describe("when the template has multiple variables", () => {
    it("replaces the variables", () => {
      const template = "{{greeting}}, {{name}}!";
      const result = replaceVariables(template, {
        greeting: "Hello",
        name: "Alice",
      });
      expect(result).toBe("Hello, Alice!");
    });
  });

  describe("when variables have whitespace", () => {
    it("replaces the variables", () => {
      const template = "Hello, {{ name }}!";
      const result = replaceVariables(template, { name: "World" });
      expect(result).toBe("Hello, World!");
    });
  });

  describe("when the context is missing variables in the template", () => {
    it("raises an error", () => {
      const template = "Hello, {{name}}! Welcome to {{place}}.";
      expect(() => replaceVariables(template, { name: "Alice" })).toThrow();
    });
  });
});
