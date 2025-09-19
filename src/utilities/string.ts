/**
 * Converts text to kebab-case.
 *
 * @param text The text to convert.
 * @returns The kebab-case version of the text.
 */
export function kebabCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}
