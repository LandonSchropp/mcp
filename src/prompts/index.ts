import { server } from "../server";
import { parseFrontmatter } from "../templates/frontmatter";
import { renderTemplate } from "../templates/render";
import { mapToObjectAsync } from "../utilities/array";
import { extractPromptParametersFromTemplate, resolvePromptParameterValue } from "./parameters";
import { glob, readFile } from "fs/promises";
import { join, relative } from "path";
import z from "zod";

// TODO: Prevent prompts from being registered if they're not applicable (e.g.
// Ruby/TypeScript-specific prompts)

// Schema for validating prompt frontmatter
const PROMPT_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
});

// The directory containing prompt templates
const PROMPTS_DIRECTORY = join(import.meta.dir, "../../prompts");

// The prompt files (excluding files that start with underscore)
const PROMPT_FILES = await Array.fromAsync(glob(join(PROMPTS_DIRECTORY, "**/[!_]*.md")));

/**
 * Converts a file path to a prompt name
 *
 * @param path The file path of the prompt
 * @returns The prompt name (e.g., "testing/add-specs")
 */
function promptNameFromPath(path: string): string {
  return relative(PROMPTS_DIRECTORY, path).replace(/\.md$/, "");
}

for (const filePath of PROMPT_FILES) {
  const rawContent = await readFile(filePath, "utf8");
  const { frontmatter, content } = parseFrontmatter(rawContent, PROMPT_SCHEMA);
  const promptName = promptNameFromPath(filePath);

  // Determine the parameters present in the template
  let parameters = extractPromptParametersFromTemplate(content);
  let parameterNames = parameters.map(({ name }) => name);

  // Generate the arguments dynamically based on the template content's
  let argsSchema = Object.fromEntries(
    parameters.map((param) => {
      // TODO: My optional parameters are not working. I need to figure out how to enable optional
      // parameters for MCP servers (if possible).
      return [param.name, z.string().optional().describe(param.description)];
    }),
  );

  // Register the prompt with just the basic info for now
  server.registerPrompt(
    promptName,
    {
      ...frontmatter,
      argsSchema,
    },
    async (values) => {
      // Build the context from the provided values
      let context = await mapToObjectAsync(parameterNames, async (name) => {
        return await resolvePromptParameterValue(name, values[name]);
      });

      // Render the template
      let text = renderTemplate(content, context);

      return {
        messages: [
          {
            role: "user",
            content: { text, type: "text" },
          },
        ],
      };
    },
  );
}
