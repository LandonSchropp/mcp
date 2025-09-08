import { createTestClient, mockStyleGuide } from "../helpers.ts";
import { describe, it, expect, beforeEach } from "bun:test";
import { dedent } from "ts-dedent";

describe("prompts/coach", () => {
  const PROMPT_OPTIONS = {
    name: "coach",
    arguments: {
      target: "a blog post draft",
    },
  } as const;

  beforeEach(async () => {
    return await mockStyleGuide(
      "WEAKNESSES_STYLE_GUIDE",
      dedent`
        ---
        title: Writing Weaknesses
        ---

        Common Writing Weaknesses to Address
      `,
    );
  });

  it("is registered", async () => {
    const client = await createTestClient();
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "coach" }));
  });

  it("includes the target in the message", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("a blog post draft");
  });

  it("includes coaching instructions", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("transform competent writing into memorable");
    expect(result.messages[0].content.text).toContain("Call out specific passages");
    expect(result.messages[0].content.text).toContain("actionable feedback");
  });

  it("includes the weaknesses style guide", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Common Writing Weaknesses to Address");
  });

  it("removes the frontmatter from the style guide", async () => {
    const client = await createTestClient();
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).not.toContain("---");
    expect(result.messages[0].content.text).not.toContain("title: Writing Weaknesses");
  });
});
