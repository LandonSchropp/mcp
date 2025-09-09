import { existsSync } from "fs";
import { join, dirname } from "path";

/**
 * Recursively searches up from the current working directory for a specific file
 *
 * @param filename - The name of the file to search for
 * @param directory - The directory to start searching from (defaults to process.cwd())
 * @returns True if the file is found in the current directory or any ancestor directory
 */
function hasFileInTree(filename: string, directory = process.cwd()): boolean {
  if (existsSync(join(directory, filename))) {
    return true;
  }

  const parent = dirname(directory);

  if (parent === directory) {
    return false;
  }

  return hasFileInTree(filename, parent);
}

/**
 * Determines if the current working directory (or any ancestor) is a JavaScript/TypeScript project
 *
 * @returns True if a package.json file is found in the directory tree
 */
export function isJavaScriptProject(): boolean {
  return hasFileInTree("package.json");
}

/**
 * Determines if the current working directory (or any ancestor) is a Ruby project
 *
 * @returns True if a Gemfile is found in the directory tree
 */
export function isRubyProject(): boolean {
  return hasFileInTree("Gemfile");
}
