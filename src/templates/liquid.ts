import { PROMPTS_DIRECTORY } from "../constants";
import { DOCUMENTS_DIRECTORY } from "../constants.js";
import { relativePathWithoutExtension } from "../utilities/path";
import { removeFrontmatter } from "./frontmatter";
import { glob, readFile } from "fs/promises";
import { Liquid } from "liquidjs";
import { join } from "path";

// The partials and their content. This allows LiquidJS to resolve includes during static analysis.
const PARTIALS: Record<string, string> = {};

// Register all documentation as partials.
for await (let path of glob(join(DOCUMENTS_DIRECTORY, "**/*.md"))) {
  let name = `doc/${relativePathWithoutExtension(DOCUMENTS_DIRECTORY, path)}`;
  let content = removeFrontmatter(await readFile(path, "utf8"));
  PARTIALS[name] = content;
}

// Register all prompts as partials.
for await (let path of glob(join(PROMPTS_DIRECTORY, "**/*.md.liquid"))) {
  let name = relativePathWithoutExtension(PROMPTS_DIRECTORY, path);
  let content = removeFrontmatter(await readFile(path, "utf8"));
  PARTIALS[name] = content;
}

// Create a Liquid engine with a custom file system for partial resolution during static analysis.
export const liquid = new Liquid({
  relativeReference: false,
  fs: {
    readFileSync: (file: string) => {
      if (!(file in PARTIALS)) {
        throw new Error(`Partial ${file} was not found.`);
      }
      return PARTIALS[file];
    },
    existsSync: (file: string) => file in PARTIALS,
    exists: async (file: string) => file in PARTIALS,
    readFile: async (file: string) => {
      if (!(file in PARTIALS)) {
        throw new Error(`Partial ${file} was not found.`);
      }
      return PARTIALS[file];
    },
    resolve: (_root: string, file: string) => file,
  },
});
