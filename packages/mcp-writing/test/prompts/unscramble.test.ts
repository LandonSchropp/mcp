import { server } from "../../src/server.ts";
import { mockStyleGuide } from "../helpers.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach } from "bun:test";
import { dedent } from "ts-dedent";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/unscramble", () => {
  const PROMPT_OPTIONS = {
    name: "unscramble",
    arguments: {
      target: "a disorganized blog post",
    },
  } as const;

  beforeEach(async () => {
    await mockStyleGuide(
      "FORMAT_STYLE_GUIDE",
      dedent`
        ---
        title: Structure Guide
        ---

        Structure and Formatting Guidelines
      `,
    );

    client = await createTestClient(server);
  });

  it("is registered", async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "unscramble" }));
  });

  it("includes the target in the message", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("a disorganized blog post");
  });

  it("includes reorganization instructions", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Reorganize and clarify");
    expect(result.messages[0].content.text).toContain("fragmented/stream-of-consciousness");
    expect(result.messages[0].content.text).toContain("Connect incomplete thoughts");
  });

  it("includes the format style guide", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Structure and Formatting Guidelines");
  });

  it("removes the frontmatter from the style guide", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).not.toContain("---");
    expect(result.messages[0].content.text).not.toContain("title: Structure Guide");
  });
});
