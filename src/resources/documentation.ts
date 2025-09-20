import { DOCUMENTS_DIRECTORY } from "../constants";
import { WRITING_FORMAT, WRITING_VOICE, WRITING_IMPROVEMENT } from "../env";
import { server } from "../server";
import { parseFrontmatter, removeFrontmatter } from "../templates/frontmatter";
import { first } from "../utilities/array";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Resource } from "@modelcontextprotocol/sdk/types.js";
import { glob, readFile } from "fs/promises";
import { join, relative } from "path";
import z from "zod";

// A schema for validating document frontmatter
const DOCUMENT_SCHEMA = z.object({ title: z.string(), description: z.string() });

// The paths of the writing documents that are defined by environment variables
const WRITING_DOCUMENTS: Record<string, string> = {
  "writing/format": WRITING_FORMAT,
  "writing/voice": WRITING_VOICE,
  "writing/improvement": WRITING_IMPROVEMENT,
};

/**
 * @param path The file path of the document to determine the URI for
 * @returns The URI path for the document
 */
function documentUriFromPath(path: string): string {
  return relative(DOCUMENTS_DIRECTORY, path).replace(/\..*$/, "");
}

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
  let documents = await Array.fromAsync(glob(join(DOCUMENTS_DIRECTORY, "**/*.md")));

  return await Promise.all([
    ...documents.map((path) => {
      return buildResourceSchema(documentUriFromPath(path), path);
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

server.registerResource(
  "documentation",
  new ResourceTemplate(`doc://{+path}`, {
    list: async () => ({ resources: await fetchDocumentationResources() }),
  }),
  {
    title: "Documentation",
    description: "A collection of documentation files",
  },
  async (uri, { path }) => ({
    contents: [
      {
        uri: uri.href,
        text: await readDocumentation(first(path)),
      },
    ],
  }),
);
