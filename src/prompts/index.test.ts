import { createTestClient } from "../../test/helpers.js";
import { server } from "../server.js";
import { Client } from "@modelcontextprotocol/sdk/client";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../commands/git", () => ({
  getCurrentBranch: vi.fn(() => Promise.resolve("current-branch-name")),
  getDefaultBranch: vi.fn(() => Promise.resolve("main")),
}));

describe("prompts", () => {
  let client: Client;
  let result: Awaited<ReturnType<typeof client.getPrompt>>;

  beforeEach(async () => {
    client = await createTestClient(server);
  });

  describe("registration", () => {
    it("registers all prompts", async () => {
      const { prompts } = await client.listPrompts();

      expect(prompts).toContainEqual(
        expect.objectContaining({
          name: "writing/format",
          title: "writing/format",
          description: expect.stringContaining("formatting"),
        }),
      );

      expect(prompts).toContainEqual(
        expect.objectContaining({
          name: "testing/add-tests",
        }),
      );

      expect(prompts).toContainEqual(
        expect.objectContaining({
          name: "testing/add-specs",
        }),
      );
    });

    describe("when the prompt begins with an underscore", () => {
      it("does not register the prompt", async () => {
        const { prompts } = await client.listPrompts();

        expect(prompts).not.toContainEqual(expect.objectContaining({ name: "plan/_instructions" }));
      });
    });
  });

  it("returns the content of the prompt", async () => {
    result = await client.getPrompt({
      name: "writing/format",
      arguments: { target: "ExampleClass" },
    });

    expect(result.messages[0]).toEqual(
      expect.objectContaining({
        role: "user",
        content: expect.objectContaining({
          text: expect.stringMatching(/apply the .* guidelines/i),
          type: "text",
        }),
      }),
    );
  });

  it("strips the frontmatter from the content", async () => {
    result = await client.getPrompt({
      name: "writing/format",
      arguments: { target: "ExampleClass" },
    });

    const text = result.messages[0].content.text;

    expect(text).not.toContain("---");
    expect(text).not.toContain("title:");
  });

  describe("when the prompt's template includes a target partial", () => {
    it("has no target parameter", async () => {
      const { prompts } = await client.listPrompts();

      const prompt = prompts.find(({ name }) => name === "writing/format")!;

      expect(prompt.arguments).toBeDefined();
      expect(prompt.arguments).toHaveLength(0);
    });

    it("includes the target prompt in the message", async () => {
      result = await client.getPrompt({ name: "writing/format", arguments: {} });

      expect(result.messages[0]).toEqual(
        expect.objectContaining({
          role: "user",
          content: expect.objectContaining({
            text: expect.stringContaining("What would you like to format?"),
            type: "text",
          }),
        }),
      );
    });

    it("includes TARGET variable in the message", async () => {
      result = await client.getPrompt({ name: "writing/format", arguments: {} });

      expect(result.messages[0]).toEqual(
        expect.objectContaining({
          role: "user",
          content: expect.objectContaining({
            text: expect.stringContaining("TARGET"),
            type: "text",
          }),
        }),
      );
    });
  });

  describe("when the template contains a partial", () => {
    it("includes the partial content in the rendered output", async () => {
      result = await client.getPrompt({
        name: "plan/feature",
        arguments: { description: "Add user authentication", featureBranch: "auth-feature" },
      });

      // The partial content should be included and rendered
      expect(result.messages[0]).toEqual(
        expect.objectContaining({
          role: "user",
          content: expect.objectContaining({
            text: expect.stringContaining("Your job is to"),
            type: "text",
          }),
        }),
      );

      // Should not contain unresolved partial syntax
      expect(result.messages[0].content.text).not.toMatch(/\{\{>|_instructions/);
    });
  });

  describe("currentBranch parameter", () => {
    it("resolves the currentBranch parameter automatically", async () => {
      result = await client.getPrompt({
        name: "git/pull-request",
        arguments: {},
      });

      expect(result.messages[0]).toEqual(
        expect.objectContaining({
          role: "user",
          content: expect.objectContaining({
            text: expect.stringContaining("current-branch-name"),
            type: "text",
          }),
        }),
      );

      expect(result.messages[0].content.text).not.toContain("{{currentBranch}}");
    });

    it("does not expose currentBranch in the prompt's arguments", async () => {
      const { prompts } = await client.listPrompts();
      const pullRequestPrompt = prompts.find(({ name }) => name === "git/pull-request");

      expect(pullRequestPrompt).toBeDefined();

      const argumentNames = pullRequestPrompt?.arguments?.map((arg) => arg.name);
      expect(argumentNames).not.toContain("currentBranch");
    });
  });

  describe("linearIssueId parameter", () => {
    it("registers the linear/example prompt with linearIssueId parameter", async () => {
      const { prompts } = await client.listPrompts();
      const linearPrompt = prompts.find(({ name }) => name === "linear/example");

      expect(linearPrompt).toBeDefined();
      expect(linearPrompt?.arguments).toBeDefined();
      expect(linearPrompt?.arguments).toHaveLength(1);

      expect(linearPrompt?.arguments![0]).toEqual(
        expect.objectContaining({
          name: "linearIssueId",
          description: "Linear issue ID (e.g. AB-123)",
          required: true,
        }),
      );
    });

    describe("when linearIssueId parameter is provided with valid issue ID", () => {
      it("includes the issue ID in the message", async () => {
        result = await client.getPrompt({
          name: "linear/example",
          arguments: { linearIssueId: "ABC-123" },
        });

        expect(result.messages).toEqual([
          expect.objectContaining({
            role: "user",
            content: expect.objectContaining({
              text: expect.stringContaining("ABC-123"),
              type: "text",
            }),
          }),
        ]);
      });
    });

    describe("when linearIssueId parameter contains text with issue ID", () => {
      it("extracts just the issue ID from the text", async () => {
        result = await client.getPrompt({
          name: "linear/example",
          arguments: { linearIssueId: "Fix the bug XY-789 today" },
        });

        expect(result.messages).toEqual([
          expect.objectContaining({
            role: "user",
            content: expect.objectContaining({
              text: expect.stringContaining("XY-789"),
              type: "text",
            }),
          }),
        ]);

        expect(result.messages[0].content.text).not.toContain("Fix the bug");
        expect(result.messages[0].content.text).not.toContain("today");
      });
    });

    describe("when linearIssueId parameter contains invalid text", () => {
      it("throws an error for invalid issue ID", async () => {
        await expect(
          client.getPrompt({
            name: "linear/example",
            arguments: { linearIssueId: "invalid text without issue ID" },
          }),
        ).rejects.toThrow();
      });
    });

    describe("when linearIssueId parameter is not provided", () => {
      it("throws an error for missing required parameter", async () => {
        await expect(
          client.getPrompt({
            name: "linear/example",
            arguments: {},
          }),
        ).rejects.toThrow();
      });
    });
  });

  describe("resource URI extraction and linking", () => {
    describe("when the prompt contains a full URI without variables", () => {
      it("extracts the URI and includes it as a resource link", async () => {
        result = await client.getPrompt({
          name: "writing/format",
          arguments: {},
        });

        expect(result.messages).toHaveLength(2);

        expect(result.messages[0]).toEqual(
          expect.objectContaining({
            role: "user",
            content: expect.objectContaining({
              type: "text",
            }),
          }),
        );

        expect(result.messages[1]).toEqual(
          expect.objectContaining({
            role: "user",
            content: expect.objectContaining({
              type: "resource_link",
              uri: "doc://writing/format",
              name: "doc://writing/format",
            }),
          }),
        );
      });
    });

    describe("when the prompt does not contain any URIs", () => {
      it("only includes the text message without resource links", async () => {
        result = await client.getPrompt({
          name: "plan/feature",
          arguments: { description: "Add user authentication", featureBranch: "auth-feature" },
        });

        expect(result.messages).toHaveLength(1);

        expect(result.messages[0]).toEqual(
          expect.objectContaining({
            role: "user",
            content: expect.objectContaining({
              type: "text",
            }),
          }),
        );
      });
    });
  });
});
