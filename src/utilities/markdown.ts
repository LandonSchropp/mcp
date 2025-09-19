import { kebabCase } from "./string";

/**
 * Extracts all headers contained within a markdown document.
 *
 * @param markdown The markdown string to extract headers from.
 * @returns An array of header text (without the # symbols).
 */
export function extractHeaders(markdown: string): string[] {
  return markdown
    .matchAll(/^(#+)\s+(.+)$/gm)
    .map((match) => match[2])
    .toArray();
}

/**
 * Extracts a section with the given header from a markdown string, up to the next header at the
 * same level. This does not include the header.
 *
 * @param markdown The markdown string to extract the section from.
 * @param header The text of the header to find (without the # symbols).
 * @returns The section content, or undefined if the section is not present in the markdown.
 */
export function extractSection(markdown: string, header: string): string | undefined {
  // Find the header location
  const headerMatch = new RegExp(`^(#+) ${RegExp.escape(header)}$`, "m").exec(markdown);

  // If the header is not found, return undefined
  if (!headerMatch) {
    return undefined;
  }

  // Extract the info from the header match
  const headerLevel = headerMatch[1].length;
  const startIndex = headerMatch.index + headerMatch[0].length;

  // Find the ending boundary by searching for headers at the same level or higher
  const endHeaderRegex = new RegExp(`^#{1,${headerLevel}} `, "gm");
  endHeaderRegex.lastIndex = startIndex;
  const endMatch = endHeaderRegex.exec(markdown);

  // Extract content between boundaries
  const endIndex = endMatch?.index ?? markdown.length;
  return markdown.slice(startIndex, endIndex).trim();
}
