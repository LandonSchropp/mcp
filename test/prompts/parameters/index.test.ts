import {
  resolvePromptParameterValue,
  extractParametersUsedInTemplate,
} from "../../../src/prompts/parameters";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

let mockServer: McpServer;
let mockClaude: Mock<(command: string) => Promise<string>>;

describe("resolvePromptParameterValue", () => {
  beforeEach(() => {
    mockServer = {} as McpServer;
    mockClaude = vi.fn(() => Promise.resolve(""));

    vi.mock("../../../src/commands/claude", () => ({
      claude: mockClaude,
    }));
  });

  describe("when the parameter is 'target'", () => {
    describe("when the value is defined", () => {
      it("returns the provided value", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "target",
          {},
          "ExampleTarget",
        );
        expect(result).toBe("ExampleTarget");
      });
    });

    describe("when value is surrounded by extra whitespace", () => {
      it("returns the trimmed value", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "target",
          {},
          "  ExampleTarget  ",
        );
        expect(result).toBe("ExampleTarget");
      });
    });

    describe("when the value is undefined", () => {
      it("returns the default value", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "target",
          {},
          undefined,
        );
        expect(result).toBe("the current context");
      });
    });

    describe("when value is an empty string", () => {
      it("returns the default value", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "target",
          {},
          "",
        );
        expect(result).toBe("the current context");
      });
    });

    describe("when value is only whitespace", () => {
      it("returns the default value", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "target",
          {},
          "   \t\n  ",
        );
        expect(result).toBe("the current context");
      });
    });
  });

  describe("when the parameter is 'description'", () => {
    describe("when the value is defined", () => {
      it("returns the provided value", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "description",
          {},
          "Fix the login bug",
        );
        expect(result).toBe("Fix the login bug");
      });
    });

    describe("when value is surrounded by extra whitespace", () => {
      it("returns the trimmed value", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "description",
          {},
          "  Fix the login bug  ",
        );
        expect(result).toBe("Fix the login bug");
      });
    });

    describe("when the value is undefined", () => {
      it("returns the default value", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "description",
          {},
          undefined,
        );
        expect(result).toBe("the task in the current context");
      });
    });

    describe("when value is an empty string", () => {
      it("returns the default value", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "description",
          {},
          "",
        );
        expect(result).toBe("the task in the current context");
      });
    });

    describe("when value is only whitespace", () => {
      it("returns the default value", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "description",
          {},
          "   \t\n  ",
        );
        expect(result).toBe("the task in the current context");
      });
    });
  });

  describe("when the parameter is 'planType'", () => {
    describe("when the prompt name contains a single slash", () => {
      it("returns the value after the slash", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "plan/bug-fix",
          "planType",
          {},
          undefined,
        );
        expect(result).toBe("bug-fix");
      });
    });

    describe("when the prompt name contains multiple slashes", () => {
      it("returns the value after the last slash", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "category/subcategory/feature",
          "planType",
          {},
          undefined,
        );
        expect(result).toBe("feature");
      });
    });

    describe("when the prompt name contains no slashes", () => {
      it("returns the entire prompt name", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "simple-prompt",
          "planType",
          {},
          undefined,
        );
        expect(result).toBe("simple-prompt");
      });
    });
  });

  describe("when the parameter is 'featureBranch'", () => {
    beforeEach(() => {
      mockClaude.mockResolvedValue("generated-branch-name");
    });

    describe("when description contains a Linear issue ID", () => {
      it("fetches the issue using Linear MCP", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "featureBranch",
          { description: "Fix the login bug AB-123" },
          undefined,
        );

        expect(mockClaude).toHaveBeenCalledWith(
          expect.stringContaining("Fetch AB-123 using the Linear MCP"),
        );
        expect(result).toBe("generated-branch-name");
      });

      describe("when the issue ID has more than 2 letters", () => {
        it("fetches the correct issue", async () => {
          await resolvePromptParameterValue(
            mockServer,
            "test/prompt",
            "featureBranch",
            { description: "Update settings for ABC-456" },
            undefined,
          );

          expect(mockClaude).toHaveBeenCalledWith(
            expect.stringContaining("Fetch ABC-456 using the Linear MCP"),
          );
        });
      });

      describe("when the issue ID is in the middle of the description", () => {
        it("extracts and fetches the issue", async () => {
          await resolvePromptParameterValue(
            mockServer,
            "test/prompt",
            "featureBranch",
            { description: "This is about XY-789 and some other stuff" },
            undefined,
          );

          expect(mockClaude).toHaveBeenCalledWith(
            expect.stringContaining("Fetch XY-789 using the Linear MCP"),
          );
        });
      });
    });

    describe("when description does not contain a Linear issue ID", () => {
      it("generates a branch name from description", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "featureBranch",
          { description: "Add user authentication feature" },
          undefined,
        );

        expect(mockClaude).toHaveBeenCalledWith(expect.stringContaining("few words in kebab case"));
        expect(result).toBe("generated-branch-name");
      });

      describe("when the description contains special characters", () => {
        it("generates a branch name", async () => {
          await resolvePromptParameterValue(
            mockServer,
            "test/prompt",
            "featureBranch",
            { description: "Fix bug in payment flow & validation" },
            undefined,
          );

          expect(mockClaude).toHaveBeenCalledWith(
            expect.stringContaining("Fix bug in payment flow & validation"),
          );
        });
      });
    });

    describe("when description is missing or empty", () => {
      it("throws an error when description is undefined", async () => {
        return expect(
          resolvePromptParameterValue(mockServer, "test/prompt", "featureBranch", {}, undefined),
        ).rejects.toThrow("Cannot resolve featureBranch without a description");
      });

      it("throws an error when description is empty", async () => {
        return expect(
          resolvePromptParameterValue(
            mockServer,
            "test/prompt",
            "featureBranch",
            { description: "" },
            undefined,
          ),
        ).rejects.toThrow("Cannot resolve featureBranch without a description");
      });

      it("throws an error when description is only whitespace", async () => {
        return expect(
          resolvePromptParameterValue(
            mockServer,
            "test/prompt",
            "featureBranch",
            { description: "   \t\n  " },
            undefined,
          ),
        ).rejects.toThrow("Cannot resolve featureBranch without a description");
      });
    });
  });

  describe("when given a parameter that is not allowed", () => {
    it("throws an error", () => {
      return expect(
        resolvePromptParameterValue(mockServer, "test/prompt", "unknown", {}, "value"),
      ).rejects.toThrow();
    });
  });
});

describe("extractParametersUsedInTemplate", () => {
  describe("when template contains no parameters", () => {
    it("returns an empty array", () => {
      expect(extractParametersUsedInTemplate("This is plain text")).toEqual([]);
    });
  });

  describe("when template contains a single parameter", () => {
    describe("when the curly braces do not contain whitespace", () => {
      it("extracts the parameter name", () => {
        expect(extractParametersUsedInTemplate("Apply to {{target}}")).toEqual([
          {
            name: "target",
            description: "Target (path, description, reference, etc.)",
            type: "optional",
            resolve: expect.any(Function),
          },
        ]);
      });
    });

    describe("when the curly braces contain whitespace", () => {
      it("extracts the parameter name", () => {
        expect(extractParametersUsedInTemplate("Apply to {{ target }}")).toEqual([
          {
            name: "target",
            description: "Target (path, description, reference, etc.)",
            type: "optional",
            resolve: expect.any(Function),
          },
        ]);
        expect(extractParametersUsedInTemplate("Apply to {{  target  }}")).toEqual([
          {
            name: "target",
            description: "Target (path, description, reference, etc.)",
            type: "optional",
            resolve: expect.any(Function),
          },
        ]);
      });
    });
  });

  describe("when template contains multiple occurrences of the same parameter", () => {
    it("only returns the parameter once", () => {
      const template = "Transform {{target}} and update {{ target }} with new {{target}}";
      expect(extractParametersUsedInTemplate(template)).toEqual([
        {
          name: "target",
          description: "Target (path, description, reference, etc.)",
          type: "optional",
          resolve: expect.any(Function),
        },
      ]);
    });
  });

  describe("when template contains unknown parameters", () => {
    it("does not return the unknown parameters", () => {
      const template = "Apply to {{target}} and {{unknown}} parameter";
      expect(extractParametersUsedInTemplate(template)).toEqual([
        {
          name: "target",
          description: "Target (path, description, reference, etc.)",
          type: "optional",
          resolve: expect.any(Function),
        },
      ]);
    });
  });

  describe("when template contains single curly braces", () => {
    it("does not include the parameter", () => {
      expect(extractParametersUsedInTemplate("Use {target} here")).toEqual([]);
    });
  });

  describe("when template contains incomplete braces", () => {
    it("does not include the parameter", () => {
      expect(extractParametersUsedInTemplate("Use {{target here")).toEqual([]);
      expect(extractParametersUsedInTemplate("Use target}} here")).toEqual([]);
    });
  });

  describe("when template contains other Handlebars syntax", () => {
    it("does not include the expressions", () => {
      expect(extractParametersUsedInTemplate("Use {{#if condition}}{{/if}}")).toEqual([]);
    });
  });

  describe("when template contains partials", () => {
    it("includes parameters from the partial", () => {
      const result = extractParametersUsedInTemplate("{{target}} {{> plan/_instructions}}");
      const parameterNames = result.map((p) => p.name);

      // target is in the main template
      expect(parameterNames).toContain("target");
      // description, planType, featureBranch are in the partial
      expect(parameterNames).toContain("description");
      expect(parameterNames).toContain("planType");
      expect(parameterNames).toContain("featureBranch");
    });
  });
});
