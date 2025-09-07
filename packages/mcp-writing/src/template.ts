/** Matches Handlebars-style placeholders like `{{variable}}` and `{{ variable }}`. */
const PLACEHOLDER_REGEX = /\{\{\s?(\w+)\s?\}\}/g;

/**
 * Creates a regex for a specific placeholder name.
 *
 * @param placeholder The placeholder name (without braces)
 * @returns A regex that matches the specific placeholder
 */
function createPlaceholderRegex(placeholder: string): RegExp {
  return new RegExp(PLACEHOLDER_REGEX.source.replace("(\\w+)", placeholder), "g");
}

/**
 * Checks if a template contains a specific placeholder.
 *
 * @param template The template string to check
 * @param placeholder The placeholder name (without braces)
 * @returns True if the template contains the placeholder
 */
function templateContainsPlaceholder(template: string, placeholder: string): boolean {
  return createPlaceholderRegex(placeholder).test(template);
}

/**
 * Replaces all occurrences of a placeholder in the template with its value.
 *
 * @param template The template string
 * @param placeholder The placeholder name (without braces)
 * @param value The replacement value
 * @returns The template with all occurrences of the placeholder replaced
 */
function replacePlaceholder(template: string, placeholder: string, value: string): string {
  return template.replaceAll(createPlaceholderRegex(placeholder), value);
}

/**
 * Handles target replacement by formatting the target value appropriately. If target is undefined
 * or empty, returns empty string. If target is provided, formats it as " to {target}".
 *
 * @param target Optional target string
 * @returns Formatted target string or empty string
 */
function renderTemplateTarget(template: string, target: string | undefined): string {
  if (!templateContainsPlaceholder(template, "target")) {
    if (target !== undefined) {
      throw new Error("The provided replacements contain a key not found in the template: target");
    }

    return template;
  }

  if (!target) {
    return replacePlaceholder(template, "target", "the current context");
  }

  return replacePlaceholder(template, "target", target);
}

/**
 * Renders a template string by replacing Handlebars-style placeholders with the provided values.
 *
 * @param template The template string containing `{{variable}}` placeholders
 * @param replacements Object containing key-value pairs for replacement
 * @returns The rendered template with placeholders replaced
 * @throws Error if template contains undefined variables or replacements contain unused keys
 */
export function renderTemplate(template: string, replacements: Record<string, string>): string {
  // Handle target specially (if the template contains it)
  const { target, ...otherReplacements } = replacements;
  let result = renderTemplateTarget(template, target);

  // Replace each placeholder with its provided value.
  for (const [placeholder, value] of Object.entries(otherReplacements)) {
    if (!templateContainsPlaceholder(template, placeholder)) {
      throw new Error(
        `The provided replacements contain a key not found in the template: ${placeholder}`,
      );
    }

    result = replacePlaceholder(result, placeholder, value);
  }

  // Check for any remaining placeholders.
  const unreplacedPlaceholders = new Set(
    [...result.matchAll(PLACEHOLDER_REGEX)].map((match) => match[1]),
  );

  if (unreplacedPlaceholders.size > 0) {
    let placeholders = [...unreplacedPlaceholders].join(", ");

    throw new Error(
      `The template contains placeholders not present in the replacements: ${placeholders}`,
    );
  }

  return result;
}

/**
 * Reads a template file and renders it with the provided replacements.
 *
 * @param templatePath Absolute path to the template file
 * @param replacements Object containing key-value pairs for replacement
 * @returns The rendered template content
 */
export async function renderTemplateFile(
  templatePath: string,
  replacements: Record<string, string>,
): Promise<string> {
  const templateContent = await Bun.file(templatePath).text();
  return renderTemplate(templateContent, replacements);
}
