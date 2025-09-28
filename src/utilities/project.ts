import { ancestorPathExists } from "./file";

/**
 * Determines if the current working directory (or any ancestor) is a JavaScript/TypeScript project
 *
 * @returns True if a package.json file is found in the directory tree
 */
export async function isJavaScriptProject(): Promise<boolean> {
  return ancestorPathExists("package.json");
}

/**
 * Determines if the current working directory (or any ancestor) is a Ruby project
 *
 * @returns True if a Gemfile is found in the directory tree
 */
export async function isRubyProject(): Promise<boolean> {
  return ancestorPathExists("Gemfile");
}
