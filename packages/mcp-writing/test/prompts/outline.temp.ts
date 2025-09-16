import { server } from "../../src/server.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach } from "bun:test";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/outline", () => {
  const PROMPT_OPTIONS = {
    name: "outline",
    arguments: {
      target: "a research paper on AI",
    },
  } as const;

  beforeEach(async () => (client = await createTestClient(server)));

  it("is registered", async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "outline" }));
  });

  it("includes the target in the message", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("a research paper on AI");
  });

  it("includes outline generation instructions", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Generate a detailed outline");
    expect(result.messages[0].content.text).toContain("hierarchical structure");
    expect(result.messages[0].content.text).toContain("main topics and subtopics");
  });
});
