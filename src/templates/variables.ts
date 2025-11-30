import { liquid } from "./liquid";

/**
 * Extracts variable names from a Liquid template file, including from referenced partials. Uses
 * LiquidJS's static analysis to find global variables that need to be provided.
 *
 * @param filePath The absolute path to the template file
 * @returns A set of unique variable names found in the template and its partials
 */
export async function extractVariables(filePath: string): Promise<Set<string>> {
  const template = await liquid.parseFile(filePath);
  return new Set(await liquid.globalVariables(template));
}
