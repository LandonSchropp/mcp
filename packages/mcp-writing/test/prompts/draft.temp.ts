import { server } from "../../src/server.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach } from "bun:test";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/draft", () => {
  const PROMPT_OPTIONS = {
    name: "draft",
    arguments: {
      target: "an outline for a blog post",
    },
  } as const;

  beforeEach(async () => (client = await createTestClient(server)));

  it("is registered", async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "draft" }));
  });

  it("includes the target in the message", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("an outline for a blog post");
  });

  it("includes draft development instructions", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Transform the outline");
    expect(result.messages[0].content.text).toContain("Complete paragraphs");
    expect(result.messages[0].content.text).toContain("narrative flow");
  });
});
