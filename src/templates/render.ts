import { PROMPTS_DIRECTORY } from "../constants";
import { relativePathWithoutExtension } from "../utilities/path";
import { removeFrontmatter } from "./frontmatter";
import { replacePlaceholders } from "./placeholders";
import { glob } from "fs/promises";
import { readFile } from "fs/promises";
import Handlebars from "handlebars";
import { join } from "path";

// Register the partials
for await (let path of glob(join(PROMPTS_DIRECTORY, "**/_*.md"))) {
  let name = relativePathWithoutExtension(PROMPTS_DIRECTORY, path);
  let partial = removeFrontmatter(await readFile(path, "utf8"));

  Handlebars.registerPartial(name, partial);
}

/**
 * Renders a Handlebars-style template. This function only supports a simple subset of the
 * Handlebars syntax.
 *
 * @param template The template string containing {{placeholders}}
 * @param context An object containing values for the placeholders
 * @returns The rendered template with placeholders replaced
 */
export function renderTemplate(template: string, context: Record<string, string>): string {
  // TODO: I may want to consider caching templates if performance becomes an issue.
  let compiled = Handlebars.compile(template, { strict: true, noEscape: true });
  return compiled(context);
}
