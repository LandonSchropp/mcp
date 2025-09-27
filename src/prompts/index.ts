import { PROMPTS_DIRECTORY } from "../constants";
import { server } from "../server-instance";
import { parseFrontmatter } from "../templates/frontmatter";
import { renderTemplate } from "../templates/render";
import { relativePathWithoutExtension } from "../utilities/path";
import { extractParametersUsedInTemplate, resolvePromptParameterValue } from "./parameters";
import { ParameterDefinition } from "./parameters/types";
import { glob, readFile } from "fs/promises";
import { join } from "path";
import z, { ZodOptional, ZodString } from "zod";

// TODO: Prevent prompts from being registered if they're not applicable (e.g.
// Ruby/TypeScript-specific prompts)

// Schema for validating prompt frontmatter
const PROMPT_SCHEMA = z.object({
  title: z.string(),
  description: z.string(),
});

// Convert a ParameterDefinition to a Zod schema
function parameterToZodSchema(parameter: ParameterDefinition): ZodString | ZodOptional<ZodString> {
  let schema = z.string().describe(parameter.description);
  return parameter.type === "optional" ? schema.optional() : schema;
}

// The prompt files (excluding files that start with underscore)
const PROMPT_FILES = await Array.fromAsync(glob(join(PROMPTS_DIRECTORY, "**/[!_]*.md")));

for (const filePath of PROMPT_FILES) {
  const rawContent = await readFile(filePath, "utf8");
  const { frontmatter, content } = parseFrontmatter(rawContent, PROMPT_SCHEMA);
  const promptName = relativePathWithoutExtension(PROMPTS_DIRECTORY, filePath);

  // Determine the parameters present in the template
  //
  // BUG: There's a bug where where the {{description}} parameter is not being returned because
  // it's contained in a partial. We'll probably need to update extractParametersUsedInTemplate to
  // actually parse the template with all partials included.
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
