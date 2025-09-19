const PLACEHOLDER_REGEX = /\{\{\s*(\w+)\s*\}\}/g;

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
 * Extracts placeholder names from a template string.
 *
 * @param template The template string to analyze
 * @returns An array of unique placeholder names found in the template
 */
export function extractPlaceholders(template: string): string[] {
  return [...new Set(template.matchAll(PLACEHOLDER_REGEX).map(([, key]) => key))];
}
