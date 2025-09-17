import { WRITING_FORMAT, WRITING_VOICE, WRITING_IMPROVEMENT } from "../env.ts";
import { removeFrontmatter } from "../frontmatter.ts";
import { extractSectionById } from "../markdown.ts";
import { handlebars } from "./index.ts";
import { readFileSync } from "fs";
import { join } from "path";

// TODO: Should these be resources instead? I could always make a resource helper for embedding
// resources (or resource paths when appropriate). That might make more sense, especially with other
// types of content such as documentation.
const WRITING_PATHS: Record<string, string> = {
  "writing/format": WRITING_FORMAT,
  "writing/voice": WRITING_VOICE,
  "writing/improvement": WRITING_IMPROVEMENT,
};

handlebars.registerHelper("documentation", function (path: string, options: { section?: string }) {
  // If the path is a writing path, use the corresponding environment variable.
  path = WRITING_PATHS[path] ?? join(import.meta.dir, "../../docs", `${path}.md`);

  let content: string;

  try {
    content = readFileSync(path, "utf8");
  } catch (error) {
    throw new Error(`Failed to read file at '${path}'`);
  }

  // Remove frontmatter
  content = removeFrontmatter(content);

  // If the section is not specified return the content
  if (!options.section) {
    return new handlebars.SafeString(content);
  }

  // Extract section if specified
  const sectionContent = extractSectionById(content, options.section);

  if (!sectionContent) {
    throw new Error(`Section '${options.section}' not found in file at '${path}'`);
  }

  // If the section is empty, return an empty string
  return new handlebars.SafeString(sectionContent);
});
