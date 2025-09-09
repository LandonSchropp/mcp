import { createTestClient } from "@landonschropp/mcp-shared/test";
import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";

let isJavaScriptProjectSpy: ReturnType<typeof spyOn>;
let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/add-tests", () => {
  const PROMPT_OPTIONS = {
    name: "add-tests",
    arguments: {
      target: "test/user_test.js",
    },
  } as const;

  describe("when in a JavaScript project", () => {
    beforeEach(async () => {
      // Mock isJavaScriptProject to return true
      const projectModule = await import("../../src/project.ts");
      isJavaScriptProjectSpy = spyOn(projectModule, "isJavaScriptProject").mockReturnValue(true);

      // Re-import server to pick up the conditional registration
      delete require.cache[require.resolve("../../src/server.ts")];
      delete require.cache[require.resolve("../../src/prompts/add-tests.ts")];

      // Create client after mocks are set up
      const { server } = await import("../../src/server.ts");
      client = await createTestClient(server);
    });

    it("is registered", async () => {
      const result = await client.listPrompts();

      expect(result.prompts).toContainEqual(expect.objectContaining({ name: "add-tests" }));
    });

    it("includes the target and better tests guide", async () => {
      const result = await client.getPrompt(PROMPT_OPTIONS);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content.text).toContain("test/user_test.js");
    });

    it("includes the better tests conventions", async () => {
      const result = await client.getPrompt(PROMPT_OPTIONS);

      expect(result.messages[0].content.text).toContain(
        "When testing classes, use `.` for static methods and `#` for instance methods",
      );
      expect(result.messages[0].content.text).toContain("Use contexts to organize related tests");
      expect(result.messages[0].content.text).toContain("Always use the `expect` syntax");
    });

    it("removes the frontmatter from the tests guide", async () => {
      const result = await client.getPrompt(PROMPT_OPTIONS);

      expect(result.messages[0].content.text).not.toContain("---");
      expect(result.messages[0].content.text).not.toContain("title: Better Tests");
    });
  });
});
