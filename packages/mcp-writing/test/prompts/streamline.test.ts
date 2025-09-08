import { createTestClient } from "../helpers.ts";
import { describe, it, expect } from "bun:test";

describe("prompts/streamline", () => {
  const PROMPT_OPTIONS = {
    name: "streamline",
    arguments: {
      target: "verbose documentation",
    },
  } as const;

  it("is registered", async () => {
    const client = await createTestClient();
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "streamline" }));
  });

  it("includes the target in the message", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("verbose documentation");
  });

  it("includes streamlining instructions", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("identify and remove redundant");
    expect(result.messages[0].content.text).toContain("Eliminating repetitive");
    expect(result.messages[0].content.text).toContain("concise and impactful");
  });
});
