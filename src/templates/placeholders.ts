import { readPartialContent } from "./render";

const PLACEHOLDER_REGEX = /\{\{\s*(\S+)\s*\}\}/g;
const PARTIAL_REGEX = /\{\{>\s*(\S+)((?:\s+[^=\s]+=[^=\s]+)*)\s*\}\}/g;
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
 * Extracts placeholder names from a template string, including from referenced partials.
 *
 * @param template The template string to analyze
 * @returns An array of unique placeholder names found in the template and its partials
 */
export function extractPlaceholders(template: string): string[] {
  const placeholders = new Set<string>();

  // Extract placeholders
  for (const [, key] of template.matchAll(PLACEHOLDER_REGEX)) {
    placeholders.add(key);
  }

  // Extract partial placeholders
  for (const [, partial, partialParameters] of template.matchAll(PARTIAL_REGEX)) {
    let ignoredPlaceholders = new Set(
      [...partialParameters.matchAll(PARTIAL_PARAMETER_REGEX)].map(([, key]) => key),
    );

    for (const partialPlaceholder of extractPlaceholders(readPartialContent(partial))) {
      if (!ignoredPlaceholders.has(partialPlaceholder)) {
        placeholders.add(partialPlaceholder);
      }
    }
  }

  return Array.from(placeholders);
}
