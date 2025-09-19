import { extractPlaceholders } from "../templates/placeholders";

// The default value for the target parameter
const TARGET_DEFAULT = "the current context";

// The basic information for a prompt parameter
type Parameter = {
  name: string;
  description: string;
  required: boolean;
};

// Definition of a prompt parameter and its resolver function
type ParameterDefinition = Parameter & {
  fallback: () => Promise<string> | string;
};

// List of allowed parameters and their resolvers
const ALLOWED_PARAMETERS: ParameterDefinition[] = [
  {
    name: "target",
    // TODO: Come up with a better way to define the target description based upon the use case
    description: "Target (path, description, or reference)",
    required: false,
    fallback: () => TARGET_DEFAULT,
  },
];

/**
 * Resolves a prompt parameter by name using its associated resolver function.
 *
 * @param name The name of the parameter to resolve.
 * @param value The value to pass to the resolver function.
 * @returns The resolved parameter value.
 * @throws If the parameter name is not recognized.
 */
export async function resolvePromptParameterValue(
  name: string,
  value: string | undefined,
): Promise<string> {
  const parameter = ALLOWED_PARAMETERS.find((param) => param.name === name);

  if (!parameter) {
    throw new Error(`Unknown prompt parameter: ${name}`);
  }

  return value?.trim() || (await parameter.fallback());
}

/**
 * Extracts allowed prompt parameters from a template.
 *
 * @param template The template string to analyze.
 * @returns An array of parameter names found in the template
 */
export function extractPromptParametersFromTemplate(template: string): Parameter[] {
  const placeholders = extractPlaceholders(template);

  return ALLOWED_PARAMETERS.filter(({ name }) => placeholders.includes(name)).map(
    ({ name, description, required }) => ({ name, description, required }),
  );
}
