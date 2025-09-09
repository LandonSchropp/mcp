import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach } from "bun:test";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/specs", () => {
  const PROMPT_OPTIONS = {
    name: "specs",
    arguments: {
      target: "spec/user_spec.rb",
    },
  } as const;

  beforeEach(async () => {
    // Create client
    const { server } = await import("../../src/server.ts");
    client = await createTestClient(server);
  });

  it("is registered", async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "specs" }));
  });

  it("includes the target and better specs guide", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("spec/user_spec.rb");
  });

  it("includes the better specs conventions", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).toContain(
      "Use `.` for class methods and `#` for instance methods",
    );
    expect(result.messages[0].content.text).toContain("Use contexts");
    expect(result.messages[0].content.text).toContain("Always use the `expect` syntax");
  });

  it("removes the frontmatter from the specs guide", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages[0].content.text).not.toContain("---");
    expect(result.messages[0].content.text).not.toContain("title: Better Specs");
  });
});
