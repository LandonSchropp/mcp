import { ProjectType } from "../types.js";
import { ancestorPathExists } from "./file.js";

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

/**
 * Determines if the current working directory (or any ancestor) is a project of the given type.
 *
 * @param type The type of the project.
 * @returns True if the scope is the provided type, false otherwise
 */
export async function isProjectType(type: ProjectType): Promise<boolean> {
  switch (type) {
    case "ruby":
      return await isRubyProject();
    case "typescript":
      return await isJavaScriptProject();
  }
}
