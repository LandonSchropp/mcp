import { relative } from "path";

/**
 * Computes the relative path from one file to another, excluding the file extension.
 *
 * @param from The starting file path
 * @param to The target file path
 * @returns The relative path from `from` to `to`, without the file extension
 */
export function relativePathWithoutExtension(from: string, to: string): string {
  return relative(from, to).replace(/(\.[^.]+)+$/, "");
}
