import { replacePlaceholders } from "./placeholders";

/**
 * Renders a Handlebars-style template. This function only supports a simple subset of the
 * Handlebars syntax.
 *
 * @param template The template string containing {{placeholders}}
 * @param context An object containing values for the placeholders
 * @returns The rendered template with placeholders replaced
 */
export function renderTemplate(template: string, context: Record<string, string>): string {
  return replacePlaceholders(template, context);
}
