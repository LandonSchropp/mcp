import {
  resolvePromptParameterValue,
  extractPromptParametersFromTemplate,
} from "../src/prompt-parameters";
import { describe, it, expect } from "bun:test";

describe("resolvePromptParameterValue", () => {
  describe("when the parameter is 'target'", () => {
    describe("when the value is defined", () => {
      it("returns the provided value", async () => {
        const result = await resolvePromptParameterValue("target", "ExampleTarget");
        expect(result).toBe("ExampleTarget");
      });
    });

    describe("when value is surrounded by extra whitespace", () => {
      it("returns the default value", async () => {
        const result = await resolvePromptParameterValue("target", "  ExampleTarget  ");
        expect(result).toBe("ExampleTarget");
      });
    });

    describe("when the value is undefined", () => {
      it("returns the default value", async () => {
        const result = await resolvePromptParameterValue("target", undefined);
        expect(result).toBe("the current context");
      });
    });

    describe("when value is an empty string", () => {
      it("returns the default value", async () => {
        const result = await resolvePromptParameterValue("target", "");
        expect(result).toBe("the current context");
      });
    });
  });

  describe("when given a parameter that is not allowed", () => {
    it("throws an error", () => {
      return expect(resolvePromptParameterValue("unknown", "value")).rejects.toThrow();
    });
  });
});

describe("extractPromptParametersFromTemplate", () => {
  describe("when template contains no parameters", () => {
    it("returns an empty array", () => {
      expect(extractPromptParametersFromTemplate("This is plain text")).toEqual([]);
    });
  });

  describe("when template contains a single parameter", () => {
    describe("when the curly braces do not contain whitespace", () => {
      it("extracts the parameter name", () => {
        expect(extractPromptParametersFromTemplate("Apply to {{target}}")).toEqual([
          { name: "target", description: "Target (path, description, or reference)" },
        ]);
      });
    });

    describe("when the curly braces contain whitespace", () => {
      it("extracts the parameter name", () => {
        expect(extractPromptParametersFromTemplate("Apply to {{ target }}")).toEqual([
          { name: "target", description: "Target (path, description, or reference)" },
        ]);
        expect(extractPromptParametersFromTemplate("Apply to {{  target  }}")).toEqual([
          { name: "target", description: "Target (path, description, or reference)" },
        ]);
      });
    });
  });

  describe("when template contains multiple occurrences of the same parameter", () => {
    it("only returns the parameter once", () => {
      const template = "Transform {{target}} and update {{ target }} with new {{target}}";
      expect(extractPromptParametersFromTemplate(template)).toEqual([
        { name: "target", description: "Target (path, description, or reference)" },
      ]);
    });
  });

  describe("when template contains unknown parameters", () => {
    it("does not return the unknown parameters", () => {
      const template = "Apply to {{target}} and {{unknown}} parameter";
      expect(extractPromptParametersFromTemplate(template)).toEqual([
        { name: "target", description: "Target (path, description, or reference)" },
      ]);
    });
  });

  describe("when template contains single curly braces", () => {
    it("does not include the parameter", () => {
      expect(extractPromptParametersFromTemplate("Use {target} here")).toEqual([]);
    });
  });

  describe("when template contains incomplete braces", () => {
    it("does not include the parameter", () => {
      expect(extractPromptParametersFromTemplate("Use {{target here")).toEqual([]);
      expect(extractPromptParametersFromTemplate("Use target}} here")).toEqual([]);
    });
  });

  describe("when template contains other Handlebars syntax", () => {
    it("does not include the expressions", () => {
      expect(extractPromptParametersFromTemplate("Use {{#if condition}}{{/if}}")).toEqual([]);
      expect(extractPromptParametersFromTemplate("Use {{> partial}}")).toEqual([]);
    });
  });
});
