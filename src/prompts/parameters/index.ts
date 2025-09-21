import { extractPlaceholders } from "../../templates/placeholders";
import { PARAMETER_DEFINTIONS } from "./parameter-definitions";
import { ParameterDefinition } from "./types";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Resolves a prompt parameter.
 *
 * @param server The MCP server instance, providing context for resolution.
 * @param promptName The name of the prompt being processed.
 * @param values An object containing all previously resolved parameter values.
 * @param name The name of the parameter to resolve.
 * @param value The value provided for the parameter, if any.
 * @returns The resolved parameter value.
 */
export async function resolvePromptParameterValue(
  server: McpServer,
  promptName: string,
  name: string,
  values: Record<string, string>,
  value: string | undefined,
): Promise<string> {
  const parameter = PARAMETER_DEFINTIONS.find((parameter) => parameter.name === name);
  value = value?.trim();

  if (!parameter) {
    throw new Error(`Unknown prompt parameter: ${name}`);
  }

  if (parameter.type === "required") {
    if (!value) {
      throw new Error(`Missing required prompt parameter: ${name}`);
    }

    return value;
  }

  if (parameter.type === "auto") {
    return await parameter.resolve(server, promptName, name, values);
  }

  return value || (await parameter.resolve(server, promptName, name, values));
}

/**
 * Extracts allowed prompt parameters from a template.
 *
 * @param template The template string to analyze.
 * @returns An array of parameter names found in the template
 */
export function extractParametersUsedInTemplate(template: string): ParameterDefinition[] {
  const placeholders = extractPlaceholders(template);
  return PARAMETER_DEFINTIONS.filter(({ name }) => placeholders.includes(name));
}
