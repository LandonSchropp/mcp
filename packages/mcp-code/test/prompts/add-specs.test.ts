import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";

let isRubyProjectSpy: ReturnType<typeof spyOn>;
let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/add-specs", () => {
  const PROMPT_OPTIONS = {
    name: "add-specs",
    arguments: {
      target: "spec/user_spec.rb",
    },
  } as const;

  describe("when in a Ruby project", () => {
    beforeEach(async () => {
      // Mock isRubyProject to return true
      const projectModule = await import("../../src/project.ts");
      isRubyProjectSpy = spyOn(projectModule, "isRubyProject").mockReturnValue(true);

      // Re-import server to pick up the conditional registration
      delete require.cache[require.resolve("../../src/server.ts")];
      delete require.cache[require.resolve("../../src/prompts/add-specs.ts")];

      // Create client after mocks are set up
      const { server } = await import("../../src/server.ts");
      client = await createTestClient(server);
    });

    it("is registered", async () => {
      const result = await client.listPrompts();

      expect(result.prompts).toContainEqual(expect.objectContaining({ name: "add-specs" }));
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
});
