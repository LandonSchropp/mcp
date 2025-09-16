import { server } from "../../src/server.ts";
import { mockStyleGuide } from "../helpers.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach } from "bun:test";
import { dedent } from "ts-dedent";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/headers", () => {
  const PROMPT_OPTIONS = {
    name: "headers",
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

        ## Headers

        For documents in \`~/Notes\`, never add an H1 to a document. The file name will always function as the title. For other documents, H1 headers may be used as appropriate.

        Use H2 (\`##\`) and H3 (\`###\`) for main sections. Keep headings descriptive and action-oriented in title case.

        ## Lists

        Use lists heavily for organization. Choose the appropriate list type based on your content structure and purpose.
      `,
    );

    client = await createTestClient(server);
  });

  it("is registered", async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "headers" }));
  });

  it("includes the file path", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("/tmp/document.md");
  });

  it("includes only the headers section", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain("For documents in `~/Notes`");
    expect(result.messages[0].content.text).toContain("Use H2 (`##`) and H3 (`###`)");
    expect(result.messages[0].content.text).not.toContain("Use lists heavily");
  });

  it("removes the frontmatter from the style guide", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).not.toContain("---");
    expect(result.messages[0].content.text).not.toContain("title: Writing Style Guide");
  });
});
