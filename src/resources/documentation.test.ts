import { createTestClient } from "../../test/helpers.js";
import { server } from "../server.js";
import { Client } from "@modelcontextprotocol/sdk/client";
import { writeFile } from "fs/promises";
import { dedent } from "ts-dedent";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { FORMAT_PATH, VOICE_PATH, IMPROVEMENT_PATH } = await vi.hoisted(async () => {
  const { tmpdir } = await import("os");
  const { join } = await import("path");

  return {
    FORMAT_PATH: join(tmpdir(), `format-${Date.now()}.md`),
    VOICE_PATH: join(tmpdir(), `voice-${Date.now()}.md`),
    IMPROVEMENT_PATH: join(tmpdir(), `improvement-${Date.now()}.md`),
  };
});

vi.mock("../env.ts", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    WRITING_FORMAT: FORMAT_PATH,
    WRITING_VOICE: VOICE_PATH,
    WRITING_IMPROVEMENT: IMPROVEMENT_PATH,
  };
});

describe("resources/documentation", () => {
  let client: Client;

  beforeEach(async () => {
    await writeFile(
      FORMAT_PATH,
      dedent`
        ---
        title: Format Title
        description: Format description
        ---
        
        Format Content
      `,
    );

    await writeFile(
      VOICE_PATH,
      dedent`
        ---
        title: Voice Title
        description: Voice description
        ---
        
        Voice Content
      `,
    );

    await writeFile(
      IMPROVEMENT_PATH,
      dedent`
        ---
        title: Improvement Title
        description: Improvement description
        ---
        
        Improvement Content
      `,
    );

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
    describe("registration", () => {
      it("includes all documents", async () => {
        const { resources } = await client.listResources();

        expect(resources).toContainEqual({
          name: "writing/format",
          title: "Format Title",
          uri: "doc://writing/format",
          description: "Format description",
          mimeType: "text/markdown",
        });

        expect(resources).toContainEqual({
          name: "spec/better-specs",
          title: "Better Specs",
          uri: "doc://spec/better-specs",
          description: "Testing best practices for RSpec, adapted from betterspecs.org",
          mimeType: "text/markdown",
        });
      });
    });

    it("responds with the documentation content", async () => {
      const result = await client.readResource({ uri: "doc://test/better-tests" });

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].uri).toBe("doc://test/better-tests");
      expect(result.contents[0].text).toContain("Keep Descriptions Short");
    });

    it("strips the frontmatter from the documentation content", async () => {
      const result = await client.readResource({ uri: "doc://test/better-tests" });

      expect(result.contents[0].text).not.toContain("---");
      expect(result.contents[0].text).not.toContain("title: Better Tests");
    });
  });

  describe("doc://test", () => {
    it("returns all test documentation files", async () => {
      const result = await client.readResource({ uri: "doc://test" });

      expect(result.contents).toHaveLength(2);

      const uris = result.contents.map((content) => content.uri);

      expect(uris).toContain("doc://test/better-tests");
      expect(uris).toContain("doc://test/preferences");
    });

    it("strips frontmatter from all documents", async () => {
      const result = await client.readResource({ uri: "doc://test" });

      for (const content of result.contents) {
        expect(content.text).not.toContain("---");
      }
    });
  });

  describe("doc://spec", () => {
    it("returns all spec documentation files", async () => {
      const result = await client.readResource({ uri: "doc://spec" });

      expect(result.contents).toHaveLength(2);

      const uris = result.contents.map((content) => content.uri);

      expect(uris).toContain("doc://spec/better-specs");
      expect(uris).toContain("doc://spec/preferences");
    });
  });

  describe("doc://writing", () => {
    it("returns all writing documentation files", async () => {
      const result = await client.readResource({ uri: "doc://writing" });

      expect(result.contents).toHaveLength(3);

      const uris = result.contents.map((content) => content.uri);

      expect(uris).toContain("doc://writing/format");
      expect(uris).toContain("doc://writing/voice");
      expect(uris).toContain("doc://writing/improvement");
    });
  });
});
