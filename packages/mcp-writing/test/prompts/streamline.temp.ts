import { server } from "../../src/server.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach } from "bun:test";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/streamline", () => {
  const PROMPT_OPTIONS = {
    name: "streamline",
    arguments: {
      target: "verbose documentation",
    },
  } as const;

  beforeEach(async () => (client = await createTestClient(server)));

  it("is registered", async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "streamline" }));
  });

  it("includes the target in the message", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("verbose documentation");
  });

  it("includes streamlining instructions", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("identify and remove redundant");
    expect(result.messages[0].content.text).toContain("Eliminating repetitive");
    expect(result.messages[0].content.text).toContain("concise and impactful");
  });
});
