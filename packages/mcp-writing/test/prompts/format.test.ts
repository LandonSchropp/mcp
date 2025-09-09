import { server } from "../../src/server.ts";
import { mockStyleGuide } from "../helpers.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach } from "bun:test";
import { dedent } from "ts-dedent";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/format", () => {
  const PROMPT_OPTIONS = {
    name: "format",
    arguments: {
      target: "/tmp/document.md",
    },
  } as const;

  beforeEach(async () => {
    await mockStyleGuide(
      "FORMAT_STYLE_GUIDE",
      dedent`
        ---
        title: Writing Style Guide
        ---

        Formatting Style Guide
      `,
    );

    client = await createTestClient(server);
  });

  it("is registered", async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "format" }));
  });

  it("includes the file path and style guide", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("/tmp/document.md");
    expect(result.messages[0].content.text).toContain("/tmp/document.md");
  });

  it("includes the style guide", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Formatting Style Guide");
  });

  it("removes the frontmatter from the style guide", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).not.toContain("---");
    expect(result.messages[0].content.text).not.toContain("title: Writing Style Guide");
  });
});
