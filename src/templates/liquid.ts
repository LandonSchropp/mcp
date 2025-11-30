import { removeFrontmatter } from "./frontmatter";
import { Liquid, defaultOptions as liquidDefaultOptions } from "liquidjs";

/**
 * Reads a file using Liquid's default file reader and removes any frontmatter from its content.
 *
 * @param filePath The path to the file to read
 * @returns The file content without frontmatter
 */
async function readFileWithoutFrontmatter(filePath: string) {
  return removeFrontmatter(await liquidDefaultOptions.fs.readFile(filePath));
}

/**
 * Synchronously reads a file using Liquid's default synchronous file reader and removes any
 * frontmatter from its content.
 *
 * @param filePath The path to the file to read
 * @returns The file content without frontmatter
 */
function readFileWithoutFrontmatterSync(filePath: string) {
  return removeFrontmatter(liquidDefaultOptions.fs.readFileSync(filePath));
}

// Create a Liquid engine with a custom file system that strips frontmatter on read.
export const liquid = new Liquid({
  root: "/",
  relativeReference: true,
  extname: ".md.liquid",
  fs: {
    ...liquidDefaultOptions.fs,
    readFileSync: readFileWithoutFrontmatterSync,
    readFile: readFileWithoutFrontmatter,
  },
});
