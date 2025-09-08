import { createTestClient, mockStyleGuide } from "../helpers.ts";
import { describe, it, expect, beforeEach } from "bun:test";
import { dedent } from "ts-dedent";

describe("prompts/unscramble", () => {
  const PROMPT_OPTIONS = {
    name: "unscramble",
    arguments: {
      target: "a disorganized blog post",
    },
  } as const;

  beforeEach(async () => {
    return await mockStyleGuide(
      "FORMAT_STYLE_GUIDE",
      dedent`
        ---
        title: Structure Guide
        ---

        Structure and Formatting Guidelines
      `,
    );
  });

  it("is registered", async () => {
    const client = await createTestClient();
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "unscramble" }));
  });

  it("includes the target in the message", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("a disorganized blog post");
  });

  it("includes reorganization instructions", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Reorganize and clarify");
    expect(result.messages[0].content.text).toContain("fragmented/stream-of-consciousness");
    expect(result.messages[0].content.text).toContain("Connect incomplete thoughts");
  });

  it("includes the format style guide", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Structure and Formatting Guidelines");
  });

  it("removes the frontmatter from the style guide", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).not.toContain("---");
    expect(result.messages[0].content.text).not.toContain("title: Structure Guide");
  });
});
