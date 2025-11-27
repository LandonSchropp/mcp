import { getCurrentBranch } from "../../commands/git.js";
import { resolvePromptParameterValue, extractParametersUsedInTemplate } from "./index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

const mockGetCurrentBranch: Mock<typeof getCurrentBranch> = vi.hoisted(() =>
  vi.fn(async () => "current-branch"),
);

vi.mock("../../commands/git", () => ({
  getCurrentBranch: mockGetCurrentBranch,
}));

let server: McpServer;

describe("resolvePromptParameterValue", () => {
  beforeEach(() => (server = new McpServer({ name: "test", version: "0.0.0" })));

  describe("when the parameter is 'linearIssueId'", () => {
    describe("when the value is a valid Linear issue ID", () => {
      it("returns the issue ID", async () => {
        const result = await resolvePromptParameterValue(
          server,
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
          server,
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
          server,
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
          resolvePromptParameterValue(server, "test/prompt", "linearIssueId", {}, "invalid text"),
        ).rejects.toThrow("No valid Linear issue ID found");
      });
    });
  });

  describe("when the parameter is 'currentBranch'", () => {
    beforeEach(() => {
      mockGetCurrentBranch.mockResolvedValue("feature-branch");
    });

    it("calls getCurrentBranch function", async () => {
      const result = await resolvePromptParameterValue(
        server,
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
          server,
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
          server,
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
        server,
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
        resolvePromptParameterValue(server, "test/prompt", "unknown", {}, "value"),
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
      it("extracts linearIssueId parameter", () => {
        expect(extractParametersUsedInTemplate("Issue: {{ linearIssueId }}")).toEqual([
          {
            name: "linearIssueId",
            description: "Linear issue ID (e.g. AB-123)",
            type: "required",
            transform: expect.any(Function),
          },
        ]);
        expect(extractParametersUsedInTemplate("Issue: {{  linearIssueId  }}")).toEqual([
          {
            name: "linearIssueId",
            description: "Linear issue ID (e.g. AB-123)",
            type: "required",
            transform: expect.any(Function),
          },
        ]);
      });
    });
  });

  describe("when template contains multiple occurrences of the same parameter", () => {
    it("only returns the parameter once", () => {
      const template =
        "Issue {{linearIssueId}} and refer to {{ linearIssueId }} with new {{linearIssueId}}";
      expect(extractParametersUsedInTemplate(template)).toEqual([
        {
          name: "linearIssueId",
          description: "Linear issue ID (e.g. AB-123)",
          type: "required",
          transform: expect.any(Function),
        },
      ]);
    });
  });

  describe("when template contains unknown parameters", () => {
    it("does not return the unknown parameters", () => {
      const template = "Issue {{linearIssueId}} and {{unknown}} parameter";
      expect(extractParametersUsedInTemplate(template)).toEqual([
        {
          name: "linearIssueId",
          description: "Linear issue ID (e.g. AB-123)",
          type: "required",
          transform: expect.any(Function),
        },
      ]);
    });
  });

  describe("when template contains single curly braces", () => {
    it("does not include the parameter", () => {
      expect(extractParametersUsedInTemplate("Use {linearIssueId} here")).toEqual([]);
    });
  });

  describe("when template contains incomplete braces", () => {
    it("does not include the parameter", () => {
      expect(extractParametersUsedInTemplate("Use {{linearIssueId here")).toEqual([]);
      expect(extractParametersUsedInTemplate("Use linearIssueId}} here")).toEqual([]);
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
        '{{linearIssueId}} {{> plan/_instructions planType="test""}}',
      );

      const parameterNames = result.map(({ name }) => name);

      expect(parameterNames).toEqual(["linearIssueId", "currentBranch"]);
    });
  });
});
