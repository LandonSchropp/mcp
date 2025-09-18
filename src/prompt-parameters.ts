// The default value for the target parameter
const TARGET_DEFAULT = "the current context";

// The basic information for a prompt parameter
type Parameter = {
  name: string;
  description: string;
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
    fallback: () => TARGET_DEFAULT,
  },
];

// A simple regex to find allowed parameters in a template
const PARAMETERS_REGEX = new RegExp(
  `{{\\s*(${ALLOWED_PARAMETERS.map(({ name }) => name).join("|")})\\s*}}`,
  "g",
);

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
 * Extracts allowed prompt parameters from a Handlebars template.
 *
 * @param template The template string to analyze.
 * @returns An array of parameter names found in the template
 */
export function extractPromptParametersFromTemplate(template: string): Parameter[] {
  // TODO: Right now, this approach is very naive--it uses a regex to find parameters. Instead, we
  // should leverage Handlebars to properly parse the template and extract variables.
  let parameters = new Set(template.matchAll(PARAMETERS_REGEX).map((match) => match[1]));

  return ALLOWED_PARAMETERS.filter(({ name }) => parameters.has(name)).map(
    ({ name, description }) => ({ name, description }),
  );
}
