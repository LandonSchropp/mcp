import { createTestClient } from "../helpers.ts";
import { describe, it, expect } from "bun:test";

describe("prompts/draft", () => {
  const PROMPT_OPTIONS = {
    name: "draft",
    arguments: {
      target: "an outline for a blog post",
    },
  } as const;

  it("is registered", async () => {
    const client = await createTestClient();
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "draft" }));
  });

  it("includes the target in the message", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("an outline for a blog post");
  });

  it("includes draft development instructions", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Transform the outline");
    expect(result.messages[0].content.text).toContain("Complete paragraphs");
    expect(result.messages[0].content.text).toContain("narrative flow");
  });
});
