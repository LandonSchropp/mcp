import { createTestClient } from "@landonschropp/mcp-shared/test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, it, expect, beforeEach, spyOn } from "bun:test";

let isJavaScriptProjectSpy: ReturnType<typeof spyOn>;
let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/better-tests", () => {
  const PROMPT_OPTIONS = {
    name: "better-tests",
    arguments: {
      target: "test/user.test.ts",
    },
  } as const;

  describe("when in a JavaScript project", () => {
    beforeEach(async () => {
      // Mock isJavaScriptProject to return true
      const projectModule = await import("../../src/project.ts");
      isJavaScriptProjectSpy = spyOn(projectModule, "isJavaScriptProject").mockReturnValue(true);

      // Re-import server to pick up the conditional registration
      delete require.cache[require.resolve("../../src/server.ts")];
      delete require.cache[require.resolve("../../src/prompts/better-tests.ts")];

      // Create client after mocks are set up
      const { server } = await import("../../src/server.ts");
      client = await createTestClient(server);
    });

    it("is registered", async () => {
      const result = await client.listPrompts();

      expect(result.prompts).toContainEqual(expect.objectContaining({ name: "better-tests" }));
    });

    it("includes the file path and better tests guide", async () => {
      const result = await client.getPrompt(PROMPT_OPTIONS);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content.text).toContain("test/user.test.ts");
    });

    it("includes the better tests conventions", async () => {
      const result = await client.getPrompt(PROMPT_OPTIONS);

      expect(result.messages[0].content.text).toContain(
        "Use `it` instead of `test` for individual test cases",
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

  describe("when not in a JavaScript project", () => {
    let server: McpServer;

    beforeEach(async () => {
      // Mock isJavaScriptProject to return false
      const projectModule = await import("../../src/project.ts");
      isJavaScriptProjectSpy = spyOn(projectModule, "isJavaScriptProject").mockReturnValue(false);

      // Re-import server to pick up the conditional registration
      delete require.cache[require.resolve("../../src/server.ts")];
      delete require.cache[require.resolve("../../src/prompts/better-tests.ts")];

      // Create client after mocks are set up
      server = (await import("../../src/server.ts")).server;
      client = await createTestClient(server);
    });

    it("is not registered", async () => {
      // TODO: I _should_ be able to use listPrompts like I do above. However, there's a but in
      // @modelcontextprotocol/sdk that throws an error when `registerPrompt` has not been called.
      // This is a temporary workaround to ensure the prompt is not registered.
      // https://github.com/modelcontextprotocol/typescript-sdk/issues/929
      expect((server as any)._registeredPrompts["better-tests"]).toBeFalsy();
    });
  });
});
