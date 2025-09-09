import { server } from "../../src/server.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect } from "bun:test";

describe("prompts/better-tests", () => {
  const PROMPT_OPTIONS = {
    name: "better-tests",
    arguments: {
      target: "test/user.test.ts",
    },
  } as const;

  it("is registered", async () => {
    const client = await createTestClient(server);
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "better-tests" }));
  });

  it("includes the file path and better tests guide", async () => {
    const client = await createTestClient(server);
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("test/user.test.ts");
  });

  it("includes the better tests conventions", async () => {
    const client = await createTestClient(server);
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain(
      "Use `it` instead of `test` for individual test cases",
    );
    expect(result.messages[0].content.text).toContain("Use contexts to organize related tests");
    expect(result.messages[0].content.text).toContain("Always use the `expect` syntax");
  });

  it("removes the frontmatter from the tests guide", async () => {
    const client = await createTestClient(server);
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).not.toContain("---");
    expect(result.messages[0].content.text).not.toContain("title: Better Tests");
  });
});
