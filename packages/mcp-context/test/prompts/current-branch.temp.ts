import { server } from "../../src/server.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach } from "vitest";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/current-branch", () => {
  const PROMPT_OPTIONS = {
    name: "current-branch",
    arguments: {},
  } as const;

  beforeEach(async () => (client = await createTestClient(server)));

  it("is registered", async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "current-branch" }));
  });

  it("returns a message requesting current branch information", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain("Fetch the context://branch resource");
  });
});
