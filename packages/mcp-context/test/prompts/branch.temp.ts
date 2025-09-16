import { server } from "../../src/server.ts";
import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach } from "bun:test";

let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/branch", () => {
  const PROMPT_OPTIONS = {
    name: "branch",
    arguments: {
      branch: "feature/new-feature",
    },
  } as const;

  beforeEach(async () => (client = await createTestClient(server)));

  it("is registered", async () => {
    const result = await client.listPrompts();

    expect(result.prompts).toContainEqual(expect.objectContaining({ name: "branch" }));
  });

  it("includes the branch name in the message", async () => {
    const result = await client.getPrompt(PROMPT_OPTIONS);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content.text).toContain(
      "Fetch the context://branch/feature/new-feature resource",
    );
  });
});
