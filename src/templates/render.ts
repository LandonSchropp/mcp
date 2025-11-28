import { DOCUMENTS_DIRECTORY, PROMPTS_DIRECTORY } from "../constants.js";
import { relativePathWithoutExtension } from "../utilities/path.js";
import { removeFrontmatter } from "./frontmatter.js";
import { glob } from "fs/promises";
import { readFile } from "fs/promises";
import Handlebars from "handlebars";
import { join } from "path";

// The partials and their content that are read into Handlebars. There's no good way to access this
// information from Handlebars directly, so we have to store it separately instead.
const PARTIALS: Record<string, string> = {};

async function registerPartial(name: string, path: string): Promise<void> {
  let partial = removeFrontmatter(await readFile(path, "utf8"));

  PARTIALS[name] = partial;
  Handlebars.registerPartial(name, partial);
}

// Register all prompts as partials.
for await (let path of glob(join(PROMPTS_DIRECTORY, "**/*.md"))) {
  let name = relativePathWithoutExtension(PROMPTS_DIRECTORY, path);
  registerPartial(name, path);
}

// Register an equality helper.
Handlebars.registerHelper("eq", Object.is);

// Register all documentation as partials.
for await (let path of glob(join(DOCUMENTS_DIRECTORY, "**/*.md"))) {
  let name = `doc/${relativePathWithoutExtension(DOCUMENTS_DIRECTORY, path)}`;
  registerPartial(name, path);
}

/**
 * Renders a Handlebars-style template. This function only supports a simple subset of the
 * Handlebars syntax.
 *
 * @param template The template string containing {{placeholders}}
 * @param context An object containing values for the placeholders
 * @returns The rendered template with placeholders replaced
 */
export function renderTemplate(
  template: string,
  context: Record<string, string | undefined> = {},
): string {
  // TODO: I may want to consider caching templates if performance becomes an issue.
  let compiled = Handlebars.compile(template, { strict: true, noEscape: true });
  return compiled(context);
}

/**
 * Reads the content of a registered Handlebars partial.
 *
 * @param name The name of the partial to read
 * @returns The content of the partial as a string
 * @throws If the partial is not found
 */
export function readPartialContent(name: string): string {
  if (!(name in PARTIALS)) {
    throw new Error(`Partial ${name} was not found.`);
  }

  return PARTIALS[name];
}
