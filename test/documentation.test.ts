import { createTestClient } from "./helpers";
import { tmpdir } from "os";
import { join } from "path";
import { dedent } from "ts-dedent";
import { describe, it, expect, vi, beforeEach } from "vitest";

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
      PLANS_DIRECTORY: "/tmp/plans",
      WRITING_FORMAT: FORMAT_PATH,
      WRITING_VOICE: VOICE_PATH,
      WRITING_IMPROVEMENT: IMPROVEMENT_PATH,
    }));

    // Import the server and documents after mocking
    const { server } = await import("../src/server");
    client = await createTestClient(server);
  });

  describe("doc://writing/format", () => {
    it("registers the resource", async () => {
      const { resources } = await client.listResources();

      expect(resources).toContainEqual({
        name: "writing/format",
        title: "Format Title",
        uri: "doc://writing/format",
        description: "Format description",
        mimeType: "text/markdown",
      });
    });

    it("responds with the documentation content", async () => {
      const result = await client.readResource({ uri: "doc://writing/format" });

      expect(result.contents).toHaveLength(1);

      expect(result.contents[0]).toEqual({
        uri: "doc://writing/format",
        text: "Format Content",
      });
    });

    it("strips the frontmatter from the documentation content", async () => {
      const result = await client.readResource({ uri: "doc://writing/format" });

      expect(result.contents[0].text).not.toContain("---");
    });
  });

  describe("doc://writing/voice", () => {
    it("registers the resource", async () => {
      const { resources } = await client.listResources();

      expect(resources).toContainEqual({
        name: "writing/voice",
        title: "Voice Title",
        uri: "doc://writing/voice",
        description: "Voice description",
        mimeType: "text/markdown",
      });
    });

    it("responds with the documentation content", async () => {
      const result = await client.readResource({ uri: "doc://writing/voice" });

      expect(result.contents).toHaveLength(1);

      expect(result.contents[0]).toEqual({
        uri: "doc://writing/voice",
        text: "Voice Content",
      });
    });

    it("strips the frontmatter from the documentation content", async () => {
      const result = await client.readResource({ uri: "doc://writing/voice" });

      expect(result.contents[0].text).not.toContain("---");
    });
  });

  describe("doc://writing/improvement", () => {
    it("registers the resource", async () => {
      const { resources } = await client.listResources();

      expect(resources).toContainEqual({
        name: "writing/improvement",
        title: "Improvement Title",
        uri: "doc://writing/improvement",
        description: "Improvement description",
        mimeType: "text/markdown",
      });
    });

    it("responds with the documentation content", async () => {
      const result = await client.readResource({ uri: "doc://writing/improvement" });

      expect(result.contents).toHaveLength(1);

      expect(result.contents[0]).toEqual({
        uri: "doc://writing/improvement",
        text: "Improvement Content",
      });
    });

    it("strips the frontmatter from the documentation content", async () => {
      const result = await client.readResource({ uri: "doc://writing/improvement" });

      expect(result.contents[0].text).not.toContain("---");
    });
  });

  describe("doc://{path}", () => {
    it("registers the resources in the documentation directory", async () => {
      const { resources } = await client.listResources();

      expect(resources).toContainEqual({
        name: "testing/better-tests",
        title: "Better Tests",
        uri: "doc://testing/better-tests",
        description:
          "Testing best practices for TypeScript/JavaScript frameworks like Jest, Vitest, and Bun",
        mimeType: "text/markdown",
      });
    });

    it("responds with the documentation content", async () => {
      const result = await client.readResource({ uri: "doc://testing/better-tests" });

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe("doc://testing/better-tests");
      expect(result.contents[0].text).toContain("Use `it` instead of `test`");
    });

    it("strips the frontmatter from the documentation content", async () => {
      const result = await client.readResource({ uri: "doc://testing/better-tests" });

      expect(result.contents[0].text).not.toContain("---");
      expect(result.contents[0].text).not.toContain("title: Better Tests");
    });
  });
});
