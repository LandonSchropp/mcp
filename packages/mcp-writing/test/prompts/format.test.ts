import { createTestClient, mockStyleGuide } from "../helpers.ts";
import { describe, it, expect, beforeEach } from "bun:test";

describe("prompts/format", () => {
  beforeEach(() => mockStyleGuide("FORMATTING_STYLE_GUIDE", "FORMATTING_STYLE_GUIDE"));

  it("exists", async () => {
    const client = await createTestClient();
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "format" }));
  });

  it("includes file path and style guide", async () => {
    const client = await createTestClient();

    const result = await client.getPrompt({
      name: "format",
      arguments: {
        filePath: "/tmp/document.md",
      },
    });

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("/tmp/document.md");
    expect(result.messages[0].content.text).toContain("/tmp/document.md");
    expect(result.messages[0].content.text).toContain("FORMATTING_STYLE_GUIDE");
  });
});
