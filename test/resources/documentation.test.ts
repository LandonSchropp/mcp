import { server } from "../../src/server";
import { templateScopeMatchesCurrentProject } from "../../src/templates/scope";
import { createTestClient } from "../helpers";
import { Client } from "@modelcontextprotocol/sdk/client";
import { writeFile } from "fs/promises";
import { dedent } from "ts-dedent";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

const mockTemplateScopeMatchesCurrentProject: Mock<typeof templateScopeMatchesCurrentProject> =
  vi.hoisted(() => vi.fn(async () => true));

const { FORMAT_PATH, VOICE_PATH, IMPROVEMENT_PATH } = await vi.hoisted(async () => {
  const { tmpdir } = await import("os");
  const { join } = await import("path");

  return {
    FORMAT_PATH: join(tmpdir(), `format-${Date.now()}.md`),
    VOICE_PATH: join(tmpdir(), `voice-${Date.now()}.md`),
    IMPROVEMENT_PATH: join(tmpdir(), `improvement-${Date.now()}.md`),
  };
});

vi.mock("../../src/env.ts", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    WRITING_FORMAT: FORMAT_PATH,
    WRITING_VOICE: VOICE_PATH,
    WRITING_IMPROVEMENT: IMPROVEMENT_PATH,
  };
});

vi.mock("../../src/templates/scope", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    templateScopeMatchesCurrentProject: mockTemplateScopeMatchesCurrentProject,
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
      it("includes documents without a scope", async () => {
        const { resources } = await client.listResources();

        // Writing documents don't have scope, so they should always be included
        expect(resources).toContainEqual({
          name: "writing/format",
          title: "Format Title",
          uri: "doc://writing/format",
          description: "Format description",
          mimeType: "text/markdown",
        });
      });

      describe("when the current project includes the document's scope", () => {
        beforeEach(() => {
          mockTemplateScopeMatchesCurrentProject.mockResolvedValue(true);
        });

        it("includes the document", async () => {
          const { resources } = await client.listResources();

          expect(resources).toContainEqual({
            name: "spec/better-specs",
            title: "Better Specs",
            uri: "doc://spec/better-specs",
            description: "A copy of betterspecs.org guidelines adapted for LLM code generation",
            mimeType: "text/markdown",
          });
        });
      });

      describe("when the current project does not include the document's scope", () => {
        beforeEach(() => {
          mockTemplateScopeMatchesCurrentProject.mockResolvedValue(false);
        });

        it("does not include the document", async () => {
          const { resources } = await client.listResources();

          expect(resources).not.toContainEqual(
            expect.objectContaining({
              name: "spec/better-specs",
              uri: "doc://spec/better-specs",
            }),
          );
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

    describe("when the document contains a Handlebars partial", () => {
      it("renders the partials as templates", async () => {
        const result = await client.readResource({ uri: "doc://test/guidelines" });

        expect(result.contents).toHaveLength(1);
        expect(result.contents[0].uri).toBe("doc://test/guidelines");

        // Contains content from the better-tests partial
        expect(result.contents[0].text).toContain("Keep Descriptions Short");
        expect(result.contents[0].text).toContain("Use Contexts");

        // Contains content from the preferences partial
        expect(result.contents[0].text).toContain("Articles and Linking Verbs");
        expect(result.contents[0].text).toContain("Test Data Guidelines");

        // Does not contain the partial syntax
        expect(result.contents[0].text).not.toContain("{{> doc/test/better-tests}}");
        expect(result.contents[0].text).not.toContain("{{> doc/test/preferences}}");
      });
    });
  });
});
