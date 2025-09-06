/**
 * Removes everything before the first h2 (##) in a markdown string. This includes the frontmatter
 * if it's present.
 *
 * @param markdown The markdown string to remove the content from.
 * @returns The markdown string without the frontmatter and introduction section.
 */
export function removeFrontmatterAndIntroduction(markdown: string): string {
  return markdown.replace(/^[\s\S]*?\n(?=## )/, "");
}
