import { VARIABLE_REGEX, PARTIAL_PARAMETER_REGEX, PARTIAL_REGEX } from "./constants.js";
import { readPartialContent } from "./render.js";

/**
 * Replaces {{variables}} in a template string with values from a context object.
 *
 * @param template The template string containing {{variables}}
 * @param context An object containing values for the variables
 * @returns The template with variables replaced
 */
export function replaceVariables(template: string, context: Record<string, string>): string {
  return template.replace(VARIABLE_REGEX, (_match, key) => {
    if (!(key in context)) {
      throw new Error(`Missing value for variable: ${key}`);
    }

    return context[key];
  });
}

/**
 * Extracts unique variable names from a template string.
 *
 * @param template The template string to analyze
 * @returns A set of unique variable names found in the template
 */
function extractVariablesFromContent(template: string): Set<string> {
  const variables = new Set<string>();

  // Extract variables
  for (const [, key] of template.matchAll(VARIABLE_REGEX)) {
    variables.add(key);
  }

  return variables;
}

/**
 * Parses the parameters provided to a partial and returns their names as a set.
 *
 * @param partialParameters The string containing parameters passed to a partial
 * @returns A set of parameter names
 */
function parsePartialVariables(partialParameters: string): Set<string> {
  return new Set([...partialParameters.matchAll(PARTIAL_PARAMETER_REGEX)].map(([, key]) => key));
}

/**
 * Extracts variable names from a template string, including from referenced partials.
 *
 * @param template The template string to analyze
 * @returns An array of unique variable names found in the template and its partials
 */
export function extractVariables(template: string): Set<string> {
  // Start with the variables that are explicitly defined in the template
  let variables = extractVariablesFromContent(template);

  // Extract the partial variables
  for (const [, partialName, parsedVariables] of template.matchAll(PARTIAL_REGEX)) {
    // Recursively extract variables from the partial
    let partialVariables = extractVariables(readPartialContent(partialName));

    // Ignore variables from the partial that are explicitly provided by the template
    let variablesToAdd = partialVariables.difference(
      parsePartialVariables(parsedVariables),
    );

    // Merge the new variables into the main set
    variables = variables.union(variablesToAdd);
  }

  return variables;
}
