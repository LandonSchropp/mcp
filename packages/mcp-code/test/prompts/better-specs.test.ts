import { server } from "../../src/server.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect } from "bun:test";

describe("prompts/better-specs", () => {
  const PROMPT_OPTIONS = {
    name: "better-specs",
    arguments: {
      target: "spec/user_spec.rb",
    },
  } as const;

  it("is registered", async () => {
    const client = await createTestClient(server);
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "better-specs" }));
  });

  it("includes the file path and better specs guide", async () => {
    const client = await createTestClient(server);
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("spec/user_spec.rb");
  });

  it("includes the better specs conventions", async () => {
    const client = await createTestClient(server);
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain(
      "Use `.` for class methods and `#` for instance methods",
    );
    expect(result.messages[0].content.text).toContain("Use contexts");
    expect(result.messages[0].content.text).toContain("Always use the `expect` syntax");
  });

  it("removes the frontmatter from the specs guide", async () => {
    const client = await createTestClient(server);
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).not.toContain("---");
    expect(result.messages[0].content.text).not.toContain("title: Better Specs");
  });
});
