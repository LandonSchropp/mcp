import { WRITING_FORMAT, WRITING_VOICE, WRITING_IMPROVEMENT } from "../../env.js";
import { parseFrontmatter, removeFrontmatter } from "../../templates/frontmatter.js";
import { relativePathWithoutExtension } from "../../utilities/path.js";
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
export async function fetchDocumentationResources(): Promise<Resource[]> {
  // Find all markdown files in the documentation directory (excluding .liquid files)
  let documents = await Array.fromAsync(glob(join(import.meta.dirname, "**/*.md")));

  // Map the document files to Resource objects
  return await Promise.all([
    ...documents.map((path) => {
      return buildResourceSchema(relativePathWithoutExtension(import.meta.dirname, path), path);
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
export async function readDocumentation(uriPath: string): Promise<string> {
  let filePath = WRITING_DOCUMENTS[uriPath] ?? join(import.meta.dirname, `${uriPath}.md`);
  return removeFrontmatter(await readFile(filePath, "utf8"));
}

/**
 * Reads a documentation resource and returns its contents.
 *
 * @param resource The Resource object representing the documentation file
 * @returns The contents of the documentation file
 */
export async function readDocumentationResource(resource: Resource): Promise<TextResourceContents> {
  let path = resource.uri.replace("doc://", "");

  return {
    uri: resource.uri,
    text: await readDocumentation(path),
  };
}
