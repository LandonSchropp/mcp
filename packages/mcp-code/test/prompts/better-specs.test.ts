import { createTestClient } from "@landonschropp/mcp-shared/test";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, it, expect, beforeEach, spyOn } from "bun:test";

let isRubyProjectSpy: ReturnType<typeof spyOn>;
let client: Awaited<ReturnType<typeof createTestClient>>;

describe("prompts/better-specs", () => {
  const PROMPT_OPTIONS = {
    name: "better-specs",
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
      delete require.cache[require.resolve("../../src/prompts/better-specs.ts")];

      // Create client after mocks are set up
      const { server } = await import("../../src/server.ts");
      client = await createTestClient(server);
    });

    it("is registered", async () => {
      const result = await client.listPrompts();

      expect(result.prompts).toContainEqual(expect.objectContaining({ name: "better-specs" }));
    });

    it("includes the file path and better specs guide", async () => {
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

  describe("when not in a Ruby project", () => {
    let server: McpServer;

    beforeEach(async () => {
      // Mock isRubyProject to return false
      const projectModule = await import("../../src/project.ts");
      isRubyProjectSpy = spyOn(projectModule, "isRubyProject").mockReturnValue(false);

      // Re-import server to pick up the conditional registration
      delete require.cache[require.resolve("../../src/server.ts")];
      delete require.cache[require.resolve("../../src/prompts/better-specs.ts")];

      // Create client after mocks are set up
      server = (await import("../../src/server.ts")).server;
      client = await createTestClient(server);
    });

    it("is not registered", async () => {
      // TODO: I _should_ be able to use listPrompts like I do above. However, there's a but in
      // @modelcontextprotocol/sdk that throws an error when `registerPrompt` has not been called.
      // This is a temporary workaround to ensure the prompt is not registered.
      // https://github.com/modelcontextprotocol/typescript-sdk/issues/929
      expect((server as any)._registeredPrompts["better-specs"]).toBeFalsy();
    });
  });
});
