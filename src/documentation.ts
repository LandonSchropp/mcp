import { WRITING_FORMAT, WRITING_VOICE, WRITING_IMPROVEMENT } from "./env";
import { parseFrontmatter } from "./frontmatter.ts";
import { server } from "./server";
import { glob } from "fs/promises";
import { readFile } from "fs/promises";
import { join, relative } from "path";
import z from "zod";

// A schema for validating document frontmatter
const DOCUMENT_SCHEMA = z.object({ title: z.string(), description: z.string() });

// Fetch the regular documents from the documentation directory
const DOCUMENTS_DIRECTORY = join(import.meta.dir, "../documentation");
const DOCUMENT_PATHS = await Array.fromAsync(glob(join(DOCUMENTS_DIRECTORY, "**/*.md")));

/**
 * Generates a _static_ documentation resource for the given path.
 *
 * @param name The name of the resource
 * @param uriPath The URI path to register the resource under
 * @param filePath The path of the document to generate the resource for
 */
async function generateDocumentationResource(uriPath: string, filePath: string): Promise<void> {
  let { content, frontmatter } = parseFrontmatter(
    await readFile(filePath, "utf8"),
    DOCUMENT_SCHEMA,
  );

  server.registerResource("documentation", `documentation://${uriPath}`, frontmatter, async () => ({
    contents: [{ uri: uriPath, text: content }],
  }));
}

// Define the special documents first
await generateDocumentationResource("writing/format", WRITING_FORMAT);
await generateDocumentationResource("writing/voice", WRITING_VOICE);
await generateDocumentationResource("writing/improvement", WRITING_IMPROVEMENT);

// Generate resources for the rest of the documents based upon their paths
for (const filePath of DOCUMENT_PATHS) {
  let uriPath = relative(DOCUMENTS_DIRECTORY, filePath).replace(/\..*$/, "");
  await generateDocumentationResource(uriPath, filePath);
}
