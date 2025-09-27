import { claude } from "../../../src/commands/claude";
import { getCurrentBranch } from "../../../src/commands/git";
import {
  resolvePromptParameterValue,
  extractParametersUsedInTemplate,
} from "../../../src/prompts/parameters";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/commands/claude", () => ({
  claude: vi.fn(() => Promise.resolve("")),
}));

vi.mock("../../../src/commands/git", () => ({
  getCurrentBranch: vi.fn(() => Promise.resolve("mock-current-branch")),
}));

const mockClaude = vi.mocked(claude);
const mockGetCurrentBranch = vi.mocked(getCurrentBranch);

let mockServer: McpServer;

describe("resolvePromptParameterValue", () => {
  beforeEach(() => {
    mockServer = {} as McpServer;
    mockClaude.mockResolvedValue("");
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

  describe("when the parameter is 'linearIssueId'", () => {
    describe("when the value is a valid Linear issue ID", () => {
      it("returns the issue ID", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "linearIssueId",
          {},
          "AB-123",
        );
        expect(result).toBe("AB-123");
      });
    });

    describe("when the value contains text with issue ID", () => {
      it("extracts the issue ID", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "linearIssueId",
          {},
          "Fix the bug ABC-456 today",
        );
        expect(result).toBe("ABC-456");
      });
    });

    describe("when value is surrounded by extra whitespace", () => {
      it("returns the trimmed issue ID", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "linearIssueId",
          {},
          "  XY-789  ",
        );
        expect(result).toBe("XY-789");
      });
    });

    describe("when value does not contain valid issue ID", () => {
      it("throws an McpError", async () => {
        return expect(
          resolvePromptParameterValue(
            mockServer,
            "test/prompt",
            "linearIssueId",
            {},
            "invalid text",
          ),
        ).rejects.toThrow("No valid Linear issue ID found");
      });
    });
  });

  describe("when the parameter is 'featureBranch'", () => {
    beforeEach(() => {
      mockClaude.mockResolvedValue("generated-branch-name");
    });

    it("generates a branch name", async () => {
      const result = await resolvePromptParameterValue(
        mockServer,
        "test/prompt",
        "featureBranch",
        {},
        undefined,
      );

      expect(mockClaude).toHaveBeenCalledWith(
        expect.stringContaining(
          "Create a simple branch name in a few words in kebab case for this test/prompt task",
        ),
      );
      expect(result).toBe("generated-branch-name");
    });
  });

  describe("when the parameter is 'currentBranch'", () => {
    beforeEach(() => {
      mockGetCurrentBranch.mockResolvedValue("feature-branch");
    });

    it("calls getCurrentBranch function", async () => {
      const result = await resolvePromptParameterValue(
        mockServer,
        "test/prompt",
        "currentBranch",
        {},
        undefined,
      );

      expect(mockGetCurrentBranch).toHaveBeenCalled();
      expect(result).toBe("feature-branch");
    });

    describe("when getCurrentBranch returns a different branch", () => {
      beforeEach(() => {
        mockGetCurrentBranch.mockResolvedValue("main");
      });

      it("returns the current branch name", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "currentBranch",
          {},
          undefined,
        );

        expect(result).toBe("main");
      });
    });

    describe("when getCurrentBranch returns a branch with special characters", () => {
      beforeEach(() => {
        mockGetCurrentBranch.mockResolvedValue("feature/ABC-123-fix-login");
      });

      it("returns the exact branch name", async () => {
        const result = await resolvePromptParameterValue(
          mockServer,
          "test/prompt",
          "currentBranch",
          {},
          undefined,
        );

        expect(result).toBe("feature/ABC-123-fix-login");
      });
    });

    it("ignores any provided value and always gets the current branch", async () => {
      const result = await resolvePromptParameterValue(
        mockServer,
        "test/prompt",
        "currentBranch",
        {},
        "provided-value",
      );

      expect(mockGetCurrentBranch).toHaveBeenCalled();
      expect(result).toBe("feature-branch");
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

      it("extracts linearIssueId parameter", () => {
        expect(extractParametersUsedInTemplate("Issue: {{linearIssueId}}")).toEqual([
          {
            name: "linearIssueId",
            description: "Linear issue ID (e.g. AB-123)",
            type: "required",
            transform: expect.any(Function),
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
      const result = extractParametersUsedInTemplate(
        '{{target}} {{> plan/_instructions planType="test""}}',
      );

      const parameterNames = result.map(({ name }) => name);

      expect(parameterNames).toEqual(["target", "featureBranch"]);
    });
  });
});
