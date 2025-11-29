import { liquid } from "./liquid";

/**
 * Extracts variable names from a Liquid template string, including from referenced partials. Uses
 * LiquidJS's static analysis to find global variables that need to be provided.
 *
 * @param template The template string to analyze
 * @returns A set of unique variable names found in the template and its partials
 */
export function extractVariables(template: string): Set<string> {
  return new Set(liquid.globalVariablesSync(template));
}
