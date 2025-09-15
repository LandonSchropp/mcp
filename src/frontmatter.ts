import * as YAML from "yaml";
import { z } from "zod";

/**
 * Removes frontmatter from a markdown string.
 *
 * @param markdown The markdown string to remove frontmatter from.
 * @returns The markdown string without the frontmatter.
 */
export function removeFrontmatter(markdown: string): string {
  return markdown.replace(/^---[\s\S]*?---\n+/, "");
}
