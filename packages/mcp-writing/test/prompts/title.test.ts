import { server } from "../../src/server.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach } from "bun:test";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/title", () => {
  const PROMPT_OPTIONS = {
    name: "title",
    arguments: {
      target: "a blog post about TypeScript",
    },
  } as const;

  beforeEach(async () => (client = await createTestClient(server)));

  it("is registered", async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "title" }));
  });

  it("includes the target in the message", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("a blog post about TypeScript");
  });

  it("includes title generation instructions", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Generate 5-10 compelling title options");
    expect(result.messages[0].content.text).toContain("Clear and descriptive");
    expect(result.messages[0].content.text).toContain("numbered list");
  });
});
