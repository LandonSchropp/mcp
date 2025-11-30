import { DOCUMENTS_DIRECTORY } from "../constants.js";
import { WRITING_FORMAT, WRITING_VOICE, WRITING_IMPROVEMENT } from "../env.js";
import { server } from "../server-instance.js";
import { parseFrontmatter, removeFrontmatter } from "../templates/frontmatter.js";
import { first } from "../utilities/array.js";
import { relativePathWithoutExtension } from "../utilities/path.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Resource, TextResourceContents } from "@modelcontextprotocol/sdk/types.js";
import { glob, readFile } from "fs/promises";
import { join } from "path";
import z from "zod";

// A schema for validating document frontmatter
const DOCUMENT_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
});

// The paths of the writing documents that are defined by environment variables
const WRITING_DOCUMENTS: Record<string, string> = {
  "writing/format": WRITING_FORMAT,
  "writing/voice": WRITING_VOICE,
  "writing/improvement": WRITING_IMPROVEMENT,
};

/**
 * Generates a Resource for a documentation file.
 *
 * @param uri The URI path to register the resource under
 * @param path The file path of the document to generate the resource for
 */
async function buildResourceSchema(uri: string, path: string): Promise<Resource> {
  let { frontmatter } = parseFrontmatter(await readFile(path, "utf8"), DOCUMENT_SCHEMA);

  return {
    name: uri,
    title: frontmatter.title,
    uri: `doc://${uri}`,
    description: frontmatter.description,
    mimeType: "text/markdown",
  };
}

/** @returns An array of Resource objects representing the documentation files */
async function fetchDocumentationResources(): Promise<Resource[]> {
  // Find all markdown files in the documentation directory (excluding .liquid files)
  let documents = await Array.fromAsync(glob(join(DOCUMENTS_DIRECTORY, "**/*.md")));

  // Map the document files to Resource objects
  return await Promise.all([
    ...documents.map((path) => {
      return buildResourceSchema(relativePathWithoutExtension(DOCUMENTS_DIRECTORY, path), path);
    }),
    ...Object.entries(WRITING_DOCUMENTS).map(([uri, path]) => {
      return buildResourceSchema(uri, path);
    }),
  ]);
}

/**
 * Reads the documentation file for the given URI.
 *
 * @param uriPath The URI path of the document to read
 * @returns The contents of the document
 */
async function readDocumentation(uriPath: string): Promise<string> {
  let filePath = WRITING_DOCUMENTS[uriPath] ?? join(DOCUMENTS_DIRECTORY, `${uriPath}.md`);
  return removeFrontmatter(await readFile(filePath, "utf8"));
}

async function readDocumentationResource(resource: Resource): Promise<TextResourceContents> {
  let path = resource.uri.replace("doc://", "");

  return {
    uri: resource.uri,
    text: await readDocumentation(path),
  };
}

// Include all of the documentation files as resources in the MCP server.
server.registerResource(
  "documentation",
  new ResourceTemplate(`doc://{+path}`, {
    list: async () => ({ resources: await fetchDocumentationResources() }),
  }),
  {
    title: "Documentation",
    description: "A collection of documentation files",
  },
  async (uri, { path }) => {
    return {
      contents: [
        {
          uri: uri.href,
          text: await readDocumentation(first(path)),
        },
      ],
    };
  },
);

const INDEX_RESOURCE_DEFINITIONS = [
  {
    name: "test",
    title: "Test Guidelines",
    description: "Guidelines for writing tests, combining Better Tests with my preferences",
    uri: "doc://test",
  },
  {
    name: "spec",
    title: "Spec Guidelines",
    description: "Guidelines for writing specs, combining Better Specs with my preferences",
    uri: "doc://spec",
  },
  {
    name: "writing",
    title: "Writing Guidelines",
    description: "Guidelines for writing, including format, voice, and improvement tips",
    uri: "doc://writing",
  },
] as const;

// Register "index" resources for specific documentation files
for (let { name, title, description, uri } of INDEX_RESOURCE_DEFINITIONS) {
  server.registerResource(name, uri, { title, description }, async () => {
    return {
      contents: await Promise.all(
        (await fetchDocumentationResources())
          .filter((resource) => resource.uri.startsWith(uri))
          .map(readDocumentationResource),
      ),
    };
  });
}
