import { readPartialContent } from "./render";

const PLACEHOLDER_REGEX = /\{\{\s*(\S+)\s*\}\}/g;
const PARTIAL_REGEX = /\{\{>\s*(\S+)((?:\s+[^=\s]+=[^=]+)*)\s*\}\}/g;
const PARTIAL_PARAMETER_REGEX = /\s+([^=\s]+)=[^=\s]+/g;

/**
 * Replaces {{placeholders}} in a template string with values from a context object.
 *
 * @param template The template string containing {{placeholders}}
 * @param context An object containing values for the placeholders
 * @returns The template with placeholders replaced
 */
export function replacePlaceholders(template: string, context: Record<string, string>): string {
  return template.replace(PLACEHOLDER_REGEX, (_match, key) => {
    if (!(key in context)) {
      throw new Error(`Missing value for placeholder: ${key}`);
    }

    return context[key];
  });
}

/**
 * Extracts unique placeholder names from a template string.
 *
 * @param template The template string to analyze
 * @returns A set of unique placeholder names found in the template
 */
function extractPlaceholdersFromContent(template: string): Set<string> {
  const placeholders = new Set<string>();

  // Extract placeholders
  for (const [, key] of template.matchAll(PLACEHOLDER_REGEX)) {
    placeholders.add(key);
  }

  return placeholders;
}

/**
 * Parses the parameters provided to a partial and returns their names as a set.
 *
 * @param partialParameters The string containing parameters passed to a partial
 * @returns A set of parameter names
 */
function parsePartialPlaceholders(partialParameters: string): Set<string> {
  return new Set([...partialParameters.matchAll(PARTIAL_PARAMETER_REGEX)].map(([, key]) => key));
}

/**
 * Extracts placeholder names from a template string, including from referenced partials.
 *
 * @param template The template string to analyze
 * @returns An array of unique placeholder names found in the template and its partials
 */
export function extractPlaceholders(template: string): Set<string> {
  // Start with the placeholders that are explicitly defined in the template
  let placeholders = extractPlaceholdersFromContent(template);

  // Extract the partial placeholders
  for (const [, partialName, parsedPlaceholders] of template.matchAll(PARTIAL_REGEX)) {
    // Recursively extract placeholders from the partial
    let partialPlaceholders = extractPlaceholders(readPartialContent(partialName));

    // Ignore placeholders from the partial that are explicitly provided by the template
    let placeholdersToAdd = partialPlaceholders.difference(
      parsePartialPlaceholders(parsedPlaceholders),
    );

    // Merge the new placeholders into the main set
    placeholders = placeholders.union(placeholdersToAdd);
  }

  return placeholders;
}
