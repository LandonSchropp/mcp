import { createTestClient } from "./helpers";
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { tmpdir } from "os";
import { join } from "path";
import { dedent } from "ts-dedent";

let FORMAT_PATH = join(tmpdir(), `format-${Date.now()}.md`);
let VOICE_PATH = join(tmpdir(), `voice-${Date.now()}.md`);
let IMPROVEMENT_PATH = join(tmpdir(), `improvement-${Date.now()}.md`);

describe("resources/documentation", () => {
  let client: Awaited<ReturnType<typeof createTestClient>>;

  beforeEach(async () => {
    await Bun.write(
      FORMAT_PATH,
      dedent`
        ---
        title: Format Title
        description: Format description
        ---
        
        Format Content
      `,
    );

    await Bun.write(
      VOICE_PATH,
      dedent`
        ---
        title: Voice Title
        description: Voice description
        ---
        
        Voice Content
      `,
    );

    await Bun.write(
      IMPROVEMENT_PATH,
      dedent`
        ---
        title: Improvement Title
        description: Improvement description
        ---
        
        Improvement Content
      `,
    );

    // Mock the environment module
    mock.module("../src/env.ts", () => ({
      WRITING_FORMAT: FORMAT_PATH,
      WRITING_VOICE: VOICE_PATH,
      WRITING_IMPROVEMENT: IMPROVEMENT_PATH,
    }));

    // Import the server and documents after mocking
    const { server } = await import("../src/server");
    client = await createTestClient(server);
  });

  describe("documentation://writing/format", () => {
    it("registers the resource", async () => {
      const { resources } = await client.listResources();

      expect(resources).toContainEqual({
        name: "documentation",
        title: "Format Title",
        uri: "documentation://writing/format",
        description: "Format description",
      });
    });

    it("responds with the documentation content", async () => {
      const result = await client.readResource({ uri: "documentation://writing/format" });

      expect(result.contents).toHaveLength(1);

      expect(result.contents[0]).toEqual({
        uri: "writing/format",
        text: "Format Content",
      });
    });

    it("strips the frontmatter from the documentation content", async () => {
      const result = await client.readResource({ uri: "documentation://writing/format" });

      expect(result.contents[0].text).not.toContain("---");
    });
  });

  describe("documentation://writing/voice", () => {
    it("registers the resource", async () => {
      const { resources } = await client.listResources();

      expect(resources).toContainEqual({
        name: "documentation",
        title: "Voice Title",
        uri: "documentation://writing/voice",
        description: "Voice description",
      });
    });

    it("responds with the documentation content", async () => {
      const result = await client.readResource({ uri: "documentation://writing/voice" });

      expect(result.contents).toHaveLength(1);

      expect(result.contents[0]).toEqual({
        uri: "writing/voice",
        text: "Voice Content",
      });
    });

    it("strips the frontmatter from the documentation content", async () => {
      const result = await client.readResource({ uri: "documentation://writing/voice" });

      expect(result.contents[0].text).not.toContain("---");
    });
  });

  describe("documentation://writing/improvement", () => {
    it("registers the resource", async () => {
      const { resources } = await client.listResources();

      expect(resources).toContainEqual({
        name: "documentation",
        title: "Improvement Title",
        uri: "documentation://writing/improvement",
        description: "Improvement description",
      });
    });

    it("responds with the documentation content", async () => {
      const result = await client.readResource({ uri: "documentation://writing/improvement" });

      expect(result.contents).toHaveLength(1);

      expect(result.contents[0]).toEqual({
        uri: "writing/improvement",
        text: "Improvement Content",
      });
    });

    it("strips the frontmatter from the documentation content", async () => {
      const result = await client.readResource({ uri: "documentation://writing/improvement" });

      expect(result.contents[0].text).not.toContain("---");
    });
  });

  describe("documentation://<path>", () => {
    it("registers the resources in the docs directory", async () => {
      const { resources } = await client.listResources();

      expect(resources).toContainEqual({
        name: "documentation",
        title: "Better Tests",
        uri: "documentation://code/better-tests",
        description:
          "Testing best practices for TypeScript/JavaScript frameworks like Jest, Vitest, and Bun",
      });
    });

    it("responds with the documentation content", async () => {
      const result = await client.readResource({ uri: "documentation://code/better-tests" });

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe("code/better-tests");
      expect(result.contents[0].text).toContain("Use `it` instead of `test`");
    });

    it("strips the frontmatter from the documentation content", async () => {
      const result = await client.readResource({ uri: "documentation://code/better-tests" });

      expect(result.contents[0].text).not.toContain("---");
      expect(result.contents[0].text).not.toContain("title: Better Tests");
    });
  });
});
