import { PROMPTS_DIRECTORY, PROJECT_TYPES } from "../constants.js";
import { server } from "../server-instance.js";
import { parseFrontmatter } from "../templates/frontmatter.js";
import { renderTemplate } from "../templates/render.js";
import { templateScopeMatchesCurrentProject } from "../templates/scope.js";
import { extractResourceURIs } from "../templates/uri.js";
import { filterAsync } from "../utilities/array.js";
import { relativePathWithoutExtension } from "../utilities/path.js";
import { extractParametersUsedInTemplate, resolvePromptParameterValue } from "./parameters.js";
import { ParameterDefinition } from "./parameters/types.js";
import { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import { glob, readFile } from "fs/promises";
import { join } from "path";
import z, { ZodOptional, ZodString } from "zod";

// Schema for validating prompt frontmatter
const PROMPT_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
  scope: z.enum(PROJECT_TYPES).optional(),
});

// Convert a ParameterDefinition to a Zod schema
function parameterToZodSchema(parameter: ParameterDefinition): ZodString | ZodOptional<ZodString> {
  let schema = z.string().describe(parameter.description);
  return parameter.type === "optional" ? schema.optional() : schema;
}

// Find all prompt files (excluding files that start with underscore)
let promptFiles = await Array.fromAsync(glob(join(PROMPTS_DIRECTORY, "**/[!_]*.md")));

// Exclude any prompt whose scope doesn't match
promptFiles = await filterAsync(promptFiles, templateScopeMatchesCurrentProject);

for (const filePath of promptFiles) {
  const rawContent = await readFile(filePath, "utf8");
  const { frontmatter, content } = parseFrontmatter(rawContent, PROMPT_SCHEMA);
  const promptName = relativePathWithoutExtension(PROMPTS_DIRECTORY, filePath);

  // Determine the parameters present in the template
  let parameters = extractParametersUsedInTemplate(content);
  let parameterNames = parameters.map(({ name }) => name);

  // Generate the arguments dynamically based on the template content's
  let argsSchema = Object.fromEntries(
    parameters
      .filter((parameter) => parameter.type === "required" || parameter.type === "optional")
      .map((parameter) => [parameter.name, parameterToZodSchema(parameter)]),
  );

  // Register the prompt with just the basic info for now
  server.registerPrompt(
    promptName,
    {
      ...frontmatter,
      title: promptName,
      argsSchema,
    },
    async (values) => {
      // Build the context from the provided values
      let context: Record<string, string> = {};

      for (let name of parameterNames) {
        context[name] = await resolvePromptParameterValue(
          server,
          promptName,
          name,
          context,
          values[name],
        );
      }

      // Render the template
      let text = renderTemplate(content, context);

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
