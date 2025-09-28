import { stat } from "fs/promises";
import { join, dirname } from "path";

/**
 * Checks if a file or directory exists at the given path
 *
 * @param path - The path to check
 * @returns True if the file or directory exists, false otherwise.
 */
export async function pathExists(path: string) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively searches up from the current working directory for a specific file
 *
 * @param filename - The name of the file to search for
 * @param directory - The directory to start searching from (defaults to process.cwd())
 * @returns True if the file is found in the current directory or any ancestor directory
 */
export async function ancestorPathExists(filename: string, directory = process.cwd()): Promise<boolean> {
  if (await pathExists(join(directory, filename))) {
    return true;
  }

  const parent = dirname(directory);

  if (parent === directory) {
    return false;
  }

  return await ancestorPathExists(filename, parent);
}
