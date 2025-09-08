import { createTestClient } from "@landonschropp/mcp-shared/test";
import { mockStyleGuide } from "../helpers.ts";
import { server } from "../../src/server.ts";
import { describe, it, expect, beforeEach } from "bun:test";
import { dedent } from "ts-dedent";

describe("prompts/lists", () => {
  const PROMPT_OPTIONS = {
    name: "lists",
    arguments: {
      target: "/tmp/document.md",
    },
  } as const;

  beforeEach(async () => {
    return await mockStyleGuide(
      "FORMAT_STYLE_GUIDE",
      dedent`
        ---
        title: Writing Style Guide
        ---

        ## Headers

        For documents in \`~/Notes\`, never add an H1 to a document. The file name will always function as the title. For other documents, H1 headers may be used as appropriate.

        ## Lists

        Use lists heavily for organization. Choose the appropriate list type based on your content structure and purpose.

        Use nested lists sparingly. Don't be afraid of multi-paragraph list items when appropriate.

        ### Bulleted Term List

        Use hyphens with a bold term and colon at the beginning for definitions and key concepts.
      `,
    );
  });

  it("is registered", async () => {
    const client = await createTestClient(server);
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "lists" }));
  });

  it("includes the file path", async () => {
    const client = await createTestClient(server);
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("/tmp/document.md");
  });

  it("includes only the lists section", async () => {
    const client = await createTestClient(server);
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("Use lists heavily for organization");
    expect(result.messages[0].content.text).toContain("Bulleted Term List");
    expect(result.messages[0].content.text).not.toContain("For documents in `~/Notes`");
  });

  it("removes the frontmatter from the style guide", async () => {
    const client = await createTestClient(server);
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).not.toContain("---");
    expect(result.messages[0].content.text).not.toContain("title: Writing Style Guide");
  });
});
