import { createTestClient, mockStyleGuide } from "../helpers.ts";
import { describe, it, expect, beforeEach } from "bun:test";
import { dedent } from "ts-dedent";

describe("prompts/voice", () => {
  const PROMPT_OPTIONS = {
    name: "voice",
    arguments: {
      target: "/tmp/document.md",
    },
  } as const;

  beforeEach(async () => {
    return await mockStyleGuide(
      "VOICE_STYLE_GUIDE",
      dedent`
        ---
        title: Voice Guidelines
        ---

        Voice and Tone Guidelines
      `,
    );
  });

  it("is registered", async () => {
    const client = await createTestClient();
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "voice" }));
  });

  it("includes the file path and style guide", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("/tmp/document.md");
  });

  it("includes the style guide", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Voice and Tone Guidelines");
  });

  it("removes the frontmatter from the style guide", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).not.toContain("---");
    expect(result.messages[0].content.text).not.toContain("title: Voice Guidelines");
  });
});
