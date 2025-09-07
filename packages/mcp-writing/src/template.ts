/** Matches Handlebars-style placeholders like `{{variable}}` and `{{ variable }}`. */
const PLACEHOLDER_REGEX = /\{\{\s?(\w+)\s?\}\}/g;

/**
 * Renders a template string by replacing Handlebars-style placeholders with the provided values.
 *
 * @param template The template string containing `{{variable}}` placeholders
 * @param replacements Object containing key-value pairs for replacement
 * @returns The rendered template with placeholders replaced
 * @throws Error if template contains undefined variables or replacements contain unused keys
 */
export function renderTemplate(template: string, replacements: Record<string, string>): string {
  let result = template;

  // Replace each placeholder with its provided value.
  for (const [placeholder, value] of Object.entries(replacements)) {
    const placeholderRegex = new RegExp(
      PLACEHOLDER_REGEX.source.replace("(\\w+)", placeholder),
      "g",
    );

    if (!placeholderRegex.test(template)) {
      throw new Error(
        `The provided replacements contain a key not found in the template: ${placeholder}`,
      );
    }

    result = result.replace(placeholderRegex, value);
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
