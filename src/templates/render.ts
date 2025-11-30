import { liquid } from "./liquid";

/**
 * Renders a Liquid template file with the provided context.
 *
 * @param filePath The absolute path to the template file
 * @param context An object containing values for the variables
 * @returns The rendered template with variables replaced
 */
export async function renderFile(
  filePath: string,
  context: Record<string, string | undefined> = {},
): Promise<string> {
  return liquid.renderFile(filePath, context);
}
