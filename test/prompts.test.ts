import { createTestClient } from "./helpers";
import { describe, it, expect, beforeEach, mock } from "bun:test";

describe("prompts", () => {
  let client: Awaited<ReturnType<typeof createTestClient>>;
  let result: Awaited<ReturnType<typeof client.getPrompt>>;

  beforeEach(async () => {
    // Mock the environment module
    mock.module("../src/env.ts", () => ({
      PLANS_DIRECTORY: "/tmp/plans",
      WRITING_FORMAT: "/tmp/format.md",
      WRITING_VOICE: "/tmp/voice.md",
      WRITING_IMPROVEMENT: "/tmp/improvement.md",
    }));

    const { server } = await import("../src/server");
    client = await createTestClient(server);
  });

  it("registers the prompts in the prompts directory", async () => {
    const { prompts } = await client.listPrompts();

    expect(prompts).toContainEqual(
      expect.objectContaining({
        name: "testing/add-tests",
        title: "Add Tests",
        description: expect.stringContaining("Add tests"),
      }),
    );

    expect(prompts).toContainEqual(
      expect.objectContaining({
        name: "writing/format",
        title: "Format",
        description: expect.stringContaining("formatting"),
      }),
    );
  });

  describe("when files in the prompts directory begin with an underscore", () => {
    it("does not register those prompts", async () => {
      const { prompts } = await client.listPrompts();

      expect(prompts).not.toContainEqual(expect.objectContaining({ name: "plan/_instructions" }));
    });
  });

  it("returns the content of the prompt", async () => {
    result = await client.getPrompt({
      name: "writing/format",
      arguments: { target: "ExampleClass" },
    });

    expect(result.messages).toEqual([
      expect.objectContaining({
        role: "user",
        content: expect.objectContaining({
          text: expect.stringMatching(/apply the .* guidelines/i),
          type: "text",
        }),
      }),
    ]);
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

  // TODO: All current prompts have {{target}} parameter. We'll add tests for this case when we have
  // prompts without parameters.
  describe("when the prompt does not include any expressions", () => { });

  describe("when the prompt's template includes a {{target}} expression", () => {
    it("includes an optional target parameter", async () => {
      const { prompts } = await client.listPrompts();

      const prompt = prompts.find(({ name }) => name === "writing/format")!;

      expect(prompt.arguments).toBeDefined();
      expect(prompt.arguments).toHaveLength(1);

      expect(prompt.arguments![0]).toEqual(
        expect.objectContaining({
          name: "target",
          description: expect.stringContaining("Target"),
          required: false,
        }),
      );
    });

    describe("when the target parameter is provided", () => {
      beforeEach(async () => {
        result = await client.getPrompt({
          name: "writing/format",
          arguments: { target: "ExampleClass" },
        });
      });

      it("includes the target in the message", async () => {
        expect(result.messages).toEqual([
          expect.objectContaining({
            role: "user",
            content: expect.objectContaining({
              text: expect.stringContaining("ExampleClass"),
              type: "text",
            }),
          }),
        ]);
      });

      it("does not include 'the current context'", async () => {
        expect(result.messages[0].content.text).not.toContain("the current context");
      });
    });

    describe("when the target parameter is not provided", () => {
      it("includes 'the current context' in the message", async () => {
        result = await client.getPrompt({ name: "writing/format", arguments: {} });

        expect(result.messages).toEqual([
          expect.objectContaining({
            role: "user",
            content: expect.objectContaining({
              text: expect.stringContaining("the current context"),
              type: "text",
            }),
          }),
        ]);
      });
    });
  });

  describe("when the template contains a partial", () => {
    it("includes the partial content in the rendered output", async () => {
      result = await client.getPrompt({
        name: "plan/feature",
        arguments: { description: "Add user authentication", featureBranch: "auth-feature" },
      });

      // The partial content should be included and rendered
      expect(result.messages).toEqual([
        expect.objectContaining({
          role: "user",
          content: expect.objectContaining({
            text: expect.stringContaining("Your job is to"),
            type: "text",
          }),
        }),
      ]);

      // Should not contain unresolved partial syntax
      expect(result.messages).toEqual([
        expect.objectContaining({
          content: expect.objectContaining({
            text: expect.not.stringMatching(/\{\{>|_instructions/),
          }),
        }),
      ]);
    });
  });
});
