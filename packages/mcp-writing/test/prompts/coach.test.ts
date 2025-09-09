import { server } from "../../src/server.ts";
import { mockStyleGuide } from "../helpers.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach } from "bun:test";
import { dedent } from "ts-dedent";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/coach", () => {
  const PROMPT_OPTIONS = {
    name: "coach",
    arguments: {
      target: "a blog post draft",
    },
  } as const;

  beforeEach(async () => {
    await mockStyleGuide(
      "IMPROVEMENT_STYLE_GUIDE",
      dedent`
        ---
        title: Writing Improvements
        ---

        Common Writing Improvement Areas
      `,
    );

    client = await createTestClient(server);
  });

  it("is registered", async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "coach" }));
  });

  it("includes the target in the message", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("a blog post draft");
  });

  it("includes coaching instructions", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("transform competent writing into memorable");
    expect(result.messages[0].content.text).toContain("Call out specific passages");
    expect(result.messages[0].content.text).toContain("actionable feedback");
  });

  it("includes the improvement style guide", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Common Writing Improvement Areas");
  });

  it("removes the frontmatter from the style guide", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).not.toContain("---");
    expect(result.messages[0].content.text).not.toContain("title: Writing Improvements");
  });
});
