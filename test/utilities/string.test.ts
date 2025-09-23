import { kebabCase } from "../../src/utilities/string";
import { describe, it, expect } from "vitest";

describe("kebabCase", () => {
  describe("when given basic text", () => {
    it("converts to kebab-case", () => {
      expect(kebabCase("Hello World")).toBe("hello-world");
    });
  });

  describe("when given text with special characters", () => {
    it("removes special characters", () => {
      expect(kebabCase("Use Contexts (With `describe`)")).toBe("use-contexts-with-describe");
    });
  });

  describe("when given text with multiple spaces", () => {
    it("normalizes to single dashes", () => {
      expect(kebabCase("Multiple   Spaces")).toBe("multiple-spaces");
    });
  });

  describe("when given text with existing dashes", () => {
    it("preserves kebab-case format", () => {
      expect(kebabCase("Already-Has-Dashes")).toBe("already-has-dashes");
    });
  });

  describe("when given text with mixed case and numbers", () => {
    it("converts to lowercase kebab-case", () => {
      expect(kebabCase("API v2 Testing")).toBe("api-v2-testing");
    });
  });

  describe("when given an empty string", () => {
    it("returns empty string", () => {
      expect(kebabCase("")).toBe("");
    });
  });

  describe("when given only special characters", () => {
    it("returns empty string", () => {
      expect(kebabCase("!!!")).toBe("");
    });
  });

  describe("when given text with leading and trailing whitespace", () => {
    it("trims whitespace", () => {
      expect(kebabCase("  Trimmed  ")).toBe("trimmed");
    });
  });
});
