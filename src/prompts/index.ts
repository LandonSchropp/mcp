import { getCurrentBranch, getDefaultBranch } from "../commands/git.js";
import { server } from "../server-instance.js";
import { parseFrontmatter, removeFrontmatter } from "../templates/frontmatter.js";
import { renderFile } from "../templates/render.js";
import { extractResourceURIs } from "../templates/uri.js";
import { extractVariables } from "../templates/variables.js";
import { relativePathWithoutExtension } from "../utilities/path.js";
import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import { glob, readFile } from "fs/promises";
import { join } from "path";
import z from "zod";

// Schema for validating prompt frontmatter
const PROMPT_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
});

const PARAMETER_DEFINITIONS = {
  currentBranch: {
    description: "The current git branch",
    resolve: getCurrentBranch,
  },
  defaultBranch: {
    description: "The default git branch",
    resolve: getDefaultBranch,
  },
} as const;

// TODO: Remove this once we replace Handlebars. The variable regex picks up Handlebars keywords.
const HANDLEBARS_KEYWORDS = new Set(["if", "else", "each", "unless", "with", "lookup", "log"]);

function isAutoResolvedParameter(name: string): boolean {
  return (
    name in PARAMETER_DEFINITIONS &&
    "resolve" in PARAMETER_DEFINITIONS[name as keyof typeof PARAMETER_DEFINITIONS]
  );
}

function parameterToZodSchema(name: string, promptName: string): z.ZodString {
  const definition = PARAMETER_DEFINITIONS[name as keyof typeof PARAMETER_DEFINITIONS];

  if (!definition) {
    throw new Error(`Unknown parameter "${name}" in prompt "${promptName}"`);
  }

  return z.string().describe(definition.description);
}

// Find all prompt files (excluding files that start with underscore)
let promptFiles = await Array.fromAsync(glob(join(import.meta.dirname, "**/[!_]*.md.liquid")));

for (const filePath of promptFiles) {
  const rawContent = await readFile(filePath, "utf8");
  const { frontmatter } = parseFrontmatter(rawContent, PROMPT_SCHEMA);
  const promptName = relativePathWithoutExtension(import.meta.dirname, filePath);

  // Extract variables, filtering out Handlebars keywords
  const variables = (await extractVariables(filePath)).difference(HANDLEBARS_KEYWORDS);

  // Build args schema dynamically from user-provided variables
  const argsSchema: Record<string, z.ZodString> = Object.fromEntries(
    [...variables]
      .filter((name) => !isAutoResolvedParameter(name))
      .map((name) => [name, parameterToZodSchema(name, promptName)]),
  );

  // Register the prompt
  server.registerPrompt(
    promptName,
    {
      ...frontmatter,
      title: promptName,
      argsSchema,
    },
    async (values) => {
      // Start building the context with user-provided values
      const context: Record<string, string> = { ...values };

      // Add auto-resolved parameters when they are present in the template
      for (const name of variables) {
        const definition = PARAMETER_DEFINITIONS[name as keyof typeof PARAMETER_DEFINITIONS];

        if (definition && "resolve" in definition) {
          context[name] = await definition.resolve();
        }
      }

      // Render the template
      let text = removeFrontmatter(await renderFile(filePath, context));

      // Extract the resource URIs from the rendered content and convert them to resource links
      let resourceLinks: PromptMessage[] = Array.from(extractResourceURIs(text)).map((uri) => ({
        role: "user",
        content: {
          type: "resource_link",
          uri,
          name: uri,
        },
      }));

      return {
        messages: [
          {
            role: "user",
            content: { text, type: "text" },
          },
          ...resourceLinks,
        ],
      };
    },
  );
}
