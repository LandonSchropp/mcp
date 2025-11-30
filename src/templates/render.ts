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
  // Filter out undefined values to avoid Liquid strict mode errors
  let filteredContext = Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined),
  );

  return liquid.renderFile(filePath, filteredContext);
}
