import * as YAML from "yaml";
import { z } from "zod";

const FRONTMATTER_REGEX = /^---([\s\S]*?)---\n+/;

/**
 * Removes frontmatter from a markdown string.
 *
 * @param markdown The markdown string to remove frontmatter from.
 * @returns The markdown string without the frontmatter.
 */
export function removeFrontmatter(markdown: string): string {
  return markdown.replace(FRONTMATTER_REGEX, "");
}

/**
 * Parses frontmatter from a markdown string and validates it against a schema.
 *
 * @param markdown The markdown string to parse frontmatter from.
 * @param schema The Zod schema to validate the frontmatter against.
 * @returns An object containing the parsed frontmatter and the content without frontmatter.
 * @throws Error if frontmatter is invalid or doesn't match the schema.
 */
export function parseFrontmatter<S extends z.ZodSchema>(
  markdown: string,
  schema: S,
): { frontmatter: z.infer<S>; content: string } {
  // Attempt to match frontmatter at the start of the file
  const match = markdown.match(FRONTMATTER_REGEX);

  if (!match) {
    throw new Error("No frontmatter found in markdown");
  }

  // Extract the frontmatter and content
  const frontmatterText = match[1];
  const content = markdown.slice(match[0].length).trim();

  let data: unknown;

  // Parse the frontmatter as YAML
  try {
    data = YAML.parse(frontmatterText);
  } catch (error) {
    throw new Error(`Invalid YAML in frontmatter: ${error}`);
  }

  // Validate the parsed frontmatter against the provided schema
  const validation = schema.safeParse(data);

  if (!validation.success) {
    throw new Error(`Frontmatter validation failed: ${validation.error.message}`);
  }

  // Return the validated frontmatter and the content without frontmatter
  return {
    frontmatter: validation.data,
    content,
  };
}
