import { Glob } from "bun";

/**
 * Recursively finds files matching the given glob pattern starting from the specified root
 * directory. This is a wrapper around Bun's `Glob` class that provides a simpler interface.
 *
 * @param root The root directory to start the search from.
 * @param pattern The glob pattern to match files against.
 * @returns A promise that resolves to an array of matching file paths.
 */
export async function glob(root: string, pattern: string): Promise<string[]> {
  const glob = new Glob(pattern);
  return Array.fromAsync(glob.scan(root));
}
